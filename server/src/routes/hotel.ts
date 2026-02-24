// ──────────────────────────────────────────────
// 酒店路由 —— 定义 URL 和对应的处理函数
//
// 路由就像一张"菜单"，列出了所有能点的菜（接口），
// 以及每道菜需要经过哪些关卡（中间件）。
//
// 执行顺序：requireAuth → requireRole → controller
// 即：先验身份 → 再验角色 → 最后执行业务
// ──────────────────────────────────────────────

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import * as hotelController from '../controllers/hotelController.js';

const router = Router();

// 所有酒店路由都需要先登录
router.use(requireAuth);

// ─── 商户专属路由 ───────────────────────────

// 创建酒店：只有商户和管理员可以
router.post('/', requireRole('merchant', 'admin'), hotelController.create);

// 查询"我的酒店"列表：商户专属
router.get('/my', requireRole('merchant'), hotelController.getMyHotels);

// ─── 单个酒店操作 ───────────────────────────

// 查看酒店详情：商户查自己的，管理员查任意的
router.get('/:id', requireRole('merchant', 'admin'), hotelController.getById);

// 更新酒店：商户改自己的，管理员改任意的（Controller 内部还会再校验）
router.put('/:id', requireRole('merchant', 'admin'), hotelController.update);

// 删除酒店：商户删自己的，管理员删任意的
router.delete('/:id', requireRole('merchant', 'admin'), hotelController.remove);

export default router;
