import request from '@/utils/request'

// 注册接口 - 使用代理路径避免跨域问题
export const register = (data) => {
    return request.get('/staking-api/api/v1/staking/addressIsExist', { params: data })
}

// 绑定邀请码接口 - 使用代理路径避免跨域问题
export const bindInviteCode = (data) => {
    return request.post('/staking-api/api/v1/staking/bindInvitationCode', data)
}

// 分布节点与集群节点数据
export const getNodeServiceProviders = (data) => {
    return request.get('/staking-api/api/v1/staking/nodeServiceProviders', { params: data })
}

// 质押节点列表
export const getNodeStakingList = () => {
    return request.get('/staking-api/api/v1/staking/nodeStakingList')
}

// 获取质押节点记录
export const getNodeStakingRecords = (data) => {
    return request.get('/staking-api/api/v1/staking/nodeStakingRecords', { params: data })
}

// 获取算力服务商激活消息
export const getNodeAndNodeServiceRecordNew = (data) => {
    return request.get('/staking-api/api/v1/staking/nodeAndNodeServiceRecordNew', { params: data })
}

// 获取算力服务商节点详情金额信息
export const getNodeServiceProvidersInfo = (data) => {
    return request.get('/staking-api/api/v1/staking/nodeServiceProvidersInfo', { params: data })
}

// 获取质押信息
export const getNodeStakingInfo = (data) => {
    return request.get('/staking-api/api/v1/staking/nodeStakingInfo', { params: data })
}