<template>
  <div class="line-chart-accuracy">
    <div class="chart-header">
      <h2 class="chart-title">分辨率之前的准确性</h2>
      <p class="chart-description">Multimarket 的预测结果与所有概率范围内的实际结果都非常吻合</p>
    </div>
    <div class="chart-container">
      <canvas ref="chartCanvas" class="chart-canvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'

// Props
const props = defineProps({
  // 图表数据 - 每个时间段包含详细的数据点数组
  // data: [{ timeframe: '4小时', data: [{ time: '10:00', percentage: 95.21 }, ...], currentIndex: 2 }]
  data: {
    type: Array,
    default: () => [
      {
        timeframe: '4小时',
        data: [
          { time: '10:00', percentage: 95.0 },
          { time: '11:00', percentage: 95.5 },
          { time: '12:00', percentage: 95.2 },
          { time: '13:00', percentage: 95.8 }
        ],
        currentIndex: 2 // 当前时间点索引（12:00）
      }
    ]
  }
})

// Canvas引用
const chartCanvas = ref(null)

// 主题store
const themeStore = useThemeStore()

// 图表配置
const chartConfig = {
  width: 0,
  height: 300,
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  colors: {
    line: '#4CAF50', // 默认颜色，会根据主题动态更新
    fill: 'rgba(37, 167, 80, 0.2)', // #25A750 with 5% opacity
    point: '#4CAF50',
    pointBorder: '#66BB6A',
    text: '#a0a0a0',
    textHighlight: '#4CAF50',
    divider: '#2F2F2F'
  }
}

// 根据屏幕宽度返回标签字号
const getLabelStyles = () => {
  const width = window.innerWidth
  if (width <= 480) {
    return { percentFont: '700 12px sans-serif', timeFont: '600 10px sans-serif' }
  } else if (width <= 768) {
    return { percentFont: '700 18px sans-serif', timeFont: '600 11px sans-serif' }
  } else if (width <= 1024) {
    return { percentFont: '700 22px sans-serif', timeFont: '600 12px sans-serif' }
  }
  return { percentFont: '700 24px sans-serif', timeFont: '600 12px sans-serif' }
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
    chartConfig.width = container.offsetWidth
    canvas.width = chartConfig.width
    canvas.height = chartConfig.height
  }

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 获取数据
  const chartData = props.data || []
  if (chartData.length === 0) return

  // 计算绘制区域
  const gridWidth = chartConfig.width - chartConfig.padding.left - chartConfig.padding.right
  const gridHeight = chartConfig.height - chartConfig.padding.top - chartConfig.padding.bottom
  const gridX = chartConfig.padding.left
  const gridY = chartConfig.padding.top

  // 每个时间段的宽度（独立显示）
  const segmentWidth = gridWidth / chartData.length

  // 计算所有时间段数据的最大值和最小值（用于Y轴缩放）
  const allPercentages = []
  chartData.forEach(item => {
    if (item.data && Array.isArray(item.data)) {
      item.data.forEach(point => {
        allPercentages.push(point.percentage)
      })
    }
  })
  
  const maxValue = allPercentages.length > 0 ? Math.max(...allPercentages) + 2 : 100
  const minValue = allPercentages.length > 0 ? Math.min(...allPercentages) - 2 : 0
  const valueRange = maxValue - minValue || 1

  // 将数据点转换为画布坐标点
  const convertDataToPoints = (dataPoints, segmentX, segmentWidth, minValue, valueRange, gridHeight, gridY) => {
    if (!dataPoints || dataPoints.length === 0) return []
    
    const points = []
    const dataLength = dataPoints.length
    
    // 第一个点从时间段开始底部
    points.push({
      x: segmentX,
      y: gridY + gridHeight,
      percentage: dataPoints[0].percentage,
      index: -1 // 底部起点
    })
    
    // 转换所有数据点为画布坐标
    dataPoints.forEach((dataPoint, index) => {
      // 确保最后一个数据点的 x 坐标正好是右边界
      let progress
      if (dataLength === 1) {
        progress = 1
      } else {
        // 最后一个数据点的 progress 强制为 1，确保到达右边界
        progress = index === dataLength - 1 ? 1 : index / (dataLength - 1)
      }
      const x = segmentX + segmentWidth * progress
      const y = gridY + gridHeight - ((dataPoint.percentage - minValue) / valueRange) * gridHeight
      
      points.push({
        x,
        y,
        percentage: dataPoint.percentage,
        index,
        time: dataPoint.time
      })
    })
    
    return points
  }

  // 收集分割线位置，最后统一绘制，避免被填充覆盖
  const dividerPositions = []

  // 绘制每个独立的时间段
  chartData.forEach((item, index) => {
    const segmentX = gridX + segmentWidth * index
    const segmentCenterX = segmentX + segmentWidth / 2
    
    // 检查数据格式
    if (!item.data || !Array.isArray(item.data) || item.data.length === 0) {
      console.warn(`时间段 ${item.timeframe} 没有有效数据`)
      return
    }
    
    const currentIndex = item.currentIndex !== undefined ? item.currentIndex : Math.floor(item.data.length / 2)
    
    // 第一步：将数据点转换为画布坐标点
    const points = convertDataToPoints(
      item.data,
      segmentX,
      segmentWidth,
      minValue,
      valueRange,
      gridHeight,
      gridY
    )
    
    // 第二步：根据currentIndex找到当前时间点的位置
    // currentIndex 对应的是数据点数组中的索引，需要找到对应的画布坐标点
    const currentDataPoint = item.data[currentIndex]
    if (!currentDataPoint) {
      console.warn(`时间段 ${item.timeframe} 的 currentIndex ${currentIndex} 无效`)
      return
    }
    
    const currentProgress = currentIndex / (item.data.length - 1)
    const currentX = segmentX + segmentWidth * currentProgress
    const currentY = points[currentIndex + 1].y // +1 因为points[0]是底部起点

    // 收集该时间段左侧分割线位置（除第一个段）
    if (index > 0) {
      dividerPositions.push(segmentX)
    }

    // 计算右边界和最后一个点（在绘制折线和填充之前计算一次）
    const lastPoint = points[points.length - 1]
    const rightBoundaryX = segmentX + segmentWidth

    // 获取背景色（与波浪线颜色相同，使其不可见）
    const bgColor = themeStore.isDark ? '#141414' : '#FCFCFC'

    // 第三步：绘制完整的波浪折线（整个时间段，颜色与背景色相同）
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y) // 从底部起点开始
    
    // 使用二次贝塞尔曲线连接所有数据点，形成平滑的波浪曲线
    // 跳过第一个点（底部起点），从第一个数据点开始
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      const prevPoint = points[i - 1]
      
      if (i === 1) {
        ctx.lineTo(point.x, point.y)
      } else {
        // 使用二次贝塞尔曲线创建平滑连接
        const cpX = (prevPoint.x + point.x) / 2
        const cpY = (prevPoint.y + point.y) / 2
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpX, cpY)
      }
    }
    
    // 确保折线延伸到时间段的右边界（强制延伸到右边界，不考虑精度问题）
    // 从最后一个数据点水平延伸到右边界
    ctx.lineTo(rightBoundaryX, lastPoint.y)
    
    ctx.strokeStyle = bgColor // 使用背景色，使波浪线不可见
    ctx.lineWidth = 2
    ctx.stroke()

    // 第四步：绘制区域填充（覆盖整个时间段）
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y) // 从底部起点开始
    
    // 绘制整个时间段的波浪曲线（与折线相同的路径）
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      const prevPoint = points[i - 1]
      
      if (i === 1) {
        ctx.lineTo(point.x, point.y)
      } else {
        const cpX = (prevPoint.x + point.x) / 2
        const cpY = (prevPoint.y + point.y) / 2
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpX, cpY)
      }
    }
    
    // 确保填充区域延伸到时间段的右边界（强制延伸到右边界）
    // 从最后一个数据点水平延伸到右边界
    ctx.lineTo(rightBoundaryX, lastPoint.y)
    
    // 闭合路径到底部（到时间段右边界）
    ctx.lineTo(rightBoundaryX, gridY + gridHeight)
    ctx.closePath()
    ctx.fillStyle = chartConfig.colors.fill
    ctx.fill()

    // 第五步：在当前时间点位置绘制原点（数据点）
    // 绘制填充圆形（12px x 12px，半径为 6px）
    ctx.beginPath()
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#25A750'
    ctx.fill()
    
    // 绘制白色边框（1px）
    ctx.beginPath()
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    ctx.stroke()
  })

  // 绘制时间段标签和百分比标签（在每个模块的左下角，背景图上方）
  chartData.forEach((item, index) => {
    const segmentX = gridX + segmentWidth * index
    const { percentFont, timeFont } = getLabelStyles()
    
    // 百分比标签（左下角位置，第一行，更上方）
    if (item.data && item.data.length > 0 && item.currentIndex !== undefined) {
      const currentDataPoint = item.data[item.currentIndex]
      if (currentDataPoint) {
        ctx.fillStyle = '#5A5F74'
        ctx.font = percentFont
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        // 位置：时间段左边界 + 小偏移，图表底部上方（第一行）
        ctx.fillText(currentDataPoint.percentage + '%', segmentX + 8, gridY + gridHeight - 8)
      }
    }
    
    // 时间段标签（左下角位置，第二行，在百分比标签下方）
    ctx.fillStyle = '#5A5F74'
    ctx.font = timeFont
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    // 位置：时间段左边界 + 小偏移，百分比标签下方
    ctx.fillText(item.timeframe, segmentX + 8, gridY + gridHeight - 36)
  })

  // 统一绘制分割线，确保在填充之上显示
  if (dividerPositions.length) {
    ctx.strokeStyle = chartConfig.colors.divider
    ctx.lineWidth = 1
    dividerPositions.forEach((xPos) => {
      ctx.beginPath()
      ctx.moveTo(xPos + 0.5, gridY)
      ctx.lineTo(xPos + 0.5, gridY + gridHeight)
      ctx.stroke()
    })
  }
}

// 根据屏幕宽度调整图表尺寸与内边距
const applyResponsiveConfig = () => {
  const width = window.innerWidth
  if (width <= 480) {
    chartConfig.height = 200
    chartConfig.padding = { top: 10, right: 10, bottom: 20, left: 10 }
  } else if (width <= 768) {
    chartConfig.height = 220
    chartConfig.padding = { top: 12, right: 12, bottom: 24, left: 12 }
  } else if (width <= 1024) {
    chartConfig.height = 260
    chartConfig.padding = { top: 14, right: 14, bottom: 26, left: 14 }
  } else {
    chartConfig.height = 300
    chartConfig.padding = { top: 16, right: 16, bottom: 28, left: 16 }
  }
}

// 处理窗口大小变化
const handleResize = () => {
  applyResponsiveConfig()
  nextTick(() => {
    drawChart()
  })
}

// 监听数据变化
watch(() => props.data, () => {
  applyResponsiveConfig()
  nextTick(() => {
    drawChart()
  })
}, { deep: true })

// 监听主题变化
watch(() => themeStore.isDark, () => {
  applyResponsiveConfig()
  nextTick(() => {
    drawChart()
  })
})

// 组件挂载
onMounted(() => {
  applyResponsiveConfig()
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
.line-chart-accuracy {
  width: 100%;
  margin-top: 48px;

  .chart-header {
    margin-bottom: 32px;

    .chart-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-color, #ffffff);
      margin: 0 0 12px 0;
      line-height: 1.2;
      transition: color 0.3s ease;
    }

    .chart-description {
      font-size: 14px;
      color: var(--text-gray, #a0a0a0);
      margin: 0;
      line-height: 1.6;
      transition: color 0.3s ease;
    }
  }

  .chart-container {
    width: 100%;
    height: 300px;
    position: relative;
    border-radius: 16px;
    border: 1px solid #2F2F2F;
    overflow: hidden;

    .chart-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}

@media (max-width: 1024px) {
  .line-chart-accuracy {
    margin-top: 32px;

    .chart-header {
      .chart-title {
        font-size: 20px;
      }

      .chart-description {
        font-size: 13px;
      }
    }

    .chart-container {
      height: 260px;
    }
  }
}

@media (max-width: 768px) {
  .line-chart-accuracy {
    margin-top: 24px;

    .chart-header {
      margin-bottom: 20px;

      .chart-title {
        font-size: 18px;
      }

      .chart-description {
        line-height: 1.5;
      }
    }

    .chart-container {
      height: 220px;
      border-radius: 12px;
    }
  }
}

@media (max-width: 480px) {
  .line-chart-accuracy {
    margin-top: 20px;

    .chart-header {
      margin-bottom: 16px;

      .chart-title {
        font-size: 16px;
      }

      .chart-description {
        font-size: 12px;
        line-height: 1.4;
      }
    }

    .chart-container {
      height: 200px;
      border-radius: 10px;
    }
  }
}
</style>
