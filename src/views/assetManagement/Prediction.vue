<template>
  <div class="prediction-container">
    <!-- 预估总资产 -->
    <div class="total-assets-section">
      <div class="assets-header">
        <div class="assets-title-wrapper">
          <h2 class="assets-title">{{ $t('assetManagement.totalAssets') || '预估总资产' }}</h2>
          <el-icon class="eye-icon" @click="toggleAssetsVisibility">
            <View v-if="showAssets" />
            <Hide v-else />
          </el-icon>
        </div>
      </div>
      <div class="assets-value">
        <span v-if="showAssets" class="value-number">{{ formatNumber(predictionTotal) }}</span>
        <span v-else class="value-number">****</span>
        <span class="value-unit">USDT</span>
        <!-- <el-icon class="dropdown-icon">
          <CaretBottom />
        </el-icon> -->
      </div>
      <!-- <div class="today-profit">
        <span class="label">今日盈亏：</span>
        <span class="profit-value positive">+{{ formatCurrency(todayProfit) }} (+{{ todayProfitRate }}%)</span>
      </div> -->
    </div>

    <!-- 收益盈亏部分 -->
    <div class="profit-loss-section">
      <div class="profit-loss-header">
        <div class="header-title-wrapper">
          <h2 class="section-title">{{ $t('assetManagement.profitLoss') || '收益盈亏' }}</h2>
        </div>
        <div class="time-selector">
          <div v-for="(period, index) in timePeriods" :key="index"
            :class="['time-item', { active: selectedPeriod === period.value }]" @click="selectPeriod(period.value)">
            {{ period.label }}
          </div>
        </div>
      </div>
      <div class="profit-value">
        <span :class="['value-number', profitAmount >= 0 ? 'positive' : 'negative']">
          {{ profitAmount > 0 ? '+' : (profitAmount < 0 ? '-' : '') }} {{ formatCurrency(Math.abs(profitAmount)) }}
        </span>
      </div>
      <div class="history-label">历史累计</div>
    </div>

    <!-- 图表部分 -->
    <div class="chart-section">
      <div ref="chartRef" class="chart-container"></div>
    </div>

    <!-- 奖励领取部分 -->
    <!-- <div class="reward-section">
      <div class="reward-box">
        <span class="reward-number">{{ rewardData.winnings }}</span>
        <span class="reward-amount positive">+{{ formatCurrency(rewardData.amount) }}</span>
        <button class="claim-btn" @click="handleClaim" :disabled="rewardData.winnings === 0">
          Claim
        </button>
      </div>
    </div> -->

    <!-- 仓位列表 -->
    <PositionList />

    <!-- 领取成功弹窗 -->
    <ClaimSuccess v-model="showClaimSuccess" :amount="rewardData.amount" token-symbol="USDT" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { View, Hide, CaretBottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useAccount } from '@wagmi/vue'
import PositionList from './PositionList.vue'
import ClaimSuccess from './ClaimSuccess.vue'
import { claimOrder, getUserPnl, getUserStat, getUserPositionsSummary } from '@/api/APIEvent'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
const { address } = useAccount()
// 格式化数字（添加千分位）
const formatNumber = (num) => {
  if (typeof num !== 'number') return '0'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
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
const showAssets = ref(true)

// 数据
const predictionTotal = ref(0)
const todayProfit = ref(0)
const todayProfitRate = ref(0)

// 时间周期选择
const timePeriods = computed(() => [
  { label: '1天', value: '1d' },
  { label: '1周', value: '1w' },
  { label: '1月', value: '1m' },
  { label: '全部', value: 'all' }
])
const selectedPeriod = ref('all')

// 收益金额
const profitAmount = ref(0)
const pnlPoints = ref([])
const statLoading = ref(false)
const statSummary = ref({})
const pnlLoading = ref(false)

// 奖励数据
const rewardData = ref({
  winnings: 2,
  amount: 3.27
})

// 领取成功弹窗
const showClaimSuccess = ref(false)

// 图表相关
const chartRef = ref(null)
let myChart = null

// 切换收益显示/隐藏
const toggleAssetsVisibility = () => {
  showAssets.value = !showAssets.value
}

// 选择时间周期
const selectPeriod = async (value) => {
  selectedPeriod.value = value
  await refreshPredictionData()
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

const toNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const formatXAxisLabel = (isoLike) => {
  const d = new Date(isoLike)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  if (selectedPeriod.value === '1d') return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}

const fetchPnlAndRender = async () => {
  const addr = address?.value || ''
  if (!addr) return

  pnlLoading.value = true
  try {
    const res = await getUserPnl({
      user_address: addr || '',
      range: selectedPeriod.value,
    })
    const code = res?.data?.code
    if (!(code === 0 || code === 200 || code === 2000)) {
      throw new Error(res?.data?.message || 'fetch pnl failed')
    }

    const data = res?.data?.data || {}
    const pts = Array.isArray(data.data_points) ? data.data_points : []
    pnlPoints.value = pts

    const last = pts.length ? pts[pts.length - 1] : null
    const statProfitLost = toNumber(statSummary.value?.profit_lost)
    if (selectedPeriod.value === 'all' && statProfitLost !== 0) {
      profitAmount.value = statProfitLost
    } else {
      profitAmount.value = last ? toNumber(last.profit_lost) : 0
    }
    updateChart()
  } catch (e) {
    pnlPoints.value = []
    profitAmount.value = 0
    updateChart()
    ElMessage.error(e?.message || 'fetch pnl failed')
  } finally {
    pnlLoading.value = false
  }
}

const fetchUserStat = async () => {
  const addr = address?.value || ''
  if (!addr) return

  statLoading.value = true
  try {
    const res = await getUserStat({
      user_address: addr,
    })
    const code = res?.data?.code
    if (!(code === 0 || code === 200 || code === 2000)) {
      throw new Error(res?.data?.message || 'fetch stat failed')
    }
    statSummary.value = res?.data?.data || null
  } catch (e) {
    statSummary.value = null
    ElMessage.error(e?.message || 'fetch stat failed')
  } finally {
    statLoading.value = false
  }
}

const fetchSummaryData = async () => {
  const addr = address?.value || ''
  if (!addr) return

  try {
    const res = await getUserPositionsSummary({
      user_address: addr
    })
    const code = res?.data?.code
    if (code === 0 || code === 200 || code === 2000) {
      const summary = res.data.data || {}
      predictionTotal.value = toNumber(summary.total_position_value)
    }
  } catch (e) {
    console.error('fetch summary failed', e)
  }
}

const refreshPredictionData = async () => {
  await fetchSummaryData()
  await fetchUserStat()
  await fetchPnlAndRender()
}

// 更新图表
const updateChart = () => {
  if (!myChart) return
  console.log('pnlPoints', pnlPoints.value)
  const points = pnlPoints.value
  const values = points.map(p => toNumber(p?.profit_lost))
  const labels = points.map(p => formatXAxisLabel(p?.timestamp))
  // 模拟数据 - 面积图数据
  const data = [
    // { value: 0 },
    // { value: 0 },
    // { value: 0 },
    // { value: 50 },
    // { value: 50 },
    // { value: 120 },
    // { value: 120 },
    // { value: 120 },
    // { value: 110 },
    // { value: 120 },
    // { value: 120 },
    // { value: 120 }
  ]

  const colors = chartColors.value

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '0%',
      right: '0%',
      top: '5%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false,
      }
    },
    yAxis: {
      type: 'value',
      position: 'right',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        color: colors.axisLabel,
        fontSize: 11,
        formatter: (value) => {
          return `$${value.toFixed(2)}`
        }
      }
    },
    series: [
      {
        type: 'line',
        step: 'start', // 实现阶梯线效果
        data: values,
        itemStyle: {
          color: '#2FBC87'
        },
        lineStyle: {
          color: '#2FBC87',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(47, 188, 135, 0.5)' },
            { offset: 1, color: 'rgba(47, 188, 135, 0)' }
          ])
        },
        showSymbol: false
      }
    ],
    tooltip: {
      trigger: 'axis',
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

// // 处理领取奖励
// const handleClaim = async () => {
//   if (rewardData.value.winnings === 0) return


//   const payload = {
//     amount: String(rewardData.value.winnings ?? ''),
//     asset_guid: rewardData.value.asset_guid,
//     event_guid: rewardData.value.event_guid,
//     outcome: String(rewardData.value.outcome || '').toUpperCase(),
//     sub_event_guid: rewardData.value.sub_event_guid,
//     user_address: address?.value || '',
//   }

//   const missing = ['amount', 'asset_guid', 'event_guid', 'sub_event_guid', 'user_address'].filter(
//     (k) => !payload[k],
//   )
//   if (missing.length) {
//     ElMessage.error(`Claim 参数缺失：${missing.join(', ')}`)
//     return
//   }
//   if (payload.outcome !== 'YES' && payload.outcome !== 'NO') {
//     ElMessage.error('Claim 参数错误：outcome 必须是 YES 或 NO')
//     return
//   }

//   try {
//     const res = await claimOrder(payload)
//     const code = res?.data?.code
//     if (!(code === 0 || code === 200 || code === 2000)) {
//       throw new Error(res?.data?.message || 'Claim failed')
//     }

//     // 成功后：弹窗 + 清空可领取数量（具体策略可按产品调整）
//     showClaimSuccess.value = true
//     rewardData.value.winnings = 0
//     ElMessage.success(res?.data?.message || 'Claim success')
//   } catch (e) {
//     ElMessage.error(e?.message || 'Claim failed')
//   }
// }

// 窗口大小改变时调整图表
const handleResize = () => {
  if (myChart) {
    myChart.resize()
  }
}

onMounted(() => {
  initChart()
  refreshPredictionData()
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

watch(() => address?.value, () => {
  refreshPredictionData()
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

// 预估总资产估值
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
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
      
      &.positive {
        color: #2FBC87;
      }
      
      &.negative {
        color: #E22828;
      }
    }
  }

  .history-label {
    font-size: 12px;
    color: var(--text-gray, rgba(255, 255, 255, 0.5));
    margin-top: 4px;
  }
}

// 图表部分
.chart-section {
  margin-top: 10px;

  .chart-container {
    width: 100%;
    height: 180px;
  }
}

// 奖励部分
.reward-section {
  margin-top: 24px;
  background-color: var(--bg-card, #1e1e1e);
  border-radius: 12px;
  padding: 16px;

  .reward-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .reward-number {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-color);
      flex: 1;
    }

    .reward-amount {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-color-y, #BBFF2E);
      flex: 2;
      text-align: center;
    }

    .claim-btn {
      padding: 8px 24px;
      background: var(--text-color-y, #BBFF2E);
      color: #0a0a0a;
      border: none;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
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
