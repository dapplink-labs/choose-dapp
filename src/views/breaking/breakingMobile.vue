<template>
  <div class="breaking-mobile-page">
    <!-- 突发事件横幅 -->
    <div class="hero-banner">
      <img class="hero-image" :src="breakingBanner" alt="breaking banner" />
    </div>

    <!-- 类别筛选器 -->
    <div class="category-filter">
      <div class="filter-scroll-container">
        <button 
          v-for="category in categories" 
          :key="category.key"
          class="filter-btn"
          :class="{ active: activeCategory === category.key }"
          @click="handleCategoryClick(category.key)">
          {{ category.label }}
        </button>
      </div>
    </div>

    <!-- 事件列表 -->
    <div class="events-list">
      <div 
        v-for="(item, index) in eventsList" 
        :key="item.id"
        class="event-item"
        @click="handleEventClick(item)">
        <div class="event-number">{{ index + 1 }}</div>
        <img :src="item.avatar" :alt="item.title" class="event-avatar" @error="handleImgError" />
        <div class="event-content">
          <div class="event-title-row">
            <div class="event-title">{{ item.title }}</div>
            <div class="event-stats">
              <div class="stat-percent">{{ item.mainPercent }}%</div>
              <div class="stat-change" :class="item.changeClass">
                <el-icon class="change-icon">
                  <TopRight style="color: #4CAF50;" v-if="item.changeClass === 'positive'" />
                  <BottomRight style="color: #F44336;" v-else />
                </el-icon>
                <span class="change-value">{{ item.changePercent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { TopRight, BottomRight } from '@element-plus/icons-vue'
import lp1Png from '@/assets/icon/LP1.png'
import breakingBanner from '@/assets/images/breakingBanner.png'

const router = useRouter()

// 图片加载失败兜底（避免外链失效导致裂图）
const handleImgError = (e) => {
  const img = e?.target
  if (!img) return
  // 防止死循环：如果已经替换过就不再处理
  if (img.dataset?.fallbackApplied === '1') return
  if (img.src && String(img.src).includes('LP1.png')) return
  if (img.dataset) img.dataset.fallbackApplied = '1'
  img.src = lp1Png
}

// 类别筛选器
const categories = [
  { key: 'all', label: '全部' },
  { key: 'finance', label: '金融' },
  { key: 'crypto', label: '加密' },
  { key: 'sports', label: '体育' },
  { key: 'esports', label: '电子竞技' }
]

const activeCategory = ref('all')

const handleCategoryClick = (key) => {
  activeCategory.value = key
  // TODO: 根据类别筛选事件列表
}

// 事件列表数据
const eventsList = ref([
  {
    id: 1,
    avatar: 'https://effigy.im/a/elonmusk.eth.svg',
    title: '埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文？',
    mainPercent: 100,
    changePercent: 28,
    changeArrow: '↑',
    changeClass: 'positive'
  },
  {
    id: 2,
    avatar: 'https://picsum.photos/seed/game1/60/60',
    title: '王者荣耀2025年11月26日比赛结果预测',
    mainPercent: 88,
    changePercent: 15,
    changeArrow: '↑',
    changeClass: 'positive'
  },
  {
    id: 3,
    avatar: 'https://picsum.photos/seed/game2/60/60',
    title: '英雄联盟2025年11月26日比赛结果预测',
    mainPercent: 75,
    changePercent: 12,
    changeArrow: '↑',
    changeClass: 'positive'
  },
  {
    id: 4,
    avatar: 'https://picsum.photos/seed/game3/60/60',
    title: '绝地求生2025年11月26日比赛结果预测',
    mainPercent: 65,
    changePercent: 8,
    changeArrow: '↓',
    changeClass: 'negative'
  },
  {
    id: 5,
    avatar: 'https://picsum.photos/seed/user5/60/60',
    title: '比特币价格2025年底预测',
    mainPercent: 58,
    changePercent: 5,
    changeArrow: '↑',
    changeClass: 'positive'
  },
  {
    id: 6,
    avatar: 'https://picsum.photos/seed/user6/60/60',
    title: '以太坊2.0升级完成时间预测',
    mainPercent: 52,
    changePercent: 3,
    changeArrow: '↑',
    changeClass: 'positive'
  }
])

// 事件点击处理
const handleEventClick = (item) => {
  router.push(`/detail-h5?id=${item.id}`)
}
</script>

<style scoped lang="scss">
.breaking-mobile-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-page-h5, #ffffff);
  padding: 60px 0; 
  box-sizing: border-box;

  // 突发事件横幅
  .hero-banner {
    width: 100%;
    padding: 0 16px;
    position: relative;
    box-sizing: border-box;

    .hero-image {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 12px;
      object-fit: cover;
    }
  }

  // 类别筛选器
  .category-filter {
    background-color: var(--bg-page-h5, #ffffff);
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .filter-scroll-container {
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 0 16px;
      gap: 12px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }

      .filter-btn {
        flex-shrink: 0;
        padding: 4px 18px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        border: 1px solid var(--border-color, #E0E0E0);
        background-color: transparent;
        color: var(--text-color, #1a1a1a);

        &.active {
          background-color: var(--bg-opposite, #000000);
          color: var(--bg-page-h5, #ffffff);
          border-color: var(--bg-opposite, #000000);
        }
      }
    }
  }

  // 事件列表
  .events-list {
    padding: 16px;

    .event-item {
      display: flex;
      align-items: flex-start;
      padding: 16px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: background-color 0.2s;

      &:active {
        background-color: rgba(255, 255, 255, 0.05);
      }

      &:last-child {
        border-bottom: none;
      }

      .event-number {
        width: 32px;
        text-align: left;
        font-size: 20px;
        font-weight: 600;
        color: var(--text-gray, #999);
        flex-shrink: 0;
        margin-right: 12px;
      }

      .event-avatar {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
        margin-right: 12px;
      }

      .event-content {
        flex: 1;
        min-width: 0;

        .event-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          width: 100%;

          .event-title {
            flex: 1;
            min-width: 0;
            font-size: 14px;
            color: var(--bg-opposite, #000000);
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .event-stats {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;

            .stat-percent {
              font-size: 16px;
              font-weight: 600;
              color: var(--bg-opposite, #000000);
              line-height: 1.2;
              white-space: nowrap;
            }

            .stat-change {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 14px;
              font-weight: 500;
              line-height: 1.2;
              white-space: nowrap;

              &.positive {
                color: #4CAF50;

              }

              &.negative {
                color: #F44336;
              }

              .change-icon {
                font-size: 14px;
              }

              .change-value {
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }
}

</style>
