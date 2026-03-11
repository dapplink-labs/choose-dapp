<template>
  <div class="bitcoin-up-down-page">
    <!-- 1. 固定顶部状态栏 -->
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
          <span class="top-volume">$153,642,644 {{ $t('bitcoinUpDown.volume') }}</span>
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

    <!-- 滚动容器 -->
    <div class="content-scroller" @scroll="handleScroll">

      <!-- 2. 吸顶标题区与倒计时 -->
      <div class="asset-profile-wrapper" :class="{ 'is-sticky': isSticky }">
        <div class="asset-profile">
          <div class="asset-logo">
            <svg viewBox="0 0 32 32" width="100%" height="100%">
              <path fill="#fff"
                d="M21.7 14.3c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.6-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.2v-.1l-2.2-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.1c0 0 .1 0 .2.1h-.2l-1.1 4.4c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.8-2.1 0-3.3-1.5-4.1 1.1-.2 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.2-4.2 1-5.4.7l1-3.9c1.2.3 5 .9 4.4 3.2zm.6-5.3c-.5 2-3.5.9-4.5.7l.9-3.5c1 .2 4.1.7 3.6 2.8z" />
            </svg>
          </div>
          <div class="asset-text">
            <h2>{{ $t('bitcoinUpDown.questionTitle') }}</h2>
          </div>
          <!-- 选中历史记录时隐藏倒计时 -->
          <div class="timer" v-show="activeSegmentMode !== 'past'">
            <div class="time-block">
              <div class="time-value">
                <span class="digit-wrapper" v-for="(char, i) in countDown.hours.split('')" :key="'h' + i">
                  <transition name="fast-roll"><span class="digit unit" :key="char">{{ char }}</span></transition>
                </span>
              </div>
              <span class="label">{{ $t('bitcoinUpDown.hrs') }}</span>
            </div>
            <div class="time-block">
              <div class="time-value">
                <span class="digit-wrapper" v-for="(char, i) in countDown.minutes.split('')" :key="'m' + i">
                  <transition name="fast-roll"><span class="digit unit" :key="char">{{ char }}</span></transition>
                </span>
              </div>
              <span class="label">{{ $t('bitcoinUpDown.mins') }}</span>
            </div>
            <div class="time-block">
              <div class="time-value">
                <span class="digit-wrapper" v-for="(char, i) in countDown.seconds.split('')" :key="'s' + i">
                  <transition name="fast-roll"><span class="digit unit" :key="char">{{ char }}</span></transition>
                </span>
              </div>
              <span class="label">{{ $t('bitcoinUpDown.secs') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 价格看板 -->
      <div class="price-dashboard">
        <div class="price-item">
          <div class="label">{{ $t('bitcoinUpDown.priceToBeat') }}</div>
          <div class="value">{{ activeSegmentMode === 'future' ? '--' : formatPrice(displayTargetPrice) }}</div>
        </div>

        <div class="price-item current">
          <div class="label">
            {{ activeSegmentMode === 'past' ? $t('bitcoinUpDown.finalPrice') : $t('bitcoinUpDown.currentPrice') }}
            <span v-if="activeSegmentMode !== 'future'" :class="['diff', diffData.status]">
              <span class="svg-icon-wrapper diff-icon" :class="diffData.status">
                <svg v-if="diffData.status === 'up'" viewBox="0 0 12 12">
                  <path d="M5.14 2.22a1 1 0 011.72 0l4.28 7.4A1 1 0 0110.28 11H1.72a1 1 0 01-.86-1.5z"
                    fill="currentColor" />
                </svg>
                <svg v-else viewBox="0 0 12 12">
                  <path d="M10.86 1H1.72a1 1 0 00-.86 1.5l4.28 7.4a1 1 0 001.72 0l4.28-7.4A1 1 0 0010.86 1z"
                    fill="currentColor" />
                </svg>
              </span>
              ${{ diffData.value }}
            </span>
          </div>
          <div class="value price-value">
            <span class="symbol">$</span>
            <template v-if="activeSegmentMode === 'past'">
              <span class="digit-static">{{ selectedPastRecord?.finalPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2
              }) }}</span>
            </template>
            <template v-else>
              <template v-for="(char, i) in currentPriceChars" :key="'p'+i">
                <span v-if="['.', ','].includes(char)" class="symbol">{{ char }}</span>
                <span v-else class="digit-wrapper">
                  <transition name="fast-roll">
                    <span class="digit" :key="char">{{ char }}</span>
                  </transition>
                </span>
              </template>
            </template>
          </div>
        </div>
      </div>

      <!-- 4. 图表与工具栏 -->
      <div class="chart-section">
        <div class="chart-container">
          <div ref="chartRef" class="main-chart" style="touch-action: none;"></div>
        </div>

        <div class="chart-toolbar">
          <!-- 下拉菜单：选择历史记录 -->
          <el-dropdown trigger="click" placement="bottom-start" @command="selectPastRecord"
            popper-class="custom-history-dropdown">
            <div class="record-capsule">
              <div class="record-selector">
                {{ $t('bitcoinUpDown.past') }} <el-icon>
                  <ArrowDown />
                </el-icon>
              </div>
              <div class="trend-markers">
                <span v-for="res in lastThreeResults" :key="res.id" class="svg-icon-wrapper" :class="res.result">
                  <svg v-if="res.result === 'up'" style="width:12px;height:12px" viewBox="0 0 12 12">
                    <path d="M5.14 2.22a1 1 0 011.72 0l4.28 7.4A1 1 0 0110.28 11H1.72a1 1 0 01-.86-1.5z"
                      fill="currentColor" />
                  </svg>
                  <svg v-else style="width:12px;height:12px" viewBox="0 0 12 12">
                    <path d="M10.86 1H1.72a1 1 0 00-.86 1.5l4.28 7.4a1 1 0 001.72 0l4.28-7.4A1 1 0 0010.86 1z"
                      fill="currentColor" />
                  </svg>
                </span>
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="record in pastRecords" :key="record.id" :command="record">
                  <div class="drop-item-content">
                    <span class="svg-icon-wrapper dropdown-icon" :class="record.result">
                      <svg v-if="record.result === 'up'" style="width:14px;height:14px" viewBox="0 0 12 12">
                        <path d="M5.14 2.22a1 1 0 011.72 0l4.28 7.4A1 1 0 0110.28 11H1.72a1 1 0 01-.86-1.5z"
                          fill="currentColor" />
                      </svg>
                      <svg v-else style="width:14px;height:14px" viewBox="0 0 12 12">
                        <path d="M10.86 1H1.72a1 1 0 00-.86 1.5l4.28 7.4a1 1 0 001.72 0l4.28-7.4A1 1 0 0010.86 1z"
                          fill="currentColor" />
                      </svg>
                    </span>
                    {{ record.label }}
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 🔥 动态时间轴按钮逻辑 🔥 -->
          <div class="time-segments">
            <!-- 1. 最左侧：临时生成的历史记录游标 (仅在选择历史且存在时显示) -->
            <span v-if="activeSegmentMode === 'past' && selectedPastRecord" class="time-pill active past-active">
              {{ $t('bitcoinUpDown.ended') }}: {{ selectedPastRecord.date }}
            </span>

            <!-- 2. 中间：常驻实时按钮 (点击清除历史游标) -->
            <span class="time-pill" :class="{ active: activeSegmentMode === 'live' }" @click="selectLiveSegment">
              <i class="dot breathing-dot"></i> {{ liveSegment.label }}
            </span>

            <!-- 3. 右侧：当天未来按钮 (只有一个) -->
            <span v-for="ft in futureSegments" :key="ft.id" class="time-pill "
              :class="{ active: activeSegmentMode === 'future' && selectedFutureId === ft.id }"
              @click="selectFutureSegment(ft)">
              {{ ft.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- 5. 底部业务逻辑 -->
      <div class="business-tabs">
        <div class="tab-item" :class="{ active: activeTab === 'Positions' }" @click="activeTab = 'Positions'">{{
          $t('crypto.positions') }}</div>
        <div class="tab-item" :class="{ active: activeTab === 'Orders' }" @click="activeTab = 'Orders'">{{
          $t('crypto.orders')
        }}</div>
        <div class="tab-item" :class="{ active: activeTab === 'History' }" @click="activeTab = 'History'">{{
          $t('crypto.history') }}</div>
      </div>

      <!-- Positions -->
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

      <!-- Orders -->
      <div v-else-if="activeTab === 'Orders'" class="orders-content">
        <div class="orders-header-row">
          <div class="orders-title">{{ $t('crypto.openOrders') }}</div>
          <button class="cancel-all-btn" type="button" v-if="openOrders.length" @click="handleCancelAllOrders">
            {{ $t('crypto.cancelAll') }}
          </button>
        </div>

        <div v-if="openOrders.length">
          <div v-for="order in openOrders" :key="order.id" class="order-row">
            <div class="order-left">
              <div class="order-side" :class="order.side">
                {{ $t('common.buy') }}
                <span class="side-text">{{ order.side === 'up' ? $t('crypto.up') : $t('crypto.down') }}</span>
              </div>
              <div :class="['order-chip', order.side === 'up' ? 'up' : 'down']">
                <span class="chip-price">{{ order.price }} ¢</span>
                <span class="chip-sep">|</span>
                <span class="chip-cost">${{ order.cost }}</span>
              </div>
            </div>
            <div class="order-right">
              <div>
                <div class="order-progress">{{ order.filled }}/{{ order.total }}</div>
                <div class="order-until" v-if="order.untilCancel">{{ $t('crypto.untilCancel') }}</div>
              </div>
              <button class="order-cancel-btn" type="button" @click="handleCancelOrder(order.id)" aria-label="cancel">
                ✕
              </button>
            </div>
          </div>
        </div>
        <div v-else class="orders-empty">{{ $t('common.noData') || '暂无数据...' }}</div>
      </div>

      <!-- History -->
      <div v-else-if="activeTab === 'History'" class="history-content">
        <div class="history-header">{{ $t('crypto.history') }}</div>
        <div v-if="orderHistory.length">
          <div v-for="item in orderHistory" :key="item.id" class="history-row">
            <div class="history-main">
              <div class="history-text">
                {{ $t('common.buy') }}
                <span class="history-side" :class="item.side">
                  {{ item.shares }} {{ item.side === 'up' ? $t('crypto.up') : $t('crypto.down') }}
                </span>
                at {{ item.price }}¢ <span class="muted">(${{ item.notional }})</span>
              </div>
            </div>
            <div class="history-time">{{ item.timeAgo }}</div>
          </div>
        </div>
        <div v-else class="orders-empty">{{ $t('common.noData') || '暂无数据...' }}</div>
      </div>

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
        <div class="orderbook-tabs">
          <button class="orderbook-tab" :class="{ active: orderBookTab === 'yes' }" @click="orderBookTab = 'yes'">{{
            $t('detail.tradeYes') }}</button>
          <button class="orderbook-tab" :class="{ active: orderBookTab === 'no' }" @click="orderBookTab = 'no'">{{
            $t('detail.tradeNo') }}</button>
        </div>
        <OrderBookMobile :active-side="orderBookTab" />
      </div>

      <div class="rules-footer">
        <h4>{{ $t('detail.rules') }}</h4>
        <p>{{ $t('bitcoinUpDown.rulesDescription') }}</p>
      </div>
    </div>

    <!-- 吸底操作栏 -->
    <div class="bottom-dock-actions">
      <button class="trade-btn up" type="button" @click="openPayment('up')">
        {{ $t('common.buy') }} {{ $t('crypto.up') }} 96 ¢
      </button>
      <button class="trade-btn down" type="button" @click="openPayment('down')">
        {{ $t('common.buy') }} {{ $t('crypto.down') }} 4 ¢
      </button>
    </div>

    <PaymentModal v-model="showPayment" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, ArrowDown, Trophy } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import OrderBookMobile from '@/components/OrderBookMobile.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()

const handleBack = () => router.back()
const activeTab = ref('Positions')
const isBookOpen = ref(false)
const orderBookTab = ref('yes')

const openOrders = ref([
  { id: 1, side: 'down', price: 80, cost: 40, filled: 0, total: 50, untilCancel: true },
  { id: 2, side: 'down', price: 80, cost: 40, filled: 0, total: 50, untilCancel: true }
])

const orderHistory = ref([
  { id: 1, side: 'up', shares: 40, price: 80, notional: 32, timeAgo: '4分钟前' },
  { id: 2, side: 'down', shares: 40, price: 80, notional: 32, timeAgo: '4分钟前' }
])

const handleCancelAllOrders = () => {
  openOrders.value = []
}

const handleCancelOrder = (id) => {
  openOrders.value = openOrders.value.filter(o => o.id !== id)
}

const showPayment = ref(false)
const selectedTradeSide = ref(null) // 'up' | 'down'
const openPayment = (side) => {
  selectedTradeSide.value = side
  showPayment.value = true
}

// --- 吸顶逻辑 ---
const isSticky = ref(false)
const handleScroll = (e) => {
  isSticky.value = e.target.scrollTop > 20
}

// --- 倒计时 ---
const countDown = ref({ hours: '01', minutes: '10', seconds: '18' })
let timerInterval = null
const startCountDown = () => {
  let totalSeconds = 1 * 3600 + 10 * 60 + 18
  timerInterval = setInterval(() => {
    if (totalSeconds <= 0) return clearInterval(timerInterval)
    totalSeconds--
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
    const s = (totalSeconds % 60).toString().padStart(2, '0')
    countDown.value = { hours: h, minutes: m, seconds: s }
  }, 1000)
}

// --- 状态机 ---
const activeSegmentMode = ref('live')

// 模拟历史数据
const pastRecords = [
  { id: 1, label: '12 PM ET · Feb 25', date: 'Feb 25', result: 'up', targetPrice: 2047.32, finalPrice: 2062.59 },
  { id: 2, label: '12 PM ET · Feb 24', date: 'Feb 24', result: 'down', targetPrice: 3168.00, finalPrice: 3136.32 },
  { id: 3, label: '12 PM ET · Feb 23', date: 'Feb 23', result: 'down', targetPrice: 2100.00, finalPrice: 2080.00 },
]
const lastThreeResults = pastRecords.slice(0, 3)
const selectedPastRecord = ref(null)

// 模拟 Live 数据
const liveSegment = { label: '12 PM', targetPrice: 2047.32 }
const livePrice = ref(2062.59)

// 模拟当天未来截点 (仅留一个)
const futureSegments = [
  { id: 'today', label: '12 PM Feb 27' }
]
const selectedFutureId = ref(null)

// --- 数据衍生 ---
const displayTargetPrice = computed(() => {
  if (activeSegmentMode.value === 'past') return selectedPastRecord.value?.targetPrice
  if (activeSegmentMode.value === 'live') return liveSegment.targetPrice
  return null
})

const currentPriceChars = computed(() => {
  return livePrice.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('')
})

const diffData = computed(() => {
  let current, target;
  if (activeSegmentMode.value === 'past') {
    current = selectedPastRecord.value.finalPrice
    target = selectedPastRecord.value.targetPrice
  } else if (activeSegmentMode.value === 'live') {
    current = livePrice.value
    target = liveSegment.targetPrice
  } else {
    return { status: '', value: '' }
  }
  const diff = current - target
  return { status: diff >= 0 ? 'up' : 'down', value: Math.abs(diff).toFixed(2) }
})

const formatPrice = (val) => val ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ''

// --- Echarts 滑动图表 ---
const chartRef = ref(null)
let chartInstance = null
let chartDataX = []
let chartDataY = []
let lastGenTime = 0

const generateMockData = () => {
  chartDataX = []
  chartDataY = []
  if (activeSegmentMode.value === 'past') {
    let base = selectedPastRecord.value.targetPrice
    const final = selectedPastRecord.value.finalPrice
    for (let i = 0; i < 49; i++) {
      chartDataX.push(`12:${(i + 10).toString().padStart(2, '0')}`)
      base += (final - base) * 0.1 + (Math.random() - 0.5) * 5
      chartDataY.push(base)
    }
    chartDataX.push(`End`)
    chartDataY.push(final)
  } else {
    let base = 2060.00
    lastGenTime = new Date().getTime() - 50 * 2000
    for (let i = 0; i < 50; i++) {
      const d = new Date(lastGenTime)
      chartDataX.push(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`)
      base += (Math.random() - 0.45) * 0.5
      chartDataY.push(base)
      lastGenTime += 2000
    }
    livePrice.value = chartDataY[chartDataY.length - 1]
  }
}

const chartColors = computed(() => ({
  axisLabel: themeStore.isDark ? '#666' : '#888',
  splitLine: themeStore.isDark ? '#2a2f34' : '#e0e0e0',
  primary: '#5073e5',
}))

const updateChart = () => {
  if (!chartInstance) return
  const colors = chartColors.value
  let markLineData = []
  if (activeSegmentMode.value !== 'future') {
    markLineData = [{ yAxis: displayTargetPrice.value }]
  }

  const option = {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 300,
    animationDurationUpdate: 2000,
    animationEasingUpdate: 'linear',
    grid: { left: '2%', right: '15%', top: '15%', bottom: '12%', containLabel: false },
    xAxis: {
      type: 'category', data: chartDataX,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { show: true, interval: Math.floor(chartDataX.length / 2), color: colors.axisLabel, fontSize: 10 }
    },
    yAxis: {
      type: 'value', position: 'right', scale: true,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { formatter: (v) => '$' + v.toFixed(2), color: colors.axisLabel, fontSize: 10 },
      splitLine: { lineStyle: { color: colors.splitLine } }
    },
    series: [
      {
        name: 'PriceLine', type: 'line', data: chartDataY,
        smooth: 0.3, symbol: 'none',
        lineStyle: { width: 3, color: colors.primary },
        markLine: {
          symbol: ['none', 'none'], label: { show: false },
          data: markLineData,
          lineStyle: { type: 'dashed', color: '#888', width: 1, opacity: 0.6 }
        }
      }
    ]
  }

  if (activeSegmentMode.value !== 'past') {
    option.series.push({
      name: 'PulseDot', type: 'effectScatter', coordinateSystem: 'cartesian2d',
      data: [[chartDataX[chartDataX.length - 1], chartDataY[chartDataY.length - 1]]],
      symbolSize: 8, showEffectOn: 'render',
      rippleEffect: { period: 2, scale: 3, brushType: 'fill' },
      itemStyle: { color: colors.primary, shadowBlur: 10, shadowColor: colors.primary },
      zlevel: 1
    })
  }
  chartInstance.setOption(option, false)
}

let wsInterval = null
const startWebSocketMock = () => {
  wsInterval = setInterval(() => {
    if (activeSegmentMode.value !== 'past') {
      const newPrice = livePrice.value + (Math.random() - 0.48) * 0.3
      livePrice.value = newPrice
      const d = new Date(lastGenTime)
      const newTimeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
      chartDataX.push(newTimeStr)
      chartDataY.push(newPrice)
      if (chartDataX.length > 50) {
        chartDataX.shift()
        chartDataY.shift()
      }
      lastGenTime += 2000
      updateChart()
    }
  }, 2000)
}

// --- 🔥 事件交互：管理左侧历史标签的挂载与销毁 🔥 ---
const selectPastRecord = (record) => {
  activeSegmentMode.value = 'past'
  selectedPastRecord.value = record // 记录存在，模板 v-if 满足，在最左侧挂载该标签
  generateMockData()
  updateChart()
}

const selectLiveSegment = () => {
  activeSegmentMode.value = 'live'
  selectedPastRecord.value = null // 清除记录，模板 v-if 不满足，历史标签销毁！
  selectedFutureId.value = null
  generateMockData()
  updateChart()
}

const selectFutureSegment = (ft) => {
  activeSegmentMode.value = 'future'
  selectedFutureId.value = ft.id
  selectedPastRecord.value = null // 同理销毁
  generateMockData()
  updateChart()
}

watch(() => themeStore.isDark, () => updateChart())

onMounted(() => {
  startCountDown()
  generateMockData()
  nextTick(() => {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
    startWebSocketMock()
  })
  window.addEventListener('resize', () => chartInstance?.resize())
})
onUnmounted(() => {
  clearInterval(timerInterval)
  clearInterval(wsInterval)
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
/* 备份文件：内容与原 `index.vue` 保持一致 */
</style>

<style lang="scss">
</style>
