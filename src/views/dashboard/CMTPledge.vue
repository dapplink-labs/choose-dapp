<template>
    <div class="cmt-pledge">
        <!-- 质押总额卡片 -->
        <div class="pledge-card">
            <div class="card-title">{{ $t('cmtPledge.pledgeTotal') }}</div>
            <div class="card-value">${{ pledgeTotal }}</div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-container">
            <div ref="chartRef" class="chart" :style="{ height: chartHeight }"></div>
        </div>

        <!-- 时间选择器 -->
        <div class="time-selector">
            <div 
                v-for="(period, index) in timePeriods" 
                :key="index"
                :class="['time-item', { active: selectedPeriod === index }]"
                @click="selectedPeriod = index"
            >
                {{ period }}
            </div>
        </div>

        <div class="horizontal-line"></div>

        <!-- LP质押销毁卡片 -->
        <div class="pledge-card">
            <div class="card-title">{{ $t('cmtPledge.lpPledgeDestroy') }}</div>
            <div class="card-value">${{ lpPledgeTotal }}</div>
            <div class="date-range">{{ dateRange }}</div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-container">
            <div ref="lpChartRef" class="chart" :style="{ height: chartHeight }"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import * as echarts from 'echarts'

const { t } = useI18n()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 响应式数据
const chartRef = ref(null)
const lpChartRef = ref(null)
const chartInstance = ref(null)
const lpChartInstance = ref(null)
const chartHeight = ref('300px')

// 质押数据
const pledgeTotal = ref('107,545.46')
const lpPledgeTotal = ref('107,545.46')
const dateRange = ref('2024/12/20 - 2025/12/20')

// 时间选择器
const timePeriods = computed(() => [
  t('cmtPledge.timePeriods.7d'),
  t('cmtPledge.timePeriods.30d'),
  t('cmtPledge.timePeriods.90d'),
  t('cmtPledge.timePeriods.1y'),
  t('cmtPledge.timePeriods.all')
])
const selectedPeriod = ref(4) // 默认选中"全部"

// 生成折线图数据（质押总额）
const generateLineData = () => {
    const data = []
    const dates = ['10/04', '10/23', '11/11', '11/30', '12/20']
    // 根据图片，数据从约2.17亿增长到约26亿，然后下降
    const values = [217303044.08, 800000000, 1500000000, 2000000000, 2609786405.78, 1800000000]
    
    // 为每个日期生成对应的值
    dates.forEach((date, index) => {
        if (index < values.length - 1) {
            data.push(values[index])
        }
    })

    return { dates, data }
}

// 生成柱状图数据（LP质押销毁）
const generateBarData = () => {
    const dates = ['04/07', '05/07', '07/06', '09/04', '11/03']
    // 根据图片，柱状图的值
    const values = [5.57, 0, 22.31, 5.57, 0.5]
    
    return { dates, data: values }
}

// 获取主题相关的颜色
const getThemeColors = () => {
    const isDarkMode = isDark.value
    return {
        axisLabelColor: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        splitLineColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        tooltipBg: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        tooltipBorder: isDarkMode ? '#333' : '#E0E0E0',
        tooltipText: isDarkMode ? '#fff' : '#000'
    }
}

// 初始化折线图（质押总额）
const initLineChart = (chartElement) => {
    if (!chartElement) return

    if (chartInstance.value) {
        chartInstance.value.dispose()
    }

    chartInstance.value = echarts.init(chartElement)
    
    const { dates, data } = generateLineData()
    const colors = getThemeColors()

    const option = {
        backgroundColor: 'transparent',
        grid: {
            left: 50,
            right: 20,
            bottom: 40,
            top: 20,
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
                }
            }
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
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

    chartInstance.value.setOption(option)
}

// 初始化柱状图（LP质押销毁）
const initBarChart = (chartElement) => {
    if (!chartElement) return

    if (lpChartInstance.value) {
        lpChartInstance.value.dispose()
    }

    lpChartInstance.value = echarts.init(chartElement)
    
    const { dates, data } = generateBarData()
    const colors = getThemeColors()

    const option = {
        backgroundColor: 'transparent',
        grid: {
            left: 50,
            right: 20,
            bottom: 40,
            top: 20,
            containLabel: false
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: {
                show: false
            },
            axisLabel: {
                color: colors.axisLabelColor,
                fontSize: 12
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
                    if (value > 0) {
                        return `+${value.toFixed(2)}`
                    }
                    return value.toFixed(2)
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
                type: 'bar',
                data: data,
                itemStyle: {
                    color: '#00952C',
                    borderRadius: [4, 4, 0, 0]
                },
                barWidth: '40%'
            }
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            textStyle: {
                color: colors.tooltipText,
                fontSize: 12
            },
            formatter: (params) => {
                const value = params[0].data
                return `
                    <div style="font-size: 12px;">
                        <div style="margin-bottom: 4px;">${params[0].name}</div>
                        <div style="color: #00952C; font-weight: bold;">+${value.toFixed(2)}</div>
                    </div>
                `
            }
        }
    }

    lpChartInstance.value.setOption(option)
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

// 监听主题变化，重新渲染图表
watch(isDark, () => {
    if (chartInstance.value) {
        initLineChart(chartRef.value)
    }
    if (lpChartInstance.value) {
        initBarChart(lpChartRef.value)
    }
})

onMounted(() => {
    initLineChart(chartRef.value)
    initBarChart(lpChartRef.value)
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
    display: flex;
    flex-direction: column;
    gap: 8px;

    .card-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 20px;
        color: var(--text-color, #FFFFFF);
        transition: color 0.3s ease;
    }

    .card-value {
        font-family: DIN, DIN;
        font-weight: bold;
        font-size: 28px;
        color: var(--text-color, #FFFFFF);
        transition: color 0.3s ease;
    }

    .date-range {
        font-size: 14px;
        color: var(--text-gray, rgba(255, 255, 255, 0.6));
        margin-top: 4px;
        transition: color 0.3s ease;
    }
}

.chart-container {

    .chart {
        width: 100%;
        min-height: 250px;
    }
}

.time-selector {
    display: flex;
    gap: 12px;
    padding: 0 16px;
    margin-bottom: 24px;

    .time-item {
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        color: var(--text-gray, rgba(255, 255, 255, 0.6));
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;

        &.active {
            background-color: var(--bg-light, #2F2F2F);
            color: var(--text-color, #FFFFFF);
        }

        &:hover {
            color: var(--text-color, #FFFFFF);
        }
    }
}
.horizontal-line{
    width: 100%;
    height: 1px;
    background-color: var(--border-color, #23262F);
    margin-bottom: 36px;
    transition: background-color 0.3s ease;
}

// 暗色主题适配
:deep(.theme-dark) {
    .pledge-card {
        .card-title {
            color: #FFFFFF;
        }

        .card-value {
            color: #FFFFFF;
        }

        .date-range {
            color: rgba(255, 255, 255, 0.6);
        }
    }

    .time-selector {
        .time-item {
            color: rgba(255, 255, 255, 0.6);

            &.active {
                background-color: #2F2F2F;
                color: #FFFFFF;
            }

            &:hover {
                color: #FFFFFF;
            }
        }
    }

    .horizontal-line {
        background-color: #23262F;
    }
}

// 浅色主题适配
:deep(.theme-light) {
    .pledge-card {
        .card-title {
            color: var(--text-color, #000000);
        }

        .card-value {
            color: var(--text-color, #000000);
        }

        .date-range {
            color: var(--text-gray, rgba(0, 0, 0, 0.6));
        }
    }

    .time-selector {
        .time-item {
            color: var(--text-gray, rgba(0, 0, 0, 0.6));

            &.active {
                background-color: var(--bg-light, #F5F5F5);
                color: var(--text-color, #000000);
            }

            &:hover {
                color: var(--text-color, #000000);
            }
        }
    }

    .horizontal-line {
        background-color: var(--border-color, #E0E0E0);
    }
}
</style>
