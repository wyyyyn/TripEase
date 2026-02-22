// ──────────────────────────────────────────────
// 公开接口 Service 层 —— C 端用户（游客）的查询逻辑
//
// 类比：这是"酒店大堂的公告栏"。
// 任何人走进大堂都能看到，不需要出示身份证（不需要登录）。
// 但只展示"已上架"的酒店（status = 'published'）。
//
// 三个核心功能：
//   1. searchPublishedHotels — 搜索已发布酒店（分页 + 筛选 + 排序）
//   2. getPublishedHotelById — 查看单个酒店详情（仅已发布）
//   3. getCities             — 获取城市列表（含地标）
// ──────────────────────────────────────────────

import pool from '../config/db.js';
import type { RowDataPacket } from 'mysql2/promise';
import type {
  PaginatedResult,
  PublicHotelSummary,
  PublicSearchParams,
  CityWithLandmarks,
  LandmarkInfo,
} from '../types/public.js';
import type { HotelDetail } from '../types/hotel.js';
import { getHotelById } from './hotelService.js';

// ===== 1. 搜索已发布酒店 =====

/**
 * 搜索已发布酒店，支持关键词、价格、评分、星级、标签筛选，
 * 以及价格/评分排序和分页。
 *
 * 类比：你在携程搜索框输入"上海"，设好价格区间，点"搜索"，
 * 后端就执行这个函数，从数据库里找出所有匹配的已上架酒店。
 *
 * 为什么用子查询取 firstImage / lowestRoomPrice / roomCount？
 * → 列表页只需要"首图 + 最低价 + 房型数"，不需要所有图片和房型详情。
 *   子查询比 JOIN 后 GROUP BY 更直观，且 MySQL 优化器处理得很好。
 */
export async function searchPublishedHotels(
  params: PublicSearchParams,
): Promise<PaginatedResult<PublicHotelSummary>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  // ── 动态拼 WHERE 条件 ──
  // 类比：就像你在网购时勾选"包邮""4.5分以上"等筛选条件，
  // 每勾一个，SQL 就多一个 AND 条件。
  const conditions: string[] = ['h.status = ?'];
  const conditionValues: unknown[] = ['published'];

  // 关键词：模糊匹配酒店名 / 英文名 / 地址
  if (params.keyword) {
    conditions.push('(h.name LIKE ? OR h.english_name LIKE ? OR h.address LIKE ?)');
    const like = `%${params.keyword}%`;
    conditionValues.push(like, like, like);
  }

  // 价格筛选：检查酒店是否有房间在指定价格区间内
  if (params.minPrice !== undefined) {
    conditions.push(
      'EXISTS (SELECT 1 FROM rooms r2 WHERE r2.hotel_id = h.id AND r2.price_per_night >= ?)',
    );
    conditionValues.push(params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    conditions.push(
      'EXISTS (SELECT 1 FROM rooms r3 WHERE r3.hotel_id = h.id AND r3.price_per_night <= ?)',
    );
    conditionValues.push(params.maxPrice);
  }

  // 评分筛选
  if (params.minRating !== undefined) {
    conditions.push('h.rating >= ?');
    conditionValues.push(params.minRating);
  }

  // 星级精确匹配
  if (params.starRating !== undefined) {
    conditions.push('h.star_rating = ?');
    conditionValues.push(params.starRating);
  }

  // 标签筛选：酒店必须包含指定的所有标签
  if (params.tags && params.tags.length > 0) {
    for (const tag of params.tags) {
      conditions.push(
        'EXISTS (SELECT 1 FROM hotel_tags ht JOIN tags t ON ht.tag_id = t.id WHERE ht.hotel_id = h.id AND t.name = ?)',
      );
      conditionValues.push(tag);
    }
  }

  const whereClause = conditions.join(' AND ');

  // ── 排序 ──
  let orderClause: string;
  switch (params.sort) {
    case 'price_asc':
      // 按最低房价升序（NULL 排最后）
      orderClause = 'lowest_room_price IS NULL, lowest_room_price ASC';
      break;
    case 'price_desc':
      orderClause = 'lowest_room_price IS NULL, lowest_room_price DESC';
      break;
    case 'rating':
      orderClause = 'h.rating DESC';
      break;
    default:
      // 默认：评分高的在前，再按更新时间
      orderClause = 'h.rating DESC, h.updated_at DESC';
  }

  // ── 主查询：获取当前页的酒店摘要 ──
  const mainSQL = `
    SELECT
      h.id,
      h.name,
      h.address,
      h.star_rating,
      h.distance_from_center,
      h.price_per_night,
      h.original_price,
      h.currency,
      h.rating,
      h.review_count,
      h.badge,
      h.badge_color,

      -- 子查询：取第一张图（sort_order 最小的）
      (SELECT url FROM hotel_images WHERE hotel_id = h.id ORDER BY sort_order LIMIT 1)
        AS first_image,

      -- 子查询：房型数量
      (SELECT COUNT(*) FROM rooms WHERE hotel_id = h.id)
        AS room_count,

      -- 子查询：最低房价
      (SELECT MIN(price_per_night) FROM rooms WHERE hotel_id = h.id)
        AS lowest_room_price,

      -- 子查询：是否含早餐（检查 room_features 中有没有"早餐"关键字）
      EXISTS (
        SELECT 1 FROM room_features rf
        JOIN rooms rm ON rf.room_id = rm.id
        WHERE rm.hotel_id = h.id AND rf.feature LIKE '%早餐%'
      ) AS has_breakfast,

      -- 子查询：是否免费取消（检查 tags 中有没有"免费取消"）
      EXISTS (
        SELECT 1 FROM hotel_tags ht2
        JOIN tags t2 ON ht2.tag_id = t2.id
        WHERE ht2.hotel_id = h.id AND t2.name = '免费取消'
      ) AS has_free_cancel

    FROM hotels h
    WHERE ${whereClause}
    ORDER BY ${orderClause}
    LIMIT ? OFFSET ?
  `;

  // ── 计数查询：获取总数（用于分页） ──
  const countSQL = `
    SELECT COUNT(*) AS total
    FROM hotels h
    WHERE ${whereClause}
  `;

  // 并行执行主查询和计数查询（提升性能）
  const [mainResult, countResult] = await Promise.all([
    pool.query<RowDataPacket[]>(mainSQL, [...conditionValues, limit, offset]),
    pool.query<RowDataPacket[]>(countSQL, conditionValues),
  ]);

  const rows = mainResult[0];
  const total = (countResult[0][0] as any).total as number;

  // ── 批量查询每个酒店的 tags ──
  // 为什么不在主查询里用 GROUP_CONCAT？
  // → GROUP_CONCAT 有长度限制（默认 1024 字节），且拼接 + 拆分不如单独查询干净。
  const hotelIds = rows.map((r: any) => r.id);
  let tagMap: Map<number, string[]> = new Map();

  if (hotelIds.length > 0) {
    const placeholders = hotelIds.map(() => '?').join(', ');
    const [tagRows] = await pool.query<RowDataPacket[]>(
      `SELECT ht.hotel_id, t.name
       FROM hotel_tags ht
       JOIN tags t ON ht.tag_id = t.id
       WHERE ht.hotel_id IN (${placeholders})`,
      hotelIds,
    );
    for (const tr of tagRows as any[]) {
      const existing = tagMap.get(tr.hotel_id) ?? [];
      existing.push(tr.name);
      tagMap.set(tr.hotel_id, existing);
    }
  }

  // ── 组装结果 ──
  const items: PublicHotelSummary[] = rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    starRating: r.star_rating,
    distanceFromCenter: r.distance_from_center,
    pricePerNight: r.price_per_night ? Number(r.price_per_night) : null,
    originalPrice: r.original_price ? Number(r.original_price) : null,
    currency: r.currency,
    rating: Number(r.rating),
    reviewCount: r.review_count,
    badge: r.badge,
    badgeColor: r.badge_color,
    firstImage: r.first_image,
    tags: tagMap.get(r.id) ?? [],
    roomCount: Number(r.room_count),
    lowestRoomPrice: r.lowest_room_price ? Number(r.lowest_room_price) : null,
    hasBreakfast: Boolean(r.has_breakfast),
    hasFreeCancel: Boolean(r.has_free_cancel),
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ===== 2. 查看单个酒店详情（仅已发布） =====

/**
 * 获取单个已发布酒店的完整详情。
 *
 * 策略：复用 hotelService.getHotelById()（它已经实现了多表查询和组装），
 * 然后检查 status 是否为 'published'。
 *
 * 为什么不直接写一套新的 SQL？
 * → DRY 原则（Don't Repeat Yourself）。详情查询逻辑完全一样，
 *   只是多了一个 status 校验。复用代码减少维护成本。
 */
export async function getPublishedHotelById(
  hotelId: number,
): Promise<HotelDetail | null> {
  const detail = await getHotelById(hotelId);

  // 如果酒店不存在，或者不是已发布状态，返回 null
  if (!detail || detail.status !== 'published') {
    return null;
  }

  return detail;
}

// ===== 3. 获取城市列表 =====

/**
 * 查询所有城市及其地标，供搜索页的城市选择器使用。
 *
 * 类比：打开携程的"选择目的地"弹窗，看到的城市列表 + 热门景点。
 */
export async function getCities(): Promise<CityWithLandmarks[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      c.id       AS city_id,
      c.name     AS city_name,
      c.pinyin   AS city_pinyin,
      c.is_hot   AS city_is_hot,
      c.sort_order AS city_sort_order,
      cl.id      AS lm_id,
      cl.name    AS lm_name,
      cl.label   AS lm_label,
      cl.icon    AS lm_icon
    FROM cities c
    LEFT JOIN city_landmarks cl ON cl.city_id = c.id AND cl.is_active = TRUE
    ORDER BY c.sort_order, cl.sort_order
  `);

  // 将扁平的行数据按城市分组
  // 类比：把一堆快递按收件人分拣到不同的筐里
  const cityMap = new Map<number, CityWithLandmarks>();

  for (const row of rows as any[]) {
    let city = cityMap.get(row.city_id);
    if (!city) {
      city = {
        id: row.city_id,
        name: row.city_name,
        pinyin: row.city_pinyin,
        isHot: Boolean(row.city_is_hot),
        sortOrder: row.city_sort_order,
        landmarks: [],
      };
      cityMap.set(row.city_id, city);
    }

    // LEFT JOIN 时如果城市没有地标，lm_id 会是 null
    if (row.lm_id) {
      city.landmarks.push({
        id: row.lm_id,
        name: row.lm_name,
        label: row.lm_label,
        icon: row.lm_icon,
      });
    }
  }

  return Array.from(cityMap.values());
}
