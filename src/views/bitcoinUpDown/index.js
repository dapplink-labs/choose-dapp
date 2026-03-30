import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, ArrowDown, Trophy } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { createIotMqttClient, hasWebCrypto } from '@/utils/mqttClient'
import OrderBookMobile from '@/components/OrderBookMobile.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import CashoutModal from '@/components/CashoutModal.vue'
import { useThemeStore } from '@/stores/theme'
import { useAccount } from '@wagmi/vue'
import { cancelOrder, getEventDetailItem, getEventPriceHistory, getOpenOrders, getOrderBook, getOrderHistory, getSubEventDetail, getUserPositions } from '@/api/APIEvent'

export default {
  name: 'BitcoinUpDown',
  components: {
    ArrowLeft,
    ArrowDown,
    Trophy,
    OrderBookMobile,
    PaymentModal,
    CashoutModal,
  },
  setup() {
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const { address } = useAccount()

const handleBack = () => router.back()
const goWithdraw = () => router.push({ name: 'withdraw' })
const currentEventGuid = computed(() => route.query.id || route.query.event_guid || '')
const requestedSubEventGuid = computed(() => route.query.sub_event_guid || '')
const showBaopeiTag = computed(() => {
  const fromFlag = String(route.query.from_new_user_compensation || '').toLowerCase()
  const nav = String(route.query.nav || '').toUpperCase()
  return fromFlag === '1' || fromFlag === 'true' || nav === 'NEW_USER_EVENTS'
})

const parseDateSafe = (value) => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? null : date
}

const formatMonthDay = (date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const monthSuffix = t('datePicker.month')
  const daySuffix = t('datePicker.day')

  const monthText = monthSuffix ? `${month}${monthSuffix}` : `${month}`
  const dayText = daySuffix ? `${day}${daySuffix}` : `${day}`

  // 英文等场景 month/day 后缀为空时，补一个空格避免粘连
  if (!monthSuffix && !daySuffix) return `${month} ${day}`
  return `${monthText}${dayText}`
}
const formatHourMinute = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
const getUtcOffsetText = (date = new Date()) => {
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const hours = Math.floor(abs / 60)
  const minutes = abs % 60
  if (minutes === 0) return `UTC${sign}${hours}`
  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`
}

const titleTimeRangeText = computed(() => {
  const start = parseDateSafe(detailData.value.startTime)
  const end = parseDateSafe(detailData.value.closeTime)
  if (!start && !end) return ''
  const tz = getUtcOffsetText(end || start || new Date())
  if (start && end) {
    const sameDay = start.getFullYear() === end.getFullYear()
      && start.getMonth() === end.getMonth()
      && start.getDate() === end.getDate()
    if (sameDay) {
      return `${formatMonthDay(start)} ${formatHourMinute(start)}-${formatHourMinute(end)} ${tz}`
    }
    return `${formatMonthDay(start)} ${formatHourMinute(start)}-${formatMonthDay(end)} ${formatHourMinute(end)} ${tz}`
  }
  const single = end || start
  return `${formatMonthDay(single)} ${formatHourMinute(single)} ${tz}`
})
const activeTab = ref('Positions')
const isBookOpen = ref(false)
const orderBookTab = ref('yes')

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
  startTime: '',
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
// 买入 YES 价格文本
const upTradePriceText = computed(() => detailData.value.yesAskPrice || '--')
// 买入 NO 价格文本
const downTradePriceText = computed(() => detailData.value.noAskPrice || '--')

// 持仓列表（同一子事件下可能包含 YES / NO 多条）
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

// 提现（二次确认）弹窗显示状态
const showCashoutModal = ref(false)
const cashoutPosition = ref(null)

// ═══════════════════════════════════════════════════════
// ■ 支付弹窗
// ═══════════════════════════════════════════════════════

// 打开支付弹窗，根据方向设置初始 outcome
const openPayment = (side) => {
  paymentOutcomeTitle.value = detailData.value.title || ''
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
    item?.position_value,
  ) || 0
  // 可赢金额 to_win_amount：作为 profit 的兜底来源之一
  const profitNum = firstFinite(item?.profit_loss, item?.profit, item?.to_win_amount) || 0
  // 优先使用接口返回的收益/亏损率字段，其次用 profit / cost 计算
  const profitPct = firstFinite(
    // item?.profit_rate,
    // item?.lost_rate,
    costNum ? (profitNum / costNum) * 100 : 0,
  ) || 0
  return {
    id: item?.guid ,
    title: item?.sub_event_name || t('crypto.yesOrNo'),
    tagLabel: `${outcome === 'up' ? t('crypto.yes') : t('crypto.no')} | ${shares || 0} ${t('sports.shares')}`,
    avgPrice: formatCentText(item?.avg_price || 0),
    cost: formatMoney(costNum),
    positionValue: formatMoney(currentNum),
    profit: `${profitNum >= 0 ? '+' : '-'}${formatMoney(Math.abs(profitNum))}${costNum ? `(${profitPct >= 0 ? '+' : ''}${profitPct.toFixed(2)}%)` : ''}`,
    profitPositive: profitNum >= 0,
    raw: item,
    outcome
  }
}

// 持仓提现：读取指定持仓金额，打开市价单售卖二次确认弹窗
const handlePositionWithdraw = async (pos) => {
  cashoutPosition.value = pos
  showCashoutModal.value = true
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
      user_address: address.value || '',
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
      user_address: address.value || '',
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
      user_address: address.value || '',
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
    const res = await cancelOrder({ order_guid: order.orderGuid, user_address: address.value || '' })
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
    await Promise.all(orderGuids.map(orderGuid => cancelOrder({ order_guid: orderGuid, user_address: address.value || '' })))
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
const remainingSeconds = ref(0)
const shouldShowCountDown = computed(() => {
  if (!Number.isFinite(targetTime.value) || targetTime.value <= 0) return false
  return remainingSeconds.value <= 24 * 3600
})
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
  remainingSeconds.value = diff
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
// 图表 X 轴唯一键
let chartDataKeys = []
// 图表 X 轴数据
let chartDataX = []
// 图表多条折线数据
let chartSeriesData = []
// 实时价格点队列，按 outcome 分组
let liveSeriesPoints = {}

const CHART_SERIES_COLORS = {
  yes: '#BBFF2E',
  no: '#E44096',
}

const normalizeOutcomeKey = (value, fallback = 'series') => {
  const text = String(value || '').trim().toLowerCase()
  if (!text) return fallback
  if (['yes', 'up'].includes(text)) return 'yes'
  if (['no', 'down'].includes(text)) return 'no'
  return text
}

const getChartSeriesMeta = (outcomeKey, index = 0) => {
  const normalized = normalizeOutcomeKey(outcomeKey, `series_${index + 1}`)
  if (normalized === 'yes') return { key: normalized, name: 'YES', color: CHART_SERIES_COLORS.yes }
  if (normalized === 'no') return { key: normalized, name: 'NO', color: CHART_SERIES_COLORS.no }
  return {
    key: normalized,
    name: String(outcomeKey || `Series ${index + 1}`).toUpperCase(),
    color: ['#5073e5', '#31c1b9', '#ffb020', '#9b7cff'][index % 4],
  }
}

const normalizePointTimestamp = (value) => {
  if (!value) return ''
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  }
  const date = new Date(String(value).replace(' ', 'T'))
  if (!Number.isNaN(date.getTime())) return date.toISOString()
  return String(value)
}

const buildChartPoint = (price, ts, fallbackKey = '') => {
  const num = Number(price)
  if (!Number.isFinite(num)) return null
  const timestamp = normalizePointTimestamp(ts || new Date())
  const label = formatTimeLocal(ts || new Date(), { seconds: true }) || String(ts || '')
  const key = timestamp || `${fallbackKey || 'point'}-${label}`
  return { key, label, value: num, timestamp }
}

const sortChartPoints = (points = []) => {
  return [...points].sort((left, right) => {
    const leftDate = parseDateSafe(left?.timestamp)
    const rightDate = parseDateSafe(right?.timestamp)
    if (leftDate && rightDate) return leftDate.getTime() - rightDate.getTime()
    if (leftDate) return -1
    if (rightDate) return 1
    return String(left?.key || '').localeCompare(String(right?.key || ''))
  })
}

// 设置图表点数据
const setChartPoints = (seriesList) => {
  chartSeriesData = Array.isArray(seriesList) ? seriesList.filter(series => Array.isArray(series?.points) && series.points.length) : []
  const categoryMap = new Map()

  chartSeriesData.forEach((series, seriesIndex) => {
    series.points.forEach((point, pointIndex) => {
      const key = point?.key || point?.timestamp || `${series.key || seriesIndex}-${pointIndex}-${point?.label || ''}`
      if (categoryMap.has(key)) return
      const sortDate = parseDateSafe(point?.timestamp)
      categoryMap.set(key, {
        key,
        label: point?.label || '',
        sortValue: sortDate ? sortDate.getTime() : Number.MAX_SAFE_INTEGER,
        order: categoryMap.size,
      })
    })
  })

  const categories = Array.from(categoryMap.values()).sort((left, right) => {
    if (left.sortValue !== right.sortValue) return left.sortValue - right.sortValue
    return left.order - right.order
  })

  chartDataKeys = categories.map(item => item.key)
  chartDataX = categories.map(item => item.label)
}

const buildChartSeriesList = (seriesState = {}) => {
  return Object.entries(seriesState)
    .map(([outcomeKey, points], index) => {
      const meta = getChartSeriesMeta(outcomeKey, index)
      return {
        ...meta,
        points: sortChartPoints(points).slice(-50),
      }
    })
    .filter(series => series.points.length)
}

const getLatestSeriesPoint = (series) => {
  if (!Array.isArray(series?.points) || !series.points.length) return null
  return series.points[series.points.length - 1]
}

const buildSeriesLineData = (series) => {
  const pointMap = new Map((series?.points || []).map(point => [point.key, point.value]))
  return chartDataKeys.map(key => (pointMap.has(key) ? pointMap.get(key) : null))
}

// 同步实时图表
const syncLiveChart = () => {
  setChartPoints(buildChartSeriesList(liveSeriesPoints))
  updateChart()
}

// 将 API 返回的历史价格数据解析为按 outcome 分组的折线数据
const buildChartPointsFromHistory = (priceHistoryData) => {
  console.log('[Chart]', 'buildChartPointsFromHistory 历史价格', priceHistoryData)
  const points = Array.isArray(priceHistoryData?.data_points) ? priceHistoryData.data_points : []
  if (!points.length) return {}

  const seriesState = {}
  points.forEach((group, groupIndex) => {
    const histories = Array.isArray(group?.history) ? group.history : []
    histories.forEach((history, historyIndex) => {
      const outcomeKey = normalizeOutcomeKey(history?.outcome, `series_${groupIndex}_${historyIndex}`)
      const rows = Array.isArray(history?.data) ? history.data : []
      const parsedRows = rows
        .map((row, rowIndex) => buildChartPoint(row?.p, row?.t, `${outcomeKey}-${groupIndex}-${historyIndex}-${rowIndex}`))
        .filter(Boolean)
      if (!parsedRows.length) return
      seriesState[outcomeKey] = [...(seriesState[outcomeKey] || []), ...parsedRows]
      seriesState[outcomeKey] = sortChartPoints(seriesState[outcomeKey]).slice(-50)
    })
  })

  return seriesState
}

// 将新的实时价格点追加到走势图数据队列（最多保留 50 个点）
const pushPricePoint = (price, ts, outcome = 'yes') => {
  const outcomeKey = normalizeOutcomeKey(outcome)
  const point = buildChartPoint(price, ts, `${outcomeKey}-${(liveSeriesPoints[outcomeKey] || []).length}`)
  if (!point) return
  liveSeriesPoints[outcomeKey] = [...(liveSeriesPoints[outcomeKey] || []), point]
  liveSeriesPoints[outcomeKey] = sortChartPoints(liveSeriesPoints[outcomeKey]).slice(-50)
  console.log('[Chart]', 'pushPricePoint 实时价格', {
    outcome: outcomeKey,
    price: point.value,
    timestamp: point.timestamp,
    label: point.label,
    totalPoints: liveSeriesPoints[outcomeKey].length,
  })
  if (outcomeKey === 'yes' || !Number.isFinite(livePrice.value)) {
    livePrice.value = point.value
    detailData.value.currentPrice = point.value
  }
  if (activeSegmentMode.value === 'live') {
    syncLiveChart()
  }
}

const chartColors = computed(() => ({
  axisLabel: themeStore.isDark ? '#666' : '#888',
  splitLine: themeStore.isDark ? '#2a2f34' : '#e0e0e0',
  primary: '#5073e5',
}))

// ═══════════════════════════════════════════════════════
// ■ 图表横向拖拽探索（swipe 查看历史数据点）
// ═══════════════════════════════════════════════════════
const chartDragState = ref({
  tooltipVisible: false,
  tooltipLeft: 0,
  tooltipTop: 0,
  tooltipTime: '',
  tooltipItems: /** @type {{ name: string, price: string, color: string }[]} */ ([]),
})
let _chartDragActive = false
let _chartDragStartX = 0

const _getPointerPos = (e) => {
  const src = e.touches?.[0] ?? e.changedTouches?.[0] ?? e
  return { x: Number(src.clientX ?? 0), y: Number(src.clientY ?? 0) }
}

const onChartPointerDown = (e) => {
  _chartDragActive = true
  _chartDragStartX = _getPointerPos(e).x
}

const onChartPointerMove = (e) => {
  if (!_chartDragActive) return
  const pos = _getPointerPos(e)
  const dx = Math.abs(pos.x - _chartDragStartX)
  if (dx < 8 && !chartDragState.value.tooltipVisible) return
  if (!chartInstance || !chartDataKeys.length) return
  const el = chartRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const relX = pos.x - rect.left
  const relY = pos.y - rect.top
  const coord = chartInstance.convertFromPixel({ gridIndex: 0 }, [relX, relY])
  if (!coord) return
  const idx = Math.max(0, Math.min(chartDataKeys.length - 1, Math.round(coord[0])))
  const items = chartSeriesData
    .map(series => {
      const lineData = buildSeriesLineData(series)
      const val = lineData[idx]
      return val != null ? { name: series.name, price: val.toFixed(2), color: series.color } : null
    })
    .filter(Boolean)
  if (!items.length) return
  const tLeft = Math.min(Math.max(0, relX - 60), rect.width - 140)
  const tTop = Math.max(8, relY - 88)
  chartDragState.value = {
    tooltipVisible: true,
    tooltipLeft: tLeft,
    tooltipTop: tTop,
    tooltipTime: chartDataX[idx] || '',
    tooltipItems: items,
  }
  updateChartWithCursor(idx)
}

const onChartPointerUp = () => {
  if (!_chartDragActive) return
  _chartDragActive = false
  if (chartDragState.value.tooltipVisible) {
    chartDragState.value = { ...chartDragState.value, tooltipVisible: false }
    updateChart()
  }
}

const setupChartDragListeners = () => {
  const el = chartRef.value
  if (!el) return
  el.addEventListener('touchstart', onChartPointerDown, { passive: true })
  el.addEventListener('touchmove', onChartPointerMove, { passive: true })
  el.addEventListener('touchend', onChartPointerUp, { passive: true })
  el.addEventListener('mousedown', onChartPointerDown)
  el.addEventListener('mousemove', onChartPointerMove)
  el.addEventListener('mouseup', onChartPointerUp)
  el.addEventListener('mouseleave', onChartPointerUp)
}

const cleanupChartDragListeners = () => {
  const el = chartRef.value
  if (!el) return
  el.removeEventListener('touchstart', onChartPointerDown)
  el.removeEventListener('touchmove', onChartPointerMove)
  el.removeEventListener('touchend', onChartPointerUp)
  el.removeEventListener('mousedown', onChartPointerDown)
  el.removeEventListener('mousemove', onChartPointerMove)
  el.removeEventListener('mouseup', onChartPointerUp)
  el.removeEventListener('mouseleave', onChartPointerUp)
}

// 将当前数据渲染到 ECharts 实例（含目标价参考线和实时脉冲点）
const updateChart = () => {
  if (!chartInstance) return
  const colors = chartColors.value
  let markLineData = []
  if (activeSegmentMode.value !== 'future' && Number.isFinite(displayTargetPrice.value)) {
    markLineData = [{ yAxis: displayTargetPrice.value }]
  }

  const lineSeries = chartSeriesData.map((series, index) => ({
    name: series.name,
    type: 'line',
    data: buildSeriesLineData(series),
    smooth: 0.3,
    symbol: 'none',
    connectNulls: false,
    lineStyle: { width: 3, color: series.color },
    itemStyle: { color: series.color },
    markLine: index === 0 ? {
      symbol: ['none', 'none'],
      label: { show: false },
      data: markLineData,
      lineStyle: { type: 'dashed', color: '#888', width: 1, opacity: 0.6 }
    } : undefined,
  }))

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
      axisLabel: { show: true, interval: chartDataX.length > 1 ? Math.floor(chartDataX.length / 2) : 0, color: colors.axisLabel, fontSize: 10 }
    },
    yAxis: {
      type: 'value', position: 'right', scale: true,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { formatter: (v) => '$' + v.toFixed(2), color: colors.axisLabel, fontSize: 10 },
      splitLine: { lineStyle: { color: colors.splitLine } }
    },
    series: lineSeries
  }

  if (activeSegmentMode.value !== 'past') {
    chartSeriesData.forEach((series) => {
      const latestPoint = getLatestSeriesPoint(series)
      const xIndex = latestPoint ? chartDataKeys.indexOf(latestPoint.key) : -1
      if (!latestPoint || xIndex < 0) return
      option.series.push({
        name: `${series.name}PulseDot`, type: 'effectScatter', coordinateSystem: 'cartesian2d',
        data: [{ value: [xIndex, latestPoint.value] }],
        symbolSize: 8, showEffectOn: 'render',
        rippleEffect: { period: 2, scale: 3, brushType: 'fill' },
        itemStyle: { color: series.color, shadowBlur: 10, shadowColor: series.color },
        zlevel: 1
      })
    })
  }
  chartInstance.setOption(option, { replaceMerge: ['series'] })
}

// 拖拽时：实线跟随游标截断，全量数据以低透明度占位，无虚线
const updateChartWithCursor = (cursorIndex) => {
  if (!chartInstance) return
  const colors = chartColors.value

  let markLineData = []
  if (activeSegmentMode.value !== 'future' && Number.isFinite(displayTargetPrice.value)) {
    markLineData = [{ yAxis: displayTargetPrice.value }]
  }

  const seriesList = []

  chartSeriesData.forEach((series, index) => {
    const fullLineData = buildSeriesLineData(series)
    // 截断：实线只画到游标位置
    const activeLineData = fullLineData.map((v, i) => (i <= cursorIndex ? v : null))
    const markLineCfg = index === 0 && markLineData.length
      ? { symbol: ['none', 'none'], label: { show: false }, data: markLineData, lineStyle: { type: 'dashed', color: '#888', width: 1, opacity: 0.3 } }
      : undefined

    // 1. 透明占位走势线（全量数据，低透明度）
    seriesList.push({
      name: `${series.name}_ghost`,
      type: 'line',
      data: fullLineData,
      smooth: 0.3,
      symbol: 'none',
      connectNulls: false,
      lineStyle: { width: 3, color: series.color, opacity: 0.18 },
      itemStyle: { color: series.color, opacity: 0.18 },
      markLine: markLineCfg,
      zlevel: 0,
    })

    // 2. 实线跟随游标（截断数据，完全不透明）
    seriesList.push({
      name: series.name,
      type: 'line',
      data: activeLineData,
      smooth: 0.3,
      symbol: 'none',
      connectNulls: false,
      lineStyle: { width: 3, color: series.color },
      itemStyle: { color: series.color },
      zlevel: 1,
    })

    // 3. 游标末端高亮圆点
    const val = fullLineData[cursorIndex]
    if (val != null) {
      seriesList.push({
        name: `_cursor_dot_${series.key}`,
        type: 'scatter',
        data: [[cursorIndex, val]],
        symbolSize: 9,
        itemStyle: { color: series.color, borderColor: '#fff', borderWidth: 2 },
        zlevel: 2,
      })
    }
  })

  const option = {
    backgroundColor: 'transparent',
    animation: false,
    grid: { left: '2%', right: '15%', top: '15%', bottom: '12%', containLabel: false },
    xAxis: {
      type: 'category', data: chartDataX,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { show: true, interval: chartDataX.length > 1 ? Math.floor(chartDataX.length / 2) : 0, color: colors.axisLabel, fontSize: 10 },
    },
    yAxis: {
      type: 'value', position: 'right', scale: true,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { formatter: (v) => '$' + v.toFixed(2), color: colors.axisLabel, fontSize: 10 },
      splitLine: { lineStyle: { color: colors.splitLine } },
    },
    series: seriesList,
  }
  chartInstance.setOption(option, { replaceMerge: ['series'] })
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
    const liveChartSeries = buildChartSeriesList(liveSeriesPoints)
    const latestYes = liveChartSeries.find(series => series.key === 'yes')
    const latestFallback = liveChartSeries[0]
    const latestPoint = getLatestSeriesPoint(latestYes || latestFallback)
    if (latestPoint) {
      livePrice.value = latestPoint.value
      detailData.value.currentPrice = latestPoint.value
      if (activeSegmentMode.value === 'live') {
        syncLiveChart()
      }
    } else {
      setChartPoints([])
      updateChart()
    }
  } catch (error) {
    console.error('Fetch price history failed', error)
    liveSeriesPoints = {}
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
    const startTime = subEvent?.open_time || eventItem?.open_time || ''
    const closeTime = subEvent?.close_time || eventItem?.close_time || ''
    if (closeTime) {
      const closeTs = new Date(String(closeTime).replace(' ', 'T')).getTime()
      if (!Number.isNaN(closeTs)) {
        targetTime.value = closeTs
        updateCountDown()
      }
    }

    // 解析事件状态（多种字段名兼容）
    const rawStatus = subEvent?.status || eventItem?.status || ''
    const isSettled = subEvent?.is_settled === true || subEvent?.is_settled === 1
      || eventItem?.is_settled === true || eventItem?.is_settled === 1
    const ENDED_STATUSES = ['settled', 'ended', 'closed', 'resolved', 'expired', 'finished', 'completed']
    if (ENDED_STATUSES.includes(String(rawStatus).toLowerCase()) || isSettled) {
      // API 明确标记为已结束，直接设置标志（不依赖倒计时）
      eventEnded.value = true
    }

    detailData.value = {
      eventTitle: eventItem?.title || '',
      title: subEvent?.title || '',
      tradeVolume: firstFinite(
        subEvent?.trade_volume, subEvent?.total_volume, subEvent?.bet_volume, subEvent?.total_bet_amount,
        eventItem?.trade_volume, eventItem?.total_volume,
      ) || 0,
      rulesDescription: (eventItem?.rules ?? subEvent?.rules ?? '') || '',
      closeTime,
      startTime,
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
    const latestYes = yesPoints[yesPoints.length - 1]
    const latestNo = noPoints[noPoints.length - 1]
    if (latestYes?.p) pushPricePoint(latestYes.p, latestYes.t, 'yes')
    if (latestNo?.p) pushPricePoint(latestNo.p, latestNo.t, 'no')
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
      const tradeTs = tr?.trade_time ? new Date(tr.trade_time * 1000).toISOString() : undefined
      pushPricePoint(price, tradeTs, tr?.outcome || 'yes')
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

  const userGuid = address.value || ''
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
  const recordSeries = Array.isArray(record?.seriesList)
    ? record.seriesList
    : (Array.isArray(record?.points) && record.points.length
      ? [{ ...getChartSeriesMeta('yes'), points: record.points }]
      : [])
  if (!recordSeries.length) return
  activeSegmentMode.value = 'past'
  selectedPastRecord.value = record
  // 切到历史：断开 MQTT，保持历史视图稳定
  stopMqttStream()
  setChartPoints(recordSeries)
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

// 监听 tab 切换，动态拉取对应数据
watch(activeTab, (newTab) => {
  if (newTab === 'Positions') {
    fetchPositions()
  } else if (newTab === 'Orders') {
    fetchOpenOrders()
  } else if (newTab === 'History') {
    fetchOrderHistory()
  }
})

onMounted(async () => {
  startCountDown()
  await fetchDetail()
  nextTick(() => {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
    setupChartDragListeners()
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
  cleanupChartDragListeners()
  window.removeEventListener('resize', resizeHandler)
  chartInstance?.dispose()
})
    return {
      router,
      route,
      themeStore,
      handleBack,
      goWithdraw,
      currentEventGuid,
      requestedSubEventGuid,
      showBaopeiTag,
      parseDateSafe,
      formatMonthDay,
      formatHourMinute,
      getUtcOffsetText,
      titleTimeRangeText,
      activeTab,
      isBookOpen,
      orderBookTab,
      isRespSuccess,
      formatTimeLocal,
      IOT_REGION,
      IOT_ENDPOINT,
      COGNITO_IDENTITY_POOL_ID,
      iotMqtt,
      mqttDestroyed,
      shouldUseMqtt,
      eventEnded,
      isEventEnded,
      formatCompactNumber,
      formatMoney,
      formatPrice,
      formatPriceNumber,
      formatCentText,
      formatCentValue,
      formatVolumeText,
      formatAgo,
      firstFinite,
      outcomeToTrend,
      detailData,
      resolvedSubEventGuid,
      topVolumeText,
      upTradePriceText,
      downTradePriceText,
      positions,
      openOrders,
      orderHistory,
      orderBookLoading,
      orderBookYes,
      orderBookNo,
      currentOrderBook,
      orderBookVolumeText,
      paymentOutcomeTitle,
      paymentInitialOutcome,
      paymentInitialSide,
      showPayment,
      showCashoutModal,
      cashoutPosition,
      openPayment,
      onOrderSuccess,
      mapPositionCard,
      handlePositionWithdraw,
      mapOpenOrder,
      mapOrderHistoryItem,
      fetchPositions,
      fetchOpenOrders,
      fetchOrderHistory,
      handleCancelOrder,
      handleCancelAllOrders,
      isSticky,
      handleScroll,
      targetTime,
      countDown,
      remainingSeconds,
      shouldShowCountDown,
      timerInterval,
      startCountDown,
      updateCountDown,
      activeSegmentMode,
      pastRecords,
      lastThreeResults,
      selectedPastRecord,
      liveSegment,
      futureSegments,
      selectedFutureId,
      livePrice,
      displayTargetPrice,
      currentPriceChars,
      diffData,
      chartRef,
      chartInstance,
      chartDataKeys,
      chartDataX,
      chartSeriesData,
      liveSeriesPoints,
      CHART_SERIES_COLORS,
      normalizeOutcomeKey,
      getChartSeriesMeta,
      normalizePointTimestamp,
      buildChartPoint,
      sortChartPoints,
      setChartPoints,
      buildChartSeriesList,
      getLatestSeriesPoint,
      buildSeriesLineData,
      syncLiveChart,
      buildChartPointsFromHistory,
      pushPricePoint,
      chartColors,
      chartDragState,
      onChartPointerDown,
      onChartPointerMove,
      onChartPointerUp,
      setupChartDragListeners,
      cleanupChartDragListeners,
      updateChart,
      updateChartWithCursor,
      normalizeOrderBookSide,
      applyOrderBookPayload,
      fetchOrderBook,
      fetchPriceHistory,
      fetchDetail,
      mergeOpenOrderFromPush,
      handleMqttBusinessMessage,
      stopMqttStream,
      startMqttStream,
      selectPastRecord,
      selectLiveSegment,
      selectFutureSegment,
      resizeHandler,
      t,
      address,
    }
  },
}
