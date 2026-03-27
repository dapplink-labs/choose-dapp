<template>
  <div class="breaking-mobile-page">
    <!-- 突发事件横幅 -->
    <div class="hero-banner">
      <img class="hero-image" :src="breakingBanner" alt="breaking banner" />
    </div>

    <!-- 类别筛选器 -->
    <div class="category-filter">
      <div class="filter-scroll-container">
        <button v-for="category in categories" :key="category.key" class="filter-btn"
          :class="{ active: activeCategory === category.key }" @click="handleCategoryClick(category.key)">
          {{ category.label }}
        </button>
      </div>
    </div>

    <!-- 事件列表 -->
    <div class="events-list">
      <div v-for="(item, index) in eventsList" :key="item.id" class="event-item" @click="handleEventClick(item)">
        <div class="event-number">{{ index + 1 }}</div>
        <img :src="item.avatar" :alt="item.title" class="event-avatar" @error="handleImgError" />
        <div class="event-content">
          <div class="event-title-row">
            <div class="event-title">{{ item.title }}</div>
            <div class="event-stats">
              <div class="stat-percent">{{ item.mainPercent }}%</div>
              <div class="stat-change" :class="item.changeClass"
                v-if="item.changePercent !== undefined && item.changePercent !== null">
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
      <!-- 列表为空 -->
      <div v-if="!eventsList.length && !loading" class="list-empty">
        <p class="list-empty-text">{{ $t('home.listEmpty') || '暂无事件' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TopRight, BottomRight } from '@element-plus/icons-vue'
import lp1Png from '@/assets/icon/LP1.png'
import breakingBanner from '@/assets/images/breakingBanner.png'
import { getCategoryList, getEventList } from "@/api/APIEvent"
import { useAccount } from "@wagmi/vue"
import { useI18n } from "vue-i18n"

const router = useRouter()
const { address } = useAccount()
const { t } = useI18n()

const currentLocale = localStorage.getItem('app-locale') || navigator.language || 'en'
const language = currentLocale.split('-')[0]

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
const categoryList = ref([])
const categories = ref([{ key: 'all', label: t('home.all') || '全部' }])
const activeCategory = ref('all')

const handleCategoryClick = (key) => {
  activeCategory.value = key
  fetchEventList()
}

// 获取分类列表数据
async function getCategoryListData() {
  try {
    const response = await getCategoryList({ language_label: language });
    const data = response?.data?.data?.categories || [];
    categoryList.value = data;
    categories.value = [
      { key: 'all', label: t('home.all') || '全部' },
      ...data.map(item => ({
        key: item.guid,
        label: item.name
      }))
    ];
  } catch (err) {
    console.error('Fetch category list failed', err);
  }
}

// 事件列表数据
const eventsList = ref([])
const loading = ref(false)

const fetchEventList = async () => {
  loading.value = true;
  try {
    const params = {
      language_label: language,
      event_type: 1, // 1 for breaking events
      page: 1,
      page_size: 50,
      user_address: address.value || '',
      include_sub_events: true
    };

    if (activeCategory.value !== 'all') {
      params.category_guid = activeCategory.value;
    }

    const res = await getEventList(params);
    const list = res?.data?.data?.events || [];

    eventsList.value = list.map(e => {
      const subEvents = Array.isArray(e.sub_events) ? e.sub_events : [];
      const changePercent = e.change_percent !== undefined ? e.change_percent : 0;
      return {
        id: e.event_guid,
        code: e.code || '',
        category_guid: e.category_guid || '',
        avatar: e.logo || '',
        title: e.title || '',
        mainPercent: e.cluster_score || 0,
        changePercent: changePercent,
        changeClass: changePercent >= 0 ? 'positive' : 'negative',
        options: subEvents.map((sub) => ({
          text: sub.title || '',
          subEventGuid: sub.sub_event_guid || '',
        })),
      };
    });
  } catch (err) {
    console.error('Fetch event list failed', err);
    eventsList.value = [];
  } finally {
    loading.value = false;
  }
}

// 事件点击处理
const handleEventClick = (item) => {
  const fallbackSubEventGuid = item?.options?.[0]?.subEventGuid || '';

  // 优先按事件 code 分流，兜底再用 category code
  const eventCode = String(item.code || '').toUpperCase();
  const categoryCode = String(
    categoryList.value.find(c => c.guid === item.category_guid || c.category_guid === item.category_guid)?.code || ''
  ).toUpperCase();
  const targetCode = eventCode || categoryCode;

  // 1. 体育事件：进入体育详情页
  if (targetCode === 'SPORTS') {
    router.push({
      path: '/sports-detail-h5',
      query: {
        id: item.id,
      },
    });
    return;
  }

  // 2.单事件详情页
  if (item?.options?.length === 1) {
    const cryptoQuery = {
      event_guid: item.id,
      ...(fallbackSubEventGuid ? { sub_event_guid: fallbackSubEventGuid } : {})
    };
    router.push({
      path: '/bitcoin-up-down',
      query: cryptoQuery,
    });
    return;
  }

  // 3. 默认行为：跳转多子事件详情页
  router.push({
    path: "/detail-h5",
    query: {
      id: item.id,
      ...(fallbackSubEventGuid ? { sub_event_guid: fallbackSubEventGuid } : {}),
    },
  });
}

onMounted(() => {
  getCategoryListData();
  fetchEventList();
})
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

    .list-empty {
      padding: 40px 0;
      text-align: center;

      .list-empty-text {
        font-size: 14px;
        color: var(--text-gray, #999);
      }
    }
  }
}
</style>
