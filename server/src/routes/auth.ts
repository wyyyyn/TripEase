import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

// ──────────────────────────────────────────────
// 认证路由
//
// Router 就像一个"路标"，告诉 Express：
//   当请求走 POST /register → 交给 register 函数处理
//   当请求走 POST /login    → 交给 login 函数处理
//   当请求走 GET  /me       → 先过门卫（requireAuth），再交给 getMe
// ──────────────────────────────────────────────

const router = Router();

// 公开接口：任何人都能访问
router.post('/register', authController.register);
router.post('/login', authController.login);

// 受保护接口：必须携带有效的 JWT 令牌
// requireAuth 就是我们写的"门卫中间件"
router.get('/me', requireAuth, authController.getMe);

export default router;
