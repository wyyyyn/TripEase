// ──────────────────────────────────────────────
// 公开 Controller —— 处理 C 端用户的 HTTP 请求
//
// 类比：这是酒店大堂的"前台接待员"，
// 任何人（不需要登录）都可以来咨询：
//   - "有什么酒店？"         → searchHotels
//   - "这家酒店详细信息？"   → getHotelDetail
//   - "有哪些城市可以选？"   → getCities
//
// 这些接口都不需要 JWT 认证（没有 requireAuth 中间件）。
// ──────────────────────────────────────────────

import type { Request, Response } from 'express';
import { z } from 'zod';
import { success, fail } from '../utils/response.js';
import * as publicService from '../services/publicService.js';

// ===== Zod 校验规则 =====

/**
 * 搜索参数的校验规则
 *
 * 为什么用 coerce？
 * → query string 里所有值都是字符串（如 "?page=2"），
 *   z.coerce.number() 会自动把 "2" 转成数字 2。
 */
const searchQuerySchema = z.object({
  keyword: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  starRating: z.coerce.number().int().min(1).max(5).optional(),
  tags: z.string().optional(),                 // 逗号分隔，如 "豪华,泳池"
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'default']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// 酒店 ID 参数校验
const hotelIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// ══════════════════════════════════════════════
// GET /api/public/hotels  —— 搜索已发布酒店
//
// Query 参数（全部可选）：
//   keyword    — 关键词（模糊匹配酒店名/地址）
//   minPrice   — 最低价格
//   maxPrice   — 最高价格
//   minRating  — 最低评分（如 4.5）
//   starRating — 星级（精确匹配，如 5）
//   tags       — 标签筛选（逗号分隔，如 "豪华,泳池"）
//   sort       — 排序方式（price_asc / price_desc / rating / default）
//   page       — 页码（默认 1）
//   limit      — 每页条数（默认 20，最大 100）
//
// 返回：{ ok: true, data: { items, total, page, limit, totalPages } }
// ══════════════════════════════════════════════
export async function searchHotels(req: Request, res: Response) {
  try {
    // 1. 校验并解析 query 参数
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return fail(res, `Invalid query params: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
    }

    const q = parsed.data;

    // 2. 将 tags 字符串拆成数组
    const tags = q.tags ? q.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined;

    // 3. 调用 Service 执行搜索
    const result = await publicService.searchPublishedHotels({
      keyword: q.keyword,
      minPrice: q.minPrice,
      maxPrice: q.maxPrice,
      minRating: q.minRating,
      starRating: q.starRating,
      tags,
      sort: q.sort,
      page: q.page,
      limit: q.limit,
    });

    // 4. 返回分页结果
    success(res, result);
  } catch (err) {
    console.error('searchHotels error:', err);
    fail(res, 'Failed to search hotels', 500);
  }
}

// ══════════════════════════════════════════════
// GET /api/public/hotels/:id  —— 获取单个酒店详情
//
// 只返回 status='published' 的酒店。
// 如果酒店不存在或未发布，返回 404。
// ══════════════════════════════════════════════
export async function getHotelDetail(req: Request, res: Response) {
  try {
    // 1. 校验 ID
    const parsed = hotelIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return fail(res, 'Invalid hotel ID');
    }

    // 2. 查询已发布酒店
    const hotel = await publicService.getPublishedHotelById(parsed.data.id);

    if (!hotel) {
      return fail(res, 'Hotel not found', 404);
    }

    success(res, hotel);
  } catch (err) {
    console.error('getHotelDetail error:', err);
    fail(res, 'Failed to get hotel detail', 500);
  }
}

// ══════════════════════════════════════════════
// GET /api/public/cities  —— 获取城市列表（含地标）
// ══════════════════════════════════════════════
export async function getCities(req: Request, res: Response) {
  try {
    const cities = await publicService.getCities();
    success(res, cities);
  } catch (err) {
    console.error('getCities error:', err);
    fail(res, 'Failed to get cities', 500);
  }
}
