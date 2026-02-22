// ──────────────────────────────────────────────
// 酒店 Controller —— 处理 HTTP 请求
//
// Controller 的职责：
// 1. 校验请求数据（用 Zod）
// 2. 校验权限（只能操作自己的酒店）
// 3. 调用 Service 层执行业务逻辑
// 4. 返回统一格式的响应
//
// 类比：Controller 是餐厅的"服务员"
// - 接单（接收请求）→ 检查菜单是否合理（校验）
// - 把单子递给厨师（Service）→ 端菜上桌（返回响应）
// ──────────────────────────────────────────────

import type { Response } from 'express';
import { z } from 'zod';
import { success, fail } from '../utils/response.js';
import * as hotelService from '../services/hotelService.js';
import type { AuthRequest } from '../types/auth.js';

// ===== Zod 校验规则 =====

// 房间校验
const roomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  description: z.string().default(''),
  pricePerNight: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  image: z.string().default(''),
  bedType: z.string().min(1, 'Bed type is required'),
  size: z.string().default(''),
  features: z.array(z.string()).default([]),
});

// 酒店校验
const hotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required').max(200),
  englishName: z.string().max(200).default(''),
  address: z.string().min(1, 'Address is required').max(500),
  starRating: z.number().int().min(1).max(5).default(3),
  openDate: z.string().default(''),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  rooms: z.array(roomSchema).default([]),
});

// ══════════════════════════════════════════════
// POST /api/hotels  —— 创建酒店
// query 参数 ?submit=true 表示提交审核
// ══════════════════════════════════════════════
export async function create(req: AuthRequest, res: Response) {
  // 1. 校验请求体
  const parsed = hotelSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, parsed.error.errors[0].message);
  }

  // 2. 获取当前用户 ID（由 requireAuth 中间件提供）
  const ownerId = req.user!.userId;

  // 3. 是否提交审核（前端通过 query 参数传递）
  const submit = req.query.submit === 'true';

  try {
    // 4. 调用 Service 创建酒店
    const hotelId = await hotelService.createHotel(ownerId, parsed.data, submit);

    // 5. 查询完整详情返回给前端
    const hotel = await hotelService.getHotelById(hotelId);
    success(res, hotel);
  } catch (err) {
    console.error('Failed to create hotel:', err);
    return fail(res, 'Failed to create hotel', 500);
  }
}

// ══════════════════════════════════════════════
// GET /api/hotels/my  —— 查询当前商户的所有酒店
// ══════════════════════════════════════════════
export async function getMyHotels(req: AuthRequest, res: Response) {
  const ownerId = req.user!.userId;

  try {
    const hotels = await hotelService.getHotelsByOwner(ownerId);
    success(res, hotels);
  } catch (err) {
    console.error('Failed to fetch hotels:', err);
    return fail(res, 'Failed to fetch hotels', 500);
  }
}

// ══════════════════════════════════════════════
// GET /api/hotels/:id  —— 查询单个酒店详情
// ══════════════════════════════════════════════
export async function getById(req: AuthRequest, res: Response) {
  const hotelId = Number(req.params.id);
  if (Number.isNaN(hotelId)) {
    return fail(res, 'Invalid hotel ID');
  }

  try {
    const hotel = await hotelService.getHotelById(hotelId);
    if (!hotel) {
      return fail(res, 'Hotel not found', 404);
    }

    // 权限校验：只有酒店主人或管理员可以查看未发布的酒店
    const isOwner = hotel.ownerId === req.user!.userId;
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin && hotel.status !== 'published') {
      return fail(res, 'Hotel not found', 404);
    }

    success(res, hotel);
  } catch (err) {
    console.error('Failed to fetch hotel:', err);
    return fail(res, 'Failed to fetch hotel', 500);
  }
}

// ══════════════════════════════════════════════
// PUT /api/hotels/:id  —— 更新酒店
// query 参数 ?submit=true 表示提交审核
// ══════════════════════════════════════════════
export async function update(req: AuthRequest, res: Response) {
  const hotelId = Number(req.params.id);
  if (Number.isNaN(hotelId)) {
    return fail(res, 'Invalid hotel ID');
  }

  // 1. 校验请求体
  const parsed = hotelSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, parsed.error.errors[0].message);
  }

  try {
    // 2. 检查酒店是否存在 + 权限校验
    const existing = await hotelService.getHotelById(hotelId);
    if (!existing) {
      return fail(res, 'Hotel not found', 404);
    }

    const isOwner = existing.ownerId === req.user!.userId;
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) {
      return fail(res, 'You can only edit your own hotels', 403);
    }

    // 3. 只有 draft 或 rejected 状态的酒店才能编辑
    //    已提交审核的、已发布的，不能随便改
    if (!['draft', 'rejected'].includes(existing.status)) {
      return fail(res, `Cannot edit hotel in "${existing.status}" status`, 400);
    }

    // 4. 更新
    const submit = req.query.submit === 'true';
    await hotelService.updateHotel(hotelId, parsed.data, submit);

    // 5. 返回更新后的完整详情
    const updated = await hotelService.getHotelById(hotelId);
    success(res, updated);
  } catch (err) {
    console.error('Failed to update hotel:', err);
    return fail(res, 'Failed to update hotel', 500);
  }
}

// ══════════════════════════════════════════════
// DELETE /api/hotels/:id  —— 删除酒店
// ══════════════════════════════════════════════
export async function remove(req: AuthRequest, res: Response) {
  const hotelId = Number(req.params.id);
  if (Number.isNaN(hotelId)) {
    return fail(res, 'Invalid hotel ID');
  }

  try {
    // 1. 检查权限
    const ownerId = await hotelService.getHotelOwnerId(hotelId);
    if (ownerId === null) {
      return fail(res, 'Hotel not found', 404);
    }

    const isOwner = ownerId === req.user!.userId;
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) {
      return fail(res, 'You can only delete your own hotels', 403);
    }

    // 2. 删除（CASCADE 自动清理关联表）
    await hotelService.deleteHotel(hotelId);
    success(res, { message: 'Hotel deleted' });
  } catch (err) {
    console.error('Failed to delete hotel:', err);
    return fail(res, 'Failed to delete hotel', 500);
  }
}
