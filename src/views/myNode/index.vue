<template>
    <div class="myNode">


        <BackHeaderNav :show-open-btn="true" />

        <div class="banner1">
            <h1 class="page-title">{{ nodeType === 0 ? $t('myNode.distributedNode') : $t('myNode.clusterNode') }}</h1>
        </div>
        <div class="cps-bg"></div>

        <div class="income">
            <div class="box">
                <div class="item">
                    <b>{{ $t('myNode.choIncome') }}</b>
                    <p>{{ formatAmount(choIncome) }}</p>
                </div>
                <div class="item">
                    <b>{{ $t('myNode.subCoinIncome') }}</b>
                    <p>{{ formatAmount(subCoinIncome) }}</p>
                </div>
            </div>

            <ActivationMarquee :type="3" />

            <div class="pending-income-header">
                <h3 class="pending-title">
                    <span>{{ $t('myNode.pendingIncome') }}</span>

                    <el-icon size="16" style="margin-top: 5px;" @click="showInfo" :color="'var(--text-color)'">
                        <QuestionFilled />
                    </el-icon>
                </h3>
                <button class="record-link" type="button" @click="goToClaimRecord">
                    <span class="record-text">{{ $t('myNode.claimRecord') }}</span>
                    <el-icon class="record-arrow">
                        <ArrowRightBold />
                    </el-icon>
                </button>
            </div>
            <div class="pending-income-grid">
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.nodeIncome') }}</div>
                    <div class="income-value">{{ formatAmount(nodeIncome) }}</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.networkFeeIncome') }}</div>
                    <div class="income-value">{{ formatAmount(networkFeeIncome) }}</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.subCoinFeeIncome') }}</div>
                    <div class="income-value">{{ formatAmount(subCoinFeeIncome) }}</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.secondaryMarketIncome') }}</div>
                    <div class="income-value">{{ formatAmount(secondaryMarketIncome) }}</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.directReferralIncome') }}</div>
                    <div class="income-value">{{ formatAmount(directReferralIncome) }}</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.networkIncome') }}</div>
                    <div class="income-value">{{ formatAmount(teamIncome) }}</div>
                </div>
            </div>

            <!-- 一键领取按钮：凌晨 2-3 点禁止领取，显示“收益计算中” -->
            <button
                class="claim-all-btn"
                :disabled="claimLoading || isClaimDisabledByTime"
                @click="handleClaimReward"
            >
                {{
                    isClaimDisabledByTime
                        ? $t('myIncome.calculating')
                        : (claimLoading ? loadingText : $t('myNode.claimAll'))
                }}
            </button>

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
                    <span class="invite-count">
                        <span>{{ activeTab === 'direct' ? $t('myNode.directEffectiveCount') :
                            $t('myNode.teamEffectiveCount') }}</span>
                        {{ effectiveCount }}
                    </span>
                    <span class="invite-count">
                        <span>{{ activeTab === 'direct' ? $t('myNode.directIneffectiveCount') :
                            $t('myNode.teamIneffectiveCount') }}</span>
                        {{ ineffectiveCount }}
                    </span>
                </div>

                <!-- 层级树状图占位 -->
                <div class="team-tree-placeholder">
                    <TeamTree :type="activeTab === 'direct' ? 1 : 2" :node_type="2" :team_network_list="teamNetworkList"
                        :direct_network_list="directNetworkList" />
                </div>

                <div class="team-list" v-if="currentList.length > 0">
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
        <detailsinfo ref="detailsRef" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'
import Message from '@/utils/message'
import { useAccount, useChainId } from '@wagmi/vue'
import { switchChain } from '@wagmi/core'
import { config } from '../../wagmi.ts'
import nodeManagerABI from '@/assets/abi/nodeManagerABI.json'
import networks from '@/assets/json/networks.json'
import { writeContractOptimized, computedGas } from '@/utils/requestWEB3.js'
import avatarImg from '@/assets/icon/avatar.png'
import TeamTree from "@/components/TeamTree.vue"
import detailsinfo from "./detailsinfo.vue"
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import ActivationMarquee from '@/components/ActivationMarquee.vue'
import { ArrowRightBold } from '@element-plus/icons-vue'
import { getNodeServiceProvidersInfo, getMyTeamInfo, nodeclaimReward } from '@/api/API'
import { formatDateTime } from '@/utils/format_date.js'
import { formatChoAmount } from '@/utils/format_amount'
import avatarImg1 from '@/assets/icon/avatarImg1.png'
import avatarImg2 from '@/assets/icon/avatarImg2.png'
import avatarImg3 from '@/assets/icon/avatarImg3.png'
import avatarImg4 from '@/assets/icon/avatarImg4.png'
import avatarImg5 from '@/assets/icon/avatarImg5.png'

const detailsRef = ref(null)

const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { address } = useAccount()
const chainId = useChainId()
const BSC_CHAIN_ID = 56
const claimLoading = ref(false)

// 是否处于每日 02:00-03:00 收益计算时间段内
const isClaimDisabledByTime = computed(() => {
    const now = new Date()
    const totalMinutes = now.getHours() * 60 + now.getMinutes()
    const start = 2 * 60 // 02:00
    const end = 3 * 60   // 03:00
    return totalMinutes >= start && totalMinutes < end
})

// 顶部收益数据
const choIncome = ref('0')
const subCoinIncome = ref('0') // 子币收益暂无数据，写死 0

// 待领取收益数据
const nodeIncome = ref(0)
const networkFeeIncome = ref(0)
const subCoinFeeIncome = ref(0)
const secondaryMarketIncome = ref(0)
const directReferralIncome = ref(0)
const teamIncome = ref(0)
const nodeType = ref(0)


function showInfo() {
    detailsRef.value?.refresh()
}

// 领取收益
const handleClaimReward = async () => {

    // 凌晨 2-3 点不允许领取
    if (isClaimDisabledByTime.value) return

    let amount = Number(nodeIncome.value) + Number(networkFeeIncome.value) + Number(subCoinFeeIncome.value) + Number(secondaryMarketIncome.value) + Number(directReferralIncome.value) + Number(teamIncome.value) + Number(subCoinIncome.value);
    console.log(amount)
    if (amount <= 0) {
        Message.warning(t('myNode.noIncome'))
        return
    }
    // claimReward处理重复领取收益
    if (claimLoading.value) return
    if (!address.value) {
        Message.error(t('myNode.connectWalletFirst'))
        return
    }
    claimLoading.value = true
    try {
        if (Number(chainId.value) !== BSC_CHAIN_ID) {
            // 切换网络
            await switchChain(config, { chainId: BSC_CHAIN_ID })
            await new Promise(r => setTimeout(r, 500))
        }

        const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
        if (!bscNet?.proxyNodeManager) {
            throw new Error(t('myNode.missingContractAddress'))
        }

        const result = await writeContractOptimized({
            abi: nodeManagerABI,
            address: bscNet.proxyNodeManager,
            functionName: 'claimReward',
            args: [BigInt(amount)],
            userAddress: address.value,
            messages: {
                success: t('myNode.claimSuccess'),
                failed: t('myNode.claimFailed'),
                rejected: t('myNode.claimCancelled')
            },
            showErrorToast: false
        })
        if (result.success) {
            await nodeclaimReward({
                "raw_amount_token": String(amount),
                "request_tx_hash": result.hash,
                "user_address": address.value
            })
            // 清零操作
            await init()
        }
    } catch (error) {
        Message.warning(t('myNode.claimFailed'))
        console.error('领取失败:', error)
    } finally {
        claimLoading.value = false
    }
}

// 我的团队相关数据（直推=direct，团队=team）
const activeTab = ref('direct')

// 团队网络列表（给 TeamTree 初次渲染使用）
const teamNetworkList = ref([])
// 直推网络列表（给 TeamTree 初次渲染使用）
const directNetworkList = ref([])

// 有效直推数
const effectiveCount = ref(0)
// 无效直推数
const ineffectiveCount = ref(0)
// 邀请列表
const inviteList = ref([])

// 地址截取：前6位 + ... + 后4位
const shortAddress = (addr) => {
    if (!addr) return ''
    if (addr.length <= 12) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// 随机头像数组
const avatarImages = [avatarImg1, avatarImg2, avatarImg3, avatarImg4, avatarImg5]

// 随机选择头像（基于地址的稳定随机）
const getRandomAvatar = (addr) => {
    if (!addr) return avatarImg
    let hash = 0
    for (let i = 0; i < addr.length; i++) {
        hash = ((hash << 5) - hash) + addr.charCodeAt(i)
        hash = hash & hash
    }
    const index = Math.abs(hash) % avatarImages.length
    return avatarImages[index]
}

// 格式化金额（CHO为6精度，需要先转换）
const formatAmount = (value) => formatChoAmount(value, { maxFractionDigits: 4, useGrouping: true })

// 获取邀请列表：直推为 type=1，团队为 type=2
const getMyTeamInfoList = async () => {
    const type = activeTab.value === 'direct' ? 1 : 2
    const res = await getMyTeamInfo({ address: address.value, type, node_type: 2 })
    const data = res?.data?.data
    // 给 TeamTree 使用的网络列表（接口原始字段）
    teamNetworkList.value = data?.team_network_list || []
    directNetworkList.value = data?.direct_network_list || []
    // data.direct_effective_count为直推有效数，data.direct_ineffective_count为直推无效数
    // data.team_effective_count为团队有效数，data.team_ineffective_count为团队无效数
    effectiveCount.value = (activeTab.value === 'direct' ? data.direct_effective_count : data.team_effective_count) ?? 0
    ineffectiveCount.value = (activeTab.value === 'direct' ? data.direct_ineffective_count : data.team_ineffective_count) ?? 0
    const rawList = activeTab.value === 'direct' ? data.direct_team_list : data.team_list
    // 映射接口数据到模板需要的格式：
    // address(截取), created(时间戳) -> activationTime, total_reward -> reward, parent_address -> 上级地址
    inviteList.value = (rawList || []).map(item => ({
        address: shortAddress(item.address),
        activationTime: formatDateTime(item.created),
        reward: formatAmount(item.total_reward),
        avatar: getRandomAvatar(item.address), // 使用基于地址的稳定随机头像
        // 接口字段 parent_address 为上级地址
        upline: shortAddress(item.parent_address || item.address)
    }))
}

// 根据当前tab显示对应的列表
const currentList = computed(() => inviteList.value || [])


// 监听 tab 切换，重新请求对应的邀请列表（直推/团队）
watch(activeTab, () => {
    getMyTeamInfoList()
})

// 处理中按钮文案国际化：如果没有配置 common.loading，则回退为中文"处理中..."
const loadingText = computed(() => {
    const v = t('common.loading')
    return v === 'common.loading' ? '处理中...' : v
})

const goToClaimRecord = () => {
    router.push({
        path: '/claim-record',
        query: {
            type: 2
        }
    })
}
async function init() {
    await getNodeServiceProvidersInfo({
        id: String(route.query.id || ''),
        address: address.value
    }).then(res => {
        const data = res?.data?.data?.provider_info || {}
        choIncome.value = data.total_reward ?? '0'
        subCoinIncome.value = data.son_coin_reward ?? '0'

        nodeIncome.value = data.node_reward ?? '0'
        networkFeeIncome.value = data.fee_reward ?? '0'
        subCoinFeeIncome.value = data.sub_coin_service_reward ?? '0'
        secondaryMarketIncome.value = data.market_reward ?? '0'
        directReferralIncome.value = data.direct_reward ?? '0'
        teamIncome.value = data.team_reward ?? '0'
        nodeType.value = Number(data.node_type ?? 0)
    }).catch(err => {
        console.error('获取节点收益详情失败：', err)
    })

    // 获取邀请列表
    if (address.value) {
        getMyTeamInfoList()
    }
}
// 初始化主题
onMounted(async () => {
    themeStore.applyTheme()
    // CHO收益：total_reward
    // 子币收益：son_coin_reward
    // 全网手续费买卖收益：fee_reward
    // 子币手续费收益：sub_coin_service_reward
    // 二级市场盈利收益：market_reward
    // 直推收益：direct_reward
    // 团队收益：team_reward
    // 节点收益：node_reward
    // node_type: 0 = 分布节点, 1 = 集群节点
    init()
})
</script>

<style scoped lang="scss">
.theme-light {
    .claim-all-btn {
        background-color: #2B6C18 !important;
        transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease;
    }

    .claim-all-btn:disabled {
        opacity: 0.9;
        background-color: #6b6b6b !important;
        color: #d0d0d0 !important;
        cursor: not-allowed;
    }

    .avatar-content {
        border: 2px solid #2B6C18 !important;
    }
}

/* 暗色主题下使用深色背景图 */
.theme-dark .cps-bg {
    background-image: url("@/assets/icon/cpsBgDark.png") !important;
}

.theme-dark {
    .claim-all-btn {
        transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease;
    }

    .claim-all-btn:disabled {
        opacity: 0.9;
        background-color: #6b6b6b !important;
        color: #d0d0d0 !important;
        cursor: not-allowed;
    }
}

.myNode {
    min-height: 100vh;
    padding: 20px 10px 0 10px;
    color: var(--text-color, #1a1a1a);
    background-color: var(--bg-page-h5, #FFFFFF);
    transition: background-color 0.3s ease, color 0.3s ease;

    .cps-bg {
        position: absolute;
        top: 0;
        left: 0;
        background: url("@/assets/icon/cpsBg.png") no-repeat;
        background-size: 100% 100%;
        pointer-events: none;
        width: 100%;
        min-height: 230px;
        z-index: 1;
    }

    .banner1 {
        background: transparent;
        flex-direction: column;
        display: flex;
        height: auto;
        justify-content: space-between;
        padding-top: 60px; // 为 fixed 的 BackHeaderNav 预留空间
    }

    .page-title {
        font-family: Noto Sans SC, Noto Sans SC;
        font-weight: bold;
        font-size: 28px;
        color: var(--bg-opposite, #1a1a1a);
        margin-bottom: 22px;
        transition: color 0.3s ease;
        z-index: 999;
    }


    .income {
        margin-bottom: 38px;
        position: relative;
        z-index: 999;

        .box {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 26px;

            .item {
                flex: 1;
                display: flex;
                flex-direction: column;
                transition: background-color 0.3s ease, transform 0.2s ease;

                b {
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 400;
                    font-size: 14px;
                    color: var(--text-color-tabBtn, #999999);
                    margin-bottom: 8px;
                }

                p {
                    font-family: DIN, DIN;
                    font-weight: bold;
                    font-size: 24px;
                    color: var(--text-color, #1a1a1a);
                    transition: color 0.3s ease;
                }
            }
        }

        .earn-prompt {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: var(--bg-light, #F5F5F5);
            border-radius: 999px;
            margin-bottom: 32px;
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
                color: var(--text-color, #1a1a1a);
                flex: 1;
                transition: color 0.3s ease;

                .earn-amount {
                    color: var(--text-color-y, #BBFF2E);
                    font-weight: 600;
                }
            }
        }

        .pending-income-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 16px 0 8px;

            .pending-title {
                font-family: PingFang SC, PingFang SC;
                font-weight: 600;
                font-size: 20px;
                display: flex;
                align-items: center;
                gap: 5px;
                color: var(--text-color, #1a1a1a);
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
                color: var(--text-color, #1a1a1a);
                cursor: pointer;
            }

            .record-arrow {
                font-size: 14px;
                color: inherit; // 继承文字颜色，适配明暗主题
            }
        }

        .pending-income-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 13px;

            .income-item {
                display: flex;
                flex-direction: column;
                transition: all 0.3s ease;

                .income-label {
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 400;
                    font-size: 11px;
                    color: #999999;
                    margin-bottom: 6px;
                }

                .income-value {
                    font-family: DIN, DIN;
                    font-weight: bold;
                    font-size: 18px;
                    color: var(--text-color, #ffffff);
                }
            }
        }

        .claim-all-btn {
            width: 100%;
            height: 56px;
            background: var(--text-color-y, #BBFF2E);
            border-radius: 999px;
            border: none;
            outline: none;
            font-weight: 600;
            font-size: 16px;
            color: var(--bg-page-h5, #FFFFFF);
            margin-top: 20px;
            transition: all 0.3s ease;
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
            flex-direction: column;
            gap: 10px;
            margin-bottom: 16px;

            .invite-count {
                font-family: PingFang SC, PingFang SC;
                font-weight: 400;
                font-size: 14px;
                color: var(--text-color, #1a1a1a);
                transition: color 0.3s ease;
                margin-right: 15px;

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
            background: rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-color-tabBtn, #999999);
            font-size: 12px;
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

                &.active {
                    color: #000000;
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

/* 暗色主题特定样式 */
.theme-dark .myNode {
    .earn-prompt {
        .earn-text {
            color: #F4F4F4 !important;
        }
    }

    .pending-income-grid {
        .income-item {

            .income-label {
                color: #999999 !important;
            }

            .income-value {
                color: #ffffff !important;
            }
        }
    }

    .my-team {

        .team-header {
            .invite-count {
                color: #FFFFFF !important;
            }

            .search-icon {
                color: #999999 !important;
            }
        }

        .team-tabs .tab-btn {
            color: #999999 !important;

            &.active {
                color: #FFFFFF !important;
            }
        }

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
</style>