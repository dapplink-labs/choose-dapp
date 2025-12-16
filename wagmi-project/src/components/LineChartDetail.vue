<template>
  <div class="line-chart-detail">
    <canvas 
      ref="chartCanvas" 
      class="chart-canvas"
      @click="handleCanvasClick"
      @touchstart="handleCanvasClick"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'

// Props
const props = defineProps({
  // 三条折线的数据
  orangeData: {
    type: Array,
    default: () => []
  },
  greenData: {
    type: Array,
    default: () => []
  },
  blueData: {
    type: Array,
    default: () => []
  },
  // x轴标签数据
  xAxisData: {
    type: Array,
    default: () => []
  },
  // 选中的Y轴值
  selectedYValue: {
    type: Number,
    default: 20
  }
})

// Emits
const emit = defineEmits(['yValueChange'])

// Canvas引用
const chartCanvas = ref(null)

// 主题store
const themeStore = useThemeStore()

// 图表配置
const chartConfig = {
  width: 0,
  height: 300,
  padding: {
    top: 20,
    right: 70,
    bottom: 40,
    left: 10
  },
  colors: {
    orange: '#FF9500',
    green: '#9CAF88',
    blue: '#3B82F6',
    grid: '#F4F4F4',
    text: '#666',
    annotation: '#FF9500'
  },
  yAxis: {
    min: 0,
    max: 100,
    interval: 20
  },
  // 移动端配置
  isMobile: false,
  fontSize: 12,
  annotationWidth: 60,
  annotationFontSize: 12
}

// 绘制图表
const drawChart = () => {
  const canvas = chartCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  const container = canvas.parentElement
  if (container) {
    // 根据屏幕宽度动态调整高度和配置，移动端更紧凑
    const viewportWidth = window.innerWidth
    chartConfig.isMobile = viewportWidth <= 768
    
    if (viewportWidth <= 480) {
      // 小屏手机
      chartConfig.height = 200
      chartConfig.padding = {
        top: 15,
        right: 50,
        bottom: 35,
        left: 8
      }
      chartConfig.fontSize = 10
      chartConfig.annotationWidth = 50
      chartConfig.annotationFontSize = 10
    } else if (viewportWidth <= 768) {
      // 大屏手机/小平板
      chartConfig.height = 220
      chartConfig.padding = {
        top: 18,
        right: 60,
        bottom: 38,
        left: 10
      }
      chartConfig.fontSize = 11
      chartConfig.annotationWidth = 55
      chartConfig.annotationFontSize = 11
    } else if (viewportWidth <= 1024) {
      // 平板
      chartConfig.height = 260
      chartConfig.padding = {
        top: 20,
        right: 65,
        bottom: 40,
        left: 10
      }
      chartConfig.fontSize = 12
      chartConfig.annotationWidth = 60
      chartConfig.annotationFontSize = 12
    } else {
      // 桌面
      chartConfig.height = 300
      chartConfig.padding = {
        top: 20,
        right: 70,
        bottom: 40,
        left: 10
      }
      chartConfig.fontSize = 12
      chartConfig.annotationWidth = 60
      chartConfig.annotationFontSize = 12
    }

    chartConfig.width = container.offsetWidth
    canvas.width = chartConfig.width
    canvas.height = chartConfig.height
  }

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 计算绘制区域
  const gridWidth = chartConfig.width - chartConfig.padding.left - chartConfig.padding.right
  const gridHeight = chartConfig.height - chartConfig.padding.top - chartConfig.padding.bottom
  const gridX = chartConfig.padding.left
  const gridY = chartConfig.padding.top

  // 绘制网格线
  drawGridLines(ctx, gridX, gridY, gridWidth, gridHeight)

  // 绘制折线
  if (props.orangeData.length > 0) {
    drawLine(ctx, props.orangeData, chartConfig.colors.orange, gridX, gridY, gridWidth, gridHeight)
  }
  if (props.greenData.length > 0) {
    drawLine(ctx, props.greenData, chartConfig.colors.green, gridX, gridY, gridWidth, gridHeight)
  }
  if (props.blueData.length > 0) {
    drawLine(ctx, props.blueData, chartConfig.colors.blue, gridX, gridY, gridWidth, gridHeight)
  }

  // 绘制Y轴
  drawYAxis(ctx, gridX, gridY, gridWidth, gridHeight)

  // 绘制X轴
  drawXAxis(ctx, gridX, gridY, gridWidth, gridHeight)

  // 绘制标注框
  drawAnnotation(ctx, gridX, gridY, gridWidth, gridHeight)
}

// 绘制网格线
const drawGridLines = (ctx, gridX, gridY, gridWidth, gridHeight) => {
  // 根据主题设置网格线颜色
  const gridColor = themeStore.isDark ? '#2F2F2F' : chartConfig.colors.grid
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1

  // 绘制水平网格线
  const yTicks = []
  for (let i = chartConfig.yAxis.min; i <= chartConfig.yAxis.max; i += chartConfig.yAxis.interval) {
    yTicks.push(i)
  }

  yTicks.forEach((value) => {
    const y = gridY + gridHeight - (value / chartConfig.yAxis.max) * gridHeight
    ctx.beginPath()
    ctx.moveTo(gridX, y)
    ctx.lineTo(gridX + gridWidth, y)
    ctx.stroke()
  })

  // 绘制垂直网格线（6根）
  const verticalLineCount = 10
  for (let i = 0; i < verticalLineCount; i++) {
    if (i === 0) continue;
    const x = gridX + (gridWidth / (verticalLineCount - 1)) * i
    ctx.beginPath()
    ctx.moveTo(x, gridY)
    ctx.lineTo(x, gridY + gridHeight)
    ctx.stroke()
  }
}

// 绘制折线
const drawLine = (ctx, data, color, gridX, gridY, gridWidth, gridHeight) => {
  if (data.length === 0) return

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()

  data.forEach((value, index) => {
    const x = gridX + (gridWidth / (data.length - 1)) * index
    const y = gridY + gridHeight - (value / chartConfig.yAxis.max) * gridHeight

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()
}

// 绘制Y轴
const drawYAxis = (ctx, gridX, gridY, gridWidth, gridHeight) => {
  // 根据主题设置文字颜色
  const textColor = themeStore.isDark ? '#a0a0a0' : chartConfig.colors.text
  ctx.fillStyle = textColor
  ctx.font = `${chartConfig.fontSize}px sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  const yTicks = []
  for (let i = chartConfig.yAxis.min; i <= chartConfig.yAxis.max; i += chartConfig.yAxis.interval) {
    yTicks.push(i)
  }

  // 移动端调整标签位置，避免与标注框重叠
  const labelOffset = chartConfig.isMobile ? 20 : 30

  yTicks.forEach((value) => {
    const y = gridY + gridHeight - (value / chartConfig.yAxis.max) * gridHeight
    
    // 隐藏选中的Y轴标签
    if (value !== props.selectedYValue) {
      ctx.fillText(value + '%', gridX + gridWidth + chartConfig.padding.right - labelOffset, y)
    }
  })
}

// 绘制X轴
const drawXAxis = (ctx, gridX, gridY, gridWidth, gridHeight) => {
  if (props.xAxisData.length === 0) return

  // 根据主题设置文字颜色
  const textColor = themeStore.isDark ? '#a0a0a0' : chartConfig.colors.text
  ctx.fillStyle = textColor
  ctx.font = `${chartConfig.fontSize}px sans-serif`
  ctx.textBaseline = 'top'

  // 移动端调整标签偏移量
  const labelOffset = chartConfig.isMobile ? (chartConfig.width <= 480 ? 80 : 100) : 135

  props.xAxisData.forEach((label, index) => {
    const x = gridX + (gridWidth / (props.xAxisData.length - 1)) * index
    const y = gridY + gridHeight + (chartConfig.isMobile ? 6 : 8)

    // 为第一个和最后一个标签设置不同的对齐方式，让它们向中间靠拢
    if (index === 0) {
      ctx.textAlign = 'right'
      ctx.fillText(label, x + labelOffset, y)
    } else if (index === props.xAxisData.length - 1) {
      ctx.textAlign = 'left'
      ctx.fillText(label, x - labelOffset, y)
    } else {
      ctx.textAlign = 'center'
      ctx.fillText(label, x, y)
    }
  })
}

// 绘制标注框
const drawAnnotation = (ctx, gridX, gridY, gridWidth, gridHeight) => {
  const yPosition = gridY + gridHeight - (props.selectedYValue / chartConfig.yAxis.max) * gridHeight
  
  // 移动端调整标注框位置和大小
  const annotationHeight = chartConfig.isMobile ? 15 : 17
  const annotationRadius = chartConfig.isMobile ? 3 : 4
  const arrowSize = chartConfig.isMobile ? 5 : 6
  const annotationOffset = chartConfig.isMobile 
    ? (chartConfig.width <= 480 ? 50 : 55) 
    : 70
  const annotationX = gridX + gridWidth + chartConfig.padding.right - annotationOffset
  const annotationY = yPosition - (annotationHeight / 2)

  // 绘制左侧三角形箭头
  ctx.fillStyle = chartConfig.colors.annotation
  ctx.beginPath()
  ctx.moveTo(annotationX, annotationY + (annotationHeight / 2))
  ctx.lineTo(annotationX + arrowSize, annotationY + (annotationHeight / 2) - 2)
  ctx.lineTo(annotationX + arrowSize, annotationY + (annotationHeight / 2) + 2)
  ctx.closePath()
  ctx.fill()

  // 绘制圆角矩形背景
  ctx.fillStyle = chartConfig.colors.annotation
  roundRect(ctx, annotationX + arrowSize, annotationY, chartConfig.annotationWidth, annotationHeight, annotationRadius)
  ctx.fill()

  // 绘制文字
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `${chartConfig.annotationFontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(props.selectedYValue + '%', annotationX + arrowSize + (chartConfig.annotationWidth / 2), annotationY + (annotationHeight / 2))
}

// 绘制圆角矩形
const roundRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

// 处理画布点击事件
const handleCanvasClick = (event) => {
  // 如果是触摸事件，阻止默认行为
  if (event.touches) {
    event.preventDefault()
  }
  
  const canvas = chartCanvas.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  // 支持触摸事件
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  const clickX = clientX - rect.left
  const clickY = clientY - rect.top

  const gridWidth = chartConfig.width - chartConfig.padding.left - chartConfig.padding.right
  const gridHeight = chartConfig.height - chartConfig.padding.top - chartConfig.padding.bottom
  const gridX = chartConfig.padding.left
  const gridY = chartConfig.padding.top

  // 移动端扩大点击区域，提高触摸友好性
  const clickAreaWidth = chartConfig.isMobile ? 60 : 50
  const yAxisXStart = gridX + gridWidth + chartConfig.padding.right - clickAreaWidth
  const yAxisXEnd = gridX + gridWidth + chartConfig.padding.right + 10

  if (clickX > yAxisXStart && clickX < yAxisXEnd) {
    // 计算点击的Y值
    const yPercent = (clickY - gridY) / gridHeight
    const yValue = Math.round((1 - yPercent) * chartConfig.yAxis.max)

    // 找到最接近的刻度值
    const ticks = []
    for (let i = chartConfig.yAxis.min; i <= chartConfig.yAxis.max; i += chartConfig.yAxis.interval) {
      ticks.push(i)
    }
    const closestTick = ticks.reduce((prev, curr) => {
      return Math.abs(curr - yValue) < Math.abs(prev - yValue) ? curr : prev
    })

    // 移动端放宽误差范围，提高触摸准确性
    const errorThreshold = chartConfig.isMobile ? 15 : 10
    if (Math.abs(closestTick - yValue) < errorThreshold) {
      emit('yValueChange', closestTick)
    }
  }
}

// 处理窗口大小变化
const handleResize = () => {
  nextTick(() => {
    drawChart()
  })
}

// 监听数据变化
watch([() => props.orangeData, () => props.greenData, () => props.blueData, () => props.xAxisData, () => props.selectedYValue], () => {
  nextTick(() => {
    drawChart()
  })
}, { deep: true })

// 监听主题变化
watch(() => themeStore.isDark, () => {
  nextTick(() => {
    drawChart()
  })
})

// 组件挂载
onMounted(() => {
  nextTick(() => {
    drawChart()
  })
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.line-chart-detail {
  width: 100%;
  height: 300px;
  position: relative;
  box-sizing: border-box;

  .chart-canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: pointer;
    touch-action: manipulation; // 优化移动端触摸
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .line-chart-detail {
    height: 260px;
  }
}

@media (max-width: 768px) {
  .line-chart-detail {
    height: 220px;
  }
}

@media (max-width: 480px) {
  .line-chart-detail {
    height: 200px;
  }
}
</style>
