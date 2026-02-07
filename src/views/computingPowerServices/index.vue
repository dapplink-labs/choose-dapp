<template>
  <div class="cps-page">
    <div class="cps-bg"></div>

    <div class="cps-content">
      <div class="cps-card">
        <BackHeaderNav :show-open-btn="true" :show-record-btn="true" :type="1" />

        <h1 class="cps-title">{{ t('computingPower.title') }}</h1>

        <p class="cps-desc">
          {{ t('computingPower.desc') }}
          <a href="javascript:void(0)" class="cps-link" @click="handleOpenMore">{{ t('computingPower.learnMore') }}</a>
        </p>

        <!-- 激活提示模块 - 跑马灯 -->
        <!-- <ActivationMarquee :type="2" /> -->

        <!-- 购买节点标题区域 -->
        <div class="node-header">
          <div class="node-title-wrap">
            <h2 class="node-section-title">{{ t('computingPower.buyNode') }}</h2>
          </div>
          <div class="my-node-btn" @click="handleMyNodes">
            <span>{{ t('computingPower.myNodes') }}</span>
            <svg t="1766063981785" class="icon-next" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" p-id="1589" width="18" height="18">
              <path
                d="M340.688 830.24l11.312 11.328a16 16 0 0 0 22.624 0L685.76 530.448a16 16 0 0 0 0-22.64L374.624 196.688a16 16 0 0 0-22.624 0l-11.312 11.312a16 16 0 0 0 0 22.624l288.496 288.496-288.496 288.512a16 16 0 0 0 0 22.624z"
                fill="currentColor" p-id="1590"></path>
            </svg>
          </div>
        </div>

        <!-- 购买节点模块：卡片列表 -->
        <div class="node-card-list">
          <div v-for="node in displayNodes" :key="node.type" class="node-card-item">
            <div class="node-item-header">
              <div class="node-item-icon">
                <img :src="node.icon" :alt="node.title" />
                <span v-if="node.badge" class="node-badge">
                  {{ node.badge }}
                </span>
              </div>
              <div class="node-item-main">
                <div class="node-item-title">{{ node.title }}</div>
                <div class="node-item-price">
                  <span class="label">{{ t('computingPower.priceLabel') }}</span>
                  <span class="value">
                    <img class="coin" :src="TIcon" alt="T" />{{ node.price }}
                  </span>
                </div>
              </div>
            </div>

            <div class="node-item-desc">
              <p>{{ node.descText }}</p>
            </div>

            <button class="node-item-btn" :class="{ 'disabled': true }" :disabled="true">
              {{ getButtonText(node.type) }}
            </button>
          </div>
        </div>

      </div>
    </div>


    <PurchaseNode v-model="showPurchaseNode" :title="purchaseTitle" :price="purchasePrice" @buy="handleConfirmBuy" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TIcon from '@/assets/icon/TIcon.png'
// @ts-ignore
import PurchaseNode from '@/components/PurchaseNode.vue'
// @ts-ignore
import BackHeaderNav from '@/components/BackHeaderNav.vue'
// @ts-ignore
import ActivationMarquee from '@/components/ActivationMarquee.vue'
import { useComputingPowerServices } from './useComputingPowerServices.js'

const { t } = useI18n()

// 使用 composable 获取所有逻辑
const {
  displayNodes,
  showPurchaseNode,
  purchaseTitle,
  purchasePrice,
  isNodeButtonEnabled,
  getButtonText,
  handleOpenMore,
  handleMyNodes,
  handleBuy,
  handleConfirmBuy,
} = useComputingPowerServices()



onMounted(() => {

})

onUnmounted(() => {

})
</script>

<style scoped lang="scss">
.cps-page {
  width: 100%;
  position: relative;
  background-color: var(--bg-page-h5, #FFFFFF);
  min-height: 100vh;
}

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

/* 暗色主题下使用深色背景图 */
.theme-dark .cps-bg {
  background-image: url("@/assets/icon/cpsBgDark.png");
}

.cps-content {
  z-index: 999;
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20px 16px 32px;
  box-sizing: border-box;
}

.cps-card {
  width: 100%;
  box-sizing: border-box;
  padding-top: 60px; // 为 fixed 的 BackHeaderNav 预留空间

}

// 节点列表卡片
.node-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-card-item {
  background: var(--bg-card, #ffffff);
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  overflow: hidden;

  img {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }
}

.node-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #fff;
  color: #000;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.node-item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-item-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color, #000000);
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
    color: #2EBE69;
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

.node-item-desc {
  line-height: 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  p {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-dark-gray, #909090);
    line-height: 20px;
    text-align: left;
  }
}

.node-item-btn {
  margin-top: 4px;
  height: 44px;
  border-radius: 22px;
  border: none;
  background: #2B6C18;
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(43, 108, 24, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }

  &.disabled,
  &:disabled {
    background: #CCCCCC;
    color: #999999;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.cps-title {
  margin: 0 0 10px;
  font-family: Noto Sans SC, Noto Sans SC;
  font-weight: bold;
  font-size: 28px;
  color: #FFFFFF;
  color: var(--text-color, #111111);
}

.cps-desc {
  margin: 0;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  color: var(--text-color-F4, #F4F4F4);
  padding-right: 25%;
  box-sizing: border-box;
}

.cps-link {
  font-size: 12px;
  color: var(--text-color-F4, #F4F4F4);
  text-decoration: underline;
}

// 激活提示模块样式
.activation-banner {
  margin: 12px 0 16px;
  padding: 10px 14px;
  width: 100%;
  box-sizing: border-box;
  background: #F4F4F4;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #111111;
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
  color: inherit;
}

/* 关灯（暗色主题）下的激活提示背景色与文字色 */
.theme-dark .activation-banner {
  background: #2F2F2F;
  color: #F4F4F4;
}

.node-header {
  margin-top: 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-section-title {
  margin: 0;
  font-family: Noto Sans SC, Noto Sans SC;
  font-weight: bold;
  font-size: 20px;
  text-align: left;
  color: var(--text-color, #000000);
}

.my-node-btn {
  border: none;
  background: transparent;
  color: var(--text-color, #FFF);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;

  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 16px;

  .icon-next {
    margin-bottom: -2px;
  }
}

.node-card {
  margin-top: 8px;
  background-color: var(--bg-card, #ffffff);
  border-radius: 18px;
  border: 1px solid var(--border-color, #E0E0E0);
  padding: 16px 16px 20px;
  box-sizing: border-box;
}

.node-tabs {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  border-bottom: 1px solid #3B3B3B;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.node-tab {
  font-size: 14px;
  color: var(--text-dark-gray, #999999);
  cursor: pointer;
  padding: 0 0 4px;
  position: relative;
}

.node-tab.active {
  color: var(--text-color, #000000);
  font-weight: 600;
  border-color: var(--text-color, #000000);

  &::after {
    content: '';
    width: 100%;
    height: 2px;
    background-color: var(--text-color, #FFFFFF);
    position: absolute;
    bottom: -9px;
    left: 0;
  }
}

.node-image-wrap {
  width: 100%;
  overflow: hidden;
  margin-bottom: 12px;
}

.node-image {
  width: 100%;
  display: block;
}

.benefit-list {
  list-style: none;
  padding: 0 16px;
  margin: 0 0 24px;
  box-sizing: border-box;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-color, #111111);
  margin-bottom: 16px;

  .text {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-color, #000000);
    line-height: 20px;
    text-align: left;
  }
}

.check-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--check-icon-bg, #000000);
  flex-shrink: 0;
  position: relative;
}

.check-icon::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 3px;
  width: 7px;
  height: 4px;
  border-left: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  transform: rotate(-45deg);
}

.price-row {
  padding: 0 16px;
  box-sizing: border-box;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: var(--text-dark-gray, #909090);
  margin-bottom: 31px;
  vertical-align: middle;
}

.price-value {
  font-family: DIN, DIN;
  font-weight: bold;
  font-size: 24px;
  color: #DE9800;
  margin-left: 6px;
  vertical-align: middle;
}

.theme-dark .node-item-btn {
  background: #ffffff !important;
  color: #111111 !important;
}
</style>