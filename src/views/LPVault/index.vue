<template>
    <div class="LPVault">

        <div class="banner1" style="margin: 0  -10px;">
            <div class="cps-card-header">
                <div class="back-btn" @click="handleBack">
                    <svg t="1766051544466" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="6246" width="32" height="32">
                        <path d="M723.2 1024l-512-512L716.8 0l70.4 70.4L345.6 512l441.6 448-64 64z" p-id="6247"
                            fill="currentColor"></path>
                    </svg>
                </div>
                <div class="open-btn" @click="handleOpenMore">
                    <svg t="1766051224777" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="4731" width="32" height="32">
                        <path
                            d="M842.724 571.473c0-22.93 18.588-41.518 41.518-41.518s41.518 18.587 41.518 41.518v271.251c0 45.86-37.177 83.036-83.036 83.036H182.126c-45.86 0-83.036-37.177-83.036-83.036V182.126c0-45.86 37.176-83.036 83.036-83.036h271.251c22.93 0 41.518 18.588 41.518 41.518s-18.588 41.518-41.518 41.518H182.126v660.598h660.598V571.473z m2.865-332.009L562.576 521.869c-16.45 16.414-43.119 16.414-59.57 0-16.448-16.414-16.448-43.027 0-59.441l283.95-283.339H646.05c-22.138 0-40.084-17.907-40.084-40 0-22.09 17.946-39.998 40.084-39.998h203.56c42.056-0.001 76.149 34.019 76.149 75.985v203.122c0 22.092-17.947 40-40.086 40s-40.085-17.908-40.085-40V239.464z"
                            fill="currentColor" p-id="4732">
                        </path>
                    </svg>
                </div>
            </div>

            <div class="intro">
                <h1>{{ $t('lpVault.title') }}</h1>
                <p>{{ $t('lpVault.desc') }},
                    <a href="javascript:void(0)" @click="handleOpenMore">{{ $t('lpVault.learnMore') }}</a>。
                </p>
            </div>
        </div>

        <!-- 激活提示模块 -->
        <div class="activation-banner">
            <div class="activation-avatar">
                <img :src="activationAvatar" alt="avatar" />
            </div>
            <div class="activation-text">
                {{ activationMsg }}
            </div>
        </div>

        <h3>
            <span>{{ $t('lpVault.nodeStaking') }}</span>
            <b @click="handleOpenMyIncome">{{ $t('lpVault.myLPIncome') }}
                <el-icon class="arrow-icon">
                    <ArrowRightBold />
                </el-icon>
            </b>
        </h3>

        <!-- 节点卡片列表 -->
        <div class="node-card-list">
            <div v-for="node in nodeList" :key="node.type" class="node-card-item">
                <div class="node-item-header">
                    <div class="node-item-icon">
                        <img :src="node.icon" :alt="node.name" />
                    </div>
                    <div class="node-item-main">
                        <div class="node-item-title-wrapper">
                            <span class="node-item-name">{{ node.name }}</span>
                            <span class="node-item-type-badge">{{ node.type }}</span>
                        </div>
                        <div class="node-item-price">
                            <span class="label">{{ $t('lpVault.activationPrice') }}</span>
                            <span class="value">
                                <img class="coin" :src="TIcon" alt="T" />{{ node.price }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="node-item-metrics">
                    <div class="metric-item">
                        <span class="metric-label">{{ $t('lpVault.dailyEarnings') }}</span>
                        <span class="metric-value daily-earnings">{{ node.dailyEarnings }}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">{{ $t('lpVault.cycleDays') }}</span>
                        <span class="metric-value">{{ node.cycleDays }}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">{{ $t('lpVault.totalEarnings') }}</span>
                        <span class="metric-value total-earnings">
                            <img class="total-icon" src="@/assets/icon/LP1.png" alt="" />
                            {{ node.totalEarnings }}
                        </span>
                    </div>
                </div>

                <button class="node-item-btn" @click="handleActivate(node.type)">
                    {{ $t('lpVault.activateComputingPower') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from "vue"
import { ArrowRightBold } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import clusterNodeImg from '@/assets/icon/ClusterNode.png'
import DistributedNode from '@/assets/icon/DistributedNode.png'
import DistributedNodeDark from '@/assets/icon/DistributedNodeDark.png'
import TIcon from '@/assets/icon/TIcon.png'

const router = useRouter()
const { t } = useI18n()

// 激活提示头像（复用集群节点插图）
const activationAvatar = clusterNodeImg

// 激活提示文案
const activationAddress = ref('0xb574...4c7d')
const activationMsg = computed(() => {
    return t('lpVault.activationMsg', { address: activationAddress.value })
})

const handleBack = () => {
    router.back()
}

const handleOpenMore = () => {
    // 预留「了解更多」跳转逻辑
    console.log('前往了解更多')
}

const handleOpenMyIncome = () => {
    router.push('/myIncome')
}

// 节点列表数据
const nodeList = computed(() => [
    {
        type: 'T1',
        name: t('lpVault.nodeTypes.T1'),
        icon: DistributedNode,
        price: '200',
        dailyEarnings: '0.5%-1%',
        cycleDays: `2${t('lpVault.days')}`,
        totalEarnings: '3000000'
    },
    {
        type: 'T2',
        name: t('lpVault.nodeTypes.T2'),
        icon: DistributedNode,
        price: '600',
        dailyEarnings: '0.6%-1.1%',
        cycleDays: `3${t('lpVault.days')}`,
        totalEarnings: '3000000'
    },
    {
        type: 'T3',
        name: t('lpVault.nodeTypes.T3'),
        icon: DistributedNode,
        price: '1200',
        dailyEarnings: '0.7%-1.2%',
        cycleDays: `4${t('lpVault.days')}`,
        totalEarnings: '3000000'
    },
    {
        type: 'T4',
        name: t('lpVault.nodeTypes.T4'),
        icon: DistributedNode,
        price: '2500',
        dailyEarnings: '0.8%-1.3%',
        cycleDays: `5${t('lpVault.days')}`,
        totalEarnings: '3000000'
    },
    {
        type: 'T5',
        name: t('lpVault.nodeTypes.T5'),
        icon: DistributedNode,
        price: '6000',
        dailyEarnings: '0.9%-1.4%',
        cycleDays: `6${t('lpVault.days')}`,
        totalEarnings: '3000000'
    },
    {
        type: 'T6',
        name: t('lpVault.nodeTypes.T6'),
        icon: DistributedNode,
        price: '14000',
        dailyEarnings: '1%-1.5%',
        cycleDays: `7${t('lpVault.days')}`,
        totalEarnings: '3000000'
    }
])

// 处理激活节点
const handleActivate = (type) => {
    console.log('激活节点:', type)
    // TODO: 实现激活逻辑
}

// 初始化主题
onMounted(() => {
})
</script>

<style scoped lang="scss">
.LPVault {
    min-height: 100vh;
    padding: 20px 10px 60px 10px;
    background-color: var(--bg-page, #FCFCFC);
    color: var(--text-color, #1a1a1a);
    transition: background-color 0.3s ease, color 0.3s ease;

    .banner1 {
        background: url("../../assets/images/banner3.png");
        background-size: cover;
        background-repeat: no-repeat;
        flex-direction: column;
        display: flex;
        height: 100%;
        /* 或 height: 100vh */
        justify-content: space-between;

        h3 {
            padding: 0 10px;
            margin-bottom: 20px;
        }
    }

    .hide-scroll {
        overflow: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .hide-scroll::-webkit-scrollbar {
        display: none;
    }

    .tab {
        display: flex;
        gap: 20px;
        border-bottom: 1px solid var(--border-color, #F3F3F3);
        margin-bottom: 20px;
        overflow-x: auto;
        white-space: nowrap;
        transition: border-color 0.3s ease;

        .item {
            font-weight: 400;
            font-size: 16px;
            width: 90px;
            flex-shrink: 0;
            color: var(--text-gray, #909090);
            padding-bottom: 15px;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                color: var(--text-color, #000000);
            }
        }

        .active {
            flex-shrink: 0;
            font-weight: 400;
            font-size: 16px;
            color: var(--text-color, #000);
            width: 90px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--text-color, #000);
            transition: all 0.3s ease;
        }
    }

    .cps-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 60px;
        padding: 0 10px;
    }

    .back-btn,
    .open-btn {
        width: 24px;
        height: 24px;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
        color: var(--text-color, #000000);
        background: transparent;
        transition: color 0.3s ease;
    }

    .back-btn {
        width: 18px;
        height: 18px;
    }

    .back-btn .icon,
    .open-btn .icon {
        width: 100%;
        height: 100%;
    }

    .intro {
        padding: 0 10px;

        h1 {
            font-family: Noto Sans SC, Noto Sans SC;
            font-weight: bold;
            font-size: 28px;
            color: var(--text-color, #000000);
            transition: color 0.3s ease;
            margin-bottom: 10px;
        }

        p {
            display: block;
            width: 100%;
            padding-right: 25%;
            box-sizing: border-box;
        }

        p,
        a {
            font-family: PingFang SC, PingFang SC;
            font-weight: 400;
            font-size: 14px;
            color: #383838;
            line-height: 20px;
            text-align: left;
            color: var(--text-gray, #909090);
            transition: color 0.3s ease;
        }

        a {
            cursor: pointer;
            text-decoration: underline;

            &:hover {
                color: var(--text-color, #000000);
            }
        }
    }

    .activation-banner {
        width: 100%;
        box-sizing: border-box;
        margin: 32px 0 16px;
        padding: 10px 14px;
        /* 开灯（亮色主题）默认背景色 */
        background: #F4F4F4;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: #111111;
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    .activation-avatar {
        width: 36px;
        height: 36px;
        aspect-ratio: 1 / 1;
        flex-shrink: 0;
        border-radius: 50%;
        background: #2F2F2F;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
    }

    .activation-text {
        font-size: 13px;
        line-height: 18px;
        color: var(--text-color, #000000);
    }

    /* 节点卡片列表样式 */
    .node-card-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 24px;
    }

    .node-card-item {
        background: #F6F6F6;
        border-radius: 16px;
        padding: 16px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
    }

    .node-item-header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .node-item-icon {
        position: relative;
        width: 72px;
        height: 72px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }

    .node-item-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .node-item-title-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;
    }

    .node-item-name {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 18px;
        line-height: 1.5;
        color: #666666;
        transition: color 0.3s ease;
    }

    .node-item-type-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 1px 10px;
        background: #E6E6E6;
        border-radius: 6px;
        font-family: DingTalk JinBuTi, DingTalk JinBuTi;
        font-weight: 500;
        font-size: 13px;
        color: #000000;
        font-style: italic;
    }

    /* 暗色主题下的标签样式 */
    :deep(.theme-dark) .node-item-type-badge {
        background: #2F2F2F;
        color: #FFFFFF;
    }

    .node-item-price {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: #9ca3af;

        .label {
            color: #9ca3af;
        }

        .value {
            font-family: PingFang SC, PingFang SC;
            font-weight: 600;
            font-size: 16px;
            color: var(--text-color, #000000);
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .coin {
            width: 18px;
            height: 18px;
            display: inline-block;
            object-fit: contain;
        }
    }

    .node-item-metrics {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 0;
        margin: 8px 0;
    }

    .metric-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        line-height: 1.5;
    }

    .metric-label {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #909090;
        line-height: 20px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        border-bottom: 1px dashed #909090;
    }

    .metric-value {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        color: var(--text-color, #000000);
        transition: color 0.3s ease;

        &.daily-earnings {
            color: #2EBE69;
        }

        &.total-earnings {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: var(--text-color, #000000);
        }
    }

    .total-icon {
        width: 16px;
        height: 16px;
        object-fit: contain;
    }

    .node-item-btn {
        margin-top: 8px;
        height: 44px;
        border-radius: 22px;
        border: none;
        background: #2B6C18;
        color: #ffffff;
        font-family: PingFang SC, PingFang SC;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 16px rgba(46, 190, 105, 0.3);
        }

        &:active {
            transform: translateY(0);
        }
    }

    h3 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 22px 0 24px 0;

        span {
            font-weight: bold;
            font-size: 20px;
            color: var(--text-color, #000000);
            transition: color 0.3s ease;
        }

        b {
            font-weight: 400;
            font-size: 14px;
            color: var(--text-color, #000000);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                transform: translateX(4px);
            }

            .arrow-icon {
                color: var(--text-color, #000000);
                font-size: 14px;
                transition: all 0.3s ease;
            }

            &:hover .arrow-icon {
                transform: translateX(2px);
            }
        }
    }

}

.theme-dark {
    .activation-banner {
        background: #2F2F2F !important;
    }
    .node-card-item{
        background: #1D1D1D !important;
    }
    .node-item-name{
        color: #FFFFFF !important;
    }
    .node-item-type-badge{
        background: rgba(234, 171, 74, 0.1) !important;
        color: #EAAB4A !important;
    }
    .node-item-btn{
        background: var(--text-color-p, #BBFF2E) !important;
        color: #000000 !important;
    }
}
</style>