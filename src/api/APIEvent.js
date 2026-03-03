import request from '@/utils/requestEvent'

// 获取首页轮播图
export const getHomeBanner = (data) => {
    return request.post('/api/v1/banner/list', data)
}