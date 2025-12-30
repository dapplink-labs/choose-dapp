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
                </div>
                <div class="event-info-section">
                    <div class="event-info-row">
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
                        <span class="legend-dot" :style="{ backgroundColor: option.color }"></span>
                        <span class="legend-text">{{ option.label }} {{ option.percentage }}%</span>
                    </div>
                </div>

                <!-- 图表容器 -->
                <div class="chart-container">
                    <LineChartDetail :orange-data="chartData[selectedTimeRange]?.orange || []"
                        :green-data="chartData[selectedTimeRange]?.green || []"
                        :blue-data="chartData[selectedTimeRange]?.blue || []"
                        :x-axis-data="chartData[selectedTimeRange]?.xAxis || []" :selected-y-value="selectedYValue"
                        @y-value-change="handleYValueChange" />
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
                        <div class="outcome-content">
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
            <transition name="slide-up">
                <div v-if="showPayment" class="payment-overlay" @click.self="closePayment">
                    <div class="payment-modal">
                        <div class="payment-header"></div>
                        <Payment />
                    </div>
                </div>
            </transition>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Trophy, Clock } from '@element-plus/icons-vue'
import LineChartDetail from '@/components/LineChartDetail.vue'
import Payment from '@/components/Payment.vue'
import NavBar2 from '@/components/navBar2.vue'

const router = useRouter()
const { t } = useI18n()

// 详情数据
const detailData = ref({
    id: 1,
    avatar: 'https://picsum.photos/seed/powell/60/60',
    title: 'U.S. forces seize anotherVenezuela- linked oil ship by...?',
    volume: '$153,642,644 Vol.',
    closeDate: 'Dec 10, 2025',
    predictionDate: '11月14日',
    daysLeft: 44,
    maxLeverage: '10X',
    maxReturn: '182%'
})

// 图表选项数据
const chartOptions = ref([
    { label: 'November 12-15', percentage: 13, color: '#FF9500', yesPrice: '0.8', noPrice: '99.4' },
    { label: 'November 16+', percentage: 51, color: '#25A750', yesPrice: '0.8', noPrice: '99.4' },
    { label: 'November 8-11', percentage: 8, color: '#3B82F6', yesPrice: '0.8', noPrice: '99.4' }
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
        // 打开弹窗时禁止父级页面滚动
        document.body.style.overflow = 'hidden'
    } else {
        // 关闭弹窗时恢复父级页面滚动
        document.body.style.overflow = ''
    }
})

// 组件卸载时确保恢复滚动
onUnmounted(() => {
    document.body.style.overflow = ''
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

// 生成图表数据（根据图片描述的数据趋势：10月、11月、12月）
function generateChartData(points, range) {
    const orangeData = []
    const greenData = []
    const blueData = []

    // X轴标签：10月、11月、12月
    const xAxisData = ['10月', '11月', '12月']

    // 确保数据点数量足够，至少30个点以显示平滑的曲线
    const actualPoints = Math.max(points, 30)

    // 生成3个月的数据（根据图片描述的趋势）
    for (let i = 0; i < actualPoints; i++) {
        const progress = i / (actualPoints - 1) // 0 到 1
        const dayIndex = i

        // 添加轻微的随机波动
        const randomNoise = () => (Math.random() - 0.5) * 2 // 轻微波动
        const dailyVariation = Math.sin(dayIndex * 0.1) * 1.5 // 每日轻微波动
        const weeklyVariation = Math.sin(dayIndex * 0.02) * 2 // 每周波动

        // 橙色线：85%-100%之间波动
        // 10月开始约95%，稍微下降，11月中旬上升到接近100%，再次下降，12月结束时接近100%
        let orangeValue
        if (progress < 0.33) {
            // 10月：从95%开始，稍微下降
            const monthProgress = progress / 0.33
            orangeValue = 95 - monthProgress * 3 + Math.sin(monthProgress * Math.PI * 2) * 2
        } else if (progress < 0.66) {
            // 11月：从92%上升到接近100%，然后下降
            const monthProgress = (progress - 0.33) / 0.33
            orangeValue = 92 + Math.sin(monthProgress * Math.PI) * 6 // 先上升到98%，再下降到92%
            if (monthProgress < 0.5) {
                orangeValue = 92 + monthProgress * 12 // 前半段上升
            } else {
                orangeValue = 98 - (monthProgress - 0.5) * 6 // 后半段下降
            }
        } else {
            // 12月：从92%上升到接近100%
            const monthProgress = (progress - 0.66) / 0.34
            orangeValue = 92 + monthProgress * 6 + Math.sin(monthProgress * Math.PI * 2) * 1.5
        }
        orangeValue += dailyVariation + weeklyVariation + randomNoise()
        orangeData.push(Math.max(85, Math.min(100, orangeValue)))

        // 浅绿色/灰色线：
        // 10月开始约50%，上升到60%，保持在60%左右直到11月底，下降到48%，回升到60%，然后急剧下降到35%
        let greenValue
        if (progress < 0.33) {
            // 10月：从50%上升到60%
            const monthProgress = progress / 0.33
            greenValue = 50 + monthProgress * 10
        } else if (progress < 0.66) {
            // 11月：保持在60%左右，11月底下降到48%
            const monthProgress = (progress - 0.33) / 0.33
            if (monthProgress < 0.8) {
                // 11月大部分时间保持在60%左右
                greenValue = 60 + Math.sin(monthProgress * Math.PI * 4) * 2
            } else {
                // 11月底下降到48%
                greenValue = 60 - (monthProgress - 0.8) * 60 // 从60%快速下降到48%
            }
        } else {
            // 12月：从48%回升到60%，然后急剧下降到35%
            const monthProgress = (progress - 0.66) / 0.34
            if (monthProgress < 0.3) {
                // 12月初回升到60%
                greenValue = 48 + monthProgress * 40
            } else {
                // 然后急剧下降到35%
                greenValue = 60 - (monthProgress - 0.3) * 71.4 // 从60%下降到35%
            }
        }
        greenValue += dailyVariation * 0.8 + weeklyVariation * 0.6 + randomNoise()
        greenData.push(Math.max(30, Math.min(65, greenValue)))

        // 蓝色线：
        // 10月开始约25%，有轻微波动，11月中旬下降到最低点约10%，11月底回升到25%，然后稳步下降到接近0%
        let blueValue
        if (progress < 0.33) {
            // 10月：从25%开始，有轻微波动
            const monthProgress = progress / 0.33
            blueValue = 25 + Math.sin(monthProgress * Math.PI * 3) * 3
        } else if (progress < 0.66) {
            // 11月：下降到最低点约10%，然后回升到25%
            const monthProgress = (progress - 0.33) / 0.33
            if (monthProgress < 0.5) {
                // 11月前半段下降到10%
                blueValue = 25 - monthProgress * 30
            } else {
                // 11月后半段回升到25%
                blueValue = 10 + (monthProgress - 0.5) * 30
            }
        } else {
            // 12月：从25%稳步下降到接近0%
            const monthProgress = (progress - 0.66) / 0.34
            blueValue = 25 - monthProgress * 25
        }
        blueValue += dailyVariation * 0.6 + weeklyVariation * 0.4 + randomNoise()
        blueData.push(Math.max(0, Math.min(30, blueValue)))
    }

    // 轻微平滑处理
    const smoothData = (data, windowSize = 1) => {
        const smoothed = [...data]
        for (let i = 1; i < data.length - 1; i++) {
            smoothed[i] = (data[i - 1] + data[i] * 2 + data[i + 1]) / 4
        }
        return smoothed
    }

    // 应用平滑处理
    const smoothedOrange = smoothData(orangeData, 1)
    const smoothedGreen = smoothData(greenData, 1)
    const smoothedBlue = smoothData(blueData, 1)

    // 确保关键点的值符合图片描述
    // 橙色线：10月开始约95%，12月结束接近100%
    if (smoothedOrange.length > 0) {
        smoothedOrange[0] = 95
        smoothedOrange[smoothedOrange.length - 1] = 98
    }
    // 绿色线：10月开始约50%，12月结束约35%
    if (smoothedGreen.length > 0) {
        smoothedGreen[0] = 50
        smoothedGreen[smoothedGreen.length - 1] = 35
    }
    // 蓝色线：10月开始约25%，12月结束接近0%
    if (smoothedBlue.length > 0) {
        smoothedBlue[0] = 25
        smoothedBlue[smoothedBlue.length - 1] = 2
    }

    return {
        orange: smoothedOrange,
        green: smoothedGreen,
        blue: smoothedBlue,
        xAxis: xAxisData
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

// 方法
const handleTimeRangeChange = (value) => {
    selectedTimeRange.value = value
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

// 关闭 Payment 弹窗
const closePayment = () => {
    showPayment.value = false
    selectedOutcomeIndex.value = null
    selectedOutcomeType.value = null
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
    }

    .event-info-row {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 12px;
        color: var(--text-dark-gray, #909090);
        transition: color 0.3s ease;
        flex-wrap: wrap;

        .info-item {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
            color: var(--text-dark-gray, #909090);

            .info-icon {
                color: var(--text-dark-gray, #909090);
                font-size: 14px;
            }

            .info-text {
                font-size: 12px;
                white-space: nowrap;
                color: var(--text-dark-gray, #909090);
            }
        }

        .bookmark-icon {
            margin-left: auto;
            display: flex;
            align-items: center;
            cursor: pointer;
            color: var(--text-dark-gray, #909090);
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

        .leverage-info,
        .return-info {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: var(--text-dark-gray, #909090);
            white-space: nowrap;
            flex-shrink: 0;

            .leverage-label,
            .return-label {
                color: var(--text-dark-gray, #909090);
                font-weight: 400;
            }

            .leverage-value,
            .return-value {
                font-weight: 700;
                color: var(--text-color, #FFFFFF);
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

// Payment 弹窗
.payment-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1001;
    display: flex;
    align-items: flex-end;
    justify-content: center;

    .payment-modal {
        width: 100%;
        max-height: 80vh;
        background-color: var(--bg-page, #000000);
        border-radius: 20px 20px 0 0;
        overflow-y: auto;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        position: relative;
        display: flex;
        z-index: 1002;
        flex-direction: column;
    }

    .payment-header {
        width: 100%;
        height: 20px;
        position: sticky;
        top: -1px;
        left: 0;
        right: 0;
        background-color: var(--bg-page, #000000);
        flex-shrink: 0;
        padding-top: 10px;
        padding-bottom: 10px;

        &::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 3px;
            background: #383838;
            border-radius: 2px;
        }
    }
}



// 弹窗动画
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from {
    opacity: 0;
    transform: translateY(100%);
}

.slide-up-leave-to {
    opacity: 0;
    transform: translateY(100%);
}

.slide-up-enter-active .payment-modal,
.slide-up-leave-active .payment-modal {
    transition: transform 0.3s ease;
}

// 主题适配
:deep(.theme-dark) {
    .detail-h5-page {
        background-color: #000000;
    }

    .payment-modal {
        background-color: #000000;
    }

}

:deep(.theme-light) {
    .detail-h5-page {
        background-color: #FFFFFF;
    }

    .payment-modal {
        background-color: #FFFFFF;
    }

}
</style>
