<template>
  <div class="footer-nav">
    <div class="nav-container">
      <div v-for="item in navItems" :key="item.key" class="nav-item" :class="{ active: activeNav === item.key }"
        @click="handleNavClick(item)">
        <!-- 首页图标 -->
        <svg v-if="item.key === 'home'" class="nav-icon" viewBox="0 0 1072 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M535.893333 0.048762L1056.670476 470.552381l-65.340952 72.362667L926.47619 484.303238V1024H146.285714V479.47581l-64.999619 58.221714-65.048381-72.655238L535.893333 0z m-0.341333 131.169524L243.809524 392.240762 243.809524 926.47619h585.142857V396.190476l-293.400381-264.97219zM536.380952 390.095238a195.047619 195.047619 0 1 1 0 390.095238 195.047619 195.047619 0 0 1 0-390.095238z m0 97.52381a97.52381 97.52381 0 1 0 0 195.047619 97.52381 97.52381 0 0 0 0-195.047619z"
            fill="currentColor" />
        </svg>

        <!-- 搜索图标 -->
        <svg v-else-if="item.key === 'search'" class="nav-icon" viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>

        <!-- 突发图标 -->
        <svg v-else-if="item.key === 'breaking'" class="nav-icon" viewBox="0 0 1024 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M511.99952 0.00096a511.99952 511.99952 0 1 0 511.99952 511.99952A511.039521 511.039521 0 0 0 511.99952 0.00096z m0 945.279114A437.11959 437.11959 0 0 1 78.719926 512.00048 437.11959 437.11959 0 0 1 511.99952 78.720886 437.11959 437.11959 0 0 1 945.279114 512.00048 437.11959 437.11959 0 0 1 511.99952 945.280074z"
            fill="currentColor" />
          <path
            d="M740.479306 338.720642c-7.839993-23.679978-23.679978-39.359963-47.999955-31.99997L543.99949 346.560635a34.719967 34.719967 0 0 0-31.99997 47.999955 32.959969 32.959969 0 0 0 47.999955 23.679978l69.759935-19.999981-125.599883 176.799834-70.879933-47.999955c-15.999985-15.999985-39.359963-7.839993-55.199948 7.839993l-102.399904 133.919874c-15.999985 15.999985-7.839993 39.359963 7.839992 55.199948a28.959973 28.959973 0 0 0 23.679978 7.839993 40.959962 40.959962 0 0 0 31.99997-15.999985l78.719926-102.399904 78.719926 47.999955a47.999955 47.999955 0 0 0 55.199949-7.839993L687.999355 452.960535l13.599987 51.199952a52.319951 52.319951 0 0 0 39.359963 31.99997h7.839993c23.679978-7.839993 39.359963-23.679978 31.99997-47.999955z"
            fill="currentColor" />
        </svg>

        <!-- 更多图标 -->
        <svg v-else-if="item.key === 'more'" class="nav-icon" viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>

        <span class="nav-text">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 导航项配置
const navItems = computed(() => [
  { key: 'home', label: t('footerNav.home') || '首页', path: '/home' },
  { key: 'search', label: t('common.search') || '搜索', path: '/home' },
  { key: 'breaking', label: t('footerNav.breaking') || '突发', path: '/breaking' },
  { key: 'more', label: t('common.more') || '更多', path: '/personal-center' }
])

// 当前激活的导航项
const activeNav = ref('home')

// 路由到导航key的映射
const routeToNavKey = {
  '/home': 'home',
  '/breaking': 'breaking',
  '/searchPage': 'search',
  '/settings': 'more',
  '/personal-center': 'more',
  '/earnings': 'home',
  '/leaderboard': 'home',
  '/detail': 'home',
  '/accuracy': 'home'
}

// 根据当前路由自动设置激活的导航项
const updateActiveNavFromRoute = () => {
  const currentPath = route.path
  const navKey = routeToNavKey[currentPath] || 'home'
  activeNav.value = navKey
}

// 监听路由变化
watch(() => route.path, () => {
  updateActiveNavFromRoute()
})

// 组件挂载时设置激活状态
onMounted(() => {
  updateActiveNavFromRoute()
})

// 处理导航点击
const handleNavClick = (item) => {
  if (item.isSearch) {
    // 搜索功能：跳转到首页并滚动到搜索框（如果存在）
    router.push('/').then(() => {
      // 路由跳转后，根据实际路由更新激活状态
      updateActiveNavFromRoute()
    })
    // 可以在这里添加滚动到搜索框的逻辑
  } else if (item.path) {
    // 如果是"更多"页面，传递from=footer参数
    const path = item.key === 'more' ? `${item.path}?from=footer` : item.path
    router.push(path).then(() => {
      // 路由跳转后，根据实际路由更新激活状态
      updateActiveNavFromRoute()
    })
  }
}
</script>

<style scoped lang="scss">
.footer-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-page-h5, #ffffff);
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
  z-index: 1000;
  padding: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease, border-color 0.3s ease;

  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 56px;
    max-width: 100%;
    padding: 0;
    box-sizing: border-box;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    cursor: pointer;
    transition: all 0.2s;
    padding: 4px 6px;
    min-height: 56px;
    box-sizing: border-box;

    .nav-icon {
      width: 22px;
      height: 22px;
      color: #999999;
      transition: color 0.2s;
      margin-bottom: 3px;
      flex-shrink: 0;
    }

    .nav-text {
      font-size: 11px;
      color: #999999;
      transition: color 0.2s;
      font-weight: 400;
      line-height: 1.2;
    }

    &:active {
      opacity: 0.7;
    }

    &.active {
      .nav-icon {
        color: #000000;
      }

      .nav-text {
        color: #000000;
        font-weight: 600;
      }
    }
  }
}

.theme-dark {
  .footer-nav {
    .nav-item.active {
      .nav-icon {
        color: #FFFFFF;
      }

      .nav-text {
        color: #FFFFFF;
      }
    }
  }
}

// 仅在移动端显示，PC端隐藏
@media (min-width: 769px) {
  .footer-nav {
    display: none;
  }
}
</style>
