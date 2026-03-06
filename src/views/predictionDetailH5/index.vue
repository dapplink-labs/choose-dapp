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
                <button class="top-btn bookmark-btn" type="button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="content">
            <!-- 顶部事件卡片 -->
            <div class="event-card">
                <div class="event-header-row">
                    <div class="event-main">
                        <div class="event-avatar-wrapper">
                            <img :src="detailData.avatar || fallbackAvatar" :alt="detailData.title"
                                class="event-avatar" @error="(e) => (e.target.src = fallbackAvatar)"
                                referrerpolicy="no-referrer" />
                        </div>
                        <div class="event-info">
                            <h1 class="event-title">{{ detailData.title }}</h1>
                        </div>
                    </div>
                </div>

                <div class="event-chance-row">
                    <div class="event-chance-left">
                        <div class="event-yes-label">Yes</div>
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
                <div class="chart-container">
                    <div ref="chartRef" class="chart-canvas" />
                    <!-- 浮动信息框 -->
                    <div v-if="showHighlightBubble" class="info-popover" :style="infoBoxStyle">
                        <div class="info-price">Yes {{ currentPrice.toFixed(1) }}%</div>
                        <div class="info-arrow"></div>
                    </div>
                    <!-- 左侧价格标签 -->
                    <div class="price-labels">
                        <div class="price-label green">+$3</div>
                        <div class="price-label green">+$200</div>
                        <div class="price-label pink">+$2</div>
                        <div class="price-label pink">+$10</div>
                    </div>
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
                        {{ $t('detail.tradeYes') }}
                    </button>
                    <button type="button" class="orderbook-tab" :class="{ active: activeOrderbookSide === 'no' }"
                        @click="activeOrderbookSide = 'no'">
                        {{ $t('detail.tradeNo') }}
                    </button>
                </div>

                <OrderBookMobile
                    :active-side="activeOrderbookSide"
                    :asks="currentOrderBook.asks"
                    :bids="currentOrderBook.bids"
                    :last-trade-price="currentOrderBook.last_trade_price"
                    :loading="orderBookLoading" />
            </div>
        </div>
        <!-- 底部预测操作栏 -->
        <div class="bottom-dock-actions">
            <button class="trade-btn up" @click="openPayment('yes')">{{ $t('common.buy') }} Yes {{ detailData.yesBidPrice }}</button>
            <button class="trade-btn down" @click="openPayment('no')">{{ $t('common.buy') }} No {{ detailData.noBidPrice }}</button>
        </div>

        <!-- 购买弹窗 -->
        <PaymentModal
            v-model="showPayment"
            :event-title="detailData.title"
            :outcome-title="paymentInitialOutcome === 'YES' ? 'Yes' : 'No'"
            :event-guid="eventGuid"
            :sub-event-guid="detailData.subEventGuidResolved || subEventGuid"
            :initial-outcome="paymentInitialOutcome"
            :initial-side="paymentInitialSide"
            @order-success="onOrderSuccess" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Trophy } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import logoIcon from '@/assets/icon/logoIcon.png'
import OrderBookMobile from '@/components/OrderBookMobile.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import { useThemeStore } from '@/stores/theme'
import { getSubEventDetail, getOrderBook, getEventPriceHistory } from '@/api/APIEvent'
import fallbackAvatar from '@/assets/icon/LP1.png'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const logoUrl = logoIcon

// ===================== 路由参数 =====================
const eventGuid = computed(() => route.query.event_guid || route.query.id || '')
const subEventGuid = computed(() => route.query.sub_event_guid || '')

// ===================== 页面数据 =====================
const detailData = ref({
    avatar: '',
    title: '',
    yesChance: '--',
    yesChange: '--',
    noChance: '--',
    volume: '--',
    closeDate: '--',
    status: '',
    subEventGuidResolved: '',
    yesBidPrice: '--',
    noBidPrice: '--',
    yesAskPrice: '--',
    noAskPrice: '--',
})

const loadingDetail = ref(false)

const formatVolume = (v) => {
    const num = Number(v)
    if (!Number.isFinite(num)) return '$0 Vol.'
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M Vol.`
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K Vol.`
    return `$${num.toFixed(2)} Vol.`
}

const parsePriceToPercent = (p) => {
    const n = Number(p)
    if (!Number.isFinite(n)) return '--'
    const pct = n <= 1 ? n * 100 : n
    return pct.toFixed(1) + '%'
}

const fetchSubEventDetail = async () => {
    if (!eventGuid.value) return
    loadingDetail.value = true
    try {
        const currentLocale = localStorage.getItem('app-locale') || navigator.language || 'en'
        const language = currentLocale.split('-')[0]
        const res = await getSubEventDetail({
            event_guid: eventGuid.value,
            language_label: language,
        })
        const data = res?.data?.data || {}
        const subEvents = Array.isArray(data.sub_events) ? data.sub_events : []
        const sub = subEventGuid.value
            ? subEvents.find(s => s.sub_event_guid === subEventGuid.value) || subEvents[0]
            : subEvents[0]

        if (!sub) {
            detailData.value.title = route.query.title || ''
            return
        }

        const directions = Array.isArray(sub.directions) ? sub.directions : []
        const yesDir = directions.find(d => (d.outcome || '').toLowerCase() === 'yes') || directions[0] || {}
        const noDir = directions.find(d => (d.outcome || '').toLowerCase() === 'no') || directions[1] || {}

        const yesChanceNum = Number(yesDir.chance ?? 0)
        const yesChancePct = Number.isFinite(yesChanceNum)
            ? (yesChanceNum <= 1 ? yesChanceNum * 100 : yesChanceNum).toFixed(1)
            : '--'

        detailData.value = {
            avatar: sub.logo || yesDir.logo || '',
            title: sub.title || route.query.title || '',
            yesChance: yesChancePct !== '--' ? `${yesChancePct}%` : '--',
            yesChange: yesDir.new_bid_price ? `+${parsePriceToPercent(yesDir.new_bid_price)}` : '--',
            noChance: parsePriceToPercent(noDir.chance ?? 0),
            volume: formatVolume(sub.trade_volume),
            closeDate: sub.close_time || '',
            status: sub.status || '',
            subEventGuidResolved: sub.sub_event_guid || subEventGuid.value,
            yesBidPrice: yesDir.new_bid_price
                ? `${(Number(yesDir.new_bid_price) * 100).toFixed(0)} ¢`
                : '--',
            noBidPrice: noDir.new_bid_price
                ? `${(Number(noDir.new_bid_price) * 100).toFixed(0)} ¢`
                : '--',
            yesAskPrice: yesDir.new_ask_price
                ? `${(Number(yesDir.new_ask_price) * 100).toFixed(0)} ¢`
                : '--',
            noAskPrice: noDir.new_ask_price
                ? `${(Number(noDir.new_ask_price) * 100).toFixed(0)} ¢`
                : '--',
        }
    } catch (err) {
        console.error('Fetch sub-event detail failed', err)
        detailData.value.title = route.query.title || ''
    } finally {
        loadingDetail.value = false
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

const fetchOrderBook = async () => {
    if (!eventGuid.value) return
    const sid = detailData.value.subEventGuidResolved || subEventGuid.value
    if (!sid) return

    orderBookLoading.value = true
    try {
        const res = await getOrderBook({
            event_guid: eventGuid.value,
            sub_event_guid: sid,
            outcome: 'all',
        })
        const data = res?.data?.data || {}
        if (data.yes) orderBookYes.value = data.yes
        if (data.no) orderBookNo.value = data.no
    } catch (err) {
        console.error('Fetch order book failed', err)
    } finally {
        orderBookLoading.value = false
    }
}

// ===================== 图表数据 =====================
// 图表选项（和 detailH5 保持一致，便于复用趋势）
const timeRanges = computed(() => [
    { label: '1H', value: '1H' },
    { label: '6H', value: '6H' },
    { label: t('detail.timeRanges.1D') || '1D', value: '1D' },
    { label: t('detail.timeRanges.1W') || '1W', value: '1W' },
    { label: t('detail.timeRanges.1M') || '1M', value: '1M' },
    { label: t('common.all') || 'ALL', value: 'ALL' }
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

// 降级随机数据生成
const rangePointsMap = { '1H': 30, '6H': 60, '1D': 90, '1W': 120, '1M': 150, ALL: 150 }

function generateChartData(points) {
    const orangeData = []
    const xAxisData = []
    const actualPoints = Math.max(points, 30)
    for (let i = 0; i < actualPoints; i++) {
        xAxisData.push(i)
        const progress = i / (actualPoints - 1)
        const dayIndex = i
        const randomNoise = () => (Math.random() - 0.5) * 12
        const dailyVariation = Math.sin(dayIndex * 0.4) * 18
        const weeklyVariation = Math.sin(dayIndex * 0.08 + 1) * 22
        let orangeValue
        if (progress < 0.33) { orangeValue = 60 + Math.sin(progress * Math.PI * 5) * 25 }
        else if (progress < 0.66) { const mp = (progress - 0.33) / 0.33; orangeValue = 50 + Math.sin(mp * Math.PI * 6) * 40 }
        else { const mp = (progress - 0.66) / 0.34; orangeValue = 40 + mp * 70 }
        orangeValue += dailyVariation + weeklyVariation + randomNoise()
        orangeData.push(Math.max(0, Math.min(100, orangeValue)))
    }
    if (orangeData.length > 0) {
        orangeData[0] = 70
        orangeData[Math.floor(actualPoints * 0.25)] = 15
        orangeData[Math.floor(actualPoints * 0.5)] = 85
        orangeData[Math.floor(actualPoints * 0.65)] = 10
        orangeData[actualPoints - 1] = 98
    }
    return { line: orangeData, xAxis: xAxisData }
}

const generateChartDataForRange = (range) => generateChartData(rangePointsMap[range] || 90)

// 图表源数据缓存
const chartSourceData = ref(null)

const buildChartFromPriceHistory = (priceHistoryData) => {
    const points = Array.isArray(priceHistoryData?.data_points) ? priceHistoryData.data_points : []
    if (!points.length) return null
    const first = points[0]
    const historyArr = Array.isArray(first?.history) ? first.history : []
    const picked = historyArr.find(h => (h?.outcome || '').toLowerCase() === 'yes') || historyArr[0] || {}
    const rawSeries = Array.isArray(picked?.data) ? picked.data : []
    if (!rawSeries.length) return null
    const lineData = rawSeries.map(p => {
        const n = Number(p?.p)
        if (!Number.isFinite(n)) return null
        const pct = n <= 1 ? n * 100 : n
        return Math.max(0, Math.min(100, pct))
    })
    return { line: lineData, xAxis: Array.from({ length: lineData.length }, (_, i) => i) }
}

const fetchPriceHistory = async () => {
    if (!eventGuid.value) return null
    const req = TIME_RANGE_TO_REQ[selectedTimeRange.value] || TIME_RANGE_TO_REQ['1W']
    // 优先使用 fetchSubEventDetail 解析出的真实 sub_event_guid
    const sid = detailData.value.subEventGuidResolved || subEventGuid.value || undefined
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

// ECharts 折线图
const chartRef = ref(null)
let chartInstance = null
const showHighlightBubble = ref(true)
const infoBoxStyle = ref({ display: 'none' })
const currentPrice = ref(95.4)
const handleIndex = ref(0)

const chartColors = computed(() => ({
    primary: themeStore.isDark ? '#D4FF00' : '#19d96b',
    primaryLight: themeStore.isDark ? 'rgba(212, 255, 0, 0.15)' : 'rgba(25, 217, 107, 0.15)',
    primaryGradient: themeStore.isDark ? 'rgba(212, 255, 0, 0.2)' : 'rgba(25, 217, 107, 0.2)',
    primaryStroke: themeStore.isDark ? 'rgba(212, 255, 0, 0.3)' : 'rgba(25, 217, 107, 0.3)',
    axisLabel: themeStore.isDark ? '#7C7C7C' : '#888',
    splitLine: themeStore.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
}))

const updateChart = (source = null) => {
    if (!chartInstance) return
    const activeSource = source || chartSourceData.value || generateChartDataForRange(selectedTimeRange.value)
    chartSourceData.value = activeSource
    const lineData = activeSource?.line || []
    const xAxisLabels = activeSource?.xAxis || []
    const colors = chartColors.value

    if (handleIndex.value === 0 || handleIndex.value >= lineData.length) {
        handleIndex.value = lineData.length - 1
    }
    const highlightValue = lineData[handleIndex.value] ?? 95.4
    currentPrice.value = highlightValue

    chartInstance.setOption({
        backgroundColor: 'transparent',
        grid: { left: '8%', right: '12%', top: '10%', bottom: '16%' },
        xAxis: {
            type: 'category', data: xAxisLabels, boundaryGap: false,
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: {
                color: colors.axisLabel, fontSize: 11,
                formatter: (value, index) => {
                    const total = xAxisLabels.length
                    if (index === 0) return t('detail.months.jan') || 'Jan'
                    if (index === Math.floor(total / 2)) return t('detail.months.mar') || 'Mar'
                    if (index === total - 1) return t('detail.months.may') || 'May'
                    return ''
                }
            }
        },
        yAxis: {
            type: 'value', min: 0, max: 100, splitNumber: 5, position: 'right',
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { formatter: '{value}%', color: colors.axisLabel, fontSize: 11, margin: 10 },
            splitLine: { show: true, lineStyle: { color: colors.splitLine } }
        },
        tooltip: { show: false },
        series: [
            { name: 'Background', type: 'line', data: lineData, smooth: 0.4, symbol: 'none', lineStyle: { color: colors.primaryLight, width: 2.5 } },
            {
                name: 'Progress', type: 'line', data: lineData.slice(0, handleIndex.value + 1),
                smooth: 0.4, symbol: 'none',
                lineStyle: { color: colors.primary, width: 2.5 },
                itemStyle: { color: colors.primary },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: colors.primaryGradient }, { offset: 1, color: 'transparent' }]) }
            }
        ]
    })

    setTimeout(() => {
        if (!chartInstance) return
        const xPix = chartInstance.convertToPixel({ xAxisIndex: 0 }, handleIndex.value)
        const yPix = chartInstance.convertToPixel({ yAxisIndex: 0 }, highlightValue)
        chartInstance.setOption({
            graphic: [{
                type: 'circle', id: 'highlight', x: xPix, y: yPix,
                shape: { r: 8 }, style: { fill: colors.primary, stroke: colors.primaryStroke, lineWidth: 12 },
                draggable: true, z: 100,
                ondrag: function () {
                    const dataPos = chartInstance.convertFromPixel({ xAxisIndex: 0 }, this.x)
                    let idx = Math.round(Number(dataPos))
                    idx = Math.max(0, Math.min(lineData.length - 1, idx))
                    const snappedX = chartInstance.convertToPixel({ xAxisIndex: 0 }, idx)
                    const snappedY = chartInstance.convertToPixel({ yAxisIndex: 0 }, lineData[idx])
                    this.setPosition([snappedX, snappedY])
                    handleIndex.value = idx
                    currentPrice.value = lineData[idx]
                    updateInfoBoxPos(snappedX, snappedY)
                    chartInstance.setOption({ series: [{}, { data: lineData.slice(0, idx + 1) }] }, false)
                }
            }]
        })
        updateInfoBoxPos(xPix, yPix)
    }, 0)
}

const updateInfoBoxPos = (x, y) => {
    infoBoxStyle.value = { left: `${x}px`, top: `${y - 50}px`, transform: 'translateX(-50%)', display: 'block' }
}

const initChart = () => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
    updateChart()
}

watch(() => themeStore.isDark, () => { updateChart() })

const handleTimeRangeChange = async (value) => {
    selectedTimeRange.value = value
    handleIndex.value = 0
    chartSourceData.value = null
    const source = await fetchPriceHistory()
    updateChart(source || generateChartDataForRange(value))
}

const resizeHandler = () => { chartInstance && chartInstance.resize() }

onMounted(async () => {
    initChart()
    window.addEventListener('resize', resizeHandler)

    // 步骤1：获取子事件详情（含 subEventGuidResolved），渲染基本数据
    await fetchSubEventDetail()

    // 步骤2：基于 subEventGuidResolved 并行获取订单簿 + 价格历史
    const [source] = await Promise.all([
        fetchPriceHistory(),
        fetchOrderBook(),
    ])

    // 步骤3：用真实数据渲染图表，失败则降级随机数据
    handleIndex.value = 0
    updateChart(source || generateChartDataForRange(selectedTimeRange.value))
})

onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
    }
})

const handleBack = () => { router.back() }

// ===================== 购买弹窗 =====================
const showPayment = ref(false)
const paymentInitialOutcome = ref('YES')
const paymentInitialSide = ref('buy')

const openPayment = (outcome, side = 'buy') => {
    paymentInitialOutcome.value = outcome === 'yes' ? 'YES' : 'NO'
    paymentInitialSide.value = side
    showPayment.value = true
}

const onOrderSuccess = (orderData) => {
    console.log('Order success:', orderData)
    fetchSubEventDetail()
    fetchOrderBook()
}
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

.bookmark-btn svg {
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

.info-popover {
    position: absolute;
    background: var(--text-color-y);
    color: #000;
    padding: 8px 14px;
    border-radius: 8px;
    pointer-events: none;
    z-index: 110;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    text-align: center;

    .info-price {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
    }

    .info-arrow {
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        height: 12px;
        background: var(--text-color-y);

        &::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            background: var(--text-color-y);
            border-radius: 50%;
        }
    }
}

.price-labels {
    position: absolute;
    left: 8px;
    bottom: 0px;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;

    .price-label {
        font-size: 13px;
        font-weight: 600;

        &.green {
            color: var(--text-color-y);
        }

        &.pink {
            color: #E44096;
        }
    }
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
