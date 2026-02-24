# ============================================================
# TripEase 前端 Dockerfile
#
# 分两步：先编译 React 项目，再用 Nginx 托管静态文件
# 类比：先把菜做好（构建），再摆到餐桌上（Nginx 提供服务）
# ============================================================

# ---------- 阶段 1：构建 React 项目 ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- 阶段 2：用 Nginx 托管编译产物 ----------
FROM nginx:alpine

# 把编译好的静态文件放到 Nginx 默认目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 使用自定义 Nginx 配置（处理 SPA 路由 + API 代理）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
