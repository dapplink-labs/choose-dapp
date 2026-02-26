<template>
    <div class="detail-h5-page">
        <NavBar2 />
        <!-- 主要内容 -->
        <div class="content">
            <!-- 事件标题和基本信息 -->
            <div class="event-header">
                <div class="event-title-section">
                    <img :src="detailData.avatar" :alt="$t('detail.avatar')" class="event-avatar" />
                    <h1 class="event-title">{{ detailData.title }}</h1>
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
                <div class="event-info-section">
                    <!-- 第一行：交易量、截止日期、书签 -->
                    <div class="event-info-row event-info-row-top">
                        <div class="info-item">
                            <el-icon class="info-icon trophy-icon">
                                <Trophy />
                            </el-icon>
                            <span class="info-text">{{ detailData.volume }}</span>
                        </div>
                        <div class="info-item">
                            <el-icon class="info-icon clock-icon">
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
                    <!-- 第二行：最大杠杆、最大回报 -->
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

            <!-- 图表区域 -->
            <div class="chart-section">
                <div class="chart-title">{{ $t('detail.popularity') }}</div>

                <!-- 时间范围选择器 -->
                <div class="time-range-selector">
                    <div v-for="range in timeRanges" :key="range.value" class="time-range-btn"
                        :class="{ active: selectedTimeRange === range.value }"
                        @click="handleTimeRangeChange(range.value)">
                        {{ range.label }}
                    </div>
                </div>

                <!-- 图表图例 -->
                <div class="chart-legend">
                    <div v-for="(option, index) in chartOptions" :key="index" class="legend-item">
                        <span class="legend-dot" :class="index === 0 ? 'green' : 'pink'"></span>
                        <span class="legend-text">{{ option.label }} {{ option.percentage }}%</span>
                    </div>
                </div>

                <!-- 图表容器 -->
                <div class="chart-container">
                    <div ref="chartRef" class="chart-canvas" />
                    <!-- 绿色线浮动信息框 -->
                    <div v-if="showGreenBubble" class="info-popover green-bubble" :style="greenBubbleStyle">
                        <div class="info-price">{{ chartOptions[0].label }} {{ greenPrice.toFixed(1) }}%</div>
                    </div>
                    <!-- 粉色线浮动信息框 -->
                    <div v-if="showPinkBubble" class="info-popover pink-bubble" :style="pinkBubbleStyle">
                        <div class="info-price">{{ chartOptions[1].label }} {{ pinkPrice.toFixed(1) }}%</div>
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

            <!-- 结果预测模块 -->
            <div class="outcome-prediction-section">
                <div class="section-title">{{ $t('detail.whatDoYouPredict') }}</div>
                <div class="section-header">
                    <div class="header-label outcome-label">{{ $t('detail.outcome') }}</div>
                    <div class="header-label chance-label">{{ $t('detail.chance') }}</div>
                    <div class="header-label actions-label"></div>
                </div>

                <div class="outcome-list">
                    <div v-for="(outcome, index) in outcomes" :key="index" class="outcome-row">
                        <div class="outcome-content" @click="openPredictionDetailH5(outcome)">
                            <div class="outcome-left">
                                <div class="outcome-title">{{ outcome.title }}</div>
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

            <!-- 查看结果模块 -->
            <div class="view-results-section">
                <div class="view-results-header">
                    <h3 class="view-results-title">{{ $t('detail.viewResults') }}</h3>
                    <span class="view-results-caret" @click="showViewResultsExpanded = !showViewResultsExpanded">
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
                                $t('detail.resultNo') }}</span>
                        </div>
                    </div>
                </transition>
            </div>

            <!-- 关于模块 -->
            <div class="about-section">
                <h3 class="about-title">{{ $t('detail.about') }}</h3>
                <div class="about-rows">
                    <div class="about-row">
                        <div class="about-left">
                            <span class="about-icon about-icon-volume">
                                <svg class="icon" viewBox="0 0 1024 1024" version="1.1"
                                    xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                    <path
                                        d="M246.471 843.016c42.934 0 611.339-0.027 654.282 0 17.869 0 25.146 7.283 25.146 25.049 0 11.431 0.074 22.86-0.018 34.292-0.127 13.875-8.199 22.29-21.989 22.319-88.059 0.085-701.571 0.085-789.622 0-13.617-0.025-21.538-8.044-21.806-21.865-0.241-12.395-0.171-24.818-0.027-37.22 0.171-14.813 7.903-22.518 22.83-22.544 43.73-0.086 87.462-0.029 131.201-0.029v0z"
                                        fill="currentColor" />
                                    <path
                                        d="M152.764 628.864c0-28.132-0.085-114.977 0-143.111 0.081-23.847 11.021-34.747 34.767-34.805 17.239-0.045 34.474-0.124 51.712 0.037 20.761 0.19 32.491 11.854 32.528 32.782 0.164 57.698 0.123 174.105 0.039 231.81-0.081 21.278-12.016 33.063-33.19 33.185-17.771 0.108-35.589 0.131-53.411 0-20.26-0.164-32.195-11.745-32.359-32.048-0.29-29.299-0.081-58.576-0.081-87.846v0z"
                                        fill="currentColor" />
                                    <path
                                        d="M449.223 581.8c0-42.811 0-231.937 0.039-274.753 0-24.080 11.283-35.381 35.301-35.444 17.255-0.037 34.513-0.142 51.727 0.023 20.287 0.206 32.526 11.799 32.607 32.083 0.206 88.214 0.206 322.748 0 410.978-0.039 20.596-12.485 32.423-33.142 32.566-16.637 0.131-33.31 0.023-49.988 0.023-25.102-0.023-36.502-11.287-36.502-36.132-0.045-43.122-0.045-86.223-0.045-129.347v0z"
                                        fill="currentColor" />
                                    <path
                                        d="M866.475 523.858c0 62.559 0.045 125.133 0 187.703 0 26.038-10.606 36.645-36.498 36.645-16.654 0-33.308 0.098-49.961-0.023-20.218-0.183-32.48-11.95-32.522-32.041-0.124-128.302-0.124-463.469 0-591.767 0.039-19.843 11.724-31.381 31.858-31.774 18.066-0.351 36.169-0.251 54.231-0.039 21.585 0.251 32.809 11.518 32.851 33.263 0.127 63.715 0.045 334.303 0.045 398.033v0z"
                                        fill="currentColor" />
                                </svg>
                            </span>
                            <span class="about-label">{{ $t('detail.volume') }}</span>
                        </div>
                        <span class="about-value">{{ detailData.volume }}</span>
                    </div>
                    <div class="about-row">
                        <div class="about-left">
                            <el-icon class="about-icon">
                                <Clock />
                            </el-icon>
                            <span class="about-label">{{ $t('detail.endDate') }}</span>
                        </div>
                        <span class="about-value">{{ detailData.closeDate }}</span>
                    </div>
                    <div class="about-row">
                        <div class="about-left">
                            <span class="about-icon about-icon-calendar">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                                        fill="currentColor" />
                                </svg>
                            </span>
                            <span class="about-label">{{ $t('detail.createDate') }}</span>
                        </div>
                        <span class="about-value">{{ detailData.createDate }}</span>
                    </div>
                </div>
            </div>

            <!-- 规则模块 -->
            <div class="rules-section">
                <h3 class="rules-title">{{ $t('detail.rules') }}</h3>
                <p class="rules-text">{{ rulesText }}</p>
            </div>

            <!-- 标签页列表 -->
            <div class="tabs-section">
                <div class="tabs-nav">
                    <button class="tab-nav-item" :class="{ active: activeListTab === 'comments' }"
                        @click="activeListTab = 'comments'">
                        {{ $t('detail.comments') }}
                    </button>
                    <button class="tab-nav-item" :class="{ active: activeListTab === 'holds' }"
                        @click="activeListTab = 'holds'">
                        {{ $t('detail.holds') }}
                    </button>
                    <button class="tab-nav-item" :class="{ active: activeListTab === 'activity' }"
                        @click="activeListTab = 'activity'">
                        {{ $t('detail.activity') }}
                    </button>
                </div>

                <!-- Comments 标签页 -->
                <div v-show="activeListTab === 'comments'" class="tab-content comments-content">
                    <div v-for="(comment, index) in comments" :key="index" class="comment-item">
                        <img :src="comment.avatar" :alt="comment.name" class="comment-avatar" />
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-name">{{ comment.name }}</span>
                                <span class="comment-tag"
                                    :class="comment.tagType === 'green' ? 'tag-green' : 'tag-pink'">
                                    {{ comment.tagText }}
                                </span>
                                <span class="comment-time">{{ comment.time }}</span>
                            </div>
                            <p class="comment-message">{{ comment.message }}</p>
                            <div class="comment-engagement">
                                <svg t="1766721773475" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                    xmlns="http://www.w3.org/2000/svg" p-id="1611" width="16" height="16">
                                    <path
                                        d="M923.5 411.2c-28.6-33.9-72.1-53-116.4-51.1h-68c6.4-31.6 10.1-63.9 11.2-96v-0.8c-0.5-60.9-18.7-112-51.2-144-22.6-22.2-50.8-33.7-81.5-33.3-38.3 0-69.1 11.5-91.7 34.2-26.5 26.5-39.9 66.8-39.8 119.6 0.1 40.1-19.4 83.4-52.1 115.9-32 31.8-71.7 49.3-111.8 49.3H295.6c-3 0-6 0.3-8.9 0.8v-1.2H140.8c-39.7 0-72.2 32.5-72.2 72.2v392.9c0 39.7 32.5 72.2 72.2 72.2h146.8v-0.6c2.9 0.4 5.9 0.7 8.9 0.7h464.7c33.3-0.8 65.6-13 91.1-34.4s43.1-51.1 49.6-83.8l52.3-289.1c9.4-43.4-2.1-89.6-30.7-123.5zM147.7 843.7v-344c0-9 7.3-16.3 16.3-16.3h70.4V860H164c-9 0-16.3-7.3-16.3-16.3z m726.4-324.9l-0.2 0.6-51.7 290.3c-6.7 29.1-32.3 50.2-62.2 51.3l-4.9 0.2-0.4 0.3h-440V486h7.3c61.4 0 121-25.7 168.1-72.4 48.6-48.2 76.5-111.7 76.5-174.2-0.1-31.5 4.9-51.8 15.3-62.2 7.4-7.4 18.7-10.8 35.8-10.8h0.2c9-0.1 17.4 3.6 24.9 11 16.3 16.2 25.7 47.3 25.8 85.4-1.2 41.8-7.9 83.3-19.9 123.4l-21.6 54.3h181.5c20.1-1.3 39.7 7.2 52.6 22.6 12.9 15.3 17.7 36.2 12.9 55.7z"
                                        p-id="1612" fill="currentColor"></path>
                                </svg>
                                <span>{{ comment.likes }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Holds 标签页 -->
                <div v-show="activeListTab === 'holds'" class="tab-content holds-content">
                    <div class="holds-columns">
                        <div class="holds-column">
                            <h4 class="holds-title">{{ $t('detail.yesHolders') }}</h4>
                            <div v-for="(holder, index) in yesHolders" :key="index" class="holder-item">
                                <div class="holder-avatar-wrapper">
                                    <img :src="holder.avatar" :alt="holder.name" class="holder-avatar" />
                                    <span class="holder-badge" :style="{ backgroundColor: holder.badgeColor }">
                                        {{ holder.rank }}
                                    </span>
                                </div>
                                <div class="holder-info">
                                    <span class="holder-name">{{ holder.name }}</span>
                                    <span class="holder-amount yes-amount">{{ holder.amount }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="holds-column">
                            <h4 class="holds-title">{{ $t('detail.noHolders') }}</h4>
                            <div v-for="(holder, index) in noHolders" :key="index" class="holder-item">
                                <div class="holder-avatar-wrapper">
                                    <img :src="holder.avatar" :alt="holder.name" class="holder-avatar" />
                                    <span class="holder-badge" :style="{ backgroundColor: holder.badgeColor }">
                                        {{ holder.rank }}
                                    </span>
                                </div>
                                <div class="holder-info">
                                    <span class="holder-name">{{ holder.name }}</span>
                                    <span class="holder-amount no-amount">{{ holder.amount }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Activity 标签页 -->
                <div v-show="activeListTab === 'activity'" class="tab-content activity-content">
                    <div v-for="(activity, index) in activities" :key="index" class="activity-item">
                        <img :src="activity.avatar" :alt="activity.name" class="activity-avatar" />
                        <div class="activity-content-wrapper">
                            <div class="activity-header">
                                <span class="activity-name">{{ activity.name }}</span>
                            </div>
                            <div class="activity-action">
                                {{ $t('detail.bought') }} <span class="activity-bps"
                                    :class="activity.bpsType === 'green' ? 'bps-green' : 'bps-pink'">{{ activity.bps
                                    }}</span> – {{ activity.amount }}
                            </div>
                            <span class="activity-time">{{ activity.time }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payment 弹窗 -->
            <PaymentModal v-model="showPayment" />

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Trophy, Clock, ArrowUpBold } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import PaymentModal from '@/components/PaymentModal.vue'
import NavBar2 from '@/components/navBar2.vue'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const { t } = useI18n()
const themeStore = useThemeStore()

// 详情数据
const detailData = ref({
    id: 1,
    avatar: 'https://picsum.photos/seed/powell/60/60',
    title: 'U.S. forces seize anotherVenezuela- linked oil ship by...?',
    volume: '$153,642,644 Vol.',
    closeDate: 'Dec 10, 2025',
    createDate: 'Jan 1, 2026, 23:22 UTC+8',
    predictionDate: '11月14日',
    daysLeft: 44,
    maxLeverage: '10X',
    maxReturn: '182%'
})

// 倒计时：时/分/秒（使用传入时间戳）
const countdown = ref({ hours: 0, minutes: 0, seconds: 0 })
let countdownTimer = null
const countdownTarget = ref(1770178797000)

const countdownDisplay = computed(() => ({
    hours: String(countdown.value.hours).padStart(2, '0'),
    minutes: String(countdown.value.minutes).padStart(2, '0'),
    seconds: String(countdown.value.seconds).padStart(2, '0')
}))

function updateCountdown() {
    const end = Number(countdownTarget.value)
    const now = Date.now()
    let diff = Math.max(0, Math.floor((end - now) / 1000))
    if (diff <= 0) {
        countdown.value = { hours: 0, minutes: 0, seconds: 0 }
        if (countdownTimer) clearInterval(countdownTimer)
        return
    }
    const hours = Math.floor(diff / 3600)
    diff -= hours * 3600
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    countdown.value = { hours, minutes, seconds }
}

// 图表选项数据
const chartOptions = ref([
    { label: '下降50个基点以上', percentage: 95.4, color: '#D4FF00', yesPrice: '0.8', noPrice: '99.4' },
    { label: '下降25个基点', percentage: 4.6, color: '#E44096', yesPrice: '0.8', noPrice: '99.4' }
])

// 时间范围选项
const timeRanges = computed(() => [
    { label: '1H', value: '1H' },
    { label: '6H', value: '6H' },
    { label: t('detail.timeRanges.1D') || '1D', value: '1D' },
    { label: t('detail.timeRanges.1W') || '1W', value: '1W' },
    { label: t('detail.timeRanges.1M') || '1M', value: '1M' },
    { label: t('common.all') || 'ALL', value: 'ALL' }
])

const selectedTimeRange = ref('1W')

// 选中的Y轴值
const selectedYValue = ref(20)

// 结果预测数据
const outcomes = ref([
    {
        title: '50+ bps decrease',
        volume: '$37,755,917 Vol.',
        chance: 92.5,
        yesPrice: '98.7',
        noPrice: '98.7',
        selected: null
    },
    {
        title: '50+ bps decrease',
        volume: '$37,755,917 Vol.',
        chance: 7.01,
        yesPrice: '98.7',
        noPrice: '98.7',
        selected: null
    },
    {
        title: '50+ bps decrease',
        volume: '$37,755,917 Vol.',
        chance: 1.68,
        yesPrice: '98.7',
        noPrice: '98.7',
        selected: null
    },
    {
        title: '50+ bps decrease',
        volume: '$37,755,917 Vol.',
        chance: 0.24,
        yesPrice: '98.7',
        noPrice: '98.7',
        selected: null
    }
])

// 查看结果模块（可折叠）
const showViewResultsExpanded = ref(true)
const viewResults = ref([
    { title: '下降50个基点以上', volume: '$37,755,917 Vol.', result: 'no' },
    { title: '下降25个基点', volume: '$37,755,917 Vol.', result: 'yes' }
])

// 规则相关
const rulesText = ref('The FED interest rates are defined in this market by the upper bound of the target federal funds range. The decisions on the target')

// 标签页相关
const activeListTab = ref('comments')

// Payment 弹窗相关
const showPayment = ref(false)
const selectedOutcomeIndex = ref(null)
const selectedOutcomeType = ref(null) // 'yes' or 'no'

// 监听弹窗状态，控制父级页面滚动
watch(showPayment, (newVal) => {
    if (newVal) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
        selectedOutcomeIndex.value = null
        selectedOutcomeType.value = null
    }
})

// 倒计时：挂载时启动、卸载时清除
onMounted(() => {
    updateCountdown()
    countdownTimer = setInterval(updateCountdown, 1000)
    nextTick(() => {
        initChart()
        window.addEventListener('resize', () => chartInstance?.resize())
    })
})
onUnmounted(() => {
    document.body.style.overflow = ''
    if (countdownTimer) clearInterval(countdownTimer)
    if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
    }
    // 移除图表触摸事件监听
    if (chartRef.value) {
        chartRef.value.removeEventListener('touchstart', handleChartTouchStart)
        chartRef.value.removeEventListener('touchmove', handleChartTouchMove)
        chartRef.value.removeEventListener('touchend', handleChartTouchEnd)
    }
})

// Comments 数据
const comments = ref([
    {
        name: 'Roger Watkins',
        avatar: 'https://picsum.photos/seed/roger/40/40',
        tagText: '302.5K 50+ bps decrease',
        tagType: 'green', // 使用绿色方案
        time: '6d ago',
        message: "Thanks for your feedback. We're reviewing it now",
        likes: 888
    },
    {
        name: 'Jacob Vargas',
        avatar: 'https://picsum.photos/seed/jacob/40/40',
        tagText: '30.5K 50+ bps decrease',
        tagType: 'pink', // 使用粉色方案
        time: '11/21',
        message: "Thanks for your feedback. We're reviewing it now",
        likes: 888
    },
    {
        name: 'Rebecca Lynch',
        avatar: 'https://picsum.photos/seed/rebecca/40/40',
        tagText: '302.5K 50+ bps decrease',
        tagType: 'green', // 使用绿色方案
        time: '11/20',
        message: "Thanks for your feedback. We're reviewing it now",
        likes: 888
    }
])

// Holds 数据
const yesHolders = ref([
    { name: 'Jerry Stanley', avatar: 'https://picsum.photos/seed/jerry/40/40', rank: 1, badgeColor: '#FFD700', amount: '$19,253.52' },
    { name: 'Jasmine Banks', avatar: 'https://picsum.photos/seed/jasmine/40/40', rank: 2, badgeColor: '#25A750', amount: '$19,253.52' },
    { name: 'Kevin Barnett', avatar: 'https://picsum.photos/seed/kevin/40/40', rank: 3, badgeColor: '#3B82F6', amount: '$19,253.52' },
    { name: 'Rebecca Garrett', avatar: 'https://picsum.photos/seed/rebecca2/40/40', rank: 4, badgeColor: '#FFFFFF', amount: '$19,253.52' },
    { name: 'Benjamin Roberts', avatar: 'https://picsum.photos/seed/benjamin/40/40', rank: 5, badgeColor: '#25A750', amount: '$19,253.52' },
    { name: 'Ruth Hart', avatar: 'https://picsum.photos/seed/ruth/40/40', rank: 6, badgeColor: '#25A750', amount: '$19,253.52' }
])

const noHolders = ref([
    { name: 'Patricia Fuller', avatar: 'https://picsum.photos/seed/patricia/40/40', rank: 1, badgeColor: '#FFD700', amount: '$19,253.52' },
    { name: 'Beverly Gilbert', avatar: 'https://picsum.photos/seed/beverly/40/40', rank: 2, badgeColor: '#25A750', amount: '$19,253.52' },
    { name: 'Ronald Gomez', avatar: 'https://picsum.photos/seed/ronald/40/40', rank: 3, badgeColor: '#3B82F6', amount: '$19,253.52' },
    { name: 'Terry Ramirez', avatar: 'https://picsum.photos/seed/terry/40/40', rank: 4, badgeColor: '#FFFFFF', amount: '$19,253.52' },
    { name: 'Alan Wood', avatar: 'https://picsum.photos/seed/alan/40/40', rank: 5, badgeColor: '#25A750', amount: '$19,253.52' },
    { name: 'Danielle Lee', avatar: 'https://picsum.photos/seed/danielle/40/40', rank: 6, badgeColor: '#25A750', amount: '$19,253.52' }
])

// Activity 数据
const activities = ref([
    {
        name: 'Jerry McCoy',
        avatar: 'https://picsum.photos/seed/jerry2/40/40',
        bps: '50+ bps decrease',
        bpsType: 'green', // 使用绿色方案
        amount: '$10.00',
        time: '6d ago'
    },
    {
        name: 'Steve Barnett',
        avatar: 'https://picsum.photos/seed/steve/40/40',
        bps: '25+ bps decrease',
        bpsType: 'pink', // 使用粉色方案
        amount: '$1000.00',
        time: '6d ago'
    },
    {
        name: 'Bruce Cooper',
        avatar: 'https://picsum.photos/seed/bruce/40/40',
        bps: '50+ bps decrease',
        bpsType: 'green', // 使用绿色方案
        amount: '$332.00',
        time: '6d ago'
    },
    {
        name: 'Richard Carpenter',
        avatar: 'https://picsum.photos/seed/richard/40/40',
        bps: '50+ bps decrease',
        bpsType: 'green', // 使用绿色方案
        amount: '$90.00',
        time: '6d ago'
    },
    {
        name: 'Sandra Boyd',
        avatar: 'https://picsum.photos/seed/sandra/40/40',
        bps: '25+ bps decrease',
        bpsType: 'pink', // 使用粉色方案
        amount: '$50.00',
        time: '6d ago'
    }
])

// 时间范围对应的数据点数配置
const rangePointsMap = {
    '1H': 24,
    '6H': 24,
    '1D': 24,
    '1W': 30,
    '1M': 30,
    'ALL': 90  // 最近三个月，每天一个数据点（约90天）
}

// 生成图表数据函数（根据时间范围）
const generateChartDataForRange = (range) => {
    // 对于所有范围，都显示最近三个月的数据
    const points = rangePointsMap[range] || 90
    return generateChartData(points, range)
}

// 获取最近三个月的月份名称（10月、11月、12月）
const getRecentMonths = () => {
    return ['10月', '11月', '12月']
}

// 生成图表数据（根据图片描述的数据趋势：1月、3月、5月）
function generateChartData(points, range) {
    const orangeData = []  // 绿色线 - 高位数据 (90-100%)
    const blueData = []    // 粉色线 - 低位数据 (0-10%)

    // 确保数据点数量足够
    const actualPoints = Math.max(points, 30)

    for (let i = 0; i < actualPoints; i++) {
        const progress = i / (actualPoints - 1)
        const dayIndex = i

        const randomNoise = () => (Math.random() - 0.5) * 3
        const dailyVariation = Math.sin(dayIndex * 0.2) * 3
        const weeklyVariation = Math.sin(dayIndex * 0.05) * 5

        // 绿色线：在 70-100% 之间大幅波动
        let greenValue
        if (progress < 0.2) {
            greenValue = 70 + Math.sin(progress * Math.PI * 3) * 10
        } else if (progress < 0.4) {
            greenValue = 80 + Math.sin((progress - 0.2) * Math.PI * 4) * 15
        } else if (progress < 0.6) {
            greenValue = 85 - Math.sin((progress - 0.4) * Math.PI * 5) * 35
        } else if (progress < 0.8) {
            greenValue = 50 + Math.sin((progress - 0.6) * Math.PI * 4) * 20
        } else {
            greenValue = 70 + (progress - 0.8) * 150  // 快速上升到100%
        }
        greenValue += dailyVariation + weeklyVariation + randomNoise()
        orangeData.push(Math.max(10, Math.min(100, greenValue)))

        // 粉色线：在 0-30% 之间波动
        let pinkValue
        if (progress < 0.3) {
            pinkValue = 25 + Math.sin(progress * Math.PI * 4) * 8
        } else if (progress < 0.6) {
            pinkValue = 30 - Math.sin((progress - 0.3) * Math.PI * 5) * 20
        } else if (progress < 0.8) {
            pinkValue = 10 + Math.sin((progress - 0.6) * Math.PI * 3) * 15
        } else {
            pinkValue = 25 - (progress - 0.8) * 100  // 下降到接近0%
        }
        pinkValue += dailyVariation * 0.5 + weeklyVariation * 0.3 + randomNoise() * 0.5
        blueData.push(Math.max(0, Math.min(35, pinkValue)))
    }

    // 强制端点值
    if (orangeData.length > 0) {
        orangeData[0] = 70
        orangeData[orangeData.length - 1] = 98
    }
    if (blueData.length > 0) {
        blueData[0] = 25
        blueData[blueData.length - 1] = 5
    }

    return {
        orange: orangeData,
        green: [],
        blue: blueData,
        xAxis: Array.from({ length: orangeData.length }, (_, i) => i)
    }
}

// 图表数据（模拟数据）
const chartData = computed(() => {
    return {
        '1H': generateChartDataForRange('1H'),
        '6H': generateChartDataForRange('6H'),
        '1D': generateChartDataForRange('1D'),
        '1W': generateChartDataForRange('1W'),
        '1M': generateChartDataForRange('1M'),
        'ALL': generateChartDataForRange('ALL')
    }
})

// ECharts 相关
const chartRef = ref(null)
let chartInstance = null
const greenHandleIndex = ref(0)
const pinkHandleIndex = ref(0)
const greenPrice = ref(95.4)
const pinkPrice = ref(4.6)
const showGreenBubble = ref(false)
const showPinkBubble = ref(false)
const greenBubbleStyle = ref({ display: 'none' })
const pinkBubbleStyle = ref({ display: 'none' })

// 图表颜色配置
const chartColors = computed(() => ({
    green: themeStore.isDark ? '#D4FF00' : '#19d96b',
    greenLight: themeStore.isDark ? 'rgba(212, 255, 0, 0.15)' : 'rgba(25, 217, 107, 0.15)',
    greenGradient: themeStore.isDark ? 'rgba(212, 255, 0, 0.2)' : 'rgba(25, 217, 107, 0.2)',
    greenStroke: themeStore.isDark ? 'rgba(212, 255, 0, 0.3)' : 'rgba(25, 217, 107, 0.3)',
    pink: '#E44096',
    pinkLight: 'rgba(228, 64, 150, 0.15)',
    pinkGradient: 'rgba(228, 64, 150, 0.2)',
    pinkStroke: 'rgba(228, 64, 150, 0.3)',
    axisLabel: themeStore.isDark ? '#7C7C7C' : '#888',
    splitLine: themeStore.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
}))

const updateChart = () => {
    if (!chartInstance) return

    const current = chartData.value[selectedTimeRange.value] || chartData.value['1W']
    const greenData = current?.orange || []  // 使用orange作为绿色线数据
    const pinkData = current?.blue || []     // 使用blue作为粉色线数据
    const xAxisLabels = current?.xAxis || []
    const colors = chartColors.value

    // 初始化handleIndex
    if (greenHandleIndex.value === 0 || greenHandleIndex.value >= greenData.length) {
        greenHandleIndex.value = greenData.length - 1
    }
    if (pinkHandleIndex.value === 0 || pinkHandleIndex.value >= pinkData.length) {
        pinkHandleIndex.value = greenData.length - 1
    }

    greenPrice.value = greenData[greenHandleIndex.value] ?? 95.4
    pinkPrice.value = pinkData[pinkHandleIndex.value] ?? 4.6

    const option = {
        backgroundColor: 'transparent',
        grid: {
            left: '10%',
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
                    if (index === 0) return '1月'
                    if (index === Math.floor(total / 2)) return '3月'
                    if (index === total - 1) return '5月'
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
            // 绿色线背景
            {
                name: 'GreenBg',
                type: 'line',
                data: greenData,
                smooth: 0.4,
                symbol: 'none',
                lineStyle: { width: 2.5, color: colors.greenLight }
            },
            // 绿色线进度
            {
                name: 'GreenProgress',
                type: 'line',
                data: greenData.slice(0, greenHandleIndex.value + 1),
                smooth: 0.4,
                symbol: 'none',
                lineStyle: { width: 2.5, color: colors.green }
            },
            // 粉色线背景
            {
                name: 'PinkBg',
                type: 'line',
                data: pinkData,
                smooth: 0.4,
                symbol: 'none',
                lineStyle: { width: 2.5, color: colors.pinkLight }
            },
            // 粉色线进度
            {
                name: 'PinkProgress',
                type: 'line',
                data: pinkData.slice(0, pinkHandleIndex.value + 1),
                smooth: 0.4,
                symbol: 'none',
                lineStyle: { width: 2.5, color: colors.pink }
            }
        ]
    }

    chartInstance.setOption(option)

    // 绘制可拖拽圆点
    setTimeout(() => {
        if (!chartInstance) return

        const greenX = chartInstance.convertToPixel({ xAxisIndex: 0 }, greenHandleIndex.value)
        const greenY = chartInstance.convertToPixel({ yAxisIndex: 0 }, greenData[greenHandleIndex.value])
        const pinkX = chartInstance.convertToPixel({ xAxisIndex: 0 }, pinkHandleIndex.value)
        const pinkY = chartInstance.convertToPixel({ yAxisIndex: 0 }, pinkData[pinkHandleIndex.value])

        chartInstance.setOption({
            graphic: [
                {
                    type: 'circle',
                    id: 'greenHandle',
                    x: greenX,
                    y: greenY,
                    shape: { r: 8 },
                    style: { fill: colors.green, stroke: colors.greenStroke, lineWidth: 12 },
                    draggable: true,
                    z: 100,
                    onmousedown: function () {
                        showGreenBubble.value = true
                        const snappedX = chartInstance.convertToPixel({ xAxisIndex: 0 }, greenHandleIndex.value)
                        const snappedY = chartInstance.convertToPixel({ yAxisIndex: 0 }, greenData[greenHandleIndex.value])
                        updateGreenBubblePos(snappedX, snappedY)
                    },
                    onmouseup: function () {
                        showGreenBubble.value = false
                    },
                    ondragend: function () {
                        showGreenBubble.value = false
                    },
                    ondrag: function () {
                        showGreenBubble.value = true
                        const dataPos = chartInstance.convertFromPixel({ xAxisIndex: 0 }, this.x)
                        let idx = Math.round(Number(dataPos))
                        idx = Math.max(0, Math.min(greenData.length - 1, idx))

                        const snappedX = chartInstance.convertToPixel({ xAxisIndex: 0 }, idx)
                        const snappedY = chartInstance.convertToPixel({ yAxisIndex: 0 }, greenData[idx])

                        this.setPosition([snappedX, snappedY])

                        greenHandleIndex.value = idx
                        greenPrice.value = greenData[idx]
                        updateGreenBubblePos(snappedX, snappedY)

                        chartInstance.setOption({
                            series: [
                                {},
                                { data: greenData.slice(0, idx + 1) },
                                {},
                                {}
                            ]
                        }, false)
                    }
                },
                {
                    type: 'circle',
                    id: 'pinkHandle',
                    x: pinkX,
                    y: pinkY,
                    shape: { r: 8 },
                    style: { fill: colors.pink, stroke: colors.pinkStroke, lineWidth: 12 },
                    draggable: true,
                    z: 100,
                    onmousedown: function () {
                        showPinkBubble.value = true
                        const snappedX = chartInstance.convertToPixel({ xAxisIndex: 0 }, pinkHandleIndex.value)
                        const snappedY = chartInstance.convertToPixel({ yAxisIndex: 0 }, pinkData[pinkHandleIndex.value])
                        updatePinkBubblePos(snappedX, snappedY)
                    },
                    onmouseup: function () {
                        showPinkBubble.value = false
                    },
                    ondragend: function () {
                        showPinkBubble.value = false
                    },
                    ondrag: function () {
                        showPinkBubble.value = true
                        const dataPos = chartInstance.convertFromPixel({ xAxisIndex: 0 }, this.x)
                        let idx = Math.round(Number(dataPos))
                        idx = Math.max(0, Math.min(pinkData.length - 1, idx))

                        const snappedX = chartInstance.convertToPixel({ xAxisIndex: 0 }, idx)
                        const snappedY = chartInstance.convertToPixel({ yAxisIndex: 0 }, pinkData[idx])

                        this.setPosition([snappedX, snappedY])

                        pinkHandleIndex.value = idx
                        pinkPrice.value = pinkData[idx]
                        updatePinkBubblePos(snappedX, snappedY)

                        chartInstance.setOption({
                            series: [
                                {},
                                {},
                                {},
                                { data: pinkData.slice(0, idx + 1) }
                            ]
                        }, false)
                    }
                }
            ]
        })
    }, 0)
}

const updateGreenBubblePos = (x, y) => {
    const containerWidth = chartRef.value?.offsetWidth || 300
    const bubbleWidth = 150
    let left = x
    
    // 限制水平位置，确保气泡不超出容器
    const minLeft = bubbleWidth / 2 + 5
    const maxLeft = containerWidth - bubbleWidth / 2 - 5
    left = Math.max(minLeft, Math.min(maxLeft, left))
    
    // 限制垂直位置
    let top = y - 40
    if (top < -30) {
        top = y + 25  // 如果上方空间不足，显示在下方
    }
    
    greenBubbleStyle.value = {
        left: `${left}px`,
        top: `${top}px`,
        transform: 'translateX(-50%)',
        display: 'block'
    }
}

const updatePinkBubblePos = (x, y) => {
    const containerWidth = chartRef.value?.offsetWidth || 300
    const bubbleWidth = 140
    let left = x
    
    // 限制水平位置，确保气泡不超出容器
    const minLeft = bubbleWidth / 2 + 5
    const maxLeft = containerWidth - bubbleWidth / 2 - 5
    left = Math.max(minLeft, Math.min(maxLeft, left))
    
    // 限制垂直位置
    let top = y - 40
    if (top < -30) {
        top = y + 25
    }
    
    pinkBubbleStyle.value = {
        left: `${left}px`,
        top: `${top}px`,
        transform: 'translateX(-50%)',
        display: 'block'
    }
}

const initChart = () => {
    if (!chartRef.value) return
    if (chartInstance) chartInstance.dispose()
    chartInstance = echarts.init(chartRef.value)
    updateChart()
    
    // 图表交互时禁止页面滚动
    const chartDom = chartRef.value
    chartDom.addEventListener('touchstart', handleChartTouchStart, { passive: false })
    chartDom.addEventListener('touchmove', handleChartTouchMove, { passive: false })
    chartDom.addEventListener('touchend', handleChartTouchEnd, { passive: false })
}

// 图表触摸事件处理
let isChartTouching = false

const handleChartTouchStart = (e) => {
    isChartTouching = true
    document.body.style.overflow = 'hidden'
}

const handleChartTouchMove = (e) => {
    if (isChartTouching) {
        e.preventDefault()
    }
}

const handleChartTouchEnd = () => {
    isChartTouching = false
    document.body.style.overflow = ''
}

// 监听主题变化
watch(() => themeStore.isDark, () => {
    updateChart()
})

// 方法
const handleTimeRangeChange = (value) => {
    selectedTimeRange.value = value
    greenHandleIndex.value = 0
    pinkHandleIndex.value = 0
    nextTick(() => updateChart())
}

// 打开预测详情页
const openPredictionDetailH5 = (outcome) => {
    router.push({
        path: '/prediction-detail-h5',
        query: {
            id: outcome.id
        }
    })
}

// 处理Y轴值变化
const handleYValueChange = (value) => {
    selectedYValue.value = value
}

const selectOutcome = (index, choice) => {
    const outcome = outcomes.value[index]
    if (outcome.selected === choice) {
        outcome.selected = null
    } else {
        outcome.selected = choice
        // 打开 Payment 弹窗
        selectedOutcomeIndex.value = index
        selectedOutcomeType.value = choice
        showPayment.value = true
    }
}


const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M'
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K'
    }
    return num.toString()
}

</script>

<style scoped lang="scss">
.detail-h5-page {
    min-height: 100vh;
    background-color: var(--bg-page-h5, #FFFFFF);
    padding-top: 52px;
    padding-bottom: 24px;
    transition: background-color 0.3s ease;
}

// 主要内容
.content {
    padding: 16px;
    padding-bottom: 24px;
}

// 事件标题
.event-header {
    margin-bottom: 20px;
    border-radius: 12px;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .event-title-section {
        display: flex;
        gap: 12px;
        align-items: flex-start;

        .event-avatar {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            object-fit: cover;
            flex-shrink: 0;
        }

        .event-title {
            flex: 1;
            font-family: PingFang SC, PingFang SC;
            font-weight: 600;
            font-size: 16px;
            color: var(--text-color, #000000);
            transition: color 0.3s ease;
            min-width: 0;
        }

        .event-countdown {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }

        .countdown-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 32px;
        }

        .countdown-num {
            font-size: 20px;
            font-weight: 700;
            color: #E44096;
            line-height: 1.2;
            font-variant-numeric: tabular-nums;
        }

        .countdown-label {
            font-size: 11px;
            font-weight: 400;
            color: var(--text-color, #ffffff);
            margin-top: 2px;
            line-height: 1.2;
        }
    }

    .event-info-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .event-info-row {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: var(--text-dark-gray, #AAAAAA);
        transition: color 0.3s ease;

        .info-item {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
            color: var(--text-dark-gray, #AAAAAA);

            .info-icon {
                color: var(--text-dark-gray, #AAAAAA);
                font-size: 14px;
            }

            .info-text {
                font-size: 12px;
                white-space: nowrap;
                color: var(--text-dark-gray, #AAAAAA);
                font-weight: 400;
            }
        }

        .bookmark-icon {
            margin-left: auto;
            display: flex;
            align-items: center;
            cursor: pointer;
            color: var(--text-dark-gray, #AAAAAA);
            transition: color 0.3s ease;
            flex-shrink: 0;

            svg {
                width: 18px;
                height: 18px;
            }

            &:active {
                opacity: 0.6;
            }
        }

        &.event-info-row-top {
            gap: 16px;
        }

        &.event-info-row-bottom {
            gap: 24px;

            .leverage-info,
            .return-info {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                white-space: nowrap;
                flex-shrink: 0;

                .leverage-label,
                .return-label {
                    color: var(--text-dark-gray, #AAAAAA);
                    font-weight: 400;
                }

                .leverage-value,
                .return-value {
                    font-weight: 700;
                    color: #FFFFFF;
                }
            }
        }
    }
}

// 图表区域
.chart-section {
    margin-bottom: 24px;
    border-radius: 12px;
    transition: background-color 0.3s ease;

    .chart-title {
        font-family: Noto Sans SC, Noto Sans SC;
        font-weight: 900;
        font-size: 20px;
        color: var(--el-menu-text-color, #000000);
        margin-bottom: 23px;
        transition: color 0.3s ease;
    }

    // 时间范围选择器
    .time-range-selector {
        display: flex;
        margin-bottom: 12px;
        overflow-x: auto;
        padding-bottom: 4px;

        .time-range-btn {
            margin-right: 16px;
            border: none;
            border-radius: 16px;
            color: var(--text-dark-gray, #999999);
            font-size: 12px;
            transition: all 0.3s ease;

            &.active {
                color: var(--text-color, #000000);
            }
        }
    }

    // 图表图例
    .chart-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 16px;

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;

            .legend-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;

                &.green {
                    background-color: var(--text-color-y);
                }

                &.pink {
                    background-color: #E44096;
                }
            }

            .legend-text {
                font-family: PingFang SC, PingFang SC;
                font-weight: 400;
                font-size: 14px;
                color: var(--text-color, #000000);
                transition: color 0.3s ease;
            }
        }
    }

    // 图表容器
    .chart-container {
        width: 100%;
        background: transparent;
        border-radius: 8px;
        box-sizing: border-box;
        transition: background-color 0.3s ease;
        position: relative;
        overflow: visible;
        margin-top: 50px;
        margin-bottom: 20px;
    }

    .chart-canvas {
        width: 100%;
        height: 220px;
    }

    .info-popover {
        position: absolute;
        padding: 6px 12px;
        border-radius: 6px;
        pointer-events: none;
        z-index: 110;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        text-align: center;
        font-size: 12px;

        &.green-bubble {
            background: var(--text-color-y);
            color: #000;
        }

        &.pink-bubble {
            background: #E44096;
            color: #fff;
        }

        .info-price {
            font-size: 13px;
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

            &::after {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%);
                width: 6px;
                height: 6px;
                border-radius: 50%;
            }
        }
    }

    .green-bubble .info-arrow {
        background: var(--text-color-y);

        &::after {
            background: var(--text-color-y);
        }
    }

    .pink-bubble .info-arrow {
        background: #E44096;

        &::after {
            background: #E44096;
        }
    }

    .price-labels {
        position: absolute;
        left: 8px;
        top: 40%;
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
}

// 结果预测模块
.outcome-prediction-section {
    transition: background-color 0.3s ease;

    .section-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color, #000000);
        margin-bottom: 16px;
        transition: color 0.3s ease;
    }

    .section-header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        transition: border-color 0.3s ease;

        .header-label {
            font-size: 12px;
            font-weight: 400;
            color: var(--text-dark-gray, #909090);
            text-transform: uppercase;
            transition: color 0.3s ease;

            &.chance-label {
                text-align: right;
            }
        }
    }

    .outcome-list {
        display: flex;
        flex-direction: column;
        gap: 0;

        .outcome-row {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 16px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);

            .outcome-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;

                .outcome-left {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;

                    .outcome-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: var(--text-color, #000000);
                        transition: color 0.3s ease;
                    }

                    .outcome-volume {
                        font-size: 12px;
                        color: var(--text-dark-gray, #909090);
                        transition: color 0.3s ease;
                    }
                }

                .outcome-chance {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text-color, #000000);
                    transition: color 0.3s ease;
                    white-space: nowrap;
                    align-self: center;
                }
            }

            .outcome-actions {
                display: flex;
                gap: 8px;
                margin-top: 4px;

                .outcome-btn {
                    flex: 1;
                    padding: 10px 26px;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;

                    &.yes-btn {
                        background: rgba(188, 255, 51, 0.2);
                        color: var(--text-color-y, #2EBE69);
                    }

                    &.no-btn {
                        background: rgba(226, 56, 145, 0.2);
                        color: var(--text-color-n, #E44096);
                    }
                }
            }
        }
    }
}

// 查看结果模块
.view-results-section {
    margin-bottom: 24px;
    padding: 20px 0;
    transition: background-color 0.3s ease;

    .view-results-header {
        display: flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
    }

    .view-results-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--bg-opposite, #000000);
        font-family: sans-serif;
        transition: color 0.3s ease;
    }

    .view-results-caret {
        margin-left: 7px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease, color 0.3s ease;

        .el-icon {
            font-size: 16px;
            color: var(--text-color, #1a1a1a);
        }
    }

    .view-results-list {
        margin-top: 16px;
    }

    .view-results-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);

        &:last-child {
            border-bottom: none;
        }
    }

    .view-results-content {
        flex: 1;
        min-width: 0;
    }

    .view-results-desc {
        font-size: 15px;
        font-weight: 500;
        color: var(--bg-opposite, #000000);
        line-height: 1.4;
        margin-bottom: 4px;
    }

    .view-results-volume {
        font-size: 13px;
        color: var(--text-dark-gray, #909090);
        line-height: 1.4;
    }

    .view-results-status {
        font-size: 15px;
        font-weight: 500;
        color: var(--bg-opposite, #000000);
        flex-shrink: 0;
        line-height: 1.4;
    }
}

.view-results-collapse-enter-active,
.view-results-collapse-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.view-results-collapse-enter-from,
.view-results-collapse-leave-to {
    opacity: 0;
}

// 关于模块
.about-section {
    margin-bottom: 24px;
    padding: 20px 0;
    transition: background-color 0.3s ease;

    .about-title {
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--bg-opposite, #000000);
        font-family: sans-serif;
        transition: color 0.3s ease;
    }

    .about-rows {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .about-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 15px;

        .about-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
            min-width: 0;
        }

        .about-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--bg-opposite, #000000);
            flex-shrink: 0;

            &.about-icon-volume svg,
            &.about-icon-calendar svg {
                width: 20px;
                height: 20px;
            }
        }

        :deep(.el-icon.about-icon) {
            font-size: 20px;
            color: var(--bg-opposite, #000000);
        }

        .about-label {
            color: var(--bg-opposite, #000000);
            font-weight: 400;
        }

        .about-value {
            color: var(--text-dark-gray, #000000);
            font-weight: 400;
            text-align: right;
            white-space: nowrap;
        }
    }
}

// 规则模块
.rules-section {
    margin-bottom: 24px;
    padding: 16px 0;
    transition: background-color 0.3s ease;

    .rules-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-color, #000000);
        margin: 0 0 12px 0;
        font-family: sans-serif;
        transition: color 0.3s ease;
    }

    .rules-text {
        font-size: 14px;
        color: var(--text-dark-gray, #909090);
        line-height: 1.6;
        margin: 0;
        font-family: sans-serif;
        transition: color 0.3s ease;
    }
}

// 标签页列表
.tabs-section {
    margin-top: 24px;
    border-radius: 12px;
    overflow: hidden;

    .tabs-nav {
        display: flex;
        gap: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .tab-nav-item {
            padding: 12px 0 20px;
            background: transparent;
            border: none;
            margin-right: 24px;
            font-family: PingFang SC, PingFang SC;
            font-weight: 600;
            font-size: 16px;
            color: var(--text-dark-gray, #909090);
            line-height: 16px;
            position: relative;
            transition: all 0.3s ease;

            &.active {
                color: var(--text-color, #000000);

                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    height: 2px;
                    width: 80%;
                    background: var(--text-color, #000000);
                }
            }

        }
    }

    .tab-content {
        padding: 16px 0;
    }

    // Comments 标签页
    .comments-content {
        .comment-item {
            display: flex;
            gap: 12px;
            padding: 16px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);

            &:last-child {
                border-bottom: none;
            }

            .comment-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .comment-content {
                flex: 1;
                min-width: 0;

                .comment-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    flex-wrap: wrap;

                    .comment-name {
                        font-size: 14px;
                        font-weight: 500;
                        color: var(--text-dark-gray, #000000);
                    }

                    .comment-tag {
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 500;
                        white-space: nowrap;

                        &.tag-green {
                            background-color: rgba(187, 255, 46, 0.2);
                            color: var(--text-color-y, #BBFF2E);
                        }

                        &.tag-pink {
                            background-color: rgba(228, 64, 150, 0.2);
                            color: rgba(228, 64, 150, 1);
                        }
                    }

                    .comment-time {
                        font-size: 12px;
                        color: var(--text-dark-gray, #909090);
                        margin-left: auto;
                    }
                }

                .comment-message {
                    font-size: 14px;
                    color: var(--text-color, #000000);
                    line-height: 1.5;
                    margin: 0 0 8px 0;
                }

                .comment-engagement {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: var(--text-dark-gray);
                    font-size: 14px;

                    svg {
                        width: 16px;
                        height: 16px;
                    }
                }
            }
        }
    }

    // Holds 标签页
    .holds-content {
        .holds-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;

            .holds-column {
                .holds-title {
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 600;
                    font-size: 16px;
                    color: var(--text-color, #000000);
                    line-height: 16px;
                    margin: 0 0 12px 0;
                }

                .holder-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 0;

                    .holder-avatar-wrapper {
                        position: relative;
                        flex-shrink: 0;

                        .holder-avatar {
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                        }

                        .holder-badge {
                            position: absolute;
                            bottom: -2px;
                            right: -2px;
                            width: 18px;
                            height: 18px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-family: PingFang SC, PingFang SC;
                            font-weight: 600;
                            font-size: 12px;
                            color: #000000;
                            border: 2px solid #000000;
                        }
                    }

                    .holder-info {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        min-width: 0;

                        .holder-name {
                            font-size: 14px;
                            font-weight: 500;
                            color: var(--text-dark-gray, #000000);
                        }

                        .holder-amount {
                            font-size: 14px;
                            font-weight: 600;

                            &.yes-amount {
                                color: #25A750;
                            }

                            &.no-amount {
                                color: #C1272E;
                            }
                        }
                    }
                }
            }
        }
    }

    // Activity 标签页
    .activity-content {
        .activity-item {
            display: flex;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);

            &:last-child {
                border-bottom: none;
            }

            .activity-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .activity-content-wrapper {
                flex: 1;
                min-width: 0;

                .activity-header {
                    margin-bottom: 4px;

                    .activity-name {
                        font-size: 14px;
                        font-weight: 500;
                        color: var(--text-dark-gray, #000000);
                    }
                }

                .activity-action {
                    font-size: 14px;
                    color: var(--text-color, #000000);
                    margin-bottom: 4px;

                    .activity-bps {
                        font-weight: 600;

                        &.bps-green {
                            color: var(--text-color-y, #BBFF2E);
                        }

                        &.bps-pink {
                            color: rgba(228, 64, 150, 1);
                        }
                    }
                }

                .activity-time {
                    font-size: 12px;
                    color: var(--text-dark-gray, #909090);
                }
            }
        }
    }
}

// 主题适配
:deep(.theme-dark) {
    .detail-h5-page {
        background-color: #000000;
    }
}

:deep(.theme-light) {
    .detail-h5-page {
        background-color: #FFFFFF;
    }
}
</style>
