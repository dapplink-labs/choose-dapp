# 生产环境部署配置说明

## 问题说明

在生产环境中，Vite 的 `proxy` 配置不会生效（proxy 只在开发服务器中有效）。因此需要配置反向代理（如 Nginx）来处理 API 请求。

## 部署方式

本项目使用 **Jenkins + Docker** 进行自动部署：

1. **Jenkinsfile**：定义了完整的 CI/CD 流程
2. **Dockerfile**：构建包含 Nginx 的 Docker 镜像
3. **nginx.conf**：Nginx 配置文件（包含 API 代理配置）

## 解决方案

### 方案一：使用 Nginx 反向代理（推荐）

如果 API 和前端部署在同一域名下，推荐使用 Nginx 反向代理。

#### 1. 配置 Nginx

参考 `nginx.conf` 文件，配置反向代理规则：

- `/staking-api/` → 代理到后端 API 服务器
- `/api/` → 代理到桥接 API 服务器
- `/bsc-rpc/` → 代理到 BSC RPC 节点

#### 2. 环境变量配置

创建 `.env.production` 文件（如果使用相对路径，可以留空）：

```bash
# 使用相对路径（需要 nginx 代理）
VITE_API_BASE_URL=
```

### 方案二：使用环境变量配置绝对路径

如果 API 部署在不同域名，需要配置 CORS。

#### 1. 创建 `.env.production` 文件

```bash
# 使用绝对路径（需要后端配置 CORS）
VITE_API_BASE_URL=https://your-api-domain.com
```

#### 2. 确保后端配置了 CORS

后端需要允许前端域名的跨域请求。

## 环境变量说明

- `VITE_API_BASE_URL`: API 基础地址
  - 留空或未设置：使用相对路径（需要 Nginx 代理）
  - 设置值：使用绝对路径（需要后端配置 CORS）

## Jenkins 自动部署流程

### 1. 构建流程

Jenkins 会自动执行以下步骤：

1. **Check Environment**：检查 Node.js、npm、Docker 环境
2. **Install Dependencies**：安装项目依赖
3. **Lint**：代码检查（失败不阻塞构建）
4. **Build**：构建生产版本（`npm run build`）
5. **Build Image**：构建 Docker 镜像
6. **Deploy**：停止旧容器，启动新容器
7. **Cleanup**：清理旧镜像

### 2. Docker 镜像结构

- **基础镜像**：`nginx:1.25-alpine`
- **配置文件**：`nginx.conf` → `/etc/nginx/nginx.conf`
- **静态文件**：`dist` → `/usr/share/nginx/html`
- **端口**：容器内 80 端口映射到主机 3000 端口

### 3. 重要配置说明

#### nginx.conf 中的 API 代理地址

当前配置中的后端地址是硬编码的：
- `http://172.18.1.58:8080` - staking-api 后端地址

**注意**：如果后端服务不在同一 Docker 网络或主机上，需要：

1. **方案 A**：使用 Docker 网络
   - 将后端服务也部署为 Docker 容器
   - 使用 Docker Compose 或 Docker 网络连接
   - 修改 `proxy_pass` 为容器名称（如 `http://backend-service:8080`）

2. **方案 B**：使用主机网络
   - 在 `docker run` 时添加 `--network host`
   - 或使用主机 IP 地址

3. **方案 C**：使用环境变量（推荐）
   - 修改 Dockerfile 支持环境变量
   - 在 Jenkinsfile 中传递环境变量

### 4. 修改后端地址

如果需要修改后端 API 地址，请编辑 `nginx.conf` 文件中的以下部分：

```nginx
location /staking-api/ {
    proxy_pass http://YOUR_BACKEND_HOST:PORT/;
    # ...
}
```

然后提交代码，Jenkins 会自动重新构建和部署。

## 检查清单

部署前请确认：

- [ ] Nginx 配置了正确的反向代理规则
- [ ] 后端 API 服务器可以正常访问（从容器内）
- [ ] Docker 网络配置正确（如果使用容器网络）
- [ ] 如果使用绝对路径，后端已配置 CORS
- [ ] 环境变量文件已正确配置（如需要）
- [ ] Jenkins 构建任务配置正确

## 常见问题

### 1. API 请求 404

**原因**：Nginx 未正确配置代理规则

**解决**：检查 Nginx 配置，确保代理路径匹配 API 请求路径

### 2. CORS 错误

**原因**：后端未配置 CORS 或配置不正确

**解决**：
- 如果使用 Nginx 代理，在 Nginx 配置中添加 CORS 头
- 如果使用绝对路径，在后端配置 CORS

### 3. API 请求超时

**原因**：后端服务器无法访问或网络问题

**解决**：检查后端服务器状态和网络连接

