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
        <el-icon class="dropdown-icon"><CaretBottom /></el-icon>
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
          <span class="card-value">{{ formatEarningsNumber(card.value) }}</span>
          <el-icon v-if="card.hasArrow" class="arrow-icon"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { View, Hide, CaretBottom, ArrowRight } from '@element-plus/icons-vue'

const { t } = useI18n()

const showAssets = ref(true)
const stakingTotal = ref(2263.23)
const todayProfit = ref(800.00)
const todayProfitRate = ref(200)

const earningsCards = ref([
  {
    title: '节点收益',
    desc: '母币交易手续费收益',
    value: 12345678,
    hasArrow: true
  },
  {
    title: '质押收益',
    desc: '预测平台母币质押收益',
    value: 12345678,
    hasArrow: true
  },
  {
    title: '流水收益',
    desc: '预测平台交易流水收益',
    value: 12345678,
    hasArrow: false
  },
  {
    title: '子币收益',
    desc: '事件预言机收益',
    value: 12345678,
    hasArrow: false
  },
  {
    title: '预测平台FOMO池金额',
    desc: '预测平台盈利金额的*10%，分给当天质押6000U/14000U用户',
    value: 12345678,
    hasArrow: false
  }
])

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

const formatEarningsNumber = (num) => {
  if (typeof num !== 'number') return '0'
  return num.toLocaleString('en-US')
}

const handleCardClick = (card) => {
  if (card.hasArrow) {
    console.log('Navigate to details for', card.title)
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
        color: #2FBC87;
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
        color: #2FBC87;
      }

      .arrow-icon {
        font-size: 16px;
        color: var(--text-gray, rgba(255, 255, 255, 0.5));
      }
    }
  }
}
</style>