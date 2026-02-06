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
            <span class="amount">{{ formatAmount(choIncome) }}</span>
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
            <span class="amount">{{ formatAmount(currentNodeStakingInfo?.total_reward) }}</span>
            <el-icon class="arrow-icon">
              <ArrowRightBold />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- Section 2: Performance -->
      <div class="performance-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('myEarnings.myPerformance') }}</h2>
          <p class="section-desc">{{ t('myEarnings.performanceDesc') }}</p>
        </div>

        <div class="performance-grid">
          <div class="perf-card">
            <div class="perf-label">{{ t('myEarnings.teamPerformance') }}</div>
            <div class="perf-value">12,345,678</div>
          </div>
          <div class="perf-card">
            <div class="perf-label">{{ t('myEarnings.directTeamPerformance') }}</div>
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { ArrowRightBold } from '@element-plus/icons-vue'
import { useAccount, useChainId } from '@wagmi/vue'
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { formatChoAmount, formatTokenAmount } from '@/utils/format_amount'
import {
  getNodeStakingInfo,
  getNodeStakingRecords,
  getNodeServiceProvidersInfo
} from "@/api/API";

const { locale, t } = useI18n();
const router = useRouter();
const { address } = useAccount()
const choIncome = ref('0') // 个人节点收益


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
      id: activeNode ?? "",
    },
  });
}

const handleStakingEarnings = () => {
  console.log('Navigate to Staking Earnings')
  router.push('/myIncome')
}
// 获取节点质押记录
const getNodeStakingRecordsList = async () => {
  const res =
    (await getNodeStakingRecords({ address: address.value }))?.data?.data
      ?.list || [];
  myNodes.value = res.map((item) => {
    return {
      id: item.id,
      nodeName: t(nodeTypeMap[item.type]?.nodeNameKey || ""),
      nodeTag: nodeTypeMap[item.type]?.nodeTag || "",
      purchaseTime: formatDateTime(item.created),
      status: item.status,
      round: item.round,
    };
  });
  currentNodeStakingInfo.value = myNodes.value[0] ? myNodes.value[0] : {};
  fetchNodeStakingInfo();
 
};
// 获取节点质押信息
// 进度条：总收益 / 预估收益
// 总收益 = 静态收益 + 直推收益 + 团队收益 + 平级收益 + 流水分红
// 如果当前节点是创世节点（T6），还要加上创世节点5%收益
// 如果当前节点是超级节点（T5），还要加上超级节点收益
// 预估收益 = forecast_income
// 静态收益 = node_reward
// 直推收益 = direct_reward
// 团队收益 = team_reward
// 平级收益 = lateral_reward
// 流水分红 = dividend_reward
// 创世节点5%收益 = creation_reward
// 超级节点收益 = super_node_reward
const fetchNodeStakingInfo = async () => {
  if (!currentNodeStakingInfo.value?.id) return;
  const res = await getNodeStakingInfo({
    address: address.value,
    staking_order_id: currentNodeStakingInfo.value.id,
    round: currentNodeStakingInfo.value.round,
  });

  const data = res?.data?.data || {};
  data.id = currentNodeStakingInfo.value.id;
  data.name = t(nodeTypeMap[data.node_level]?.nodeNameKey || "");
  currentNodeStakingInfo.value = data;


};

async function init() {
    await getNodeServiceProvidersInfo({
        id: String(route.query.id || ''),
        address: address.value
    }).then(res => {
        const data = res?.data?.data?.provider_info || {}
        choIncome.value = data.total_reward ?? '0'
      
    }).catch(err => {
        console.error('获取节点收益详情失败：', err)
    })

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

.performance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.perf-card {
  background: var(--bg-card, #fff);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
