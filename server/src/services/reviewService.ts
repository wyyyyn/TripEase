// ──────────────────────────────────────────────
// 审核 Service 层 —— 管理员审核酒店的所有数据库操作
//
// 类比：如果酒店 Service 是"厨师负责做菜"，
// 审核 Service 就是"质检员负责验收"——检查菜品质量，
// 决定合格上桌还是打回重做，并做好记录。
//
// 核心操作：
// 1. 变更酒店状态（事务：改状态 + 写日志，原子操作）
// 2. 查询所有酒店（管理员视角，不限制 owner）
// 3. 查询审核日志（谁在什么时候做了什么操作）
// ──────────────────────────────────────────────

import pool from '../config/db.js';
import type { RowDataPacket } from 'mysql2/promise';
import type { HotelStatus, HotelListItem, HotelDetail } from '../types/hotel.js';
import type { ReviewLogItem, DashboardStats } from '../types/review.js';
import { VALID_TRANSITIONS } from '../types/review.js';
import { getHotelById } from './hotelService.js';

// ===== 1. 变更酒店状态（核心函数）=====

/**
 * 管理员变更酒店状态（事务操作）
 *
 * 为什么要用事务？
 * → 改状态 + 写日志必须同时成功或同时失败
 * → 如果只改了状态但日志没写上，就丢失了审核记录
 *
 * 为什么要用 SELECT ... FOR UPDATE？
 * → 防止两个管理员同时审核同一个酒店
 * → 类比：图书馆借书时，系统会先"锁定"这本书，
 *   防止另一个人同时借走同一本
 *
 * @param hotelId    - 要审核的酒店 ID
 * @param operatorId - 操作人（管理员）的用户 ID
 * @param toStatus   - 目标状态
 * @param reason     - 原因（拒绝时必填）
 * @returns 更新后的酒店详情
 */
export async function changeHotelStatus(
  hotelId: number,
  operatorId: number,
  toStatus: HotelStatus,
  reason?: string,
): Promise<HotelDetail> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ① 查询当前状态并锁定这一行（FOR UPDATE）
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT status FROM hotels WHERE id = ? FOR UPDATE',
      [hotelId],
    );

    // 酒店不存在
    if (rows.length === 0) {
      throw Object.assign(new Error('酒店不存在'), { statusCode: 404 });
    }

    const fromStatus = (rows[0] as any).status as HotelStatus;

    // ② 校验状态转换是否合法
    const allowedTargets = VALID_TRANSITIONS[fromStatus];
    if (!allowedTargets || !allowedTargets.includes(toStatus)) {
      throw Object.assign(
        new Error(`不允许从「${fromStatus}」转换到「${toStatus}」`),
        { statusCode: 400 },
      );
    }

    // ③ 更新酒店状态
    // 拒绝时记录原因，其他操作清空原因
    const rejectReason = toStatus === 'rejected' ? (reason || null) : null;
    await conn.query(
      'UPDATE hotels SET status = ?, reject_reason = ? WHERE id = ?',
      [toStatus, rejectReason, hotelId],
    );

    // ④ 写入审核日志
    await conn.query(
      `INSERT INTO review_logs (hotel_id, operator_id, from_status, to_status, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [hotelId, operatorId, fromStatus, toStatus, reason || null],
    );

    // 全部成功 → 提交事务
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  // 返回更新后的完整酒店详情（复用已有的 getHotelById）
  const updated = await getHotelById(hotelId);
  return updated!;
}

// ===== 2. 查询所有酒店（管理员视角）=====

/**
 * 获取所有酒店列表（管理员用）
 *
 * 和商户的 getHotelsByOwner 区别：
 * - 商户只能看自己的酒店（WHERE owner_id = ?）
 * - 管理员能看所有酒店，可按状态筛选
 *
 * @param statusFilter - 可选，按状态筛选（如只看 pending）
 */
export async function getAllHotelsForAdmin(
  statusFilter?: HotelStatus,
): Promise<HotelListItem[]> {
  // 动态拼接 WHERE 条件
  let sql = `
    SELECT h.*, COUNT(r.id) AS room_count
    FROM hotels h
    LEFT JOIN rooms r ON r.hotel_id = h.id
  `;
  const params: any[] = [];

  if (statusFilter) {
    sql += ' WHERE h.status = ?';
    params.push(statusFilter);
  }

  sql += ' GROUP BY h.id ORDER BY h.updated_at DESC';

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);

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

// ===== 3. 查询审核日志 =====

/**
 * 获取某个酒店的审核日志
 *
 * JOIN users 表是为了拿到操作人的用户名，
 * 这样前端能显示"张三 在 2024-01-01 通过了审核"
 *
 * @param hotelId - 酒店 ID
 */
export async function getReviewLogs(
  hotelId: number,
): Promise<ReviewLogItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT rl.*, u.username AS operator_name
     FROM review_logs rl
     JOIN users u ON rl.operator_id = u.id
     WHERE rl.hotel_id = ?
     ORDER BY rl.created_at DESC`,
    [hotelId],
  );

  return (rows as any[]).map((r) => ({
    id: r.id,
    hotelId: r.hotel_id,
    operatorId: r.operator_id,
    operatorName: r.operator_name,
    fromStatus: r.from_status,
    toStatus: r.to_status,
    reason: r.reason,
    createdAt: r.created_at.toISOString(),
  }));
}

// ===== 4. 仪表板统计 =====

/**
 * 获取仪表板统计数据
 *
 * 用 SQL 的 GROUP BY 直接在数据库里算出每种状态有几个酒店，
 * 而不是把所有酒店拉到前端再一个个数。
 *
 * 类比：你想知道班上有几个男生几个女生，
 * 应该让班长数好告诉你（数据库 GROUP BY），
 * 而不是把全班同学叫过来让你自己数（前端 filter）。
 *
 * @param ownerId - 如果传了，只统计该商户的酒店；不传则统计所有
 */
export async function getDashboardStats(
  ownerId?: number,
): Promise<DashboardStats> {
  let sql = 'SELECT status, COUNT(*) AS cnt FROM hotels';
  const params: any[] = [];

  if (ownerId !== undefined) {
    sql += ' WHERE owner_id = ?';
    params.push(ownerId);
  }

  sql += ' GROUP BY status';

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);

  // 初始化所有状态为 0
  const stats: DashboardStats = {
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    published: 0,
    offline: 0,
  };

  // 填入数据库返回的实际数量
  for (const row of rows as any[]) {
    const status = row.status as keyof Omit<DashboardStats, 'total'>;
    const count = Number(row.cnt);
    if (status in stats) {
      stats[status] = count;
    }
    stats.total += count;
  }

  return stats;
}
