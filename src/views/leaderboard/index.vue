<template>
  <div class="leaderboard-page">
    <!-- 导航栏 -->
    <NavBar2 />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-wrapper">
        <!-- 左侧主排行榜区域 -->
        <div class="left-leaderboard">
          <!-- 标题 -->
          <h1 class="page-title">{{ $t('leaderboard.title') }}</h1>

          <!-- 时间筛选和类别筛选 -->
          <div class="time-category-section">
            <div class="time-filters">
              <button v-for="filter in timeFilters" :key="filter.value" class="time-filter-btn"
                :class="{ active: activeTimeFilter === filter.value }" @click="handleTimeFilterClick(filter.value)">
                {{ filter.label }}
              </button>
            </div>
            <div class="category-dropdown">
              <select v-model="selectedCategory" class="category-select">
                <option value="all">{{ $t('leaderboard.allCategories') }}</option>
                <option value="category1">{{ $t('leaderboard.category1') }}</option>
                <option value="category2">{{ $t('leaderboard.category2') }}</option>
              </select>
            </div>
          </div>

          <!-- 表格头部 -->
          <div class="table-header">
            <div class="header-search">
              <div class="search-box">
                <el-icon class="search-icon">
                  <Search />
                </el-icon>
                <input type="text" :placeholder="$t('leaderboard.searchByName')" class="search-input" v-model="searchQuery"
                  @input="handleSearch" />
              </div>
            </div>
            <div class="header-profit">{{ $t('leaderboard.profitLoss') }}</div>
            <div class="header-quantity">{{ $t('leaderboard.quantity') }}</div>
          </div>

          <!-- 排行榜列表 -->
          <div class="leaderboard-list">
            <div v-for="(user, index) in leaderboardData" :key="user.id" class="leaderboard-item"
              :class="{ 'current-user': user.isCurrentUser }">
              <div class="item-user">
                <span class="item-rank">{{ user.rank || '--' }}</span>
                <img :src="user.avatar" :alt="$t('common.userAvatar')" class="user-avatar" />
                <span class="user-name">{{ user.name }}</span>
              </div>
              <div class="item-profit">
                <span class="profit-label">{{ $t('leaderboard.profitLoss') }}:</span>
                <span v-if="user.profit !== null" :class="{ positive: user.profit > 0 }">
                  {{ user.profit > 0 ? '+' : '' }}${{ formatNumber(user.profit) }}
                </span>
                <span v-else>--</span>
              </div>
              <div class="item-quantity">
                <span class="quantity-label">{{ $t('leaderboard.quantity') }}:</span>
                <span v-if="user.quantity !== null">${{ formatNumber(user.quantity) }}</span>
                <span v-else>--</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧本月最大胜利区域 -->
        <div class="right-wins">
          <div class="wins-header">
            <svg t="1765595445080" class="icon bell-icon" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" p-id="7840" width="32" height="32">
              <path
                d="M864.10445369 802.99470279c-102.19894784 88.52652487-565.95981085 39.48007197-565.95981084 39.4800731s-153.64778439-11.74476117-153.31691748-103.08879587c0.23427869-64.55405909 87.97165454-69.47391147 99.4924123-123.95604196 8.21825081-38.86149405 8.48130048-146.03372658 40.77477092-238.12786289 28.91492466-82.45993927 145.97001899-181.76328477 220.03291591-193.44433835 86.3132069-13.61488099 195.93303609 99.85821582 231.18787129 179.81301646 18.61282702 42.21126883 26.03781803 196.51256775 30.93300906 234.35679858 5.52815502 42.75586389 86.53104583 87.91411143 105.35965582 120.15826033 17.45170887 29.88492003 21.17550649 59.09988579-8.50390698 84.8088906zM595.18127104 915.53479566c0 39.63420331-32.13111865 71.76532195-71.76532195 71.76532196s-71.76326713-32.13111865-71.76326714-71.76532196 32.12906382-30.98849621 71.76326714-30.98849735 71.76532195-8.64570595 71.76532195 30.98849735zM579.68599495 127.64523293c0 28.31484245-25.19318073 24.60953941-56.27004586 24.60953941s-56.27004587 3.70530304-56.27004587-24.60953941c0-28.31278763 25.19318073-51.26593536 56.27004587-51.26593536s56.27004587 22.95109291 56.27004586 51.26593536zM299.34480725 254.6859429c-29.00740323 33.92725561-44.67119445 66.87629539-49.72051683 62.56268971-5.04726755-4.31566051 2.44143104-44.26018019 31.44472348-78.18743467 29.00534727-33.92725561 67.11262891-46.43856043 72.15784164-42.12290105 5.04932238 4.31360569-24.87669987 23.81833557-53.88204829 57.74764601zM724.81343261 255.75869326c-22.64899698-38.46280875-48.71353003-63.99302315-42.99219741-67.36540331 5.72133262-3.36827051 41.05837113 16.70366094 63.70942293 55.16441487 22.64899698 38.46280875 22.08796103 78.56762425 16.36662841 81.93589475-5.72133262 3.37032533-14.43280099-31.27209757-37.08385393-69.73490631z"
                p-id="7841" fill="#909090"></path>
            </svg>
            <h2 class="wins-title">{{ $t('leaderboard.thisMonthBiggestWin') }}</h2>
          </div>
          <div class="wins-list">
            <div v-for="(user, index) in monthlyWinsData" :key="user.id" class="wins-item">
              <div class="wins-rank">{{ user.rank }}</div>
              <div class="wins-user">
                <img :src="user.avatar" :alt="$t('leaderboard.userAvatar')" class="wins-avatar" />
                <div class="wins-user-info">
                  <span class="wins-name">{{ user.name }}</span>
                  <div class="wins-amount">
                    <span class="amount-from">${{ formatNumber(user.amountFrom) }}</span>
                    <span class="arrow">→</span>
                    <span class="amount-to">${{ formatNumber(user.amountTo) }}</span>
                  </div>
                </div>
              </div>
            </div>
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
import { Search } from '@element-plus/icons-vue'

const { t } = useI18n()


// 时间筛选
const timeFilters = computed(() => [
  { value: 'today', label: 'Today' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'all', label: 'All' }
])
const activeTimeFilter = ref('today')

// 搜索
const searchQuery = ref('')
const selectedCategory = ref('all')

// 排行榜数据
const leaderboardData = ref([
  {
    id: 1,
    rank: 1,
    name: 'Alan Schneider',
    avatar: 'https://picsum.photos/seed/user1/40/40',
    profit: 2345678,
    quantity: 2345678
  },
  {
    id: 2,
    rank: 2,
    name: 'Mike Adams',
    avatar: 'https://picsum.photos/seed/user2/40/40',
    profit: 2345678,
    quantity: 2345678
  },
  {
    id: 3,
    rank: 3,
    name: 'Louisa Pierce',
    avatar: 'https://picsum.photos/seed/user3/40/40',
    profit: 2345678,
    quantity: 2345678
  },
  {
    id: 4,
    rank: 4,
    name: 'Jerry Hudson',
    avatar: 'https://picsum.photos/seed/user4/40/40',
    profit: 2345678,
    quantity: 2345678
  },
  {
    id: 5,
    rank: 5,
    name: 'Kelly Barrett',
    avatar: 'https://picsum.photos/seed/user5/40/40',
    profit: 2345678,
    quantity: 2345678
  },
  {
    id: 6,
    rank: 6,
    name: 'Julie Hill',
    avatar: 'https://picsum.photos/seed/user6/40/40',
    profit: 2345678,
    quantity: 2345678
  },
  {
    id: 7,
    rank: null,
    name: 'Bianca Hoffman (自己)',
    avatar: 'https://picsum.photos/seed/user7/40/40',
    profit: null,
    quantity: null,
    isCurrentUser: true
  }
])

// 本月最大胜利数据
const monthlyWinsData = ref([
  {
    id: 1,
    rank: 1,
    name: 'Michelle Clark',
    avatar: 'https://picsum.photos/seed/win1/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  },
  {
    id: 2,
    rank: 2,
    name: 'Larry Holland',
    avatar: 'https://picsum.photos/seed/win2/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  },
  {
    id: 3,
    rank: 3,
    name: 'Michelle Dean',
    avatar: 'https://picsum.photos/seed/win3/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  },
  {
    id: 4,
    rank: 4,
    name: 'Amanda Baker',
    avatar: 'https://picsum.photos/seed/win4/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  },
  {
    id: 5,
    rank: 5,
    name: 'Denise Oliver',
    avatar: 'https://picsum.photos/seed/win5/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  },
  {
    id: 6,
    rank: 6,
    name: 'Joan Mendoza',
    avatar: 'https://picsum.photos/seed/win6/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  },
  {
    id: 7,
    rank: 7,
    name: 'Alice Mendoza',
    avatar: 'https://picsum.photos/seed/win7/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  },
  {
    id: 8,
    rank: 8,
    name: 'Carol Gray',
    avatar: 'https://picsum.photos/seed/win8/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  },
  {
    id: 9,
    rank: 9,
    name: 'Will Watkins',
    avatar: 'https://picsum.photos/seed/win9/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  },
  {
    id: 10,
    rank: 10,
    name: 'Keanu Matthews',
    avatar: 'https://picsum.photos/seed/win10/40/40',
    amountFrom: 2345678,
    amountTo: 2345678
  }
])


// 处理时间筛选点击
const handleTimeFilterClick = (value) => {
  activeTimeFilter.value = value
  console.log('时间筛选:', value)
  // 这里可以根据不同的时间筛选加载不同的数据
}

// 处理搜索
const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
  // 这里可以实现搜索逻辑
}

// 格式化数字（添加千分位）
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
</script>

<style scoped lang="scss">
.leaderboard-page {
  min-height: 100vh;
  background-color: var(--bg-page-h5, #F5F5F5);
  padding-top: 128px; // header(80px) + navbar2(48px)

  .main-content {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 32px 64px;
    box-sizing: border-box;

    .content-wrapper {
      display: flex;
      gap: 24px;
      align-items: flex-start;

      // 左侧主排行榜区域
      .left-leaderboard {
        flex: 1;
        background: var(--bg-page-h5, #ffffff);
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-color, #000000);
          margin: 0 0 24px 0;
        }

        // 时间筛选和类别筛选区域
        .time-category-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;

          .time-filters {
            display: flex;
            gap: 8px;

            .time-filter-btn {
              padding: 8px 16px;
              border: none;
              background: transparent;
              color: var(--text-color, #000000);
              border-radius: 4px;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
              border: 1px solid #E0E0E0;

              &:hover {
                background: #F5F5F5;
              }

              &.active {
                background: var(--text-color, #000000);
                color: var(--bg-card, #ffffff);
                border-color: var(--text-color, #000000);
              }
            }
          }

          .category-dropdown {
            min-width: 150px;

            .category-select {
              width: 100%;
              padding: 8px 12px;
              border: 1px solid #E0E0E0;
              border-radius: 6px;
              background: var(--bg-page-h5, #ffffff);
              font-size: 14px;
              color: var(--text-color, #333333);
              cursor: pointer;
              outline: none;

              &:hover {
                border-color: #999;
              }
            }
          }
        }

        // 表格头部
        .table-header {
          display: grid;
          grid-template-columns: 1fr 150px 150px;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #E0E0E0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-dark-gray, #666666);
          margin-bottom: 8px;

          .header-search {
            .search-box {
              display: flex;
              align-items: center;
              border-radius: 6px;
              padding: 8px 12px;
              box-sizing: border-box;

              .search-icon {
                color: #999;
                margin-right: 8px;
                font-size: 16px;
              }

              .search-input {
                border: none;
                background: transparent;
                outline: none;
                font-size: 14px;
                color: var(--text-color, #333333);
                width: 100%;

                &::placeholder {
                  color: #999;
                }
              }
            }
          }

          .header-profit,
          .header-quantity {
            text-align: center;
          }
        }

        // 排行榜列表
        .leaderboard-list {
          .leaderboard-item {
            display: grid;
            grid-template-columns: 1fr 150px 150px;
            gap: 16px;
            padding: 16px 0;
            border-bottom: 1px solid #F0F0F0;
            align-items: center;
            transition: background-color 0.2s;

            &.current-user {
              background-color: var(--bg-current-user, #E8F5E9);
              border-radius: 4px;
              padding: 16px;
              margin: 8px 0;
            }

            .item-user {
              display: flex;
              align-items: center;
              gap: 12px;

              .item-rank {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-color, #000000);
                min-width: 30px;
              }

              .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
              }

              .user-name {
                font-size: 14px;
                color: var(--text-color, #000000);
              }
            }

            .item-profit {
              text-align: center;

              .profit-label {
                display: none; // 桌面端隐藏标签
              }

              .positive {
                font-family: PingFang SC, PingFang SC;
                font-weight: 600;
                font-size: 16px;
                color: var(--text-color, #000000);
                line-height: 20px;
                font-style: normal;
                text-transform: none;
              }
            }

            .item-quantity {
              font-family: PingFang SC, PingFang SC;
              font-weight: 600;
              font-size: 16px;
              color: var(--text-dark-gray, #909090);
              line-height: 20px;
              font-style: normal;
              text-transform: none;
              text-align: center;

              .quantity-label {
                display: none; // 桌面端隐藏标签
              }
            }
          }
        }
      }

      // 右侧本月最大胜利区域
      .right-wins {
        flex: 0 0 320px;
        background: var(--bg-page-h5, #ffffff);
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        .wins-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;

          .bell-icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
          }

          .wins-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #000000);
            margin: 0;
          }
        }

        .wins-list {
          .wins-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #F0F0F0;

            &:last-child {
              border-bottom: none;
            }

            .wins-rank {
              font-size: 14px;
              font-weight: 600;
              color: var(--text-dark-gray, #666666);
              min-width: 24px;
              padding-top: 2px;
            }

            .wins-user {
              flex: 1;
              display: flex;
              align-items: flex-start;
              gap: 8px;

              .wins-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                object-fit: cover;
                flex-shrink: 0;
              }

              .wins-user-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
                flex: 1;
              }

              .wins-name {
                font-size: 14px;
                color: var(--text-color, #000000);
              }
            }

            .wins-amount {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 14px;

              .amount-from {
                color: var(--text-dark-gray, #666666);
              }

              .arrow {
                color: #999;
              }

              .amount-to {
                color: #10B981;
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1280px) {
  .leaderboard-page {
    .main-content {
      padding: 28px 24px 56px;

      .content-wrapper {
        gap: 20px;
      }
    }
  }
}

@media (max-width: 1024px) {
  .leaderboard-page {
    .main-content {
      padding: 24px 20px 48px;

      .content-wrapper {
        flex-direction: column;
        gap: 20px;

        .left-leaderboard {
          .time-category-section {
            .time-filters {
              .time-filter-btn {
                padding: 7px 14px;
                font-size: 13px;
              }
            }
          }

          .table-header {
            grid-template-columns: 1fr 130px 130px;
            gap: 12px;
          }

          .leaderboard-list {
            .leaderboard-item {
              grid-template-columns: 1fr 130px 130px;
              gap: 12px;
            }
          }
        }

        .right-wins {
          flex: 1;
          width: 100%;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .leaderboard-page {
    padding-top: 108px;

    .main-content {
      padding: 16px 16px 40px;

      .content-wrapper {
        gap: 16px;

        .left-leaderboard {
          padding: 16px;
          border-radius: 10px;

          .page-title {
            font-size: 22px;
            margin-bottom: 16px;
          }

          .time-category-section {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            margin-bottom: 16px;

            .time-filters {
              flex-wrap: wrap;
              width: 100%;
              gap: 6px;

              .time-filter-btn {
                padding: 8px 12px;
                font-size: 13px;
                min-height: 36px; // 触摸友好的最小高度
                flex: 1;
                min-width: calc(50% - 3px);
              }
            }

            .category-dropdown {
              width: 100%;

              .category-select {
                width: 100%;
                padding: 10px 12px;
                min-height: 44px; // 触摸友好的最小高度
                font-size: 14px;
              }
            }
          }

          .table-header {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 0;
            border-bottom: none;
            margin-bottom: 12px;

            .header-search {
              width: 100%;
              order: 1;

              .search-box {
                width: 100%;
                background: var(--bg-page-h5, #F5F5F5);
                border: 1px solid #E0E0E0;
                padding: 10px 12px;
                border-radius: 8px;
              }
            }

            .header-profit,
            .header-quantity {
              display: none; // 移动端隐藏列标题，使用卡片内标签
            }
          }

          .leaderboard-list {
            .leaderboard-item {
              display: flex;
              flex-direction: column;
              gap: 12px;
              padding: 14px;
              border: 1px solid #F0F0F0;
              border-radius: 8px;
              margin-bottom: 12px;
              background: var(--bg-card, #FAFAFA);

              &.current-user {
                background-color: var(--bg-current-user, #E8F5E9);
                border-color: var(--bg-current-user-border, #C8E6C9);
                margin: 12px 0;
              }

              .item-user {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;

                .item-rank {
                  font-size: 16px;
                  font-weight: 700;
                  min-width: 28px;
                }

                .user-avatar {
                  width: 36px;
                  height: 36px;
                }

                .user-name {
                  font-size: 14px;
                  font-weight: 500;
                  flex: 1;
                }
              }

              .item-profit,
              .item-quantity {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-top: 1px solid #E0E0E0;
                font-size: 14px;

                .profit-label,
                .quantity-label {
                  display: inline-block; // 移动端显示标签
                  font-size: 12px;
                  color: var(--text-dark-gray, #666666);
                  font-weight: 500;
                }

                > span:not(.profit-label):not(.quantity-label) {
                  font-weight: 600;
                }
              }

              .item-profit {
                .positive {
                  font-size: 15px;
                  font-weight: 600;
                }
              }
            }
          }
        }

        .right-wins {
          padding: 16px;
          border-radius: 10px;

          .wins-header {
            margin-bottom: 16px;
            gap: 8px;

            .bell-icon {
              width: 20px;
              height: 20px;
            }

            .wins-title {
              font-size: 16px;
            }
          }

          .wins-list {
            .wins-item {
              padding: 12px 0;
              gap: 10px;

              .wins-rank {
                font-size: 14px;
                min-width: 22px;
              }

              .wins-user {
                gap: 10px;

                .wins-avatar {
                  width: 32px;
                  height: 32px;
                }

                .wins-user-info {
                  gap: 6px;

                  .wins-name {
                    font-size: 13px;
                    font-weight: 500;
                  }
                }
              }

              .wins-amount {
                font-size: 13px;
                margin-top: 4px;

                .amount-from,
                .amount-to {
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

@media (max-width: 480px) {
  .leaderboard-page {
    padding-top: 50px;

    .main-content {
      box-sizing: border-box;
      padding: 12px 12px 32px;

      .content-wrapper {
        gap: 12px;

        .left-leaderboard {
          padding: 12px;
          box-sizing: border-box;
          width: 100%;

          .page-title {
            font-size: 20px;
            margin-bottom: 12px;
          }

          .time-category-section {
            gap: 10px;
            margin-bottom: 12px;

            .time-filters {
              gap: 6px;

              .time-filter-btn {
                padding: 8px 10px;
                font-size: 12px;
                min-height: 36px;
                min-width: calc(50% - 3px);
              }
            }

            .category-dropdown {
              .category-select {
                padding: 8px 10px;
                font-size: 13px;
                min-height: 40px;
              }
            }
          }

          .leaderboard-list {
            .leaderboard-item {
              padding: 12px;
              gap: 10px;
              margin-bottom: 10px;

              .item-user {
                gap: 8px;

                .item-rank {
                  font-size: 15px;
                  min-width: 24px;
                }

                .user-avatar {
                  width: 32px;
                  height: 32px;
                }

                .user-name {
                  font-size: 13px;
                }
              }

              .item-profit,
              .item-quantity {
                padding: 8px 0;
                font-size: 13px;

                .profit-label,
                .quantity-label {
                  font-size: 11px;
                }

                > span:not(.profit-label):not(.quantity-label) {
                  font-size: 13px;
                }
              }

              .item-profit {
                .positive {
                  font-size: 14px;
                }
              }
            }
          }
        }

        .right-wins {
          padding: 12px;
          box-sizing: border-box;

          .wins-header {
            margin-bottom: 12px;

            .bell-icon {
              width: 18px;
              height: 18px;
            }

            .wins-title {
              font-size: 15px;
            }
          }

          .wins-list {
            .wins-item {
              padding: 10px 0;
              gap: 8px;

              .wins-rank {
                font-size: 13px;
                min-width: 20px;
              }

              .wins-user {
                gap: 8px;

                .wins-avatar {
                  width: 28px;
                  height: 28px;
                }

                .wins-user-info {
                  gap: 4px;

                  .wins-name {
                    font-size: 12px;
                  }
                }
              }

              .wins-amount {
                font-size: 12px;

                .amount-from,
                .amount-to {
                  font-size: 12px;
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
