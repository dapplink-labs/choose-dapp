<template>
    <div class="lp-vault">
        <!-- 顶部三个指标 -->
        <div class="metrics-row">
            <div class="metric-card">
                <div class="metric-label">{{ $t('marketReturns.secondaryMarketProfit') }}</div>
                <div class="metric-value">10M</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">{{ $t('marketReturns.userProfit') }}</div>
                <div class="metric-value">180,000</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">{{ $t('marketReturns.destroyedCMT') }}</div>
                <div class="metric-value">96,358</div>
            </div>
        </div>

        <!-- 我的盈利金额 -->
        <div class="profit-section">
            <div class="profit-title">{{ $t('marketReturns.myProfit') }}</div>
            <div class="profit-main-value">+ $107,545.46</div>
            <div class="profit-24h">
                <div class="profit-item">
                    <span class="profit-label">{{ $t('marketReturns.profit24hCHO') }}</span>
                    <span class="profit-value">41.94万</span>
                </div>
                <div class="profit-item">
                    <span class="profit-label">{{ $t('marketReturns.profit24hUSDT') }}</span>
                    <span class="profit-value">41.94万</span>
                </div>
            </div>
        </div>

        <!-- 周盈利柱状图 -->
        <div class="chart-container">
            <div ref="chartRef" class="chart"></div>
        </div>

        <!-- FOMO盈利金额模块 -->
        <div class="fomo-section">
            <div class="section-title">{{ $t('marketReturns.fomoProfit') }}</div>
            <div class="section-main-value">+ $107,545.46</div>
            <div class="section-24h">
                <div class="section-item">
                    <div class="section-label">
                        <span>{{ $t('marketReturns.fomoVolume24hCMT') }}</span>
                        <span class="section-value">41.94万</span>
                    </div>
                </div>
                <div class="section-item">
                    <div class="section-label">
                        <span>{{ $t('marketReturns.fomoVolume24hUSDT') }}</span>
                        <span class="section-value">41.94万</span>
                    </div>
                </div>
            </div>
            <div class="section-date-range">
                <p>2024/12/20 - 2025/12/20</p>
            </div>
            <div class="section-chart-container">
                <div ref="fomoChartRef" class="section-chart"></div>
            </div>
        </div>

        <!-- 最新市值模块 -->
        <div class="market-value-section">
            <div class="section-title">{{ $t('marketReturns.latestMarketValue') }}</div>
            <div class="market-metrics">
                <div class="market-metric">
                    <span class="market-label">USDT</span>
                    <span class="market-value">10M</span>
                </div>
                <div class="market-metric">
                    <span class="market-label">CHO</span>
                    <span class="market-value">180,000</span>
                </div>
            </div>
            <div class="section-24h">
                <div class="section-item">
                    <span class="section-label">{{ $t('marketReturns.volume24hCMT') }}</span>
                    <span class="section-value">10M</span>
                </div>
                <div class="section-item">
                    <span class="section-label">{{ $t('marketReturns.volume24hUSDT') }}</span>
                    <span class="section-value">180,000</span>
                </div>
            </div>
            <div class="section-date-range">
                <p>2024/12/20 - 2025/12/20</p>
            </div>
            <div class="section-chart-container">
                <div ref="marketChartRef" class="section-chart"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import * as echarts from 'echarts'

const { t } = useI18n()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 响应式数据
const chartRef = ref(null)
const chartInstance = ref(null)
const fomoChartRef = ref(null)
const fomoChartInstance = ref(null)
const marketChartRef = ref(null)
const marketChartInstance = ref(null)

// 生成周盈利数据
const generateWeeklyData = () => {
    const weeks = ['近11周', '9周', '7周', '5周', '3周', '1周']
    // 根据图片，数据有正有负，绿色表示盈利，红色表示亏损
    // 从右到左：近11周(正), 9周(正), 7周(负), 5周(正), 3周(负), 1周(正)
    const data = [
        116.22,   // 近11周 - 盈利
        116.22,   // 9周 - 盈利
        -145.73,  // 7周 - 亏损
        116.22,   // 5周 - 盈利
        -407.68,  // 3周 - 亏损
        640.11    // 1周 - 盈利（最高）
    ]

    return { weeks, data }
}

// 生成FOMO/市值柱状图数据
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

// 初始化柱状图
const initChart = () => {
    if (!chartRef.value) return

    if (chartInstance.value) {
        chartInstance.value.dispose()
    }

    chartInstance.value = echarts.init(chartRef.value)

    const { weeks, data } = generateWeeklyData()
    const colors = getThemeColors()

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
            data: weeks,
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
            min: -450,
            max: 700,
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
                    return `${value.toFixed(2)}k`
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
                data: data.map((value, index) => ({
                    value: value,
                    itemStyle: {
                        color: value >= 0 ? '#25A750' : '#FF4444',
                        borderRadius: [4, 4, 0, 0]
                    }
                })),
                barWidth: '40%',
                label: {
                    show: false
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
                const param = params[0]
                const value = param.data.value || param.data
                const color = value >= 0 ? '#25A750' : '#FF4444'
                return `
                    <div style="font-size: 12px;">
                        <div style="margin-bottom: 4px;">${param.name}</div>
                        <div style="color: ${color}; font-weight: bold;">${value >= 0 ? '+' : ''}${value.toFixed(2)}k</div>
                    </div>
                `
            }
        }
    }

    chartInstance.value.setOption(option)
}

// 初始化FOMO/市值柱状图
const initBarChart = (chartElement, chartInstanceRef) => {
    if (!chartElement) return

    if (chartInstanceRef.value) {
        chartInstanceRef.value.dispose()
    }

    chartInstanceRef.value = echarts.init(chartElement)

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

    chartInstanceRef.value.setOption(option)
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
    if (chartInstance.value) {
        chartInstance.value.resize()
    }
    if (fomoChartInstance.value) {
        fomoChartInstance.value.resize()
    }
    if (marketChartInstance.value) {
        marketChartInstance.value.resize()
    }
}

// 监听主题变化，重新渲染图表
watch(isDark, () => {
    if (chartInstance.value) {
        initChart()
    }
    if (fomoChartInstance.value) {
        initBarChart(fomoChartRef.value, fomoChartInstance)
    }
    if (marketChartInstance.value) {
        initBarChart(marketChartRef.value, marketChartInstance)
    }
})

onMounted(() => {
    initChart()
    initBarChart(fomoChartRef.value, fomoChartInstance)
    initBarChart(marketChartRef.value, marketChartInstance)
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (chartInstance.value) {
        chartInstance.value.dispose()
    }
    if (fomoChartInstance.value) {
        fomoChartInstance.value.dispose()
    }
    if (marketChartInstance.value) {
        marketChartInstance.value.dispose()
    }
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.lp-vault {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.metrics-row {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    border-bottom: 1px solid #23262F;
    padding-bottom: 10px;
}

.metric-card {
    flex: 1;
    padding: 16px 0px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: background-color 0.3s ease, color 0.3s ease;

    .metric-label {
        font-size: 14px;
        color: var(--text-gray, rgba(255, 255, 255, 0.6));
        font-weight: 400;
        transition: color 0.3s ease;
    }

    .metric-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-color, #FFFFFF);
        transition: color 0.3s ease;
    }
}

.profit-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: background-color 0.3s ease;

    .profit-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 20px;
        color: var(--text-color, #FFFFFF);
        transition: color 0.3s ease;
    }

    .profit-main-value {
        font-family: DIN, DIN;
        font-weight: bold;
        font-size: 28px;
        color: var(--text-color-y, #ffd94b);
        line-height: 48px;
    }

    .profit-24h {
        display: flex;
        flex-direction: row;
        gap: 0;
        padding-top: 16px;

        .profit-item {
            flex: 1;
            display: flex;
            gap: 8px;
            position: relative;


            .profit-label {
                font-size: 11px;
                color: var(--text-gray, rgba(255, 255, 255, 0.6));
                border-bottom: 1px dashed #707070;
                padding-bottom: 5px;
                transition: color 0.3s ease;
            }

            .profit-value {
                font-size: 11px;
                color: var(--text-color, #FFFFFF);
                transition: color 0.3s ease;
            }
        }
    }
}

.chart-container {
    border-radius: 12px;
    transition: background-color 0.3s ease;

    .chart {
        width: 100%;
        min-height: 300px;
    }
}

.fomo-section,
.market-value-section {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .section-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 20px;
        color: var(--text-color, #FFFFFF);
        transition: color 0.3s ease;
    }

    .section-main-value {
        font-family: DIN, DIN;
        font-weight: bold;
        font-size: 28px;
        color: var(--text-color-y, #ffd94b);
        line-height: 48px;
    }

    .market-metrics {
        display: flex;
        gap: 0;

        .market-metric {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
            position: relative;


            .market-label {
                font-size: 14px;
                color: var(--text-gray, rgba(255, 255, 255, 0.6));
                transition: color 0.3s ease;
            }

            .market-value {
                font-family: DIN, DIN;
                font-weight: bold;
                font-size: 24px;
                color: #2FBC87;
            }
        }
    }

    .section-24h {
        display: flex;
        flex-direction: row;
        gap: 0;

        .section-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
            position: relative;


            .section-label {
                font-size: 11px;
                color: var(--text-gray, rgba(255, 255, 255, 0.6));
                transition: color 0.3s ease;
            }

            .section-value {
                font-size: 11px;
                margin-left: 5px;
                color: var(--text-color, #FFFFFF);
                transition: color 0.3s ease;
            }
        }
    }

    .section-date-range {
        font-size: 14px;
        color: var(--text-gray, rgba(255, 255, 255, 0.6));
        transition: color 0.3s ease;

        p {
            display: inline-block;
            border-bottom: 1px dashed #707070;
            padding-bottom: 5px;
        }
    }

    .section-chart-container {

        .section-chart {
            width: 100%;
            min-height: 250px;
        }
    }
}

.market-value-section {
    .section-label {
        font-size: 14px !important;
    }

    .section-value {
        font-weight: bold !important;
        font-size: 24px !important;
    }
}

// 暗色主题适配
:deep(.theme-dark) {
    .metric-card {
        .metric-label {
            color: rgba(255, 255, 255, 0.6);
        }

        .metric-value {
            color: #FFFFFF;
        }
    }

    .profit-section {
        .profit-title {
            color: #FFFFFF;
        }

        .profit-main-value {
            color: var(--text-color-y, #ffd94b);
        }

        .profit-24h {
            .profit-label {
                color: rgba(255, 255, 255, 0.6);
            }

            .profit-value {
                color: #FFFFFF;
            }
        }
    }

    .fomo-section,
    .market-value-section {
        .section-title {
            color: #FFFFFF;
        }

        .section-main-value {
            color: var(--text-color-y, #ffd94b);
        }

        .market-metrics {
            .market-label {
                color: rgba(255, 255, 255, 0.6);
            }

            .market-value {
                color: #2FBC87;
            }
        }

        .section-24h {
            .section-label {
                color: rgba(255, 255, 255, 0.6);
            }

            .section-value {
                color: #FFFFFF;
            }
        }

        .section-date-range {
            color: rgba(255, 255, 255, 0.6);

            p {
                border-bottom-color: #707070;
            }
        }
    }
}

// 浅色主题适配
:deep(.theme-light) {
    .metric-card {
        .metric-label {
            color: rgba(0, 0, 0, 0.6);
        }

        .metric-value {
            color: #000000;
        }
    }

    .profit-section {
        .profit-title {
            color: #000000;
        }

        .profit-main-value {
            color: #2FBC87;
        }

        .profit-24h {
            .profit-label {
                color: rgba(0, 0, 0, 0.6);
            }

            .profit-value {
                color: #000000;
            }
        }
    }

    .fomo-section,
    .market-value-section {
        .section-title {
            color: #000000;
        }

        .section-main-value {
            color: #2FBC87;
        }

        .market-metrics {
            .market-label {
                color: rgba(0, 0, 0, 0.6);
            }

            .market-value {
                color: #2FBC87;
            }
        }

        .section-24h {
            .section-label {
                color: rgba(0, 0, 0, 0.6);
            }

            .section-value {
                color: #000000;
            }
        }

        .section-date-range {
            color: rgba(0, 0, 0, 0.6);

            p {
                border-bottom-color: #707070;
            }
        }
    }
}
</style>
