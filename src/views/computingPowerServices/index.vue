<template>
  <div class="cps-page">
    <BackHeaderNav
      class="cps-header"
      :show-open-btn="true"
      :show-record-btn="true"
      :type="1"
      action-mode="icon"
      :action-icon-size="32"
      :record-icon-src="recordIcon"
      :open-icon-src="shareIcon"
    />

    <section class="hero-section">
      <div class="hero-copy">
        <h1 class="hero-title">{{ t('computingPower.title') }}</h1>
        <p class="hero-desc">
          {{ t('computingPower.desc') }}
          <button type="button" class="hero-link" @click="handleOpenMore">{{ t('computingPower.learnMore') }}</button>
        </p>
      </div>
    </section>

    <div class="section-heading">
      <span class="section-title">{{ t('computingPower.listTitle') }}</span>
      <button type="button" class="income-entry" @click="handleMyNodes">
        <span>{{ t('computingPower.myNodes') }}</span>
        <img :src="arrowRightIcon" :alt="t('computingPower.myNodes')" class="income-arrow" />
      </button>
    </div>

    <div class="node-card-list">
      <article v-for="node in displayNodes" :key="node.type" class="node-card-item">
        <div class="node-top">
          <div class="node-media">
            <img :src="node.icon" :alt="node.title" class="node-image" />
          </div>

          <div class="node-copy">
            <h2 class="node-title">{{ node.title }}</h2>
            <div class="node-price-badge">{{ node.price }} U</div>
          </div>
        </div>

        <p class="node-desc">{{ node.descText }}</p>

        <PrimaryActionButton class="node-buy-btn" :disabled="!isNodeButtonEnabled(node.type)" height="44px" radius="12px" font-size="16px" @click="handleBuy(node.type)">
          {{ getButtonText(node.type) }}
        </PrimaryActionButton>
      </article>
    </div>

    <transition name="sheet-fade">
      <div v-if="showPurchaseNode" class="sheet-overlay" @click.self="showPurchaseNode = false">
        <div class="sheet-panel confirm-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="sheet-title">{{ t('purchaseNode.confirmPurchaseNode') }}</div>
          <div class="sheet-divider"></div>

          <div class="confirm-row">
            <span class="confirm-label">{{ t('purchaseNode.nodeType') }}</span>
            <span class="confirm-value">{{ purchaseTitle }}</span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label">{{ t('purchaseNode.nodePrice') }}</span>
            <span class="confirm-value">${{ purchasePrice }}</span>
          </div>

          <PrimaryActionButton class="sheet-main-btn" height="48px" radius="18px" font-size="18px" @click="handleConfirmBuy">
            {{ t('purchaseNode.buyBtn') }}
          </PrimaryActionButton>
        </div>
      </div>
    </transition>

    <transition name="sheet-fade">
      <div v-if="showPurchaseSuccess" class="sheet-overlay" @click.self="handleClosePurchaseSuccess">
        <div class="sheet-panel success-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="success-confetti"></div>
          <div class="success-icon-wrap">
            <div class="success-icon-circle">
              <svg viewBox="0 0 24 24" class="success-check" aria-hidden="true">
                <path
                  d="M20.285 6.709a1 1 0 0 1 .006 1.414l-9.198 9.28a1 1 0 0 1-1.42.006L3.71 11.45a1 1 0 1 1 1.414-1.414l4.251 4.25 8.49-8.571a1 1 0 0 1 1.42-.006z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          <div class="success-subtitle">{{ t('computingPower.purchaseSuccessSubtitle') }}</div>
          <div class="success-title">{{ purchaseTitle }}</div>
          <PrimaryActionButton class="sheet-main-btn" height="48px" radius="18px" font-size="18px" @click="handleClosePurchaseSuccess">
            {{ t('lpVault.confirm') }}
          </PrimaryActionButton>
          <div class="success-note">{{ t('lpVault.rewardsDistributionNote') }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import PrimaryActionButton from '@/components/PrimaryActionButton.vue'
import { useComputingPowerServices } from './useComputingPowerServices.js'

const { t } = useI18n()

const iconModules = import.meta.glob('@/assets/new_icon/LPVault/*.{png,svg}', { eager: true })
const iconMap = Object.fromEntries(
  Object.entries(iconModules).map(([path, mod]) => {
    const fileName = path.split('/').pop() || path
    const name = fileName.replace(/\.(png|svg)$/i, '')
    return [name, mod.default]
  }),
)
const getIcon = (name) => iconMap[name]

const recordIcon = computed(() => getIcon('lpvault-records'))
const shareIcon = computed(() => getIcon('lpvault-share'))
const arrowRightIcon = computed(() => getIcon('lpvault-arrow-right'))

const {
  displayNodes,
  showPurchaseNode,
  showPurchaseSuccess,
  purchaseTitle,
  purchasePrice,
  isNodeButtonEnabled,
  getButtonText,
  handleOpenMore,
  handleMyNodes,
  handleBuy,
  handleConfirmBuy,
  handleClosePurchaseSuccess,
} = useComputingPowerServices()
</script>

<style scoped lang="scss">
.cps-page {
  min-height: 100vh;
  padding: 80px 20px 34px;
  background: #232932;
  color: #ffffff;
}

.cps-header:deep(.cps-card-header) {
  padding: 12px 20px 8px;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.cps-header:deep(.back-btn) {
  width: 20px;
  height: 20px;
  color: #f5f5f5;
}

.cps-header:deep(.header-right) {
  gap: 18px;
}

.cps-header:deep(.action-btn) {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px;
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.cps-header:deep(.action-btn .action-text) {
  display: none !important;
}

.cps-header:deep(.action-btn .icon) {
  width: 32px !important;
  height: 32px !important;
}

.hero-section {
  margin-bottom: 48px;
}

.hero-title {
  margin: 0 0 14px;
  font-size: 24px;
  line-height: 1.16;
  font-weight: 700;
  color: #ffffff;
}

.hero-desc {
  margin: 0;
  max-width: 330px;
  color: #7f8794;
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: 0;
}

.hero-link {
  border: none;
  padding: 0;
  margin-left: 6px;
  background: transparent;
  color: #9fa6b2;
  font-size: 13px;
  line-height: 1.5;
  text-decoration: underline;
  cursor: pointer;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  line-height: 1.18;
  font-weight: 700;
  color: #ffffff;
}

.income-entry {
  border: none;
  padding: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ffffff;
  font-size: 16px;
  line-height: 1.1;
  font-weight: 500;
  cursor: pointer;
}

.income-arrow {
  width: 8px;
  height: 12px;
  object-fit: contain;
  margin-top: 1px;
}

.node-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-card-item {
  background: #303742;
  border-radius: 18px;
  padding: 18px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.node-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.node-media {
  width: 92px;
  min-width: 92px;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-image {
  width: 82px;
  height: 56px;
  object-fit: contain;
}

.node-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding-top: 12px;
}

.node-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 600;
  color: #ffffff;
}

.node-price-badge {
  min-width: 62px;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  color: #ffd33d;
  background: rgba(85, 88, 56, 0.95);
  white-space: nowrap;
}

.node-desc {
  margin: 0;
  color: #8a919d;
  font-size: 12px;
  line-height: 1.48;
  letter-spacing: 0;
}

.node-buy-btn {
  width: 100%;
  height: 44px;
  margin-top: 2px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffd94b 0%, #ffcc1f 100%);
  color: #121212;
  font-weight: 700;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 10, 15, 0.58);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2100;
}

.sheet-panel {
  position: relative;
  width: 100%;
  background: #313844;
  border-radius: 28px 28px 0 0;
  padding: 10px 32px 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.sheet-handle {
  width: 64px;
  height: 5px;
  border-radius: 999px;
  background: rgba(97, 89, 69, 0.55);
  margin: 0 auto 28px;
}

.sheet-title {
  font-size: 26px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
}

.sheet-divider {
  height: 1px;
  margin: 30px 0 12px;
  background: rgba(255, 255, 255, 0.06);
}

.confirm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 26px 0;
}

.confirm-label {
  color: #8d94a1;
  font-size: 16px;
}

.confirm-value {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.sheet-main-btn {
  width: 100%;
  margin-top: 34px;
}

.success-sheet {
  padding-top: 8px;
  padding-bottom: 16px;
}

.success-confetti {
  position: absolute;
  inset: 0 0 auto;
  height: 172px;
  background:
    radial-gradient(circle at 15% 20%, rgba(27, 137, 255, 0.7) 0 4px, transparent 5px),
    radial-gradient(circle at 82% 16%, rgba(43, 211, 154, 0.7) 0 4px, transparent 5px),
    linear-gradient(105deg, transparent 0 9%, rgba(39, 126, 211, 0.6) 9% 12%, transparent 12% 100%),
    linear-gradient(28deg, transparent 0 82%, rgba(31, 187, 133, 0.45) 82% 85%, transparent 85% 100%);
  pointer-events: none;
  opacity: 0.95;
}

.success-icon-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 26px;
}

.success-icon-circle {
  width: 94px;
  height: 94px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd33d;
  border: 8px solid #ffd33d;
  background: rgba(255, 211, 61, 0.04);
}

.success-check {
  width: 46px;
  height: 46px;
}

.success-subtitle {
  margin-top: 34px;
  text-align: center;
  color: #8e96a2;
  font-size: 17px;
  line-height: 1.4;
}

.success-title {
  margin-top: 20px;
  text-align: center;
  color: #ffffff;
  font-size: 31px;
  font-weight: 700;
  line-height: 1.16;
}

.success-note {
  margin-top: 24px;
  color: #8d94a1;
  font-size: 14px;
  line-height: 1.5;
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.26s ease;
}

.sheet-fade-enter-active .sheet-panel,
.sheet-fade-leave-active .sheet-panel {
  transition: transform 0.26s ease;
}

.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}

.sheet-fade-enter-from .sheet-panel,
.sheet-fade-leave-to .sheet-panel {
  transform: translateY(100%);
}

@media (max-width: 390px) {
  .cps-page {
    padding-left: 16px;
    padding-right: 16px;
  }

  .node-card-item {
    padding-left: 16px;
    padding-right: 16px;
  }

  .node-top {
    gap: 8px;
  }

  .node-media {
    width: 88px;
    min-width: 88px;
  }

  .node-image {
    width: 78px;
    height: 54px;
  }

  .node-title {
    font-size: 18px;
  }
}
</style>
