<template>
    <div class="prediction-detail-h5-page">
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
                    <span class="top-volume">{{ detailData.volume }}</span>
                </div>
                <div
                    class="bookmark-icon"
                    :class="{ active: detailData.isFavorite }"
                    @click="handleBookmark"
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="content">
            <!-- 顶部事件卡片 -->
            <div class="event-card">
                <div class="event-header-row">
                    <div class="event-main">
                        <div class="event-avatar-wrapper">
                            <img :src="detailData.avatar || fallbackAvatar" :alt="detailData.title" class="event-avatar"
                                @error="(e) => (e.target.src = fallbackAvatar)" referrerpolicy="no-referrer" />
                        </div>
                        <div class="event-info">
                            <h1 class="event-title">{{ detailData.title }}</h1>
                        </div>
                    </div>
                </div>

                <div class="event-chance-row">
                    <div class="event-chance-left">
                        <div class="event-yes-label">{{ detailData.yesOutcome || 'YES' }}</div>
                        <div class="event-chance-block">
                            <div class="event-chance-main">{{ detailData.yesChance }}</div>
                            <div class="event-change-row">
                                <span class="change-icon">▲</span>
                                <span class="event-change">{{ detailData.yesChange }}</span>
                            </div>
                        </div>
                    </div>
                    <img :src="logoUrl" alt="ChooseMe" class="brand-logo" />
                </div>

            </div>

            <!-- 图表区域 -->
            <div class="chart-section">
                <!-- 时间范围选择器 -->
                <div class="time-range-selector">
                    <div v-for="range in timeRanges" :key="range.value" class="time-range-btn"
                        :class="{ active: selectedTimeRange === range.value }"
                        @click="handleTimeRangeChange(range.value)">
                        {{ range.label }}
                    </div>
                </div>

                <!-- 图表容器（ECharts 单折线图） -->
                <div class="chart-container" style="touch-action: none;">
                    <div ref="chartRef" class="chart-canvas" />
                    <!-- 拖拽浮窗 -->
                    <transition name="cdt">
                        <div v-if="chartDragState.tooltipVisible" class="chart-drag-tooltip"
                            :style="{ left: chartDragState.tooltipLeft + 'px', top: chartDragState.tooltipTop + 'px' }">
                            <div class="cdt-time">{{ chartDragState.tooltipTime }}</div>
                            <div class="cdt-row">
                                <span class="cdt-dot" :style="{ background: chartColors.primary }"></span>
                                <span class="cdt-name">{{ detailData.yesOutcome || 'YES' }}</span>
                                <span class="cdt-price">{{ chartDragState.tooltipPrice }}</span>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>

            <!-- 订单簿（先做UI，列表暂不实现） -->
            <div class="orderbook-section">
                <div class="orderbook-title-row">
                    <div class="orderbook-title">{{ $t('detail.orderBook') || '订单簿' }}</div>
                </div>

                <div class="orderbook-tabs">
                    <button type="button" class="orderbook-tab" :class="{ active: activeOrderbookSide === 'yes' }"
                        @click="activeOrderbookSide = 'yes'">
                        {{ detailData.yesOutcome || 'YES' }}
                    </button>
                    <button type="button" class="orderbook-tab" :class="{ active: activeOrderbookSide === 'no' }"
                        @click="activeOrderbookSide = 'no'">
                        {{ detailData.noOutcome || 'NO' }}
                    </button>
                </div>

                <OrderBookMobile :active-side="activeOrderbookSide" :asks="currentOrderBook.asks"
                    :bids="currentOrderBook.bids" :last-trade-price="currentOrderBook.last_trade_price"
                    :loading="orderBookLoading" :use-mock-fallback="false" />
            </div>
        </div>
        <!-- 底部预测操作栏 -->
        <div class="bottom-dock-actions">
            <button class="trade-btn up" @click="openPayment('yes')">{{ $t('common.buy') }} {{ detailData.yesOutcome || 'YES' }} {{
                detailData.yesBidPrice }}</button>
            <button class="trade-btn down" @click="openPayment('no')">{{ $t('common.buy') }} {{ detailData.noOutcome || 'NO' }} {{ detailData.noBidPrice
                }}</button>
        </div>

        <!-- 购买弹窗 -->
        <PaymentModal v-model="showPayment" :event-title="detailData.title"
            :outcome-title="detailData.title" :event-guid="eventGuid"
            :sub-event-guid="detailData.subEventGuidResolved || subEventGuid" :initial-outcome="paymentInitialOutcome"
            :initial-side="paymentInitialSide" 
            :yes-outcome="detailData.yesOutcome" :no-outcome="detailData.noOutcome"
            @order-success="onOrderSuccess" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Trophy } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import logoIcon from '@/assets/icon/logoIcon.png'
import OrderBookMobile from '@/components/OrderBookMobile.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import { useThemeStore } from '@/stores/theme'
import { getSubEventDetail, getOrderBook, getEventPriceHistory, toggleFavoriteEvent, getEventDetailItem } from '@/api/APIEvent'
import fallbackAvatar from '@/assets/icon/LP1.png'
import { ElMessage } from 'element-plus'
import { useAccount } from '@wagmi/vue'
import { createIotMqttClient, hasWebCrypto } from '@/utils/mqttClient'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const { address } = useAccount()

const logoUrl = logoIcon

// ===================== 路由参数 =====================
const eventGuid = computed(() => route.query.event_guid || route.query.id || '')
const subEventGuid = computed(() => route.query.sub_event_guid || '')

// ===================== MQTT 配置 =====================
const IOT_REGION = import.meta.env.VITE_IOT_REGION || 'ap-southeast-1'
const IOT_ENDPOINT = import.meta.env.VITE_IOT_ENDPOINT || 'a3awip9q9thtco-ats.iot.ap-southeast-1.amazonaws.com'
const COGNITO_IDENTITY_POOL_ID = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || 'ap-southeast-1:ec400695-b709-4af1-a19b-455cded69acf'

/** @type {ReturnType<import('@/utils/mqttClient').createIotMqttClient>|null} */
let iotMqtt = null
let mqttDestroyed = false

const shouldUseMqtt = computed(() => !!IOT_ENDPOINT && !!COGNITO_IDENTITY_POOL_ID && hasWebCrypto())

// ===================== 工具函数 =====================
const isRespSuccess = (res) => {
    const code = res?.data?.code
    return code === 0 || code === 200 || code === 2000
}

const firstFinite = (...values) => {
    for (const v of values.flat()) {
        const n = Number(v)
        if (Number.isFinite(n)) return n
    }
    return null
}

const formatVolume = (v) => {
    const num = Number(v)
    if (!Number.isFinite(num)) return '$0 Vol.'
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M Vol.`
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K Vol.`
    return `$${num.toFixed(2)} Vol.`
}

const formatCentText = (value) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return '--'
    if (num > 0 && num <= 1) return `${(num * 100).toFixed(0)} ¢`
    return `${num.toFixed(2)}`
}

const priceToPercent = (p) => {
    const n = Number(p)
    if (!Number.isFinite(n)) return '--'
    const pct = n <= 1 ? n * 100 : n
    return `${pct.toFixed(1)}%`
}

// ===================== 事件结束状态 =====================
const eventEnded = ref(false)
const isEventEnded = computed(() => {
    if (eventEnded.value) return true
    const status = String(detailData.value?.status || '').toLowerCase()
    return ['settled', 'ended', 'closed', 'resolved', 'expired', 'finished', 'completed'].includes(status)
})

// ===================== 页面数据 =====================
const detailData = ref({
    avatar: '',
    title: '',
    yesChance: '--',
    yesChange: '--',
    noChance: '--',
    volume: '--',
    closeDate: '',
    status: '',
    subEventGuidResolved: '',
    yesBidPrice: '--',
    noBidPrice: '--',
    yesAskPrice: '--',
    noAskPrice: '--',
    isFavorite: false,
    tradeVolume: 0,
    rulesDescription: '',
})

// 已解析的子事件 GUID
const resolvedSubEventGuid = computed(
    () => detailData.value.subEventGuidResolved || subEventGuid.value || ''
)

// ===================== 详情获取（参考 bitcoinUpDown，同时调用两个 API）=====================
const fetchDetail = async () => {
    if (!eventGuid.value) return
    try {
        const currentLocale = localStorage.getItem('app-locale') || navigator.language || 'en'
        const language = currentLocale.split('-')[0]
        const [detailRes, subRes] = await Promise.all([
            getEventDetailItem({ event_guid: eventGuid.value, language_label: language, user_address: address.value }),
            getSubEventDetail({ event_guid: eventGuid.value, language_label: language }),
        ])
        const eventData = detailRes?.data?.data || {}
        const subData = subRes?.data?.data || {}
        const eventItem = Array.isArray(eventData.events) ? eventData.events[0] : null
        const subEvents = Array.isArray(subData.sub_events)
            ? subData.sub_events
            : Array.isArray(eventItem?.sub_events) ? eventItem.sub_events : []

        const subEvent = subEventGuid.value
            ? subEvents.find(s => s.sub_event_guid === subEventGuid.value) || subEvents[0]
            : subEvents[0]

        if (!subEvent) {
            detailData.value.title = route.query.title || ''
            return
        }

        const directions = Array.isArray(subEvent.directions) ? subEvent.directions : []
        const yesDir = directions.find(d => ['yes','up'].includes((d.outcome || '').toLowerCase())) || {}
        const noDir = directions.find(d => ['no','down'].includes((d.outcome || '').toLowerCase())) || {}

        // 事件结束状态判断（兼容多字段名）
        const rawStatus = subEvent?.status || eventItem?.status || ''
        const isSettled =
            subEvent?.is_settled === true || subEvent?.is_settled === 1 ||
            eventItem?.is_settled === true || eventItem?.is_settled === 1
        const ENDED_STATUSES = ['settled', 'ended', 'closed', 'resolved', 'expired', 'finished', 'completed']
        if (ENDED_STATUSES.includes(String(rawStatus).toLowerCase()) || isSettled) {
            eventEnded.value = true
        }

        const tradeVolume = firstFinite(
            subEvent?.trade_volume, subEvent?.total_volume, subEvent?.bet_volume,
            subEvent?.total_bet_amount, eventItem?.trade_volume, eventItem?.total_volume,
        ) || 0

        // yes 概率：优先用 chance，其次用 bid/ask price
        const yesChanceRaw = firstFinite(yesDir.chance, yesDir.new_bid_price, yesDir.new_ask_price)
        const yesChancePct = yesChanceRaw != null ? priceToPercent(yesChanceRaw) : '--'

        detailData.value = {
            avatar: subEvent.logo || yesDir.logo || eventItem?.logo || '',
            title: subEvent.title || route.query.title || '',
            yesChance: yesChancePct,
            yesChange: yesDir.new_bid_price ? `+${priceToPercent(yesDir.new_bid_price)}` : '--',
            noChance: priceToPercent(firstFinite(noDir.chance, noDir.new_bid_price) ?? 0),
            volume: formatVolume(tradeVolume),
            closeDate: subEvent.close_time || '',
            status: rawStatus,
            subEventGuidResolved: subEvent.sub_event_guid || subEventGuid.value,
            yesBidPrice: formatCentText(Number(yesDir.new_bid_price)||yesDir.chance),
            noBidPrice: formatCentText(Number(noDir.new_bid_price)||noDir.chance),
            yesAskPrice: formatCentText(firstFinite(yesDir.new_ask_price, yesDir.chance)),
            noAskPrice: formatCentText(firstFinite(noDir.new_ask_price, noDir.chance)),
            isFavorite: !!eventItem?.is_favorited,
            tradeVolume,
            rulesDescription: (eventItem?.rules ?? subEvent?.rules ?? '') || '',
            yesOutcome: yesDir.outcome || 'YES',
            noOutcome: noDir.outcome || 'NO',
        }
    } catch (err) {
        console.error('[Detail] fetchDetail failed', err)
        detailData.value.title = route.query.title || ''
    }
}

// ===================== 收藏 =====================
const handleBookmark = async () => {
    if (!address.value) {
        ElMessage.warning(t('pleaseConnectWallet') || 'Please connect wallet')
        return
    }
    if (!eventGuid.value) return
    try {
        const res = await toggleFavoriteEvent({
            user_address: address.value,
            event_guid: eventGuid.value,
        })
        const payload = res?.data ?? res
        const code = payload?.code
        if (code === 200 || code === 2000 || code === 0) {
            detailData.value.isFavorite = !detailData.value.isFavorite
            ElMessage.success(
                detailData.value.isFavorite
                    ? t('favoriteSuccess') || 'Favorite success'
                    : t('unfavoriteSuccess') || 'Unfavorite success'
            )
        } else {
            ElMessage.error(payload?.msg || 'Operation failed')
        }
    } catch (err) {
        console.error('Toggle favorite failed', err)
        ElMessage.error(t('operateFailed') || 'Operation failed')
    }
}

// ===================== 订单簿 =====================
const activeOrderbookSide = ref('yes')
const orderBookLoading = ref(false)
const orderBookYes = ref({ asks: [], bids: [], last_trade_price: '' })
const orderBookNo = ref({ asks: [], bids: [], last_trade_price: '' })

const currentOrderBook = computed(() =>
    activeOrderbookSide.value === 'yes' ? orderBookYes.value : orderBookNo.value
)

// 标准化订单簿单侧数据，兼容 quantity/size/shares/qty 多种字段名
const normalizeOrderBookSide = (book = {}) => ({
    asks: Array.isArray(book?.asks)
        ? book.asks.map(l => ({ ...l, quantity: l?.quantity ?? l?.size ?? l?.shares ?? l?.qty }))
        : [],
    bids: Array.isArray(book?.bids)
        ? book.bids.map(l => ({ ...l, quantity: l?.quantity ?? l?.size ?? l?.shares ?? l?.qty }))
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
        return
    }
    if (!Array.isArray(payload.asks) && !Array.isArray(payload.bids)) return
    const side = outcome === 'no' ? 'no' : 'yes'
    if (side === 'yes') orderBookYes.value = normalizeOrderBookSide(payload)
    else orderBookNo.value = normalizeOrderBookSide(payload)
}

const fetchOrderBook = async () => {
    if (!eventGuid.value) return
    const sid = resolvedSubEventGuid.value
    if (!sid) return
    orderBookLoading.value = true
    try {
        const res = await getOrderBook({
            event_guid: eventGuid.value,
            sub_event_guid: sid,
            outcome: 'all',
        })
        const data = res?.data?.data || {}
        if (!isRespSuccess(res) && !data.yes && !data.no && !data.asks) throw new Error(res?.data?.message || 'Fetch order book failed')
        applyOrderBookPayload(data)
        // 从订单簿获取成交量
        const vol = firstFinite(data?.trade_volume, data?.total_volume, data?.yes?.trade_volume, data?.no?.trade_volume)
        if (Number.isFinite(vol) && vol > 0) {
            detailData.value.tradeVolume = vol
            detailData.value.volume = formatVolume(vol)
        }
        // 从订单簿更新最优价格
        const pickBestAsk = (asks = []) => {
            const prices = (Array.isArray(asks) ? asks : []).map(l => firstFinite(l?.price)).filter(v => Number.isFinite(v))
            return prices.length ? Math.min(...prices) : null
        }
        const pickBestBid = (bids = []) => {
            const prices = (Array.isArray(bids) ? bids : []).map(l => firstFinite(l?.price)).filter(v => Number.isFinite(v))
            return prices.length ? Math.max(...prices) : null
        }
        const yesBestAsk = pickBestAsk(data?.yes?.asks || data?.YES?.asks)
        const noBestAsk = pickBestAsk(data?.no?.asks || data?.NO?.asks)
        const yesBestBid = pickBestBid(data?.yes?.bids || data?.YES?.bids)
        const noBestBid = pickBestBid(data?.no?.bids || data?.NO?.bids)
        if (Number.isFinite(yesBestAsk)) detailData.value.yesAskPrice = formatCentText(yesBestAsk)
        if (Number.isFinite(noBestAsk)) detailData.value.noAskPrice = formatCentText(noBestAsk)
        if (Number.isFinite(yesBestBid)) {
            detailData.value.yesBidPrice = formatCentText(yesBestBid)
            // 用最优 bid 更新 yes 概率
            detailData.value.yesChance = priceToPercent(yesBestBid)
        }
        if (Number.isFinite(noBestBid)) detailData.value.noBidPrice = formatCentText(noBestBid)
    } catch (err) {
        console.error('Fetch order book failed', err)
        orderBookYes.value = { asks: [], bids: [], last_trade_price: '' }
        orderBookNo.value = { asks: [], bids: [], last_trade_price: '' }
    } finally {
        orderBookLoading.value = false
    }
}

// ===================== 图表数据 =====================
const timeRanges = computed(() => [
    { label: '1H', value: '1H' },
    { label: '6H', value: '6H' },
    { label: t('detail.timeRanges.1D') || '1D', value: '1D' },
    { label: t('detail.timeRanges.1W') || '1W', value: '1W' },
    { label: t('detail.timeRanges.1M') || '1M', value: '1M' },
    { label: t('common.all') || 'ALL', value: 'ALL' },
])

const selectedTimeRange = ref('1W')

const TIME_RANGE_TO_REQ = {
    '1H': { interval: '5m', range: '1d' },
    '6H': { interval: '5m', range: '1d' },
    '1D': { interval: '1h', range: '1d' },
    '1W': { interval: '1h', range: '1w' },
    '1M': { interval: '1d', range: '1m' },
    'ALL': { interval: '1d', range: 'all' },
}

// 图表源数据缓存
const chartSourceData = ref(null)

// 根据所选时间范围格式化日期标签
const formatChartDate = (dateOrStr) => {
    const date = dateOrStr instanceof Date ? dateOrStr : new Date(String(dateOrStr || '').replace(' ', 'T'))
    if (isNaN(date.getTime())) return ''
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const range = selectedTimeRange.value
    if (range === '1H' || range === '6H' || range === '1D') {
        return `${hh}:${mm}`
    } else if (range === '1W') {
        return `${date.getMonth() + 1}/${date.getDate()} ${hh}:${mm}`
    } else {
        return `${date.getMonth() + 1}/${date.getDate()}`
    }
}

const buildChartFromPriceHistory = (priceHistoryData) => {
    const points = Array.isArray(priceHistoryData?.data_points) ? priceHistoryData.data_points : []
    if (!points.length) return null
    const first = points[0]
    const historyArr = Array.isArray(first?.history) ? first.history : []
    const picked = historyArr.find(h => (h?.outcome || '').toLowerCase() === 'yes') || historyArr[0] || {}
    const rawSeries = Array.isArray(picked?.data) ? picked.data : []
    if (!rawSeries.length) return null
    const lineData = []
    const xAxis = []
    for (const p of rawSeries) {
        const n = Number(p?.p)
        if (!Number.isFinite(n)) continue
        lineData.push(Math.max(0, Math.min(100, n <= 1 ? n * 100 : n)))
        const ts = p?.t
        if (ts) {
            const d = new Date(String(ts).replace(' ', 'T'))
            xAxis.push(!isNaN(d.getTime()) ? formatChartDate(d) : String(ts))
        } else {
            xAxis.push('')
        }
    }
    if (!lineData.length) return null
    return { line: lineData, xAxis }
}

const fetchPriceHistory = async () => {
    if (!eventGuid.value) return null
    const req = TIME_RANGE_TO_REQ[selectedTimeRange.value] || TIME_RANGE_TO_REQ['1W']
    const sid = resolvedSubEventGuid.value || undefined
    try {
        const res = await getEventPriceHistory({
            event_guid: eventGuid.value,
            interval: req.interval,
            range: req.range,
            sub_event_guid: sid,
        })
        const data = res?.data?.data || {}
        return buildChartFromPriceHistory(data)
    } catch (err) {
        console.error('Fetch price history failed', err)
        return null
    }
}

// ===================== ECharts =====================
const chartRef = ref(null)
let chartInstance = null
const currentPrice = ref(50)

// 拖拽浮窗状态
const chartDragState = ref({
    tooltipVisible: false,
    tooltipLeft: 0,
    tooltipTop: 0,
    tooltipTime: '',
    tooltipPrice: '--',
})
let _chartDragActive = false
let _chartDragStartX = 0

const chartColors = computed(() => ({
    primary: themeStore.isDark ? '#D4FF00' : '#19d96b',
    primaryLight: themeStore.isDark ? 'rgba(212, 255, 0, 0.15)' : 'rgba(25, 217, 107, 0.15)',
    primaryGradient: themeStore.isDark ? 'rgba(212, 255, 0, 0.2)' : 'rgba(25, 217, 107, 0.2)',
    primaryStroke: themeStore.isDark ? 'rgba(212, 255, 0, 0.3)' : 'rgba(25, 217, 107, 0.3)',
    axisLabel: themeStore.isDark ? '#7C7C7C' : '#888',
    splitLine: themeStore.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
}))

const updateChart = (source = null) => {
    if (!chartInstance) return
    const activeSource = source || chartSourceData.value || null
    chartSourceData.value = activeSource
    const lineData = activeSource?.line || []
    const xAxisLabels = activeSource?.xAxis || []
    const colors = chartColors.value

    if (!lineData.length) {
        chartInstance.setOption({
            backgroundColor: 'transparent',
            grid: { left: '8%', right: '12%', top: '10%', bottom: '16%' },
            xAxis: { type: 'category', data: [], boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false } },
            yAxis: { type: 'value', scale: true, position: 'right', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { formatter: (v) => v.toFixed(1) + ' ¢', color: colors.axisLabel, fontSize: 11, margin: 10 }, splitLine: { show: true, lineStyle: { color: colors.splitLine } } },
            tooltip: { show: false },
            series: [],
        }, { replaceMerge: ['series'] })
        return
    }

    const lastIdx = lineData.length - 1
    currentPrice.value = lineData[lastIdx] ?? 0
    const total = xAxisLabels.length
    const showInterval = total > 2 ? Math.floor(total / 2) : 0

    chartInstance.setOption({
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 300,
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'linear',
        grid: { left: '8%', right: '12%', top: '10%', bottom: '16%' },
        xAxis: {
            type: 'category',
            data: xAxisLabels,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: true, color: colors.axisLabel, fontSize: 11, interval: showInterval },
        },
        yAxis: {
            type: 'value', scale: true, splitNumber: 5, position: 'right',
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { formatter: (v) => v.toFixed(1) + ' ¢', color: colors.axisLabel, fontSize: 11, margin: 10 },
            splitLine: { show: true, lineStyle: { color: colors.splitLine } },
        },
        tooltip: { show: false },
        series: [
            {
                name: 'YesLine',
                type: 'line',
                data: lineData,
                smooth: 0.4,
                symbol: 'none',
                connectNulls: false,
                lineStyle: { color: colors.primary, width: 2.5 },
                itemStyle: { color: colors.primary },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: colors.primaryGradient }, { offset: 1, color: 'transparent' }]) },
            },
            {
                // 呼吸灯：最新数据点前进效果
                name: 'YesPulse',
                type: 'effectScatter',
                coordinateSystem: 'cartesian2d',
                data: [{ value: [lastIdx, lineData[lastIdx]] }],
                symbolSize: 8,
                showEffectOn: 'render',
                rippleEffect: { period: 2, scale: 3, brushType: 'fill' },
                itemStyle: { color: colors.primary, shadowBlur: 10, shadowColor: colors.primary },
                zlevel: 1,
            },
        ],
    }, { replaceMerge: ['series'] })
}

const initChart = () => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
    setupChartDragListeners()
    updateChart()
}

// ===================== 拖拽交互 =====================
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
    const src = chartSourceData.value
    if (!chartInstance || !src) return
    const lineData = src.line || []
    const xAxisLabels = src.xAxis || []
    if (!lineData.length) return
    const el = chartRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = pos.x - rect.left
    const relY = pos.y - rect.top
    const coord = chartInstance.convertFromPixel({ gridIndex: 0 }, [relX, relY])
    if (!coord) return
    const idx = Math.max(0, Math.min(lineData.length - 1, Math.round(coord[0])))
    const val = lineData[idx]
    if (val == null) return
    const TOOLTIP_W = 140
    const TOOLTIP_H = 72
    const tLeft = Math.min(Math.max(0, relX - 60), Math.max(0, rect.width - TOOLTIP_W))
    const tTop = Math.min(Math.max(8, relY - 88), rect.height - TOOLTIP_H)
    chartDragState.value = {
        tooltipVisible: true,
        tooltipLeft: tLeft,
        tooltipTop: tTop,
        tooltipTime: xAxisLabels[idx] || '',
        tooltipPrice: `${val.toFixed(1)} ¢`,
    }
    updateChartWithCursor(idx, lineData, xAxisLabels)
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

// 拖拽时：活动线截断到游标，背景线以低透明度占位，游标点高亮
const updateChartWithCursor = (cursorIndex, lineData, xAxisLabels) => {
    if (!chartInstance) return
    const colors = chartColors.value
    const activeLineData = lineData.map((v, i) => i <= cursorIndex ? v : null)
    const cursorVal = lineData[cursorIndex]
    const total = xAxisLabels.length
    const showInterval = total > 2 ? Math.floor(total / 2) : 0
    const seriesList = [
        {
            name: 'YesGhost',
            type: 'line',
            data: lineData,
            smooth: 0.4,
            symbol: 'none',
            connectNulls: false,
            lineStyle: { color: colors.primary, width: 2.5, opacity: 0.18 },
            areaStyle: null,
            zlevel: 0,
        },
        {
            name: 'YesActive',
            type: 'line',
            data: activeLineData,
            smooth: 0.4,
            symbol: 'none',
            connectNulls: false,
            lineStyle: { color: colors.primary, width: 2.5 },
            itemStyle: { color: colors.primary },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: colors.primaryGradient }, { offset: 1, color: 'transparent' }]) },
            zlevel: 1,
        },
    ]
    if (cursorVal != null) {
        seriesList.push({
            name: '_cursor_dot',
            type: 'scatter',
            data: [[cursorIndex, cursorVal]],
            symbolSize: 9,
            itemStyle: { color: colors.primary, borderColor: '#fff', borderWidth: 2 },
            zlevel: 2,
        })
    }
    chartInstance.setOption({
        backgroundColor: 'transparent',
        animation: false,
        grid: { left: '8%', right: '12%', top: '10%', bottom: '16%' },
        xAxis: {
            type: 'category', data: xAxisLabels, boundaryGap: false,
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { show: true, color: colors.axisLabel, fontSize: 11, interval: showInterval },
        },
        yAxis: {
            type: 'value', scale: true, splitNumber: 5, position: 'right',
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { formatter: (v) => v.toFixed(1) + ' ¢', color: colors.axisLabel, fontSize: 11, margin: 10 },
            splitLine: { show: true, lineStyle: { color: colors.splitLine } },
        },
        tooltip: { show: false },
        series: seriesList,
    }, { replaceMerge: ['series'] })
}

// 将实时 yes 价格追加到图表末尾，自动跳到最新点
const pushLiveChartPoint = (priceRaw, ts = null) => {
    const rawNum = Number(priceRaw)
    if (!Number.isFinite(rawNum)) return
    const pct = Math.max(0, Math.min(100, rawNum <= 1 ? rawNum * 100 : rawNum))
    const src = chartSourceData.value
    if (!src) return
    const label = ts
        ? formatChartDate(ts instanceof Date ? ts : new Date(String(ts).replace(' ', 'T')))
        : formatChartDate(new Date())
    chartSourceData.value = { line: [...src.line, pct], xAxis: [...src.xAxis, label] }
    updateChart(chartSourceData.value)
}

watch(() => themeStore.isDark, () => { updateChart() })

const handleTimeRangeChange = async (value) => {
    selectedTimeRange.value = value
    chartSourceData.value = null
    const source = await fetchPriceHistory()
    updateChart(source)
}

const resizeHandler = () => { chartInstance && chartInstance.resize() }

// ===================== MQTT 业务消息分发 =====================
const handleMqttBusinessMessage = (data, topic) => {
    if (!data || typeof data !== 'object') return
    const type = data.type

    // price_update：实时价格推送 → 更新图表 + 顶部概率 + 底部按钮价格
    if (type === 'price_update' && data.prices) {
        const yesPoints = Array.isArray(data.prices?.YES) ? data.prices.YES : []
        const noPoints = Array.isArray(data.prices?.NO) ? data.prices.NO : []
        const latestYes = yesPoints[yesPoints.length - 1]
        const latestNo = noPoints[noPoints.length - 1]
        if (latestYes?.p) {
            const p = Number(latestYes.p)
            detailData.value.yesAskPrice = formatCentText(p)
            detailData.value.yesChance = priceToPercent(p)
            pushLiveChartPoint(p, latestYes.t || null)
        }
        if (latestNo?.p) {
            const p = Number(latestNo.p)
            detailData.value.noAskPrice = formatCentText(p)
            detailData.value.noChance = priceToPercent(p)
        }
        return
    }

    // orderbook：订单簿推送 → 更新订单簿 + 底部按钮价格 + 概率
    if (type === 'orderbook') {
        applyOrderBookPayload(data)
        const pickBestAsk = (asks = []) => {
            const prices = (Array.isArray(asks) ? asks : []).map(l => firstFinite(l?.price)).filter(v => Number.isFinite(v))
            return prices.length ? Math.min(...prices) : null
        }
        const pickBestBid = (bids = []) => {
            const prices = (Array.isArray(bids) ? bids : []).map(l => firstFinite(l?.price)).filter(v => Number.isFinite(v))
            return prices.length ? Math.max(...prices) : null
        }
        const yesBook = data?.YES || data?.yes
        const noBook = data?.NO || data?.no
        const yesBestAsk = pickBestAsk(yesBook?.asks)
        const noBestAsk = pickBestAsk(noBook?.asks)
        const yesBestBid = pickBestBid(yesBook?.bids)
        const noBestBid = pickBestBid(noBook?.bids)
        if (Number.isFinite(yesBestAsk)) detailData.value.yesAskPrice = formatCentText(yesBestAsk)
        if (Number.isFinite(noBestAsk)) detailData.value.noAskPrice = formatCentText(noBestAsk)
        if (Number.isFinite(yesBestBid)) {
            detailData.value.yesBidPrice = formatCentText(yesBestBid)
            detailData.value.yesChance = priceToPercent(yesBestBid)
        }
        if (Number.isFinite(noBestBid)) detailData.value.noBidPrice = formatCentText(noBestBid)
        const vol = firstFinite(data?.trade_volume, data?.total_volume, data?.volume)
        if (Number.isFinite(vol) && vol > 0) {
            detailData.value.tradeVolume = vol
            detailData.value.volume = formatVolume(vol)
        }
        return
    }

    // trade：成交推送 → 更新成交价并追加图表点
    if (type === 'trade' && Array.isArray(data.trades) && data.trades.length) {
        data.trades.forEach(tr => {
            const price = firstFinite(tr?.price)
            if (!Number.isFinite(price)) return
            orderBookYes.value.last_trade_price = String(price)
            orderBookNo.value.last_trade_price = String(price)
            pushLiveChartPoint(price, tr?.timestamp || tr?.t || null)
        })
    }
}

// ===================== MQTT 连接管理 =====================
const stopMqttStream = () => {
    if (!iotMqtt) return
    iotMqtt.destroy()
    iotMqtt = null
}

const startMqttStream = async () => {
    if (mqttDestroyed) return
    if (!shouldUseMqtt.value) return
    if (isEventEnded.value) return
    if (!eventGuid.value || !resolvedSubEventGuid.value) return
    if (iotMqtt) return

    const userGuid = address.value || ''
    const topics = [
        `price/${eventGuid.value}/${resolvedSubEventGuid.value}`,
        `orderbook/${eventGuid.value}/${resolvedSubEventGuid.value}`,
        `trade/${eventGuid.value}/${resolvedSubEventGuid.value}`,
        `user/${userGuid}/orders`,
        `user/${userGuid}/positions`,
    ]

    iotMqtt = createIotMqttClient({
        region: IOT_REGION,
        endpoint: IOT_ENDPOINT,
        identityPoolId: COGNITO_IDENTITY_POOL_ID,
    })

    iotMqtt.on('connect', () => {
        console.log('[MQTT] connected, subscribing', topics)
        iotMqtt.subscribe(topics)
    })

    iotMqtt.on('message', (topic, data) => {
        if (mqttDestroyed) return
        handleMqttBusinessMessage(data, topic)
    })

    try {
        await iotMqtt.connect()
    } catch (e) {
        console.error('[MQTT] connect failed', e)
        iotMqtt?.destroy()
        iotMqtt = null
    }
}

// ===================== 监听 =====================
watch(isEventEnded, (ended) => {
    if (ended) stopMqttStream()
})

// sub_event_guid 切换时重新拉取行情并重连 MQTT
watch(resolvedSubEventGuid, async (sguid, prevSguid) => {
    if (!sguid || !prevSguid) return
    // 先断开旧 MQTT，避免旧 topic 推送污染新订单簿
    stopMqttStream()
    const [source] = await Promise.allSettled([fetchPriceHistory(), fetchOrderBook()])
    updateChart(source.status === 'fulfilled' ? source.value : null)
    if (shouldUseMqtt.value && !isEventEnded.value) startMqttStream()
})

// ===================== 购买弹窗 =====================
const showPayment = ref(false)
const paymentInitialOutcome = ref('YES')
const paymentInitialSide = ref('buy')

const openPayment = (outcome, side = 'buy') => {
    paymentInitialOutcome.value = outcome === 'yes' ? 'YES' : 'NO'
    paymentInitialSide.value = side
    showPayment.value = true
}

const onOrderSuccess = () => {
    fetchDetail()
    fetchOrderBook()
}

// ===================== 生命周期 =====================
const handleBack = () => { router.back() }

onMounted(async () => {
    nextTick(() => { initChart() })
    window.addEventListener('resize', resizeHandler)

    // 步骤1：获取完整事件详情（含 subEventGuidResolved + 收藏状态）
    await fetchDetail()

    // 步骤2：基于 resolvedSubEventGuid 并行获取订单簿 + 价格历史
    const [source] = await Promise.all([
        fetchPriceHistory(),
        fetchOrderBook(),
    ])

    // 步骤3：用真实数据渲染图表
    updateChart(source)

    // 步骤4：启动 MQTT 实时推送
    if (shouldUseMqtt.value && !isEventEnded.value) {
        startMqttStream()
    }
})

onUnmounted(() => {
    mqttDestroyed = true
    stopMqttStream()
    window.removeEventListener('resize', resizeHandler)
    cleanupChartDragListeners()
    if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
    }
})
</script>

<style scoped lang="scss">
.prediction-detail-h5-page {
    min-height: 100vh;
    padding-bottom: 70px;
    color: var(--bg-opposite);
    background: var(--bg-page-h5);
}

.top-bar {
    background: var(--bg-page-h5);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    height: 40px;
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
}

.top-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
}

.back-btn :deep(.el-icon) {
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
    color: var(--text-dark-gray);
}

.bookmark-icon {
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.3s;
    color: var(--text-dark-gray);

    &.active {
        color: var(--text-color-y);
    }
}

.bookmark-icon svg {
    width: 18px;
    height: 18px;
}

.content {
    padding: 56px 16px 16px;
}

.event-card {
    padding: 12px 0 8px;
    margin-bottom: 16px;
}

.event-header-row {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
}

.event-main {
    display: flex;
    gap: 10px;
    align-items: center;
}

.event-avatar-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;
}

.event-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.event-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.event-title {
    font-size: 18px;
    font-weight: 600;
    line-height: 1.5;
}

.brand-logo {
    height: 18px;
    margin-bottom: 5px;
}

.event-chance-row {
    margin-top: 12px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px;
}

.event-chance-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.event-yes-label {
    font-size: 13px;
    color: var(--text-color-y);
}

.event-chance-block {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 6px;
}

.event-chance-main {
    color: var(--bg-opposite);
    font-size: 26px;
    font-weight: 700;
}

.event-change-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
}

.change-icon {
    color: var(--text-color-y);
    font-size: 10px;
}


.event-change {
    color: var(--text-color-y);
}

.event-stats {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    opacity: 0.8;
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.stat-label {
    color: var(--text-dark-gray);
}

.stat-value {
    color: var(--bg-opposite);
}

.chart-section {
    background: transparent;
    margin-bottom: 20px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.chart-title {
    font-size: 13px;
    color: var(--text-dark-gray);
}

.chart-selected {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
}

.selected-label {
    padding: 2px 6px;
    border-radius: 999px;
    background: var(--text-color-y);
    color: var(--bg-opposite);
    font-weight: 600;
}

.selected-value {
    color: var(--text-color-y);
    font-weight: 600;
}

.time-range-selector {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 12px;
}

.time-range-btn {
    padding: 2px 6px;
    background: transparent;
    color: var(--text-dark-gray);
}

.time-range-btn.active {
    color: var(--bg-opposite);
}

.chart-container {
    padding: 4px 0;
    overflow: visible;
    position: relative;
}

.chart-canvas {
    width: 100%;
    height: 220px;
}

.chart-drag-tooltip {
    position: absolute;
    z-index: 10;
    background: var(--bg-page, rgba(20, 24, 30, 0.92));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
    border-radius: 10px;
    padding: 10px 14px;
    pointer-events: none;
    backdrop-filter: blur(8px);
    min-width: 110px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

    .cdt-time {
        font-size: 11px;
        color: var(--text-dark-gray, #888);
        margin-bottom: 6px;
        white-space: nowrap;
    }

    .cdt-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 4px;
    }

    .cdt-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .cdt-name {
        font-size: 12px;
        color: var(--text-dark-gray, #888);
        flex: 1;
    }

    .cdt-price {
        font-size: 13px;
        font-weight: 700;
        color: var(--bg-opposite);
        white-space: nowrap;
    }
}

.cdt-enter-active,
.cdt-leave-active {
    transition: opacity 0.15s ease;
}

.cdt-enter-from,
.cdt-leave-to {
    opacity: 0;
}

.orderbook-section {
    margin-top: 18px;
    padding-top: 10px;
}

.orderbook-title-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-bottom: 1px solid var(--border-color);
}

.orderbook-title {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 14px;
    color: var(--bg-opposite);
    padding-bottom: 15px;
    border-bottom: 2px solid var(--bg-opposite);
}

.orderbook-tabs {
    display: flex;
    gap: 28px;
    padding-top: 16px;
}

.orderbook-tab {
    background: transparent;
    border: none;
    padding: 0;
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 14px;
    color: var(--text-dark-gray);
}

.orderbook-tab.active {
    color: var(--bg-opposite);
}

/* 吸底操作 */
/* 底部操作栏 */
.bottom-dock-actions {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    gap: 12px;
    margin-top: 20px;
    background: var(--bg-page-h5);
    z-index: 900;

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
            color: var(--text-color-n);
            border: 1.5px solid var(--text-color-n);
            background: var(--button-bg-n);
        }
    }
}
</style>
