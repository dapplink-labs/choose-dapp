import request from '@/utils/requestEvent'

// 获取首页轮播图
export const getHomeBanner = (data) => {
    return request.get('/api/v1/banner/list', { params: data })
}