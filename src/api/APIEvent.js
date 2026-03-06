import request from '@/utils/requestEvent'

// 获取首页轮播图
export const getHomeBanner = (data) => {
  return request.post('/api/v1/banner/list', data)
}

// 获取分类列表数据
export const getCategoryList = (data) => {
  return request.post('/api/v1/category/list', data)
}

// 获取生态列表
export const getEcosystemList = (data) => {
  return request.post('/api/v1/ecosystem/list', data)
}

// 获取事件列表
export const getEventList = (data) => {
  return request.post('/api/v1/eventDetail/list', data)
}

// 获取单个或批量事件详情
export const getEventDetailItem = (data) => {
  return request.post('/api/v1/eventDetail/item', data)
}

// 获取事件活动记录
export const getEventActivity = (data) => {
  return request.post('/api/v1/event/activity', data)
}

// 获取事件持仓排行榜
export const getEventTopHolders = (data) => {
  return request.post('/api/v1/event/topHolders', data)
}

// 获取事件评论列表
export const getEventCommentList = (data) => {
  return request.post('/api/v1/eventComment/list', data)
}

// 获取事件价格/概率历史
export const getEventPriceHistory = (data) => {
  return request.post('/api/v1/event/price-history', data)
}

// 获取子事件详情（包含方向选项）
export const getSubEventDetail = (data) => {
  return request.post('/api/v1/subEventDetail/list', data)
}

// 获取订单簿（买单 + 卖单）
export const getOrderBook = (data) => {
  return request.post('/api/v1/order/book', data)
}

// 获取用户余额
export const getUserBalances = (data) => {
  return request.post('/api/v1/user/balances', data)
}

// 市价买入预查询
export const previewBuyOrder = (data) => {
  return request.post('/api/v1/order/preview/buy', data)
}

// 市价卖出预查询
export const previewSellOrder = (data) => {
  return request.post('/api/v1/order/preview/sell', data)
}

// 创建订单（市价单/限价单）
export const makeOrder = (data) => {
  return request.post('/api/v1/order/make', data)
}

// 用户登录接口 - 使用死数据登录
export const userLogin = () => {
  return request.post('/api/v1/login', {
    login_type: 'password',
    email: 'hg01@example.com',
    password: '123456'
  })
}