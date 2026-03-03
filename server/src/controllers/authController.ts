import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { success, fail } from '../utils/response.js';
import * as authService from '../services/authService.js';
import type { AuthRequest, JwtPayload } from '../types/auth.js';

// ──────────────────────────────────────────────
// Zod 校验规则
//
// 为什么要做校验？ —— 用户发来的数据不可信！
// 就像快递站收件时必须检查：地址写了没？手机号格式对不对？
// 如果不检查，垃圾数据进了数据库就麻烦了
// ──────────────────────────────────────────────

// 注册接口的入参校验
const registerSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username must be at most 50 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  role: z
    .enum(['customer', 'merchant', 'admin'])
    .default('customer'),
});

// 登录接口的入参校验
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// ──────────────────────────────────────────────
// 工具函数：生成 JWT 令牌
// ──────────────────────────────────────────────
function signToken(payload: JwtPayload): string {
  // jwt.sign：把数据加密生成一个字符串（令牌）
  // expiresIn: '7d' → 7 天后过期，用户需重新登录
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

// ══════════════════════════════════════════════
// POST /api/auth/register  —— 注册
// ══════════════════════════════════════════════
export async function register(req: Request, res: Response) {
  // 1. 用 Zod 校验请求体
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    // 校验失败 → 告诉用户哪里不对
    return fail(res, parsed.error.errors[0].message);
  }

  const { username, password, role } = parsed.data;

  // 2. 检查用户名是否已被注册
  const existing = await authService.findUserByUsername(username);
  if (existing) {
    return fail(res, 'Username already exists', 409);
  }

  // 3. 加密密码
  //    bcrypt.hash(明文, 轮数)
  //    轮数 10 → 大约 100ms，安全性与性能的平衡点
  //    就像把密码放进搅拌机搅 10 次，出来的东西无法还原成原文
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. 存入数据库，拿到新用户的 ID
  const userId = await authService.createUser(username, hashedPassword, role);

  // 5. 生成 JWT 令牌，返回给前端
  const token = signToken({ userId, role });

  success(res, {
    token,
    user: { id: userId, username, role },
  });
}

// ══════════════════════════════════════════════
// POST /api/auth/login  —— 登录
// ══════════════════════════════════════════════
export async function login(req: Request, res: Response) {
  // 1. 校验入参
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, parsed.error.errors[0].message);
  }

  const { username, password } = parsed.data;

  // 2. 查用户
  const user = await authService.findUserByUsername(username);
  if (!user) {
    // 不要告诉黑客"用户名不存在"，统一说"用户名或密码错误"
    return fail(res, 'Invalid username or password', 401);
  }

  // 3. 对比密码
  //    bcrypt.compare：把用户输入的明文和数据库里的哈希值比较
  //    即使数据库泄露，黑客也拿不到明文密码
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return fail(res, 'Invalid username or password', 401);
  }

  // 4. 密码匹配，签发令牌
  const token = signToken({ userId: user.id, role: user.role });

  success(res, {
    token,
    user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role },
  });
}

// ══════════════════════════════════════════════
// GET /api/auth/me  —— 获取当前登录用户信息
// ══════════════════════════════════════════════
export async function getMe(req: AuthRequest, res: Response) {
  // req.user 是中间件 requireAuth 解析 JWT 后挂上去的
  const userId = req.user!.userId;

  const user = await authService.findUserById(userId);
  if (!user) {
    return fail(res, 'User not found', 404);
  }

  // 返回用户信息，不返回密码！
  success(res, {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role,
    createdAt: user.created_at,
  });
}
