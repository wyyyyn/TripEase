// ============================================================
// 认证 API —— 注册、登录、获取当前用户
// ============================================================
// 类比：这个文件就像酒店的"入住手续单"。
// 里面有三种表格：
//   1. 注册表（registerAPI）→ 新客人填资料
//   2. 登录表（loginAPI）  → 老客人出示身份证
//   3. 查我是谁（getMeAPI）→ 用房卡查入住信息
// ============================================================

import { apiClient } from './client';
import type { UserRole } from '../types/admin';

// ---------- 后端响应类型 ----------

/** 注册/登录成功时，后端返回的 data 部分 */
interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: UserRole;
  };
}

/** GET /api/auth/me 返回的 data 部分 */
interface MeResponse {
  id: number;
  username: string;
  role: UserRole;
  createdAt: string;
}

/** 后端统一的响应包装格式 */
interface ApiResult<T> {
  ok: boolean;
  data: T;
}

// ---------- API 函数 ----------

/** 注册新用户 */
export async function registerAPI(
  username: string,
  password: string,
  role: UserRole,
): Promise<AuthResponse> {
  const result = await apiClient<ApiResult<AuthResponse>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  });
  return result.data;
}

/** 登录 */
export async function loginAPI(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const result = await apiClient<ApiResult<AuthResponse>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return result.data;
}

/** 用 token 获取当前登录用户信息 */
export async function getMeAPI(): Promise<MeResponse> {
  const result = await apiClient<ApiResult<MeResponse>>('/api/auth/me');
  return result.data;
}
