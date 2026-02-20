import type { AuthUser, UserRole } from '../types/admin';

const USERS_KEY = 'tripease_users';
const SESSION_KEY = 'tripease_session';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getUsers(): AuthUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users: AuthUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register(
  username: string,
  _password: string,
  role: UserRole,
): { ok: true; user: AuthUser } | { ok: false; error: string } {
  const users = getUsers();
  if (users.some((u) => u.username === username)) {
    return { ok: false, error: '用户名已存在' };
  }
  const user: AuthUser = {
    id: generateId(),
    username,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { ok: true, user };
}

export function login(
  username: string,
  _password: string,
): { ok: true; user: AuthUser } | { ok: false; error: string } {
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (!user) {
    return { ok: false, error: '用户名或密码错误' };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { ok: true, user };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}
