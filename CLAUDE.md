# TripEase 项目指南

## 用户背景

用户是后端纯新手。每完成一个步骤，都需要用通俗语言讲解：
- 这一步在做什么、为什么要做
- 关键代码的含义
- 类比日常概念帮助理解

## 项目概况

- **前端**：React 19 + Vite + TypeScript + Tailwind（已完成）
- **后端**：Node.js + Express + TypeScript（已完成）
- **数据库**：MySQL（schema 已有）
- 前端已全部接入后端 API，不再依赖 localStorage 模拟数据

## 后端搭建计划（共 8 步）— 全部完成

### Step 1：搭 Express 骨架 ✅
- 创建 `/server` 目录，Express + TypeScript 项目
- 健康检查接口 `GET /api/health`
- 服务器运行在 `http://localhost:3001`

### Step 2：连接 MySQL 数据库 ✅
- 创建数据库连接池（mysql2）
- 用已有的 `database/schema.sql` 建表
- 验证接口 `GET /api/health/db`

### Step 3：认证 API（注册/登录/JWT）✅
- `POST /api/auth/register`、`POST /api/auth/login`、`GET /api/auth/me`
- bcrypt 密码加密 + JWT 令牌

### Step 4：前端接入认证 API ✅
- 创建 `app/src/shared/api/` 目录，封装 fetch 请求
- 改造 `authStore.ts`：localStorage → API 调用
- 改造登录/注册页面

### Step 5：酒店 CRUD API（商户端）✅
- 创建/更新/查询酒店接口
- 数据库事务（一次写多张表）
- 角色权限中间件

### Step 6：管理员审核 API + 前端接入 ✅
- 审核/批准/拒绝/发布/下线接口
- 状态流转校验 + 审核日志
- 前端审核页面改造

### Step 7：C 端公开接口 + 前端接入 ✅
- `GET /api/public/hotels` — 搜索已发布酒店（分页 + 筛选 + 排序）
- `GET /api/public/hotels/:id` — 酒店详情（仅已发布）
- `GET /api/public/cities` — 城市列表
- 前端 HotelList / HotelDetail 改造完成

### Step 8：仪表板 + 清理 ✅
- `GET /api/admin/stats` — Dashboard 统计 API（GROUP BY 高效计数）
- AdminDashboard 改用 stats API，不再拉全部酒店列表
- localStorage 数据依赖已全部清除（仅保留 JWT token + user cache）

## API 端点总览

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/health` | 无 | 健康检查 |
| GET | `/api/health/db` | 无 | 数据库健康检查 |
| POST | `/api/auth/register` | 无 | 注册 |
| POST | `/api/auth/login` | 无 | 登录 |
| GET | `/api/auth/me` | JWT | 获取当前用户 |
| POST | `/api/hotels` | merchant/admin | 创建酒店 |
| GET | `/api/hotels/my` | merchant | 我的酒店列表 |
| GET | `/api/hotels/:id` | merchant/admin | 酒店详情 |
| PUT | `/api/hotels/:id` | merchant/admin | 更新酒店 |
| DELETE | `/api/hotels/:id` | merchant/admin | 删除酒店 |
| GET | `/api/admin/stats` | admin/merchant | 仪表板统计 |
| GET | `/api/admin/hotels` | admin | 全部酒店列表 |
| GET | `/api/admin/hotels/:id` | admin | 酒店详情（管理员） |
| PATCH | `/api/admin/hotels/:id/status` | admin | 变更状态 |
| GET | `/api/admin/hotels/:id/logs` | admin | 审核日志 |
| GET | `/api/public/hotels` | 无 | 搜索已发布酒店 |
| GET | `/api/public/hotels/:id` | 无 | 酒店详情（公开） |
| GET | `/api/public/cities` | 无 | 城市列表 |

## 关键文件

| 文件 | 说明 |
|---|---|
| `database/schema.sql` | 数据库表结构 |
| `server/src/` | 后端源代码 |
| `app/src/shared/api/` | 前端 API 客户端 |
| `app/src/shared/store/authStore.ts` | 前端认证逻辑 |
| `app/src/shared/store/hotelStore.ts` | 商户端酒店数据 |
| `app/src/shared/types/` | 类型定义 |

## 开发命令

```bash
# 前端（端口 5173）
cd app && npm run dev

# 后端（端口 3001）
cd server && npm run dev
```
