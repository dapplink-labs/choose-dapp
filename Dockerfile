# Docker构建文件
# 使用较新 LTS Node 版本进行构建
FROM node:18-alpine AS builder
WORKDIR /app

# 仅拷贝依赖清单以利用缓存
COPY package*.json ./

# 安装构建所需依赖（包含 devDependencies），并清理缓存
RUN npm ci && npm cache clean --force

# 拷贝源码并构建
COPY . .
RUN npm run build

# 运行阶段：使用轻量 nginx 提供静态文件
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
ENV NODE_ENV=production

# 拷贝静态资源与自定义 nginx 配置
COPY --from=builder /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
