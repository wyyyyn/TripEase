// ──────────────────────────────────────────────
// 审核 Controller —— 处理管理员审核相关的 HTTP 请求
//
// 类比：如果酒店 Controller 是"服务员接待顾客点菜"，
// 审核 Controller 就是"质检部门的接待员"——
// 接收审核请求，校验参数，然后交给质检员（Service）处理。
//
// 所有接口都只有 admin 角色才能访问（路由层已拦截）。
// ──────────────────────────────────────────────

import type { Response } from 'express';
import { z } from 'zod';
import { success, fail } from '../utils/response.js';
import * as reviewService from '../services/reviewService.js';
import * as hotelService from '../services/hotelService.js';
import type { AuthRequest } from '../types/auth.js';
import type { HotelStatus } from '../types/hotel.js';

// ===== Zod 校验规则 =====

// 变更状态的请求体校验
// 只允许这 4 种目标状态（draft 和 pending 不能由管理员手动设置）
const changeStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'published', 'offline']),
  reason: z.string().optional(),
});

// ══════════════════════════════════════════════
// GET /api/admin/hotels  —— 查询所有酒店（可按状态筛选）
// 例：GET /api/admin/hotels?status=pending  → 只看待审核的
// ══════════════════════════════════════════════
export async function listHotels(req: AuthRequest, res: Response) {
  // 从 query 中取状态筛选参数
  const statusFilter = req.query.status as HotelStatus | undefined;

  // 简单校验：如果传了 status 参数，必须是合法的状态值
  const validStatuses = ['draft', 'pending', 'approved', 'rejected', 'published', 'offline'];
  if (statusFilter && !validStatuses.includes(statusFilter)) {
    return fail(res, `Invalid status filter: ${statusFilter}`);
  }

  try {
    const hotels = await reviewService.getAllHotelsForAdmin(statusFilter);
    success(res, hotels);
  } catch (err) {
    console.error('Failed to list hotels for admin:', err);
    return fail(res, 'Failed to list hotels', 500);
  }
}

// ══════════════════════════════════════════════
// GET /api/admin/hotels/:id  —— 查询单个酒店详情
// 管理员可以查看任意酒店（不受 owner 限制）
// ══════════════════════════════════════════════
export async function getHotelDetail(req: AuthRequest, res: Response) {
  const hotelId = Number(req.params.id);
  if (Number.isNaN(hotelId)) {
    return fail(res, 'Invalid hotel ID');
  }

  try {
    const hotel = await hotelService.getHotelById(hotelId);
    if (!hotel) {
      return fail(res, 'Hotel not found', 404);
    }
    success(res, hotel);
  } catch (err) {
    console.error('Failed to get hotel detail:', err);
    return fail(res, 'Failed to get hotel detail', 500);
  }
}

// ══════════════════════════════════════════════
// PATCH /api/admin/hotels/:id/status  —— 变更酒店状态
//
// 请求体示例：
//   通过审核：{ "status": "approved" }
//   拒绝：    { "status": "rejected", "reason": "图片不清晰" }
//   发布上线：{ "status": "published" }
//   下线：    { "status": "offline" }
// ══════════════════════════════════════════════
export async function changeStatus(req: AuthRequest, res: Response) {
  const hotelId = Number(req.params.id);
  if (Number.isNaN(hotelId)) {
    return fail(res, 'Invalid hotel ID');
  }

  // 1. 校验请求体
  const parsed = changeStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, parsed.error.errors[0].message);
  }

  const { status, reason } = parsed.data;

  // 2. 拒绝时必须填写理由
  if (status === 'rejected' && (!reason || reason.trim() === '')) {
    return fail(res, 'Rejection reason is required');
  }

  try {
    // 3. 调用 Service 执行状态变更（含事务 + 日志）
    const updated = await reviewService.changeHotelStatus(
      hotelId,
      req.user!.userId,
      status,
      reason,
    );
    success(res, updated);
  } catch (err: any) {
    // Service 层会抛出带 statusCode 的自定义错误
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Failed to change status';
    console.error('Failed to change hotel status:', err);
    return fail(res, message, statusCode);
  }
}

// ══════════════════════════════════════════════
// GET /api/admin/hotels/:id/logs  —— 查询审核日志
// 谁在什么时候做了什么操作，一目了然
// ══════════════════════════════════════════════
export async function getReviewLogs(req: AuthRequest, res: Response) {
  const hotelId = Number(req.params.id);
  if (Number.isNaN(hotelId)) {
    return fail(res, 'Invalid hotel ID');
  }

  try {
    const logs = await reviewService.getReviewLogs(hotelId);
    success(res, logs);
  } catch (err) {
    console.error('Failed to get review logs:', err);
    return fail(res, 'Failed to get review logs', 500);
  }
}
