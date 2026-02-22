import express from 'express';
import cors from 'cors';
import { success } from './utils/response.js';

const app = express();

// 中间件：允许前端跨域访问
app.use(cors({ origin: 'http://localhost:5173' }));

// 中间件：解析 JSON 请求体
app.use(express.json());

// 健康检查接口 —— 用来验证服务器是否在运行
app.get('/api/health', (_req, res) => {
  success(res, { message: 'TripEase API is running' });
});

export default app;
