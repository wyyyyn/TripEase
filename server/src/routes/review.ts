// ──────────────────────────────────────────────
// 审核路由 —— 管理员专属的酒店审核接口
//
// 所有路由都挂在 /api/admin 下面（app.ts 中配置），
// 并且要经过两道关卡：
//   1. requireAuth  → 必须登录（有 JWT 令牌）
//   2. requireRole('admin') → 必须是管理员角色
//
// 非管理员访问会被拦截并返回 403 Forbidden。
// ──────────────────────────────────────────────

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();

// 全局中间件：所有审核路由都要求登录
router.use(requireAuth);

// ─── 仪表板统计（admin + merchant 都可以访问）────
// 放在 requireRole('admin') 之前，因为商户也需要看自己的统计
router.get('/stats', requireRole('admin', 'merchant'), reviewController.getDashboardStats);

// 以下路由只允许 admin 角色
router.use(requireRole('admin'));

// ─── 酒店列表 ───────────────────────────
// GET /api/admin/hotels          → 查全部
// GET /api/admin/hotels?status=pending → 按状态筛选
router.get('/hotels', reviewController.listHotels);

// ─── 单个酒店详情 ───────────────────────
router.get('/hotels/:id', reviewController.getHotelDetail);

// ─── 变更状态（审核操作的核心接口）──────
// PATCH /api/admin/hotels/:id/status
// body: { status: 'approved' | 'rejected' | 'published' | 'offline', reason?: string }
router.patch('/hotels/:id/status', reviewController.changeStatus);

// ─── 审核日志 ───────────────────────────
router.get('/hotels/:id/logs', reviewController.getReviewLogs);

export default router;
