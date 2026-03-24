import axios from "axios"

// 根据环境变量设置 baseURL
// 开发环境：使用相对路径，由 vite proxy 处理
// 生产环境：如果配置了 VITE_API_BASE_URL_EVENT，使用该值；否则使用相对路径（需要 nginx 代理）
const getBaseURL = () => {
  // 如果配置了环境变量，优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL_EVENT) {
    return import.meta.env.VITE_API_BASE_URL_EVENT
  }
  // 生产环境且没有配置 baseURL，使用相对路径（需要 nginx 代理）
  if (import.meta.env.PROD) {
    return '' // 使用相对路径，依赖 nginx 反向代理
  }
  // 开发环境使用相对路径，由 vite proxy 处理
  return ''
}

// function safeParseSignatureInfo() {
//   try {
//     const raw = window.sessionStorage.getItem('signatureInfo')
//     if (!raw) return null
//     return JSON.parse(raw)
//   } catch (e) {
//     return null
//   }
// }

// create an axios instance
const serive = axios.create({
  baseURL: getBaseURL(),
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000, // request timeout (30 seconds)
})
// 添加请求头
serive.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  config.headers["X-Signature-Message"] = JSON.parse(window.sessionStorage.getItem('signatureInfo')).timestamp || ''
  config.headers["X-Signature"] = JSON.parse(window.sessionStorage.getItem('signatureInfo')).signature || ''
  return config
})
// // 事件接口专用拦截器：走反代理并附带签名 + 授权
// serive.interceptors.request.use(
//   (config) => {
//     config.headers = config.headers || {}

//     // 签名信息（如果存在）
//     const signatureInfo = safeParseSignatureInfo()
//     if (signatureInfo?.timestamp) config.headers["X-Signature-Message"] = signatureInfo.timestamp
//     if (signatureInfo?.signature) config.headers["X-Signature"] = signatureInfo.signature

//     // 只有存在 address 才传
//     // const address = localStorage.getItem('address')
//     // if (address) {
//     //   config.headers.address = address
//     // }

//     // 禁用缓存 & GET 请求增加时间戳
//     config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
//     config.headers['Pragma'] = 'no-cache'
//     config.headers['Expires'] = '0'

//     if (config.method === 'get') {
//       config.params = {
//         ...(config.params || {}),
//         _t: Date.now(),
//       }
//     }

//     return config
//   },
//   (error) => Promise.reject(error),
// )



export default serive
