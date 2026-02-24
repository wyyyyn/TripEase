# ============================================================
# TripEase 后端 Dockerfile
#
# 类比：这是一份"食谱"，告诉 Docker 怎么把你的后端代码
# 打包成一个可以随处运行的"盒子"（容器）
# ============================================================

# ---------- 阶段 1：构建（把 TypeScript 编译成 JavaScript）----------
# node:20-alpine 是一个精简版 Node.js 镜像，体积小、启动快
FROM node:20-alpine AS builder

WORKDIR /app

# 先复制 package 文件，利用 Docker 缓存：
# 只要 package.json 没变，npm install 这一步就不用重新跑
COPY package.json package-lock.json ./
RUN npm ci

# 复制源代码并编译 TypeScript → JavaScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---------- 阶段 2：运行（只保留运行需要的文件）----------
FROM node:20-alpine

WORKDIR /app

# 只安装生产依赖（不装 devDependencies，镜像更小）
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 从构建阶段拷贝编译好的 JS 文件
COPY --from=builder /app/dist ./dist

# 声明容器监听 3001 端口
EXPOSE 3001

# 启动命令
CMD ["node", "dist/index.js"]
