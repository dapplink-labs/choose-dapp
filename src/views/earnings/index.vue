<template>
  <div class="earnings-page">
    <NavBar2 />

    <div class="main-content">
      <div class="content-wrapper">
        <!-- 上半部分内容 -->
        <div class="top-section">
          <div class="user-info-card">
            <div class="user-header">
              <img src="https://picsum.photos/seed/user1/80/80" :alt="$t('common.userAvatar')" class="user-avatar">
              <div class="user-meta">
                <div class="user-name">埃隆马斯克</div>
                <div class="user-stats">
                  <span class="join-date">2025-11-1 {{ $t('earnings.joined') }}</span>
                  <span class="divider">·</span>
                  <span class="follower-count">10 {{ $t('earnings.views') }}</span>
                </div>
              </div>
            </div>

            <div class="user-stats-grid">
              <div class="stat-item">
                <div class="stat-value">$188.88</div>
                <div class="stat-label">{{ $t('earnings.totalWinnings') }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">$12.96</div>
                <div class="stat-label">{{ $t('earnings.maxWinning') }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">18</div>
                <div class="stat-label">{{ $t('earnings.predictionEvents') }}</div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-left-section">
                <div class="chart-title">{{ $t('earnings.profitLoss') }}</div>
                <div class="profit-amount">
                  <div class="amount-value">$188.88</div>
                  <div class="time-period">{{ timePeriodText }}</div>
                </div>
              </div>
              <div class="time-selector">
                <button v-for="period in timePeriods" :key="period.value"
                  :class="['time-btn', { active: selectedPeriod === period.value }]"
                  @click="handlePeriodChange(period.value)">
                  {{ period.label }}
                </button>
              </div>
            </div>

            <LineChartEarnings :data="chartData[selectedPeriod]" />
          </div>
        </div>

        <div class="main-section">
          <div class="list-header">
            <div class="tab-container">
              <button v-for="tab in tabs" :key="tab.value" :class="['tab-btn', { active: activeTab === tab.value }]"
                @click="handleTabChange(tab.value)">
                {{ tab.label }}
              </button>
            </div>

            <div class="filter-search-container">
              <div class="filter-buttons" v-if="activeTab === 'positions'">
                <button v-for="filter in filters" :key="filter.value"
                  :class="['filter-btn', { active: selectedFilter === filter.value }]"
                  @click="handleFilterChange(filter.value)">
                  {{ filter.label }}
                </button>
              </div>

              <div class="search-box">
                <el-icon class="search-icon">
                  <Search />
                </el-icon>
                <input type="text" :placeholder="activeTab === 'positions' ? $t('earnings.searchPositions') : $t('earnings.searchActivities')" v-model="searchQuery"
                  class="search-input" />
              </div>
            </div>
          </div>

          <div class="list-container">
            <template v-if="activeTab === 'positions'">
              <template v-if="selectedFilter === 'online'">
                <div class="online-list-header">
                  <div class="online-title">{{ $t('earnings.market') }}</div>
                  <div class="online-col">{{ $t('earnings.average') }}</div>
                  <div class="online-col">{{ $t('earnings.currentPrice') }}</div>
                  <div class="online-col">{{ $t('earnings.value') }}</div>
                  <div class="online-col"></div>
                </div>

                <div class="online-list">
                  <div class="online-item" v-for="item in onlineListData" :key="item.id">
                    <div class="online-item-left">
                      <img :src="item.avatar" :alt="$t('common.userAvatar')" class="item-avatar" />
                      <div class="item-info">
                        <div class="item-description">{{ item.description }}</div>
                        <div class="item-bet-info">
                          <span class="status-tag yes">Yes</span>
                          <span class="bet-text">{{ item.betInfo }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="online-col-value online-col-value1">{{ item.average }}</div>
                    <div class="online-col-value online-col-value2">{{ item.current }}</div>
                    <div class="online-col-value value-section">
                      <div class="value-amount">{{ item.value }}</div>
                      <div class="value-change" :class="item.changeClass">{{ item.changeText }}</div>
                    </div>
                    <div class="online-col-icon">
                      <svg t="1765588966459" class="change-icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="1651" width="20" height="20">
                        <path
                          d="M536.380952 288.377905V658.285714a24.380952 24.380952 0 0 1-48.761904 0V288.377905L391.314286 384.731429a24.380952 24.380952 0 0 1-34.474667-34.474667l137.898667-137.898667a24.283429 24.283429 0 0 1 34.523428 0l137.898667 137.898667a24.380952 24.380952 0 0 1-34.474667 34.474667L536.380952 288.377905zM97.52381 731.428571a24.380952 24.380952 0 0 1 48.761904 0v97.52381a24.380952 24.380952 0 0 0 24.380953 24.380952h682.666666a24.380952 24.380952 0 0 0 24.380953-24.380952v-97.52381a24.380952 24.380952 0 0 1 48.761904 0v97.52381a73.142857 73.142857 0 0 1-73.142857 73.142857H170.666667A73.142857 73.142857 0 0 1 97.52381 828.952381v-97.52381z"
                          fill="currentColor" p-id="1652"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="list-header-row">
                  <div class="header-result">{{ $t('earnings.result') }}</div>
                  <div class="header-market">{{ $t('earnings.market') }}</div>
                  <div class="header-bet-amount">{{ $t('earnings.totalBet') }}</div>
                  <div class="header-winning">{{ $t('earnings.winningPrize') }}</div>
                  <div class="header-icon"></div>
                </div>

                <!-- 列表项 -->
                <div class="list-item" v-for="item in listData" :key="item.id">
                  <div class="status-tag" :class="item.status">{{ item.status }}</div>
                  <div class="item-content">
                    <img :src="item.avatar" alt="用户头像" class="item-avatar">
                    <div class="item-info">
                      <div class="item-description">{{ item.description }}</div>
                      <div class="item-bet-info">{{ item.betInfo }}</div>
                    </div>
                  </div>
                  <div class="item-bet-amount">
                    <div class="bet-amount-value">${{ item.baseAmount }}</div>
                  </div>
                  <div class="item-winning-section">
                    <div class="winning-amount">${{ item.changeAmount }}</div>
                    <div class="change-details" :class="item.changeClass">
                      <span class="change-sign">{{ item.changeSign }}</span>
                      <span class="change-amount">${{ item.changeValue }}</span>
                      <span class="change-percent">({{ item.percent }})</span>
                    </div>
                  </div>
                  <div class="item-icon-column">
                    <svg t="1765588966459" class="change-icon" viewBox="0 0 1024 1024" version="1.1"
                      xmlns="http://www.w3.org/2000/svg" p-id="1651" width="20" height="20">
                      <path
                        d="M536.380952 288.377905V658.285714a24.380952 24.380952 0 0 1-48.761904 0V288.377905L391.314286 384.731429a24.380952 24.380952 0 0 1-34.474667-34.474667l137.898667-137.898667a24.283429 24.283429 0 0 1 34.523428 0l137.898667 137.898667a24.380952 24.380952 0 0 1-34.474667 34.474667L536.380952 288.377905zM97.52381 731.428571a24.380952 24.380952 0 0 1 48.761904 0v97.52381a24.380952 24.380952 0 0 0 24.380953 24.380952h682.666666a24.380952 24.380952 0 0 0 24.380953-24.380952v-97.52381a24.380952 24.380952 0 0 1 48.761904 0v97.52381a73.142857 73.142857 0 0 1-73.142857 73.142857H170.666667A73.142857 73.142857 0 0 1 97.52381 828.952381v-97.52381z"
                        fill="currentColor" p-id="1652"></path>
                    </svg>
                  </div>
                </div>
              </template>
            </template>

            <!-- 交易活动(预测)列表 -->
            <template v-else>
              <div class="activities-header">
                <div class="activities-col type">类型</div>
                <div class="activities-col market">市场</div>
                <div class="activities-col date">日期</div>
                <div class="activities-col amount">金额</div>
                <div class="activities-col icon"></div>
              </div>

              <div class="activities-list">
                <div class="activities-item" v-for="item in activitiesList" :key="item.id">
                  <div class="activities-type">{{ item.type }}</div>
                  <div class="activities-market">
                    <img :src="item.avatar" alt="用户头像" class="activities-avatar" />
                    <div class="activities-info">
                      <div class="activities-title">{{ item.description }}</div>
                      <div class="activities-sub">
                        <span class="status-tag yes light">Yes {{ item.price }}</span>
                        <span class="activities-shares">{{ item.shares }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="activities-date">{{ item.date }}</div>
                  <div class="activities-amount">${{ item.amount }}</div>
                  <div class="activities-icon">
                    <svg t="1765791190464" class="icon" viewBox="0 0 1024 1024" version="1.1"
                      xmlns="http://www.w3.org/2000/svg" p-id="1605" width="24" height="24">
                      <path
                        d="M873.961098 509.602398V864.722709c0 16.418915-6.704689 31.328457-17.502594 42.119199-10.790742 10.798929-25.700284 17.502594-42.120222 17.502594H168.885094c-16.418915 0-31.32948-6.703666-42.120222-17.502594-10.798929-10.790742-17.502594-25.700284-17.502594-42.119199V201.623664c0-16.360587 6.704689-31.245569 17.502594-42.044498v-0.074701c10.790742-10.790742 25.700284-17.495431 42.120222-17.495431h339.858752v38.725922H168.885094c-5.72948 0-10.949354 2.359739-14.743766 6.154151l-0.032746-0.041955c-3.769853 3.794412-6.112196 9.022473-6.112196 14.776512V864.722709c0 5.728457 2.351553 10.948331 6.144942 14.741719 3.794412 3.793388 9.014286 6.154151 14.743766 6.154151h645.452165c5.72948 0 10.949354-2.360763 14.742743-6.154151 3.794412-3.793388 6.145965-9.014286 6.145964-14.741719V509.602398h38.735132z"
                        fill="#909090" p-id="1606"></path>
                      <path d="M344.134117 631.900548L881.832354 105.250925l27.076628 27.535069-537.698237 526.649622z"
                        fill="#909090" p-id="1607"></path>
                      <path d="M645.000887 99.655498h269.736835V369.392333h-38.725922V138.389607h-231.010913z"
                        fill="#909090" p-id="1608"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import NavBar2 from '@/components/navBar2.vue'
import LineChartEarnings from '@/components/LineChartEarnings.vue'
import { Search } from '@element-plus/icons-vue'

const { t } = useI18n()

// 定义不同时间周期的模拟数据（包含日期和收益）
const chartData = ref({
  '1D': [
    { date: '00:00', value: 1.1 },
    { date: '04:00', value: 145.2 },
    { date: '08:00', value: 60.8 },
    { date: '12:00', value: 58.3 },
    { date: '16:00', value: 170.1 },
    { date: '20:00', value: 65.7 },
    { date: '23:59', value: 115.2 }
  ],
  '1W': [
    { date: '周一', value: 1.1 },
    { date: '周二', value: 145.2 },
    { date: '周三', value: 60.8 },
    { date: '周四', value: 158.3 },
    { date: '周五', value: 70.1 },
    { date: '周六', value: 65.7 },
    { date: '周日', value: 115.2 }
  ],
  '1M': [
    { date: '01日', value: 135.2 },
    { date: '08日', value: 45.7 },
    { date: '15日', value: 58.3 },
    { date: '22日', value: 125.9 },
    { date: '28日', value: 72.5 }
  ],
  'ALL': [
    { date: '1月', value: 120.8 },
    { date: '2月', value: 35.2 },
    { date: '3月', value: 148.7 },
    { date: '4月', value: 62.3 },
    { date: '5月', value: 155.9 },
    { date: '6月', value: 70.5 },
    { date: '7月', value: 185.2 }
  ]
})

// 定义时间周期选项
const timePeriods = ref([
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: 'ALL', value: 'ALL' }
])

// 当前选中的时间周期
const selectedPeriod = ref('1M')

// 计算属性：根据选中的时间周期返回对应的显示文本
const timePeriodText = computed(() => {
  switch (selectedPeriod.value) {
    case '1D':
      return '过去一天'
    case '1W':
      return '过去一周'
    case '1M':
      return '过去一个月'
    case 'ALL':
      return '全部'
    default:
      return '过去一个月'
  }
})


// 处理时间周期变化
const handlePeriodChange = (period) => {
  selectedPeriod.value = period
}

// 标签页相关
const tabs = ref([
  { label: '仓位', value: 'positions' },
  { label: '交易活动', value: 'activities' }
])

const activeTab = ref('positions')

const handleTabChange = (tab) => {
  activeTab.value = tab
}

// 筛选按钮相关
const filters = ref([
  { label: '在线事件', value: 'online' },
  { label: '关闭事件', value: 'closed' }
])

const selectedFilter = ref('online')

const handleFilterChange = (filter) => {
  selectedFilter.value = filter
}

// 搜索框相关
const searchQuery = ref('')

// 在线事件列表数据
const onlineListData = ref([
  {
    id: 1,
    status: 'Yes',
    avatar: 'https://picsum.photos/seed/online1/40/40',
    description: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文?',
    betInfo: '0.4股 at 71¢',
    average: '71¢',
    current: '71¢',
    value: '$0.28',
    changeText: '-$0.01(-2.11%)',
    changeClass: 'negative'
  },
  {
    id: 2,
    status: 'Yes',
    avatar: 'https://picsum.photos/seed/online2/40/40',
    description: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文?',
    betInfo: '0.4股 at 71¢',
    average: '71¢',
    current: '71¢',
    value: '$0.28',
    changeText: '-$0.01(-2.11%)',
    changeClass: 'negative'
  }
])

// 交易活动（预测）列表数据
const activitiesList = ref([
  {
    id: 1,
    type: 'Buy',
    avatar: 'https://picsum.photos/seed/act1/40/40',
    description: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文?',
    price: '521¢',
    shares: '37.0 股',
    date: '17天前',
    amount: '100.00'
  },
  {
    id: 2,
    type: 'Buy',
    avatar: 'https://picsum.photos/seed/act2/40/40',
    description: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文?',
    price: '521¢',
    shares: '37.0 股',
    date: '17天前',
    amount: '100.00'
  },
  {
    id: 3,
    type: 'Buy',
    avatar: 'https://picsum.photos/seed/act3/40/40',
    description: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文?',
    price: '521¢',
    shares: '37.0 股',
    date: '17天前',
    amount: '100.00'
  }
])

// 关闭事件列表数据
const listData = ref([
  {
    id: 1,
    status: 'Lost',
    avatar: 'https://picsum.photos/seed/user2/40/40',
    description: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文?',
    betInfo: '0.4 Yes at 71¢',
    baseAmount: '1.00',
    changeAmount: '0.28',
    changeSign: '-',
    changeValue: '0.01',
    percent: '-2.11%',
    changeClass: 'negative'
  },
  {
    id: 2,
    status: 'Win',
    avatar: 'https://picsum.photos/seed/user3/40/40',
    description: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文?',
    betInfo: '0.4 Yes at 71¢',
    baseAmount: '1.00',
    changeAmount: '196.28',
    changeSign: '+',
    changeValue: '0.01',
    percent: '-2.11%',
    changeClass: 'positive'
  },
  {
    id: 3,
    status: 'Win',
    avatar: 'https://picsum.photos/seed/user4/40/40',
    description: '特斯拉2025年第三季度财报预测',
    betInfo: '1.2 Yes at 85¢',
    baseAmount: '5.00',
    changeAmount: '23.45',
    changeSign: '+',
    changeValue: '18.45',
    percent: '+369.0%',
    changeClass: 'positive'
  },
  {
    id: 4,
    status: 'Lost',
    avatar: 'https://picsum.photos/seed/user5/40/40',
    description: '苹果公司2026年新产品发布预测',
    betInfo: '0.8 No at 45¢',
    baseAmount: '3.00',
    changeAmount: '0.50',
    changeSign: '-',
    changeValue: '2.50',
    percent: '-83.3%',
    changeClass: 'negative'
  },
  {
    id: 5,
    status: 'Win',
    avatar: 'https://picsum.photos/seed/user6/40/40',
    description: '以太坊2.0升级完成时间预测',
    betInfo: '1.5 Yes at 92¢',
    baseAmount: '2.00',
    changeAmount: '15.67',
    changeSign: '+',
    changeValue: '13.67',
    percent: '+683.5%',
    changeClass: 'positive'
  }
])
</script>

<style scoped lang="scss">
.earnings-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-page, #f5f5f5);
  color: var(--text-color, #1a1a1a);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.main-content {
  padding-top: 128px;
  /* 为NavBar2留出空间 */
  width: 100%;

  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 32px 64px;
    box-sizing: border-box;

    // 上半部分内容
    .top-section {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;

      // 左侧用户信息卡片
      .user-info-card {
        flex: 1;
        background: var(--bg-card, #ffffff);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        transition: background-color 0.3s ease;

        .user-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;

          .user-avatar {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            object-fit: cover;
          }

          .user-name {
            font-family: PingFang SC, PingFang SC;
            font-weight: 600;
            font-size: 24px;
            color: var(--text-color, #000000);
            line-height: 24px;
            text-align: left;
            font-style: normal;
            text-transform: none;
            margin-bottom: 10px;
            transition: color 0.3s ease;
          }

          .user-stats {
            font-family: PingFang SC, PingFang SC;
            font-size: 14px;
            color: var(--text-gray, #909090);
            line-height: 20px;
            text-align: left;
            font-style: normal;
            text-transform: none;
            transition: color 0.3s ease;
          }
        }

        // 筛选和搜索区域
        .filter-search-container {

          .user-meta {
            .user-name {
              font-size: 24px;
              font-weight: 700;
              color: #333;
              margin-bottom: 6px;
            }

            .user-stats {
              font-size: 14px;
              color: #909090;

              .divider {
                margin: 0 8px;
              }
            }
          }
        }

        // 用户统计数据网格
        .user-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;

          .stat-item {
            text-align: left;

            .stat-value {
              font-family: DIN, DIN;
              font-weight: bold;
              font-size: 32px;
              color: var(--text-color, #000000);
              line-height: 20px;
              text-align: left;
              font-style: normal;
              text-transform: none;
              margin-bottom: 10px;
              transition: color 0.3s ease;
            }

            .stat-label {
              font-family: PingFang SC, PingFang SC;
              font-weight: 500;
              font-size: 16px;
              color: var(--text-gray, #909090);
              line-height: 20px;
              text-align: left;
              font-style: normal;
              text-transform: none;
              transition: color 0.3s ease;
            }
          }
        }
      }

      // 右侧图表卡片
      .chart-card {
        flex: 1;
        background: var(--bg-card, #ffffff);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        transition: background-color 0.3s ease;

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;

          .chart-left-section {
            flex: 1;

            .chart-title {
              font-family: PingFang SC, PingFang SC;
              font-size: 16px;
              color: var(--text-gray, #909090);
              line-height: 24px;
              text-align: left;
              font-style: normal;
              text-transform: none;
              margin-bottom: 15px;
              transition: color 0.3s ease;
            }

            // 金额提示
            .profit-amount {
              text-align: left;

              .amount-value {
                font-family: DIN, DIN;
                font-weight: bold;
                font-size: 32px;
                color: var(--text-color, #000000);
                line-height: 20px;
                text-align: left;
                font-style: normal;
                text-transform: none;
                margin-bottom: 10px;
                transition: color 0.3s ease;
              }

              .time-period {
                font-size: 14px;
                color: var(--text-gray, #909090);
                transition: color 0.3s ease;
              }
            }
          }

          // 时间选择器
          .time-selector {
            display: flex;
            gap: 8px;
            flex-shrink: 0;

            .time-btn {
              padding: 5px 10px;
              border: none;
              border-radius: 20px;
              color: var(--text-gray, #999999);
              font-size: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
              background: rgba(0, 0, 0, 0);

              &.active {
                background-color: var(--text-color, #1a1a1a);
                color: var(--bg-card, #ffffff);
              }
            }
          }
        }
      }


    }
  }
}

// 主体部分
.main-section {
  background: var(--bg-card, #ffffff);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 30px;
  transition: background-color 0.3s ease;

  // 列表头部
  .list-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;

    // 标签页
    .tab-container {
      border-bottom: 1px solid var(--border-color, #f0f0f0);
      display: flex;
      gap: 4px;
      transition: border-color 0.3s ease;

      .tab-btn {
        padding: 10px 0 16px;
        border: none;
        border-radius: 20px;
        background: transparent;
        color: var(--text-gray, #999);
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        margin-right: 20px;

        &:hover {
          color: var(--text-color, #333);
        }

        &.active {
          color: var(--text-color, #333);
          font-weight: 600;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 24px;
            height: 3px;
            background: var(--text-color, #333);
            border-radius: 2px;
          }
        }
      }
    }

    // 筛选和搜索区域
    .filter-search-container {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      // 筛选按钮
      .filter-buttons {
        display: flex;
        gap: 12px;

        .filter-btn {
          padding: 8px 24px;
          border: none;
          border-radius: 8px;
          background: var(--bg-light, #f5f5f5);
          color: var(--text-gray, #666);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: var(--text-color, #333);
            color: var(--text-color, #333);
          }

          &.active {
            background: var(--text-color, #1a1a1a);
            border-color: var(--text-color, #1a1a1a);
            color: var(--bg-card, #ffffff);
          }
        }
      }

      // 搜索框
      .search-box {
        display: flex;
        align-items: center;
        background: var(--bg-light, #F5F5F5);
        border-radius: 6px;
        padding: 8px 12px;
        min-width: 200px;
        flex: 1;
        transition: background-color 0.3s ease;

        .search-icon {
          color: var(--text-gray, #999);
          margin-right: 8px;
          font-size: 16px;
          transition: color 0.3s ease;
        }

        .search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: var(--text-color, #333);
          width: 100%;
          transition: color 0.3s ease;

          &::placeholder {
            color: var(--text-gray, #999);
          }
        }
      }
    }
  }

  // 列表容器
  .list-container {
    padding-top: 20px;
  }

  // 在线事件表头
  .online-list-header {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 1fr 30px;
    align-items: center;
    padding: 12px 16px;
    color: var(--text-gray, #909090);
    font-weight: 600;
    font-size: 14px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
    font-family: PingFang SC, PingFang SC;
  }

  .online-title {
    text-align: left;
  }

  .online-col {
    text-align: right;
    padding-left: 12px;
  }

  // 在线事件列表
  .online-list {
    display: flex;
    flex-direction: column;
    gap: 0; // 桌面端无间距，移动端通过margin-bottom控制
  }

  .online-item {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 1fr 30px;
    align-items: center;
    padding: 14px 16px;
    gap: 12px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }

  .online-item:last-child {
    border-bottom: none;
  }

  .online-item-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .online-item .status-tag.yes {
    background: #25A750;
    color: #ffffff;
    border-radius: 3px;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 700;
  }

  .online-item .item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 3px;
    object-fit: cover;
  }

  .online-item .item-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .online-item .item-description {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color, #1a1a1a);
    line-height: 20px;
  }

  .online-item .item-bet-info {
    font-size: 12px;
    color: var(--text-gray, #6b7280);
    display: flex;
    align-items: center;
    gap: 8px;

    .bet-text {
      color: var(--text-gray, #6b7280);
    }
  }

  .online-item .item-bet-info .status-tag.yes {
    padding: 2px 10px;
    border-radius: 3px;
    background: rgba(37, 167, 80, 0.2);
    color: #25A750;
    font-size: 12px;
    font-weight: 700;
  }

  .online-col-value {
    text-align: right;
    font-size: 16px;
    font-weight: 700;
    color: var(--text-color, #1a1a1a);
  }

  .value-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .value-amount {
    font-size: 16px;
    font-weight: 700;
  }

  .value-change {
    font-size: 12px;
  }

  .value-change.negative {
    color: #D92D20;
  }

  .value-change.positive {
    color: #25A750;
  }

  .online-col-icon {
    display: flex;
    justify-content: flex-end;
  }

  /* 交易活动(预测) */
  .activities-header {
    display: grid;
    grid-template-columns: 0.5fr 4fr 1.2fr 1.2fr 60px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 2px solid var(--border-color, #f0f0f0);
    font-weight: 600;
    font-size: 14px;
    color: var(--text-gray, #909090);
    font-family: PingFang SC, PingFang SC;

    .market {
      padding-left: 10px;
      box-sizing: border-box;
    }
  }

  .activities-col.type {
    text-align: left;
  }

  .activities-col.market {
    text-align: left;
  }

  .activities-col.date,
  .activities-col.amount,
  .activities-col.icon {
    text-align: right;
  }

  .activities-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 12px 0 4px;
  }

  .activities-item {
    display: grid;
    grid-template-columns: 0.5fr 4fr 1.2fr 1.2fr 30px;
    align-items: center;
    gap: 12px;
  }

  .activities-type {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-color, #1a1a1a);
  }

  .activities-market {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .activities-avatar {
    width: 42px;
    height: 42px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .activities-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .activities-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-color, #1a1a1a);
    line-height: 1.4;
  }

  .activities-sub {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--text-gray, #909090);
  }

  .status-tag.light {
    background: rgba(37, 167, 80, 0.2);
    color: #25A750;
    border-radius: 3px;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 700;
  }

  .activities-shares {
    color: var(--text-gray, #909090);
  }

  .activities-date {
    text-align: right;
    color: var(--text-gray, #909090);
    font-size: 14px;
  }

  .activities-amount {
    text-align: right;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-color, #1a1a1a);
  }

  .activities-icon {
    display: flex;
    justify-content: flex-end;
  }

  // 列表表头
  .list-header-row {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 2px solid var(--border-color, #f0f0f0);
    font-weight: 600;
    font-size: 14px;
    color: var(--text-gray, #909090);
    transition: border-color 0.3s ease, color 0.3s ease;

    .header-result {
      width: 80px;
      padding-left: 0;
    }

    .header-market {
      flex: 1;
      padding-left: 0;
    }

    .header-bet-amount {
      width: 120px;
      text-align: right;
      padding-right: 16px;
    }

    .header-winning {
      width: 180px;
      text-align: right;
      padding-right: 8px;
    }

    .header-icon {
      width: 40px;
      flex-shrink: 0;
    }
  }

  // 列表项
  .list-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color, #f0f0f0);
    gap: 16px;
    transition: border-color 0.3s ease;

    &:last-child {
      border-bottom: none;
    }

    // 结果列 - 对应表头的"结果"
    .status-tag {
      width: 80px;
      padding: 4px 0;
      text-align: left;
      flex-shrink: 0;
      font-size: 20px;
      font-weight: 600;
      font-style: italic;

      &.Lost {
        color: #868EAD;
      }

      &.Win {
        color: #5DB47A;
      }
    }

    // 中间内容区域
    .item-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;

      // 头像
      .item-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      // 市场列 - 对应表头的"市场"
      .item-info {
        flex: 1;
        min-width: 0;

        .item-description {
          font-size: 14px;
          color: var(--text-color, #333);
          margin-bottom: 6px;
          line-height: 1.4;
          transition: color 0.3s ease;
        }

        .item-bet-info {
          font-size: 13px;
          color: var(--text-gray, #666);
          transition: color 0.3s ease;
        }
      }
    }

    // 总投注额列
    .item-bet-amount {
      width: 120px;
      text-align: right;
      flex-shrink: 0;

      .bet-amount-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-color, #333);
        line-height: 1.5;
        transition: color 0.3s ease;
      }
    }

    // 赢得奖金列
    .item-winning-section {
      width: 180px;
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      flex-shrink: 0;

      .winning-amount {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-color, #333);
        line-height: 1.4;
        transition: color 0.3s ease;
      }

      .change-details {
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 2px;
        line-height: 1.4;

        .change-sign {
          font-size: 12px;
        }

        .change-amount {
          font-size: 12px;
        }

        .change-percent {
          font-size: 12px;
        }

        &.positive {
          color: #52c41a;

          .change-sign,
          .change-amount,
          .change-percent {
            color: #52c41a;
          }
        }

        &.negative {
          color: #ff4d4f;

          .change-sign,
          .change-amount,
          .change-percent {
            color: #ff4d4f;
          }
        }
      }
    }

    // 图标列
    .item-icon-column {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .change-icon {
        width: 20px;
        height: 20px;
        color: var(--text-gray, #BFBFBF);
        transition: color 0.3s ease;

        path {
          fill: currentColor;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1280px) {
  .main-content {
    .content-wrapper {
      padding: 28px 24px 56px;
    }
  }
}

@media (max-width: 1024px) {
  .main-content {
    padding-top: 118px;

    .content-wrapper {
      padding: 24px 20px 48px;

      .top-section {
        flex-direction: column;
        gap: 16px;

        .user-info-card,
        .chart-card {
          padding: 20px;
        }

        .user-info-card {
          .user-header {
            margin-bottom: 24px;
          }

          .user-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
        }

        .chart-card {
          .chart-header {
            flex-direction: column;
            gap: 12px;

            .time-selector {
              flex-wrap: wrap;
              justify-content: flex-start;
            }
          }
        }
      }

      .main-section {
        padding: 20px;

        .list-header {
          gap: 12px;

          .tab-container {
            .tab-btn {
              font-size: 15px;
              margin-right: 12px;
              padding: 10px 0 14px;
            }
          }

          .filter-search-container {
            gap: 12px;
          }
        }

        .online-list-header {
          grid-template-columns: 2.5fr 1fr 1fr 1fr 24px;
          font-size: 13px;
          padding: 10px 12px;
        }

        .online-item {
          grid-template-columns: 2.5fr 1fr 1fr 1fr 24px;
          padding: 12px 12px;
        }

        .activities-header {
          grid-template-columns: 0.6fr 3.6fr 1.2fr 1.2fr 50px;
          font-size: 13px;
          padding: 10px 0;
        }

        .activities-item {
          grid-template-columns: 0.6fr 3.6fr 1.2fr 1.2fr 24px;
          gap: 10px;
        }

        .list-header-row {
          font-size: 13px;

          .header-bet-amount {
            width: 110px;
          }

          .header-winning {
            width: 150px;
          }
        }

        .list-item {
          gap: 12px;

          .status-tag {
            width: 70px;
            font-size: 18px;
          }

          .item-bet-amount {
            width: 110px;
          }

          .item-winning-section {
            width: 150px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 100px;
    /* 小屏幕下为NavBar2留出空间 */

    .content-wrapper {
      padding: 16px 16px 40px;

      // 上半部分内容在小屏幕下堆叠显示
      .top-section {
        flex-direction: column;

        // 用户信息卡片
        .user-info-card {
          padding: 16px;

          .user-header {
            gap: 12px;

            .user-avatar {
              width: 50px;
              height: 50px;
            }

            .user-meta {
              .user-name {
                font-size: 18px;
              }

              .user-stats {
                font-size: 12px;

                .divider {
                  margin: 0 4px;
                }
              }
            }
          }

          // 用户统计数据网格在小屏幕下改为2列
          .user-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            .stat-item {
              .stat-value {
                font-size: 20px;
              }

              .stat-label {
                font-size: 12px;
              }
            }
          }
        }

        // 图表卡片
        .chart-card {
          padding: 16px;

          .chart-header {
            .chart-title {
              font-size: 16px;
            }
          }
        }
      }

      // 主体部分
      .main-section {
        padding: 16px;

        .list-container {
          padding-top: 0; // 移动端移除顶部padding
        }

        .list-header {
          gap: 12px;

          .tab-container {
            justify-content: center;

            .tab-btn {
              padding: 8px 16px;
              font-size: 14px;
            }
          }

          .filter-search-container {
            flex-direction: column;
            align-items: stretch;

            .filter-buttons {
              justify-content: center;

              .filter-btn {
                padding: 6px 18px;
                font-size: 13px;
              }
            }

            .search-box {
              min-width: auto;
              width: 100%;

              .search-input {
                width: 100%;
              }
            }
          }
        }

        // 关闭事件表头 - 移动端隐藏
        .list-header-row {
          display: none;
        }

        // 列表项响应式设计 - 移动端卡片模式
        .list-item {
          display: flex;
          flex-direction: column;
          padding: 16px;
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 12px;
          background: var(--bg-card, #ffffff);
          margin-bottom: 12px;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: border-color 0.3s ease, background-color 0.3s ease;
          box-sizing: border-box;

          &:last-child {
            margin-bottom: 0;
            border-bottom: none;
          }

          // 结果状态标签 - 移动端显示在顶部
          .status-tag {
            width: auto;
            font-size: 16px;
            font-weight: 700;
            padding: 0;
            margin-bottom: 4px;
            align-self: flex-start;
          }

          // 市场信息区域
          .item-content {
            width: 100%;
            min-width: 0;
            margin-bottom: 8px;

            .item-avatar {
              width: 40px;
              height: 40px;
            }

            .item-info {
              .item-description {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 6px;
              }

              .item-bet-info {
                font-size: 13px;
                color: var(--text-gray, #666);
              }
            }
          }

          // 总投注金额 - 移动端显示标签
          .item-bet-amount {
            width: 100%;
            text-align: left;
            padding: 8px 0;
            border-top: 1px solid var(--border-color, #f0f0f0);
            display: flex;
            flex-direction: column;
            gap: 4px;

            &::before {
              content: '总投注金额：';
              font-size: 12px;
              color: var(--text-gray, #909090);
              font-weight: 500;
            }

            .bet-amount-value {
              font-size: 16px;
              font-weight: 700;
              color: var(--text-color, #1a1a1a);
            }
          }

          // 赢得奖金 - 移动端显示标签
          .item-winning-section {
            width: 100%;
            align-items: flex-start;
            padding: 8px 0;
            border-top: 1px solid var(--border-color, #f0f0f0);
            display: flex;
            flex-direction: column;
            gap: 6px;

            &::before {
              content: '赢得奖金：';
              font-size: 12px;
              color: var(--text-gray, #909090);
              font-weight: 500;
            }

            .winning-amount {
              font-size: 20px;
              font-weight: 700;
            }

            .change-details {
              font-size: 12px;
              margin-top: 2px;
            }
          }

          .item-icon-column {
            display: none; // 移动端隐藏图标
          }
        }

        // 在线事件表头/列表：移动端改为卡片堆叠
        .online-list-header {
          display: none;
        }

        .online-item {
          display: flex;
          flex-direction: column;
          padding: 16px;
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 12px;
          background: var(--bg-card, #ffffff);
          margin-bottom: 12px;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: border-color 0.3s ease, background-color 0.3s ease;
          box-sizing: border-box;

          &:last-child {
            margin-bottom: 0;
            border-bottom: none;
          }

          .online-item-left {
            width: 100%;
            align-items: flex-start;
            margin-bottom: 8px;

            .item-avatar {
              width: 40px;
              height: 40px;
            }

            .item-info {
              .item-description {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 6px;
              }

              .item-bet-info {
                font-size: 13px;
              }
            }
          }

          // 平均值 - 移动端显示标签
          .online-col-value1 {
            width: 100%;
            text-align: left;
            font-size: 14px;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color, #f0f0f0);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: var(--text-color, #1a1a1a);
            font-weight: 700;
            line-height: 1.4;

            &::before {
              content: '平均值：';
              font-size: 12px;
              color: var(--text-gray, #909090);
              font-weight: 500;
            }
          }

          // 现价 - 移动端显示标签
          .online-col-value2 {
            width: 100%;
            text-align: left;
            font-size: 14px;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color, #f0f0f0);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: var(--text-color, #1a1a1a);
            font-weight: 700;
            line-height: 1.4;

            &::before {
              content: '现价：';
              font-size: 12px;
              color: var(--text-gray, #909090);
              font-weight: 500;
            }
          }

          // 价值 - 移动端显示标签
          .value-section {
            width: 100%;
            align-items: center;
            padding: 8px 0;
            display: flex;
            gap: 4px;
            color: var(--text-color, #1a1a1a);

            &::before {
              content: '价值：';
              font-size: 12px;
              color: var(--text-gray, #909090);
              font-weight: 500;
            }

            .value-amount {
              font-size: 16px;
              font-weight: 700;
            }

            .value-change {
              font-size: 12px;
            }
          }

          .online-col-icon {
            display: none; // 移动端隐藏图标
          }
        }

        // 交易活动表：移动端改为卡片
        .activities-header {
          display: none;
        }

        .activities-list {
          gap: 12px;
        }

        .activities-item {
          display: flex;
          flex-direction: column;
          padding: 16px;
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 12px;
          background: var(--bg-card, #ffffff);
          margin-bottom: 12px;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: border-color 0.3s ease, background-color 0.3s ease;
          box-sizing: border-box;

          &:last-child {
            margin-bottom: 0;
            border-bottom: none;
          }

          // 类型 - 移动端必须显示，放在顶部
          .activities-type {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-color, #1a1a1a);
            margin-bottom: 4px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--border-color, #f0f0f0);
            display: flex;
            align-items: center;
            gap: 6px;

            &::before {
              content: '类型：';
              font-size: 12px;
              color: var(--text-gray, #909090);
              font-weight: 500;
            }
          }

          // 市场信息
          .activities-market {
            width: 100%;
            align-items: flex-start;
            margin-bottom: 8px;

            .activities-avatar {
              width: 40px;
              height: 40px;
            }

            .activities-info {
              .activities-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 6px;
              }

              .activities-sub {
                font-size: 13px;
              }
            }
          }

          // 日期 - 移动端显示标签
          .activities-date {
            text-align: left;
            padding: 8px 0;
            border-top: 1px solid var(--border-color, #f0f0f0);
            font-size: 14px;
            color: var(--text-gray, #909090);
            display: flex;
            align-items: center;
            gap: 6px;

            &::before {
              content: '日期：';
              font-size: 12px;
              color: var(--text-gray, #909090);
              font-weight: 500;
            }
          }

          // 金额 - 移动端显示标签
          .activities-amount {
            text-align: left;
            padding: 8px 0;
            border-top: 1px solid var(--border-color, #f0f0f0);
            font-size: 18px;
            font-weight: 700;
            color: var(--text-color, #1a1a1a);
            display: flex;
            align-items: center;
            gap: 6px;

            &::before {
              content: '金额：';
              font-size: 12px;
              color: var(--text-gray, #909090);
              font-weight: 500;
            }
          }

          .activities-icon {
            display: none; // 移动端隐藏图标
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .main-content {
    padding-top: 20px;

    .content-wrapper {
      padding: 12px 12px 32px;
    }

    .main-section {
      padding: 16px;
    }
  }

  // 在线事件列表 - 更小屏幕字体与间距再缩减
  .online-list {
    .online-item {
      padding: 14px;
      gap: 10px;

      .online-item-left {
        margin-bottom: 6px;

        .item-avatar {
          width: 36px;
          height: 36px;
        }

        .item-info {
          .item-description {
            font-size: 13px;
          }

          .item-bet-info {
            font-size: 12px;
          }
        }
      }

      .online-col-value:nth-of-type(1),
      .online-col-value:nth-of-type(2) {
        font-size: 13px;
        gap: 3px;

        &::before {
          font-size: 11px;
        }
      }

      .value-section {
        gap: 3px;

        &::before {
          font-size: 11px;
        }

        .value-amount {
          font-size: 15px;
        }

        .value-change {
          font-size: 11px;
        }
      }
    }
  }
}
</style>