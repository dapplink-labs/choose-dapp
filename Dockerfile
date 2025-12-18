# 使用轻量级 nginx alpine 镜像
FROM nginx:1.25-alpine

# 设置标签
LABEL maintainer="chooseme-team"
LABEL description="ChooseMe Frontend H5"

# 删除默认配置
RUN rm -rf /etc/nginx/conf.d/default.conf

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY dist /usr/share/nginx/html

# 设置正确的权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
