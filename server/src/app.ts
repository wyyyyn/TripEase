import express from 'express';
import cors from 'cors';
import { success, fail } from './utils/response.js';
import pool from './config/db.js';
import authRouter from './routes/auth.js';
import hotelRouter from './routes/hotel.js';
import reviewRouter from './routes/review.js';
import publicRouter from './routes/public.js';
import registerRequestRouter from './routes/registerRequest.js';

const app = express();

// 中间件：允许前端跨域访问
// 开发时前端在 5173 端口，生产环境通过 Nginx 代理（同源），所以允许所有来源
// 如果你有自己的域名，可以改成 origin: 'https://yourdomain.com'
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

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

// 酒店路由：/api/hotels（商户 CRUD）
app.use('/api/hotels', hotelRouter);

// 审核路由：/api/admin/hotels（管理员审核）
app.use('/api/admin', reviewRouter);

// 公开路由：/api/public/*（C 端用户，无需登录）
app.use('/api/public', publicRouter);

// 注册请求路由：/api/register-request（获取专属方案，无需登录）
app.use('/api/register-request', registerRequestRouter);

export default app;
