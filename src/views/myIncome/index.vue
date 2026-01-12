<template>
    <div class="myIncome">

        <BackHeaderNav 
            :show-record-btn="true" 
            :show-open-btn="true"
        />

        <div class="banner1">
            <div class="intro">
                <div class="intro-header">
                    <h1 class="intro-title">{{ $t('myIncome.superNode') }}</h1>
                    <div class="intro-tag">T 5</div>
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
                    <Clock class="time-icon" />
                    <span class="time-text">{{ $t('myIncome.purchaseTime') }}: 2025-12-25 12:20:19</span>
                </div>
            </div>
        </div>
        <div class="income">


            <div class="box">
                <div class="item">
                    <b>{{ $t('myIncome.myIncomeCMT') }}</b>
                    <p>+10M</p>
                </div>
                <div class="item">
                    <b>{{ $t('myIncome.computingPowerIncomeCMT') }}</b>
                    <p>+180K</p>
                </div>
                <div class="item">
                    <b>{{ $t('myIncome.networkIncomeCMT') }}</b>
                    <p>+96,358</p>
                </div>
            </div>

            <!-- 赚取收益提示模块：使用通用跑马灯组件（type=3 展示收益样式） -->
            <ActivationMarquee :type="4" />

            <h3 style="margin-bottom: 16px;">{{ $t('myIncome.pendingIncome') }}</h3>

            <div class="processDiv">
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 70%"></div>
                        <div class="progress-indicator" style="left: 70%">
                            <span class="indicator-text">70%</span>
                        </div>
                    </div>
                </div>
                <div class="text">
                    <span>0(CHO)</span>
                    <span>18000(CHO)</span>
                </div>
            </div>

            <div class="earnings-grid">
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.staticIncomeCHO') }}</div>
                    <div class="earnings-value">200,000</div>
                </div>
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.directReferralIncomeCHO') }}</div>
                    <div class="earnings-value">180,000</div>
                </div>
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.teamIncomeCHO') }}</div>
                    <div class="earnings-value">1,200,000</div>
                </div>
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.genesisNodeIncomeCHO') }}</div>
                    <div class="earnings-value">12,000</div>
                </div>
                <div class="earnings-item">
                    <div class="earnings-label">{{ $t('myIncome.superNodeIncomeCHO') }}</div>
                    <div class="earnings-value">20,000</div>
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
                    <div class="search-icon" @click="handleSearch">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>
                </div>

                <!-- 层级树状图占位 -->
                <div class="team-tree-placeholder">
                    <TeamTree />
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
                                    <span class="team-reward">+ {{ item.reward || '32,567' }} CHO</span>
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
        <TabNode v-model="showNodesModal" :nodes="myNodes" />

        <!-- 领取收益弹窗 -->
        <CollectEarnings v-model="showCollectEarningsModal" :options="earningsOptions"
            @confirm="handleCollectConfirm" />
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue"
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Clock } from '@element-plus/icons-vue'
import avatarImg from '@/assets/icon/avatar.png'
import TabNode from '@/components/TabNode.vue'
import CollectEarnings from '@/components/CollectEarnings.vue'
import TeamTree from '@/components/TeamTree.vue'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import ActivationMarquee from '@/components/ActivationMarquee.vue'
import { getNodeStakingInfo } from '@/api/API'
import { useAccount } from '@wagmi/vue'

const router = useRouter()
const themeStore = useThemeStore()
const { t } = useI18n()
const { address } = useAccount()
// 我的团队相关数据
const activeTab = ref('direct')

// 直推地址列表
const directList = ref([
    {
        address: '0xb574...4c7d',
        activationTime: '2025-09-01 10:23',
        nodeType: t('myNode.nodeTypes.distributed'),
        nodeTag: 'T1',
        reward: '32,567',
        avatar: avatarImg,
        upline: '0xb574...4c7d'
    },
    {
        address: '0xb574...4c7d',
        activationTime: '2025-09-01 10:23',
        nodeType: t('myNode.nodeTypes.distributed'),
        nodeTag: 'T1',
        reward: '32,567',
        avatar: avatarImg,
        upline: '0xb574...4c7d'
    }
])

// 团队地址列表
const teamList = ref([
    {
        address: '0xa123...5f6g',
        activationTime: '2025-09-02 14:30',
        nodeType: t('myNode.nodeTypes.cluster'),
        nodeTag: 'T2',
        reward: '45,890',
        avatar: avatarImg,
        upline: '0xb574...4c7d'
    },
    {
        address: '0xc789...1a2b',
        activationTime: '2025-09-03 09:15',
        nodeType: t('myNode.nodeTypes.distributed'),
        nodeTag: 'T1',
        reward: '28,123',
        avatar: avatarImg,
        upline: '0xa123...5f6g'
    }
])

// 根据当前tab显示对应的列表
const currentList = computed(() => {
    return activeTab.value === 'direct' ? directList.value : teamList.value
})

// 根据当前tab显示对应的邀请地址数
const inviteCount = computed(() => {
    return activeTab.value === 'direct' ? directList.value.length : teamList.value.length
})

// 根据当前tab显示对应的标签文本
const inviteCountLabel = computed(() => {
    return activeTab.value === 'direct' 
        ? t('myNode.directAddressCount') 
        : t('myNode.teamTotalAddressCount')
})

const handleSearch = () => {
    // 搜索功能
    console.log('搜索团队')
}



// 我的节点弹窗控制
const showNodesModal = ref(false)

// 我的节点数据
const myNodes = computed(() => [
    {
        nodeName: t('myIncome.nodeNames.infoNode'),
        nodeTag: 'T1',
        purchaseTime: '2025-12-25 12:30:45'
    },
    {
        nodeName: t('myIncome.nodeNames.dataNode'),
        nodeTag: 'T2',
        purchaseTime: '2025-12-25 12:30:45'
    },
    {
        nodeName: t('myIncome.nodeNames.validationNode'),
        nodeTag: 'T3',
        purchaseTime: '2025-12-25 12:30:45'
    },
    {
        nodeName: t('myIncome.nodeNames.consensusNode'),
        nodeTag: 'T4',
        purchaseTime: '2025-12-25 12:30:45'
    }
])

const handleSwap = () => {
    // 打开我的节点弹窗
    showNodesModal.value = true
}

// 领取收益弹窗控制
const showCollectEarningsModal = ref(false)

// 领取收益选项数据
const earningsOptions = computed(() => [
    {
        name: t('myIncome.earningsOptions.allNodeRewards'),
        tag: '',
        amount: '100,0000'
    },
    {
        name: t('myIncome.earningsOptions.dataNode'),
        tag: 'T2',
        amount: '80,000'
    },
    {
        name: t('myIncome.earningsOptions.validationNode'),
        tag: 'T3',
        amount: '200,000'
    }
])

// 打开领取收益弹窗
const openCollectEarnings = () => {
    showCollectEarningsModal.value = true
}

// 处理领取确认
const handleCollectConfirm = (selectedOption, selectedIndex) => {
    console.log('选中的选项:', selectedOption)
    console.log('选中的索引:', selectedIndex)
    // 这里可以添加实际的领取逻辑
}

const fetchNodeStakingInfo = async () => {
    const res = await getNodeStakingInfo({ address: address.value, id: "1" })
    const data = res?.data?.data || res?.data || res || {}
    console.log('节点质押信息接口返回：', data)
}
// 初始化主题
onMounted(() => {
    themeStore.applyTheme()
    fetchNodeStakingInfo()
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
    padding: 100px 10px 0 10px;
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

        h3 {
            font-size: 20px;
            color: var(--text-color, #FFFFFF);
            font-weight: 600;
            transition: color 0.3s ease;
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
</style>