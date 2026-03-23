<template>
  <div class="staking-container">
    <!-- 质押估值 -->
    <div class="total-assets-section">
      <div class="assets-header">
        <div class="assets-title-wrapper">
          <h2 class="assets-title">{{ $t('assetManagement.totalAssets') || '总资产估值' }}</h2>
          <el-icon class="eye-icon" @click="toggleAssetsVisibility">
            <View v-if="showAssets" />
            <Hide v-else />
          </el-icon>
        </div>
      </div>
      <div class="assets-value">
        <span v-if="showAssets" class="value-number">{{ formatNumber(stakingTotal) }}</span>
        <span v-else class="value-number">****</span>
        <span class="value-unit">USDT</span>
        <el-icon class="dropdown-icon">
          <CaretBottom />
        </el-icon>
      </div>
      <div class="today-profit">
        <span class="label">今日：</span>
        <span class="profit-value positive">+{{ formatCurrency(todayProfit) }} (+{{ todayProfitRate }}%)</span>
      </div>
    </div>

    <!-- 收益卡片列表 -->
    <div class="earnings-cards">
      <div class="earning-card" v-for="(card, index) in earningsCards" :key="index" @click="handleCardClick(card)">
        <div class="card-left">
          <div class="card-title">{{ card.title }}</div>
          <div class="card-desc">{{ card.desc }}</div>
        </div>
        <div class="card-right">
          <span class="card-value">{{ card.value }}</span>
          <el-icon v-if="card.hasArrow" class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { View, Hide, CaretBottom, ArrowRight } from '@element-plus/icons-vue'
import { useAccount } from '@wagmi/vue'
import { getMyIncome } from "@/api/API"
import { formatChoAmount, formatTokenAmount } from '@/utils/format_amount'

const { t } = useI18n()
const router = useRouter()
const { address } = useAccount()

const showAssets = ref(true)
const stakingTotal = ref(2263.23)
const todayProfit = ref(800.00)
const todayProfitRate = ref(200)

const myIncomeData = ref({
  node_income: '0',
  staking_income: '0',
  forecast_income: '0',
  sub_coin_income: '0',
  fomo_pool_income: '0'
})

const fetchMyIncomeData = async () => {
  if (!address.value) return
  try {
    const res = await getMyIncome({ address: address.value })
    if (res?.data?.success) {
      myIncomeData.value = res.data.data
      updateEarningsCards()
    }
  } catch (error) {
    console.error('Failed to fetch my income:', error)
  }
}

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

const formatAmount = (value) => formatChoAmount(value, { maxFractionDigits: 4, useGrouping: true })
const formatUsdtAmount = (value) => formatTokenAmount(value, { decimals: 18, maxFractionDigits: 2, useGrouping: true })

const earningsCards = ref([])

const updateEarningsCards = () => {
  const cards = []

  if (myIncomeData.value.active_node_id) {
    cards.push({
      id: 'node',
      title: t('myEarnings.nodeEarnings') || '节点收益',
      desc: t('myEarnings.nodeEarningsDesc') || '母币交易手续费收益',
      value: formatAmount(myIncomeData.value.node_income),
      hasArrow: true
    })
  }

  cards.push(
    {
      id: 'staking',
      title: t('myEarnings.stakingEarnings') || '质押收益',
      desc: t('myEarnings.stakingEarningsDesc') || '预测平台母币质押收益',
      value: formatAmount(myIncomeData.value.staking_income),
      hasArrow: true
    },
    {
      id: 'flow',
      title: t('myEarnings.flowEarnings') || '流水收益',
      desc: t('myEarnings.flowEarningsDesc') || '预测平台交易流水收益',
      value: formatUsdtAmount(myIncomeData.value.forecast_income),
      hasArrow: false
    },
    {
      id: 'subCoin',
      title: t('myEarnings.subCoinEarnings') || '子币收益',
      desc: t('myEarnings.subCoinEarningsDesc') || '事件预言机收益',
      value: formatAmount(myIncomeData.value.sub_coin_income),
      hasArrow: false
    },
    {
      id: 'fomoPool',
      title: t('myEarnings.fomoPoolEarnings') || '预测平台FOMO池金额',
      desc: t('myEarnings.fomoPoolEarningsDesc') || '预测平台盈利金额的*10%，分给当天质押6000U/14000U用户',
      value: formatAmount(myIncomeData.value.fomo_pool_income),
      hasArrow: false
    }
  )

  earningsCards.value = cards
}

// 初始化默认值
updateEarningsCards()

const toggleAssetsVisibility = () => {
  showAssets.value = !showAssets.value
}

const formatNumber = (num) => {
  if (typeof num !== 'number') return '0'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatCurrency = (num) => {
  if (typeof num !== 'number') return '$0.00'
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const handleCardClick = (card) => {
  if (!card.hasArrow) return

  if (card.id === 'node') {
    const activeNode = myIncomeData.value.active_node_id
    router.push({
      path: "/myNode",
      query: {
        id: activeNode ?? "093ba260586549c087ef43b6a1326265",
      },
    })
  } else if (card.id === 'staking') {
    router.push('/myIncome')
  }
}
</script>

<style scoped lang="scss">
.staking-container {
  padding: 16px;
  padding-bottom: 32px;
}

// 总资产估值
.total-assets-section {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
  padding-bottom: 24px;

  .assets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .assets-title-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .assets-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
      margin: 0;
    }

    .eye-icon {
      cursor: pointer;
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
      font-size: 20px;
    }
  }

  .assets-value {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;

    .value-number {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-color);
      line-height: 1.2;
    }

    .value-unit {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
    }

    .dropdown-icon {
      font-size: 12px;
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
      margin-left: 4px;
    }
  }

  .today-profit {
    font-size: 14px;

    .label {
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
    }

    .profit-value {
      font-weight: 500;

      &.positive {
        color: var(--text-color-y, #BBFF2E);
      }
    }
  }
}

// 收益卡片列表
.earnings-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .earning-card {
    background: var(--bg-card, #1E1E1E);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
    cursor: pointer;

    .card-left {
      flex: 1;
      padding-right: 16px;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 8px;
      }

      .card-desc {
        font-size: 12px;
        color: var(--text-gray, rgba(255, 255, 255, 0.5));
        line-height: 1.4;
      }
    }

    .card-right {
      display: flex;
      align-items: center;
      gap: 8px;

      .card-value {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color-y, #BBFF2E);
      }

      .arrow-icon {
        font-size: 16px;
        color: var(--text-gray, rgba(255, 255, 255, 0.5));
      }
    }
  }
}
</style>