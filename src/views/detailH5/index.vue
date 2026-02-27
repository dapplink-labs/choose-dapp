<template>
    <div class="detail-h5-page">
        <!-- 顶部导航 -->
        <NavBar2 />

        <div class="content">
            <!-- 1. 事件标题和基本信息 -->
            <div class="event-header">
                <div class="event-title-section">
                    <img :src="detailData.avatar" :alt="$t('detail.avatar')" class="event-avatar" />
                    <h1 class="event-title">{{ detailData.title }}</h1>
                    <!-- 倒计时 -->
                    <div class="event-countdown">
                        <div class="countdown-block">
                            <span class="countdown-num">{{ countdownDisplay.hours }}</span>
                            <span class="countdown-label">{{ $t('detail.hour') }}</span>
                        </div>
                        <div class="countdown-block">
                            <span class="countdown-num">{{ countdownDisplay.minutes }}</span>
                            <span class="countdown-label">{{ $t('detail.minute') }}</span>
                        </div>
                        <div class="countdown-block">
                            <span class="countdown-num">{{ countdownDisplay.seconds }}</span>
                            <span class="countdown-label">{{ $t('detail.second') }}</span>
                        </div>
                    </div>
                </div>

                <!-- 附加信息栏 -->
                <div class="event-info-section">
                    <div class="event-info-row event-info-row-top">
                        <div class="info-item">
                            <el-icon class="info-icon">
                                <Trophy />
                            </el-icon>
                            <span class="info-text">{{ detailData.volume }}</span>
                        </div>
                        <div class="info-item">
                            <el-icon class="info-icon">
                                <Clock />
                            </el-icon>
                            <span class="info-text">{{ detailData.closeDate }}</span>
                        </div>
                        <div class="bookmark-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <div class="event-info-row event-info-row-bottom">
                        <div class="leverage-info">
                            <span class="leverage-label">{{ $t('detail.maximumLeverage') }}:</span>
                            <span class="leverage-value">{{ detailData.maxLeverage }}</span>
                        </div>
                        <div class="return-info">
                            <span class="return-label">{{ $t('detail.maximumReturn') }}:</span>
                            <span class="return-value">{{ detailData.maxReturn }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. 图表区域 -->
            <div class="chart-section">
                <div class="chart-title">{{ $t('detail.popularity') }}</div>

                <!-- 时间选择器 -->
                <div class="time-range-selector">
                    <button v-for="range in timeRanges" :key="range.value" class="time-range-btn"
                        :class="{ active: selectedTimeRange === range.value }"
                        @click="handleTimeRangeChange(range.value)">
                        {{ range.label }}
                    </button>
                </div>

                <!-- 动态生成图例 -->
                <div class="chart-legend">
                    <div v-for="(outcome, index) in outcomes" :key="index" class="legend-item">
                        <span class="legend-dot" :style="{ backgroundColor: outcome.color }"></span>
                        <span class="legend-text">{{ outcome.title }} {{ outcome.chance }}%</span>
                    </div>
                </div>

                <!-- ECharts 图表容器 -->
                <div class="chart-container" ref="chartContainerRef" @touchstart="onChartTouchStart"
                    @touchmove.prevent="onChartTouchMove" @touchend="onChartTouchEnd" @mouseleave="onChartTouchEnd">
                    <div ref="chartRef" class="chart-canvas"></div>

                    <div class="interaction-layer">
                        <div v-if="isDragging" class="axis-pointer" :style="{ left: cursorX + 'px' }"></div>
                        <!-- 数据圆点 -->
                        <div v-for="(dot, idx) in activeDots" :key="'dot-' + idx" class="data-dot"
                            :style="{ left: dot.x + 'px', top: dot.y + 'px', backgroundColor: dot.color }">
                        </div>
                        <!-- 浮动信息卡 -->
                        <div v-if="isDragging" class="custom-tooltip" :style="tooltipStyle">
                            <div v-for="dot in activeDots" :key="'tt-' + dot.name" class="tt-row"
                                :style="{ backgroundColor: dot.color, color: dot.textColor }">
                                <span class="tt-name">{{ dot.name }}</span>
                                <span class="tt-val">{{ dot.val }}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. 结果预测列表 (已增加到4条数据) -->
            <div class="outcome-prediction-section">
                <div class="section-title">{{ $t('detail.whatDoYouPredict') }}</div>
                <div class="section-header">
                    <div class="header-label outcome-label">{{ $t('detail.outcome') }}</div>
                    <div class="header-label chance-label">{{ $t('detail.chance') }}</div>
                </div>

                <div class="outcome-list">
                    <div v-for="(outcome, index) in outcomes" :key="index" class="outcome-row">
                        <div class="outcome-content" @click="openPredictionDetail(outcome)">
                            <div class="outcome-left">
                                <div class="outcome-title" :style="{ color: outcome.color }">{{ outcome.title }}</div>
                                <div class="outcome-volume">{{ outcome.volume }}</div>
                            </div>
                            <div class="outcome-chance">{{ outcome.chance }}%</div>
                        </div>
                        <div class="outcome-actions">
                            <button class="outcome-btn yes-btn" :class="{ active: outcome.selected === 'yes' }"
                                @click="selectOutcome(index, 'yes')">
                                {{ $t('detail.buyYes') }} {{ outcome.yesPrice }} ¢
                            </button>
                            <button class="outcome-btn no-btn" :class="{ active: outcome.selected === 'no' }"
                                @click="selectOutcome(index, 'no')">
                                {{ $t('detail.buyNo') }} {{ outcome.noPrice }} ¢
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. 查看结果模块 (折叠) -->
            <div class="view-results-section">
                <div class="view-results-header" @click="showViewResultsExpanded = !showViewResultsExpanded">
                    <h3 class="view-results-title">{{ $t('detail.viewResults') }}</h3>
                    <span class="view-results-caret">
                        <el-icon v-if="showViewResultsExpanded">
                            <ArrowUpBold />
                        </el-icon>
                        <el-icon v-else>
                            <ArrowDownBold />
                        </el-icon>
                    </span>
                </div>
                <transition name="view-results-collapse">
                    <div v-show="showViewResultsExpanded" class="view-results-list">
                        <div v-for="(item, index) in viewResults" :key="index" class="view-results-item">
                            <div class="view-results-content">
                                <div class="view-results-desc">{{ item.title }}</div>
                                <div class="view-results-volume">{{ item.volume }}</div>
                            </div>
                            <span class="view-results-status">{{ item.result === 'yes' ? $t('detail.resultYes') :
                                $t('detail.resultNo')
                                }}</span>
                        </div>
                    </div>
                </transition>
            </div>

            <!-- 5. 关于模块 -->
            <div class="about-section">
                <h3 class="section-block-title">{{ $t('detail.about') || '关于' }}</h3>
                <div class="about-rows">
                    <div class="about-row">
                        <div class="about-left">
                            <el-icon class="about-icon">
                                <Trophy />
                            </el-icon>
                            <span class="about-label">{{ $t('detail.volume') || '交易量' }}</span>
                        </div>
                        <span class="about-value">{{ detailData.volume }}</span>
                    </div>
                    <div class="about-row">
                        <div class="about-left">
                            <el-icon class="about-icon">
                                <Clock />
                            </el-icon>
                            <span class="about-label">{{ $t('detail.endDate') || '结束日期' }}</span>
                        </div>
                        <span class="about-value">{{ detailData.closeDate }}</span>
                    </div>
                    <div class="about-row">
                        <div class="about-left">
                            <el-icon class="about-icon">
                                <Calendar />
                            </el-icon>
                            <span class="about-label">{{ $t('detail.createDate') || '创建日期' }}</span>
                        </div>
                        <span class="about-value">Jan 1, 2026, 23:22 UTC+8</span>
                    </div>
                </div>
            </div>

            <!-- 6. 规则模块 -->
            <div class="rules-section">
                <h3 class="section-block-title">{{ $t('detail.rules') || '规则' }}</h3>
                <p class="rules-text">
                    The FED interest rates are defined in this market by the upper bound of the target federal funds
                    range. The
                    decisions on the target
                </p>
            </div>

            <!-- 7. 选项卡模块 (评论/持仓/活动) -->
            <div class="tabs-section">
                <div class="tabs-nav">
                    <button class="tab-nav-item" :class="{ active: activeListTab === 'comments' }"
                        @click="activeListTab = 'comments'">
                        {{ $t('detail.comments') || '评论' }}
                    </button>
                    <button class="tab-nav-item" :class="{ active: activeListTab === 'holds' }"
                        @click="activeListTab = 'holds'">
                        {{ $t('detail.holds') || '持仓' }}
                    </button>
                    <button class="tab-nav-item" :class="{ active: activeListTab === 'activity' }"
                        @click="activeListTab = 'activity'">
                        {{ $t('detail.activity') || '活动' }}
                    </button>
                </div>

                <!-- 评论列表 -->
                <div v-if="activeListTab === 'comments'" class="tab-pane">
                    <div v-for="(comment, index) in commentsData" :key="index" class="comment-item">
                        <img :src="comment.avatar" class="user-avatar" />
                        <div class="comment-main">
                            <div class="comment-header">
                                <span class="user-name">{{ comment.name }}</span>
                                <span class="comment-tag" :class="comment.type">{{ comment.tag }}</span>
                                <span class="comment-time">{{ comment.time }}</span>
                            </div>
                            <p class="comment-msg">{{ comment.message }}</p>
                            <div class="comment-actions">
                                <span class="likes"><el-icon>
                                        <Pointer />
                                    </el-icon> {{ comment.likes }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 持仓列表 -->
                <div v-if="activeListTab === 'holds'" class="tab-pane holds-grid">
                    <div class="hold-col">
                        <div class="hold-title">Yes Holders</div>
                        <div v-for="h in yesHolders" :key="h.rank" class="holder-row">
                            <div class="avatar-wrap">
                                <img :src="h.avatar" />
                                <span class="rank-badge" :style="{ background: h.rankColor }">{{ h.rank }}</span>
                            </div>
                            <div class="holder-info">
                                <div class="name">{{ h.name }}</div>
                                <div class="amount yes">{{ h.amount }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="hold-col">
                        <div class="hold-title">No Holders</div>
                        <div v-for="h in noHolders" :key="h.rank" class="holder-row">
                            <div class="avatar-wrap">
                                <img :src="h.avatar" />
                                <span class="rank-badge" :style="{ background: h.rankColor }">{{ h.rank }}</span>
                            </div>
                            <div class="holder-info">
                                <div class="name">{{ h.name }}</div>
                                <div class="amount no">{{ h.amount }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 活动列表 -->
                <div v-if="activeListTab === 'activity'" class="tab-pane">
                    <div v-for="(act, index) in activityData" :key="index" class="activity-item">
                        <img :src="act.avatar" class="user-avatar" />
                        <div class="activity-info">
                            <div class="user-name">{{ act.name }}</div>
                            <div class="act-desc">
                                Bought <span class="highlight" :class="act.result">{{ act.outcome }}</span> –
                                {{ act.amount }}
                            </div>
                            <div class="act-time">{{ act.time }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 支付模态框 -->
            <PaymentModal v-model="showPayment" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import { Trophy, Clock, Calendar, ArrowUpBold, ArrowDownBold, Pointer } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import PaymentModal from '@/components/PaymentModal.vue'
import NavBar2 from '@/components/navBar2.vue'
import { useDark } from '@vueuse/core'
import router from '@/router'

const isDarkMode = useDark()

// --- 基础数据 ---
const detailData = ref({
    title: 'U.S. forces seize anotherVenezuela- linked oil ship by...?',
    avatar: 'https://picsum.photos/seed/oil/60/60',
    volume: '$153,642,644 Vol.',
    closeDate: 'Dec 10, 2025',
    maxLeverage: '10X',
    maxReturn: '182%'
})

const PALETTE = [isDarkMode ? '#2EBE69' : '#BBFF2E', '#E44096', '#3B82F6', '#F59E0B']

// 预测列表数据 - 已增加到4条
const outcomes = ref([
    { title: '50+ bps decrease', volume: '$37.7M Vol.', chance: 92.5, yesPrice: '92.5', noPrice: '7.5', color: PALETTE[0], selected: null },
    { title: '25+ bps decrease', volume: '$12.2M Vol.', chance: 7.01, yesPrice: '7.0', noPrice: '93.0', color: PALETTE[1], selected: null },
    { title: 'No change', volume: '$5.8M Vol.', chance: 1.68, yesPrice: '1.7', noPrice: '98.3', color: PALETTE[2], selected: null },
    { title: 'Increase 25+ bps', volume: '$0.5M Vol.', chance: 0.24, yesPrice: '0.2', noPrice: '99.8', color: PALETTE[3], selected: null }
])

const viewResults = ref([
    { title: '50+ bps decrease', volume: '$37,755,917 Vol.', result: 'no' },
    { title: '25+ bps decrease', volume: '$37,755,917 Vol.', result: 'yes' }
])

const commentsData = ref([
    { name: 'Roger Watkins', avatar: 'https://picsum.photos/seed/1/40/40', tag: '302.5K 50+ bps decrease', type: 'yes', time: '6d ago', message: "Thanks for your feedback. We're reviewing it now", likes: 888 },
    { name: 'Jacob Vargas', avatar: 'https://picsum.photos/seed/2/40/40', tag: '30.5K 50+ bps decrease', type: 'no', time: '11/21', message: "Thanks for your feedback. We're reviewing it now", likes: 888 },
    { name: 'Rebecca Lynch', avatar: 'https://picsum.photos/seed/3/40/40', tag: '302.5K 50+ bps decrease', type: 'yes', time: '11/20', message: "Thanks for your feedback. We're reviewing it now", likes: 888 }
])

const yesHolders = ref([
    { rank: 1, name: 'Jerry Stanley', amount: '$19,253.52', avatar: 'https://picsum.photos/seed/4/40/40', rankColor: '#FFD700' },
    { rank: 2, name: 'Jasmine Banks', amount: '$19,253.52', avatar: 'https://picsum.photos/seed/5/40/40', rankColor: '#25A750' },
    { rank: 3, name: 'Kevin Barnett', amount: '$19,253.52', avatar: 'https://picsum.photos/seed/6/40/40', rankColor: '#3B82F6' }
])

const noHolders = ref([
    { rank: 1, name: 'Patricia Fuller', amount: '$19,253.52', avatar: 'https://picsum.photos/seed/7/40/40', rankColor: '#FFD700' },
    { rank: 2, name: 'Beverly Gilbert', amount: '$19,253.52', avatar: 'https://picsum.photos/seed/8/40/40', rankColor: '#25A750' },
    { rank: 3, name: 'Ronald Gomez', amount: '$19,253.52', avatar: 'https://picsum.photos/seed/9/40/40', rankColor: '#3B82F6' }
])

const activityData = ref([
    { name: 'Jerry McCoy', outcome: '50+ bps decrease', amount: '$10.00', time: '6d ago', avatar: 'https://picsum.photos/seed/10/40/40', result: 'yes' },
    { name: 'Steve Barnett', outcome: '25+ bps decrease', amount: '$1000.00', time: '6d ago', avatar: 'https://picsum.photos/seed/11/40/40', result: 'no' },
    { name: 'Kelly Howard', outcome: '50+ bps decrease', amount: '$100.00', time: '6d ago', avatar: 'https://picsum.photos/seed/12/40/40', result: 'yes' }
])

// --- 状态控制 ---
const activeListTab = ref('comments')
const showViewResultsExpanded = ref(false)
const showPayment = ref(false)
const timeRanges = [
    { label: '1H', value: '1H' }, { label: '6H', value: '6H' },
    { label: '1D', value: '1D' }, { label: '1W', value: '1W' },
    { label: 'ALL', value: 'ALL' }
]
const selectedTimeRange = ref('1W')

// --- 倒计时 ---
const countdown = ref({ hours: 0, minutes: 0, seconds: 0 })
let countdownTimer = null
const targetTime = Date.now() + 3600000 * 5

const updateCountdown = () => {
    const diff = Math.max(0, Math.floor((targetTime - Date.now()) / 1000))
    countdown.value = {
        hours: Math.floor(diff / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60
    }
}

const countdownDisplay = computed(() => ({
    hours: String(countdown.value.hours).padStart(2, '0'),
    minutes: String(countdown.value.minutes).padStart(2, '0'),
    seconds: String(countdown.value.seconds).padStart(2, '0')
}))

// --- 图表核心逻辑 ---
const chartRef = ref(null)
const chartContainerRef = ref(null)
const chartInstance = shallowRef(null)
const isDragging = ref(false)
const cursorX = ref(0)
const activeDots = ref([])
const tooltipStyle = ref({ left: '0px', top: '0px' })
let gridRect = { x: 0, y: 0, width: 0, height: 0 }
let chartSourceData = null

const generateData = () => {
    const points = 60
    const sData = outcomes.value.map(opt => {
        const line = []
        let val = opt.chance
        for (let i = 0; i < points; i++) {
            val += (Math.random() - 0.5) * 5
            line.push(Math.max(0, Math.min(100, val)).toFixed(1))
        }
        line[points - 1] = opt.chance
        return { name: opt.title, color: opt.color, data: line }
    })
    return { xData: Array.from({ length: points }, (_, i) => i), sData }
}

const updateOverlay = (idx) => {
    if (!chartInstance.value) return
    idx = Math.max(0, Math.min(chartSourceData.xData.length - 1, idx))
    const xPx = chartInstance.value.convertToPixel({ xAxisIndex: 0 }, idx)
    cursorX.value = xPx

    activeDots.value = chartSourceData.sData.map(line => ({
        name: line.name.length > 8 ? line.name.slice(0, 8) + '...' : line.name,
        val: line.data[idx],
        color: line.color,
        textColor: line.color === '#BBFF2E' ? '#000' : '#fff',
        x: xPx,
        y: chartInstance.value.convertToPixel({ yAxisIndex: 0 }, line.data[idx])
    })).sort((a, b) => b.val - a.val)

    tooltipStyle.value = {
        left: xPx > chartContainerRef.value.offsetWidth / 2 ? `${xPx - 130}px` : `${xPx + 15}px`,
        top: '10%'
    }

    const newSeries = []
    chartSourceData.sData.forEach((line, i) => {
        newSeries.push({})
        newSeries.push({ data: line.data.slice(0, idx + 1) })
    })
    chartInstance.value.setOption({ series: newSeries })
}

const initChart = () => {
    if (!chartRef.value) return
    chartInstance.value = echarts.init(chartRef.value)
    chartSourceData = generateData()

    const series = []
    chartSourceData.sData.forEach(line => {
        series.push({
            type: 'line', data: line.data, smooth: 0.3, symbol: 'none',
            lineStyle: { color: line.color, opacity: 0.15, width: 2 }
        })
        series.push({
            type: 'line', data: line.data, smooth: 0.3, symbol: 'none',
            lineStyle: { color: line.color, width: 3 }
        })
    })

    chartInstance.value.setOption({
        backgroundColor: 'transparent',
        grid: { left: '2%', right: '12%', top: '20%', bottom: '12%' },
        xAxis: {
            type: 'category', data: chartSourceData.xData,
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { color: '#555', interval: 29, formatter: v => v == 0 ? '1月' : v == 29 ? '3月' : '5月' }
        },
        yAxis: {
            type: 'value', position: 'right', min: 0, max: 100,
            axisLabel: { formatter: '{value}%', color: '#555' },
            splitLine: { lineStyle: { color: isDarkMode.value ? '#23262F' : '#E0E0E0', type: 'dashed' } }
        },
        series
    })

    setTimeout(() => {
        const grid = chartInstance.value.getModel().getComponent('grid').coordinateSystem.getRect()
        gridRect = grid
        updateOverlay(chartSourceData.xData.length - 1)
    }, 100)
}

// --- 事件 ---
const onChartTouchMove = (e) => {
    if (!isDragging.value) return
    const rect = chartContainerRef.value.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const idx = Math.round(chartInstance.value.convertFromPixel({ xAxisIndex: 0 }, Math.max(gridRect.x, Math.min(gridRect.x + gridRect.width, x))))
    updateOverlay(idx)
}
const onChartTouchStart = (e) => { isDragging.value = true; onChartTouchMove(e); }
const onChartTouchEnd = () => { isDragging.value = false; updateOverlay(chartSourceData.xData.length - 1); }

const handleTimeRangeChange = (v) => { selectedTimeRange.value = v; initChart(); }
const selectOutcome = (i, type) => { outcomes.value[i].selected = type; showPayment.value = true; }

const openPredictionDetail = (outcome) => {
    router.push({ name: 'predictionDetailH5', query: { title: outcome.title } })
}
onMounted(() => {
    updateCountdown(); countdownTimer = setInterval(updateCountdown, 1000);
    nextTick(initChart);
})
onUnmounted(() => { clearInterval(countdownTimer); chartInstance.value?.dispose(); })
</script>

<style scoped lang="scss">
.detail-h5-page {
    min-height: 100vh;
    background-color: var(--bg-page-h5);
    color: var(--bg-opposite);
    padding-top: 50px;
}

.content {
    padding: 16px;
}

// 头部
.event-header {
    margin-bottom: 24px;

    .event-title-section {
        display: flex;
        gap: 12px;
        align-items: flex-start;

        .event-avatar {
            width: 54px;
            height: 54px;
            border-radius: 8px;
        }

        .event-title {
            flex: 1;
            font-size: 16px;
            margin: 0;
            line-height: 1.4;
        }

        .event-countdown {
            display: flex;
            gap: 6px;

            .countdown-block {
                display: flex;
                flex-direction: column;
                align-items: center;

                .countdown-num {
                    font-size: 18px;
                    color: #E44096;
                    font-weight: bold;
                }

                .countdown-label {
                    font-size: 10px;
                    color: var(--text-dark-gray);
                }
            }
        }
    }

    .event-info-section {
        margin-top: 16px;
        font-size: 12px;
        color: var(--text-dark-gray);

        .event-info-row {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 10px;

            .info-item {
                display: flex;
                align-items: center;
                gap: 4px;

                .info-icon {
                    color: var(--text-dark-gray);
                }
            }
        }

        .bookmark-icon {
            margin-left: auto;
            width: 18px;
        }

        .leverage-value,
        .return-value {
            color: var(--bg-opposite);
            font-weight: bold;
            margin-left: 4px;
        }
    }
}

// 图表
.chart-section {
    margin-bottom: 30px;

    .chart-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 16px;
    }

    .time-range-selector {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;

        .time-range-btn {
            background: none;
            border: none;
            color: var(--text-dark-gray);
            font-size: 12px;

            &.active {
                color: var(--bg-opposite);
                font-weight: bold;
            }
        }
    }

    .chart-legend {
        display: flex;
        gap: 12px;
        flex-wrap: wrap; // 增加换行支持
        margin-bottom: 10px;

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;

            .legend-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }
        }
    }

    .chart-container {
        position: relative;
        width: 100%;
        height: 240px;
        touch-action: none;

        .chart-canvas {
            width: 100%;
            height: 100%;
        }

        .interaction-layer {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }

        .axis-pointer {
            position: absolute;
            top: 20%;
            bottom: 12%;
            width: 1px;
            background: repeating-linear-gradient(to bottom, var(--text-dark-gray) 0, var(--text-dark-gray) 4px, transparent 4px, transparent 8px);
            transform: translateX(-50%);
        }

        .data-dot {
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid var(--border-color);
            transform: translate(-50%, -50%);
            z-index: 10;
        }

        .custom-tooltip {
            position: absolute;
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 20;

            .tt-row {
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: bold;
                min-width: 100px;
                display: flex;
                justify-content: space-between;
            }
        }
    }
}

// 预测列表
.outcome-prediction-section {
    .section-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 16px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--text-dark-gray);
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color);
    }

    .outcome-row {
        padding: 16px 0;
        border-bottom: 1px solid var(--border-color);

        .outcome-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .outcome-title {
                font-size: 15px;
                font-weight: bold;
            }

            .outcome-volume {
                font-size: 12px;
                color: var(--text-dark-gray);
                margin-top: 4px;
            }

            .outcome-chance {
                font-size: 18px;
                font-weight: 800;
            }
        }

        .outcome-actions {
            display: flex;
            gap: 10px;

            .outcome-btn {
                flex: 1;
                height: 44px;
                border: none;
                border-radius: 8px;
                font-weight: bold;
            }

            .yes-btn {
                background: var(--button-bg-y);
                color: var(--text-color-y);
            }

            .no-btn {
                background: var(--button-bg-n);
                color: var(--text-color-n);
            }
        }
    }
}

// 公共标题
.section-block-title,
.view-results-title {
    font-size: 18px;
    font-weight: bold;
    color: var(--bg-opposite);
    margin: 24px 0 16px;
}

// 折叠
.view-results-section {
    border-bottom: 1px solid var(--border-color);

    .view-results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;

        .view-results-title {
            margin: 20px 0;
        }
    }

    .el-icon {
        color: var(--bg-opposite);
    }

    .view-results-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-top: 1px solid var(--border-color);

        .view-results-desc {
            font-size: 14px;
            margin-bottom: 4px;
        }

        .view-results-volume {
            font-size: 12px;
            color: var(--text-dark-gray);
        }

        .view-results-status {
            font-weight: bold;
        }
    }
}

// 关于
.about-rows {
    .about-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        font-size: 14px;

        .about-left {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--bg-opposite);

            .about-icon {
                color: var(--bg-opposite);
            }
        }

        .about-value {
            color: var(--text-dark-gray);
        }
    }
}

// 规则
.rules-text {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-dark-gray);
    margin-bottom: 30px;
}

// 底部选项卡
.tabs-section {
    .tabs-nav {
        display: flex;
        gap: 24px;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 20px;

        .tab-nav-item {
            background: none;
            border: none;
            padding: 10px 0;
            color: var(--text-dark-gray);
            font-size: 16px;
            font-weight: bold;
            position: relative;

            &.active {
                color: var(--bg-opposite);

                &::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--bg-opposite);
                }
            }
        }
    }

    .tab-pane {
        padding-bottom: 40px;
    }

    .comment-item {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
        }

        .comment-main {
            flex: 1;

            .comment-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;

                .user-name {
                    font-size: 13px;
                    font-weight: bold;
                }

                .comment-tag {
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 4px;

                    &.yes {
                        background: var(--button-bg-y);
                        color: var(--text-color-y);
                    }

                    &.no {
                        background: var(--button-bg-n);
                        color: var(--text-color-n);
                    }
                }

                .comment-time {
                    color: var(--text-dark-gray);
                    font-size: 11px;
                    margin-left: auto;
                }
            }

            .comment-msg {
                font-size: 14px;
                line-height: 1.4;
            }

            .comment-actions {
                color: var(--text-dark-gray);
                font-size: 12px;
                margin-top: 8px;

                .likes {
                    display: flex;
                    align-items: center;
                    gap: 4px;

                    .el-icon {
                        font-size: 14px;
                        color: var(--text-dark-gray);
                    }

                }
            }
        }
    }

    .holds-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;

        .hold-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
        }

        .holder-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;

            .avatar-wrap {
                position: relative;

                img {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                }

                .rank-badge {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    font-size: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #000;
                    border: 1px solid var(--border-color);
                }
            }

            .holder-info {
                .name {
                    font-size: 12px;
                    color: var(--text-dark-gray);
                }

                .amount {
                    font-size: 12px;
                    font-weight: bold;

                    &.yes {
                        color: var(--text-color-y);
                    }

                    &.no {
                        color: var(--text-color-n);
                    }
                }
            }
        }
    }

    .activity-item {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
        }

        .activity-info {
            .user-name {
                font-size: 13px;
                font-weight: bold;
            }

            .act-desc {
                font-size: 13px;
                margin-top: 4px;

                .highlight {
                    font-weight: bold;

                    &.yes {
                        color: var(--text-color-y);
                    }

                    &.no {
                        color: var(--text-color-n);
                    }
                }
            }

            .act-time {
                font-size: 11px;
                color: #555;
                margin-top: 4px;
            }
        }
    }
}

// 动画
.view-results-collapse-enter-active,
.view-results-collapse-leave-active {
    transition: all 0.3s ease;
    max-height: 500px;
    overflow: hidden;
}

.view-results-collapse-enter-from,
.view-results-collapse-leave-to {
    max-height: 0;
    opacity: 0;
}
</style>