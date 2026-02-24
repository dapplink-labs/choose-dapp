<template>
  <div class="prediction-container">
    <!-- 收益盈亏部分 -->
    <div class="profit-loss-section">
      <div class="profit-loss-header">
        <div class="header-title-wrapper">
          <h2 class="section-title">{{ $t('assetManagement.profitLoss') }}</h2>
          <el-icon class="eye-icon" @click="toggleProfitVisibility">
            <View v-if="showProfit" />
            <Hide v-else />
          </el-icon>
        </div>
        <div class="time-selector">
          <div
            v-for="(period, index) in timePeriods"
            :key="index"
            :class="['time-item', { active: selectedPeriod === period.value }]"
            @click="selectPeriod(period.value)"
          >
            {{ period.label }}
          </div>
        </div>
      </div>
      <div class="profit-value">
        <span v-if="showProfit" class="value-number">{{ formatCurrency(profitAmount) }}</span>
        <span v-else class="value-number">****</span>
      </div>
    </div>

    <!-- 图表部分 -->
    <div class="chart-section">
      <div ref="chartRef" class="chart-container"></div>
    </div>

    <!-- 奖励领取部分 -->
    <div class="reward-section">
      <div class="reward-table">
        <!-- 表头 -->
        <div class="reward-header-row">
          <div class="reward-col reward-col-left">
            <span class="reward-header-text">{{ $t('assetManagement.winnings') }}</span>
          </div>
          <div class="reward-col reward-col-middle">
            <span class="reward-header-text">{{ $t('assetManagement.amountWon') }}</span>
          </div>
          <div class="reward-col reward-col-right">
            <span class="reward-header-text">{{ $t('assetManagement.action') }}</span>
          </div>
        </div>

        <!-- 数据行 -->
        <div class="reward-data-row">
          <div class="reward-col reward-col-left">
            <span class="reward-number">{{ rewardData.winnings }}</span>
          </div>
          <div class="reward-col reward-col-middle">
            <span class="reward-amount">{{ formatCurrency(rewardData.amount) }}</span>
          </div>
          <div class="reward-col reward-col-right">
            <button class="claim-btn" @click="handleClaim" :disabled="rewardData.winnings === 0">
              {{ $t('assetManagement.claim') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 仓位列表 -->
    <PositionList />

    <!-- 领取成功弹窗 -->
    <ClaimSuccess
      v-model="showClaimSuccess"
      :amount="rewardData.amount"
      token-symbol="USDT"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { View, Hide } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import PositionList from './PositionList.vue'
import ClaimSuccess from './ClaimSuccess.vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 根据主题切换图表用到的颜色（注意：ECharts 不支持 CSS 变量，这里用真实颜色值）
const chartColors = computed(() => {
  if (isDark.value) {
    return {
      axisLabel: '#A0A0A0',
      splitLine: 'rgba(255, 255, 255, 0.06)',
      tooltipBg: '#141414',
      tooltipText: '#F4F4F4',
      tooltipBorder: '#23262F',
      chartBg: '#050505'
    }
  }

  return {
    axisLabel: '#5A5F74',
    splitLine: 'rgba(0, 0, 0, 0.06)',
    tooltipBg: '#FFFFFF',
    tooltipText: '#18191D',
    tooltipBorder: '#E0E0E0',
    chartBg: '#FFFFFF'
  }
})

// 显示/隐藏收益
const showProfit = ref(true)

// 时间周期选择
const timePeriods = computed(() => [
  { label: t('assetManagement.timePeriod1d'), value: '1d' },
  { label: t('assetManagement.timePeriod1w'), value: '1w' },
  { label: t('assetManagement.timePeriod1m'), value: '1m' },
  { label: t('assetManagement.timePeriodAll'), value: 'all' }
])
const selectedPeriod = ref('all')

// 收益金额
const profitAmount = ref(329263.23)

// 奖励数据
const rewardData = ref({
  winnings: 2,
  amount: 1000.26
})

// 领取成功弹窗
const showClaimSuccess = ref(false)

// 图表相关
const chartRef = ref(null)
let myChart = null

// 切换收益显示/隐藏
const toggleProfitVisibility = () => {
  showProfit.value = !showProfit.value
}

// 选择时间周期
const selectPeriod = (value) => {
  selectedPeriod.value = value
  // TODO: 根据选择的时间周期更新图表数据
  updateChart()
}

// 格式化货币
const formatCurrency = (num) => {
  if (typeof num !== 'number') return '$0.00'
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  myChart = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!myChart) return

  // 模拟数据 - 根据图片描述，有正负值的柱状图
  const data = [
    { value: 116220, color: '#2FBC87' },
    { value: 85000, color: '#2FBC87' },
    { value: -80000, color: '#E44096' },
    { value: 180000, color: '#2FBC87' },
    { value: 150000, color: '#2FBC87' },
    { value: -180000, color: '#E44096' },
    { value: 200000, color: '#2FBC87' },
    { value: 378160, color: '#2FBC87' },
    { value: 430000, color: '#2FBC87' },
    { value: 116220, color: '#2FBC87' },
    { value: 180000, color: '#2FBC87' },
    { value: 116220, color: '#2FBC87' }
  ]

  const colors = chartColors.value

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '15%',
      right: '5%',
      top: '10%',
      bottom: '10%',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: data.map((_, index) => ''),
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors.splitLine,
          type: 'dashed',
          opacity: 0.6
        }
      },
      axisLabel: {
        color: colors.axisLabel,
        fontSize: 11,
        formatter: (value) => {
          const absValue = Math.abs(value)
          if (absValue >= 1000000) {
            return `${(value / 1000000).toFixed(2)}M`
          } else if (absValue >= 1000) {
            return `${(value / 1000).toFixed(2)}k`
          }
          return value.toFixed(0)
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: data.map(item => ({
          value: item.value,
          itemStyle: {
            color: item.value >= 0 ? '#2FBC87' : '#E44096',
            borderRadius: item.value >= 0 ? [3, 3, 0, 0] : [0, 0, 3, 3]
          }
        })),
        barWidth: '50%',
        barGap: '30%',
        label: {
          show: false
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: {
        color: colors.tooltipText
      },
      formatter: (params) => {
        const value = params[0].value
        return `${formatCurrency(value)}`
      }
    }
  }

  myChart.setOption(option)
}

// 处理领取奖励
const handleClaim = () => {
  if (rewardData.value.winnings === 0) return
  // 实际项目中这里应该先调领取接口，成功后再弹窗
  showClaimSuccess.value = true
}

// 窗口大小改变时调整图表
const handleResize = () => {
  if (myChart) {
    myChart.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) {
    myChart.dispose()
  }
})

// 监听主题变化，更新图表
watch(() => themeStore.isDark, () => {
  if (myChart) {
    updateChart()
  }
})
</script>

<style scoped lang="scss">
.prediction-container {
  padding: 16px;
  padding-bottom: 32px;
  background-color: var(--bg-page-h5);
  color: var(--text-color);
  min-height: calc(100vh - 60px);
}

// 收益盈亏部分
.profit-loss-section {

  .profit-loss-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: nowrap;
    width: 100%;
    gap: 12px;

    .header-title-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color, rgba(255, 255, 255, 1));
      margin: 0;
      white-space: nowrap;
    }

    .eye-icon {
      cursor: pointer;
      color: var(--text-color, rgba(255, 255, 255, 1));
      font-size: 18px;
      transition: color 0.2s;
      flex-shrink: 0;

      &:hover {
        opacity: 0.8;
      }
    }

    .time-selector {
      display: flex;
      gap: 4px;
      align-items: center;
      flex-shrink: 0;
      margin-left: auto;

      .time-item {
        padding: 6px 12px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-gray, rgba(255, 255, 255, 0.7));
        cursor: pointer;
        border-radius: 20px;
        transition: all 0.2s;
        white-space: nowrap;

        &.active {
          background-color: var(--text-color, rgba(255, 255, 255, 1));
          color: var(--bg-page-h5, #000000);
          font-weight: 600;
        }

        &:hover:not(.active) {
          color: var(--text-color);
        }
      }
    }
  }

  .profit-value {
    .value-number {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-color);
      line-height: 1.2;
    }
  }
}

// 图表部分
.chart-section {
  margin-top: 20px;
  
  .chart-container {
    width: 100%;
    height: 240px;
    border-radius: 12px;
  }
}

// 奖励部分（单行表格卡片）
.reward-section {
  margin-top: 24px;
  background-color: var(--bg-card, #1e1e1e);
  border-radius: 14px;
  padding: 14px;
  border: 1px solid var(--border-color, #23262F);

  .reward-table {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .reward-header-row,
  .reward-data-row {
    display: flex;
    align-items: center;
  }

  .reward-header-row {
    margin-bottom: 4px;

    .reward-header-text {
      font-size: 13px;
      color: var(--text-gray, rgba(255, 255, 255, 0.6));
    }
  }

  .reward-data-row {
    .reward-number {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-color);
    }

    .reward-amount {
      font-size: 20px;
      font-weight: 600;
      color: #2FBC87;
    }
  }

  .reward-col {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .reward-col-left {
    justify-content: flex-start;
  }

  .reward-col-middle {
    justify-content: center;
  }

  .reward-col-right {
    justify-content: flex-end;
  }

  .claim-btn {
    padding: 8px 22px;
    background: linear-gradient(90deg, #c8ff2d 0%, #b3ff1a 100%);
    color: #0a0a0a;
    border: none;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(200, 255, 45, 0.35);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(200, 255, 45, 0.45);
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// 浅色主题适配
:deep(.theme-light) {
  .chart-section,
  .reward-section {
    background-color: var(--bg-card, #ffffff);
    border-color: var(--border-color, #E0E0E0);
  }

  .time-selector .time-item.active {
    background-color: var(--text-color, #000000);
    color: var(--bg-page-h5, #FCFCFC);
  }
}

</style>

