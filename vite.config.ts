import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
// https://vitejs.dev/config/
export default defineConfig({
  base:"./",
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 允许外部访问，通常用于 Docker 或云环境
    port: 3001, // 配置服务器监听端口
    open: true, // 自动打开浏览器
    cors: true, // 允许跨域请求
    proxy: {
      "/api": {
        target: "https://bridge-api-testnet.cpchain.com/api",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/staking-api": {
        // target: "https://chooseme-es-hcmc.gis-data.cn:8090",//外网地址
        target: "http://13.214.178.17:8080",//新加坡
        // target: "http://172.18.1.58:8080",
        // target: "http://172.18.1.158:8082",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/staking-api/, ""),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('staking-api proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to staking-api:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from staking-api:', proxyRes.statusCode, req.url);
          });
        },
      },
      
    },
  },
  build: {
    assetsInlineLimit: 4096, //  小于 4kb 才 base64
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('element-plus')) {
            return 'element-plus'
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
