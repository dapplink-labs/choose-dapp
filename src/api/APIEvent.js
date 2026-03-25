import request from '@/utils/requestEvent'

// 获取首页轮播图
export const getHomeBanner = (data) => {
  return request.post('/api/v1/banner/list', data)
}
// 获取资产列表
export const getAssetList = (data) => {
    return request.post('/api/v1/asset/list', data)
}

// 用户提现
export const userWithdraw = (data) => {
    return request.post('/api/v1/user/withdraw', data)
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

// 获取收藏列表
export const getFavoriteList = (data) => {
  return request.post('/api/v1/favorite/list', data)
}

// 切换收藏状态
export const toggleFavoriteEvent = (data) => {
  return request.post('/api/v1/favorite/toggle', data)
}

// 获取事件时间段列表（支持分类筛选）
export const getPeriodList = (data) => {
  return request.post('/api/v1/period/list', data)
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

// 取消挂单（委托单撤销）
export const cancelOrder = (data) => {
  return request.post('/api/v1/order/cancel', data)
}

// Claim 操作（单边赎回）
export const claimOrder = (data) => {
  return request.post('/api/v1/order/claim', data)
}

// 获取用户挂单列表（委托仓位）
export const getOpenOrders = (data) => {
  return request.post('/api/v1/order/open', data)
}

// 获取用户盈亏数据（用于图表展示）
// user_guid 或 address 二选一必填，range: 1d/1w/1m/all
export const getUserPnl = (data) => {
  return request.post('/api/v1/user/pnl', data)
}

// 获取用户统计摘要（包括持仓价值、最大盈利、预测次数等）
// user_guid 或 address 二选一必填
export const getUserStat = (data) => {
  return request.post('/api/v1/user/stat', data)
}

// 获取历史订单（历史仓位）
export const getOrderHistory = (data) => {
  return request.post('/api/v1/order/history', data)
}

// 获取账单/资金流水（充值+提现）
export const getFundsHistory = (data) => {
  return request.post('/api/v1/user/funds-history', data)
}

// 获取资金变动记录（账单）
export const getTransactionHistory = (data) => {
  return request.post('/api/v1/user/transaction-history', data)
}

// 获取用户持仓
export const getUserPositions = (data) => {
  return request.post('/api/v1/user/positions', data)
}

// 法币提现（出金）
export const fiatWithdraw = (data) => {
  return request.post('/api/v1/user/fiat/withdraw', data)
}

// 用户登录接口 - 钱包地址登录
export const userLogin = (data) => {
  return request.post('/api/v1/user/login', data)
}