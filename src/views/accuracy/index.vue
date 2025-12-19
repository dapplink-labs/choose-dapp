<template>
  <div class="accuracy-page">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 导航栏 -->
      <NavBar2 />
      <div class="content-wrapper">
        <!-- 左右布局 -->
        <div class="page-layout">
          <!-- 左侧部分：Tab切换列表 -->
          <div class="left-section">
            <div class="tab-list">
              <div class="tab-item">
                <div :class="['tab-label', { active: activeTab === 0 }]" @click="handleTabChange(0)">总体准确率</div>
                <div :class="['tab-label', { active: activeTab === 1 }]" @click="handleTabChange(1)">预期值与实际值</div>
              </div>
            </div>
          </div>

          <!-- 右侧部分：主体内容 -->
          <div class="right-section">

            <!-- 主体内容区域 -->
            <div class="main-content-area">
              <!-- 主标题 -->
              <h1 class="main-title">Multimarket 的准确性如何?</h1>

              <!-- 准确率指标 -->
              <div class="accuracy-metrics">
                <div class="metric-item">
                  <div class="metric-value primary">{{ metrics.fourHour }}%</div>
                  <div class="metric-label">4小时准确率</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value secondary">{{ metrics.oneMonth }}%</div>
                  <div class="metric-label">1个月的准确率</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value secondary">{{ metrics.brillScore }}</div>
                  <div class="metric-label">布里尔评分</div>
                </div>
              </div>

              <!-- 分辨率之前的准确性图表 -->
              <LineChartAccuracy :data="chartData" />

              <!-- 分割线 -->
              <div class="divider"></div>

              <!-- 预期值与实际值图表 -->
              <LineChartAccuracyTow :data="barChartData" />
            </div>


          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar2 from '@/components/navBar2.vue'
import LineChartAccuracy from '@/components/LineChartAccuracy.vue'
import LineChartAccuracyTow from '@/components/LineChartAccuracyTow.vue'


// 当前选中的Tab
const activeTab = ref(0)

// Tab切换处理
const handleTabChange = (value) => {
  activeTab.value = value
  // 这里可以根据不同的tab加载不同的数据
  updateMetrics(value)
}

// 准确率指标数据
const metrics = ref({
  fourHour: '95.61',
  oneMonth: '91.4',
  brillScore: '0.0581'
})

// 图表数据（6个独立时间段，每个时间段包含详细的数据点）
// 4小时：前1小时 + 当前小时 + 后2小时 = 4个数据点，currentIndex = 1（当前小时）
// 12小时：前5小时 + 当前小时 + 后6小时 = 12个数据点，currentIndex = 5（当前小时）
// 1天：当天24小时每个小时的数据，currentIndex = 当前小时索引
// 1周：当前这一周7天的数据，currentIndex = 当前天索引（0-6）
// 1月：当前一个月每一天的数据，currentIndex = 当前天索引
// 3月：三个月每一天的数据，currentIndex = 当前天索引

// 生成示例数据
const generateHourlyData = (hours, basePercentage, variation = 1) => {
  return hours.map((hour, index) => {
    const value = basePercentage + (Math.sin(index * 0.5) * variation) + (Math.random() * 0.5 - 0.25)
    return {
      time: hour,
      percentage: Math.round(value * 100) / 100 // 保留两位小数
    }
  })
}

const generateDailyData = (days, basePercentage, variation = 1.5) => {
  return days.map((day, index) => {
    const value = basePercentage + (Math.sin(index * 0.3) * variation) + (Math.random() * 0.8 - 0.4)
    return {
      time: day,
      percentage: Math.round(value * 100) / 100 // 保留两位小数
    }
  })
}

const chartData = ref([
  {
    timeframe: '4小时',
    data: [
      { time: '10:00', percentage: 94.2 },
      { time: '11:00', percentage: 96.5 }, // 当前小时
      { time: '12:00', percentage: 93.8 },
      { time: '13:00', percentage: 97.2 }
    ],
    currentIndex: 1 // 当前小时（11:00）
  },
  {
    timeframe: '12小时',
    data: generateHourlyData(
      ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
      96.8,
      3.5 // 增加变化幅度
    ),
    currentIndex: 5 // 当前小时（12:00）
  },
  {
    timeframe: '1天',
    data: generateHourlyData(
      Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
      94.5,
      1.5
    ),
    currentIndex: 12 // 当前小时（12:00）
  },
  {
    timeframe: '1周',
    data: generateDailyData(
      ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      93.0,
      5.0 // 增加变化幅度
    ),
    currentIndex: 2 // 当前天（周三）
  },
  {
    timeframe: '1月',
    data: generateDailyData(
      Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
      95.5,
      6.0 // 增加变化幅度
    ),
    currentIndex: 14 // 当前天（15日）
  },
  {
    timeframe: '3月',
    data: generateDailyData(
      Array.from({ length: 90 }, (_, i) => `${Math.floor(i / 30) + 1}月${(i % 30) + 1}日`),
      96.2,
      7.0 // 增加变化幅度
    ),
    currentIndex: 30 // 当前天（2月1日）
  }
])

// 柱状图数据（预期值与实际值，X轴由组件内部自动计算）
const barChartData = ref([
  { expected: 15, resolved: 6 },
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
])

// 根据tab更新指标数据
const updateMetrics = (tabValue) => {
  // 这里可以根据不同的tab显示不同的数据
  // 目前使用默认数据
  switch (tabValue) {
    case 'overall':
      metrics.value = {
        fourHour: '95.61',
        oneMonth: '91.4',
        brillScore: '0.0581'
      }
      break
    case 'expected':
      metrics.value = {
        fourHour: '95.61',
        oneMonth: '91.4',
        brillScore: '0.0581'
      }
      break
    default:
      break
  }
}

</script>

<style scoped lang="scss">
.accuracy-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-page, #FCFCFC);
  color: var(--text-color, #1a1a1a);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.main-content {
  padding-top: 128px; // header(80px) + navbar2(48px)
  width: 100%;

  .content-wrapper {
    margin: 0 auto;
    padding: 97px;
    max-width: 1280px;
    box-sizing: border-box;

    // 左右布局
    .page-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;

      // 左侧部分：Tab切换列表
      .left-section {
        flex: 0 0 280px;

        .tab-list {
          display: flex;


          .tab-item {
            display: flex;
            flex-direction: column;
            cursor: pointer;

            &:last-child {
              border-bottom: none;
            }

            .tab-label {
              color: var(--text-color-tabBtn, #ffffff);
              font-family: PingFang SC, PingFang SC;
              font-weight: 600;
              font-size: 16px;
              color: #909090;
              line-height: 23px;
              transition: color 0.3s ease;
              margin-bottom: 40px;

              &.active {
                color: var(--text-color, #ffffff);
              }
            }




          }
        }
      }

      // 右侧部分：主体内容
      .right-section {
        flex: 1;
        display: flex;
        gap: 24px;
        align-items: flex-start;

        // 主体内容区域
        .main-content-area {
          flex: 1;
          border-radius: 12px;
          transition: background-color 0.3s ease;
          position: relative;

          // 主标题
          .main-title {
            font-size: 32px;
            font-weight: 700;
            color: var(--text-color, #ffffff);
            margin: 0 0 48px 0;
            line-height: 1.2;
            transition: color 0.3s ease;
          }

          // 准确率指标
          .accuracy-metrics {
            display: flex;
            gap: 0;
            align-items: flex-start;
            position: relative;
            padding-bottom: 48px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            transition: border-color 0.3s ease;

            .metric-item {
              display: flex;
              flex-direction: column;
              gap: 8px;
              position: relative;
              margin-right: 130px;

              // 添加垂直分隔线（除了最后一个）
              &:not(:last-child)::after {
                content: '';
                position: absolute;
                right: -60px;
                bottom: 0;
                width: 1px;
                height: 75%;
                background: rgba(255, 255, 255, 0.1);
                margin-left: 24px;
                transition: background-color 0.3s ease;
              }

              .metric-value {
                font-size: 48px;
                font-weight: 700;
                line-height: 1;
                transition: color 0.3s ease;

                &.primary {
                  color: var(--text-color, #ffffff);
                }

                &.secondary {
                  color: var(--text-gray-2, #a0a0a0);
                }
              }

              .metric-label {
                font-size: 14px;
                color: var(--text-gray, #a0a0a0);
                line-height: 1.4;
                transition: color 0.3s ease;
              }
            }
          }

          // 分割线
          .divider {
            width: 100%;
            height: 1px;
            background: #2F2F2F;
            margin: 35px 0 40px;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1280px) {
  .main-content {
    .content-wrapper {
      padding: 64px 48px 80px;
    }
  }
}

@media (max-width: 1024px) {
  .main-content {
    .content-wrapper {
      padding: 48px 32px 64px;

      .page-layout {
        flex-direction: column;
        gap: 32px;

        .left-section {
          flex: 1;
          width: 100%;
          order: 1;

          .tab-list {
            flex-direction: row;
            overflow-x: auto;
            padding: 12px;

            .tab-item {
              flex-shrink: 0;
              white-space: nowrap;
            }
          }
        }

        .right-section {
          flex-direction: column;
          gap: 32px;

          .main-content-area {
            .accuracy-metrics {
              flex-wrap: wrap;

              .metric-item {
                margin-right: 48px;

                &:not(:last-child)::after {
                  right: -24px;
                  height: 60%;
                }
              }
            }
          }

        }
      }
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 50px;

    .content-wrapper {
      padding: 16px;

      .page-layout {
        gap: 24px;

        .left-section {
          .tab-list {
            padding: 0 0 8px;

            .tab-item {
              .tab-label {
                margin-bottom: 16px;
                font-size: 15px;
              }
            }
          }
        }

        .right-section {
          .main-content-area {
            padding: 24px;

            .main-title {
              font-size: 24px;
              margin-bottom: 32px;
            }

            .accuracy-metrics {
              flex-direction: column;
              gap: 24px;
              align-items: flex-start;
              padding-bottom: 32px;

              .metric-item {
                margin-right: 0;

                &:not(:last-child)::after {
                  display: none;
                }

                .metric-value {
                  font-size: 36px;
                }

                .metric-label {
                  font-size: 13px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
