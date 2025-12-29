<template>
    <div class="cmt-current-price">
        <!-- 价格信息区域 -->
        <div class="price-info">
            <div class="price-left">
                <div class="price-title">{{ $t('cmtCurrentPrice.latestPrice') }}</div>
                <div class="price-main">
                    <span class="price-value">${{ currentPrice }}</span>
                </div>
                <div :class="['price-change', priceChangePercent >= 0 ? 'positive' : 'negative']">
                    {{ priceChangePercent >= 0 ? '+' : '' }}{{ priceChangePercent }}%
                </div>
            </div>
            <div class="price-stats">
                <div class="stat-item">
                    <div class="stat-label">{{ $t('cmtCurrentPrice.high24h') }}</div>
                    <div class="stat-value">${{ high24h }}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">{{ $t('cmtCurrentPrice.volume24hCMT') }}</div>
                    <div class="stat-value">{{ volume24hCMT }}万</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">{{ $t('cmtCurrentPrice.low24h') }}</div>
                    <div class="stat-value">${{ low24h }}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">{{ $t('cmtCurrentPrice.volume24hUSDT') }}</div>
                    <div class="stat-value">{{ volume24hUSDT }}亿</div>
                </div>
            </div>
        </div>

        <!-- K线图区域 -->
        <div class="chart-container">
            <!-- 时间周期选择 -->
            <div class="chart-controls">
                <div class="time-periods">
                    <div v-for="period in timePeriods" :key="period.value"
                        :class="['period-item', { active: activePeriod === period.value }]"
                        @click="handlePeriodChange(period.value)">
                        {{ period.label }}
                    </div>
                </div>
                <div class="chart-tools">
                    <div class="tool-item">更多</div>
                    <div class="tool-item">币值</div>
                    <div class="tool-item">
                        <svg t="1766157457641" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="1590" width="20" height="20">
                            <path
                                d="M97.792 866.304H936.96v51.2H97.792zM117.76 561.152h51.2v241.664H117.76zM361.472 476.16h51.2v326.656h-51.2zM608.256 418.816h51.2v384h-51.2zM852.48 341.504h51.2v461.824h-51.2zM874.496 91.648h-195.072v51.2h120.32L578.56 324.096 425.984 192c-8.704-7.68-21.504-8.192-31.232-2.048L117.248 376.32l28.672 42.496 261.632-175.104 154.624 133.12c9.216 8.192 23.552 8.192 32.768 0.512L848.896 168.96v127.488h51.2v-179.2c0-14.336-11.264-25.6-25.6-25.6z"
                                p-id="1591" fill="#ffffff"></path>
                        </svg>
                    </div>
                    <div class="tool-item">
                        <el-icon>
                            <Setting />
                        </el-icon>
                    </div>
                </div>
            </div>

            <!-- ECharts K线图 -->
            <div class="chart-wrapper">
                <div ref="chartRef" class="chart" :style="{ height: chartHeight }"></div>
                <div class="fullscreen-btn" @click="toggleFullscreen" title="全屏查看">
                    <svg viewBox="0 0 1024 1024" width="20" height="20">
                        <path d="M290.133333 290.133333V128H128v162.133333h162.133333z m0 443.733334H128v162.133333h162.133333v-162.133333z m443.734334 0v162.133333h162.133333v-162.133333h-162.133333z m0-443.733334h162.133333V128h-162.133333v162.133333z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Setting } from '@element-plus/icons-vue'

const { t } = useI18n()

// 按需引入 ECharts
import * as echarts from 'echarts/core'
import {
    TooltipComponent,
    GridComponent,
    DataZoomComponent,
    LegendComponent,
    MarkLineComponent,
    MarkPointComponent
} from 'echarts/components'
import { CandlestickChart, LineChart, BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必需的组件
echarts.use([
    TooltipComponent,
    GridComponent,
    DataZoomComponent,
    LegendComponent,
    MarkLineComponent,
    MarkPointComponent,
    CandlestickChart,
    LineChart,
    BarChart,
    CanvasRenderer
])

// 响应式数据
const chartRef = ref(null)
const chartInstance = ref(null)
const activePeriod = ref('1d')
const chartHeight = ref('500px')
const isFullscreen = ref(false)

// 检测是否为移动端
const isMobile = ref(false)
const checkIsMobile = () => {
    if (typeof window !== 'undefined') {
        isMobile.value = window.innerWidth <= 768
        // 移动端调整图表高度
        if (isMobile.value) {
            chartHeight.value = '400px'
        } else {
            chartHeight.value = '500px'
        }
    }
}

// 价格数据
const currentPrice = ref('107,545.46')
const priceChangePercent = ref(-0.22)
const high24h = ref('109,506.03')
const low24h = ref('105,506.03')
const volume24hCMT = ref('41.947')
const volume24hUSDT = ref('451.37')

// 时间周期选项
const timePeriods = computed(() => [
    { label: t('cmtCurrentPrice.timePeriods.5m'), value: '5m' },
    { label: t('cmtCurrentPrice.timePeriods.1h'), value: '1h' },
    { label: t('cmtCurrentPrice.timePeriods.4h'), value: '4h' },
    { label: t('cmtCurrentPrice.timePeriods.1d'), value: '1d' },
])

// 根据时间周期生成日期
const generateDates = (period, count) => {
    const dates = []
    const now = new Date()
    
    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now)
        
        switch (period) {
            case '5m':
                date.setMinutes(date.getMinutes() - i * 5)
                dates.push(date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }))
                break
            case '1h':
                date.setHours(date.getHours() - i)
                dates.push(date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit' }) + ':00')
                break
            case '4h':
                date.setHours(date.getHours() - i * 4)
                dates.push(date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit' }) + ':00')
                break
            case '1d':
            default:
                date.setDate(date.getDate() - i)
                dates.push(date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/'))
                break
        }
    }
    
    return dates
}

// 模拟K线数据 [开盘价, 收盘价, 最低价, 最高价]
const generateKlineData = (period = '1d') => {
    const data = []
    const volumes = [] // 成交量数据
    const dataCount = 60 // 生成60条数据
    let basePrice = 107000

    const dates = generateDates(period, dataCount)

    for (let i = 0; i < dataCount; i++) {
        const open = basePrice + Math.random() * 5000 - 2500
        const close = open + Math.random() * 4000 - 2000
        const low = Math.min(open, close) - Math.random() * 2000
        const high = Math.max(open, close) + Math.random() * 2000
        
        // 生成成交量（与价格波动相关）
        const volume = Math.abs(close - open) * 10 + Math.random() * 5000

        data.push([open, close, low, high])
        volumes.push(volume)
        basePrice = close
    }

    // 计算移动平均线（MA5, MA10, MA20）
    const ma5 = calculateMA(data, 5)
    const ma10 = calculateMA(data, 10)
    const ma20 = calculateMA(data, 20)

    return { dates, data, volumes, ma5, ma10, ma20 }
}

// 计算移动平均线
const calculateMA = (data, period) => {
    const result = []
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push('-')
        } else {
            let sum = 0
            for (let j = 0; j < period; j++) {
                sum += data[i - j][1] // 收盘价
            }
            result.push((sum / period).toFixed(2))
        }
    }
    return result
}

// 初始化图表 - 参考ECharts官方K线图示例
const initChart = () => {
    if (!chartRef.value) return

    // 使用canvas渲染器初始化
    chartInstance.value = echarts.init(chartRef.value, null, {
        renderer: 'canvas',
        useDirtyRect: false,
        clearBeforeRender: true
    })

    const { dates, data, volumes, ma5, ma10, ma20 } = generateKlineData(activePeriod.value)

    const option = {
        backgroundColor: '#000000', // 纯黑色背景
        animation: false,
        useUTC: false,
        legend: {
            data: ['K线', 'MA5', 'MA10', 'MA20', '成交量'],
            top: 8,
            left: 'center',
            textStyle: {
                color: '#8E8E93',
                fontSize: 11
            },
            itemGap: 24,
            icon: 'rect',
            itemWidth: 12,
            itemHeight: 3
        },
        grid: [
            {
                left: isMobile.value ? '1%' : '2%',
                right: isMobile.value ? '6%' : '8%',
                top: isMobile.value ? '10%' : '12%',
                height: isMobile.value ? '68%' : '65%',
                borderColor: '#1A1D26'
            },
            {
                left: isMobile.value ? '1%' : '2%',
                right: isMobile.value ? '6%' : '8%',
                top: isMobile.value ? '83%' : '82%',
                height: isMobile.value ? '10%' : '12%',
                borderColor: '#1A1D26'
            }
        ],
        xAxis: [
            {
                type: 'category',
                data: dates,
                boundaryGap: true,
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: '#1A1D26',
                        width: 1
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#8E8E93',
                    fontSize: isMobile.value ? 9 : 11,
                    formatter: (value) => {
                        // 根据时间周期格式化显示
                        if (activePeriod.value === '5m' || activePeriod.value === '1h') {
                            return value.split(' ')[1] || value
                        }
                        // 移动端简化日期显示
                        if (isMobile.value && activePeriod.value === '1d') {
                            const parts = value.split('/')
                            if (parts.length === 3) {
                                return `${parts[1]}/${parts[2]}`
                            }
                        }
                        return value
                    }
                },
                splitLine: {
                    show: false
                },
                min: 'dataMin',
                max: 'dataMax'
            },
            {
                type: 'category',
                gridIndex: 1,
                data: dates,
                boundaryGap: true,
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: '#1A1D26',
                        width: 1
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                min: 'dataMin',
                max: 'dataMax'
            }
        ],
        yAxis: [
            {
                type: 'value',
                scale: true,
                position: 'right',
                gridIndex: 0,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#8E8E93',
                    fontSize: isMobile.value ? 9 : 11,
                    formatter: (value) => {
                        return (value / 1000).toFixed(0) + 'k'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#1A1D26',
                        type: 'solid',
                        width: 1
                    }
                },
                splitArea: {
                    show: false
                }
            },
            {
                type: 'value',
                gridIndex: 1,
                position: 'right',
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 70,
                end: 100,
                minValueSpan: 1,
                maxValueSpan: 100,
                moveOnMouseMove: false,
                moveOnMouseWheel: !isMobile.value,
                preventDefaultMouseMove: true,
                zoomOnMouseWheel: !isMobile.value,
                zoomLock: false,
                filterMode: 'empty',
                throttle: 50,
                realtime: true,
                // 移动端触摸优化
                ...(isMobile.value ? {
                    moveOnMouseMove: false,
                    moveOnMouseWheel: false,
                    zoomOnMouseWheel: false
                } : {})
            },
            {
                show: true,
                type: 'slider',
                xAxisIndex: [0, 1],
                start: 70,
                end: 100,
                height: isMobile.value ? 25 : 30,
                bottom: isMobile.value ? 3 : 5,
                borderColor: '#1A1D26',
                backgroundColor: '#1A1D26',
                fillerColor: 'rgba(255, 255, 255, 0.1)',
                handleStyle: {
                    color: '#8E8E93',
                    borderColor: '#8E8E93',
                    borderWidth: 1
                },
                textStyle: {
                    color: '#8E8E93',
                    fontSize: isMobile.value ? 9 : 10
                },
                dataBackground: {
                    lineStyle: {
                        color: '#2F3541',
                        width: 1
                    },
                    areaStyle: {
                        color: '#1A1D26'
                    }
                },
                selectedDataBackground: {
                    lineStyle: {
                        color: '#8E8E93',
                        width: 1
                    },
                    areaStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                showDetail: false,
                filterMode: 'empty',
                throttle: 50,
                realtime: true
            }
        ],
        series: [
            {
                name: 'K线',
                type: 'candlestick',
                data: data,
                xAxisIndex: 0,
                yAxisIndex: 0,
                itemStyle: {
                    color: '#00C087', // OKX涨绿色
                    color0: '#F6465D', // OKX跌红色
                    borderColor: '#00C087',
                    borderColor0: '#F6465D',
                    borderWidth: 1
                },
                barMaxWidth: isMobile.value ? '80%' : '70%',
                barMinWidth: isMobile.value ? 1 : 2,
                emphasis: {
                    itemStyle: {
                        borderWidth: 2,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            },
            {
                name: 'MA5',
                type: 'line',
                data: ma5,
                xAxisIndex: 0,
                yAxisIndex: 0,
                smooth: false,
                lineStyle: {
                    color: '#FFB800', // OKX MA5黄色
                    width: 1.5
                },
                symbol: 'none',
                sampling: 'lttb',
                z: 10
            },
            {
                name: 'MA10',
                type: 'line',
                data: ma10,
                xAxisIndex: 0,
                yAxisIndex: 0,
                smooth: false,
                lineStyle: {
                    color: '#00D4FF', // OKX MA10青色
                    width: 1.5
                },
                symbol: 'none',
                sampling: 'lttb',
                z: 10
            },
            {
                name: 'MA20',
                type: 'line',
                data: ma20,
                xAxisIndex: 0,
                yAxisIndex: 0,
                smooth: false,
                lineStyle: {
                    color: '#8E57FF', // OKX MA20紫色
                    width: 1.5
                },
                symbol: 'none',
                sampling: 'lttb',
                z: 10
            },
            {
                name: '成交量',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: volumes,
                itemStyle: {
                    color: (params) => {
                        const dataIndex = params.dataIndex
                        if (dataIndex > 0 && data[dataIndex][1] >= data[dataIndex - 1][1]) {
                            return '#00C087' // 涨绿色
                        }
                        return '#F6465D' // 跌红色
                    },
                    opacity: 0.6
                },
                barMaxWidth: isMobile.value ? '80%' : '70%',
                barMinWidth: isMobile.value ? 1 : 2,
                emphasis: {
                    itemStyle: {
                        opacity: 0.9
                    }
                }
            }
        ],
        tooltip: {
            trigger: 'axis',
                axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#8E8E93',
                    width: 1,
                    type: 'dashed'
                },
                label: {
                    backgroundColor: '#2F3541',
                    borderColor: '#8E8E93',
                    color: '#FFFFFF'
                }
            },
            backgroundColor: '#1A1D26',
            borderColor: '#2F3541',
            borderWidth: 1,
            padding: [10, 14],
            textStyle: {
                color: '#FFFFFF',
                fontSize: isMobile.value ? 11 : 12
            },
            extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);',
            formatter: (params) => {
                if (!params || params.length === 0) return ''
                
                let result = `<div style="margin-bottom: 4px; font-weight: bold; font-size: 13px;">${params[0].name}</div>`
                
                params.forEach((param) => {
                    if (param.seriesName === 'K线' && param.data) {
                        const data = param.data
                        const change = ((data[1] - data[0]) / data[0] * 100).toFixed(2)
                        const changeColor = data[1] >= data[0] ? '#26a69a' : '#ef5350'
                        result += `
                            <div style="margin-top: 6px;">
                                <div style="color: #8E8E93; font-size: 11px; margin-bottom: 4px;">${t('cmtCurrentPrice.tooltip.open')}: <span style="color: #FFFFFF;">$${data[0].toFixed(2)}</span></div>
                                <div style="color: #8E8E93; font-size: 11px; margin-bottom: 4px;">${t('cmtCurrentPrice.tooltip.close')}: <span style="color: #FFFFFF;">$${data[1].toFixed(2)}</span> <span style="color: ${changeColor}; font-weight: 600;">(${change >= 0 ? '+' : ''}${change}%)</span></div>
                                <div style="color: #8E8E93; font-size: 11px; margin-bottom: 4px;">${t('cmtCurrentPrice.tooltip.low')}: <span style="color: #FFFFFF;">$${data[2].toFixed(2)}</span></div>
                                <div style="color: #8E8E93; font-size: 11px;">${t('cmtCurrentPrice.tooltip.high')}: <span style="color: #FFFFFF;">$${data[3].toFixed(2)}</span></div>
                            </div>
                        `
                    } else if (param.seriesName.startsWith('MA') && param.value !== '-') {
                        result += `<div style="margin-top: 4px; color: ${param.color}; font-size: 11px;">${param.seriesName}: <span style="color: #FFFFFF;">$${Number(param.value).toFixed(2)}</span></div>`
                    } else if (param.seriesName === '成交量' && param.value) {
                        result += `<div style="margin-top: 4px; color: #8E8E93; font-size: 11px;">${t('cmtCurrentPrice.tooltip.volume')}: <span style="color: #FFFFFF;">${(param.value / 10000).toFixed(2)}万</span></div>`
                    }
                })
                
                return result
            }
        }
    }

    chartInstance.value.setOption(option, {
        notMerge: true,
        lazyUpdate: false,
        silent: false
    })
}

// 处理时间周期切换
const handlePeriodChange = (period) => {
    activePeriod.value = period
    // 根据不同周期加载不同的数据
    if (chartInstance.value) {
        const { dates, data, volumes, ma5, ma10, ma20 } = generateKlineData(period)
        chartInstance.value.setOption({
            xAxis: [
                {
                    data: dates
                },
                {
                    data: dates
                }
            ],
            series: [
                {
                    data: data
                },
                {
                    data: ma5
                },
                {
                    data: ma10
                },
                {
                    data: ma20
                },
                {
                    data: volumes
                }
            ],
            dataZoom: [
                {
                    start: 70,
                    end: 100
                },
                {
                    start: 70,
                    end: 100
                }
            ]
        }, {
            notMerge: false,
            lazyUpdate: false
        })
    }
}

// 全屏切换
const toggleFullscreen = () => {
    const chartWrapper = chartRef.value?.parentElement
    if (!chartWrapper) return

    if (!isFullscreen.value) {
        // 进入全屏
        if (chartWrapper.requestFullscreen) {
            chartWrapper.requestFullscreen()
        } else if (chartWrapper.webkitRequestFullscreen) {
            chartWrapper.webkitRequestFullscreen()
        } else if (chartWrapper.mozRequestFullScreen) {
            chartWrapper.mozRequestFullScreen()
        } else if (chartWrapper.msRequestFullscreen) {
            chartWrapper.msRequestFullscreen()
        }
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
        }
    }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
    isFullscreen.value = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    )
    
    // 全屏状态改变后重新调整图表大小
    nextTick(() => {
        if (chartInstance.value) {
            chartInstance.value.resize()
        }
    })
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
    checkIsMobile()
    if (chartInstance.value) {
        chartInstance.value.resize()
        // 移动端切换时重新初始化图表配置
        nextTick(() => {
            if (chartInstance.value) {
                const { dates, data, volumes, ma5, ma10, ma20 } = generateKlineData(activePeriod.value)
                chartInstance.value.setOption({
                    legend: {
                        top: isMobile.value ? 5 : 8,
                        textStyle: {
                            fontSize: isMobile.value ? 10 : 11
                        },
                        itemGap: isMobile.value ? 16 : 24,
                        itemWidth: isMobile.value ? 10 : 12
                    },
                    grid: [
                        {
                            left: isMobile.value ? '1%' : '2%',
                            right: isMobile.value ? '6%' : '8%',
                            top: isMobile.value ? '10%' : '12%',
                            height: isMobile.value ? '68%' : '65%'
                        },
                        {
                            left: isMobile.value ? '1%' : '2%',
                            right: isMobile.value ? '6%' : '8%',
                            top: isMobile.value ? '83%' : '82%',
                            height: isMobile.value ? '10%' : '12%'
                        }
                    ],
                    xAxis: [
                        {
                            axisLabel: {
                                fontSize: isMobile.value ? 9 : 11
                            }
                        },
                        {}
                    ],
                    yAxis: [
                        {
                            axisLabel: {
                                fontSize: isMobile.value ? 9 : 11
                            }
                        },
                        {}
                    ],
                    dataZoom: [
                        {
                            height: isMobile.value ? 25 : 30,
                            bottom: isMobile.value ? 3 : 5,
                            textStyle: {
                                fontSize: isMobile.value ? 9 : 10
                            }
                        },
                        {}
                    ],
                    series: [
                        {
                            barMaxWidth: isMobile.value ? '80%' : '70%',
                            barMinWidth: isMobile.value ? 1 : 2
                        },
                        {},
                        {},
                        {},
                        {
                            barMaxWidth: isMobile.value ? '80%' : '70%',
                            barMinWidth: isMobile.value ? 1 : 2
                        }
                    ],
                    tooltip: {
                        textStyle: {
                            fontSize: isMobile.value ? 11 : 12
                        }
                    }
                }, false)
            }
        })
    }
}

onMounted(() => {
    checkIsMobile()
    initChart()
    handlePeriodChange("1d")
    window.addEventListener('resize', handleResize)
    window.addEventListener('resize', checkIsMobile)
    
    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
    if (chartInstance.value) {
        chartInstance.value.dispose()
    }
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('resize', checkIsMobile)
    
    // 移除全屏监听
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    document.removeEventListener('msfullscreenchange', handleFullscreenChange)
})
</script>

<style scoped lang="scss">
.cmt-current-price {
    width: 100%;
    color: var(--text-color, #1a1a1a);
}

.price-info {
    padding: 20px 0px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;

    .price-left {
        flex: 0 0 auto;

        .price-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #000000);
            margin-bottom: 12px;
        }

        .price-main {
            margin-bottom: 8px;

            .price-value {
                font-size: 28px;
                font-weight: bold;
                color: #ef5350;
                line-height: 1.2;
            }
        }

        .price-change {
            font-size: 16px;
            font-weight: 500;

            &.positive {
                color: #26a69a;
            }

            &.negative {
                color: #ef5350;
            }
        }
    }

    .price-stats {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px 32px;
        align-content: center;

        .stat-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .stat-label {
                font-size: 13px;
                color: var(--text-gray, #909090);
                font-weight: 400;
            }

            .stat-value {
                font-size: 15px;
                font-weight: 600;
                color: var(--text-color, #000000);
            }
        }
    }
}

.chart-container {
    padding: 12px 0px;
    border-radius: 8px;
    background-color: #000000; // 纯黑色背景
    border: 1px solid #1A1D26;

    .chart-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 0 10px;
        box-sizing: border-box;

        .time-periods {
            display: flex;
            gap: 16px;

            .period-item {
                font-size: 14px;
                color: #999;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 20px;
                transition: all 0.3s ease;
                user-select: none;

                &.active {
                    color: white;
                    background-color: #383838;
                }

                &:hover {
                    color: #fff;
                }
            }
        }

        .chart-tools {
            display: flex;
            gap: 12px;
            align-items: center;

            .tool-item {
                font-size: 12px;
                color: #999;
                cursor: pointer;
                display: flex;
                align-items: center;
                transition: color 0.3s ease;

                &:hover {
                    color: #fff;
                }

                .el-icon {
                    font-size: 16px;
                }
            }
        }
    }

    .chart-wrapper {
        position: relative;
        width: 100%;
        
        .chart {
            width: 100%;
            min-height: 400px;
            
            @media (max-width: 768px) {
                min-height: 350px;
            }
        }
        
        .fullscreen-btn {
            position: absolute;
            left: 10px;
            bottom: 40px;
            width: 32px;
            height: 32px;
            background-color: rgba(26, 29, 38, 0.8);
            border: 1px solid #2F3541;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #8E8E93;
            transition: all 0.3s ease;
            z-index: 10;
            
            &:hover {
                background-color: rgba(47, 53, 65, 0.9);
                color: #FFFFFF;
            }
            
            &:active {
                transform: scale(0.95);
            }
        }
        
        // 全屏状态样式
        &:fullscreen,
        &:-webkit-full-screen,
        &:-moz-full-screen,
        &:-ms-fullscreen {
            background-color: var(--bg-page-h5, #ffffff);
            padding: 20px;
            
            .chart {
                height: 100vh !important;
            }
            
            .fullscreen-btn {
                bottom: 60px;
            }
        }
    }
}

// 暗色主题适配
:deep(.theme-dark) {
    .cmt-current-price {
        background-color: var(--bg-page-h5, #141414);
        color: var(--text-color, #f2f2f2);
    }

    .price-info {
        .price-title {
            color: var(--text-gray, #a0a0a0);
        }

        .price-stats {
            .stat-item {
                .stat-label {
                    color: var(--text-gray, #a0a0a0);
                }

                .stat-value {
                    color: var(--text-color, #f2f2f2);
                }
            }
        }
    }

    .chart-controls {
        .time-periods {
            .period-item {
                color: rgba(255, 255, 255, 0.6);
                border-color: rgba(255, 255, 255, 0.2);

                &.active {
                    background-color: #2F2F2F;
                    color: #FFFFFF;
                    border-color: #2F2F2F;
                }

                &:hover {
                    color: #FFFFFF;
                }
            }
        }
    }
}

// 浅色主题适配
:deep(.theme-light) {
    .cmt-current-price {
        background-color: var(--bg-page-h5, #FFFFFF);
        color: var(--text-color, #1a1a1a);
    }

    .price-info {
        .price-title {
            color: var(--text-gray, #666);
        }

        .price-stats {
            .stat-item {
                .stat-label {
                    color: var(--text-gray, #666);
                }

                .stat-value {
                    color: var(--text-color, #1a1a1a);
                }
            }
        }
    }

    .chart-controls {
        .time-periods {
            .period-item {
                color: rgba(0, 0, 0, 0.6);
                border-color: rgba(0, 0, 0, 0.2);

                &.active {
                    background-color: #F5F5F5;
                    color: #000000;
                    border-color: #F5F5F5;
                }

                &:hover {
                    color: #000000;
                }
            }
        }
    }
}
</style>
