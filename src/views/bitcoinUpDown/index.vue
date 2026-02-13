<template>
  <div class="bitcoin-up-down-page">
    <!-- 顶部状态栏：返回 + 成交量 + 收藏 -->
    <div class="top-bar">
      <button class="top-btn back-btn" type="button" @click="handleBack">
        <el-icon>
          <ArrowLeft />
        </el-icon>
      </button>
      <div class="top-right">
        <div class="top-center">
          <el-icon class="trophy-icon">
            <Trophy />
          </el-icon>
          <span class="top-volume">$153,642,644 Vol.</span>
        </div>
        <button class="top-btn bookmark-btn" type="button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>

    <div class="content-scroller">
      <!-- 2. 标题区与倒计时 -->
      <div class="asset-profile">
        <div class="asset-logo">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <path fill="#fff"
              d="M21.7 14.3c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.6-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.2v-.1l-2.2-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.1c0 0 .1 0 .2.1h-.2l-1.1 4.4c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.8-2.1 0-3.3-1.5-4.1 1.1-.2 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.2-4.2 1-5.4.7l1-3.9c1.2.3 5 .9 4.4 3.2zm.6-5.3c-.5 2-3.5.9-4.5.7l.9-3.5c1 .2 4.1.7 3.6 2.8z" />
          </svg>
        </div>
        <div class="asset-text">
          <h2>{{ $t('crypto.upOrDown') }}</h2>
          <p>1月31日 19:00-19:15 UTC+8</p>
        </div>
        <div class="timer">
          <div class="time-block">
            <span class="unit">01</span>
            <span class="label">{{ $t('crypto.min') }}</span>
          </div>
          <div class="time-block">
            <span class="unit">59</span>
            <span class="label">{{ $t('crypto.sec') }}</span>
          </div>
        </div>
      </div>

      <!-- 3. 价格对战看板 -->
      <div class="price-dashboard">
        <div class="price-item">
          <div class="label">{{ $t('crypto.priceToBeat') }}</div>
          <div class="value">$82,627.75</div>
        </div>
        <div class="price-item current">
          <div class="label">{{ $t('crypto.currentPrice') }} <span class="diff">▲ $39</span></div>
          <div class="value">$82,666.53</div>
        </div>
      </div>

      <!-- 4. 高级定制化图表 -->
      <div class="chart-section">
        <!-- 时间范围选择器 -->
        <div class="time-range-selector">
          <button v-for="range in timeRanges" :key="range.value" class="time-range-btn"
            :class="{ active: selectedTimeRange === range.value }" @click="handleTimeRangeChange(range.value)">
            {{ range.label }}
          </button>
        </div>

        <div class="chart-container">
          <!-- 侧边数值变动显示 -->
          <div class="chart-overlays">
            <span class="delta-tag pink">+$3</span>
            <span class="delta-tag neon">+$200</span>
            <span class="delta-tag pink">+$2</span>
            <span class="delta-tag pink">+$10</span>
          </div>
          <div ref="chartRef" class="main-chart" style="touch-action: none;"></div>

          <!-- Vue 渲染的高性能浮窗 -->
          <div v-show="showInfoBox" class="info-popover" :style="infoBoxStyle">
            <div class="info-price">${{ currentPrice.toLocaleString() }}</div>
            <div class="info-time">1月31日 19:00-19:15</div>
            <div class="info-arrow"></div>
          </div>
        </div>

        <!-- 5. 图表下方控制组件 -->
        <div class="chart-toolbar">
          <div class="record-capsule">
            <div class="record-selector">
              {{ $t('crypto.record') }} <el-icon>
                <ArrowDown />
              </el-icon>
            </div>
            <div class="trend-markers">
              <span class="tri-down"></span>
              <span class="tri-up"></span>
              <span class="tri-up"></span>
            </div>
          </div>
          <div class="time-segments">
            <span v-for="time in timeSegments" :key="time" class="time-pill"
              :class="{ active: activeTimeSegment === time }" @click="activeTimeSegment = time">
              <i v-if="activeTimeSegment === time" class="dot"></i>{{ time }}
            </span>
          </div>
        </div>
      </div>

      <!-- 6. 仓位 Tab 页 -->
      <div class="business-tabs">
        <div class="tab-item" :class="{ active: activeTab === 'Positions' }" @click="activeTab = 'Positions'">
          {{ $t('crypto.positions') }}
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'Orders' }" @click="activeTab = 'Orders'">
          {{ $t('crypto.orders') }}
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'History' }" @click="activeTab = 'History'">
          {{ $t('crypto.history') }}
        </div>
      </div>

      <!-- 仓位详细详情卡片 -->
      <div v-if="activeTab === 'Positions'" class="position-content">
        <div class="pos-card">
          <h3 class="pos-title">{{ $t('crypto.upOrDown') }}</h3>
          <span class="pos-tag">{{ $t('crypto.up') }} | 100 {{ $t('sports.shares') }}</span>
          <div class="pos-grid">
            <div class="grid-item">
              <div class="g-label">{{ $t('crypto.avgPrice') }}</div>
              <div class="g-val">40 ¢</div>
            </div>
            <div class="grid-item">
              <div class="g-label">{{ $t('crypto.cost') }}</div>
              <div class="g-val">$40</div>
            </div>
            <div class="grid-item">
              <div class="g-label">{{ $t('crypto.current') }}</div>
              <div class="g-val">$80</div>
            </div>
            <div class="grid-item">
              <div class="g-label">{{ $t('crypto.profit') }}</div>
              <div class="g-val neon">+$40(+100%)</div>
            </div>
          </div>
          <button class="withdraw-hero-btn">{{ $t('crypto.withdraw') }}</button>
        </div>
      </div>

      <!-- Orders 订单列表 -->
      <div v-if="activeTab === 'Orders'" class="orders-content">
        <div class="orders-header">
          <span class="orders-title">{{ $t('crypto.openOrders') }}</span>
          <button class="cancel-all-btn">{{ $t('crypto.cancelAll') }}</button>
        </div>
        <div class="orders-list">
          <div v-for="(order, index) in openOrders" :key="index" class="order-item">
            <div class="order-left">
              <div class="order-type">{{ order.type }}</div>
              <span class="order-tag">{{ order.price }} | {{ order.amount }}</span>
            </div>
            <div class="order-right">
              <div class="order-filled">{{ order.filled }}/{{ order.total }}</div>
              <div class="order-status">{{ order.status }}</div>
            </div>
            <button class="order-close-btn" @click="removeOrder(index)">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- History 历史记录 -->
      <div v-if="activeTab === 'History'" class="history-content">
        <div class="history-header">
          <span class="history-title">{{ $t('crypto.history') }}</span>
        </div>
        <div class="history-list">
          <div v-for="(item, index) in historyList" :key="index" class="history-item">
            <div class="history-text">
              Bought <span :class="item.direction === 'Up' ? 'up' : 'down'">{{ item.amount }} {{ item.direction
              }}</span> at {{ item.price }} <span class="cost">({{ item.cost }})</span>
            </div>
            <div class="history-time">{{ item.time }}</div>
          </div>
        </div>
      </div>

      <!-- 7. 订单簿详情页 -->
      <div class="orderbook-header" @click="isBookOpen = !isBookOpen">
        <span>{{ $t('sports.orderBook') }}</span>
        <div class="header-right">
          <span class="vol">$35.4K</span>
          <el-icon :class="{ rotate: isBookOpen }">
            <ArrowDown />
          </el-icon>
        </div>
      </div>
      <div v-if="isBookOpen" class="book-body">
        <!-- 订单簿 Tab 切换 -->
        <div class="orderbook-tabs">
          <button class="orderbook-tab" :class="{ active: orderBookTab === 'yes' }" @click="orderBookTab = 'yes'">
            {{ $t('detail.tradeYes') }}
          </button>
          <button class="orderbook-tab" :class="{ active: orderBookTab === 'no' }" @click="orderBookTab = 'no'">
            {{ $t('detail.tradeNo') }}
          </button>
        </div>
        <!-- 订单簿表格 -->
        <OrderBookMobile :active-side="orderBookTab" />
      </div>

      <div class="rules-footer">
        <h4>{{ $t('detail.rules') }}</h4>
        <p>The FED interest rates are defined in this market by the upper bound of the target federal funds range. The
          decisions on the target range are made by the target.</p>
      </div>

      <!-- 底部预测操作栏 -->
      <div class="bottom-dock-actions">
        <button class="trade-btn up">{{ $t('common.buy') }} {{ $t('crypto.up') }} 96 ¢</button>
        <button class="trade-btn down">{{ $t('common.buy') }} {{ $t('crypto.down') }} 4 ¢</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, ArrowDown, Trophy } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import OrderBookMobile from '@/components/OrderBookMobile.vue'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const activeTab = ref('Positions')
const isBookOpen = ref(false)
const orderBookTab = ref('yes')
const chartRef = ref(null)
let chartInstance = null

// 时间段数据
const timeSegments = ['19:00', '19:15', '19:30', '19:45', '20:00']
const activeTimeSegment = ref('19:15')

// 订单数据
const openOrders = computed(() => [
  { type: t('crypto.down'), price: '80 ¢', amount: '$40', filled: 0, total: 50, status: t('crypto.untilCancel') },
  { type: t('crypto.down'), price: '80 ¢', amount: '$40', filled: 0, total: 50, status: t('crypto.untilCancel') }
])

const removeOrder = (index) => {
  // openOrders is now computed, so this needs a different approach if needed
}

// 历史记录数据
const historyList = ref([
  { amount: 40, direction: 'Up', price: '80¢', cost: '$32', time: '4分钟前' },
  { amount: 40, direction: 'Down', price: '80¢', cost: '$32', time: '4分钟前' }
])

// 图表状态
const currentPrice = ref(82666.53)
const showInfoBox = ref(false)
const infoBoxStyle = ref({ left: '0px', top: '0px' })

// 时间范围选择
const timeRanges = [
  { label: '1H', value: '1H' }, { label: '6H', value: '6H' },
  { label: '1D', value: '1D' }, { label: '1W', value: '1W' },
  { label: '1M', value: '1M' }, { label: 'ALL', value: 'ALL' }
]
const selectedTimeRange = ref('1D')

const handleBack = () => router.back()

// 生成模拟价格数据
const generatePriceData = () => {
  let val = 82600
  return Array.from({ length: 40 }, (_, i) => {
    val += (Math.random() - 0.45) * 30
    return Math.max(82580, Math.min(82700, val))
  })
}
let totalData = generatePriceData()
const handleIndex = ref(totalData.length - 1)

// 更新浮窗位置
const updateInfoBoxPos = (x, y) => {
  infoBoxStyle.value = {
    left: `${x}px`,
    top: `${y - 70}px`,
    transform: 'translateX(-50%)'
  }
}

// 图表颜色配置
const chartColors = computed(() => ({
  background: themeStore.isDark ? '#000' : '#FFF',
  axisLabel: themeStore.isDark ? '#444' : '#888',
  splitLine: themeStore.isDark ? '#1a1a1a' : '#e0e0e0',
  primary: themeStore.isDark ? '#BBFF2E' : '#19d96b',
  primaryLight: themeStore.isDark ? 'rgba(187, 255, 46, 0.15)' : 'rgba(25, 217, 107, 0.15)',
  primaryGradient: themeStore.isDark ? 'rgba(187, 255, 46, 0.2)' : 'rgba(25, 217, 107, 0.2)',
  primaryStroke: themeStore.isDark ? 'rgba(187, 255, 46, 0.3)' : 'rgba(25, 217, 107, 0.3)'
}))

// 更新图表
const updateChart = () => {
  if (!chartInstance) return

  const colors = chartColors.value

  const option = {
    backgroundColor: colors.background,
    animation: false,
    grid: { left: '2%', right: '14%', top: '15%', bottom: '12%', containLabel: false },
    xAxis: {
      type: 'category',
      data: Array.from({ length: totalData.length }, (_, i) => i),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        interval: (idx) => [0, Math.floor(totalData.length / 2), totalData.length - 1].includes(idx),
        formatter: (v) => {
          if (v == 0) return '19:00:05'
          if (v == Math.floor(totalData.length / 2)) return '19:01:05'
          if (v == totalData.length - 1) return '19:02:05'
          return ''
        },
        color: colors.axisLabel,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      position: 'right',
      min: (value) => Math.floor(value.min - 5),
      max: (value) => Math.ceil(value.max + 5),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        formatter: (v) => '$' + v.toLocaleString(),
        color: colors.axisLabel,
        fontSize: 10
      },
      splitLine: { lineStyle: { color: colors.splitLine } }
    },
    series: [
      {
        name: 'Background',
        type: 'line',
        data: totalData,
        smooth: 0.4,
        symbol: 'none',
        lineStyle: { width: 2.5, color: colors.primaryLight }
      },
      {
        name: 'Progress',
        type: 'line',
        data: totalData.slice(0, handleIndex.value + 1),
        smooth: 0.4,
        symbol: 'none',
        lineStyle: { width: 2.5, color: colors.primary },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.primaryGradient },
            { offset: 1, color: 'transparent' }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)

  // 绘制可拖拽圆点
  setTimeout(() => {
    if (!chartInstance) return
    const xPix = chartInstance.convertToPixel({ xAxisIndex: 0 }, handleIndex.value)
    const yPix = chartInstance.convertToPixel({ yAxisIndex: 0 }, totalData[handleIndex.value])

    chartInstance.setOption({
      graphic: [{
        type: 'circle',
        id: 'handle',
        x: xPix, y: yPix,
        shape: { r: 8 },
        style: { fill: colors.primary, stroke: colors.primaryStroke, lineWidth: 12 },
        draggable: true,
        z: 100,
        onmousedown: function () {
          showInfoBox.value = true
        },
        onmouseup: function () {
          showInfoBox.value = false
        },
        ondragstart: function () {
          showInfoBox.value = true
        },
        ondragend: function () {
          showInfoBox.value = false
        },
        ondrag: function () {
          const dataPos = chartInstance.convertFromPixel({ xAxisIndex: 0 }, this.x)
          let idx = Math.round(Number(dataPos))
          idx = Math.max(0, Math.min(totalData.length - 1, idx))

          const snappedX = chartInstance.convertToPixel({ xAxisIndex: 0 }, idx)
          const snappedY = chartInstance.convertToPixel({ yAxisIndex: 0 }, totalData[idx])

          this.setPosition([snappedX, snappedY])

          handleIndex.value = idx
          currentPrice.value = totalData[idx]
          updateInfoBoxPos(snappedX, snappedY)

          chartInstance.setOption({
            series: [{}, { data: totalData.slice(0, idx + 1) }]
          }, false)
        }
      }]
    })
    currentPrice.value = totalData[handleIndex.value]
    updateInfoBoxPos(xPix, yPix)
  }, 0)
}

const initChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

// 监听主题变化更新图表
watch(() => themeStore.isDark, () => {
  updateChart()
})

const handleTimeRangeChange = (val) => {
  selectedTimeRange.value = val
  totalData = generatePriceData()
  handleIndex.value = totalData.length - 1
  updateChart()
}

onMounted(() => {
  nextTick(() => { initChart() })
  window.addEventListener('resize', () => chartInstance?.resize())
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
/* --- 布局色彩变量 --- */
$hot-pink: #E44096;
$orange: #F7931A;
$bg-dark: #000;

.bitcoin-up-down-page {
  background: var(--bg-page-h5);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 - 参考 predictionDetailH5 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: var(--bg-page-h5);
  height: 48px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  color: var(--text-dark-gray);
  font-size: 12px;
}

.top-btn {
  background: transparent;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  cursor: pointer;
}

.top-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn .el-icon {
  font-size: 18px;
  color: var(--bg-opposite);
}

.top-center {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.85;
}

.trophy-icon {
  font-size: 14px;
  color: var(--text-dark-gray);
}

.top-volume {
  font-size: 11px;
}

.bookmark-btn svg {
  width: 18px;
  height: 18px;
}

.content-scroller {
  flex: 1;
  overflow-y: auto;
  padding: 68px 16px 20px;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* 标题卡片 */
.asset-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  .asset-logo {
    width: 50px;
    height: 50px;
    background: $orange;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .asset-text {
    flex: 1;

    h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      line-height: 1.3;
    }

    p {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
  }

  .timer {
    display: flex;
    gap: 6px;

    .time-block {
      display: flex;
      flex-direction: column;
      align-items: center;

      .unit {
        font-size: 24px;
        font-weight: 700;
        color: $hot-pink;
        line-height: 1;
      }

      .label {
        font-size: 10px;
        color: #555;
        margin-top: 4px;
      }
    }
  }
}

/* 面板看板 */
.price-dashboard {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;

  .price-item {
    .label {
      font-size: 12px;
      color: #888;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: 0.5px;

      .diff {
        color: var(--text-color-y);
        margin-left: 12px;
        font-weight: 700;
      }
    }

    .value {
      font-family: PingFang SC, PingFang SC;
      font-weight: 600;
      font-size: 18px;
      color: var(--bg-opposite);
    }

    &.current {
      .label {
        color: $orange;
      }

      .value {
        color: $orange;
      }
    }
  }
}

/* 图表区域 */
.chart-section {
  margin-bottom: 10px;
}

.time-range-selector {
  display: flex;
  gap: 14px;
  margin-bottom: 8px;

  .time-range-btn {
    background: transparent;
    border: none;
    color: #555;
    font-size: 12px;
    cursor: pointer;
    padding: 4px 0;

    &.active {
      color: var(--bg-opposite);
      font-weight: 600;
    }
  }
}

.chart-container {
  position: relative;
  height: 200px;

  .main-chart {
    width: 100%;
    height: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  .chart-overlays {
    position: absolute;
    left: 0;
    bottom: 25px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    pointer-events: none;

    .delta-tag {
      &.pink {
        color: $hot-pink;
      }

      &.neon {
        color: var(--text-color-y);
      }
    }
  }

  .info-popover {
    position: absolute;
    background: var(--text-color-y);
    color: #000;
    padding: 10px 16px;
    border-radius: 10px;
    pointer-events: none;
    z-index: 110;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    text-align: center;

    .info-price {
      font-size: 16px;
      font-weight: 800;
      line-height: 1.2;
    }

    .info-time {
      font-size: 11px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
      margin-top: 2px;
    }

    .info-arrow {
      position: absolute;
      bottom: -14px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 14px;
      background: var(--text-color-y);

      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        background: var(--text-color-y);
        border-radius: 50%;
      }
    }
  }
}

.chart-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 30px;

  .record-capsule {
    display: flex;
    align-items: center;
    background: #222;
    border-radius: 20px;
    padding: 8px 10px;
    gap: 12px;
    flex-shrink: 0;
  }

  .record-selector {
    font-size: 13px;
    color: var(--text-dark-gray);
    display: flex;
    align-items: center;
    gap: 6px;

    .el-icon {
      font-size: 12px;
      color: #888;
    }
  }

  .trend-markers {
    display: flex;
    align-items: center;
    gap: 6px;

    .tri-up {
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 10px solid var(--text-color-y);
    }

    .tri-down {
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 10px solid $hot-pink;
    }
  }

  .time-segments {
    display: flex;
    gap: 8px;
    align-items: center;
    overflow-x: auto;
    flex: 1;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .time-pill {
      font-size: 14px;
      font-weight: 500;
      background: var(--bg-page);
      color: var(--text-dark-gray);
      padding: 8px 13px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      white-space: nowrap;

      .dot {
        width: 8px;
        height: 8px;
        background: $hot-pink;
        border-radius: 50%;
      }

      &.active {
        background: var(--bg-opposite);
        color: var(--bg-page-h5);
        font-weight: 600;
      }
    }
  }
}

/* 详情区块导航项 */
.business-tabs {
  display: flex;
  gap: 50px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
  padding-bottom: 0;

  .tab-item {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-dark-gray);
    padding-bottom: 14px;
    position: relative;
    cursor: pointer;

    &.active {
      color: var(--bg-opposite);

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--bg-opposite);
      }
    }
  }
}

/* 仓位内容样式 */
.position-content {
  margin-bottom: 20px;
}

.pos-card {
  background: transparent;
  padding: 0;

  .pos-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: var(--bg-opposite);
  }

  .pos-tag {
    display: inline-block;
    background: var(--button-bg-y);
    color: var(--text-color-y);
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .pos-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-bottom: 28px;
    gap: 12px;

    .grid-item {
      .g-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }

      .g-val {
        font-size: 18px;
        font-weight: 600;
        color: var(--bg-opposite);
      }

      .g-val.neon {
        color: var(--text-color-y);
      }
    }
  }

  .withdraw-hero-btn {
    width: 100%;
    height: 56px;
    background: var(--text-color-y);
    color: #000;
    border: none;
    border-radius: 14px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
  }
}

/* Orders 订单列表样式 */
.orders-content {
  margin-bottom: 20px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .orders-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--bg-opposite);
  }

  .cancel-all-btn {
    background: transparent;
    border: none;
    color: $hot-pink;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);

  .order-left {
    flex: 1;

    .order-type {
      font-size: 16px;
      font-weight: 600;
      color: var(--bg-opposite);
      margin-bottom: 6px;
    }

    .order-tag {
      display: inline-block;
      padding: 4px 10px;
      background: rgba($hot-pink, 0.2);
      color: $hot-pink;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
    }
  }

  .order-right {
    text-align: right;
    margin-right: 16px;

    .order-filled {
      font-size: 15px;
      font-weight: 600;
      color: var(--bg-opposite);
      margin-bottom: 4px;
    }

    .order-status {
      font-size: 12px;
      color: var(--text-dark-gray);
    }
  }

  .order-close-btn {
    background: transparent;
    border: none;
    color: var(--text-dark-gray);
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--bg-opposite);
    }
  }
}

/* History 历史记录样式 */
.history-content {
  margin-bottom: 20px;
}

.history-header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);


  .history-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--bg-opposite);
  }
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);

  .history-text {
    font-size: 16px;
    color: var(--bg-opposite);

    .up {
      color: var(--text-color-y);
      font-weight: 600;
    }

    .down {
      color: $hot-pink;
      font-weight: 600;
    }

    .cost {
      color: var(--text-dark-gray);
    }
  }

  .history-time {
    font-size: 14px;
    color: #666;
  }
}

/* 折叠逻辑 */
.orderbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 15px;
  color: var(--bg-opposite);

  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;

    .vol {
      color: var(--text-dark-gray);
      font-size: 13px;
    }

    .el-icon {
      color: var(--text-dark-gray);
      transition: transform 0.2s;
    }

    .rotate {
      transform: rotate(180deg);
    }
  }
}

.book-body {
  padding: 12px 0;
}

.orderbook-tabs {
  display: flex;
  gap: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 8px;
}

.orderbook-tab {
  background: transparent;
  border: none;
  color: var(--text-dark-gray);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;

  &.active {
    color: var(--bg-opposite);
  }
}

.rules-footer {
  margin-top: 20px;
  padding-bottom: 20px;

  h4 {
    color: var(--bg-opposite);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  p {
    font-size: 12px;
    color: var(--text-dark-gray);
    line-height: 1.7;
  }
}

/* 吸底操作 */
/* 底部操作栏 */
.bottom-dock-actions {
  padding: 16px 0;
  display: flex;
  gap: 12px;
  margin-top: 20px;

  .trade-btn {
    flex: 1;
    height: 48px;
    background: transparent;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;

    &.up {
      color: var(--text-color-y);
      border: 1.5px solid var(--text-color-y);
      background: rgba(187, 255, 46, 0.08);
    }

    &.down {
      color: $hot-pink;
      border: 1.5px solid var(--text-color-n);
      background: var(--button-bg-n);
    }
  }
}
</style>