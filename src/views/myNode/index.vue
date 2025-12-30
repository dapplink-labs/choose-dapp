<template>
    <div class="myNode">


        <BackHeaderNav 
            :show-open-btn="true"
            :use-default-open-action="false"
            @open-click="handleOpenMore"
        />

        <div class="banner1">
            <h1 class="page-title">{{ $t('myNode.title') }}</h1>
        </div>
        <div class="cps-bg"></div>

        <div class="income">
            <div class="box">
                <div class="item">
                    <b>{{ $t('myNode.choIncome') }}</b>
                    <p>200,000</p>
                </div>
                <div class="item">
                    <b>{{ $t('myNode.subCoinIncome') }}</b>
                    <p>200,000</p>
                </div>
            </div>

            <div class="earn-prompt">
                <div class="earn-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                </div>
                <div class="earn-text">
                    {{ $t('myNode.earnPrompt') }} <span class="earn-amount">+1000000CHO</span>
                </div>
            </div>

            <h3>{{ $t('myNode.pendingIncome') }}</h3>
            <div class="pending-income-grid">
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.nodeIncome') }}</div>
                    <div class="income-value">200,000</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.networkFeeIncome') }}</div>
                    <div class="income-value">180,000</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.subCoinFeeIncome') }}</div>
                    <div class="income-value">1,200,000</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.secondaryMarketIncome') }}</div>
                    <div class="income-value">12,000</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.directReferralIncome') }}</div>
                    <div class="income-value">1,200,000</div>
                </div>
                <div class="income-item">
                    <div class="income-label">{{ $t('myNode.networkIncome') }}</div>
                    <div class="income-value">12,000</div>
                </div>
            </div>

            <!-- 一键领取按钮 -->
            <button class="claim-all-btn">{{ $t('myNode.claimAll') }}</button>

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
                    <span class="invite-count"><span>{{ $t('myNode.inviteAddressCount') }}</span> {{ inviteCount
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
                                    <span class="team-upline-label">Upline:</span>
                                    <span class="team-upline-address">{{ item.upline || item.address }}</span>
                                </div>
                                <span class="team-time">{{ item.activationTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'
import avatarImg from '@/assets/icon/avatar.png'
import TeamTree from "@/components/TeamTree.vue"
import BackHeaderNav from '@/components/BackHeaderNav.vue'


const router = useRouter()
const themeStore = useThemeStore()
const { t } = useI18n()

const handleOpenMore = () => {
    // 预留「了解更多」跳转逻辑
    console.log('前往了解更多')
}

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

const handleSearch = () => {
    // 搜索功能
    console.log('搜索团队')
}

// 初始化主题
onMounted(() => {
    themeStore.applyTheme()
})
</script>

<style scoped lang="scss">
.theme-light {
    .claim-all-btn{
        background-color: #2B6C18 !important;
    }
    .avatar-content{
        border: 2px solid #2B6C18 !important;
    }
}
/* 暗色主题下使用深色背景图 */
.theme-dark .cps-bg {
    background-image: url("@/assets/icon/cpsBgDark.png") !important;
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
        color: var(--text-color, #1a1a1a);
        margin-bottom: 22px;
        transition: color 0.3s ease;
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

        h3 {
            font-family: PingFang SC, PingFang SC;
            font-weight: 600;
            font-size: 20px;
            color: var(--text-color, #1a1a1a);
            margin-bottom: 24px;
            transition: color 0.3s ease;
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
                            border:1px solid var(--bg-page-h5, #FFFFFF);
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

        .team-list  {
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