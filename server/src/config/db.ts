import mysql from 'mysql2/promise';
import { env } from './env.js';

/**
 * MySQL 连接池
 *
 * 为什么用连接池而不是单个连接？
 * - 单个连接：同一时间只能处理一个查询，像只有一条车道的公路
 * - 连接池：同时维护多个连接，像多车道高速公路，能并发处理多个请求
 *
 * mysql2/promise 版本让我们可以用 async/await，代码更易读
 */
const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  // 连接池大小：最多同时保持 10 个数据库连接
  connectionLimit: 10,

  // 等待连接的超时时间（毫秒）：如果 10 个连接都在忙，新请求最多等 10 秒
  waitForConnections: true,
  queueLimit: 0,
});

export default pool;
