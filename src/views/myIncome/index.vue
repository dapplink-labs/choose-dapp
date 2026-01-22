<template>
    <div class="myIncome">

        <BackHeaderNav :show-open-btn="true" />

        <div class="banner1">
            <div class="intro">
                <div class="intro-header">
                    <h1 class="intro-title">{{ currentNodeStakingInfo.name }}</h1>
                    <div class="intro-tag">{{ currentNodeStakingInfo.node_level }}</div>
                    <div class="intro-action-icon" @click="handleSwap">
                        <svg t="1766805327912" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="1596" width="20" height="20">
                            <path
                                d="M618.688 149.312l0 213.376L64 362.688 64 448l896 0L618.688 149.312zM405.312 874.688l0-213.376L960 661.312 960 576 64 576 405.312 874.688z"
                                fill="currentColor" p-id="1597"></path>
                        </svg>
                    </div>
                </div>
                <div class="intro-time">
                    <svg class="time-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                        viewBox="0 0 12 12">
                        <path
                            d="M75.818,69.818a6,6,0,1,1-6,6A6,6,0,0,1,75.818,69.818ZM75.66,72.66a.474.474,0,0,0-.474.474v2.842a.474.474,0,0,0,.474.474H78.5a.474.474,0,1,0,0-.947H76.134V73.134A.474.474,0,0,0,75.66,72.66Z"
                            transform="translate(-69.818 -69.818)" fill="currentColor" />
                    </svg>
                    <span class="time-text">
                        {{ $t('myIncome.purchaseTime') }}:
                        {{ Number(currentNodeStakingInfo.status) === 1 ? $t('computingPower.activating') :
                            formatDateTime(currentNodeStakingInfo.created) }}
                    </span>
                </div>
            </div>
        </div>
        <div class="income">


            <div class="box">
                <div class="item">
                    <b>{{ $t('myIncome.myIncomeCMT') }}</b>
                    <p>+{{ formatAmount(currentNodeStakingInfo.total_reward) }}</p>
                </div>
                <div class="item">
                    <b>{{ $t('myIncome.computingPowerIncomeCMT') }}</b>
                    <p>+{{ formatAmount(currentNodeStakingInfo.hashrate_reward) }}</p>
                </div>
                <div class="item">
                    <b>{{ $t('myIncome.networkIncomeCMT') }}</b>
                    <p>+{{ formatAmount(currentNodeStakingInfo.network_reward) }}</p>
                </div>
            </div>

            <!-- 赚取收益提示模块：使用通用跑马灯组件（type=3 展示收益样式） -->
            <ActivationMarquee :type="4" />

            <div class="pending-income-header">
                <h3 class="pending-title">{{ $t('myIncome.pendingIncome') }}</h3>
                <button class="record-link" type="button" @click="goToClaimRecord">
                    <span class="record-text">{{ $t('myIncome.claimRecord') }}</span>
                    <el-icon class="record-arrow">
                        <ArrowRightBold />
                    </el-icon>
                </button>
            </div>

            <div class="processDiv">
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill"
                            :style="{ width: (progressPercent < 4) ? 4 + '%' : progressPercent + '%' }"></div>
                        <div class="progress-indicator"
                            :style="{ left: (progressPercent < 4) ? 4 + '%' : progressPercent + '%' }">
                            <span class="indicator-text">{{ progressPercent }}%</span>
                        </div>
                    </div>
                </div>
                <div class="text">
                    <span>0 USDT</span>
                    <span>{{ formatAmount(currentNodeStakingInfo.forecast_income) }} USDT</span>
                </div>
            </div>

            <div class="earnings-grid">
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.staticIncomeCHO') }}</div>
                    <div class="earnings-value">{{ formatAmount(currentNodeStakingInfo.node_reward) }}</div>
                </div>
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.directReferralIncomeCHO') }}</div>
                    <div class="earnings-value">{{ formatAmount(currentNodeStakingInfo.direct_reward) }}</div>
                </div>
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.teamIncomeCHO') }}</div>
                    <div class="earnings-value">{{ formatAmount(currentNodeStakingInfo.team_reward) }}</div>
                </div>
                <!-- 创世节点 5% 收益：仅当当前节点为创世节点（例如 T6）时显示 -->
                <div class="earnings-item" v-if="currentNodeStakingInfo.node_level === 'T6'">
                    <div class="earnings-label">{{ $t('myIncome.genesisNodeIncomeCHO') }}</div>
                    <div class="earnings-value">{{ formatAmount(currentNodeStakingInfo.creation_reward) }}</div>
                </div>
                <!-- 超级节点收益：仅当当前节点为超级节点（例如 T5）时显示 -->
                <div class="earnings-item" v-if="currentNodeStakingInfo.node_level === 'T5'">
                    <div class="earnings-label">{{ $t('myIncome.superNodeIncomeCHO') }}</div>
                    <div class="earnings-value">{{ formatAmount(currentNodeStakingInfo.super_node_reward) }}</div>
                </div>
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.equalLevelIncomeCHO') }}</div>
                    <div class="earnings-value">{{ formatAmount(currentNodeStakingInfo.lateral_reward) }}</div>
                </div>
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.flowBonusIncomeCHO') }}</div>
                    <div class="earnings-value">{{ formatAmount(currentNodeStakingInfo.dividend_reward) }}</div>
                </div>
            </div>

            <button class="claim-all-btn" @click="openCollectEarnings">{{ $t('myIncome.claimAll') }}</button>
        </div>

        <!-- 我的团队模块 -->
        <div class="my-team">
            <div class="team-content">
                <div class="team-tabs">
                    <div :class="['tab-btn', { active: activeTab === 'direct' }]" @click="activeTab = 'direct'">
                        {{ $t('myNode.directAddress') }}
                    </div>
                    <div :class="['tab-btn', { active: activeTab === 'team' }]" @click="activeTab = 'team'">
                        {{ $t('myNode.teamAddress') }}
                    </div>
                </div>

                <div class="team-header">
                    <span class="invite-count"><span>{{ inviteCountLabel }}</span> {{ inviteCount
                    }}</span>
                </div>

                <!-- 层级树状图占位 -->
                <div class="team-tree-placeholder">
                    <TeamTree :type="activeTab === 'direct' ? 1 : 2" :node_type="1" :team_network_list="teamNetworkList" :direct_network_list="directNetworkList" />
                </div>

                <div class="team-list">
                    <div v-for="item in currentList" :key="item.address" class="team-item">
                        <div class="team-avatar">
                            <div class="avatar-content">
                                <img :src="item.avatar || avatarImg" alt="avatar" class="avatar-img" />
                            </div>
                        </div>
                        <div class="team-info-content">
                            <div class="team-info-row">
                                <div class="team-left-info">
                                    <div class="team-address-row">
                                        <span class="team-address">{{ item.address }}</span>
                                        <span v-if="item.nodeTag" class="team-node-tag">{{ item.nodeTag }}</span>
                                    </div>
                                    <!-- 直推地址列表：时间在地址下面 -->
                                    <div v-if="activeTab === 'direct'" class="team-time-direct">
                                        <span class="team-time">{{ item.activationTime }}</span>
                                    </div>
                                </div>
                                <div class="team-right-info">
                                    <span class="team-reward">+ {{ item.reward || '0' }} CHO</span>
                                </div>
                            </div>
                            <!-- 团队地址列表：显示Upline和时间 -->
                            <div v-if="activeTab === 'team'" class="team-upline-row">
                                <div class="team-upline-left">
                                    <span class="team-upline-label">{{ $t('myIncome.upline') }}:</span>
                                    <span class="team-upline-address">{{ item.upline || item.address }}</span>
                                </div>
                                <span class="team-time">{{ item.activationTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 我的节点弹窗 -->
        <TabNode v-model="showNodesModal" :nodes="myNodes" @select="handleNodeSelect" />

        <!-- 领取收益弹窗 -->
        <CollectEarnings ref="collectEarningsRef" @ReceiveSuccess="handleCollectSuccess" />

        <!-- 无节点提示弹窗 -->
        <transition name="fade">
            <div v-if="showNoNodeModal" class="no-node-overlay" @click.self="handleCloseNoNodeModal">
                <div class="no-node-card">
                    <h2 class="card-title">{{ $t('myIncome.noStakingNode') || '提示' }}</h2>
                    <p class="card-message">{{ $t('myIncome.noStakingNodeMessage') || '您还没有质押节点，请先质押节点后再查看收益' }}</p>
                    <button class="confirm-btn" @click="handleCloseNoNodeModal">
                        {{ $t('common.confirm') || '确定' }}
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue"
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import avatarImg from '@/assets/icon/avatar.png'
import avatarImg1 from '@/assets/icon/avatarImg1.png'
import avatarImg2 from '@/assets/icon/avatarImg2.png'
import avatarImg3 from '@/assets/icon/avatarImg3.png'
import avatarImg4 from '@/assets/icon/avatarImg4.png'
import avatarImg5 from '@/assets/icon/avatarImg5.png'
import TabNode from '@/components/TabNode.vue'
import CollectEarnings from '@/components/CollectEarnings.vue'
import TeamTree from '@/components/TeamTree.vue'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import ActivationMarquee from '@/components/ActivationMarquee.vue'
import { getNodeStakingInfo, getNodeStakingRecords, getMyTeamInfo } from '@/api/API'
import { useAccount } from '@wagmi/vue'
import { ArrowRightBold } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/format_date.js'
import { ElMessage } from 'element-plus'
import { formatUnits } from 'viem'


const router = useRouter()
const themeStore = useThemeStore()
const { t } = useI18n()
const { address } = useAccount()
// 我的团队相关数据（直推=direct，团队=team）
const activeTab = ref('direct')

// 邀请人数
const inviteCount = ref(0)
// 邀请列表
const inviteList = ref([])

// 团队网络列表
const teamNetworkList = ref([])
// 直推网络列表
const directNetworkList = ref([])

// 获取邀请列表：直推为 type=1，团队为 type=2
const getMyTeamInfoList = async () => {
    const type = activeTab.value === 'direct' ? 1 : 2
    const res = await getMyTeamInfo({ address: address.value, type, node_type: 1 })
    const data = res?.data?.data
    teamNetworkList.value = data.team_network_list
    directNetworkList.value = data.direct_network_list
    // data.direct_count为直推人数，data.team_count为团队人数
    inviteCount.value = activeTab.value === 'direct' ? data.direct_count : data.team_count
    const rawList = activeTab.value === 'direct' ? data.direct_team_list : data.team_list
    // 映射接口数据到模板需要的格式：
    // address(截取), created(时间戳) -> activationTime, total_reward -> reward, parent_address -> 上级地址
    inviteList.value = (rawList || []).map(item => ({
        address: shortAddress(item.address),
        activationTime: formatDateTime(item.created),
        reward: formatAmount(item.total_reward),
        avatar: getRandomAvatar(), // 使用随机头像
        // 接口字段 parent_address 为上级地址
        upline: shortAddress(item.parent_address || item.address)
    }))
}

// 根据当前tab显示对应的列表
const currentList = computed(() => inviteList.value || [])
// 根据当前tab显示对应的标签文本
const inviteCountLabel = computed(() => {
    return activeTab.value === 'direct'
        ? t('myNode.directAddressCount')
        : t('myNode.teamTotalAddressCount')
})

// 我的节点弹窗控制
const showNodesModal = ref(false)
const showNoNodeModal = ref(false)

// 我的节点数据
const myNodes = ref([])

const handleSwap = () => {
    // 打开我的节点弹窗
    showNodesModal.value = true
}

// 关闭无节点提示弹窗
const handleCloseNoNodeModal = () => {
    showNoNodeModal.value = false
    router.back()
}

// 领取收益弹窗引用
const collectEarningsRef = ref(null)

// 打开领取收益弹窗
const openCollectEarnings = () => {
    collectEarningsRef.value?.open()
}

// 领取收益成功后的回调
const handleCollectSuccess = () => {
    // 刷新当前节点质押信息
    fetchNodeStakingInfo()
}

// 当前节点质押信息
const currentNodeStakingInfo = ref({})

// 将数值格式化为带千分位的字符串（CHO为18精度，需要先转换）
const formatAmount = (value) => {
    if (!value || value === '0' || value === 0) return '0'
    try {
        // 将18精度的数值转换为正常数量
        let num = typeof value === 'bigint' || typeof value === 'string'
            ? parseFloat(formatUnits(BigInt(value.toString()), 18))
            : Number(value) / 1e18

        if (!Number.isFinite(num)) return '0'
        const fixed = num.toFixed(4)
        const trimmed = fixed.replace(/\.?0+$/, '')
        const [intPart, decimalPart] = trimmed.split('.')
        const intFormatted = Number(intPart).toLocaleString('en-US')
        return decimalPart ? `${intFormatted}.${decimalPart}` : intFormatted
    } catch (error) {
        console.error('格式化金额失败:', error, value)
        return '0'
    }
}

// 地址截取：前6位 + ... + 后4位
const shortAddress = (addr) => {
    if (!addr) return ''
    if (addr.length <= 12) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// 随机头像数组
const avatarImages = [avatarImg1, avatarImg2, avatarImg3, avatarImg4, avatarImg5]

// 随机选择头像
const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * avatarImages.length)
    return avatarImages[randomIndex]
}
const nodeTypeMap = {
    'T1': { nodeTag: 'T1', nodeNameKey: 'purchaseNodeRecord.informationNode' },
    'T2': { nodeTag: 'T2', nodeNameKey: 'myIncome.nodeNames.dataNode' },
    'T3': { nodeTag: 'T3', nodeNameKey: 'myIncome.nodeNames.validationNode' },
    'T4': { nodeTag: 'T4', nodeNameKey: 'myIncome.nodeNames.consensusNode' },
    'T5': { nodeTag: 'T5', nodeNameKey: 'myIncome.superNode' },
    'T6': { nodeTag: 'T6', nodeNameKey: 'myIncome.nodeNames.genesisNode' },
    '': { nodeTag: '', nodeNameKey: '未知节点' },
}

// 获取节点质押信息
const fetchNodeStakingInfo = async () => {
    if (!currentNodeStakingInfo.value.id) return
    const res = await getNodeStakingInfo({ address: address.value, id: currentNodeStakingInfo.value.id })
    const data = res?.data?.data?.staking_info || {}
    data.id = currentNodeStakingInfo.value.id
    data.name = t(nodeTypeMap[data.node_level]?.nodeNameKey || '')
    currentNodeStakingInfo.value = data
}

// 获取节点质押记录
const getNodeStakingRecordsList = async () => {
    const res = (await getNodeStakingRecords({ address: address.value }))?.data?.data?.list || []
    myNodes.value = res.map(item => {
        return {
            id: item.id,
            nodeName: t(nodeTypeMap[item.type]?.nodeNameKey || ''),
            nodeTag: nodeTypeMap[item.type]?.nodeTag || '',
            purchaseTime: formatDateTime(item.created),
            status: item.status
        }
    })
    if (myNodes.value.length > 0) {
        currentNodeStakingInfo.value.id = myNodes.value[0].id
        fetchNodeStakingInfo()
    } else {
        // 如果没有质押节点，显示确定弹窗提示用户并返回上一个页面
        showNoNodeModal.value = true
    }
}

// 进度条：总收益 / 预估收益
// 总收益 = 静态收益 + 直推收益 + 团队收益 + 平级收益 + 流水分红
// 如果当前节点是创世节点（T6），还要加上创世节点5%收益
// 如果当前节点是超级节点（T5），还要加上超级节点收益
// 预估收益 = forecast_income
// 静态收益 = node_reward
// 直推收益 = direct_reward
// 团队收益 = team_reward
// 平级收益 = lateral_reward
// 流水分红 = dividend_reward
// 创世节点5%收益 = creation_reward
// 超级节点收益 = super_node_reward
const progressPercent = computed(() => {
    const info = currentNodeStakingInfo.value
    // 基础收益
    let total = Number(info.node_reward ?? 0) +
        Number(info.direct_reward ?? 0) +
        Number(info.team_reward ?? 0) +
        Number(info.lateral_reward ?? 0) +
        Number(info.dividend_reward ?? 0)

    // 如果是创世节点（T6），加上创世节点5%收益
    if (info.node_level === 'T6') {
        total += Number(info.creation_reward ?? 0)
    }

    // 如果是超级节点（T5），加上超级节点收益
    if (info.node_level === 'T5') {
        total += Number(info.super_node_reward ?? 0)
    }

    const target = Number(info.forecast_income ?? 0)
    if (!target || !Number.isFinite(total) || !Number.isFinite(target)) return 0
    const ratio = (total / target) * 100
    return Math.max(0, Math.min(100, Math.round(ratio)))
})

// 切换节点
const handleNodeSelect = (id) => {
    if (!id) return
    currentNodeStakingInfo.value.id = id
    fetchNodeStakingInfo()
}

const goToClaimRecord = () => {
    router.push('/claim-record')
}
// 初始化主题
onMounted(() => {
    themeStore.applyTheme()
    getNodeStakingRecordsList()
    getMyTeamInfoList()
})

// 监听 tab 切换，重新请求对应的邀请列表（直推/团队）
watch(activeTab, () => {
    getMyTeamInfoList()
})
</script>

<style scoped lang="scss">
.theme-light {
    .progress-fill {
        background-color: #2B6C18 !important;
    }

    .progress-indicator {
        background-color: #2B6C18 !important;
        border: 2px solid #FFFFFF !important;
    }

    .claim-all-btn {
        background-color: #2B6C18 !important;
    }

    .avatar-content {
        border: 2px solid #2B6C18 !important;
    }
}

.theme-dark {
    .myIncome {
        .earn-prompt {
            background: #1D1D1D !important;
        }
    }

    .progress-bar {
        background: #2F2F2F !important;
    }
}

.myIncome {
    min-height: 100vh;
    padding: 80px 10px 0 10px;
    background-color: var(--bg-page-h5, #FCFCFC);
    color: var(--text-color, #1a1a1a);
    transition: background-color 0.3s ease, color 0.3s ease;
    box-sizing: border-box;

    &::after {
        background: url("../../assets/images/banner1.png");
        background-size: cover;
        background-repeat: no-repeat;
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 230px;
        z-index: 1;
    }

    .banner1 {
        flex-direction: column;
        display: flex;
        height: 100%;
        /* 或 height: 100vh */
        justify-content: space-between;
        z-index: 999;
        position: relative;

    }


    .intro {
        position: relative;
        margin-bottom: 22px;
        overflow: hidden;

        .intro-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;

            .intro-title {
                font-family: Noto Sans SC, Noto Sans SC;
                font-weight: bold;
                font-size: 28px;
                color: var(--text-color, #000000);
            }

            .intro-tag {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 3px 10px;
                background: rgba(234, 171, 74, 0.2);
                color: #EAAB4A;
                border-radius: 6px;
                font-family: Noto Sans SC, Noto Sans SC;
                font-weight: 600;
                font-size: 14px;
                line-height: 1.2;
            }

            .intro-action-icon {
                width: 20px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-color, #FFFFFF);
                cursor: pointer;
                transition: color 0.3s ease, opacity 0.3s ease;

                &:hover {
                    opacity: 0.7;
                }

                svg {
                    width: 100%;
                    height: 100%;
                }
            }
        }

        .intro-time {
            display: flex;
            align-items: center;
            gap: 8px;

            .time-icon {
                width: 16px;
                height: 16px;
                color: var(--text-color, #FFFFFF);
                flex-shrink: 0;
                font-size: 16px;
                transition: color 0.3s ease;
            }

            .time-text {
                font-family: PingFang SC, PingFang SC;
                font-weight: 400;
                font-size: 14px;
                color: var(--text-color, #FFFFFF);
                opacity: 0.8;
            }
        }
    }


    .income {
        margin-bottom: 38px;
        z-index: 999;
        position: relative;

        .pending-income-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 16px 0;

            .pending-title {
                font-size: 20px;
                color: var(--text-color, #FFFFFF);
                font-weight: 600;
                transition: color 0.3s ease;
            }

            .record-link {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                border: none;
                background: transparent;
                padding: 0;
                font-family: PingFang SC, PingFang SC;
                font-size: 14px;
                color: var(--text-color, #FFFFFF);
                opacity: 0.8;
                cursor: pointer;
            }

            .record-arrow {
                font-size: 14px;
                color: inherit; // 继承文字颜色，适配明暗主题
            }
        }

        .processDiv {
            margin-bottom: 24px;

            .progress-bar-container {
                position: relative;
                width: 100%;
            }

            .progress-bar {
                position: relative;
                width: 100%;
                height: 12px;
                background-color: #e0e0e0;
                border-radius: 10px;
                overflow: visible;
            }

            .progress-fill {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background-color: var(--text-color-y, #BBFF2E);
                border-radius: 10px;
                transition: width 0.3s ease;
            }

            .progress-indicator {
                position: absolute;
                top: 50%;
                transform: translate(-50%, -50%);
                height: 18px;
                padding: 0 5px;
                background-color: var(--text-color-y, #BBFF2E);
                border-radius: 999px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                border: 2px solid #8ED300;

                .indicator-text {
                    font-size: 12px;
                    color: var(--bg-page-h5, #FFFFFF);
                }
            }

            .text {
                margin-top: 8px;
                display: flex;
                justify-content: space-between;
                align-content: center;
                font-weight: 600;
                font-size: 12px;
                color: var(--text-dark-gray, #999999);
                transition: color 0.3s ease;
            }
        }

        .earnings-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
        }

        .earnings-item {
            display: flex;
            flex-direction: column;
            background: transparent;
            border-radius: 8px;

            .earnings-label {
                font-size: 11px;
                color: var(--text-dark-gray, #999999);
                margin-bottom: 8px;
                font-weight: 400;
            }

            .earnings-value {
                font-size: 20px;
                color: var(--text-color, #000000);
                font-weight: bold;
            }
        }

        .claim-all-btn {
            width: 100%;
            height: 48px;
            background: var(--text-color-y, #BBFF2E);
            border-radius: 999px;
            border: none;
            outline: none;
            font-weight: 600;
            font-size: 16px;
            color: var(--bg-page, #FCFCFC);
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 24px;
        }


        .earn-prompt {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: #F4F4F4;
            border-radius: 999px;
            margin-bottom: 24px;
            transition: all 0.3s ease;

            .earn-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--text-color-y, #BBFF2E);
                border-radius: 4px;
                color: #000000;
                flex-shrink: 0;
            }

            .earn-text {
                font-size: 14px;
                color: var(--text-color, #000000);
                flex: 1;

                .earn-amount {
                    color: var(--text-color-y, #BBFF2E);
                    font-weight: 600;
                }
            }
        }

        .box {
            margin-top: 0px;
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 26px;

            .item {
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                transition: background-color 0.3s ease, transform 0.2s ease;

                b {
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 400;
                    font-size: 14px;
                    color: var(--text-dark-gray, #999999);
                    transition: color 0.3s ease;
                    margin-bottom: 10px;
                }

                p {
                    font-family: DIN, DIN;
                    font-weight: bold;
                    font-size: 24px;
                    color: #2FBC87;
                    text-align: center;
                }
            }
        }

    }

    .my-team {
        margin-top: 40px;
        margin-bottom: 38px;
        position: relative;
        z-index: 999;

        .team-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            .invite-count {
                font-family: PingFang SC, PingFang SC;
                font-weight: 400;
                font-size: 14px;
                color: var(--text-color, #1a1a1a);
                transition: color 0.3s ease;

                span {
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 400;
                    font-size: 14px;
                    color: var(--text-color-tabBtn, #999999);
                }
            }

            .search-icon {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #999999;
                transition: all 0.3s ease;

                &:hover {
                    opacity: 0.7;
                }

                svg {
                    width: 100%;
                    height: 100%;
                }
            }
        }

        .team-tree-placeholder {
            width: 100%;
            height: 400px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            margin-bottom: 16px;
            overflow: hidden;
        }

        .team-content {
            width: 100%;
        }

        .team-tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;

            .tab-btn {
                height: 36px;
                font-family: PingFang SC, PingFang SC;
                font-weight: 600;
                font-size: 20px;
                color: #909090;
                cursor: pointer;
                transition: all 0.3s ease;

                &.active {
                    color: var(--text-color, #1a1a1a);
                    font-weight: 700;
                }
            }
        }

        .team-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: all 0.3s ease;
            border-radius: 12px;
            border: 1px solid #F3F3F3;

            .team-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 12px;

                .team-avatar {
                    position: relative;
                    width: 48px;
                    height: 48px;
                    flex-shrink: 0;

                    .avatar-content {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        overflow: hidden;
                        border: 2px solid var(--text-color-y, #BBFF2E);

                        .avatar-img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            border: 1px solid var(--bg-page-h5, #FFFFFF);
                            image-rendering: pixelated;
                            box-sizing: border-box;
                        }
                    }
                }

                .team-info-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;

                    .team-info-row {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;

                        .team-left-info {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                            flex: 1;

                            .team-address-row {
                                display: flex;
                                align-items: center;
                                gap: 8px;

                                .team-address {
                                    font-family: PingFang SC, PingFang SC;
                                    font-weight: 400;
                                    font-size: 14px;
                                    color: var(--text-color, #1a1a1a);
                                    transition: color 0.3s ease;
                                }

                                .team-node-tag {
                                    display: inline-block;
                                    padding: 2px 8px;
                                    background: rgba(234, 171, 74, 0.1);
                                    color: #EAAB4A;
                                    border-radius: 4px;
                                    font-family: PingFang SC, PingFang SC;
                                    font-weight: 500;
                                    font-size: 12px;
                                    line-height: 1.2;
                                }
                            }

                            .team-time-direct {
                                .team-time {
                                    font-family: PingFang SC, PingFang SC;
                                    font-weight: 400;
                                    font-size: 12px;
                                    color: #999999;
                                }
                            }
                        }

                        .team-right-info {
                            display: flex;
                            align-items: center;

                            .team-reward {
                                font-family: PingFang SC, PingFang SC;
                                font-weight: 500;
                                font-size: 14px;
                                color: #2EBE69;
                            }
                        }
                    }

                    .team-upline-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        .team-upline-left {
                            display: flex;
                            align-items: center;
                            gap: 4px;

                            .team-upline-label {
                                font-family: PingFang SC, PingFang SC;
                                font-weight: 400;
                                font-size: 12px;
                                color: #999999;
                            }

                            .team-upline-address {
                                font-family: PingFang SC, PingFang SC;
                                font-weight: 400;
                                font-size: 12px;
                                color: #999999;
                            }
                        }

                        .team-time {
                            font-family: PingFang SC, PingFang SC;
                            font-weight: 400;
                            font-size: 12px;
                            color: #999999;
                        }
                    }
                }
            }
        }
    }
}

.theme-dark .myIncome {
    .cps-card-header {

        .back-btn,
        .record-btn,
        .open-btn {
            color: #FFFFFF !important;
        }
    }

    .intro {
        .intro-header {
            .intro-action-icon {
                color: #FFFFFF !important;
            }
        }

        .intro-time {
            .time-icon {
                color: #FFFFFF !important;
            }
        }
    }

    .my-team {
        .team-tree-placeholder {
            background: rgba(255, 255, 255, 0.05) !important;
            color: #999999 !important;
        }

        .team-list {
            background: #121212 !important;
            border: none;
            padding: 23px 0;
        }

        .team-item {
            .team-info-content {
                .team-info-row {
                    .team-left-info {
                        .team-address-row {
                            .team-address {
                                color: #FFFFFF !important;
                            }
                        }

                        .team-time-direct {
                            .team-time {
                                color: #999999 !important;
                            }
                        }
                    }

                    .team-right-info {
                        .team-reward {
                            color: #2EBE69 !important;
                        }
                    }
                }

                .team-upline-row {
                    .team-upline-left {

                        .team-upline-label,
                        .team-upline-address {
                            color: #999999 !important;
                        }
                    }

                    .team-time {
                        color: #999999 !important;
                    }
                }
            }
        }
    }
}

// 无节点提示弹窗样式
.no-node-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(6px);
}

.no-node-card {
    width: 90%;
    max-width: 420px;
    background: var(--bg-page, #ffffff);
    border-radius: 22px;
    padding: 28px 24px 32px;
    box-sizing: border-box;
    box-shadow: 0 16px 70px rgba(0, 0, 0, 0.55);
    border: 1px solid var(--border-color, #e6e6e6);
    transition: background-color 0.3s ease, border-color 0.3s ease;
}


.card-title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-color, #1f1f1f);
    text-align: center;
    transition: color 0.3s ease;
}

.card-message {
    margin: 0 0 28px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-secondary, #666666);
    text-align: center;
    transition: color 0.3s ease;
}

.confirm-btn {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: var(--text-color-y);
    color: #0a0a0a;
    box-shadow: 0 12px 30px rgba(180, 255, 40, 0.28);
    transition: transform 0.15s ease, opacity 0.2s ease;

    &:active {
        transform: scale(0.98);
    }

    &:hover {
        opacity: 0.9;
    }
}

// 弹窗过渡动画
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

// 深色主题适配
.theme-dark {
    .no-node-overlay {
        background-color: rgba(0, 0, 0, 0.7);
    }

    .no-node-card {
        background: linear-gradient(180deg, #111111 0%, #0b0b0b 100%);
        border-color: #1d1d1d;
    }


    .card-title {
        color: #f6f6f6;
    }

    .card-message {
        color: #8a8a8a;
    }
}

// 浅色主题适配
.theme-light {
    .no-node-overlay {
        background-color: rgba(0, 0, 0, 0.35);
    }

    .no-node-card {
        background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
        border-color: #e6e6e6;
    }


    .card-title {
        color: #1f1f1f;
    }

    .card-message {
        color: #666666;
    }
}
</style>