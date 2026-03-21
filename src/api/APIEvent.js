import request from '@/utils/requestEvent'

// 获取首页轮播图
export const getHomeBanner = (data) => {
    return request.post('/api/v1/banner/list', data)
}
// 获取资产列表
export const getAssetList = (data) => {
    return request.post('/api/v1/asset/list', data)
}

// 获取用户余额
export const getUserBalances = (data) => {
    return request.post('/api/v1/user/balances', data)
}

// 用户提现
export const userWithdraw = (data) => {
    return request.post('/api/v1/user/withdraw', data)
}