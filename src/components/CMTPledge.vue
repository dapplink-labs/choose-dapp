<template>
    <div class="cmt-pledge">
        <!-- 质押总额卡片 -->
        <div class="pledge-card">
            <div class="card-title">质押总额(USDT)</div>
            <div class="card-value">{{ pledgeTotal }}</div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-container">
            <div ref="chartRef" class="chart" :style="{ height: chartHeight }"></div>
        </div>

        <!-- LP质押销毁卡片 -->
        <div class="pledge-card">
            <div class="card-title">LP质押销毁(USDT)</div>
            <div class="card-value">{{ lpPledgeTotal }}</div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-container">
            <div ref="lpChartRef" class="chart" :style="{ height: chartHeight }"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const chartRef = ref(null)
const lpChartRef = ref(null)
const chartInstance = ref(null)
const lpChartInstance = ref(null)
const chartHeight = ref('400px')

// 质押数据
const pledgeTotal = ref('107,545.46')
const lpPledgeTotal = ref('107,545.46')

// 生成面积图数据
const generateAreaData = () => {
    const data = []
    const dates = []
    let baseValue = 120000000 // 1.2亿起始值
    const dataCount = 180 // 6个月数据

    for (let i = 0; i < dataCount; i++) {
        const date = new Date('2025-12-19')
        date.setDate(date.getDate() - (dataCount - i))
        dates.push(date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '/'))

        // 生成波动数据，范围在1.2亿到2.2亿之间
        const change = (Math.random() - 0.4) * 5000000
        baseValue = Math.max(120000000, Math.min(220000000, baseValue + change))
        data.push(baseValue)
    }

    return { dates, data }
}

// 初始化图表
const initChart = (chartElement, chartInstanceRef) => {
    if (!chartElement) return

    chartInstanceRef.value = echarts.init(chartElement)
    
    const { dates, data } = generateAreaData()

    const option = {
        backgroundColor: 'transparent',
        grid: {
            left: 10,
            right: 10,
            bottom: 40,
            top: 20,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLine: {
                lineStyle: {
                    color: '#333'
                }
            },
            axisLabel: {
                color: '#999',
                fontSize: 10,
                interval: 'auto',
                rotate: 0,
                formatter: (value) => {
                    // 只显示月/日
                    const parts = value.split('/')
                    if (parts.length === 3) {
                        return `${parts[1]}/${parts[2]}`
                    }
                    return value
                }
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            scale: true,
            position: 'right',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#999',
                fontSize: 10,
                inside: false,
                formatter: (value) => {
                    // 转换为亿单位
                    return (value / 100000000).toFixed(2) + '亿'
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#222',
                    type: 'dashed'
                }
            },
            splitNumber: 5
        },
        series: [
            {
                type: 'line',
                data: data,
                smooth: true,
                symbol: 'none',
                lineStyle: {
                    color: '#4A90E2',
                    width: 2
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: 'rgba(74, 144, 226, 0.6)'
                            },
                            {
                                offset: 0.5,
                                color: 'rgba(74, 144, 226, 0.3)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(74, 144, 226, 0.05)'
                            }
                        ]
                    }
                }
            }
        ],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: '#999',
                    type: 'dashed',
                    width: 1
                }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#333',
            borderWidth: 1,
            textStyle: {
                color: '#fff',
                fontSize: 11
            },
            padding: 8,
            formatter: (params) => {
                const value = params[0].data
                const valueInYi = (value / 100000000).toFixed(4)
                return `
                    <div style="font-size: 11px; line-height: 1.5;">
                        <div style="margin-bottom: 4px;">${params[0].name}</div>
                        <div style="color: #4A90E2; font-weight: bold;">$${valueInYi}亿</div>
                    </div>
                `
            }
        }
    }

    chartInstanceRef.value.setOption(option)
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
    if (chartInstance.value) {
        chartInstance.value.resize()
    }
    if (lpChartInstance.value) {
        lpChartInstance.value.resize()
    }
}

onMounted(() => {
    initChart(chartRef.value, chartInstance)
    initChart(lpChartRef.value, lpChartInstance)
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (chartInstance.value) {
        chartInstance.value.dispose()
    }
    if (lpChartInstance.value) {
        lpChartInstance.value.dispose()
    }
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.cmt-pledge {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.pledge-card {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .card-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 20px;
        color: var(--text-color,#1a1a1a);
    }

    .card-value {
        font-family: DIN, DIN;
        font-weight: bold;
        font-size: 28px;
        color: #25A750;
    }
}

.chart-container {
    background-color: #000;
    padding: 12px 0px;
    border-radius: 8px;

    .chart {
        width: 100%;
        min-height: 350px;
    }
}

// 暗色主题适配
:global(.dark) {
    .pledge-card {
        background-color: var(--bg-card-dark, #1a1a1a);
    }

    .chart-container {
        background-color: var(--bg-card-dark, #1a1a1a);
    }
}
</style>
