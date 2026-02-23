# TripEase Docker 部署指南

## 整体架构

```
用户浏览器
    ↓
[ Nginx (端口 80) ]  ← 前端静态文件 + 反向代理
    ↓ /api/*
[ Node.js (端口 3001) ]  ← 后端 API
    ↓
[ MySQL (端口 3306) ]  ← 数据库
```

三个服务通过 Docker Compose 一键启动，各自运行在独立的容器里。

---

## 前置条件

服务器上需要安装：

- **Docker**（容器引擎）
- **Docker Compose**（多容器编排工具，新版 Docker 已自带）

### 安装 Docker（以 Ubuntu 为例）

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh

# 3. 让当前用户可以使用 docker（不用每次 sudo）
sudo usermod -aG docker $USER

# 4. 重新登录后验证
docker --version
docker compose version
```

---

## 部署步骤

### 第一步：把代码传到服务器

```bash
# 方法 A：用 Git（推荐）
git clone <你的仓库地址> TripEase
cd TripEase

# 方法 B：用 scp 直接上传
scp -r ./TripEase user@your-server-ip:~/TripEase
ssh user@your-server-ip
cd TripEase
```

### 第二步：配置环境变量

```bash
# 复制示例配置
cp .env.example .env

# 编辑配置（重要！改密码和密钥）
nano .env
```

`.env` 文件内容：

```
DB_PASSWORD=你的数据库密码（改成复杂密码）
DB_NAME=tripease
JWT_SECRET=你的JWT密钥（用 openssl rand -hex 32 生成）
```

### 第三步：一键启动！

```bash
# 构建镜像 + 启动所有服务（首次会比较慢，要下载和编译）
docker compose up -d --build
```

这条命令做了什么：
1. 下载 MySQL、Node.js、Nginx 的基础镜像
2. 编译后端 TypeScript → JavaScript
3. 编译前端 React → 静态 HTML/JS/CSS
4. 启动 MySQL，自动执行 schema.sql 建表
5. 启动后端，连接数据库
6. 启动 Nginx，托管前端 + 代理 API

### 第四步：验证

```bash
# 查看所有容器状态（应该都是 Up）
docker compose ps

# 检查后端健康
curl http://localhost:3001/api/health

# 检查数据库连接
curl http://localhost:3001/api/health/db

# 打开浏览器访问
# http://你的服务器IP
```

---

## 常用命令速查

```bash
# 查看运行中的容器
docker compose ps

# 查看日志（实时）
docker compose logs -f

# 只看后端日志
docker compose logs -f server

# 停止所有服务
docker compose down

# 停止并删除数据（慎用！会清空数据库）
docker compose down -v

# 重新构建（改了代码后）
docker compose up -d --build

# 进入 MySQL 命令行
docker compose exec db mysql -u root -p tripease

# 进入后端容器调试
docker compose exec server sh
```

---

## 常见问题

### Q: 启动后访问不了？

1. 检查防火墙是否开放了 80 端口：
   ```bash
   sudo ufw allow 80
   ```
2. 如果是云服务器（阿里云/腾讯云/AWS），还需要在安全组里开放 80 端口

### Q: 数据库连接失败？

MySQL 首次启动需要约 30 秒初始化。后端会等待数据库就绪后才启动（healthcheck 机制）。

```bash
# 查看数据库状态
docker compose logs db
```

### Q: 修改了代码怎么更新？

```bash
git pull                        # 拉最新代码
docker compose up -d --build    # 重新构建 + 重启
```

### Q: 如何备份数据库？

```bash
# 导出
docker compose exec db mysqldump -u root -p tripease > backup.sql

# 恢复
docker compose exec -T db mysql -u root -p tripease < backup.sql
```
