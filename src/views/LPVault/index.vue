<template>
  <div class="lpvault-page">
    <BackHeaderNav
      class="lpvault-header"
      :show-record-btn="true"
      :show-open-btn="true"
      :type="2"
      action-mode="icon"
      :action-icon-size="32"
      :record-icon-src="recordIcon"
      :open-icon-src="shareIcon"
    />

    <section class="hero-section">
      <div class="hero-copy">
        <h1 class="hero-title">{{ $t('lpVault.title') }}</h1>
        <p class="hero-desc">
          {{ $t('lpVault.desc') }}
          <button type="button" class="hero-link" @click="handleOpenMore">{{ $t('lpVault.learnMore') }}</button>
        </p>
      </div>
    </section>

    <StakingSuccessModal
      v-model:visible="showSuccessModal"
      :nodeLevel="activatedNodeType"
      :nodeName="activatedNodeName"
    />

    <div class="section-heading">
      <span class="section-title">{{ $t('lpVault.nodeStakingSection') }}</span>
      <button type="button" class="income-entry" @click="handleOpenMyIncome">
        <span>{{ $t('lpVault.myLPIncome') }}</span>
        <img :src="arrowRightIcon" :alt="$t('lpVault.myLPIncome')" class="income-arrow" />
      </button>
    </div>

    <div class="staking-card-list">
      <article v-for="node in nodeList" :key="node.type" class="staking-card">
        <div class="card-header">
          <div class="card-illustration-wrap">
            <img :src="nodeIllustration" :alt="node.name" class="card-illustration" />
          </div>

          <div class="card-headline">
            <h2 class="card-title">{{ node.name }}</h2>
            <div class="card-badges">
              <span class="info-badge price-badge">{{ node.price }} U</span>
              <span class="info-badge level-badge">{{ node.nodeLevel }}</span>
            </div>
          </div>
        </div>

        <div class="card-metrics">
          <div class="metric-block">
            <div class="metric-label">{{ $t('lpVault.dailyEarnings') }}</div>
            <div class="metric-value metric-green">{{ node.node_min_income }}%-{{ node.node_max_income }}%</div>
          </div>
          <div class="metric-block metric-center">
            <div class="metric-label">{{ $t('lpVault.cycleDays') }}</div>
            <div class="metric-value">{{ node.cycleDays }}</div>
          </div>
          <div class="metric-block metric-right">
            <div class="metric-label">{{ $t('lpVault.totalEarnings') }}</div>
            <div class="metric-value total-value">
              <img class="total-icon" :src="tIcon" alt="T" />
              <span>{{ node.totalEarnings }}</span>
            </div>
          </div>
        </div>

        <PrimaryActionButton
          class="stake-button"
          :disabled="String(node.nodeLevel) === 'T6'"
          height="44px"
          radius="12px"
          font-size="16px"
          @click="String(node.nodeLevel) !== 'T6' && handleActivate(node.type)"
        >
          {{ $t('lpVault.activateStakingShort') }}
        </PrimaryActionButton>
      </article>
    </div>
  </div>
</template>

<script setup>
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import PrimaryActionButton from '@/components/PrimaryActionButton.vue'
import StakingSuccessModal from '@/components/StakingSuccessModal.vue'
import tIcon from '@/assets/icon/TIcon.png'
import { useLPVault } from './useLPVault.js'

const iconModules = import.meta.glob('@/assets/new_icon/LPVault/*.{png,svg}', { eager: true })
const iconMap = Object.fromEntries(
  Object.entries(iconModules).map(([path, mod]) => {
    const fileName = path.split('/').pop() || path
    const name = fileName.replace(/\.(png|svg)$/i, '')
    return [name, mod.default]
  }),
)
const getIcon = (name) => iconMap[name]

const arrowRightIcon = getIcon('lpvault-arrow-right')
const nodeIllustration = getIcon('lpvault-node-illustration')
const recordIcon = getIcon('lpvault-records')
const shareIcon = getIcon('lpvault-share')

const {
  handleOpenMore,
  handleOpenMyIncome,
  nodeList,
  handleActivate,
  showSuccessModal,
  activatedNodeType,
  activatedNodeName,
} = useLPVault()
</script>

<style scoped lang="scss">
.lpvault-page {
  min-height: 100vh;
  padding: 80px 20px 34px;
  background: #232933;
  color: #ffffff;
}

.lpvault-header:deep(.cps-card-header) {
  padding: 12px 20px 8px;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.lpvault-header:deep(.back-btn) {
  width: 20px;
  height: 20px;
}

.lpvault-header:deep(.header-right) {
  gap: 18px;
}

.lpvault-header:deep(.action-btn) {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px;
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.lpvault-header:deep(.action-btn .action-text) {
  display: none !important;
}

.lpvault-header:deep(.action-btn .icon) {
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
  color: #8d94a1;
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

.staking-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.staking-card {
  background: #303742;
  border-radius: 18px;
  padding: 18px 16px 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.card-illustration-wrap {
  width: 92px;
  min-width: 92px;
  flex-shrink: 0;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-illustration {
  width: 82px;
  height: 56px;
  object-fit: contain;
}

.card-headline {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding-top: 12px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 600;
  color: #ffffff;
}

.card-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-badge {
  min-width: 0;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  color: #f3d04d;
  background: rgba(85, 88, 56, 0.95);
  white-space: nowrap;
}

.card-metrics {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.metric-block {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.metric-center {
  align-items: center;
  text-align: center;
}

.metric-right {
  align-items: flex-end;
  text-align: right;
}

.metric-label {
  position: relative;
  display: inline-block;
  color: #8d94a1;
  font-size: 12px;
  line-height: 1.3;
  padding-bottom: 7px;
}

.metric-label::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-bottom: 1px dashed rgba(156, 164, 177, 0.9);
}

.metric-value {
  margin-top: 14px;
  font-size: 17px;
  line-height: 1.15;
  font-weight: 700;
  color: #ffffff;
}

.metric-green {
  color: #2bd39a;
}

.total-value {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  line-height: 1;
}

.total-value span {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.total-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}

.stake-button {
  margin-top: 18px;
}
</style>
