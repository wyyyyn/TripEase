// ──────────────────────────────────────────────
// 公开路由 —— C 端用户可以直接访问，不需要登录
//
// 类比：这些是"酒店大堂的公告栏"上的信息，
// 任何路人都能看到，不需要出示房卡。
//
// 注意：这里没有 requireAuth 中间件！
// 和 /api/hotels（商户，需要登录）、/api/admin（管理员）不同。
//
// 路由：
//   GET /api/public/hotels     — 搜索已发布酒店（分页）
//   GET /api/public/hotels/:id — 查看酒店详情（仅已发布）
//   GET /api/public/cities     — 获取城市列表
// ──────────────────────────────────────────────

import { Router } from 'express';
import * as publicController from '../controllers/publicController.js';

const router = Router();

// 搜索酒店（无需认证）
router.get('/hotels', publicController.searchHotels);

// 酒店详情（无需认证）
router.get('/hotels/:id', publicController.getHotelDetail);

// 城市列表（无需认证）
router.get('/cities', publicController.getCities);

export default router;
