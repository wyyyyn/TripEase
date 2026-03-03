import type { Request } from 'express';

// ──────────────────────────────────────────────
// 用户角色：和数据库 ENUM 保持一致
// ──────────────────────────────────────────────
export type UserRole = 'customer' | 'merchant' | 'admin';

// ──────────────────────────────────────────────
// 数据库里的用户行（SELECT * FROM users 的一行）
// ──────────────────────────────────────────────
export interface UserRow {
  id: number;
  username: string;
  password: string;           // bcrypt 哈希后的密码
  display_name: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

// ──────────────────────────────────────────────
// JWT 令牌里携带的数据（payload）
// 就像身份证上印的信息：只放必要的，不放密码
// ──────────────────────────────────────────────
export interface JwtPayload {
  userId: number;
  role: UserRole;
}

// ──────────────────────────────────────────────
// 扩展 Express 的 Request 类型
// 让 req.user 有类型提示，不用每次手动断言
// ──────────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
