<template>
  <div class="earnings-page" v-loading="isLoading" :element-loading-text="t('common.loading') || 'Loading...'"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="page-bg"></div>

    <div class="content-wrapper">
      <BackHeaderNav :type="1" />

      <div class="page-header">
        <h1 class="page-title">{{ t('myEarnings.title') }}</h1>
        <div class="page-header-level">
          <span class="time-text">{{ $t("myIncome.myLevel") }}</span>
          <span class="intro-level">
            {{ myIncomeData?.user_level || "S0" }}
          </span>
        </div>
        <p class="page-desc">
          {{ t('myEarnings.desc') }}
        </p>
      </div>

      <!-- Section 1: Earnings Cards -->
      <div class="earnings-cards">
        <!-- Node Earnings -->
        <div class="earning-card" @click="handleNodeEarnings" v-if="myIncomeData.active_node_id">
          <div class="card-left">
            <div class="card-title">{{ t('myEarnings.nodeEarnings') }}</div>
            <div class="card-desc">{{ t('myEarnings.nodeEarningsDesc') }}</div>
          </div>
          <div class="card-right">
            <span class="amount">{{ formatAmount(myIncomeData.node_income) }}</span>
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
            <span class="amount">{{ formatAmount(myIncomeData.staking_income) }}</span>
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
            <span class="amount">{{ formatUsdtAmount(myIncomeData.forecast_income) }}</span>
          </div>
        </div>

        <!-- Sub-coin Earnings -->
        <div class="earning-card">
          <div class="card-left">
            <div class="card-title">{{ t('myEarnings.subCoinEarnings') }}</div>
            <div class="card-desc">{{ t('myEarnings.subCoinEarningsDesc') }}</div>
          </div>
          <div class="card-right">
            <span class="amount">{{ formatAmount(myIncomeData.sub_coin_income) }}</span>
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
            <div class="perf-value">{{ formatUsdtAmount(myIncomeData.team_total_performance) }}</div>
          </div>
          <div class="perf-card">
            <div class="perf-label">{{ t('myEarnings.largeAreaPerformance') }}</div>
            <div class="perf-value">{{ formatUsdtAmount(myIncomeData.major_region_performance) }}</div>
          </div>
          <div class="perf-card">
            <div class="perf-label">{{ t('myEarnings.smallAreaPerformance') }}</div>
            <div class="perf-value">{{ formatUsdtAmount(myIncomeData.minor_region_performance) }}</div>
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
          <div class="tab-item" :class="{ active: activeTab === 'team' }" @click="activeTab = 'team'">
            {{ t('myEarnings.teamPerformanceTab') }}
          </div>
          <div class="tab-item" :class="{ active: activeTab === 'staking' }" @click="activeTab = 'staking'">
            {{ t('myEarnings.stakingDetails') }}
          </div>
        </div>

        <div class="team-list" v-if="activeTab === 'team'">
          <template v-if="teamList.length > 0">
            <div class="list-item" v-for="(item, index) in teamList" :key="index">
              <div class="item-header">
                <img :src="item.avatar" class="avatar" />
                <span class="address">{{ item.address }}</span>
                <div class="badges">
                  <span class="badge level-badge" v-if="item.user_level">
                    <img src="@/assets/icon/level-bg.png" class="badge-icon" v-if="false" />
                    {{ item.user_level }}
                  </span>
                  <span class="badge node-badge" v-if="item.node_level">{{ item.node_level }}</span>
                </div>
              </div>
              <div class="item-stats">
                <div class="stat-col">
                  <div class="stat-label">{{ t('myEarnings.directDailyIncome') }}</div>
                  <div class="stat-value green">{{ item.direct_daily_income }}</div>
                </div>
                <div class="stat-col right-align">
                  <div class="stat-label">{{ t('myEarnings.teamDailyIncome') }}</div>
                  <div class="stat-value green">{{ item.team_daily_income }}</div>
                </div>
                <div class="stat-col">
                  <div class="stat-label">{{ t('myEarnings.directTotalIncome') }}</div>
                  <div class="stat-value green">{{ item.direct_total_income }}</div>
                </div>
                <div class="stat-col right-align">
                  <div class="stat-label">{{ t('myEarnings.teamTotalIncome') }}</div>
                  <div class="stat-value green">{{ item.team_total_income }}</div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="empty-state">
            <img :src="emptyImg" alt="No Data" class="empty-img" />
            <div class="empty-text">{{ t('common.noData') || '暂无记录' }}</div>
          </div>
        </div>

        <div class="staking-list" v-if="activeTab === 'staking'">
          <div class="staking-header" v-if="stakingDetailsList.length > 0">
            <span>{{ t('myEarnings.stakingLevel') }}</span>
            <span>{{ t('myEarnings.stakingCount') }}</span>
          </div>
          <template v-if="stakingDetailsList.length > 0">
            <div class="staking-item" v-for="(item, index) in stakingDetailsList" :key="index">
              <div class="item-left">
                <span class="node-name">{{ item.name }}</span>
                <span class="node-level">{{ item.level }}</span>
              </div>
              <div class="item-right">
                <span class="count">{{ item.count }}</span>
              </div>
            </div>
          </template>
          <div v-else class="empty-state">
            <img :src="emptyImg" alt="No Data" class="empty-img" />
            <div class="empty-text">{{ t('common.noData') }}</div>
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
import avatarImg from '@/assets/icon/LP1.png'
import emptyImg from '@/assets/images/empty.png'
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { formatChoAmount, formatTokenAmount } from '@/utils/format_amount'
import {
  getMyIncome
} from "@/api/API";

const { locale, t } = useI18n();
const router = useRouter();
const { address } = useAccount()

const isLoading = ref(false)

const activeTab = ref('team')

// API Data
const myIncomeData = ref({
  active_node_id: '',
  forecast_income: '0',
  node_income: '0',
  staking_income: '0',
  sub_coin_income: '0',
  team_total_performance: '0',
  major_region_performance: '0',
  minor_region_performance: '0',
  user_level: '',
  direct_performance_list: [],
  staking_detail_list: []
})

const teamList = ref([])
const stakingDetailsList = ref([])

const fetchMyIncomeData = async () => {
  if (!address.value) return
  isLoading.value = true
  try {
    const res = await getMyIncome({ address: address.value })
    const response = res.data || {}
    if (response && response.success) {
      const data = response.data
      myIncomeData.value = response.data

      // Update lists
      teamList.value = data.direct_performance_list.map(item => ({
        address: formatAddress(item.address),
        avatar: item.avatar || avatarImg,
        user_level: item.s_level || '',
        node_level: item.t_level || '',
        direct_daily_income: formatUsdtAmount(item.today_direct_income || 0),
        team_daily_income: formatUsdtAmount(item.today_team_income || 0),
        direct_total_income: formatUsdtAmount(item.total_direct_income || 0),
        team_total_income: formatUsdtAmount(item.total_team_income || 0)
      }))

      stakingDetailsList.value = data.staking_detail_list.map(item => {
        // Map staking_level to name if possible, otherwise use level
        const level = item.staking_level
        let name = level
        // Simple mapping based on T1-T6 if needed, or just display level
        // If needed we can import nodeTypeMap logic or similar
        return {
          name: getNodeNameByLevel(level),
          level: level,
          count: item.count
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch my income:', error)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }
}

// Helper to get node name (simplified version of what might be in other components)
const getNodeNameByLevel = (level) => {
  const map = {
    'T1': t('myIncome.nodeNames.infoNode'),
    'T2': t('myIncome.nodeNames.dataNode'),
    'T3': t('myIncome.nodeNames.validationNode'),
    'T4': t('myIncome.nodeNames.consensusNode'),
    'T5': t('myIncome.superNode'), // Note: key might be slightly different in locales
    'T6': t('myIncome.nodeNames.genesisNode')
  }
  return map[level] || level
}

// Watch for address changes
import { watch, onMounted } from 'vue'

watch(address, (newVal) => {
  if (newVal) {
    fetchMyIncomeData()
  }
})

onMounted(() => {
  if (address.value) {
    fetchMyIncomeData()
  }
})




const formatAddress = (addr) => {
  if (!addr) return ''
  if (addr.length <= 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

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
  const activeNode = myIncomeData.value.active_node_id
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
  background: var(--bg-page-h5, #ffffff);
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
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%);
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
  color: var(--text-color, #000);

  /* Always white on banner */

  .page-header-level {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .time-text {
      font-family:
        PingFang SC,
        PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: var(--text-color, #ffffff);
      opacity: 0.8;
      margin-right: 8px;
    }

    .intro-level {
      display: flex;
      padding: 0px 11px 0px 29px;
      height: 19px;
      width: auto;
      margin-right: 32px;
      background: url("@/assets/icon/level-bg.png");
      background-size: 100% 100%;
      background-repeat: no-repeat;
      font-family: PingFang SC, PingFang SC;
      font-weight: 500;
      font-size: 14px;
      color: #BEF002;
      line-height: 20px;
      text-align: center;
    }
  }
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
  background: var(--bg-card, #1D1D1D);
  border-radius: 8px 8px 8px 8px;
  border: 1px solid var(--border-color, #2F2F2F);
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: var(--text-color, #000);
}


.card-desc {
  font-size: 12px;
  color: var(--text-color-secondary, #666);
}

.card-right {
  display: flex;
  align-items: center;
  gap: 8px;

  .amount {
    font-family: DIN, DIN;
    font-weight: bold;
    font-size: 20px;
    color: var(--text-color-primary, #2FBC87);
    line-height: 16px;
  }
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
  // margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--text-color, #000);
}

.section-desc {
  font-family: DIN, DIN;
  font-weight: 300;
  font-size: 12px;
  color: #909090;
  line-height: 20px;
  margin-bottom: 24px;
}

.performance-scroll-container {
  display: flex;
  overflow-x: auto;
  gap: 10px;

  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */

}

.performance-scroll-container::-webkit-scrollbar {
  display: none;
}

.perf-card {
  box-sizing: border-box;
  min-width: 148px;
  height: 96px;
  flex: 0 0 auto;
  background: var(--bg-card, #1D1D1D);
  border-radius: 8px 8px 8px 8px;
  border: 1px solid var(--border-color, #2F2F2F);
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 9px;

}

/* Team Earnings Section */
.team-earnings-section {
  margin-top: 56px;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
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



.tab-item.active {
  background: var(--text-color, #1D1D1D);
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
  flex-direction: column;
  gap: 10px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color, #2F2F2F);

  &:last-child {
    border-bottom: none;
  }
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--text-color-y, #2FBC87);
  padding: 2px;
  object-fit: cover;
}

.address {
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: var(--text-color, #000);
}

.badges {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: 4px;
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.level-badge {
  padding: 0px 11px 0px 29px;
  height: 20px;
  background: url("@/assets/icon/level-bg.png") no-repeat;
  background-size: 100% 100%;
  color: #BEF002;
}

.node-badge {
  padding: 2px 8px;
  background: rgba(234, 171, 74, 0.15);
  color: #EAAB4A;
}

.item-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  padding-left: 63px;
  box-sizing: border-box;
}



.stat-col {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.right-align {
    align-items: flex-end;
    text-align: right;
  }
}

.stat-label {
  font-size: 12px;
  color: var(--text-color-secondary, #999);
}

.stat-value {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #32B764;
  line-height: 20px;

  &.green {
    color: #2FBC87;
  }
}

.staking-list {
  display: flex;
  flex-direction: column;
}

.staking-header {
  display: flex;
  justify-content: space-between;
  padding: 0 0 12px 0;
  color: var(--text-color-secondary, #666);
  font-size: 12px;
}

.staking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color, #2F2F2F);
}



.node-name {
  font-size: 14px;
  color: var(--text-color, #fff);
}

.node-level {
  background: rgba(217, 119, 6, 0.15);
  font-family: Chakra Petch, Chakra Petch;
  font-weight: bold;
  font-size: 13px;
  color: #EAAB4A;
  line-height: 16px;
  padding: 0 8px;
  border-radius: 4px;
}

:global(.theme-dark) .node-level {
  background: #33281E;
  color: #E6A23C;
}

.staking-item .count {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: var(--text-color-y, #2FBC87);
  line-height: 20px;
}

.perf-label {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: var(--text-color, #000);
  ;
  line-height: 16px;
}

.perf-value {
  font-family: DIN, DIN;
  font-weight: bold;
  font-size: 20px;
  color: #2FBC87;
  line-height: 16px;
  word-break: break-all;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;

  .empty-img {
    width: 96px;
    height: 96px;
    margin-bottom: 12px;
    // opacity: 0.8;
  }

  .empty-text {
    font-size: 14px;
    color: var(--text-color, #fff);
  }
}
</style>
