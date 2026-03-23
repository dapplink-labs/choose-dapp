import request from '@/utils/request'

// 注册接口 - 使用代理路径避免跨域问题
export const register = (data) => {
    return request.get('/api/v1/staking/addressIsExist', { params: data })
}

// 绑定邀请码接口 - 使用代理路径避免跨域问题
export const bindInviteCode = (data) => {
    return request.post('/api/v1/staking/bindInvitationCode', data)
}

// 分布节点与集群节点数据
export const getNodeServiceProviders = (data) => {
    return request.get('/api/v1/staking/nodeServiceProviders', { params: data })
}

// 质押节点列表
export const getNodeStakingList = (data) => {
    return request.get('/api/v1/staking/nodeStakingList', { params: data })
}

// 获取质押节点记录
export const getNodeStakingRecords = (data) => {
    return request.get('/api/v1/staking/nodeStakingRecords', { params: data })
}

// 获取节点服务商的激活记录
export const getNodeServiceProviderRecords = (data) => {
    return request.get('/api/v1/staking/nodeServiceProviderRecords', { params: data })
}

// 获取算力服务商激活消息
export const getNodeAndNodeServiceRecordNew = (data) => {
    return request.get('/api/v1/staking/nodeAndNodeServiceRecordNew', { params: data })
}

// 获取算力服务商节点详情金额信息
export const getNodeServiceProvidersInfo = (data) => {
    return request.get('/api/v1/staking/nodeServiceProvidersInfo', { params: data })
}

// 获取质押信息
export const getNodeStakingInfo = (data) => {
    return request.get('/api/v2/staking/stakingIncome', { params: data })
}

// 购买节点
export const purchaseNode = (data) => {
    return request.post('/api/v1/staking/nodeServiceProvidersActivate', data)
}

// 质押节点激活
export const nodeStakingActivate = (data) => {
    return request.post('/api/v1/staking/nodeStakingActivate', data)
}

// 获取邀请列表
export const getMyTeamInfo = (data) => {
    return request.get('/api/v1/staking/myTeamInfo', { params: data })
}

// 节点服务商收益领取记录
export const getNodeServiceProviderRewardRecords = (data) => {
    return request.get('/api/v1/staking/nodeServiceProviderRewardRecords', { params: data })
}

// 质押节点收益领取记录
export const getNodeStakingRewardRecords = (data) => {
    return request.get('/api/v1/staking/nodeStakingRewardRecords', { params: data })
}

// 节点收益领取
export const nodeclaimReward = (data) => {
    return request.post('/api/v1/node/claimReward', data)
}

//质押节点收益领取
export const stakingclaimReward = (data) => {
    return request.post('/api/v1/staking/claimReward', data)
}

// 我的收益接口
export const getMyIncome = (data) => {
    return request.get('/api/v2/person/myIncome', { params: data })
}

// 获取公告接口
export const getNoticeData = (data) => {
    return request.get('/api/v2/announcement/latestAnnouncement', { params: data })
}

// 记录公告已读接口
export const markAnnouncementAsRead = (data) => {
    return request.post('/api/v2/announcement/read', data)
}

// 获取首页轮播图
export const getHomeBanner = (data) => {
    return request.get('/api/v1/banner/list', { params: data })
}

