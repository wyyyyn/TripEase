// ============================================================
// authStore —— 前端认证状态管理（已接入后端 API）
// ============================================================
//
// 旧版：用 localStorage 模拟整个用户系统（本地存用户列表）
// 新版：调用后端 API，localStorage 只存 JWT token 和用户信息缓存
//
// 类比：
//   旧版 = 自己用笔记本记住所有住客，查入住也翻笔记本
//   新版 = 前台（前端）打电话给总部（后端）确认身份，
//          只在前台桌上放一张"入住确认单"（token + 缓存）
// ============================================================

import type { AuthUser, UserRole } from '../types/admin';
import { registerAPI, loginAPI, getMeAPI } from '../api/auth';
import { saveToken, removeToken, getToken } from '../api/client';

// ──────────────────────────────────────────────
// 内存中的用户缓存 + 事件通知
// ──────────────────────────────────────────────

const USER_CACHE_KEY = 'tripease_user';  // localStorage 缓存用户信息（非 token）

/** 内存中的当前用户，页面不刷新时直接读内存 */
let currentUser: AuthUser | null = loadCachedUser();

/** 通知所有订阅者（React 组件）：用户状态变了，该重新渲染了 */
function notify(): void {
  window.dispatchEvent(new Event('tripease_store_change'));
}

/** 从 localStorage 读取缓存的用户信息（刷新页面时恢复） */
function loadCachedUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 把用户信息同时写入内存和 localStorage 缓存 */
function setUser(user: AuthUser | null): void {
  currentUser = user;
  if (user) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_CACHE_KEY);
  }
  notify();
}

// ──────────────────────────────────────────────
// 对外暴露的 API
// ──────────────────────────────────────────────

/**
 * 注册
 * 成功 → 存 token + 用户信息，返回 { ok: true, user }
 * 失败 → 返回 { ok: false, error }
 */
export async function register(
  username: string,
  password: string,
  role: UserRole,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  try {
    const data = await registerAPI(username, password, role);
    // 后端返回 { token, user: { id, username, role } }
    saveToken(data.token);
    const user: AuthUser = {
      id: data.user.id,
      username: data.user.username,
      role: data.user.role,
      createdAt: new Date().toISOString(), // 注册时间取当前
    };
    setUser(user);
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * 登录
 * 成功 → 存 token + 用户信息，返回 { ok: true, user }
 * 失败 → 返回 { ok: false, error }
 */
export async function login(
  username: string,
  password: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  try {
    const data = await loginAPI(username, password);
    saveToken(data.token);
    const user: AuthUser = {
      id: data.user.id,
      username: data.user.username,
      role: data.user.role,
      createdAt: '', // 登录时后端不返回 createdAt，后续 initAuth 会补全
    };
    setUser(user);
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * 退出登录
 * 清除 token 和用户信息
 */
export function logout(): void {
  removeToken();
  setUser(null);
}

/**
 * 获取当前用户（同步读取，用于 React 组件渲染）
 * 注意：这个函数是同步的，读的是内存缓存
 */
export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

/**
 * 应用启动时调用：用 token 向后端验证身份
 *
 * 类比：每天早上酒店前台开门，先打电话给总部确认
 * "昨天那张入住确认单还有效吗？"
 *   有效 → 更新客人信息
 *   无效 → 撕掉确认单，让客人重新登录
 */
export async function initAuth(): Promise<void> {
  const token = getToken();
  if (!token) {
    // 没有 token，说明没登录过
    setUser(null);
    return;
  }

  try {
    // 用 token 问后端"我是谁？"
    const me = await getMeAPI();
    setUser({
      id: me.id,
      username: me.username,
      role: me.role,
      createdAt: me.createdAt,
    });
  } catch {
    // token 无效或过期，清除所有登录状态
    removeToken();
    setUser(null);
  }
}
