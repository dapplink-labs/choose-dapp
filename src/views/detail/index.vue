<template>
  <div class="detail-page">
    <!-- 导航栏 -->
    <NavBar2 />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-wrapper">
        <!-- 主体内容区域 -->
        <div class="detail-layout">
          <!-- 左侧主要内容 -->
          <div class="left-content">
            <!-- 标题和事件详情 -->
            <div class="event-header">
              <div class="event-title-section">
                <img :src="detailData.avatar" alt="头像" class="event-avatar" />
                <h1 class="event-title">{{ detailData.title }}</h1>
              </div>
              <div class="event-info">
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
              </div>
              <div class="prediction-status">
                <p class="status-label">预测</p>
                <span class="status-date">{{ detailData.predictionDate }}</span>
                <span class="status-days">({{ detailData.daysLeft }}天后关闭)</span>
              </div>
            </div>

            <!-- 图表图例 -->
            <div class="chart-legend">
              <div v-for="(option, index) in chartOptions" :key="index" class="legend-item">
                <span class="legend-dot" :style="{ backgroundColor: option.color }"></span>
                <span class="legend-text">{{ option.label }} {{ option.percentage }}%</span>
              </div>
            </div>

            <!-- 折线图 -->
            <div class="chart-container">
              <LineChartDetail 
                :orange-data="chartData[selectedTimeRange]?.orange || []"
                :green-data="chartData[selectedTimeRange]?.green || []"
                :blue-data="chartData[selectedTimeRange]?.blue || []"
                :x-axis-data="chartData[selectedTimeRange]?.xAxis || []"
                :selected-y-value="selectedYValue"
                @y-value-change="handleYValueChange"
              />
            </div>

            <!-- 时间范围选择器 -->
            <div class="time-range-selector">
              <button v-for="range in timeRanges" :key="range.value" class="time-range-btn"
                :class="{ active: selectedTimeRange === range.value }" @click="handleTimeRangeChange(range.value)">
                {{ range.label }}
              </button>
            </div>
            <!-- 结果预测模块 -->
            <div class="outcome-prediction-section">
              <!-- 表头 -->
              <div class="outcome-header">
                <div class="header-label outcome-label">OUTCOME</div>
                <div class="header-label chance-label">% CHANCE</div>
                <div class="header-label actions-label"></div>
              </div>

              <!-- 结果列表 -->
              <div class="outcome-list">
                <div v-for="(outcome, index) in outcomes" :key="index" class="outcome-row">
                  <!-- 左侧：结果描述和交易量 -->
                  <div class="outcome-info">
                    <div class="outcome-title">{{ outcome.title }}</div>
                    <div class="outcome-volume">{{ outcome.volume }}</div>
                  </div>

                  <!-- 中间：百分比 -->
                  <div class="outcome-chance">{{ outcome.chance }}%</div>

                  <!-- 右侧：Yes/No按钮 -->
                  <div class="outcome-actions">
                    <button class="outcome-btn yes-btn" :class="{ active: outcome.selected === 'yes' }"
                      @click="selectOutcome(index, 'yes')">
                      Yes ${{ outcome.yesPrice }}
                    </button>
                    <button class="outcome-btn no-btn" :class="{ active: outcome.selected === 'no' }"
                      @click="selectOutcome(index, 'no')">
                      No ${{ outcome.noPrice }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单簿和规则模块 -->
            <div class="bottom-sections">
              <!-- 订单簿模块 -->
              <div class="order-book-section">
                <!-- 标签页 -->
                <div class="order-book-tabs">
                  <button class="order-tab-btn" :class="{ active: activeOrderTab === 'orderbook' }"
                    @click="activeOrderTab = 'orderbook'">
                    订单簿
                  </button>
                  <button class="order-tab-btn" :class="{ active: activeOrderTab === 'graph' }"
                    @click="activeOrderTab = 'graph'">
                    图形
                  </button>
                </div>

                <!-- 订单簿内容 -->
                <div class="order-book-content" v-if="activeOrderTab === 'orderbook'">
                  <!-- 交易量板块 -->
                  <div class="order-book-panel volume-panel">
                    <div class="panel-table-wrapper">
                      <!-- 表头 -->
                      <div class="table-header">
                        <div class="table-header-cell volume-header">交易量</div>
                        <div class="table-header-cell price-header">价格</div>
                        <div class="table-header-cell shares-header">股</div>
                        <div class="table-header-cell total-header">全部</div>
                      </div>
                      <!-- 数据行 -->
                      <div v-for="(order, index) in sellOrders" :key="index" class="table-row">
                        <div class="table-cell volume-cell">
                          <div class="volume-bar sell-bar"
                            :style="{ width: `${(order.shares / maxSellShares) * 100}%` }">
                          </div>
                        </div>
                        <div class="table-cell price-cell">${{ order.price }}</div>
                        <div class="table-cell shares-cell">{{ formatNumber(order.shares) }}</div>
                        <div class="table-cell total-cell">${{ formatNumber(order.total) }}</div>
                      </div>
                    </div>
                  </div>


                  <!-- 最后板块 -->
                  <div class="order-book-panel last-panel">
                    <div class="panel-table-wrapper">
                      <!-- 表头 -->
                      <div class="table-header">
                        <div class="table-header-cell volume-header">最后:${{ lastPrice }}</div>
                        <div class="table-header-cell price-header" style="width: 31.5%;">价差: $1</div>
                      </div>
                      <!-- 数据行 -->
                      <div v-for="(order, index) in buyOrders" :key="index" class="table-row">
                        <div class="table-cell volume-cell">
                          <div class="volume-bar buy-bar" :style="{ width: `${(order.shares / maxBuyShares) * 100}%` }">
                          </div>
                        </div>
                        <div class="table-cell price-cell">${{ order.price }}</div>
                        <div class="table-cell shares-cell">{{ formatNumber(order.shares) }}</div>
                        <div class="table-cell total-cell">${{ formatNumber(order.total) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 预测列表模块 -->
              <div class="prediction-list-section">
                <div v-for="(item, index) in predictionList" :key="index" class="prediction-list-item">
                  <!-- 左侧信息区 -->
                  <div class="prediction-info">
                    <div class="prediction-title">{{ item.title }}</div>
                    <div class="prediction-volume">{{ item.volume }}</div>
                  </div>
                  <!-- 中间概率区 -->
                  <div class="prediction-chance" :class="{ inactive: item.inactive }">
                    {{ item.chance }}%
                  </div>
                  <!-- 右侧操作区 -->
                  <div class="prediction-actions">
                    <button class="prediction-action-btn yes-btn" :class="{ active: item.selected === 'yes' }"
                      @click="selectPredictionItem(index, 'yes')">
                      Yes ${{ item.yesPrice }}
                    </button>
                    <button class="prediction-action-btn no-btn" :class="{ active: item.selected === 'no' }"
                      @click="selectPredictionItem(index, 'no')">
                      No ${{ item.noPrice }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- 规则模块 -->
              <div class="rules-section">
                <h3 class="rules-title">规则</h3>
                <p class="rules-text">{{ rulesText }}</p>
                <button class="view-more-btn" @click="toggleRulesExpanded">
                  <span>查看更多</span>
                  <el-icon class="info-icon chevron-icon" :class="{ expanded: rulesExpanded }">
                    <ArrowDownBold />
                  </el-icon>
                </button>
                <div v-if="rulesExpanded" class="rules-expanded">
                  <p>{{ rulesExpandedText }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧购买面板 -->
          <div class="right-panel">
            <!-- 面板标题 -->
            <div class="panel-title">{{ selectedOption.label }}</div>

            <!-- 买入/卖出标签页 -->
            <div class="panel-tabs">
              <button class="tab-btn" :class="{ active: activeTab === 'buy' }" @click="activeTab = 'buy'">
                买入
              </button>
              <button class="tab-btn" :class="{ active: activeTab === 'sell' }" @click="activeTab = 'sell'">
                卖出
              </button>
            </div>

            <!-- 预测选择按钮 -->
            <div class="prediction-buttons">
              <button class="prediction-btn yes-btn" :class="{ active: selectedPrediction === 'yes' }"
                @click="selectedPrediction = 'yes'">
                Yes ${{ selectedOption.yesPrice }}
              </button>
              <button class="prediction-btn no-btn" :class="{ active: selectedPrediction === 'no' }"
                @click="selectedPrediction = 'no'">
                No ${{ selectedOption.noPrice }}
              </button>
            </div>

            <!-- 金额输入 -->
            <div class="amount-section">
              <div class="amount-label">金额</div>
              <div class="balance-info">余额:${{ balance }}</div>
              <div class="amount-input-wrapper">
                <input type="text" class="amount-input" v-model="amount" placeholder="$0" />
              </div>
              <div class="quick-amount-buttons">
                <button v-for="quickAmount in quickAmounts" :key="quickAmount" class="quick-amount-btn"
                  @click="addAmount(quickAmount)">
                  {{ quickAmount === 'Max' ? 'Max' : `+$${quickAmount}` }}
                </button>
              </div>
            </div>

            <!-- 赢取金额显示 -->
            <div class="winning-section">
              <div class="winning-label">赢取金额</div>
              <div class="average-price">平均价格 ${{ averagePrice }}</div>
              <div class="winning-amount">${{ winningAmount }}</div>
            </div>

            <!-- 购买按钮 -->
            <button class="buy-button" :class="selectedPrediction" @click="handleBuy">
              {{ activeTab === 'buy' ? 'Buy' : 'Sell' }} {{ selectedPrediction === 'yes' ? 'Yes' : 'No' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar2 from '@/components/navBar2.vue'
import LineChartDetail from '@/components/LineChartDetail.vue'
import { Trophy, Clock, ArrowDownBold } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()


// 详情数据
const detailData = ref({
  id: 1,
  avatar: 'https://picsum.photos/seed/powell/60/60',
  title: 'Fed decision in December?',
  volume: '$153,642,644 Vol.',
  closeDate: 'Dec 10, 2025',
  predictionDate: '11月14日',
  daysLeft: 44
})

// 图表选项数据
const chartOptions = ref([
  { label: 'November 12-15', percentage: 13, color: '#FF9500', yesPrice: '0.8', noPrice: '99.4' },
  { label: 'November 16+', percentage: 51, color: '#25A750', yesPrice: '0.8', noPrice: '99.4' },
  { label: 'November 8-11', percentage: 8, color: '#3B82F6', yesPrice: '0.8', noPrice: '99.4' }
])

// 当前选中的选项（用于右侧面板）
const selectedOption = ref(chartOptions.value[2]) // 默认选中第三个

// 时间范围选项
const timeRanges = ref([
  { label: '1H', value: '1H' },
  { label: '6H', value: '6H' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: 'ALL', value: 'ALL' }
])

const selectedTimeRange = ref('1W')

// 选中的Y轴值
const selectedYValue = ref(20)

// 标签页
const activeTab = ref('buy')

// 预测选择
const selectedPrediction = ref('no')

// 金额相关
const balance = ref(38.68)
const amount = ref('100')
const quickAmounts = ref([1, 20, 100, 'Max'])

// 结果预测数据
const outcomes = ref([
  {
    title: '50+ bps decrease',
    volume: '$37,755,917 Vol.',
    chance: 1,
    yesPrice: '0.8',
    noPrice: '99.4',
    selected: null
  },
  {
    title: '50+ bps decrease',
    volume: '$37,755,917 Vol.',
    chance: 1,
    yesPrice: '0.8',
    noPrice: '99.4',
    selected: null
  },
  {
    title: '50+ bps decrease',
    volume: '$37,755,917 Vol.',
    chance: 1,
    yesPrice: '0.8',
    noPrice: '99.4',
    selected: 'no' // 默认第三个选中No
  }
])

// 通用选择函数
const toggleSelection = (list, index, choice) => {
  list[index].selected = list[index].selected === choice ? null : choice
}

// 选择结果
const selectOutcome = (index, choice) => toggleSelection(outcomes.value, index, choice)

// 预测列表数据
const predictionList = ref([
  {
    title: '50+ bps decrease',
    volume: '$37,755,917 Vol.',
    chance: 1,
    yesPrice: '0.8',
    noPrice: '99.4',
    selected: null,
    inactive: false
  },
  {
    title: '50+ bps decrease',
    volume: '$37,755,917 Vol.',
    chance: 1,
    yesPrice: '0.8',
    noPrice: '99.4',
    selected: null,
    inactive: true
  }
])

// 选择预测列表项
const selectPredictionItem = (index, choice) => toggleSelection(predictionList.value, index, choice)

// 订单簿相关
const activeOrderTab = ref('orderbook')
const lastPrice = ref(84)
const spread = ref(1)

// 卖出订单数据（交易量板块，价格从高到低，基于设计稿）
const sellOrders = ref([
  { price: 89, shares: 5234.12, total: 465836.68 },
  { price: 88, shares: 7141.96, total: 628492.48 },
  { price: 87, shares: 8923.45, total: 776340.15 },
  { price: 86, shares: 6543.21, total: 563116.06 },
  { price: 85, shares: 4321.78, total: 367351.30 }
])

// 买入订单数据（最后板块，价格从高到低，基于设计稿）
const buyOrders = ref([
  { price: 84, shares: 5123.45, total: 430369.80 },
  { price: 83, shares: 6234.56, total: 517468.48 },
  { price: 82, shares: 7891.23, total: 647080.86 },
  { price: 81, shares: 9123.45, total: 738999.45 },
  { price: 80, shares: 10234.56, total: 818764.80 }
])

// 计算条形图宽度百分比（基于shares值，匹配设计稿）
const maxSellShares = computed(() => Math.max(...sellOrders.value.map(o => o.shares)))
const maxBuyShares = computed(() => Math.max(...buyOrders.value.map(o => o.shares)))

// 规则相关
const rulesExpanded = ref(false)
const rulesText = ref('The FED interest rates are defined in this market by the upper bound of the target federal funds range. The decisions on the target')
const rulesExpandedText = ref('Additional rules and information about the market. This section contains more detailed information about how the market operates, including specific conditions, resolution criteria, and other important details that participants should be aware of when trading in this market.')

// 格式化数字
const formatNumber = (num) => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 切换规则展开状态
const toggleRulesExpanded = () => {
  rulesExpanded.value = !rulesExpanded.value
}

// 计算属性
const averagePrice = computed(() => {
  return selectedPrediction.value === 'yes' ? selectedOption.value.yesPrice : selectedOption.value.noPrice
})

const winningAmount = computed(() => {
  const amountValue = parseFloat(amount.value.replace('$', '')) || 0
  const price = parseFloat(averagePrice.value)
  if (price === 0) return '0'
  return (amountValue / price).toFixed(0)
})

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

// 获取最近三个月的月份名称
const getRecentMonths = () => {
  const now = new Date()
  const months = []
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  // 获取最近三个月（当前月、上个月、上上个月）
  for (let i = 2; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(monthNames[date.getMonth()])
  }

  return months
}

// 生成图表数据（根据图片描述的数据趋势）
function generateChartData(points, range) {
  const orangeData = [100]
  const greenData = []
  const blueData = []

  // 获取最近三个月的月份名称（用于x轴标签）
  const recentMonths = getRecentMonths()
  const xAxisData = [...recentMonths]

  // 生成更真实的3个月数据（每天一个数据点）
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1) // 0 到 1
    const dayIndex = i // 天数索引（0-89）

    // 添加大幅度的随机波动，模拟图片中的明显波动效果
    const randomNoise = () => (Math.random() - 0.5) * 12 // -6 到 6（大幅随机波动）
    const dailyVariation = Math.sin(dayIndex * 0.15) * 8 // 每日波动（大幅增加，频率更高）
    const weeklyVariation = Math.sin(dayIndex * 0.03) * 12 // 每周波动（大幅增加）
    const monthlyVariation = Math.sin(dayIndex * 0.005) * 8 // 每月波动（增加）
    // 添加额外的短期波动，创造更多尖锐转折
    const shortTermVariation = Math.sin(dayIndex * 0.5) * 5 // 短期高频波动
    const spikeVariation = Math.random() > 0.7 ? (Math.random() - 0.5) * 10 : 0 // 随机尖峰波动

    // 橙色线：70%-100%，整体上升趋势，中间有大幅波动
    // 在第一个月（前30天）从75%逐渐上升到90%
    // 在第二个月（30-60天）从90%下降到75%，然后回升到85%
    // 在第三个月（60-90天）从85%上升到100%
    let orangeValue
    if (progress < 0.33) {
      // 第一个月：75% -> 90%，添加大幅波动
      orangeValue = 75 + progress * 15
      orangeValue += Math.sin(progress * Math.PI * 4) * 8 // 添加周期性大幅波动
    } else if (progress < 0.66) {
      // 第二个月：90% -> 75% -> 85%，大幅波动
      const monthProgress = (progress - 0.33) / 0.33
      orangeValue = 90 - monthProgress * 15 + Math.sin(monthProgress * Math.PI * 3) * 15 // 大幅波动
      orangeValue += Math.sin(monthProgress * Math.PI * 6) * 6 // 额外高频波动
    } else {
      // 第三个月：85% -> 100%，上升趋势但有大波动
      const monthProgress = (progress - 0.66) / 0.34
      orangeValue = 85 + monthProgress * 15
      orangeValue += Math.sin(monthProgress * Math.PI * 5) * 8 // 上升过程中的波动
    }
    orangeValue += dailyVariation + weeklyVariation + monthlyVariation + shortTermVariation + spikeVariation + randomNoise()
    orangeData.push(Math.max(70, Math.min(100, orangeValue)))

    // 绿色线：40%-60%，在中间大幅波动，整体相对稳定
    // 在40%-60%之间大幅波动，有周期性变化
    const greenBase = 50
    const greenTrend = Math.sin(progress * Math.PI * 3) * 15 // 整体波动（大幅增加）
    const greenMediumTrend = Math.sin(progress * Math.PI * 6) * 8 // 中期波动
    const greenValue = greenBase + greenTrend + greenMediumTrend + dailyVariation * 1.5 + weeklyVariation * 1.3 + monthlyVariation * 1.0 + shortTermVariation * 0.8 + spikeVariation * 0.6 + randomNoise()
    greenData.push(Math.max(40, Math.min(60, greenValue)))

    // 蓝色线：0%-30%，整体下降趋势，但有大波动
    // 从20%逐渐下降到5%，但过程中有大幅波动
    const blueBase = 20 - progress * 15
    const blueTrend = Math.sin(progress * Math.PI * 4) * 8 // 下降过程中的波动
    const blueMediumTrend = Math.sin(progress * Math.PI * 8) * 4 // 中期波动
    const blueValue = blueBase + blueTrend + blueMediumTrend + dailyVariation * 1.0 + weeklyVariation * 0.8 + monthlyVariation * 0.6 + shortTermVariation * 0.5 + spikeVariation * 0.4 + randomNoise()
    blueData.push(Math.max(0, Math.min(30, blueValue)))
  }

  // 轻微平滑处理，保留大部分波动（减小平滑窗口以保持波动效果）
  const smoothData = (data, windowSize = 1) => {
    const smoothed = [...data]
    // 只对相邻点做轻微平滑，保持波动效果
    for (let i = 1; i < data.length - 1; i++) {
      smoothed[i] = (data[i - 1] + data[i] * 2 + data[i + 1]) / 4
    }
    return smoothed
  }

  // 应用轻微平滑处理（保持波动效果）
  const smoothedOrange = smoothData(orangeData, 1)
  const smoothedGreen = smoothData(greenData, 1)
  const smoothedBlue = smoothData(blueData, 1)

  // 确保最后一个点的值符合预期
  smoothedOrange[smoothedOrange.length - 1] = 100
  smoothedGreen[smoothedGreen.length - 1] = 40
  smoothedBlue[smoothedBlue.length - 1] = 5

  return {
    orange: smoothedOrange,
    green: smoothedGreen,
    blue: smoothedBlue,
    xAxis: xAxisData
  }
}

// 处理时间范围变化
const handleTimeRangeChange = (range) => {
  selectedTimeRange.value = range
  nextTick(() => {
    updateChart()
  })
}

// 添加金额
const addAmount = (value) => {
  if (value === 'Max') {
    amount.value = balance.value.toString()
  } else {
    const current = parseFloat(amount.value.replace('$', '')) || 0
    amount.value = (current + value).toString()
  }
}

// 处理购买
const handleBuy = () => {
  console.log('购买操作:', {
    tab: activeTab.value,
    prediction: selectedPrediction.value,
    amount: amount.value,
    option: selectedOption.value.label
  })
  // 这里可以添加实际的购买逻辑
}


// 处理Y轴值变化
const handleYValueChange = (value) => {
  selectedYValue.value = value
}


// 初始化
onMounted(() => {
  // 从路由参数获取选择类型
  const choice = route.query.choice
  if (choice === 'yes' || choice === 'no') {
    selectedPrediction.value = choice
  }
})
</script>

<style scoped lang="scss">
// 公共样式变量
$yes-color: #25A750;
$no-color: #CA4064;
$yes-bg-light: #E8F5E9;
$no-bg-light: #FFEBEE;
$yes-hover-bg: #C8E6C9;
$no-hover-bg: #FFCDD2;
$border-color: #E0E0E0;
$text-gray: #666;
$text-dark-gray: #999;

// 公共按钮样式 mixin
@mixin action-button($color, $bg-light, $hover-bg) {
  color: $color;
  background: $bg-light;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  padding: 10px 16px;

  &.active {
    background: $color;
    color: white;
  }

  &:hover:not(.active) {
    background: $hover-bg;
  }
}

// 公共标签页样式 mixin
@mixin tab-button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-gray, #666);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &.active {
    color: var(--text-color, #000);
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: -9px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--text-color, #000);
    }
  }
}

.detail-page {
  min-height: 100vh;
  background-color: var(--bg-page, #ffffff);
  color: var(--text-color, #1a1a1a);
  padding-top: 128px; // header(80px) + navbar2(48px)
  transition: background-color 0.3s ease, color 0.3s ease;

  .main-content {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 32px 64px;
    box-sizing: border-box;

    .content-wrapper {
      width: 100%;

      // 主体布局
      .detail-layout {
        display: flex;
        gap: 24px;
        align-items: flex-start;

        // 左侧主要内容
        .left-content {
          flex: 1;
          background: var(--bg-card, #ffffff);
          padding: 24px;
          border-radius: 8px;
          transition: background-color 0.3s ease;

          .event-header {
            margin-bottom: 24px;

            .event-title-section {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;

              .event-avatar {
                width: 60px;
                height: 60px;
                border-radius: 4px;
                object-fit: cover;
                flex-shrink: 0;
              }

              .event-title {
                font-size: 24px;
                font-weight: 600;
                color: var(--text-color, #000);
                margin: 0;
                flex: 1;
                transition: color 0.3s ease;
              }
            }

            .event-info {
              display: flex;
              gap: 24px;
              margin-bottom: 12px;

              .info-item {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 14px;
                color: var(--text-gray, #666);
                margin-right: 32px;
                transition: color 0.3s ease;

                .info-text {
                  font-family: PingFang SC, PingFang SC;
                  font-weight: 500;
                  font-size: 14px;
                  color: var(--text-dark-gray, #999999);
                  line-height: 20px;
                  text-align: left;
                  font-style: normal;
                  text-transform: none;
                  transition: color 0.3s ease;
                }

                .info-icon {
                  font-size: 16px;

                  &.trophy-icon {
                    color: var(--text-gray, #666);
                    transition: color 0.3s ease;
                  }

                  &.clock-icon {
                    color: var(--text-gray, #666);
                    transition: color 0.3s ease;
                  }
                }
              }
            }

            .prediction-status {

              font-family: PingFang SC, PingFang SC;
              text-align: left;
              font-style: normal;
              text-transform: none;
              font-weight: 500;
              margin-bottom: 23px;

              .status-label {
                font-size: 14px;
                color: var(--text-dark-gray, #999999);
                line-height: 20px;
                margin: 17px 0;
                transition: color 0.3s ease;
              }

              .status-date {
                font-size: 24px;
                color: var(--text-color, #000000);
                line-height: 20px;
                transition: color 0.3s ease;
              }

              .status-days {
                font-size: 16px;
                color: var(--text-gray, #909090);
                line-height: 20px;
                margin-left: 10px;
                transition: color 0.3s ease;
              }
            }
          }

          .chart-legend {
            display: flex;
            gap: 44px;
            margin-bottom: 16px;

            .legend-item {
              display: flex;
              align-items: center;
              gap: 5px;

              .legend-text {
                font-family: PingFang SC, PingFang SC;
                font-weight: 400;
                font-size: 12px;
                color: var(--text-dark-gray, #999999);
                line-height: 16px;
                text-align: left;
                font-style: normal;
                text-transform: none;
                transition: color 0.3s ease;
              }

              .legend-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
              }
            }
          }

          .chart-container {
            width: 100%;
            max-height: 300px;
            margin-bottom: 16px;
            position: relative;
            background: var(--bg-card, #ffffff);

            .chart-canvas {
              width: 100%;
              height: 100%;
              display: block;
            }
          }

          .time-range-selector {
            display: flex;
            gap: 8px;

            .time-range-btn {
              padding: 6px 12px;
              border: none;
              background: rgba(0, 0, 0, 0);
              border-radius: 20px;
              font-size: 14px;
              color: var(--text-gray, #666);
              cursor: pointer;
              transition: all 0.2s;

              &.active {
                background: var(--text-color, #1a1a1a);
                color: var(--bg-card, #ffffff);
                border-color: none;
              }
            }
          }
        }

        // 右侧购买面板
        .right-panel {
          flex: 0 0 380px;
          background: var(--bg-card, #ffffff);
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: background-color 0.3s ease;

          .panel-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #000);
            margin-bottom: 16px;
            transition: color 0.3s ease;
          }

            .panel-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            border-bottom: 1px solid var(--border-color, #E0E0E0);
            padding-bottom: 8px;
            transition: border-color 0.3s ease;

            .tab-btn {
              @include tab-button;
            }
          }

          .prediction-buttons {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;

            .prediction-btn {
              flex: 1;
              padding: 12px;
              border: 1px solid var(--border-color, #E0E0E0);
              background: var(--bg-card, #ffffff);
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;

              &.yes-btn {
                color: $yes-color;

                &.active {
                  background: $yes-color;
                  color: white;
                  border-color: $yes-color;
                }
              }

              &.no-btn {
                color: $no-color;

                &.active {
                  background: $no-color;
                  color: white;
                  border-color: $no-color;
                }
              }
            }
          }

          .amount-section {
            margin-bottom: 24px;

            .amount-label {
              font-size: 14px;
              color: var(--text-gray, #666);
              margin-bottom: 8px;
              transition: color 0.3s ease;
            }

            .balance-info {
              font-size: 12px;
              color: var(--text-dark-gray, #999);
              margin-bottom: 8px;
              transition: color 0.3s ease;
            }

            .amount-input-wrapper {
              margin-bottom: 12px;

              .amount-input {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--border-color, #E0E0E0);
                border-radius: 6px;
                font-size: 16px;
                outline: none;
                background: var(--bg-card, #ffffff);
                color: var(--text-color, #1a1a1a);
                transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;

                &:focus {
                  border-color: var(--text-color, #000);
                }
              }
            }

            .quick-amount-buttons {
              display: flex;
              gap: 8px;

              .quick-amount-btn {
                flex: 1;
                padding: 8px;
                border: 1px solid var(--border-color, #E0E0E0);
                background: var(--bg-card, #ffffff);
                border-radius: 4px;
                font-size: 12px;
                color: var(--text-gray, #666);
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  background: var(--bg-light, #F5F5F5);
                }
              }
            }
          }

          .winning-section {
            margin-bottom: 24px;
            padding: 16px;
            background: var(--bg-light, #F5F5F5);
            border-radius: 6px;
            transition: background-color 0.3s ease;

            .winning-label {
              font-size: 14px;
              color: var(--text-gray, #666);
              margin-bottom: 8px;
              transition: color 0.3s ease;
            }

            .average-price {
              font-size: 12px;
              color: var(--text-dark-gray, #999);
              margin-bottom: 8px;
              transition: color 0.3s ease;
            }

            .winning-amount {
              font-size: 32px;
              font-weight: 600;
              color: #25A750; // 保持绿色，这是功能色
            }
          }

          .buy-button {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            color: white;
            cursor: pointer;
            transition: all 0.2s;

            &.yes {
              background: #25A750;

              &:hover {
                background: #1e8e3e;
              }
            }

            &.no {
              background: #3B82F6;

              &:hover {
                background: #2563eb;
              }
            }
          }
        }
      }

      // 结果预测模块
      .outcome-prediction-section {
        background: var(--bg-card, #ffffff);
        border-radius: 8px;
        margin: 24px 0;
        transition: background-color 0.3s ease;

        .outcome-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-color, #E0E0E0);
          transition: border-color 0.3s ease;

          .header-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-dark-gray, #999);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: color 0.3s ease;

            &.outcome-label {
              flex: 1;
            }

            &.chance-label {
              width: 120px;
              text-align: left;
            }

            &.actions-label {
              width: 200px;
              // 操作按钮列不需要表头文字
            }
          }
        }

        .outcome-list {
          display: flex;
          flex-direction: column;
          gap: 0;

          .outcome-row {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 0;
            border-bottom: 1px solid var(--border-color, #F5F5F5);
            transition: border-color 0.3s ease;

            &:last-child {
              border-bottom: none;
            }

            .outcome-info {
              flex: 1;

              .outcome-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-color, #000);
                margin-bottom: 4px;
                transition: color 0.3s ease;
              }

              .outcome-volume {
                font-size: 14px;
                color: var(--text-dark-gray, #999);
                transition: color 0.3s ease;
              }
            }

            .outcome-chance {
              width: 120px;
              text-align: center;
              font-size: 18px;
              font-weight: 600;
              color: var(--text-color, #000);
              transition: color 0.3s ease;
            }

            .outcome-actions {
              display: flex;
              gap: 12px;

              .outcome-btn {
                padding: 10px 20px;
                border: 1px solid var(--border-color, #E0E0E0);
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                background: var(--bg-card, #ffffff);

                &.yes-btn {
                  color: $yes-color;
                  border-color: $yes-color;

                  &.active {
                    background: $yes-color;
                    color: white;
                  }

                  &:hover:not(.active) {
                    background: rgba(37, 167, 80, 0.1);
                  }
                }

                &.no-btn {
                  color: $no-color;
                  border-color: $no-color;

                  &.active {
                    background: $no-color;
                    color: white;
                  }

                  &:hover:not(.active) {
                    background: rgba(202, 64, 100, 0.1);
                  }
                }
              }
            }
          }
        }
      }

      // 底部模块
      .bottom-sections {
        margin-top: 24px;
        display: flex;
        flex-direction: column;

        // 订单簿模块
        .order-book-section {
          background: var(--bg-card, #ffffff);
          margin-top: 24px;
          border-radius: 8px;

          .order-book-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            border-bottom: 1px solid var(--border-color, #E0E0E0);
            padding-bottom: 8px;
            transition: border-color 0.3s ease;

            .order-tab-btn {
              @include tab-button;
            }
          }

          .order-book-content {
            display: flex;
            flex-direction: column;
            gap: 0;

            // 订单簿板块
            .order-book-panel {
              border-radius: 0;

              &.volume-panel {
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
              }

              &.last-panel {
                padding-top: 10px;
                border-top: 1px solid var(--border-color, #F4F4F4);
                transition: border-color 0.3s ease;
              }

              .panel-table-wrapper {
                display: flex;
                flex-direction: column;
                gap: 0;

                // 表头
                .table-header {
                  display: flex;
                  padding-bottom: 10px;
                  align-items: center;
                  border-bottom: 1px solid var(--border-color, #F4F4F4);
                  transition: border-color 0.3s ease;

                  .table-header-cell {
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: none;
                    line-height: 1.4;
                    transition: color 0.3s ease;

                    &:last-child {
                      border-right: none;
                    }

                    &.volume-header {
                      width: 30%;
                      text-align: left;
                      color: var(--text-dark-gray, #999);
                    }

                    &.price-header {
                      width: 36%;
                      text-align: right;
                      color: var(--text-dark-gray, #999);
                    }

                    &.shares-header {
                      width: 22%;
                      text-align: right;
                      color: var(--text-dark-gray, #999);
                    }

                    &.total-header {
                      width: 22%;
                      text-align: right;
                      padding-right: 3.5%;
                      box-sizing: border-box;
                      color: var(--text-dark-gray, #999);
                    }
                  }
                }

                // 数据行
                .table-row {
                  display: flex;
                  align-items: center;

                  &:last-child {
                    border-bottom: none;
                  }

                  .table-cell {
                    font-size: 14px;
                    color: var(--text-color, #000);
                    line-height: 1.5;
                    font-weight: 400;
                    box-sizing: border-box;
                    transition: color 0.3s ease;

                    &:last-child {
                      border-right: none;
                    }

                    &.volume-cell {
                      width: 30%;
                      text-align: left;

                      .volume-bar {
                        height: 40px;
                        border-radius: 1px;
                        transition: width 0.3s;
                        min-width: 8px;

                        &.sell-bar {
                          background: #CA4064;
                          opacity: 0.1;
                        }

                        &.buy-bar {
                          background: #25A750;
                          opacity: 0.1;
                        }
                      }
                    }

                    &.price-cell {
                      width: 36%;
                      text-align: right;
                      color: var(--text-color, #000);
                      flex: 1;
                    }

                    &.shares-cell {
                      width: 22%;
                      text-align: right;
                      color: var(--text-color, #000);
                    }

                    &.total-cell {
                      width: 18%;
                      text-align: right;
                      color: var(--text-color, #000);
                    }
                  }
                }
              }
            }
          }
        }

        // 预测列表模块
        .prediction-list-section {
          background: var(--bg-card, #ffffff);
          border-radius: 8px;
          padding: 0;

          .prediction-list-item {
            display: flex;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid var(--border-color, #F5F5F5);
            gap: 24px;
            transition: border-color 0.3s ease;

            &:last-child {
              border-bottom: none;
            }

            // 左侧信息区
            .prediction-info {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 4px;

              .prediction-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-color, #000);
                line-height: 1.4;
                transition: color 0.3s ease;
              }

              .prediction-volume {
                font-size: 14px;
                color: var(--text-dark-gray, #999);
                line-height: 1.4;
                transition: color 0.3s ease;
              }
            }

            // 中间概率区
            .prediction-chance {
              width: 120px;
              text-align: center;
              font-size: 18px;
              font-weight: 600;
              color: var(--text-color, #000);
              line-height: 1.4;
              transition: color 0.3s ease;

              &.inactive {
                color: var(--text-dark-gray, #999);
              }
            }

            // 右侧操作区
            .prediction-actions {
              display: flex;
              gap: 12px;
              width: 200px;
              justify-content: flex-end;

              .prediction-action-btn {
                flex: 1;

                &.yes-btn {
                  @include action-button($yes-color, $yes-bg-light, $yes-hover-bg);
                }

                &.no-btn {
                  @include action-button($no-color, $no-bg-light, $no-hover-bg);
                }
              }
            }
          }
        }

        // 规则模块
        .rules-section {
          background: var(--bg-card, #ffffff);
          padding: 24px 0;
          border-radius: 8px;
          transition: background-color 0.3s ease;

          .rules-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #000);
            margin-bottom: 16px;
            transition: color 0.3s ease;
          }

          .rules-text {
            font-size: 14px;
            color: var(--text-gray, #666);
            line-height: 1.6;
            margin-bottom: 16px;
            transition: color 0.3s ease;
          }

          .view-more-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0;
            border: none;
            background: transparent;
            font-size: 14px;
            color: var(--text-gray, #666);
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              color: var(--text-color, #000);
            }

            .info-icon.chevron-icon {
              font-size: 12px;
              transition: transform 0.3s, color 0.3s ease;
              color: var(--text-gray, #666);
              display: inline-block;
              width: 12px;
              height: 12px;

              :deep(svg) {
                width: 100%;
                height: 100%;
                fill: currentColor;
              }

              &.expanded {
                transform: rotate(180deg);
              }
            }

            &:hover .info-icon.chevron-icon {
              color: var(--text-color, #000);
            }
          }

          .rules-expanded {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color, #E0E0E0);
            transition: border-color 0.3s ease;

            p {
              font-size: 14px;
              color: var(--text-gray, #666);
              line-height: 1.6;
              transition: color 0.3s ease;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .detail-page {
    .main-content {
      padding: 28px 24px 56px;
      .detail-layout {
        flex-direction: column;

        .right-panel {
          flex: 1;
          width: 100%;
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .detail-page {
    padding-top: 120px;

    .main-content {
      padding: 24px 20px 48px;

      .content-wrapper {
        .detail-layout {
          gap: 20px;

          .left-content {
            padding: 20px;

            .event-header {
              .event-title-section {
                .event-avatar {
                  width: 52px;
                  height: 52px;
                }

                .event-title {
                  font-size: 22px;
                }
              }

              .event-info {
                flex-wrap: wrap;
                gap: 12px 20px;
                margin-bottom: 8px;
              }

              .prediction-status {
                .status-date {
                  font-size: 20px;
                }

                .status-days {
                  font-size: 14px;
                }
              }
            }

            .chart-legend {
              flex-wrap: wrap;
              gap: 16px;
            }

            .chart-container {
              height: 260px;
            }

            .time-range-selector {
              flex-wrap: wrap;
            }
          }

          .right-panel {
            flex: 1;
            width: 100%;
            padding: 20px;
          }
        }

        .outcome-prediction-section {
          .outcome-header {
            gap: 8px;
          }

          .outcome-list {
            .outcome-row {
              gap: 12px;

              .outcome-info {
                .outcome-title {
                  font-size: 16px;
                }
              }

              .outcome-chance {
                width: 110px;
                font-size: 16px;
              }

              .outcome-actions {
                .outcome-btn {
                  padding: 8px 14px;
                }
              }
            }
          }
        }

        .prediction-list-section {
          .prediction-list-item {
            gap: 16px;

            .prediction-info {
              .prediction-title {
                font-size: 16px;
              }
            }

            .prediction-chance {
              width: 110px;
              font-size: 16px;
            }

            .prediction-actions {
              width: 180px;
            }
          }
        }

        .rules-section {
          padding: 20px 0;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .detail-page {
    padding-top: 108px;

    .main-content {
      padding: 16px;

      .content-wrapper {
        .detail-layout {
          gap: 16px;

          .left-content {
            padding: 16px;
            border-radius: 10px;

            .event-header {
              .event-title-section {
                align-items: flex-start;

                .event-avatar {
                  width: 48px;
                  height: 48px;
                }

                .event-title {
                  font-size: 18px;
                  line-height: 1.4;
                }
              }

              .event-info {
                gap: 10px 16px;

                .info-item {
                  margin-right: 0;
                  gap: 8px;
                }
              }

              .prediction-status {
                margin-bottom: 16px;

                .status-label {
                  margin: 10px 0 8px;
                  font-size: 13px;
                }

                .status-date {
                  font-size: 18px;
                  line-height: 1.2;
                }

                .status-days {
                  font-size: 13px;
                }
              }
            }

            .chart-legend {
              gap: 12px;

              .legend-item {
                .legend-text {
                  font-size: 11px;
                }
              }
            }

            .chart-container {
              height: 220px;
            }

            .time-range-selector {
              gap: 6px;

              .time-range-btn {
                padding: 6px 10px;
                font-size: 13px;
              }
            }
          }

          .right-panel {
            padding: 16px;
            border-radius: 10px;

            .panel-title {
              font-size: 16px;
            }

            .prediction-buttons {
              .prediction-btn {
                font-size: 13px;
                padding: 10px;
              }
            }

            .amount-section {
              .amount-input {
                font-size: 15px;
              }
            }

            .quick-amount-buttons {
              .quick-amount-btn {
                font-size: 12px;
              }
            }

            .winning-section {
              .winning-amount {
                font-size: 28px;
              }
            }

            .buy-button {
              font-size: 15px;
              padding: 12px;
            }
          }
        }

        .outcome-prediction-section {
          margin: 20px 0;

          .outcome-header {
            padding-bottom: 6px;
            .header-label {
              font-size: 11px;
            }
          }

          .outcome-list {
            .outcome-row {
              padding: 12px 0;
              gap: 10px;
              align-items: flex-start;
              flex-wrap: wrap;

              .outcome-info {
                .outcome-title {
                  font-size: 15px;
                }

                .outcome-volume {
                  font-size: 13px;
                }
              }

              .outcome-chance {
                width: 100px;
                font-size: 15px;
              }

              .outcome-actions {
                width: 100%;
                justify-content: flex-start;
                gap: 8px;

                .outcome-btn {
                  flex: 1;
                  padding: 8px 12px;
                  font-size: 13px;
                }
              }
            }
          }
        }

        .prediction-list-section {
          .prediction-list-item {
            padding: 12px 0;
            gap: 12px;
            flex-wrap: wrap;
            align-items: flex-start;

            .prediction-info {
              .prediction-title {
                font-size: 15px;
              }

              .prediction-volume {
                font-size: 13px;
              }
            }

            .prediction-chance {
              width: auto;
              font-size: 15px;
            }

            .prediction-actions {
              width: 100%;
              gap: 8px;

              .prediction-action-btn {
                flex: 1;
                padding: 10px 12px;
                font-size: 13px;
              }
            }
          }
        }

        .rules-section {
          padding: 16px 0;

          .rules-title {
            font-size: 16px;
          }

          .rules-text {
            font-size: 13px;
          }

          .view-more-btn {
            font-size: 13px;
          }

          .rules-expanded {
            p {
              font-size: 13px;
            }
          }
        }

        // 底部模块移动端优化
        .bottom-sections {
          // 订单簿模块移动端优化
          .order-book-section {
            margin-top: 16px;
            border-radius: 10px;

            .order-book-tabs {
              gap: 6px;
              margin-bottom: 16px;
              padding-bottom: 6px;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;

              &::-webkit-scrollbar {
                display: none;
              }

              .order-tab-btn {
                padding: 6px 10px;
                font-size: 12px;
                flex-shrink: 0;
                min-height: 32px; // 触摸友好
              }
            }

            .order-book-content {
              .order-book-panel {
                padding: 12px 0;

                .panel-table-wrapper {
                  .table-header {
                    padding-bottom: 8px;

                    .table-header-cell {
                      font-size: 11px;
                      padding: 0 4px;

                      &.volume-header {
                        width: 28%;
                      }

                      &.price-header {
                        width: 36%;
                      }

                      &.shares-header {
                        width: 18%;
                      }

                      &.total-header {
                        width: 18%;
                        padding-right: 2%;
                      }
                    }
                  }

                  .table-row {
                    padding: 8px 0;

                    .table-cell {
                      font-size: 12px;
                      padding: 0 4px;

                      &.volume-cell {
                        width: 28%;

                        .volume-bar {
                          height: 32px;
                        }
                      }

                      &.price-cell {
                        width: 36%;
                      }

                      &.shares-cell {
                        width: 18%;
                      }

                      &.total-cell {
                        width: 18%;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// 480px 及以下设备进一步优化
@media (max-width: 480px) {
  .detail-page {
    padding-top: 108px;

    .main-content {
      padding: 12px;
      box-sizing: border-box;

      .content-wrapper {
        .detail-layout {
          gap: 12px;

          .left-content {
            padding: 12px;
            border-radius: 8px;
            box-sizing: border-box;
            width: 100%;

            .event-header {
              margin-bottom: 16px;

              .event-title-section {
                gap: 8px;

                .event-avatar {
                  width: 40px;
                  height: 40px;
                }

                .event-title {
                  font-size: 16px;
                  line-height: 1.3;
                }
              }

              .event-info {
                gap: 8px 12px;
                margin-bottom: 6px;

                .info-item {
                  gap: 6px;
                  font-size: 12px;

                  .info-text {
                    font-size: 12px;
                  }

                  .info-icon {
                    font-size: 14px;
                  }
                }
              }

              .prediction-status {
                margin-bottom: 12px;

                .status-label {
                  margin: 8px 0 6px;
                  font-size: 12px;
                }

                .status-date {
                  font-size: 16px;
                }

                .status-days {
                  font-size: 12px;
                  margin-left: 6px;
                }
              }
            }

            .chart-legend {
              gap: 10px;
              margin-bottom: 12px;

              .legend-item {
                .legend-text {
                  font-size: 10px;
                }

                .legend-dot {
                  width: 6px;
                  height: 6px;
                }
              }
            }

            .chart-container {
              height: 200px;
              margin-bottom: 12px;
            }

            .time-range-selector {
              gap: 4px;

              .time-range-btn {
                padding: 5px 8px;
                font-size: 11px;
                min-height: 28px; // 触摸友好
              }
            }
          }

          .right-panel {
            padding: 12px;
            border-radius: 8px;
            box-sizing: border-box;

            .panel-title {
              font-size: 14px;
              margin-bottom: 12px;
            }

            .panel-tabs {
              gap: 4px;
              margin-bottom: 12px;
              padding-bottom: 6px;

              .tab-btn {
                padding: 6px 8px;
                box-sizing: border-box;
                font-size: 11px;
                min-height: 28px; // 触摸友好
              }
            }

            .prediction-buttons {
              gap: 8px;
              margin-bottom: 16px;

              .prediction-btn {
                padding: 10px 8px;
                box-sizing: border-box;
                font-size: 12px;
                min-height: 40px; // 触摸友好
              }
            }

            .amount-section {
              margin-bottom: 16px;

              .amount-label {
                font-size: 12px;
                margin-bottom: 6px;
              }

              .balance-info {
                font-size: 11px;
                margin-bottom: 6px;
              }

              .amount-input-wrapper {
                margin-bottom: 10px;

                .amount-input {
                  padding: 10px;
                  font-size: 14px;
                  min-height: 44px; // 触摸友好
                  box-sizing: border-box;
                }
              }

              .quick-amount-buttons {
                gap: 6px;

                .quick-amount-btn {
                  padding: 6px;
                  font-size: 11px;
                  min-height: 32px; // 触摸友好
                }
              }
            }

            .winning-section {
              margin-bottom: 16px;
              padding: 12px;
              box-sizing: border-box;

              .winning-label {
                font-size: 12px;
                margin-bottom: 6px;
              }

              .average-price {
                font-size: 11px;
                margin-bottom: 6px;
              }

              .winning-amount {
                font-size: 24px;
              }
            }

            .buy-button {
              padding: 12px;
              font-size: 14px;
              min-height: 44px; // 触摸友好
            }
          }
        }

        .outcome-prediction-section {
          margin: 16px 0;
          border-radius: 8px;

          .outcome-header {
            padding-bottom: 6px;
            margin-bottom: 12px;

            .header-label {
              font-size: 10px;
            }
          }

          .outcome-list {
            .outcome-row {
              padding: 10px 0;
              gap: 8px;

              .outcome-info {
                .outcome-title {
                  font-size: 14px;
                }

                .outcome-volume {
                  font-size: 12px;
                }
              }

              .outcome-chance {
                width: 90px;
                font-size: 14px;
              }

              .outcome-actions {
                gap: 6px;

                .outcome-btn {
                  padding: 8px 10px;
                  font-size: 12px;
                  min-height: 36px; // 触摸友好
                }
              }
            }
          }
        }

        .prediction-list-section {
          border-radius: 8px;

          .prediction-list-item {
            padding: 10px 0;
            gap: 10px;

            .prediction-info {
              .prediction-title {
                font-size: 14px;
              }

              .prediction-volume {
                font-size: 12px;
              }
            }

            .prediction-chance {
              font-size: 14px;
            }

            .prediction-actions {
              gap: 6px;

              .prediction-action-btn {
                padding: 8px 10px;
                font-size: 12px;
                min-height: 36px; // 触摸友好
              }
            }
          }
        }

        // 底部模块移动端优化
        .bottom-sections {
          .order-book-section {
            margin-top: 12px;
            border-radius: 8px;

            .order-book-tabs {
              gap: 4px;
              margin-bottom: 12px;
              padding-bottom: 6px;

              .order-tab-btn {
                padding: 5px 8px;
                font-size: 11px;
                min-height: 28px;
              }
            }

            .order-book-content {
              .order-book-panel {
                padding: 10px 0;

                .panel-table-wrapper {
                  .table-header {
                    padding-bottom: 6px;

                    .table-header-cell {
                      font-size: 10px;
                      padding: 0 2px;
                    }
                  }

                  .table-row {
                    padding: 6px 0;

                    .table-cell {
                      font-size: 11px;
                      padding: 0 2px;

                      &.volume-cell {
                        .volume-bar {
                          height: 28px;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        .rules-section {
          padding: 12px 0;
          border-radius: 8px;

          .rules-title {
            font-size: 14px;
            margin-bottom: 12px;
          }

          .rules-text {
            font-size: 12px;
            margin-bottom: 12px;
          }

          .view-more-btn {
            font-size: 12px;
          }

          .rules-expanded {
            margin-top: 12px;
            padding-top: 12px;

            p {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}

</style>
