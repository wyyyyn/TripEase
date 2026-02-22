// ──────────────────────────────────────────────
// 酒店 Service 层 —— 所有数据库操作都在这里
//
// 类比：Service 就像厨师，Controller 点了菜（告诉 Service 要做什么），
// Service 负责实际下锅炒菜（执行 SQL）。
//
// 关键概念：事务（Transaction）
// 创建一个酒店要写 6 张表（hotels, rooms, room_features, hotel_images,
// hotel_tags, hotel_amenities）。如果写到一半出错了怎么办？
// → 事务保证"要么全部成功，要么全部回滚"，就像银行转账，
//   不会出现"钱扣了但没到账"的情况。
// ──────────────────────────────────────────────

import pool from '../config/db.js';
import type { ResultSetHeader, RowDataPacket, PoolConnection } from 'mysql2/promise';
import type {
  HotelRow,
  HotelInput,
  HotelDetail,
  HotelListItem,
  RoomDetail,
} from '../types/hotel.js';

// ===== 辅助函数：确保 tags / amenities 存在 =====

/**
 * 确保 tags 表中存在这些标签名，不存在则创建
 * 返回所有标签的 id 数组
 *
 * 为什么不直接 INSERT？
 * → 因为 tags 表有 UNIQUE 约束，重复插入会报错
 * → 所以用 INSERT IGNORE：已有的跳过，没有的插入
 */
async function ensureTagIds(
  conn: PoolConnection,
  tagNames: string[],
): Promise<number[]> {
  if (tagNames.length === 0) return [];

  // 1. 批量插入（已存在的会被 IGNORE 跳过）
  const placeholders = tagNames.map(() => '(?)').join(', ');
  await conn.query(
    `INSERT IGNORE INTO tags (name) VALUES ${placeholders}`,
    tagNames,
  );

  // 2. 查出所有匹配的 tag id
  const [rows] = await conn.query<RowDataPacket[]>(
    `SELECT id FROM tags WHERE name IN (${tagNames.map(() => '?').join(', ')})`,
    tagNames,
  );
  return rows.map((r: any) => r.id);
}

/**
 * 确保 amenities 表中存在这些设施名
 * 逻辑同 ensureTagIds
 */
async function ensureAmenityIds(
  conn: PoolConnection,
  amenityNames: string[],
): Promise<number[]> {
  if (amenityNames.length === 0) return [];

  const placeholders = amenityNames.map(() => '(?)').join(', ');
  await conn.query(
    `INSERT IGNORE INTO amenities (name) VALUES ${placeholders}`,
    amenityNames,
  );

  const [rows] = await conn.query<RowDataPacket[]>(
    `SELECT id FROM amenities WHERE name IN (${amenityNames.map(() => '?').join(', ')})`,
    amenityNames,
  );
  return rows.map((r: any) => r.id);
}

// ===== 核心 CRUD 函数 =====

/**
 * 创建酒店（事务）
 *
 * @param ownerId - 商户的用户 ID
 * @param data    - 酒店表单数据（前端传来）
 * @param submit  - true=提交审核(pending)，false=存草稿(draft)
 * @returns 新创建的酒店 ID
 */
export async function createHotel(
  ownerId: number,
  data: HotelInput,
  submit: boolean,
): Promise<number> {
  // 从连接池里取一条"专用连接"来做事务
  const conn = await pool.getConnection();

  try {
    // 开始事务：从现在起，所有操作要么一起成功，要么一起回滚
    await conn.beginTransaction();

    const status = submit ? 'pending' : 'draft';

    // ① 插入 hotels 主表
    const [hotelResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO hotels (owner_id, name, english_name, address, star_rating, open_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ownerId, data.name, data.englishName || null, data.address, data.starRating, data.openDate || null, status],
    );
    const hotelId = hotelResult.insertId;

    // ② 插入 rooms + room_features
    for (let i = 0; i < data.rooms.length; i++) {
      const room = data.rooms[i];
      const [roomResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO rooms (hotel_id, name, description, price_per_night, original_price, image, bed_type, size, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [hotelId, room.name, room.description || null, room.pricePerNight, room.originalPrice || null, room.image || null, room.bedType, room.size || null, i],
      );
      const roomId = roomResult.insertId;

      // 插入该房间的特色标签
      if (room.features.length > 0) {
        const featPlaceholders = room.features.map(() => '(?, ?)').join(', ');
        const featValues = room.features.flatMap((f) => [roomId, f]);
        await conn.query(
          `INSERT INTO room_features (room_id, feature) VALUES ${featPlaceholders}`,
          featValues,
        );
      }
    }

    // ③ 插入 hotel_images
    if (data.images.length > 0) {
      const imgPlaceholders = data.images.map(() => '(?, ?, ?)').join(', ');
      const imgValues = data.images.flatMap((url, idx) => [hotelId, url, idx]);
      await conn.query(
        `INSERT INTO hotel_images (hotel_id, url, sort_order) VALUES ${imgPlaceholders}`,
        imgValues,
      );
    }

    // ④ 插入 hotel_tags
    const tagIds = await ensureTagIds(conn, data.tags);
    if (tagIds.length > 0) {
      const tagPlaceholders = tagIds.map(() => '(?, ?)').join(', ');
      const tagValues = tagIds.flatMap((tid) => [hotelId, tid]);
      await conn.query(
        `INSERT INTO hotel_tags (hotel_id, tag_id) VALUES ${tagPlaceholders}`,
        tagValues,
      );
    }

    // ⑤ 插入 hotel_amenities
    const amenityIds = await ensureAmenityIds(conn, data.amenities);
    if (amenityIds.length > 0) {
      const amenPlaceholders = amenityIds.map(() => '(?, ?)').join(', ');
      const amenValues = amenityIds.flatMap((aid) => [hotelId, aid]);
      await conn.query(
        `INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES ${amenPlaceholders}`,
        amenValues,
      );
    }

    // 全部成功 → 提交事务
    await conn.commit();
    return hotelId;
  } catch (err) {
    // 任何一步出错 → 回滚所有操作
    await conn.rollback();
    throw err;
  } finally {
    // 无论成功失败，都要把连接还给连接池
    conn.release();
  }
}

/**
 * 更新酒店（事务）
 *
 * 策略：对于关联表（images, tags, amenities, rooms），
 * 采用"先删旧、再插新"的方式，简单可靠。
 * MySQL 的 ON DELETE CASCADE 会自动清理 room_features。
 */
export async function updateHotel(
  hotelId: number,
  data: HotelInput,
  submit: boolean,
): Promise<void> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 确定新状态：如果提交审核，状态改为 pending；否则保持 draft
    // 注意：只有 draft 或 rejected 状态的酒店才能编辑（Controller 层校验）
    const status = submit ? 'pending' : 'draft';

    // ① 更新 hotels 主表
    await conn.query(
      `UPDATE hotels
       SET name = ?, english_name = ?, address = ?, star_rating = ?,
           open_date = ?, status = ?, reject_reason = NULL
       WHERE id = ?`,
      [data.name, data.englishName || null, data.address, data.starRating, data.openDate || null, status, hotelId],
    );

    // ② 删除旧的关联数据（rooms 的 CASCADE 会自动删 room_features）
    await conn.query('DELETE FROM rooms WHERE hotel_id = ?', [hotelId]);
    await conn.query('DELETE FROM hotel_images WHERE hotel_id = ?', [hotelId]);
    await conn.query('DELETE FROM hotel_tags WHERE hotel_id = ?', [hotelId]);
    await conn.query('DELETE FROM hotel_amenities WHERE hotel_id = ?', [hotelId]);

    // ③ 重新插入 rooms + room_features
    for (let i = 0; i < data.rooms.length; i++) {
      const room = data.rooms[i];
      const [roomResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO rooms (hotel_id, name, description, price_per_night, original_price, image, bed_type, size, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [hotelId, room.name, room.description || null, room.pricePerNight, room.originalPrice || null, room.image || null, room.bedType, room.size || null, i],
      );
      const roomId = roomResult.insertId;

      if (room.features.length > 0) {
        const featPlaceholders = room.features.map(() => '(?, ?)').join(', ');
        const featValues = room.features.flatMap((f) => [roomId, f]);
        await conn.query(
          `INSERT INTO room_features (room_id, feature) VALUES ${featPlaceholders}`,
          featValues,
        );
      }
    }

    // ④ 重新插入 hotel_images
    if (data.images.length > 0) {
      const imgPlaceholders = data.images.map(() => '(?, ?, ?)').join(', ');
      const imgValues = data.images.flatMap((url, idx) => [hotelId, url, idx]);
      await conn.query(
        `INSERT INTO hotel_images (hotel_id, url, sort_order) VALUES ${imgPlaceholders}`,
        imgValues,
      );
    }

    // ⑤ 重新插入 hotel_tags
    const tagIds = await ensureTagIds(conn, data.tags);
    if (tagIds.length > 0) {
      const tagPlaceholders = tagIds.map(() => '(?, ?)').join(', ');
      const tagValues = tagIds.flatMap((tid) => [hotelId, tid]);
      await conn.query(
        `INSERT INTO hotel_tags (hotel_id, tag_id) VALUES ${tagPlaceholders}`,
        tagValues,
      );
    }

    // ⑥ 重新插入 hotel_amenities
    const amenityIds = await ensureAmenityIds(conn, data.amenities);
    if (amenityIds.length > 0) {
      const amenPlaceholders = amenityIds.map(() => '(?, ?)').join(', ');
      const amenValues = amenityIds.flatMap((aid) => [hotelId, aid]);
      await conn.query(
        `INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES ${amenPlaceholders}`,
        amenValues,
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * 按 ID 查询酒店完整详情
 * 需要查多张表，然后组装成前端需要的嵌套结构
 */
export async function getHotelById(hotelId: number): Promise<HotelDetail | null> {
  // 1. 查 hotels 主表
  const [hotelRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM hotels WHERE id = ?',
    [hotelId],
  );
  if (hotelRows.length === 0) return null;
  const h = hotelRows[0] as HotelRow;

  // 2. 并行查询关联数据（提升性能）
  const [imageRows, tagRows, amenityRows, roomRows] = await Promise.all([
    pool.query<RowDataPacket[]>(
      'SELECT url FROM hotel_images WHERE hotel_id = ? ORDER BY sort_order',
      [hotelId],
    ),
    pool.query<RowDataPacket[]>(
      `SELECT t.name FROM hotel_tags ht JOIN tags t ON ht.tag_id = t.id WHERE ht.hotel_id = ?`,
      [hotelId],
    ),
    pool.query<RowDataPacket[]>(
      `SELECT a.name FROM hotel_amenities ha JOIN amenities a ON ha.amenity_id = a.id WHERE ha.hotel_id = ?`,
      [hotelId],
    ),
    pool.query<RowDataPacket[]>(
      'SELECT * FROM rooms WHERE hotel_id = ? ORDER BY sort_order',
      [hotelId],
    ),
  ]);

  const images = imageRows[0].map((r: any) => r.url);
  const tags = tagRows[0].map((r: any) => r.name);
  const amenities = amenityRows[0].map((r: any) => r.name);

  // 3. 查每个房间的 features
  const rooms: RoomDetail[] = [];
  for (const r of roomRows[0] as any[]) {
    const [featRows] = await pool.query<RowDataPacket[]>(
      'SELECT feature FROM room_features WHERE room_id = ?',
      [r.id],
    );
    rooms.push({
      id: r.id,
      name: r.name,
      description: r.description,
      pricePerNight: Number(r.price_per_night),
      originalPrice: r.original_price ? Number(r.original_price) : null,
      currency: r.currency,
      image: r.image,
      bedType: r.bed_type,
      size: r.size,
      badge: r.badge,
      badgeColor: r.badge_color,
      features: featRows.map((f: any) => f.feature),
    });
  }

  // 4. 组装完整详情
  return {
    id: h.id,
    ownerId: h.owner_id,
    name: h.name,
    englishName: h.english_name,
    address: h.address,
    starRating: h.star_rating,
    openDate: h.open_date,
    distanceFromCenter: h.distance_from_center,
    pricePerNight: h.price_per_night ? Number(h.price_per_night) : null,
    originalPrice: h.original_price ? Number(h.original_price) : null,
    currency: h.currency,
    rating: Number(h.rating),
    reviewCount: h.review_count,
    badge: h.badge,
    badgeColor: h.badge_color,
    status: h.status,
    rejectReason: h.reject_reason,
    createdAt: h.created_at.toISOString(),
    updatedAt: h.updated_at.toISOString(),
    images,
    tags,
    amenities,
    rooms,
  };
}

/**
 * 查询商户的所有酒店（列表视图，不含完整详情）
 */
export async function getHotelsByOwner(ownerId: number): Promise<HotelListItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT h.*, COUNT(r.id) AS room_count
     FROM hotels h
     LEFT JOIN rooms r ON r.hotel_id = h.id
     WHERE h.owner_id = ?
     GROUP BY h.id
     ORDER BY h.updated_at DESC`,
    [ownerId],
  );

  return (rows as any[]).map((h) => ({
    id: h.id,
    name: h.name,
    englishName: h.english_name,
    address: h.address,
    starRating: h.star_rating,
    status: h.status,
    rejectReason: h.reject_reason,
    roomCount: Number(h.room_count),
    createdAt: h.created_at.toISOString(),
    updatedAt: h.updated_at.toISOString(),
  }));
}

/**
 * 删除酒店
 * CASCADE 会自动删除 rooms, room_features, hotel_images, hotel_tags, hotel_amenities
 */
export async function deleteHotel(hotelId: number): Promise<void> {
  await pool.query('DELETE FROM hotels WHERE id = ?', [hotelId]);
}

/**
 * 查询酒店的 owner_id（用于权限校验）
 */
export async function getHotelOwnerId(hotelId: number): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT owner_id FROM hotels WHERE id = ?',
    [hotelId],
  );
  if (rows.length === 0) return null;
  return (rows[0] as any).owner_id;
}
