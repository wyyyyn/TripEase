import express from 'express';
import cors from 'cors';
import { success, fail } from './utils/response.js';
import pool from './config/db.js';
import authRouter from './routes/auth.js';

const app = express();

// 中间件：允许前端跨域访问
app.use(cors({ origin: 'http://localhost:5173' }));

// 中间件：解析 JSON 请求体
app.use(express.json());

// 健康检查接口 —— 用来验证服务器是否在运行
app.get('/api/health', (_req, res) => {
  success(res, { message: 'TripEase API is running' });
});

// 数据库健康检查 —— 验证数据库连接是否正常
// SELECT 1 是最轻量的查询，只要数据库能响应就说明连接正常
app.get('/api/health/db', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    success(res, { message: 'Database connection is healthy' });
  } catch (err) {
    fail(res, 'Database connection failed', 500);
  }
});

// 认证路由：/api/auth/register, /api/auth/login, /api/auth/me
app.use('/api/auth', authRouter);

export default app;
