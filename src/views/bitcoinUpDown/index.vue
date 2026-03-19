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
          <span class="top-volume">{{ topVolumeText }}</span>
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
            <h2>{{ detailData.title || $t('bitcoinUpDown.questionTitle') }}</h2>
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
        <div v-if="positions.length">
          <div v-for="(pos, index) in positions" :key="pos.id" class="pos-card">
            <h3 v-if="index === 0" class="pos-title">{{ pos.title }}</h3>
            <span class="pos-tag" :class="pos.outcome">{{ pos.tagLabel }}</span>
            <div class="pos-grid">
              <div class="grid-item">
                <div class="g-label">{{ $t('crypto.avgPrice') }}</div>
                <div class="g-val">{{ pos.avgPrice }}</div>
              </div>
              <div class="grid-item">
                <div class="g-label">{{ $t('crypto.cost') }}</div>
                <div class="g-val">{{ pos.cost }}</div>
              </div>
              <div class="grid-item">
                <div class="g-label">{{ $t('crypto.current') }}</div>
                <div class="g-val">{{ pos.current }}</div>
              </div>
              <div class="grid-item">
                <div class="g-label">{{ $t('crypto.profit') }}</div>
                <div class="g-val" :class="{ 'neon': pos.profitPositive, 'hot-pink': !pos.profitPositive }">{{
                  pos.profit }}
                </div>
              </div>
            </div>
            <button class="withdraw-hero-btn" :class="pos.outcome" type="button" @click="handlePositionWithdraw(pos)">{{
              $t('crypto.withdraw')
              }}</button>
          </div>
        </div>
        <div v-else class="orders-empty">{{ $t('common.noData') || '暂无数据...' }}</div>
      </div>

      <!-- Orders -->
      <div v-else-if="activeTab === 'Orders'" class="orders-content">
        <div class="orders-header-row">
          <div class="orders-title">{{ $t('crypto.openOrders') }}</div>
          <button class="cancel-all-btn" type="button" v-if="openOrders.length" @click="handleCancelAllOrders">
            {{ $t('crypto.cancelAll') }}
          </button>
        </div>

        <div v-if="openOrders.length" class="orders-list">
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
        <div v-if="orderHistory.length" class="history-list">
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
          <span class="vol">{{ orderBookVolumeText }}</span>
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
        <OrderBookMobile :active-side="orderBookTab" :asks="currentOrderBook.asks" :bids="currentOrderBook.bids"
          :last-trade-price="currentOrderBook.last_trade_price" :loading="orderBookLoading"
          :use-mock-fallback="false" />
      </div>

      <div class="rules-footer">
        <h4>{{ $t('detail.rules') }}</h4>
        <p>{{ detailData.rulesDescription || $t('bitcoinUpDown.rulesDescription') }}</p>
      </div>
    </div>

    <!-- 吸底操作栏 -->
    <div class="bottom-dock-actions">
      <!-- 事件未结束时显示购买按钮 -->
      <template v-if="!isEventEnded">
        <button class="trade-btn up" type="button" @click="openPayment('up')">
          {{ $t('common.buy') }} {{ $t('crypto.up') }} {{ upTradePriceText }}
        </button>
        <button class="trade-btn down" type="button" @click="openPayment('down')">
          {{ $t('common.buy') }} {{ $t('crypto.down') }} {{ downTradePriceText }}
        </button>
      </template>
      <!-- 事件已结束时显示提示 -->
      <div v-else class="event-ended-tip">
        {{ $t('bitcoinUpDown.eventEnded') }}
      </div>
    </div>

    <PaymentModal v-model="showPayment" :event-title="detailData.eventTitle || detailData.title"
      :outcome-title="paymentOutcomeTitle" :event-guid="currentEventGuid" :sub-event-guid="resolvedSubEventGuid"
      :initial-outcome="paymentInitialOutcome" :initial-side="paymentInitialSide" @order-success="onOrderSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, ArrowDown, Trophy } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { createIotMqttClient, hasWebCrypto } from '@/utils/mqttClient'
import OrderBookMobile from '@/components/OrderBookMobile.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import { useThemeStore } from '@/stores/theme'
import {
  cancelOrder,
  fiatWithdraw,
  getEventDetailItem,
  getEventPriceHistory,
  getOpenOrders,
  getOrderBook,
  getOrderHistory,
  getSubEventDetail,
  getUserPositions,
} from '@/api/APIEvent'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const FALLBACK_USER_GUID = '41f83791b601426896bcb39f45e2fd12'

const handleBack = () => router.back()
const goWithdraw = () => router.push({ name: 'withdraw' })
const currentEventGuid = computed(() => route.query.id || route.query.event_guid || '')
const requestedSubEventGuid = computed(() => route.query.sub_event_guid || '')
const activeTab = ref('Positions')
const isBookOpen = ref(false)
const orderBookTab = ref('yes')

const getUserGuid = () => window.sessionStorage.getItem('user_guid') || FALLBACK_USER_GUID
const isRespSuccess = (res) => {
  const code = res?.data?.code
  return code === 0 || code === 200 || code === 2000
}

// 图表与时间按钮统一使用用户本地时区
const formatTimeLocal = (dateOrStr, opts = {}) => {
  const date = dateOrStr instanceof Date ? dateOrStr : new Date(String(dateOrStr || '').replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', {
    hour: '2-digit',
    minute: '2-digit',
    second: opts.seconds ? '2-digit' : undefined,
    hour12: false,
    // 不传 timeZone，使用用户浏览器本地时区
  }).format(date)
}

// --- MQTT (AWS IoT Core) 实时数据 ---
// IoT Region 用于指定 AWS 区域
const IOT_REGION = import.meta.env.VITE_IOT_REGION || 'ap-southeast-1'
// IoT Endpoint 用于指定 AWS IoT 端点
const IOT_ENDPOINT = import.meta.env.VITE_IOT_ENDPOINT || 'a3awip9q9thtco-ats.iot.ap-southeast-1.amazonaws.com'
// Cognito Identity Pool ID 用于指定 AWS Cognito 身份池 ID
const COGNITO_IDENTITY_POOL_ID =
  import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || 'ap-southeast-1:ec400695-b709-4af1-a19b-455cded69acf'

/** @type {ReturnType<import('@/utils/mqttClient').createIotMqttClient>|null} */
let iotMqtt = null
let mqttDestroyed = false

// 是否启用本页面 MQTT 推送
const shouldUseMqtt = computed(() => {
  const enabled = !!IOT_ENDPOINT && !!COGNITO_IDENTITY_POOL_ID && hasWebCrypto()
  console.log('[MQTT][debug] shouldUseMqtt', {
    enabled,
    IOT_ENDPOINT,
    COGNITO_IDENTITY_POOL_ID,
    hasWebCrypto: hasWebCrypto(),
  })
  return enabled
})

// ── 事件结束状态 ──
// 通过 API 状态字段或倒计时归零两种途径判断事件是否已结束
const eventEnded = ref(false)
const isEventEnded = computed(() => {
  if (eventEnded.value) return true
  const status = String(detailData.value.eventStatus || '').toLowerCase()
  return ['settled', 'ended', 'closed', 'resolved', 'expired', 'finished', 'completed'].includes(status)
})

// ═══════════════════════════════════════════════════════
// ■ 数据格式化工具函数
// ═══════════════════════════════════════════════════════
const formatCompactNumber = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0'
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toFixed(2)
}

const formatMoney = (value, digits = 2) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '--'
  return `${num.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}$`
}

const formatPrice = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '--'
  return formatMoney(num)
}

const formatPriceNumber = (value, digits = 2) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '--'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

const formatCentText = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '--'
  if (num > 0 && num <= 1) {
    return `${(num * 100).toFixed(0)} ¢`
  }
  return `${num.toFixed(2)}`
}

const formatCentValue = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '--'
  if (num > 0 && num <= 1) {
    return (num * 100).toFixed(0)
  }
  return num.toFixed(2)
}

const formatVolumeText = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return `$0 ${t('bitcoinUpDown.volume')}`
  return `$${formatCompactNumber(num)} ${t('bitcoinUpDown.volume')}`
}

const formatAgo = (value) => {
  if (!value) return ''
  const date = new Date(String(value).replace(' ', 'T'))
  const ts = date.getTime()
  if (Number.isNaN(ts)) return String(value)
  const diffSeconds = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  const minutes = Math.floor(diffSeconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

const firstFinite = (...values) => {
  for (const value of values.flat()) {
    const num = Number(value)
    if (Number.isFinite(num)) return num
  }
  return null
}

const outcomeToTrend = (value) => {
  const text = String(value || '').toLowerCase()
  return text === 'no' || text === 'down' ? 'down' : 'up'
}

// ═══════════════════════════════════════════════════════
// ■ 响应式状态 & 派生数据
// ═══════════════════════════════════════════════════════
const detailData = ref({
  eventTitle: '',
  title: '',
  tradeVolume: 0,
  rulesDescription: '',
  closeTime: '',
  targetPrice: null,
  currentPrice: null,
  yesAskPrice: '--',
  noAskPrice: '--',
  yesBidPrice: '--',
  noBidPrice: '--',
  subEventGuidResolved: '',
  eventStatus: '',  // 事件状态（settled/ended/closed 等表示已结束）
})

// 已解析的子事件 GUID
const resolvedSubEventGuid = computed(() => detailData.value.subEventGuidResolved || requestedSubEventGuid.value || '')
// 顶部成交量文本
const topVolumeText = computed(() => formatVolumeText(detailData.value.tradeVolume))
// 买入 UP 价格文本
const upTradePriceText = computed(() => detailData.value.yesAskPrice || '--')
// 买入 DOWN 价格文本
const downTradePriceText = computed(() => detailData.value.noAskPrice || '--')

// 持仓列表（同一事件下可能包含 up / down 多条）
const positions = ref([])
// 挂单列表
const openOrders = ref([])
// 历史订单列表
const orderHistory = ref([])
// 订单簿加载状态
const orderBookLoading = ref(false)
// 订单簿 YES 方向
const orderBookYes = ref({ asks: [], bids: [], last_trade_price: '' })
// 订单簿 NO 方向
const orderBookNo = ref({ asks: [], bids: [], last_trade_price: '' })
// 当前订单簿
const currentOrderBook = computed(() => (orderBookTab.value === 'yes' ? orderBookYes.value : orderBookNo.value))
// 订单簿成交量文本
const orderBookVolumeText = computed(() => {
  const current = currentOrderBook.value || {}
  const rows = [...(current.asks || []), ...(current.bids || [])]
  const notional = rows.reduce((sum, row) => sum + (Number(row.price) || 0) * (Number(row.quantity) || 0), 0)
  if (!notional) return formatMoney(detailData.value.tradeVolume || 0, 0)
  return `$${formatCompactNumber(notional)}`
})

// 支付弹窗标题
const paymentOutcomeTitle = ref('')
// 支付弹窗初始 outcome
const paymentInitialOutcome = ref('YES')
// 支付弹窗初始 side
const paymentInitialSide = ref('buy')
// 支付弹窗显示状态
const showPayment = ref(false)

// ═══════════════════════════════════════════════════════
// ■ 支付弹窗
// ═══════════════════════════════════════════════════════

// 打开支付弹窗，根据方向设置初始 outcome
const openPayment = (side) => {
  paymentOutcomeTitle.value = detailData.value.title || detailData.value.eventTitle || ''
  paymentInitialOutcome.value = side === 'up' ? 'YES' : 'NO'
  paymentInitialSide.value = 'buy'
  showPayment.value = true
}

// 下单成功后刷新所有相关数据
const onOrderSuccess = async () => {
  await Promise.allSettled([
    fetchDetail(),
    fetchPositions(),
    fetchOpenOrders(),
    fetchOrderHistory(),
    fetchOrderBook(),
  ])
}

// ═══════════════════════════════════════════════════════
// ■ 持仓 / 订单 / 历史 数据处理
// ═══════════════════════════════════════════════════════

// 将服务端持仓数据映射为页面展示格式
const mapPositionCard = (item) => {
  const outcome = outcomeToTrend(item?.outcome)
  const shares = Number(
    item?.shares ??
    item?.position_size ??
    item?.size ??
    item?.quantity ??
    0,
  )
  const costNum = firstFinite(item?.bet_amount, item?.dealed_cost, item?.cost, item?.position_value) || 0
  const currentNum = firstFinite(
    item?.current_price,
    item?.current_value,
    item?.position_value,
    item?.bet_amount,
  ) || 0
  // 可赢金额 to_win_amount：作为 profit 的兜底来源之一
  const profitNum = firstFinite(item?.profit_loss, item?.profit, item?.to_win_amount) || 0
  // 优先使用接口返回的收益/亏损率字段，其次用 profit / cost 计算
  const profitPct = firstFinite(
    item?.profit_rate,
    item?.lost_rate,
    costNum ? (profitNum / costNum) * 100 : 0,
  ) || 0
  return {
    id: item?.guid || item?.position_guid || item?.sub_event_guid || `${item?.event_guid || 'pos'}-${item?.outcome || 'yes'}`,
    title: item?.sub_event_title || item?.event_name || detailData.value.title || t('crypto.upOrDown'),
    tagLabel: `${outcome === 'up' ? t('crypto.up') : t('crypto.down')} | ${shares || 0} ${t('sports.shares')}`,
    avgPrice: formatCentText(item?.avg_price ?? item?.current_price),
    cost: formatMoney(costNum),
    current: formatMoney(currentNum),
    profit: `${profitNum >= 0 ? '+' : '-'}${formatMoney(Math.abs(profitNum))}${costNum ? `(${profitPct >= 0 ? '+' : ''}${profitPct.toFixed(2)}%)` : ''}`,
    profitPositive: profitNum >= 0,
    raw: item,
    outcome
  }
}

// 持仓提现：读取指定持仓金额，调用法币提现接口
const handlePositionWithdraw = async (pos) => {
  const raw = pos?.raw || {}
  const amountPicked = firstFinite([
    raw?.withdraw_amount,
    raw?.amount,
    raw?.position_value,
    raw?.current_value,
    raw?.profit_loss,
    raw?.profit,
  ])
  const amount = Number.isFinite(amountPicked) && amountPicked > 0 ? String(amountPicked) : null
  const currency_code = raw?.currency_code || raw?.currency || 'USD'
  const user_guid = getUserGuid()

  const missing = ['amount', 'currency_code', 'user_guid'].filter((k) => !({ amount, currency_code, user_guid }[k]))
  if (missing.length) {
    ElMessage.error(`Withdraw 参数缺失：${missing.join(', ')}`)
    return
  }

  try {
    const res = await fiatWithdraw({ amount, currency_code, user_guid })
    if (!isRespSuccess(res)) throw new Error(res?.data?.message || 'Withdraw failed')
    ElMessage.success(res?.data?.message || 'Withdraw success')
    await Promise.allSettled([fetchPositions(), fetchOpenOrders(), fetchOrderHistory()])
  } catch (e) {
    ElMessage.error(e?.message || 'Withdraw failed')
  }
}

// 将服务端挂单数据映射为页面展示格式
const mapOpenOrder = (item) => ({
  id: item?.guid || item?.order_guid || '',
  orderGuid: item?.guid || item?.order_guid || '',
  side: outcomeToTrend(item?.outcome),
  price: formatCentValue(item?.price),
  cost: Number(firstFinite(item?.cost, item?.dealed_cost) || 0).toFixed(2),
  filled: Number(firstFinite(item?.dealed_size) || 0).toFixed(0),
  total: Number(firstFinite(item?.size) || 0).toFixed(0),
  untilCancel: !item?.expire_at,
})

// 将服务端历史订单数据映射为页面展示格式
const mapOrderHistoryItem = (item) => ({
  id: item?.order_guid || item?.guid || '',
  side: outcomeToTrend(item?.outcome),
  shares: Number(firstFinite(item?.dealed_size, item?.size) || 0).toFixed(0),
  price: formatCentValue(item?.dealed_price ?? item?.price),
  notional: Number(firstFinite(item?.dealed_cost, item?.cost) || 0).toFixed(2),
  timeAgo: formatAgo(item?.dealed_at || item?.created_at),
})

// 拉取当前用户在本事件下的持仓列表
const fetchPositions = async () => {
  if (!currentEventGuid.value) {
    positions.value = []
    return
  }
  try {
    const currentLocale = localStorage.getItem('app-locale') || navigator.language || 'en'
    const languageLabel = currentLocale.split('-')[0]
    const res = await getUserPositions({
      user_guid: getUserGuid(),
      status: 'holding',
      page: 1,
      page_size: 2000,
      language_label: languageLabel,
    })
    if (!isRespSuccess(res)) throw new Error(res?.data?.message || 'Fetch positions failed')
    const list = Array.isArray(res?.data?.data?.list) ? res.data.data.list : []
    positions.value = list
      .filter(item => !currentEventGuid.value || item?.event_guid === currentEventGuid.value)
      .map(mapPositionCard)
  } catch (error) {
    console.error('Fetch positions failed', error)
    positions.value = []
  }
}

// 拉取当前用户在本事件下的挂单列表
const fetchOpenOrders = async () => {
  if (!currentEventGuid.value) {
    openOrders.value = []
    return
  }
  try {
    const res = await getOpenOrders({
      user_guid: getUserGuid(),
      page: 1,
      page_size: 20,
      event_guid: currentEventGuid.value,
      sub_event_guid: resolvedSubEventGuid.value || undefined,
      order_type: 'all',
      side: 'all',
    })
    if (!isRespSuccess(res)) throw new Error(res?.data?.message || 'Fetch open orders failed')
    const list = Array.isArray(res?.data?.data?.orders) ? res.data.data.orders : []
    openOrders.value = list.map(mapOpenOrder)
  } catch (error) {
    console.error('Fetch open orders failed', error)
    openOrders.value = []
  }
}

// 拉取当前用户在本事件下的历史订单列表
const fetchOrderHistory = async () => {
  if (!currentEventGuid.value) {
    orderHistory.value = []
    return
  }
  try {
    const res = await getOrderHistory({
      user_guid: getUserGuid(),
      page: 1,
      page_size: 20,
      status: '',
      is_settled: '',
      event_guid: currentEventGuid.value,
      sub_event_guid: resolvedSubEventGuid.value || undefined,
    })
    if (!isRespSuccess(res)) throw new Error(res?.data?.message || 'Fetch order history failed')
    const list = Array.isArray(res?.data?.data?.orders) ? res.data.data.orders : []
    orderHistory.value = list.map(mapOrderHistoryItem)
  } catch (error) {
    console.error('Fetch order history failed', error)
    orderHistory.value = []
  }
}

// 取消单笔挂单
const handleCancelOrder = async (id) => {
  const order = openOrders.value.find(item => item.id === id)
  if (!order?.orderGuid) return
  try {
    const res = await cancelOrder({ order_guid: order.orderGuid })
    if (!isRespSuccess(res)) throw new Error(res?.data?.message || 'Cancel failed')
    ElMessage.success(t('assetManagement.cancelSuccess') || 'Canceled')
    await fetchOpenOrders()
  } catch (error) {
    ElMessage.error(error?.message || 'Cancel failed')
  }
}

// 批量取消所有挂单
const handleCancelAllOrders = async () => {
  const orderGuids = openOrders.value.map(item => item.orderGuid).filter(Boolean)
  if (!orderGuids.length) return
  try {
    await Promise.all(orderGuids.map(orderGuid => cancelOrder({ order_guid: orderGuid })))
    ElMessage.success(t('assetManagement.cancelSuccess') || 'Canceled')
    await fetchOpenOrders()
  } catch (error) {
    ElMessage.error(error?.message || 'Cancel failed')
  }
}

// ═══════════════════════════════════════════════════════
// ■ 页面滚动吸顶 & 倒计时
// ═══════════════════════════════════════════════════════
const isSticky = ref(false)
const handleScroll = (e) => {
  isSticky.value = e.target.scrollTop > 20
}

// --- 倒计时 ---
const targetTime = ref(0)
const countDown = ref({ hours: '00', minutes: '00', seconds: '00' })
let timerInterval = null
// 启动倒计时（每秒刷新）
const startCountDown = () => {
  clearInterval(timerInterval)
  updateCountDown()
  timerInterval = setInterval(updateCountDown, 1000)
}

// 当倒计时归零且目标时间有效时，标记事件为已结束
const updateCountDown = () => {
  const diff = Math.max(0, Math.floor((targetTime.value - Date.now()) / 1000))
  const hours = Math.floor(diff / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0')
  const seconds = (diff % 60).toString().padStart(2, '0')
  countDown.value = { hours, minutes, seconds }
  if (diff === 0 && targetTime.value > 0 && Date.now() > targetTime.value) {
    eventEnded.value = true
  }
}

// ═══════════════════════════════════════════════════════
// ■ 时间轴状态机（实时 / 历史 / 未来）
// ═══════════════════════════════════════════════════════
const activeSegmentMode = ref('live')

const pastRecords = ref([])
const lastThreeResults = computed(() => pastRecords.value.slice(0, 3))
const selectedPastRecord = ref(null)

const liveSegment = computed(() => {
  if (!detailData.value.closeTime) return { label: 'Live', targetPrice: detailData.value.targetPrice }
  const label = formatTimeLocal(detailData.value.closeTime)
  if (!label) return { label: 'Live', targetPrice: detailData.value.targetPrice }
  return {
    label,
    targetPrice: detailData.value.targetPrice,
  }
})
const futureSegments = computed(() => [])
const selectedFutureId = ref(null)
const livePrice = ref(null)

// --- 数据衍生 ---
const displayTargetPrice = computed(() => {
  if (activeSegmentMode.value === 'past') return selectedPastRecord.value?.targetPrice
  if (activeSegmentMode.value === 'live') return liveSegment.value.targetPrice
  return null
})

const currentPriceChars = computed(() => {
  if (!Number.isFinite(livePrice.value)) return ['-', '-']
  return livePrice.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('')
})

const diffData = computed(() => {
  let current
  let target
  if (activeSegmentMode.value === 'past') {
    current = selectedPastRecord.value?.finalPrice
    target = selectedPastRecord.value?.targetPrice
  } else if (activeSegmentMode.value === 'live') {
    current = livePrice.value
    target = liveSegment.value.targetPrice
  } else {
    return { status: '', value: '--' }
  }
  if (!Number.isFinite(current) || !Number.isFinite(target)) return { status: '', value: '--' }
  const diff = current - target
  return { status: diff >= 0 ? 'up' : 'down', value: Math.abs(diff).toFixed(2) }
})

// ═══════════════════════════════════════════════════════
// ■ ECharts 价格走势图
// ═══════════════════════════════════════════════════════
// 图表引用
const chartRef = ref(null)
// 图表实例
let chartInstance = null
// 图表 X 轴数据
let chartDataX = []
// 图表 Y 轴数据
let chartDataY = []
// 实时价格点队列
let liveSeriesPoints = []

// 设置图表点数据
const setChartPoints = (points) => {
  chartDataX = points.map(point => point.label)
  chartDataY = points.map(point => point.value)
}

// 同步实时图表
const syncLiveChart = () => {
  setChartPoints(liveSeriesPoints)
  updateChart()
}

// 将 API 返回的历史价格数据解析为图表所需的 [{label, value, timestamp}] 格式
const buildChartPointsFromHistory = (priceHistoryData) => {
  console.log('[Chart]', 'buildChartPointsFromHistory 历史价格', priceHistoryData)
  const points = Array.isArray(priceHistoryData?.data_points) ? priceHistoryData.data_points : []
  if (!points.length) return []
  const pickedPoint = points.find(item => Array.isArray(item?.history) && item.history.length) || points[0]
  const histories = Array.isArray(pickedPoint?.history) ? pickedPoint.history : []
  const pickedHistory = histories.find(item => (item?.outcome || '').toLowerCase() === 'yes') || histories[0]
  const rows = Array.isArray(pickedHistory?.data) ? pickedHistory.data : []
  const result = rows
    .map(row => {
      const price = Number(row?.p)
      if (!Number.isFinite(price)) return null
      const label = formatTimeLocal(row?.t) || String(row?.t || '')
      return { label, value: price, timestamp: row?.t || '' }
    })
    .filter(Boolean)
    .slice(-50)
  return result
}

// 将新的实时价格点追加到走势图数据队列（最多保留 50 个点）
const pushPricePoint = (price, ts) => {
  const num = Number(price)
  if (!Number.isFinite(num)) return
  const label = formatTimeLocal(ts || new Date(), { seconds: true }) || new Date().toLocaleTimeString('en-US', { hour12: false })
  const point = { label, value: num, timestamp: (ts ? new Date(ts) : new Date()).toISOString() }
  liveSeriesPoints.push(point)
  console.log('[Chart]', 'pushPricePoint 实时价格', { price: num, timestamp: point.timestamp, label, totalPoints: liveSeriesPoints.length })
  if (liveSeriesPoints.length > 50) {
    liveSeriesPoints = liveSeriesPoints.slice(-50)
  }
  livePrice.value = num
  detailData.value.currentPrice = num
  if (activeSegmentMode.value === 'live') {
    syncLiveChart()
  }
}

const chartColors = computed(() => ({
  axisLabel: themeStore.isDark ? '#666' : '#888',
  splitLine: themeStore.isDark ? '#2a2f34' : '#e0e0e0',
  primary: '#5073e5',
}))

// 将当前数据渲染到 ECharts 实例（含目标价参考线和实时脉冲点）
const updateChart = () => {
  if (!chartInstance) return
  const colors = chartColors.value
  let markLineData = []
  if (activeSegmentMode.value !== 'future' && Number.isFinite(displayTargetPrice.value)) {
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

// ═══════════════════════════════════════════════════════
// ■ 订单簿（Order Book）
// ═══════════════════════════════════════════════════════

// 标准化订单簿单侧数据，兼容 quantity/size/shares/qty 多种字段名
const normalizeOrderBookSide = (book = {}) => ({
  asks: Array.isArray(book?.asks)
    ? book.asks.map((l) => ({
      ...l,
      quantity: l?.quantity ?? l?.size ?? l?.shares ?? l?.qty,
    }))
    : [],
  bids: Array.isArray(book?.bids)
    ? book.bids.map((l) => ({
      ...l,
      quantity: l?.quantity ?? l?.size ?? l?.shares ?? l?.qty,
    }))
    : [],
  last_trade_price: String(book?.last_trade_price ?? book?.lastPrice ?? ''),
})

// 将 MQTT 或 REST 推送的订单簿数据应用到响应式状态
const applyOrderBookPayload = (payload, outcome = '') => {
  if (!payload || typeof payload !== 'object') return
  const yesKey = payload.yes || payload.YES
  const noKey = payload.no || payload.NO
  if (yesKey || noKey) {
    if (yesKey) orderBookYes.value = normalizeOrderBookSide(yesKey)
    if (noKey) orderBookNo.value = normalizeOrderBookSide(noKey)
    console.log('[OrderBook]', 'applyOrderBookPayload 订单簿', {
      yes: { asks: orderBookYes.value.asks?.length, bids: orderBookYes.value.bids?.length, last_trade_price: orderBookYes.value.last_trade_price },
      no: { asks: orderBookNo.value.asks?.length, bids: orderBookNo.value.bids?.length, last_trade_price: orderBookNo.value.last_trade_price },
    })
    return
  }
  if (!Array.isArray(payload.asks) && !Array.isArray(payload.bids)) return
  const side = outcome === 'no' ? 'no' : 'yes'
  if (side === 'yes') {
    orderBookYes.value = normalizeOrderBookSide(payload)
  } else {
    orderBookNo.value = normalizeOrderBookSide(payload)
  }
  console.log('[OrderBook]', 'applyOrderBookPayload 单侧订单簿', { side, asks: payload.asks?.length, bids: payload.bids?.length })
}

// ── API 获取：订单簿快照（含最新成交价和成交量）──
const fetchOrderBook = async () => {
  if (!currentEventGuid.value || !resolvedSubEventGuid.value) {
    orderBookYes.value = { asks: [], bids: [], last_trade_price: '' }
    orderBookNo.value = { asks: [], bids: [], last_trade_price: '' }
    return
  }
  orderBookLoading.value = true
  try {
    const res = await getOrderBook({
      event_guid: currentEventGuid.value,
      sub_event_guid: resolvedSubEventGuid.value,
      outcome: 'all',
    })
    if (!isRespSuccess(res)) throw new Error(res?.data?.message || 'Fetch order book failed')
    const data = res?.data?.data || {}
    applyOrderBookPayload(data)
    const volFromBook = firstFinite(data?.trade_volume, data?.total_volume, data?.yes?.trade_volume, data?.no?.trade_volume)
    if (Number.isFinite(volFromBook) && volFromBook > 0) {
      detailData.value.tradeVolume = volFromBook
      console.log('[Amount]', 'fetchOrderBook tradeVolume', { tradeVolume: volFromBook })
    }
    const latest = firstFinite(data?.yes?.last_trade_price, data?.no?.last_trade_price)
    if (Number.isFinite(latest) && !Number.isFinite(livePrice.value)) {
      livePrice.value = latest
      detailData.value.currentPrice = latest
    }
  } catch (error) {
    console.error('Fetch order book failed', error)
    orderBookYes.value = { asks: [], bids: [], last_trade_price: '' }
    orderBookNo.value = { asks: [], bids: [], last_trade_price: '' }
  } finally {
    orderBookLoading.value = false
  }
}

// ── API 获取：历史价格走势数据（初始化图表）──
const fetchPriceHistory = async () => {
  if (!currentEventGuid.value) return
  try {
    const res = await getEventPriceHistory({
      event_guid: currentEventGuid.value,
      sub_event_guid: resolvedSubEventGuid.value || undefined,
      interval: '5m',
      range: '1d',
    })
    if (!isRespSuccess(res)) throw new Error(res?.data?.message || 'Fetch price history failed')
    liveSeriesPoints = buildChartPointsFromHistory(res?.data?.data?.data || res?.data?.data || {})
    if (liveSeriesPoints.length) {
      const latest = liveSeriesPoints[liveSeriesPoints.length - 1]
      livePrice.value = latest.value
      detailData.value.currentPrice = latest.value
      if (activeSegmentMode.value === 'live') {
        syncLiveChart()
      }
    }
  } catch (error) {
    console.error('Fetch price history failed', error)
    liveSeriesPoints = []
    setChartPoints([])
    updateChart()
  }
}

// ── API 获取：事件详情（标题、目标价、关闭时刱00、方向价格、成交量）──
const fetchDetail = async () => {
  if (!currentEventGuid.value) return
  try {
    const currentLocale = localStorage.getItem('app-locale') || navigator.language || 'en'
    const language = currentLocale.split('-')[0]
    const [detailRes, subRes] = await Promise.all([
      getEventDetailItem({ event_guid: currentEventGuid.value, language_label: language }),
      getSubEventDetail({ event_guid: currentEventGuid.value, language_label: language }),
    ])
    const eventData = detailRes?.data?.data || {}
    const subData = subRes?.data?.data || {}
    const eventItem = Array.isArray(eventData.events) ? eventData.events[0] : null
    const subEvents = Array.isArray(subData.sub_events)
      ? subData.sub_events
      : Array.isArray(eventItem?.sub_events)
        ? eventItem.sub_events
        : []
    const subEvent = requestedSubEventGuid.value
      ? subEvents.find(item => item.sub_event_guid === requestedSubEventGuid.value) || subEvents[0]
      : subEvents[0]
    const directions = Array.isArray(subEvent?.directions) ? subEvent.directions : []
    const yesDirection = directions.find(item => (item?.outcome || '').toLowerCase() === 'yes') || directions[0] || {}
    const noDirection = directions.find(item => (item?.outcome || '').toLowerCase() === 'no') || directions[1] || {}

    const targetPrice = firstFinite(
      subEvent?.target_price,
      subEvent?.reference_price,
      subEvent?.strike_price,
      eventItem?.target_price,
      route.query.target_price,
    )
    const currentPrice = firstFinite(
      subEvent?.current_price,
      subEvent?.last_price,
      yesDirection?.last_price,
      yesDirection?.new_bid_price,
      yesDirection?.new_ask_price,
    )
    const closeTime = subEvent?.close_time || eventItem?.close_time || ''
    if (closeTime) {
      const closeTs = new Date(String(closeTime).replace(' ', 'T')).getTime()
      if (!Number.isNaN(closeTs)) {
        targetTime.value = closeTs
        updateCountDown()
      }
    }

    // 解析事件状态（多种字段名兼容）
    const rawStatus = subEvent?.status || subEvent?.event_status || eventItem?.status || eventItem?.event_status || ''
    const isSettled = subEvent?.is_settled === true || subEvent?.is_settled === 1
      || eventItem?.is_settled === true || eventItem?.is_settled === 1
    const ENDED_STATUSES = ['settled', 'ended', 'closed', 'resolved', 'expired', 'finished', 'completed']
    if (ENDED_STATUSES.includes(String(rawStatus).toLowerCase()) || isSettled) {
      // API 明确标记为已结束，直接设置标志（不依赖倒计时）
      eventEnded.value = true
    }

    detailData.value = {
      eventTitle: eventItem?.title || subEvent?.title || '',
      title: subEvent?.title || eventItem?.title || '',
      tradeVolume: firstFinite(
        subEvent?.trade_volume, subEvent?.total_volume, subEvent?.bet_volume, subEvent?.total_bet_amount,
        eventItem?.trade_volume, eventItem?.total_volume,
      ) || 0,
      rulesDescription: eventItem?.description || eventItem?.rule_description || '',
      closeTime,
      targetPrice,
      currentPrice,
      yesAskPrice: formatCentText(yesDirection?.new_ask_price || yesDirection?.new_bid_price),
      noAskPrice: formatCentText(noDirection?.new_ask_price || noDirection?.new_bid_price),
      yesBidPrice: formatCentText(yesDirection?.new_bid_price),
      noBidPrice: formatCentText(noDirection?.new_bid_price),
      subEventGuidResolved: subEvent?.sub_event_guid || requestedSubEventGuid.value || '',
      eventStatus: rawStatus,
    }

    if (Number.isFinite(currentPrice)) {
      livePrice.value = currentPrice
    }
  } catch (error) {
    console.error('Fetch detail failed', error)
  }
}

// ═══════════════════════════════════════════════════════
// ■ MQTT 实时业务消息处理
// ═══════════════════════════════════════════════════════

// 将 MQTT 推送的订单合并到本地挂单/历史订单列表
const mergeOpenOrderFromPush = (order) => {
  const next = mapOpenOrder(order)
  console.log('[Amount]', 'mergeOpenOrderFromPush 订单', { id: next?.id, price: next?.price, cost: next?.cost, total: next?.total, filled: next?.filled, side: next?.side })
  // 如果订单没有 ID，则不进行合并
  if (!next?.id) return
  const idx = openOrders.value.findIndex((x) => x.id === next.id)
  const status = String(order?.status || '').toUpperCase()
  // 如果订单状态为已成交、已取消、已拒绝、已过期，则从挂单列表中移除，并添加到历史订单列表
  if (['FILLED', 'CANCELED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(status)) {
    if (idx >= 0) openOrders.value.splice(idx, 1)
    orderHistory.value = [mapOrderHistoryItem(order), ...orderHistory.value].filter((x) => x?.id).slice(0, 50)
    return
  }
  // 如果订单在挂单列表中存在，则更新挂单列表
  if (idx >= 0) openOrders.value.splice(idx, 1, next)
  // 如果订单在挂单列表中不存在，则添加到挂单列表
  else openOrders.value = [next, ...openOrders.value].slice(0, 50)
}

// 根据 MQTT 消息类型分发处理逻辑
const handleMqttBusinessMessage = (data, topic) => {
  if (!data || typeof data !== 'object') return
  const type = data.type
  // ── price_update：实时价格推送，更新走势图表与底部按钮价格 ──
  if (type === 'price_update' && data.prices) {
    const yesPoints = Array.isArray(data.prices?.YES) ? data.prices.YES : []
    const noPoints = Array.isArray(data.prices?.NO) ? data.prices.NO : []
    const picked = yesPoints[yesPoints.length - 1] || noPoints[noPoints.length - 1]
    if (picked?.p) pushPricePoint(picked.p, picked.t)
    const latestYes = yesPoints[yesPoints.length - 1]
    const latestNo = noPoints[noPoints.length - 1]
    if (latestYes?.p) detailData.value.yesAskPrice = formatCentText(latestYes.p)
    if (latestNo?.p) detailData.value.noAskPrice = formatCentText(latestNo.p)
    console.log('[Chart][Amount]', 'price_update', { yesPick: latestYes, noPick: latestNo, yesAskPrice: detailData.value.yesAskPrice, noAskPrice: detailData.value.noAskPrice })
    return
  }
  if (type === 'orderbook') {
    applyOrderBookPayload(data)
    const pickBestAsk = (asks = []) => {
      const prices = (Array.isArray(asks) ? asks : [])
        .map((l) => firstFinite(l?.price))
        .filter((v) => Number.isFinite(v))
      if (!prices.length) return null
      return Math.min(...prices)
    }
    const pickBestBid = (bids = []) => {
      const prices = (Array.isArray(bids) ? bids : [])
        .map((l) => firstFinite(l?.price))
        .filter((v) => Number.isFinite(v))
      if (!prices.length) return null
      return Math.max(...prices)
    }

    const yesBook = data?.YES || data?.yes
    const noBook = data?.NO || data?.no
    const yesBestAsk = pickBestAsk(yesBook?.asks)
    const noBestAsk = pickBestAsk(noBook?.asks)
    const yesBestBid = pickBestBid(yesBook?.bids)
    const noBestBid = pickBestBid(noBook?.bids)

    if (Number.isFinite(yesBestAsk)) detailData.value.yesAskPrice = formatCentText(yesBestAsk)
    if (Number.isFinite(noBestAsk)) detailData.value.noAskPrice = formatCentText(noBestAsk)
    if (Number.isFinite(yesBestBid)) detailData.value.yesBidPrice = formatCentText(yesBestBid)
    if (Number.isFinite(noBestBid)) detailData.value.noBidPrice = formatCentText(noBestBid)
    const vol = firstFinite(data?.trade_volume, data?.total_volume, data?.volume)
    if (Number.isFinite(vol) && vol > 0) detailData.value.tradeVolume = vol
    console.log('[OrderBook][Amount]', 'orderbook', {
      yesAskPrice: detailData.value.yesAskPrice, noAskPrice: detailData.value.noAskPrice,
      tradeVolume: detailData.value.tradeVolume, yesCount: (data?.YES || data?.yes)?.asks?.length, noCount: (data?.NO || data?.no)?.asks?.length,
    })
    return
  }
  // ── trade：成交推送，更新订单簿最新成交价，并将成交价推入走势图表 ──
  if (type === 'trade' && Array.isArray(data.trades) && data.trades.length) {
    console.log('[Chart][OrderBook]', 'trade', { trades: data.trades, count: data.trades.length })
    data.trades.forEach((tr) => {
      const price = firstFinite(tr?.price)
      if (!Number.isFinite(price)) return
      orderBookYes.value.last_trade_price = String(price)
      orderBookNo.value.last_trade_price = String(price)
      if (!tr?.outcome || tr.outcome.toUpperCase() === 'YES') {
        const tradeTs = tr?.trade_time ? new Date(tr.trade_time * 1000).toISOString() : undefined
        pushPricePoint(price, tradeTs)
      }
    })
    return
  }
  if (type === 'user_position' && Array.isArray(data.positions)) {
    const list = data.positions
      .filter((p) => (!currentEventGuid.value || p?.event_guid === currentEventGuid.value) && (!resolvedSubEventGuid.value || p?.sub_event_guid === resolvedSubEventGuid.value))
      .map(mapPositionCard)
    positions.value = list
    return
  }
  if (type === 'user_order' && data.order) {
    const o = data.order
    if (currentEventGuid.value && o?.event_guid && o.event_guid !== currentEventGuid.value) return
    if (resolvedSubEventGuid.value && o?.sub_event_guid && o.sub_event_guid !== resolvedSubEventGuid.value) return
    mergeOpenOrderFromPush(o)
    return
  }

  if (typeof topic === 'string' && topic.startsWith('orders/')) {
    if (data?.order) mergeOpenOrderFromPush(data.order)
  }
}

// ═══════════════════════════════════════════════════════
// ■ MQTT 连接管理
// ═══════════════════════════════════════════════════════

// 销毁当前 MQTT 客户端并清理资源
const stopMqttStream = () => {
  if (!iotMqtt) return
  iotMqtt.destroy()
  iotMqtt = null
}

// 初始化并启动 MQTT 连接，订阅当前事件相关 topic
const startMqttStream = async () => {
  console.log('[MQTT][debug] startMqttStream called', {
    mqttDestroyed,
    shouldUseMqtt: shouldUseMqtt.value,
    isEventEnded: isEventEnded.value,
    eventGuid: currentEventGuid.value,
    subEventGuid: resolvedSubEventGuid.value,
    hasClient: !!iotMqtt,
  })
  if (mqttDestroyed) return
  if (!shouldUseMqtt.value) return
  // 非实时模式不启动 MQTT（用户切到历史/未来时会断开）
  if (activeSegmentMode.value !== 'live') return
  if (isEventEnded.value) return  // 事件已结束，不启动 MQTT 实时推送
  if (!currentEventGuid.value || !resolvedSubEventGuid.value) return
  if (iotMqtt) return

  const userGuid = getUserGuid()
  const topics = [
    `price/${currentEventGuid.value}/${resolvedSubEventGuid.value}`,
    `orderbook/${currentEventGuid.value}/${resolvedSubEventGuid.value}`,
    `trade/${currentEventGuid.value}/${resolvedSubEventGuid.value}`,
    `orders/${userGuid}`,
    `user/${userGuid}/positions`,
  ]

  iotMqtt = createIotMqttClient({
    region: IOT_REGION,
    endpoint: IOT_ENDPOINT,
    identityPoolId: COGNITO_IDENTITY_POOL_ID,
  })

  iotMqtt.on('connect', () => {
    console.log('[MQTT][debug] connected, subscribing topics', topics)
    iotMqtt.subscribe(topics)
  })

  iotMqtt.on('message', (topic, data) => {
    if (mqttDestroyed) return
    console.log('[MQTT] Message received 收到 MQTT 消息', topic, data)
    handleMqttBusinessMessage(data, topic)
  })

  try {
    await iotMqtt.connect()
  } catch (e) {
    console.error('[MQTT] 连接失败 连接 MQTT 失败', e)
    iotMqtt?.destroy()
    iotMqtt = null
  }
}

// ═══════════════════════════════════════════════════════
// ■ 时间轴交互（实时 / 历史 / 未来切换）
// ═══════════════════════════════════════════════════════

// 切换到历史记录视图，展示过去的价格走势
const selectPastRecord = (record) => {
  if (!record?.points?.length) return
  activeSegmentMode.value = 'past'
  selectedPastRecord.value = record
  // 切到历史：断开 MQTT，保持历史视图稳定
  stopMqttStream()
  setChartPoints(record.points)
  updateChart()
}

// 切换回实时视图，清除历史/未来游标
const selectLiveSegment = async () => {
  activeSegmentMode.value = 'live'
  selectedPastRecord.value = null
  selectedFutureId.value = null
  // 回到实时：先渲染“实时按钮对应的历史数据”，再开启 MQTT 用推送覆盖
  await Promise.allSettled([fetchPriceHistory(), fetchOrderBook()])
  syncLiveChart()
  if (shouldUseMqtt.value && !isEventEnded.value) startMqttStream()
}

// 切换到未来时段视图
const selectFutureSegment = (ft) => {
  activeSegmentMode.value = 'future'
  selectedFutureId.value = ft.id
  selectedPastRecord.value = null
  // 切到未来：断开 MQTT，保持未来视图稳定
  stopMqttStream()
  updateChart()
}

// ═══════════════════════════════════════════════════════
// ■ 五器 & 生命周期
// ═══════════════════════════════════════════════════════

// 主题切换时重绘图表
watch(() => themeStore.isDark, () => updateChart())

const resizeHandler = () => chartInstance?.resize()

watch(resolvedSubEventGuid, async (subEventGuid, prevSubEventGuid) => {
  if (!subEventGuid) return
  // 首次赋值（prevSubEventGuid 为空）由 onMounted 统一处理，避免重复拉取
  if (!prevSubEventGuid) return
  // sub_event_guid 切换时：重新加载行情数据并重连 MQTT
  await Promise.allSettled([fetchPriceHistory(), fetchOrderBook(), fetchOpenOrders(), fetchOrderHistory()])
  stopMqttStream()
  // 仅实时模式 & 事件未结束时才重连 MQTT
  if (activeSegmentMode.value === 'live' && shouldUseMqtt.value && !isEventEnded.value) startMqttStream()
})

// 事件进行中途结束（倒计时归零）时，主动断开 MQTT
watch(isEventEnded, (ended) => {
  if (ended) stopMqttStream()
})

onMounted(async () => {
  startCountDown()
  await fetchDetail()
  nextTick(() => {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
  })
  await Promise.allSettled([
    fetchPriceHistory(),
    fetchOrderBook(),
    fetchPositions(),
    fetchOpenOrders(),
    fetchOrderHistory(),
  ])
  if (activeSegmentMode.value === 'live') {
    syncLiveChart()
  }
  // 进入页面：默认先用历史数据渲染（已在 fetchPriceHistory + syncLiveChart 完成），再开启 MQTT 用推送覆盖
  if (activeSegmentMode.value === 'live' && shouldUseMqtt.value) startMqttStream()
  window.addEventListener('resize', resizeHandler)
})
onUnmounted(() => {
  mqttDestroyed = true
  clearInterval(timerInterval)
  stopMqttStream()
  window.removeEventListener('resize', resizeHandler)
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
$hot-pink: var(--text-color-n);
$neon-green: var(--text-color-y);
$primary-blue: #5073e5;

.bitcoin-up-down-page {
  background: var(--bg-page-h5);
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  position: relative;
  flex-shrink: 0;
  z-index: 30;
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

.content-scroller {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 80px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.asset-profile-wrapper {
  position: sticky;
  top: -1px;
  z-index: 20;
  background-color: var(--bg-page-h5);
  margin: 0 -16px 24px -16px;
  padding: 16px 16px 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &.is-sticky {
    padding: 10px 16px;
    background-color: var(--bg-page-h5);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);

    .asset-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }

    .asset-text h2 {
      font-size: 14px;
    }

    .timer .unit {
      font-size: 16px;
    }
  }
}

.asset-profile {
  display: flex;
  align-items: center;
  gap: 12px;

  .asset-logo {
    width: 44px;
    height: 44px;
    background: $primary-blue;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .asset-text {
    flex: 1;
    min-width: 0;
  }

  .asset-text h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
    color: var(--bg-opposite);
    transition: font-size 0.3s ease;
  }

  .timer {
    display: flex;
    gap: 10px;
    margin-left: auto;
    flex-shrink: 0;

    .time-block {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .unit {
      font-size: 20px;
      font-weight: 700;
      color: #888;
      line-height: 1;
      transition: font-size 0.3s ease;
    }

    .label {
      font-size: 9px;
      color: #666;
      margin-top: 4px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  }
}

.time-value,
.price-value {
  display: flex;
  align-items: center;
}

.digit-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 1.2em;
  width: 1ch;
}

.symbol {
  margin: 0 2px;
  color: inherit;
}

.digit,
.digit-static {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}

.fast-roll-enter-active,
.fast-roll-leave-active {
  transition: transform 0.25s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.2s linear;
}

.fast-roll-enter-from {
  transform: translateY(-80%);
  opacity: 0;
}

.fast-roll-leave-to {
  transform: translateY(80%);
  opacity: 0;
  position: absolute;
}

.price-dashboard {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;

  .price-item {
    .label {
      font-size: 13px;
      color: #888;
      font-weight: 600;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;

      .diff {
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .diff.up {
        color: $neon-green;
      }

      .diff.down {
        color: $hot-pink;
      }

      .diff-icon {
        width: 10px;
        height: 10px;
      }
    }

    .value {
      font-weight: 700;
      font-size: 26px;
      color: #888;
    }

    &.current .label,
    &.current .value {
      color: $primary-blue;
    }
  }
}

.chart-section {
  margin-bottom: 10px;
}

.chart-container {
  position: relative;
  height: 220px;
  background: transparent;
  border-bottom: 1px solid var(--border-color);

  .main-chart {
    width: 100%;
    height: 100%;
    -webkit-tap-highlight-color: transparent;
  }
}

.svg-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }

  &.up {
    color: $neon-green;
  }

  &.down {
    color: $hot-pink;
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
    background: var(--bg-page);
    border-radius: 20px;
    padding: 10px 16px;
    gap: 8px;
    border: 1px solid var(--border-color);
    flex-shrink: 0;
    cursor: pointer;

    .record-selector {
      font-size: 13px;
      color: var(--bg-opposite);
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;

      .el-icon {
        font-size: 12px;
        color: var(--bg-opposite);
      }
    }

    .trend-markers {
      display: flex;
      align-items: center;
      gap: 4px;
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
      font-size: 13px;
      font-weight: 600;
      background: var(--bg-page-h5);
      color: var(--bg-opposite);
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.2s;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $hot-pink;
      }

      &.active {
        background: var(--bg-opposite);
        color: var(--bg-page-h5);
      }

      &.past-active {
        background: var(--bg-page);
        color: var(--bg-opposite);
      }

    }
  }
}

@keyframes redPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(228, 64, 150, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(228, 64, 150, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(228, 64, 150, 0);
  }
}

.breathing-dot {
  animation: redPulse 1.5s infinite;
}

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

.position-content,
.orders-content,
.history-content {
  margin-bottom: 20px;
}

.orders-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .orders-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--bg-opposite);
  }

  .cancel-all-btn {
    background: transparent;
    border: none;
    color: var(--text-color-n);
    font-size: 13px;
    cursor: pointer;
  }
}

/* 订单列表：超过 10 条时出现滚动条 */
.orders-list {
  max-height: 520px;
  overflow-y: auto;
}

.order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);

  .order-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .order-side {
    font-size: 15px;
    font-weight: 500;
    color: var(--bg-opposite);
  }

  .order-chip {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    background: var(--button-bg-n);
    color: var(--text-color-n);
    font-size: 12px;
    font-weight: 600;
  }

  .order-right {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 8px;
    flex-direction: row;
    font-size: 12px;
    color: var(--text-dark-gray);
  }

  .order-progress {
    font-weight: 500;
  }

  .order-until {
    white-space: nowrap;
  }

  .order-cancel-btn {
    background: transparent;
    border: none;
    color: var(--text-dark-gray);
    font-size: 16px;
    cursor: pointer;
  }

  /* stacked progress block on right */
  .order-right>div {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    margin-right: 6px;
  }

  .order-chip.up {
    background: var(--button-bg-y);
    color: var(--text-color-y);
  }

  .order-chip.down {
    background: var(--button-bg-n);
    color: var(--text-color-n);
  }

  .order-chip .chip-price,
  .order-chip .chip-cost {
    font-size: 12px;
    font-weight: 700;
  }

  .order-chip .chip-sep {
    margin: 0 6px;
    opacity: 0.9;
  }

  // History 方向高亮颜色（只给 Up/Down 文案上色）
  .history-side.up {
    color: $neon-green;
  }

  .history-side.down {
    color: $hot-pink;
  }

}

.orders-empty {
  text-align: center;
  font-size: 13px;
  color: var(--text-dark-gray);
  padding: 24px 0;
}

/* 历史列表：超过 10 条时出现滚动条 */
.history-list {
  max-height: 560px;
  overflow-y: auto;
}

.history-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--bg-opposite);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);

  .history-text {
    font-size: 14px;
    color: var(--bg-opposite);
  }

  .history-side {
    font-weight: 600;
    margin-right: 4px;

    &.up {
      color: var(--text-color-y);
    }

    &.down {
      color: var(--text-color-n);
    }
  }

  .history-time {
    font-size: 12px;
    color: var(--text-dark-gray);
    white-space: nowrap;
  }
}

// 括号内金额灰色（提高优先级，且放在最后保证覆盖）
.history-row .history-text .muted {
  color: var(--text-dark-gray);
}

.pos-card {
  margin-bottom: 20px;

  &:first-child {
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
  }

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

    &.up {
      background: var(--button-bg-y);
      color: var(--text-color-y);
    }

    &.down {
      background: var(--button-bg-n);
      color: var(--text-color-n);
    }
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

        &.neon {
          color: var(--text-color-y);
        }

        &.hot-pink {
          color: var(--text-color-n);
        }
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
      transition: transform 0.2s;

      &.rotate {
        transform: rotate(180deg);
      }
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

.bottom-dock-actions {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  gap: 12px;
  background: var(--bg-page-h5);
  z-index: 40;

  .event-ended-tip {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: var(--text-dark-gray);
    padding: 12px 0;
    border: 1px solid var(--border-color);
    border-radius: 12px;
  }

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

<style lang="scss">
.custom-history-dropdown {
  background: var(--bg-page) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;

  .el-dropdown-menu {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .el-dropdown-menu__item {
    color: var(--bg-opposite) !important;
    font-size: 14px;
    padding: 12px 16px;
    transition: background 0.2s;
  }

  .drop-item-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
  }

  .el-popper__arrow::before {
    background: var(--bg-page) !important;
    border: 1px solid var(--border-color) !important;
  }
}
</style>