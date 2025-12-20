<template>
    <div class="lp-vault">
        <!-- LP金库(CMT)卡片 -->
        <div class="vault-card">
            <div class="card-title">盈利金额</div>
            <div class="card-value">

                <div class="left">{{ vaultCMT }}</div>
                <div class="right">
                    <div class="item">
                        <b>24小时盈利(CMT)</b>
                        <span>41.94万</span>
                    </div>
                    <div class="item">
                        <b>24小时盈利(USDT)</b>
                        <span>41.94万</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-container">
            <div ref="chartRef" class="chart" :style="{ height: chartHeight }"></div>
        </div>
        <div class="cardGrid">
            <div class="card">
                <div>二级市场盈利金额</div>
                <div>$200,000</div>
            </div>
            <div class="card">
                <div>用户盈利金额</div>
                <div>$188,000</div>
            </div>
            <div class="card">
                <div>销毁的USDT数量</div>
                <div>200,000</div>
            </div>
            <div class="card">
                <div>销毁的CMT数量</div>
                <div>188,000</div>
            </div>
        </div>
        <!-- LP金库市值(USDT)卡片 -->
        <div class="vault-card">
            <div class="card-title">FOMO盈利金额</div>
            <div class="card-value">

                <div class="left">$10000.00</div>
                <div class="right">
                    <div class="item">
                        <b>24小时FOMO量(CMT)</b>
                        <span>41.94万</span>
                    </div>
                    <div class="item">
                        <b>24小时FOMO量(USDT)</b>
                        <span>41.94万</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-container">
            <div ref="lpChartRef" class="chart" :style="{ height: chartHeight }"></div>
        </div>


        <div class="vault-card">
            <div class="card-title">最新市值</div>
            <div class="card-value1">

                <div class="top">
                    <div class="item">
                        <b>USDT:</b>
                        <span>10000000</span>
                    </div>
                    <div class="item">
                        <b>CMT:</b>
                        <span> 200000</span>
                    </div>
                </div>
                <div class="bottom">
                    <div class="item">
                        <b>24小时FOMO量(CMT)</b>
                        <span>41.94万</span>
                    </div>
                    <div class="item">
                        <b>24小时FOMO量(USDT)</b>
                        <span>41.94万</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-container">
            <div ref="lpChartRef2" class="chart" :style="{ height: chartHeight }"></div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const chartRef = ref(null)
const lpChartRef = ref(null)
const lpChartRef2 = ref(null)
const chartInstance = ref(null)
const lpChartInstance = ref(null)
const lpChartInstance2 = ref(null)
const chartHeight = ref('400px')

// LP金库数据
const vaultCMT = ref('1000000')
const vaultUSDT = ref('10000000')

// 生成面积图数据
const generateAreaData = (maxValue) => {
    const data = []
    const dates = []
    let baseValue = maxValue * 0.6 // 起始值为最大值的60%
    const dataCount = 180 // 6个月数据

    for (let i = 0; i < dataCount; i++) {
        const date = new Date('2025-12-19')
        date.setDate(date.getDate() - (dataCount - i))
        dates.push(date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '/'))

        // 生成波动数据
        const change = (Math.random() - 0.4) * (maxValue * 0.05)
        baseValue = Math.max(maxValue * 0.5, Math.min(maxValue, baseValue + change))
        data.push(baseValue)
    }

    return { dates, data }
}

// 初始化图表
const initChart = (chartElement, chartInstanceRef, maxValue, unit) => {
    if (!chartElement) return

    chartInstanceRef.value = echarts.init(chartElement)

    const { dates, data } = generateAreaData(maxValue)

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
                    // 根据单位格式化
                    if (unit === 'CMT') {
                        return (value / 1000000).toFixed(1) + '百万'
                    } else {
                        return (value / 1000000).toFixed(1) + '百万'
                    }
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
                const displayValue = (value / 1000000).toFixed(2)
                return `
                    <div style="font-size: 11px; line-height: 1.5;">
                        <div style="margin-bottom: 4px;">${params[0].name}</div>
                        <div style="color: #4A90E2; font-weight: bold;">${displayValue}百万 ${unit}</div>
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
    if (lpChartInstance2.value) {
        lpChartInstance2.value.resize()
    }
}

onMounted(() => {
    initChart(chartRef.value, chartInstance, 5000000, 'CMT')
    initChart(lpChartRef.value, lpChartInstance, 12000000, 'USDT')
    initChart(lpChartRef2.value, lpChartInstance2, 33000000, 'USDT')
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (chartInstance.value) {
        chartInstance.value.dispose()
    }
    if (lpChartInstance.value) {
        lpChartInstance.value.dispose()
    }
    if (lpChartInstance2.value) {
        lpChartInstance2.value.dispose()
    }
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.lp-vault {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.cardGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .card {
        height: 80px;
        border-radius: 8px;
        border: 1px solid var(--border-color, #F3F3F3);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: var(--bg-card, #ffffff);

        div:first-of-type {
            color: var(--text-dark-gray, #999999)
        }

        div:last-of-type {
            font-weight: bold;
            font-size: 24px;
            color: #25A750;
        }

    }
}

.vault-card {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .card-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 20px;
        color: var(--text-color, #1a1a1a);
    }

    .card-value {
        display: flex;
        font-family: DIN, DIN;
        align-items: center;
        justify-content: space-between;

        .left {
            font-weight: bold;
            font-size: 28px;
            color: #25A750;
        }

        .right {
            .item {
                text-align: right;
                height: 12px;
                display: flex;
                align-items: center;
                margin-bottom: 4px;
                justify-content: space-between;
                gap: 10px;

                b {
                    font-weight: 400;
                    font-size: 10px;
                    color: var(--text-dark-gray, #999999);
                }

                span {
                    font-weight: 600;
                    font-size: 10px;
                    color: var(--text-color, #1a1a1a);
                }
            }
        }


    }

    .card-value1 {




        .top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 8px;

            b {
                color: var(--text-dark-gray, #999999);
            }

            span {
                color: #25A750;
            }
        }

        .bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
           
            .item {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                align-items: center;
                 b {
                    font-weight: 400;
                    font-size: 10px;
                    color: var(--text-dark-gray, #999999);
                }
                span {
                    font-weight: 600;
font-size: 10px;
color: var(--text-color, #1a1a1a);
                }
            }
        }
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

// 移动端适配
@media screen and (max-width: 768px) {
    .vault-card {
        padding: 16px 12px;

        .card-title {
            font-size: 18px;
        }

        .card-value {
            font-size: 24px;
        }
    }

    .chart-container {
        .chart {
            min-height: 300px;
        }
    }
}

// 暗色主题适配
:global(.dark) {
    .vault-card {
        background-color: var(--bg-card-dark, #1a1a1a);
    }

    .chart-container {
        background-color: var(--bg-card-dark, #1a1a1a);
    }
}
</style>
