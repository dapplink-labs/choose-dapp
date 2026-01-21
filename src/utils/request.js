import axios from "axios"

// 根据环境变量设置 baseURL
// 开发环境：使用相对路径，由 vite proxy 处理
// 生产环境：如果配置了 VITE_API_BASE_URL，使用该值；否则使用相对路径（需要 nginx 代理）
// const getBaseURL = () => {
//   // 如果配置了环境变量，优先使用环境变量
//   if (import.meta.env.VITE_API_BASE_URL) {
//     return import.meta.env.VITE_API_BASE_URL
//   }
//   // 生产环境且没有配置 baseURL，使用相对路径（需要 nginx 代理）
//   if (import.meta.env.PROD) {
//     return '' // 使用相对路径，依赖 nginx 反向代理
//   }
//   // 开发环境使用相对路径，由 vite proxy 处理
//   return ''
// }

// create an axios instance
const serive = axios.create({
  baseURL: 'https://choapi.roothashpay.com',
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000  // request timeout (30 seconds)
})
// 添加请求头
// serive.interceptors.request.use((config) => {
//   config.headers = config.headers || {}
//   config.headers.address = localStorage.getItem('address') || ''
//   return config
// })
// serive.interceptors.request.use((config) => {
//   config.headers = config.headers || {}

//   // 只有存在 address 才传
//   const address = localStorage.getItem('address')
//   if (address) {
//     config.headers.address = address
//   }

//   return config
// })
// Add a request interceptor
// serive.interceptors.request.use((config)=> {
//     // Do something before request is sent
//     config.headers['address'] = localStorage.getItem('address') || ''

//     // 禁用请求缓存 - 确保联调时不会使用缓存
//     config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
//     config.headers['Pragma'] = 'no-cache'
//     config.headers['Expires'] = '0'

//     if(config.method === 'post'){
//       if(!config.data){
//         config.data = {}
//       }
//       // config.data.language = localStorage.getItem('language') || 'zh'
//     }else if(config.method === 'get'){
//       if(!config.params){
//         config.params = {}
//       }
//       // config.params.language = localStorage.getItem('language') || 'zh'
//       // GET 请求添加时间戳参数，防止缓存
//       config.params = {
//         ...config.params,
//         _t: Date.now()
//       }
//     }

//     return config
//   }, error=>{
//     // Do something with request error
//     return Promise.reject(error);
//   });

// Add a response interceptor
// serive.interceptors.response.use(function (response) {
//     // Any status code that lie within the range of 2xx cause this function to trigger
//     // Do something with response data
//     return response
//   }, function (error) {
//     // Any status codes that falls outside the range of 2xx cause this function to trigger
//     // Do something with response error
//     // var state = error.response
//     // if(state===404){

//     // }else if (state===500) {

//     // }else if (state===502) {

//     // }
//     return Promise.reject(error);
//   });

export default serive
