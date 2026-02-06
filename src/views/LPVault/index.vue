<template>
    <div class="LPVault">

        <!-- 通用返回头部导航 -->
        <BackHeaderNav :show-record-btn="true" :show-open-btn="true" :type="2" />

        <div class="banner1">

            <div class="intro">
                <h1>{{ $t('lpVault.title') }}</h1>
                <p>{{ $t('lpVault.desc') }},
                    <a href="javascript:void(0)" @click="handleOpenMore">{{ $t('lpVault.learnMore') }}</a>。
                </p>
            </div>
        </div>

        <!-- 激活提示模块：使用通用跑马灯组件（type 1 对应质押节点激活消息） -->
        <ActivationMarquee :type="1" />

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
                            <span class="node-item-type-badge">{{ node.nodeLevel }}</span>
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
                        <span class="metric-value daily-earnings">{{ node?.node_min_income }}% ~ {{
                            node?.node_max_income }}%</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">{{ $t('lpVault.cycleDays') }}</span>
                        <span class="metric-value">{{ node.cycleDays }}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">{{ $t('lpVault.totalEarnings') }}</span>
                        <span class="metric-value total-earnings">
                            <img class="total-icon" src="@/assets/icon/LP1.png" alt="" />
                            {{ node.totalEarnings }} USDT
                        </span>
                    </div>
                </div>

                <!-- 为T6节点时，不显示激活按钮 -->
                <button :disabled="node.nodeLevel === 'T6' ? true : false" class="node-item-btn"
                    @click="handleActivate(node.type)">
                    {{ $t('lpVault.activateStaking') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ArrowRightBold } from '@element-plus/icons-vue'
import TIcon from '@/assets/icon/TIcon.png'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import ActivationMarquee from '@/components/ActivationMarquee.vue'
import { useLPVault } from './useLPVault.js'

const {
    handleOpenMore,
    handleOpenMyIncome,
    nodeList,
    handleActivate,
} = useLPVault()
</script>

<style scoped lang="scss">
.theme-dark {
    .activation-banner {
        background: #2F2F2F !important;
    }

    .node-card-item {
        background: #1D1D1D !important;
    }

    .node-item-name {
        color: #FFFFFF !important;
    }


    .node-item-btn {
        background: var(--text-color-y, #BBFF2E) !important;
        color: #000000 !important;
    }
}

.LPVault {
    min-height: 100vh;
    padding: 80px 10px 60px 10px;
    background-color: var(--bg-page-h5, #FCFCFC);
    color: var(--text-color, #1a1a1a);
    transition: background-color 0.3s ease, color 0.3s ease;

    &::after {
        background: url("../../assets/images/banner3.png");
        background-size: cover;
        background-repeat: no-repeat;
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 230px;
    }

    .banner1 {
        flex-direction: column;
        display: flex;
        height: 100%;
        justify-content: space-between;
        margin-bottom: 20px;

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

    .back-btn .icon,
    .open-btn .icon {
        width: 100%;
        height: 100%;
    }

    .intro {

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
        border-radius: 6px;
        font-family: DingTalk JinBuTi, DingTalk JinBuTi;
        font-weight: 500;
        font-size: 13px;
        background: rgba(234, 171, 74, 0.1);
        color: #EAAB4A;
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

        &:disabled {
            background: #c5c5c5!important;
            color: #999!important;
            cursor: not-allowed!important;
            box-shadow: none!important;
            transform: none!important;
        }
    }

    h3 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 25px 0 24px 0;

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
</style>