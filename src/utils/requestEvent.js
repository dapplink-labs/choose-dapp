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

    // 只有存在 address 才传
    // const address = localStorage.getItem('address')
    // if (address) {
    //   config.headers.address = address
    // }

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



    return Promise.reject(error)
  }
)

export default serive
