<template>
  <div class="line-chart">
    <!-- Canvas图表 -->
    <div class="chart-placeholder">
      <canvas 
        ref="chartCanvas" 
        width="100%" 
        height="60"
        @resize="handleResize"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

// 定义props - 只接收必要的图表数据
const props = defineProps<{
  // 图表数据 - 包含日期和收益的数组
  data?: Array<{ date: string; value: number }>
}>()

// Canvas元素引用
const chartCanvas = ref<HTMLCanvasElement | null>(null)

// 绘制图表
const drawChart = () => {
  const canvas = chartCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 获取图表数据
  const chartDataPoints = props.data
  if (!chartDataPoints || chartDataPoints.length === 0) return
  
  // 设置画布尺寸
  canvas.width = canvas.offsetWidth
  canvas.height = 60
  
  // 计算图表数据的最大值和最小值
  const values = chartDataPoints.map(point => point.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const valueRange = maxValue - minValue || 1 // 避免除以0
  
  // 设置图表边距
  const padding = 10
  const chartWidth = canvas.width - padding * 2
  const chartHeight = canvas.height - padding * 2
  
  
  // 设置绿色主题颜色
  const lineColor = '#4ade80' // 绿色
  const fillColor = 'rgba(74, 222, 128, 0.2)' // 半透明绿色填充
  
  // 绘制折线和填充
  ctx.beginPath()
  
  // 绘制折线
  chartDataPoints.forEach((point, index) => {
    const x = padding + (chartWidth / (chartDataPoints.length - 1)) * index
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  // 添加填充
  ctx.lineTo(padding + chartWidth, padding + chartHeight) // 右下角
  ctx.lineTo(padding, padding + chartHeight) // 左下角
  ctx.closePath()
  
  // 绘制填充
  ctx.fillStyle = fillColor
  ctx.fill()
  
  // 绘制折线
  ctx.beginPath()
  chartDataPoints.forEach((point, index) => {
    const x = padding + (chartWidth / (chartDataPoints.length - 1)) * index
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.strokeStyle = lineColor
  ctx.lineWidth = 2
  ctx.stroke()
}

// 处理画布大小变化
const handleResize = () => {
  drawChart()
}

// 组件挂载后绘制图表
onMounted(() => {
  drawChart()
})

// 监听数据变化，重新绘制图表
watch(() => props.data, () => {
  drawChart()
}, { deep: true })
</script>

<style scoped lang="scss">
.line-chart {
  width: 100%;
  
  // 图表占位符
  .chart-placeholder {
    width: 100%;
    height: 60px;
    position: relative;

    canvas {
      width: 100%;
      height: 100%;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .line-chart {
    // 图表占位符
    .chart-placeholder {
      height: 60px;
    }
  }
}
</style>
