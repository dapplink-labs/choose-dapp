<template>
  <div class="earnings-page">
    <div class="page-bg"></div>

    <div class="content-wrapper">
      <BackHeaderNav :type="1" />

      <div class="page-header">
        <h1 class="page-title">{{ t('myEarnings.title') }}</h1>
        <p class="page-desc">
          {{ t('myEarnings.desc') }}
        </p>
      </div>

      <!-- Section 1: Earnings Cards -->
      <div class="earnings-cards">
        <!-- Node Earnings -->
        <div class="earning-card" @click="handleNodeEarnings">
          <div class="card-left">
            <div class="card-title">{{ t('myEarnings.nodeEarnings') }}</div>
            <div class="card-desc">{{ t('myEarnings.nodeEarningsDesc') }}</div>
          </div>
          <div class="card-right">
            <span class="amount">{{ formatAmount(0) }}</span>
            <el-icon class="arrow-icon">
              <ArrowRightBold />
            </el-icon>
          </div>
        </div>

        <!-- Staking Earnings -->
        <div class="earning-card" @click="handleStakingEarnings">
          <div class="card-left">
            <div class="card-title">{{ t('myEarnings.stakingEarnings') }}</div>
            <div class="card-desc">{{ t('myEarnings.stakingEarningsDesc') }}</div>
          </div>
          <div class="card-right">
            <span class="amount">{{ formatAmount(0) }}</span>
            <el-icon class="arrow-icon">
              <ArrowRightBold />
            </el-icon>
          </div>
        </div>

        <!-- Flow Earnings -->
        <div class="earning-card">
          <div class="card-left">
            <div class="card-title">{{ t('myEarnings.flowEarnings') }}</div>
            <div class="card-desc">{{ t('myEarnings.flowEarningsDesc') }}</div>
          </div>
          <div class="card-right">
            <span class="amount">{{ formatAmount(0) }}</span>
          </div>
        </div>

        <!-- Sub-coin Earnings -->
        <div class="earning-card">
          <div class="card-left">
            <div class="card-title">{{ t('myEarnings.subCoinEarnings') }}</div>
            <div class="card-desc">{{ t('myEarnings.subCoinEarningsDesc') }}</div>
          </div>
          <div class="card-right">
            <span class="amount">{{ formatAmount(0) }}</span>
          </div>
        </div>
      </div>

      <!-- Section 2: Performance -->
      <div class="performance-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('myEarnings.myPerformance') }}</h2>
          <p class="section-desc">{{ t('myEarnings.performanceDesc') }}</p>
        </div>

        <div class="performance-scroll-container">
          <div class="perf-card">
            <div class="perf-label">{{ t('myEarnings.teamPerformance') }}</div>
            <div class="perf-value">12,345,678</div>
          </div>
          <div class="perf-card">
            <div class="perf-label">{{ t('myEarnings.largeAreaPerformance') }}</div>
            <div class="perf-value">12,345,678</div>
          </div>
          <div class="perf-card">
            <div class="perf-label">{{ t('myEarnings.smallAreaPerformance') }}</div>
            <div class="perf-value">12,345,678</div>
          </div>
        </div>
      </div>

      <!-- Section 3: All Direct Team Earnings -->
      <div class="team-earnings-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('myEarnings.allDirectTeamPerformance') }}</h2>
          <p class="section-desc">{{ t('myEarnings.performanceDesc') }}</p>
        </div>

        <div class="tabs">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'team' }"
            @click="activeTab = 'team'"
          >
            {{ t('myEarnings.teamPerformanceTab') }}
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'staking' }"
            @click="activeTab = 'staking'"
          >
            {{ t('myEarnings.stakingDetails') }}
          </div>
        </div>

        <div class="team-list">
           <div class="list-item" v-for="(item, index) in teamList" :key="index">
              <div class="item-left">
                <img :src="item.avatar" class="avatar" />
                <span class="address">{{ item.address }}</span>
              </div>
              <div class="item-right">
                <span class="plus">+</span>
                <span class="amount">{{ item.amount }} {{ item.token }}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { ArrowRightBold } from '@element-plus/icons-vue'
import { useAccount, useChainId } from '@wagmi/vue'
import avatarImg from '@/assets/icon/avatar.png'
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { formatChoAmount, formatTokenAmount } from '@/utils/format_amount'
import {

} from "@/api/API";

const { locale, t } = useI18n();
const router = useRouter();
const { address } = useAccount()

const activeTab = ref('team')
const teamList = ref([
  { address: '0xb574...4c7d', amount: '32,567', token: 'CHO', avatar: avatarImg },
  { address: '0xb574...4c7d', amount: '32,567', token: 'CHO', avatar: avatarImg },
  { address: '0xb574...4c7d', amount: '32,567', token: 'CHO', avatar: avatarImg },
  { address: '0xb574...4c7d', amount: '32,567', token: 'CHO', avatar: avatarImg },
  { address: '0xb574...4c7d', amount: '32,567', token: 'CHO', avatar: avatarImg },
  { address: '0xb574...4c7d', amount: '32,567', token: 'CHO', avatar: avatarImg },
])



// 格式化金额（CHO为6精度，需要先转换）
const formatAmount = (value) => formatChoAmount(value, { maxFractionDigits: 4, useGrouping: true })
// USDT 金额（18 精度）
const formatUsdtAmount = (value) => {
  return formatTokenAmount(value, {
    decimals: 18,
    maxFractionDigits: 2,
    useGrouping: true,
  });
};
const handleNodeEarnings = () => {
  console.log('Navigate to Node Earnings')
  const activeNode = ""
  // 跳转到 myNode 页面，并传递已激活节点的 id
  router.push({
    path: "/myNode",
    query: {
      id: activeNode ?? "093ba260586549c087ef43b6a1326265",
    },
  });
}

const handleStakingEarnings = () => {
  console.log('Navigate to Staking Earnings')
  router.push('/myIncome')
}

</script>

<style scoped lang="scss">
.earnings-page {
  width: 100%;
  position: relative;
  background-color: var(--bg-page-h5, #FFFFFF);
  min-height: 100vh;
  color: var(--text-color, #000);
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300px;
  background: url("@/assets/images/banner5.png") no-repeat top center;
  background-size: cover;
  z-index: 1;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  padding: 0 16px 32px;
  display: flex;
  flex-direction: column;
}

/* Header Section */
.page-header {
  margin-top: 60px;
  /* Space for BackHeaderNav */
  margin-bottom: 24px;
  color: #fff;
  /* Always white on banner */
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
}

.page-desc {
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.8;
  max-width: 80%;
}

/* Earnings Cards */
.earnings-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.earning-card {
  background: var(--bg-card, #fff);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }
}

.card-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-primary, #000);
}

.card-desc {
  font-size: 12px;
  color: var(--text-color-secondary, #666);
}

.card-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount {
  font-size: 20px;
  font-weight: 600;
  color: #10B981;
  /* Green color for positive value */
  font-family: 'DIN', sans-serif;
  /* Assuming a number font is used */
}

.arrow-icon {
  font-size: 16px;
  color: var(--text-color-secondary, #999);
}

/* Performance Section */
.performance-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-color-primary, #000);
}

.section-desc {
  font-size: 12px;
  color: var(--text-color-secondary, #666);
}

.performance-scroll-container {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 4px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.performance-scroll-container::-webkit-scrollbar {
  display: none;
}

.perf-card {
  min-width: 140px;
  flex: 0 0 auto;
  background: var(--bg-card, #fff);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Team Earnings Section */
.team-earnings-section {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.tab-item {
  padding: 8px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1); 
  color: var(--text-color-secondary, #999);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

:global(.theme-light) .tab-item {
  background: #E0E0E0;
  color: #666;
}

.tab-item.active {
  background: var(--text-color-primary, #fff);
  color: var(--bg-page-h5, #000);
  font-weight: 600;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #10B981;
  padding: 2px;
  object-fit: cover;
}

.address {
  font-size: 16px;
  color: var(--text-color-primary, #fff);
  font-weight: 500;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #10B981;
  font-size: 16px;
  font-weight: 600;
  font-family: 'DIN', sans-serif;
}

.perf-label {
  font-size: 14px;
  color: var(--text-color-secondary, #666);
}

.perf-value {
  font-size: 20px;
  font-weight: 600;
  color: #10B981;
  font-family: 'DIN', sans-serif;
  word-break: break-all;
}

/* Theme Adaptation */
/* Dark Mode Variables - Assuming these are set globally or we define local overrides */
:global(.theme-dark) .earnings-page {
  --bg-page-h5: #000000;
  --bg-card: #1A1A1A;
  --text-color-primary: #FFFFFF;
  --text-color-secondary: #999999;
  --text-color: #FFFFFF;
}

:global(.theme-light) .earnings-page {
  --bg-page-h5: #F5F7FA;
  --bg-card: #FFFFFF;
  --text-color-primary: #000000;
  --text-color-secondary: #666666;
  --text-color: #000000;
}

/* Fallback for when theme class is on body but we want local scoping logic */
@media (prefers-color-scheme: dark) {
  /* Only if no class is present, but usually class is controlled by JS */
}

/* Specific Dark Mode Styles if CSS Variables aren't enough */
:global(.theme-dark) {

  .earning-card,
  .perf-card {
    border: 1px solid #333;
  }
}
</style>
