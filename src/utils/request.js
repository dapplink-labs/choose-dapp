import axios from "axios"
// create an axios instance
const serive = axios.create({
    //  baseURL:"https://bridge-api-testnet.cpchain.com/", // url = base url + request url
    withCredentials: true, // send cookies when cross-domain requests
    timeout: 30000  // request timeout (30 seconds)
  })
// Add a request interceptor
serive.interceptors.request.use((config)=> {
    // Do something before request is sent
    config.headers['token'] = localStorage.getItem('token') || ''
    
    // 禁用请求缓存 - 确保联调时不会使用缓存
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    config.headers['Pragma'] = 'no-cache'
    config.headers['Expires'] = '0'
    
    if(config.method === 'post'){
      if(!config.data){
        config.data = {}
      }
      // config.data.language = localStorage.getItem('language') || 'zh'
    }else if(config.method === 'get'){
      if(!config.params){
        config.params = {}
      }
      // config.params.language = localStorage.getItem('language') || 'zh'
      // GET 请求添加时间戳参数，防止缓存
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
  
    return config
  }, error=>{
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
serive.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // var state = error.response
    // if(state===404){
     
    // }else if (state===500) {
    
    // }else if (state===502) {
      
    // }
    return Promise.reject(error);
  });
  
  export default serive
