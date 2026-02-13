<template>
  <div class="sports-orderbook">
    <div class="tabs-row">
      <button v-for="tab in tabs" :key="tab.value" class="tab-btn" :class="{ active: activeTab === tab.value }"
        type="button" @click="activeTab = tab.value">
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'book'" class="book-panel">
      <OrderBookMobile :match-data="orderBookData" :active-side="activeSide" />
    </div>

    <div v-else-if="activeTab === 'chart'" class="chart-panel">
      <div class="time-range-selector">
        <button v-for="range in timeRanges" :key="range.value" class="time-range-btn"
          :class="{ active: selectedTimeRange === range.value }" @click="handleTimeRangeChange(range.value)">
          {{ range.label }}
        </button>
      </div>

      <div class="chart-container">
        <!-- touch-action: none 解决移动端拖拽时的页面滚动问题 -->
        <div ref="chartRef" class="chart-canvas" style="touch-action: none;"></div>

        <!-- Vue 渲染的高性能浮窗 -->
        <div v-if="showInfoBox" class="info-popover" :style="infoBoxStyle">
          Yes {{ currentPrice }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { useI18n } from 'vue-i18n'
import OrderBookMobile from '@/components/OrderBookMobile.vue'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()

const props = defineProps({
  matchData: { type: Object, default: null },
  activeSide: { type: String, default: 'yes' }
})

// 默认订单簿数据
const defaultMatchData = {
  team1: { name: '主队', odds: '32' },
  team2: { name: '客队', odds: '68' }
}

// 使用传入的数据或默认数据
const orderBookData = props.matchData || defaultMatchData

// 图表颜色配置
const chartColors = computed(() => ({
  axisLabel: themeStore.isDark ? '#555' : '#999',
  splitLine: themeStore.isDark ? '#222' : '#e0e0e0'
}))

const tabs = computed(() => [
  { label: t('sports.orderBook'), value: 'book' },
  { label: t('sports.chart'), value: 'chart' },
  { label: t('common.resolve'), value: 'resolve' }
])
const activeTab = ref('chart')

// ===== 图表状态 =====
const chartRef = ref(null)
let chartInstance = null
const currentPrice = ref(73.8)
const showInfoBox = ref(true)
const infoBoxStyle = ref({ left: '0px', top: '0px', display: 'none' })

const timeRanges = [
  { label: '1H', value: '1H' }, { label: '6H', value: '6H' },
  { label: '1D', value: '1D' }, { label: '1W', value: '1W' },
  { label: '1M', value: '1M' }, { label: 'ALL', value: 'ALL' }
]
const selectedTimeRange = ref('1W')

// 模拟数据
const generateData = () => {
  let val = 60
  return Array.from({ length: 60 }, (_, i) => {
    val += (Math.random() - 0.48) * 12
    return Math.max(10, Math.min(95, val)).toFixed(1)
  })
}
let totalData = generateData()
const handleIndex = ref(totalData.length - 10)

const updateChart = () => {
  if (!chartInstance) return

  const colors = chartColors.value

  const option = {
    backgroundColor: 'transparent',
    animation: false,
    grid: { left: '2%', right: '14%', top: '15%', bottom: '12%', containLabel: false },
    xAxis: {
      type: 'category',
      data: Array.from({ length: totalData.length }, (_, i) => i),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        interval: (idx) => [0, Math.floor(totalData.length / 2), totalData.length - 1].includes(idx),
        formatter: (v) => {
          if (v == 0) return '1月'
          if (v == Math.floor(totalData.length / 2)) return '3月'
          if (v == totalData.length - 1) return '5月'
          return ''
        },
        color: colors.axisLabel,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      position: 'right',
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        formatter: '{value}%',
        color: colors.axisLabel,
        fontSize: 10
      },
      splitLine: { lineStyle: { color: colors.splitLine } }
    },
    series: [
      {
        name: 'Background',
        type: 'line',
        data: totalData,
        smooth: 0.4,
        symbol: 'none',
        lineStyle: { width: 2.5, color: 'rgba(25, 217, 107, 0.15)' }
      },
      {
        name: 'Progress',
        type: 'line',
        data: totalData.slice(0, handleIndex.value + 1),
        smooth: 0.4,
        symbol: 'none',
        lineStyle: { width: 2.5, color: '#19d96b' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(25, 217, 107, 0.2)' },
            { offset: 1, color: 'transparent' }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)

  // 绘制可拖拽圆点
  setTimeout(() => {
    if (!chartInstance) return
    const xPix = chartInstance.convertToPixel({ xAxisIndex: 0 }, handleIndex.value)
    const yPix = chartInstance.convertToPixel({ yAxisIndex: 0 }, totalData[handleIndex.value])

    chartInstance.setOption({
      graphic: [{
        type: 'circle',
        id: 'handle',
        x: xPix, y: yPix,
        shape: { r: 8 },
        style: { fill: '#19d96b', stroke: 'rgba(25, 217, 107, 0.3)', lineWidth: 12 },
        draggable: true,
        z: 100,
        ondrag: function () {
          // 计算索引并限制范围
          const dataPos = chartInstance.convertFromPixel({ xAxisIndex: 0 }, this.x)
          let idx = Math.round(Number(dataPos))
          idx = Math.max(0, Math.min(totalData.length - 1, idx))

          const snappedX = chartInstance.convertToPixel({ xAxisIndex: 0 }, idx)
          const snappedY = chartInstance.convertToPixel({ yAxisIndex: 0 }, totalData[idx])

          // 强制吸附
          this.setPosition([snappedX, snappedY])

          // 更新 Vue 状态
          handleIndex.value = idx
          currentPrice.value = totalData[idx]
          updateInfoBoxPos(snappedX, snappedY)

          // 局部更新：只更新 Progress 线条，不使用 visualMap，杜绝 coord 错误
          chartInstance.setOption({
            series: [
              {}, // 背景线保持不变
              { data: totalData.slice(0, idx + 1) } // 仅裁剪高亮线
            ]
          }, false) // 不合并数据
        }
      }]
    })
    updateInfoBoxPos(xPix, yPix)
  }, 0)
}

const updateInfoBoxPos = (x, y) => {
  infoBoxStyle.value = {
    left: `${x}px`,
    top: `${y - 45}px`,
    transform: 'translateX(-50%)',
    display: 'block'
  }
}

const initChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

const handleTimeRangeChange = (val) => {
  selectedTimeRange.value = val
  totalData = generateData()
  handleIndex.value = totalData.length - 1
  updateChart()
}

watch(activeTab, async (val) => {
  if (val === 'chart') {
    await nextTick()
    initChart()
  }
})

// 监听主题变化，更新图表
watch(() => themeStore.isDark, () => {
  if (chartInstance && activeTab.value === 'chart') {
    updateChart()
  }
})

onMounted(() => {
  if (activeTab.value === 'chart') nextTick(() => initChart())
  window.addEventListener('resize', () => chartInstance?.resize())
})

onUnmounted(() => {
  if (chartInstance) chartInstance.dispose()
})
</script>

<style scoped lang="scss">
.sports-orderbook {
  width: 100%;
}

.tabs-row {
  display: flex;
  gap: 24px;
  padding: 10px 16px 0;
  border-bottom: 1px solid var(--border-color);

  .tab-btn {
    background: transparent;
    border: none;
    color: var(--text-dark-gray);
    font-size: 15px;
    padding-bottom: 15px;
    position: relative;
    cursor: pointer;

    &.active {
      color: var(--bg-opposite);
      font-weight: bold;

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

.chart-panel {
  padding: 16px 12px;

  .time-range-selector {
    display: flex;
    gap: 14px;

    .time-range-btn {
      background: transparent;
      border: none;
      color: var(--text-dark-gray);
      font-size: 12px;

      &.active {
        color: var(--bg-opposite);
        font-weight: bold;
      }
    }
  }
}

.chart-container {
  position: relative;
  width: 100%;
  height: 280px;

  .chart-canvas {
    width: 100%;
    height: 100%;
  }

  .info-popover {
    position: absolute;
    background: #19d96b;
    color: #000;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 900;
    pointer-events: none;
    z-index: 110;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #19d96b;
    }
  }
}

.loading-box {
  padding: 40px;
  text-align: center;
  color: var(--text-dark-gray);
}
</style>