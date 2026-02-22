// ──────────────────────────────────────────────
// 角色权限中间件
//
// 类比：门卫（requireAuth）检查你有没有身份证，
// 角色中间件再看你的身份证上写的是"商户"还是"管理员"，
// 只有身份匹配才放行。
//
// 用法示例：
//   router.post('/', requireAuth, requireRole('merchant', 'admin'), controller)
//   ↑ 先过身份验证，再过角色检查，最后才到业务逻辑
// ──────────────────────────────────────────────

import type { Response, NextFunction } from 'express';
import { fail } from '../utils/response.js';
import type { AuthRequest } from '../types/auth.js';
import type { UserRole } from '../types/auth.js';

/**
 * 生成一个角色检查中间件
 * @param roles - 允许通过的角色列表，比如 ('merchant', 'admin')
 *
 * 为什么返回一个函数而不是直接写一个中间件？
 * → 因为不同接口允许的角色不同，用"工厂函数"可以灵活配置
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // req.user 由 requireAuth 中间件设置
    // 如果走到这里还没有 user，说明 requireAuth 没执行或出了问题
    if (!req.user) {
      return fail(res, 'Authentication required', 401);
    }

    // 检查用户角色是否在允许列表中
    if (!roles.includes(req.user.role)) {
      return fail(res, 'Insufficient permissions', 403);
    }

    next();
  };
}
