<template>
    <div class="computing-pool">
        <!-- 质押总额卡片 -->
        <div class="pledge-card">
            <div class="card-title">{{ $t('computingPool.pledgeTotal') }}</div>
            <div class="card-value">${{ pledgeTotal }}</div>
        </div>

        <!-- 折线图区域 -->
        <div class="chart-container">
            <div ref="lineChartRef" class="chart" :style="{ height: chartHeight }"></div>
        </div>

        <!-- 时间选择器 -->
        <div class="time-selector">
            <div v-for="(period, index) in timePeriods" :key="index"
                :class="['time-item', { active: selectedPeriod === index }]" @click="selectedPeriod = index">
                {{ period }}
            </div>
        </div>

        <div class="horizontal-line"></div>

        <!-- 算力池构成 -->
        <div class="composition-section">
            <div class="section-title">{{ $t('computingPool.composition') }}</div>

            <div class="composition-content">
                <!-- 饼图区域 -->
                <div class="pie-chart-container">
                    <div ref="pieChartRef" class="pie-chart" :style="{ height: pieChartHeight }"></div>
                </div>

                <!-- 图例 -->
                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #FF9500;"></div>
                        <div class="legend-text">
                            <span class="legend-label">{{ $t('computingPool.distributedNodeTotal') }}</span>
                            <!-- <span class="legend-value">{{ distributedNodeAmount }} USDT</span> -->
                        </div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #7652CE;"></div>
                        <div class="legend-text">
                            <span class="legend-label">{{ $t('computingPool.clusterNodeTotal') }}</span>
                            <!-- <span class="legend-value">{{ clusterNodeAmount }} USDT</span> -->
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

// 按需引入 ECharts
import * as echarts from 'echarts/core'
import {
    TooltipComponent,
    GridComponent,
    LegendComponent,
    MarkPointComponent
} from 'echarts/components'
import { LineChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必需的组件
echarts.use([
    TooltipComponent,
    GridComponent,
    LegendComponent,
    MarkPointComponent,
    LineChart,
    PieChart,
    CanvasRenderer
])

const { t } = useI18n()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 响应式数据
const lineChartRef = ref(null)
const pieChartRef = ref(null)
const lineChartInstance = ref(null)
const pieChartInstance = ref(null)
const chartHeight = ref('300px')
const pieChartHeight = ref('200px')

// 质押数据
const pledgeTotal = ref('107,545.46')

// 算力池构成数据
const distributedNodeAmount = ref('750,000')
const clusterNodeAmount = ref('250,000')

// 时间选择器
const timePeriods = computed(() => [
    t('computingPool.timePeriods.7d'),
    t('computingPool.timePeriods.30d'),
    t('computingPool.timePeriods.90d'),
    t('computingPool.timePeriods.1y'),
    t('computingPool.timePeriods.all')
])
const selectedPeriod = ref(4) // 默认选中"全部"

// 生成折线图假数据（根据不同时间段返回不同走势）
const generateLineData = (periodIndex = 4) => {
    // 公共时间点（横轴）
    const baseDates = ['10/04', '10/23', '11/11', '11/30', '12/20']

    // 不同时间段的模拟数据（单位：美元）
    const datasets = [
        // 7 日：波动较小的上涨
        [217_303_044.08, 300_000_000, 380_000_000, 450_000_000, 520_000_000],
        // 30 日：阶梯式上涨
        [217_303_044.08, 420_000_000, 650_000_000, 900_000_000, 1_050_000_000],
        // 90 日：中间有一段回调
        [217_303_044.08, 650_000_000, 480_000_000, 1_100_000_000, 1_500_000_000],
        // 1 年：整体震荡上行
        [217_303_044.08, 800_000_000, 1_200_000_000, 1_600_000_000, 1_950_000_000],
        // 全部：接近最终示意图的走势（冲高后回落）
        [217_303_044.08, 800_000_000, 1_500_000_000, 2_000_000_000, 2_609_786_405.78]
    ]

    const safeIndex = Math.min(Math.max(periodIndex, 0), datasets.length - 1)
    const values = datasets[safeIndex]

    return { dates: baseDates, data: values }
}

// 获取主题相关的颜色
const getThemeColors = () => {
    const isDarkMode = isDark.value
    return {
        axisLabelColor: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        splitLineColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        tooltipBg: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        tooltipBorder: isDarkMode ? '#333' : '#E0E0E0',
        tooltipText: isDarkMode ? '#fff' : '#000',
        textColor: isDarkMode ? '#fff' : '#000'
    }
}

// 初始化折线图
const initLineChart = (chartElement) => {
    if (!chartElement) return

    if (lineChartInstance.value) {
        lineChartInstance.value.dispose()
    }

    lineChartInstance.value = echarts.init(chartElement)

    const { dates, data } = generateLineData(selectedPeriod.value)
    const colors = getThemeColors()

    // 计算Y轴范围 - 根据图片，Y轴显示从 -$0.18m 到 $2.13m（单位：美元）
    const yMin = -180_000_000
    const yMax = 2_130_000_000

    const option = {
        backgroundColor: 'transparent',
        grid: {
            left: 60,
            right: 20,
            bottom: 50,
            top: 30,
            containLabel: false
        },
        xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLine: {
                show: false
            },
            axisLabel: {
                color: colors.axisLabelColor,
                fontSize: 12,
                interval: 0
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
            position: 'left',
            min: yMin,
            max: yMax,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: colors.axisLabelColor,
                fontSize: 12,
                formatter: (value) => {
                    if (value >= 0) {
                        return `$${(value / 1000000).toFixed(2)}m`
                    } else {
                        return `-$${Math.abs(value / 1000000).toFixed(2)}m`
                    }
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: colors.splitLineColor,
                    type: 'solid'
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
                    color: '#25A750',
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
                                color: 'rgba(37, 167, 80, 0.3)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(37, 167, 80, 0.05)'
                            }
                        ]
                    }
                },
                markPoint: {
                    data: [
                        {
                            name: '峰值1',
                            coord: [dates[0], data[0]],
                            value: data[0],
                            symbol: 'circle',
                            symbolSize: 0,
                            label: {
                                show: true,
                                formatter: `$${data[0].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                position: 'top',
                                color: colors.textColor,
                                fontSize: 11
                            }
                        },
                        {
                            name: '峰值2',
                            coord: [dates[dates.length - 1], data[data.length - 1]],
                            value: data[data.length - 1],
                            symbol: 'circle',
                            symbolSize: 0,
                            label: {
                                show: true,
                                formatter: `$${data[data.length - 1].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                position: 'top',
                                color: colors.textColor,
                                fontSize: 11
                            }
                        }
                    ]
                }
            }
        ],
        tooltip: {
            trigger: 'axis',
            confine: true,
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: [8, 12],
            textStyle: {
                color: colors.tooltipText,
                fontSize: 12
            },
            formatter: (params) => {
                const value = params[0].data
                return `
                    <div style="font-size: 12px;">
                        <div style="margin-bottom: 4px;">${params[0].name}</div>
                        <div style="color: #25A750; font-weight: bold;">$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                `
            }
        }
    }

    lineChartInstance.value.setOption(option)
}

// 初始化饼图
const initPieChart = (chartElement) => {
    if (!chartElement) return

    if (pieChartInstance.value) {
        pieChartInstance.value.dispose()
    }

    pieChartInstance.value = echarts.init(chartElement)

    const colors = getThemeColors()
    const distributedValue = 750000
    const clusterValue = 250000
    const total = distributedValue + clusterValue

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            confine: true,
            width: 'auto',
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: [8, 12],
            textStyle: {
                color: colors.tooltipText,
                fontSize: 12
            },
            formatter: (params) => {
                const percent = ((params.value / total) * 100).toFixed(1)
                return `
                    <div style="font-size: 12px;">
                        <div style="margin-bottom: 4px;">${params.name}</div>
                        <div style="color: ${params.color}; font-weight: bold;">${params.value.toLocaleString('en-US')} USDT (${percent}%)</div>
                    </div>
                `
            }
        },
        series: [
            {
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 0,
                    borderColor: isDark.value ? '#000' : '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: false
                    }
                },
                data: [
                    {
                        value: distributedValue,
                        name: t('computingPool.distributedNodeTotal'),
                        itemStyle: {
                            color: '#FF9500'
                        }
                    },
                    {
                        value: clusterValue,
                        name: t('computingPool.clusterNodeTotal'),
                        itemStyle: {
                            color: '#7652CE'
                        }
                    }
                ]
            }
        ]
    }

    pieChartInstance.value.setOption(option)
}

// 监听主题变化
watch(isDark, () => {
    nextTick(() => {
        if (lineChartInstance.value) {
            initLineChart(lineChartRef.value)
        }
        if (pieChartInstance.value) {
            initPieChart(pieChartRef.value)
        }
    })
})

// 监听时间选择器变化
watch(selectedPeriod, () => {
    // 这里可以根据选择的时间段更新数据
    if (lineChartInstance.value) {
        initLineChart(lineChartRef.value)
    }
})

// 窗口大小变化时重新调整图表
const handleResize = () => {
    if (lineChartInstance.value) {
        lineChartInstance.value.resize()
    }
    if (pieChartInstance.value) {
        pieChartInstance.value.resize()
    }
}

onMounted(() => {
    nextTick(() => {
        initLineChart(lineChartRef.value)
        initPieChart(pieChartRef.value)
    })

    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (lineChartInstance.value) {
        lineChartInstance.value.dispose()
    }
    if (pieChartInstance.value) {
        pieChartInstance.value.dispose()
    }
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.computing-pool {
    padding: 0;
}

.pledge-card {
    padding-top: 20px;
    text-align: left;

    .card-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 20px;
        color: var(--text-color);
        margin-bottom: 11px;
    }

    .card-value {
        font-family: DIN, DIN;
        font-weight: bold;
        font-size: 28px;
        color: var(--text-color, #FFFFFF);
    }
}

.chart-container {
    width: 100%;
    background-color: var(--bg-page-h5, #FFFFFF);
    border-radius: 8px;
    padding: 10px 0;
    transition: background-color 0.3s ease;

    .chart {
        width: 100%;
        min-height: 300px;
    }
}

.time-selector {
    display: flex;
    gap: 12px;
    margin: 20px 0;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    box-sizing: border-box;

    .time-item {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        padding: 2px 8px;
        border-radius: 20px;
        color: var(--text-gray, #909090);
        transition: all 0.3s ease;
        white-space: nowrap;

        &.active {
            color: var(--text-color, #FFFFFF);
            font-weight: 600;
        }
    }
}

.horizontal-line {
    width: 100%;
    height: 1px;
    background-color: var(--border-color, #E0E0E0);
    margin: 20px 0;
    transition: background-color 0.3s ease;
}

.composition-section {
    margin-top: 30px;

    .section-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 20px;
        color: var(--text-color, #FFFFFF);
    }

    // 内容为上下结构
    .composition-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .pie-chart-container {
        width: 100%;
        // flex: 0 0 40%;
        // max-width: 40%;
        margin: 0;
        background-color: transparent;

        .pie-chart {
            width: 100%;
            min-height: 160px;
        }
    }

    .legend {
        display: flex;
        gap: 50px;
        margin-top: 0;
        align-items: center;
        justify-content: center;

        .legend-item {
            display: flex;
            align-items: center;
            gap: 12px;

            .legend-color {
                width: 10px;
                height: 10px;
                border-radius: 2px;
                flex-shrink: 0;
            }

            .legend-text {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;

                .legend-label {
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 400;
                    font-size: 12px;
                    color: var(--text-gray, #909090);
                    transition: color 0.3s ease;
                    white-space: nowrap;
                }

                .legend-value {
                    font-family: Noto Sans SC, Noto Sans SC;
                    font-weight: 600;
                    font-size: 12px;
                    color: var(--text-color, #000000);
                    transition: color 0.3s ease;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
            }
        }
    }
}


</style>
