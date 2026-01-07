import request from '@/utils/request'
const URL = 'http://172.18.1.153:8082';

// 注册接口
export const register = (data) => {
    return request.post(`${URL}/api/v1/staking/addressIsExist`, data)
}
