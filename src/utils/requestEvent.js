import axios from "axios"

// 使用反向代理：统一走相对路径前缀，由 Vite/Nginx 转发到 Event API
// - 开发环境：vite.config.ts 的 server.proxy 将 /eventapi 转发到后端
// - 生产环境：需要 Nginx（或网关）配置同样的 /eventapi 反向代理
const getBaseURL = () => '/event-api'

function safeParseSignatureInfo() {
  try {
    const raw = window.sessionStorage.getItem('signatureInfo')
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

// create an axios instance
const serive = axios.create({
  baseURL: getBaseURL(),
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000, // request timeout (30 seconds)
})

// 事件接口专用拦截器：走反代理并附带签名 + 授权
serive.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {}

    // 签名信息（如果存在）
    const signatureInfo = safeParseSignatureInfo()
    if (signatureInfo?.timestamp) config.headers["X-Signature-Message"] = signatureInfo.timestamp
    if (signatureInfo?.signature) config.headers["X-Signature"] = signatureInfo.signature

    // 登录 token：后端需要 Authorization 头
    const token = window.sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 只有存在 address 才传
    const address = localStorage.getItem('address')
    if (address) {
      config.headers.address = address
    }

    // 禁用缓存 & GET 请求增加时间戳
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    config.headers['Pragma'] = 'no-cache'
    config.headers['Expires'] = '0'

    if (config.method === 'get') {
      config.params = {
        ...(config.params || {}),
        _t: Date.now(),
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor for token refresh
let isRefreshing = false
let requests = []

serive.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const config = error.config
    if (!config) return Promise.reject(error)

    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401 && !config._retry) {
      config._retry = true

      // Avoid infinite loop if login itself fails
      if (config.url.includes('/api/v1/login')) {
        return Promise.reject(error)
      }

      if (!isRefreshing) {
        isRefreshing = true
        try {
          // Attempt to login again (using hardcoded credentials as per current project pattern)
          const res = await serive.post('/api/v1/login', {
            login_type: 'password',
            email: 'seek10@example.com',
            password: '123456'
          })

          const newToken = res.data?.data?.token
          const newUserGuid = res.data?.data?.user_guid

          if (newToken) {
            window.sessionStorage.setItem('token', newToken)
            if (newUserGuid) {
              window.sessionStorage.setItem('user_guid', newUserGuid)
            }

            // Execute all queued requests with the new token
            requests.forEach((cb) => cb(newToken))
            requests = []

            // Retry the original failed request
            config.headers.Authorization = `Bearer ${newToken}`
            return serive(config)
          }
        } catch (refreshError) {
          console.error('Auto-refresh token failed:', refreshError)
          requests.forEach((cb) => cb(null))
          requests = []
          // Optionally clear token or redirect to login
          window.sessionStorage.removeItem('token')
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        // If already refreshing, queue this request
        return new Promise((resolve) => {
          requests.push((token) => {
            if (token) {
              config.headers.Authorization = `Bearer ${token}`
              resolve(serive(config))
            } else {
              resolve(Promise.reject(error))
            }
          })
        })
      }
    }

    return Promise.reject(error)
  }
)

export default serive
