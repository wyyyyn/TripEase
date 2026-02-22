import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { fail } from '../utils/response.js';
import type { AuthRequest, JwtPayload } from '../types/auth.js';

// ──────────────────────────────────────────────
// JWT 认证中间件
//
// 中间件就像"门卫"——请求到达 Controller 之前，
// 先经过这个门卫检查"身份证"（JWT 令牌）。
//
// 检查通过 → 放行，并把身份信息贴在请求上（req.user）
// 检查失败 → 直接拦截，返回 401
// ──────────────────────────────────────────────
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  // 1. 从请求头取出 Authorization 字段
  //    格式：Bearer eyJhbGciOi...（Bearer 后面跟一个空格，再跟 token）
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return fail(res, 'Missing or invalid Authorization header', 401);
  }

  // 2. 去掉 "Bearer " 前缀，拿到纯 token
  const token = header.slice(7);

  try {
    // 3. 用密钥验证 token 是否合法、是否过期
    //    如果 token 被篡改或已过期，verify 会抛异常
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // 4. 验证通过，把用户信息挂到 req 上
    //    后续的 Controller 就能通过 req.user 拿到 userId 和 role
    req.user = payload;

    // 5. 放行，交给下一个中间件或 Controller 处理
    next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
}
