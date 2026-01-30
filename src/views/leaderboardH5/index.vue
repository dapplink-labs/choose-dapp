<template>
  <div class="leaderboard-h5" @click="closeDropdowns">
    <BackHeaderNav />
    <!-- 顶部 Banner -->
    <div class="hero" :style="{ backgroundImage: `url(${bannerBg})` }">
      <div class="hero-content">
        <div class="page-title">{{ $t('leaderboard.title') }}</div>

        <div class="filters">
          <!-- 时间周期下拉 -->
          <div class="pill pill-select" @click.stop="togglePeriod">
            <span class="pill-text">{{ currentPeriodLabel }}</span>
            <span class="pill-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </span>
            <div v-show="showPeriodDropdown" class="dropdown">
              <button v-for="item in periodOptions" :key="item.value" class="dropdown-item" type="button"
                @click.stop="selectPeriod(item.value)">
                {{ item.label }}
              </button>
            </div>
          </div>

          <!-- 分类下拉 -->
          <div class="pill pill-select" @click.stop="toggleCategory">
            <span class="pill-text">{{ currentCategoryLabel }}</span>
            <span class="pill-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </span>
            <div v-show="showCategoryDropdown" class="dropdown">
              <button v-for="item in categoryOptions" :key="item.value" class="dropdown-item" type="button"
                @click.stop="selectCategory(item.value)">
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-fade" />
    </div>

    <!-- 搜索 + Tab -->
    <div class="toolbar">
      <div class="search">
        <span class="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </span>
        <input v-model="searchQuery" class="search-input" type="text"
          :placeholder="$t('leaderboard.searchByName') || '搜索'" />
      </div>

      <button class="tab active" type="button">
        {{ $t('leaderboard.profitLoss') || '盈亏' }}
      </button>
    </div>

    <!-- 列表 -->
    <div class="list">
      <div v-for="user in filteredList" :key="user.id" class="row">
        <div class="rank">{{ user.rank }}</div>
        <img class="avatar" :src="user.avatar" :alt="$t('common.userAvatar')" />
        <div class="name">{{ user.name }}</div>
        <div class="value" :class="{ positive: user.profit >= 0 }">
          {{ user.profit >= 0 ? '+' : '-' }} ${{ formatNumber(Math.abs(user.profit)) }}
        </div>
      </div>
    </div>

    <!-- 底部本人卡片（悬浮） -->
    <div class="me-card" v-if="meUser">
      <div class="rank">{{ meUser.rank }}</div>
      <img class="avatar" :src="meUser.avatar" :alt="$t('common.userAvatar')" />
      <div class="name">{{ meUser.name }}</div>
      <div class="value positive">
        + ${{ formatNumber(Math.abs(meUser.profit)) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'

import bannerBg from '@/assets/images/bannerBG1.png'

const themeStore = useThemeStore()
const { t } = useI18n()

const searchQuery = ref('')

type PeriodValue = 'today' | 'week' | 'month'
type CategoryValue = 'all' | 'finance' | 'crypto' | 'sports'

const showPeriodDropdown = ref(false)
const showCategoryDropdown = ref(false)
const selectedPeriod = ref<PeriodValue>('month')
const selectedCategory = ref<CategoryValue>('finance')

const periodOptions = computed(() => [
  { value: 'today' as PeriodValue, label: t('leaderboard.periodToday') || '今日' },
  { value: 'week' as PeriodValue, label: t('leaderboard.periodWeekly') || '本周' },
  { value: 'month' as PeriodValue, label: t('leaderboard.periodMonthly') || '月度' }
])

const categoryOptions = computed(() => [
  { value: 'all' as CategoryValue, label: t('leaderboard.categoryAll') || '全部' },
  { value: 'finance' as CategoryValue, label: t('leaderboard.categoryFinance') || '金融' },
  { value: 'crypto' as CategoryValue, label: t('leaderboard.categoryCrypto') || '加密' },
  { value: 'sports' as CategoryValue, label: t('leaderboard.categorySports') || '体育' }
])

const currentPeriodLabel = computed(() => {
  return periodOptions.value.find(i => i.value === selectedPeriod.value)?.label || ''
})

const currentCategoryLabel = computed(() => {
  return categoryOptions.value.find(i => i.value === selectedCategory.value)?.label || ''
})

type LeaderRow = {
  id: number
  rank: number
  name: string
  avatar: string
  profit: number
  isMe?: boolean
}

const list = ref<LeaderRow[]>([
  { id: 1, rank: 1, name: 'Bianca Coleman', avatar: 'https://picsum.photos/seed/lb1/64/64', profit: 2345678 },
  { id: 2, rank: 2, name: 'Janice Bradley', avatar: 'https://picsum.photos/seed/lb2/64/64', profit: 2345678 },
  { id: 3, rank: 3, name: 'Ryan Alvarado', avatar: 'https://picsum.photos/seed/lb3/64/64', profit: 2345678 },
  { id: 4, rank: 4, name: 'Aaron Gomez', avatar: 'https://picsum.photos/seed/lb4/64/64', profit: 2345678 },
  { id: 5, rank: 5, name: 'Aaron Hart', avatar: 'https://picsum.photos/seed/lb5/64/64', profit: 2345678 },
  { id: 6, rank: 6, name: 'Amber Elliot', avatar: 'https://picsum.photos/seed/lb6/64/64', profit: 2345678 },
  { id: 7, rank: 666, name: 'Amber Elliot(本人)', avatar: 'https://picsum.photos/seed/me/64/64', profit: 2345678, isMe: true }
])

const meUser = computed(() => list.value.find(i => i.isMe))

const filteredList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list.value.filter(i => !i.isMe)
  return list.value.filter(i => !i.isMe && i.name.toLowerCase().includes(q))
})

const togglePeriod = () => {
  showPeriodDropdown.value = !showPeriodDropdown.value
  if (showPeriodDropdown.value) showCategoryDropdown.value = false
}

const toggleCategory = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
  if (showCategoryDropdown.value) showPeriodDropdown.value = false
}

const selectPeriod = (val: PeriodValue) => {
  selectedPeriod.value = val
  showPeriodDropdown.value = false
}

const selectCategory = (val: CategoryValue) => {
  selectedCategory.value = val
  showCategoryDropdown.value = false
}

const closeDropdowns = () => {
  showPeriodDropdown.value = false
  showCategoryDropdown.value = false
}

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

onMounted(() => {
  themeStore.applyTheme()
})
</script>

<style scoped lang="scss">
.leaderboard-h5 {
  min-height: 100vh;
  background: var(--bg-page-h5, #000000);
  color: var(--text-color, #ffffff);
  padding-bottom: 96px; // 预留给底部本人卡片
  box-sizing: border-box;
  --me-glass-bg: rgba(255, 255, 255, 0.62);
  --me-glass-border: rgba(0, 0, 0, 0.08);
  --me-glass-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
  --me-glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.55);
  --me-glass-hi-0: rgba(255, 255, 255, 0.55);
  --me-glass-hi-1: rgba(255, 255, 255, 0.18);
  --me-glass-topline: rgba(255, 255, 255, 0.45);
  --me-glass-bottom: rgba(0, 0, 0, 0.04);

}

.theme-dark .leaderboard-h5 {
  --me-glass-bg: rgba(0, 0, 0, 0.62);
  --me-glass-border: rgba(255, 255, 255, 0.10);
  --me-glass-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
  --me-glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  --me-glass-hi-0: rgba(255, 255, 255, 0.14);
  --me-glass-hi-1: rgba(255, 255, 255, 0.04);
  --me-glass-topline: rgba(255, 255, 255, 0.06);
  --me-glass-bottom: rgba(0, 0, 0, 0.10);
}

.hero {
  position: relative;
  height: 224px;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  overflow: visible;

  .hero-content {
    width: 100%;
    padding: 77px 10px 0;
    box-sizing: border-box;
    position: relative;
    z-index: 999;
  }

  .page-title {
    font-family: Noto Sans SC, Noto Sans SC;
    font-weight: bold;
    font-size: 28px;
    color: var(--bg-opposite, #FFFFFF);
    margin-bottom: 27px;
  }

  .filters {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .pill {
    border-radius: 999px;
    border: 1px solid var(--border-color, #E0E0E0);
    color: var(--bg-opposite, #ffffff);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 8px 21px;
    box-sizing: border-box;
    cursor: pointer;
    position: relative;

    .pill-text {
      font-size: 14px;
      font-weight: 600;
    }

    .pill-icon {
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--bg-opposite);

      svg {
        width: 18px;
        height: 18px;
        display: block;
      }
    }
  }

  .pill-select .dropdown {
    position: absolute;
    left: 0;
    right: 0;
    top: 44px;
    padding-top: 6px;
    z-index: 5;
    background-color: var(--bg-page-h5, #000000);
    border: 1px solid var(--border-color, #23262F);
    box-shadow: 0 8px 20px rgba(15, 15, 15, 0.18);
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .pill-select .dropdown-item {
    width: 100%;
    height: 36px;
    border: none;
    color: var(--bg-opposite);
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    cursor: pointer;
  }

  .hero-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 96px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), var(--bg-page-h5, #000000));
    z-index: 1;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px;
  border-bottom: 1px solid var(--border-color, #E0E0E0);
  border-top: 1px solid var(--border-color, #E0E0E0);

  .search {
    flex: 1;
    height: 47px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #909090;
  }

  .search-icon {
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 16px;
      height: 16px;
      display: block;
    }
  }

  .search-input {
    flex: 1;
    height: 44px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-color, #ffffff);
    font-size: 16px;

    &::placeholder {
      font-family: PingFang SC, PingFang SC;
      font-weight: 500;
      font-size: 16px;
      color: #909090;
    }
  }

  .tab {
    height: 44px;
    border: none;
    background: transparent;
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 14px;
    color: var(--bg-opposite, #ffffff);
    position: relative;
    cursor: pointer;

    &.active::after {
      content: '';
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 0;
      height: 2px;
      background: var(--bg-opposite, #ffffff);
    }
  }
}

.list {
  padding: 0 10px 20px;
}

.row {
  display: grid;
  grid-template-columns: 16px 42px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color, #E0E0E0);

  .rank {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
    color: #909090;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.08);
  }

  .name {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
    color: var(--bg-opposite);
  }

  .value {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
    color: var(--bg-opposite);
  }
}

.me-card {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 18px;
  height: 64px;
  border-radius: 16px;
  border: 1px solid var(--me-glass-border);
  display: grid;
  grid-template-columns: 29px 32px 1fr auto;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  box-sizing: border-box;
  overflow: hidden;
  isolation: isolate;

  /* 玻璃底色（不会糊内容） */
  background: var(--me-glass-bg);
  backdrop-filter: blur(4px) saturate(100%);
  box-shadow:
    var(--me-glass-shadow),
    var(--me-glass-inset);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    /* 顶部轻微高光 + 细腻渐变，让磨砂更像 iOS */
    background:
      radial-gradient(120% 140% at 10% 0%, var(--me-glass-hi-0) 0%, var(--me-glass-hi-1) 35%, rgba(255, 255, 255, 0) 70%),
      linear-gradient(180deg, var(--me-glass-topline) 0%, rgba(255, 255, 255, 0) 45%, var(--me-glass-bottom) 100%);
    pointer-events: none;
    z-index: 0;
  }

  >* {
    position: relative;
    z-index: 1;
  }

  .rank {
    color: var(--text-dark-gray, #909090);
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 4px;
  }

  .name {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
    color: #FFFFFF;
    color: var(--bg-opposite, #ffffff);
  }

  .value {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
    color: var(--text-color-y, #BBFF2E);
  }
}
</style>
