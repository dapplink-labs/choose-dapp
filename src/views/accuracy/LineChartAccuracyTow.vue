<template>
  <div class="line-chart-earnings-tow">
    <div class="chart-header">
      <div class="header-left">
        <h2 class="chart-title">预期值与实际值</h2>
        <p class="chart-description">显示了 ChooseMe 赔率在最终确定之前不同时间点的准确度</p>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="chartCanvas" class="chart-canvas"></canvas>
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-dot expected"></span>
          <span class="legend-text">预期百分比</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot resolved"></span>
          <span class="legend-text">已解决百分比</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'

// Props
const props = defineProps({
  // 图表数据 - 数组项包含 expected（预期百分比），resolved（已解决百分比）
  data: {
    type: Array,
    default: () => [
      { expected: 5, resolved: 6 },
      { expected: 18, resolved: 18 },
      { expected: 38, resolved: 38 },
      { expected: 45, resolved: 45 },
      { expected: 26, resolved: 26 },
      { expected: 38, resolved: 38 },
      { expected: 80, resolved: 80 },
      { expected: 97, resolved: 97 },
      { expected: 56, resolved: 56 },
      { expected: 66, resolved: 66 },
      { expected: 46, resolved: 46 }
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
  height: 400,
  padding: {
    top: 60,
    right: 40,
    bottom: 60,
    left: 60
  },
  colors: {
    expected: '#3194D6', // 预期百分比 - 蓝色
    resolved: '#7652CE', // 已解决百分比 - 紫色
    grid: 'rgba(255, 255, 255, 0.1)',
    axisLabel: '#a0a0a0',
    text: '#ffffff'
  }
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

  // 计算绘制区域
  const gridWidth = chartConfig.width - chartConfig.padding.left - chartConfig.padding.right
  const gridHeight = chartConfig.height - chartConfig.padding.top - chartConfig.padding.bottom
  const gridX = chartConfig.padding.left
  const gridY = chartConfig.padding.top

  // Y轴实际计算范围：0% 到 100%（确保所有柱子都能显示）
  // Y轴显示刻度：20% 到 100%（只显示这些刻度标签）
  const yMin = 0
  const yMax = 100
  const yRange = yMax - yMin
  const yDisplayMin = 20 // 显示的最小刻度
  const yDisplayMax = 100 // 显示的最大刻度
  const yDisplayRange = yDisplayMax - yDisplayMin

  // 获取数据
  const chartData = props.data || []
  if (chartData.length === 0) return

  // X轴刻度：0% 到 100%，均分（默认11个点，每10%一个刻度）
  const xCategories = chartData.length
  const barGroupWidth = gridWidth / xCategories
  const barWidth = barGroupWidth * 0.3 // 每根柱子宽度
  const barGap = 2 // 两根柱子之间的间距（固定2px）

  // 绘制网格线（水平虚线）
  const gridColor = themeStore.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4]) // 虚线样式

  // 所有需要绘制网格线的Y轴刻度（包括10%，但不包括0%，也不显示标签）
  const yGridLines = [10, 20, 40, 60, 80, 100]
  yGridLines.forEach((tick) => {
    // 网格线位置基于0-100%范围计算
    const y = gridY + gridHeight - ((tick - yMin) / yRange) * gridHeight
    ctx.beginPath()
    ctx.moveTo(gridX, y)
    ctx.lineTo(gridX + gridWidth, y)
    ctx.stroke()
  })

  ctx.setLineDash([]) // 恢复实线

  // 在柱状图下方绘制实线（距离柱底14px，颜色 #2F2F2F）
  const baseLineY = gridY + gridHeight + 14
  ctx.strokeStyle = '#2F2F2F'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(gridX, baseLineY)
  ctx.lineTo(gridX + gridWidth, baseLineY)
  ctx.stroke()

  // 需要显示标签的Y轴刻度（不包括0%和10%）
  const yTicks = [20, 40, 60, 80, 100]

  // 绘制X轴标签
  const axisLabelColor = themeStore.isDark ? '#a0a0a0' : '#666666'
  ctx.fillStyle = axisLabelColor
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  chartData.forEach((item, index) => {
    const x = gridX + barGroupWidth * index + barGroupWidth / 2
    const y = gridY + gridHeight + 35 // 向下移动25px
    const xLabel = Math.round((100 / Math.max(1, chartData.length - 1)) * index)
    ctx.fillText(xLabel + '%', x, y)
  })

  // 绘制Y轴标签
  ctx.fillStyle = axisLabelColor
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  yTicks.forEach((tick) => {
    // Y轴标签位置基于0-100%范围计算
    const y = gridY + gridHeight - ((tick - yMin) / yRange) * gridHeight
    ctx.fillText(tick + '%', gridX - 10, y)
  })

  // 绘制圆角矩形的辅助函数（圆角在顶部，底部是直角）
  const drawRoundedRect = (x, y, width, height, radius, fillColor, strokeColor) => {
    // 如果高度太小，使用普通矩形
    if (height < radius) {
      ctx.fillStyle = fillColor
      ctx.fillRect(x, y, width, height)
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, width, height)
      return
    }
    
    ctx.beginPath()
    // 从底部左边开始，顺时针绘制
    // 底部左边
    ctx.moveTo(x, y + height)
    // 底部右边
    ctx.lineTo(x + width, y + height)
    // 右边（到右上圆角起点）
    ctx.lineTo(x + width, y + radius)
    // 右上圆角（从右边到顶部，逆时针）
    ctx.arc(x + width - radius, y + radius, radius, 0, -Math.PI / 2, true)
    // 顶部（从左到右）
    ctx.lineTo(x + radius, y)
    // 左上圆角（从顶部到左边，逆时针）
    ctx.arc(x + radius, y + radius, radius, -Math.PI / 2, Math.PI, true)
    // 左边（回到起点）
    ctx.closePath()
    
    // 填充
    ctx.fillStyle = fillColor
    ctx.fill()
    
    // 描边
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 绘制柱子（从底部向上，确保柱子底部对齐图表底部）
  chartData.forEach((item, index) => {
    const groupX = gridX + barGroupWidth * index
    const expectedBarX = groupX + (barGroupWidth - barWidth * 2 - barGap) / 2
    const resolvedBarX = expectedBarX + barWidth + barGap

    // 计算柱子高度（基于0%-100%的范围，确保所有值都能正确显示）
    const expectedValue = Math.max(0, Math.min(100, item.expected))
    const resolvedValue = Math.max(0, Math.min(100, item.resolved))
    
    // 柱子高度基于0-100%范围计算
    const expectedHeight = (expectedValue / yMax) * gridHeight
    const resolvedHeight = (resolvedValue / yMax) * gridHeight

    // 柱子的底部Y坐标（图表底部，对应Y轴的20%位置）
    const barBottomY = gridY + gridHeight
    // 柱子的顶部Y坐标（从底部向上计算）
    const expectedY = barBottomY - expectedHeight
    const resolvedY = barBottomY - resolvedHeight

    // 绘制预期百分比柱子（从底部向上，带圆角和边框）
    // background: rgba(64,178,255,0.2); border-radius: 2px; border: 1px solid #40B2FF;
    drawRoundedRect(
      expectedBarX,
      expectedY,
      barWidth,
      expectedHeight,
      2, // border-radius: 2px
      'rgba(64,178,255,0.2)', // background
      '#40B2FF' // border color
    )

    // 绘制已解决百分比柱子（从底部向上，带圆角和边框）
    // background: rgba(139,92,255,0.2); border-radius: 2px; border: 1px solid #8B5CFF;
    drawRoundedRect(
      resolvedBarX,
      resolvedY,
      barWidth,
      resolvedHeight,
      2, // border-radius: 2px
      'rgba(139,92,255,0.2)', // background
      '#8B5CFF' // border color
    )
  })
}

// 根据屏幕宽度调整图表尺寸与内边距
const applyResponsiveConfig = () => {
  const width = window.innerWidth
  if (width <= 480) {
    chartConfig.height = 220
    chartConfig.padding = { top: 24, right: 16, bottom: 72, left: 36 }
  } else if (width <= 768) {
    chartConfig.height = 260
    chartConfig.padding = { top: 30, right: 20, bottom: 72, left: 40 }
  } else if (width <= 1024) {
    chartConfig.height = 320
    chartConfig.padding = { top: 40, right: 30, bottom: 72, left: 48 }
  } else {
    chartConfig.height = 400
    chartConfig.padding = { top: 60, right: 40, bottom: 72, left: 60 }
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
.line-chart-earnings-tow {
  width: 100%;
  margin-top: 48px;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;

    .header-left {
      flex: 1;

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

    .header-right {
      .timeframe-selector {
        position: relative;
        display: inline-block;

        .timeframe-select {
          appearance: none;
          background-color: var(--bg-page, #FCFCFC);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 32px 8px 12px;
          font-size: 14px;
          color: var(--text-color, #1a1a1a);
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;

          option {
            background-color: var(--bg-page, #FCFCFC);
            color: var(--text-color, #1a1a1a);
          }

          &:hover {
            border-color: rgba(255, 255, 255, 0.2);
          }

          &:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.3);
          }
        }

        .select-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--text-gray, #a0a0a0);
          font-size: 12px;
        }
      }
    }
  }

  .chart-container {
    width: 100%;
    height: 400px;
    position: relative;
    border-radius: 16px;
    border: 1px solid #2F2F2F;
    overflow: hidden;
    background-color: var(--bg-page, #141414);
    transition: background-color 0.3s ease, border-color 0.3s ease;

    .chart-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    .chart-legend {
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 24px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;

          &.expected {
            background-color: #3194D6;
          }

          &.resolved {
            background-color: #7652CE;
          }
        }

        .legend-text {
          font-size: 14px;
          color: var(--text-color, #ffffff);
          transition: color 0.3s ease;
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .line-chart-earnings-tow {
    margin-top: 40px;

    .chart-header {
      margin-bottom: 26px;

      .chart-title {
        font-size: 22px;
      }
    }

    .chart-container {
      height: 360px;
    }
  }
}

@media (max-width: 1024px) {
  .line-chart-earnings-tow {
    margin-top: 36px;

    .chart-header {
      margin-bottom: 24px;

      .chart-title {
        font-size: 20px;
      }

      .chart-description {
        font-size: 13px;
      }
    }

    .chart-container {
      height: 320px;
      border-radius: 14px;
    }
  }
}

@media (max-width: 768px) {
  .line-chart-earnings-tow {
    margin-top: 28px;

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
      height: 260px;
      border-radius: 12px;
    }
  }
}

@media (max-width: 480px) {
  .line-chart-earnings-tow {
    margin-top: 22px;

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
      height: 220px;
      border-radius: 10px;
    }
  }
}
</style>
