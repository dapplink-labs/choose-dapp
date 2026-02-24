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
                            <img :src="detailData.avatar" :alt="detailData.title" class="event-avatar" />
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

                <OrderBookMobile :active-side="activeOrderbookSide" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Trophy } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import logoIcon from '@/assets/icon/logoIcon.png'
import OrderBookMobile from '@/components/OrderBookMobile.vue'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()

const logoUrl = logoIcon

const detailData = computed(() => ({
    avatar: 'https://picsum.photos/seed/prediction-detail/60/60',
    title: t('common.fedDecision') || '美联储一月份会做出决定吗？',
    yesChance: `90% ${t('detail.chanceText')}`,
    yesChange: '+40%',
    volume: '$153,642,644 Vol.',
    closeDate: '1月30日, 23:59 UTC+8'
}))

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

// 订单簿 tab（仅 UI）
const activeOrderbookSide = ref('yes')

// 图表数据生成逻辑（根据时间范围生成不同粒度的数据）
const rangePointsMap = {
    '1H': 30,   // 近 30 个点
    '6H': 60,   // 近 60 个点
    '1D': 90,   // 近 90 个点
    '1W': 120,  // 近 120 个点
    '1M': 150,  // 近 150 个点
    ALL: 150    // 1 月到 5 月，共约 150 天
}

const generateChartDataForRange = (range) => {
    const points = rangePointsMap[range] || 90
    return generateChartData(points)
}

function generateChartData(points) {
    const orangeData = []
    const xAxisData = []

    const actualPoints = Math.max(points, 30)

    for (let i = 0; i < actualPoints; i++) {
        xAxisData.push(i) // 用索引代表「每天」，后续通过 formatter 显示月份刻度

        const progress = i / (actualPoints - 1)
        const dayIndex = i // 用于制造周期性波动

        // 更大幅度的噪声和周期波动，制造明显锯齿
        const randomNoise = () => (Math.random() - 0.5) * 12 // ±12
        const dailyVariation = Math.sin(dayIndex * 0.4) * 18   // 日内波动 ±18
        const weeklyVariation = Math.sin(dayIndex * 0.08 + 1) * 22 // 周期波动 ±22

        // 橙色线：整体在 0%~100% 间大幅波动（分三段）
        let orangeValue
        if (progress < 0.33) {
            // 1 月：围绕 60% 震荡，偶尔上冲下探
            orangeValue = 60 + Math.sin(progress * Math.PI * 5) * 25
        } else if (progress < 0.66) {
            // 3 月：大起大落，模拟剧烈波动
            const mp = (progress - 0.33) / 0.33
            orangeValue = 50 + Math.sin(mp * Math.PI * 6) * 40
        } else {
            // 5 月：整体抬升到高位附近
            const mp = (progress - 0.66) / 0.34
            orangeValue = 40 + mp * 70 // 40 → 110（后面再 clamp）
        }

        orangeValue += dailyVariation + weeklyVariation + randomNoise()
        // 限制在 0%~100% 区间
        orangeData.push(Math.max(0, Math.min(100, orangeValue)))
    }

    // 强制几个关键锚点，保证从 1 月到 5 月有明显上下波动
    if (orangeData.length > 0) {
        const idxStart = 0
        const idxLow = Math.floor(actualPoints * 0.25)      // 接近 1~3 月之间，强制低点
        const idxMidHigh = Math.floor(actualPoints * 0.5)   // 中间高点
        const idxDeepLow = Math.floor(actualPoints * 0.65)  // 深低点
        const idxEnd = actualPoints - 1                     // 终点接近 100%

        orangeData[idxStart] = 70
        orangeData[idxLow] = 15
        orangeData[idxMidHigh] = 85
        orangeData[idxDeepLow] = 10
        orangeData[idxEnd] = 98
    }

    return {
        // 不再做平滑，保留更多「锯齿」波动感
        line: orangeData,
        xAxis: xAxisData
    }
}

const chartData = computed(() => ({
    '1H': generateChartDataForRange('1H'),
    '6H': generateChartDataForRange('6H'),
    '1D': generateChartDataForRange('1D'),
    '1W': generateChartDataForRange('1W'),
    '1M': generateChartDataForRange('1M'),
    ALL: generateChartDataForRange('ALL')
}))

// ECharts 折线图
const chartRef = ref(null)
let chartInstance = null
const showHighlightBubble = ref(true)
const infoBoxStyle = ref({ display: 'none' })
const currentPrice = ref(95.4)
const handleIndex = ref(0)

// 图表颜色配置
const chartColors = computed(() => ({
    primary: themeStore.isDark ? '#D4FF00' : '#19d96b',
    primaryLight: themeStore.isDark ? 'rgba(212, 255, 0, 0.15)' : 'rgba(25, 217, 107, 0.15)',
    primaryGradient: themeStore.isDark ? 'rgba(212, 255, 0, 0.2)' : 'rgba(25, 217, 107, 0.2)',
    primaryStroke: themeStore.isDark ? 'rgba(212, 255, 0, 0.3)' : 'rgba(25, 217, 107, 0.3)',
    axisLabel: themeStore.isDark ? '#7C7C7C' : '#888',
    splitLine: themeStore.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
}))

const updateChart = () => {
    if (!chartInstance) return

    const current = chartData.value[selectedTimeRange.value] || chartData.value['1W']
    const lineData = current?.line || []
    const xAxisLabels = current?.xAxis || ['1月', '3月', '5月']
    const colors = chartColors.value

    // 初始化handleIndex为最后一个点
    if (handleIndex.value === 0 || handleIndex.value >= lineData.length) {
        handleIndex.value = lineData.length - 1
    }
    const highlightValue = lineData[handleIndex.value] ?? 95.4
    currentPrice.value = highlightValue

    const option = {
        backgroundColor: 'transparent',
        grid: {
            left: '8%',
            right: '12%',
            top: '10%',
            bottom: '16%'
        },
        xAxis: {
            type: 'category',
            data: xAxisLabels,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: colors.axisLabel,
                fontSize: 11,
                formatter: (value, index) => {
                    const total = xAxisLabels.length
                    if (index === 0) return t('detail.months.jan')
                    if (index === Math.floor(total / 2)) return t('detail.months.mar')
                    if (index === total - 1) return t('detail.months.may')
                    return ''
                }
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            splitNumber: 5,
            position: 'right',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                formatter: '{value}%',
                color: colors.axisLabel,
                fontSize: 11,
                margin: 10
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: colors.splitLine
                }
            }
        },
        tooltip: { show: false },
        series: [
            {
                name: 'Background',
                type: 'line',
                data: lineData,
                smooth: 0.4,
                symbol: 'none',
                lineStyle: {
                    color: colors.primaryLight,
                    width: 2.5
                }
            },
            {
                name: 'Progress',
                type: 'line',
                data: lineData.slice(0, handleIndex.value + 1),
                smooth: 0.4,
                symbol: 'none',
                lineStyle: {
                    color: colors.primary,
                    width: 2.5
                },
                itemStyle: {
                    color: colors.primary
                },
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

    // 绘制可拖拽高亮圆点
    setTimeout(() => {
        if (!chartInstance) return
        const xPix = chartInstance.convertToPixel({ xAxisIndex: 0 }, handleIndex.value)
        const yPix = chartInstance.convertToPixel({ yAxisIndex: 0 }, highlightValue)

        chartInstance.setOption({
            graphic: [{
                type: 'circle',
                id: 'highlight',
                x: xPix,
                y: yPix,
                shape: { r: 8 },
                style: {
                    fill: colors.primary,
                    stroke: colors.primaryStroke,
                    lineWidth: 12
                },
                draggable: true,
                z: 100,
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

                    // 更新高亮线条
                    chartInstance.setOption({
                        series: [
                            {},
                            { data: lineData.slice(0, idx + 1) }
                        ]
                    }, false)
                }
            }]
        })
        updateInfoBoxPos(xPix, yPix)
    }, 0)
}

const updateInfoBoxPos = (x, y) => {
    infoBoxStyle.value = {
        left: `${x}px`,
        top: `${y - 50}px`,
        transform: 'translateX(-50%)',
        display: 'block'
    }
}

const initChart = () => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
    updateChart()
}

// 监听主题变化
watch(() => themeStore.isDark, () => {
    updateChart()
})

const handleChartClick = (params) => {
    if (!params || params.seriesType !== 'line') return

    const current = chartData.value[selectedTimeRange.value] || chartData.value['1W']
    const lineData = current?.line || []
    const highlightIndex = lineData.length - 1

    if (params.dataIndex === highlightIndex) {
        showHighlightBubble.value = !showHighlightBubble.value
        updateChart()
    }
}

const handleTimeRangeChange = (value) => {
    selectedTimeRange.value = value
}

watch(selectedTimeRange, () => {
    updateChart()
})

const resizeHandler = () => {
    chartInstance && chartInstance.resize()
}

onMounted(() => {
    initChart()
    window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    if (chartInstance) {
        chartInstance.off('click', handleChartClick)
        chartInstance.dispose()
        chartInstance = null
    }
})

const handleBack = () => {
    router.back()
}
</script>

<style scoped lang="scss">
.prediction-detail-h5-page {
    min-height: 100vh;
    padding-bottom: 24px;
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
</style>
