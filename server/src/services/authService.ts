import pool from '../config/db.js';
import type { UserRow, UserRole } from '../types/auth.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

// ──────────────────────────────────────────────
// Service 层 = 专门和数据库打交道的"服务员"
// Controller 说"我要查用户"，Service 就去数据库里查
// 这样 Controller 不需要知道 SQL 怎么写
// ──────────────────────────────────────────────

/**
 * 按用户名查找用户
 * 用途：注册时检查是否重名、登录时查找用户
 */
export async function findUserByUsername(
  username: string,
): Promise<UserRow | null> {
  // pool.query 返回 [rows, fields]，我们只要 rows
  // ? 是占位符，mysql2 会自动转义，防止 SQL 注入攻击
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE username = ?',
    [username],
  );
  // rows 是数组，取第一个；没找到就返回 null
  return (rows[0] as UserRow) ?? null;
}

/**
 * 按 ID 查找用户
 * 用途：GET /me 接口，根据 JWT 里的 userId 查完整信息
 */
export async function findUserById(id: number): Promise<UserRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ?',
    [id],
  );
  return (rows[0] as UserRow) ?? null;
}

/**
 * 创建新用户
 * 返回值：新用户的自增 ID
 *
 * 注意：传进来的 password 必须是已经 bcrypt 加密过的
 * 明文密码绝不能存进数据库！
 */
export async function createUser(
  username: string,
  hashedPassword: string,
  role: UserRole,
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, role],
  );
  // insertId 就是 MySQL 自动生成的 AUTO_INCREMENT 主键
  return result.insertId;
}
