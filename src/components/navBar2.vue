<template>
  <div class="navbar2">
    <div class="navbar-container">
      <!-- 导航链接区域 -->
      <div class="nav-section" ref="navSectionRef">
        <template v-for="(item, index) in navItems" :key="item.key">
          <div class="nav-item" :class="{ active: activeNav === item.key }"
            :ref="el => { if (el) navItemRefs[item.key] = el }" :tabindex="activeNav === item.key ? 0 : -1"
            @click="handleNavClick(item.key)" @keydown.enter="handleNavClick(item.key)"
            @keydown.space.prevent="handleNavClick(item.key)">
            <!-- 趋势图标使用自定义 SVG -->
            <svg v-if="item.key === 'trends'" class="nav-icon trends-icon" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path
                d="M928 361.6v182.4c0 19.2 12.8 32 32 32s32-12.8 32-32v-224c0-35.2-28.8-64-64-64h-224c-19.2 0-32 12.8-32 32s12.8 32 32 32h176l-272 272-204.8-204.8c-6.4-6.4-16-9.6-22.4-9.6-9.6 0-16 3.2-22.4 9.6l-316.8 316.8c-12.8 12.8-12.8 32 0 44.8 12.8 12.8 32 12.8 44.8 0l294.4-294.4 204.8 204.8c6.4 6.4 16 9.6 22.4 9.6 9.6 0 16-3.2 22.4-9.6l297.6-297.6z"
                fill="currentColor"></path>
            </svg>
            <!-- 突发图标使用自定义 SVG -->
            <svg v-else-if="item.key === 'breaking'" class="nav-icon breaking-icon" viewBox="0 0 1024 1024"
              version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path
                d="M837.330851 679.796364l-48.221091-48.128a408.669091 408.669091 0 0 0-4.654545-582.050909l47.662545-48.872728a476.718545 476.718545 0 0 1 5.445818 679.098182h-0.232727zM168.705396 0l47.383273 49.012364a408.576 408.576 0 0 0-6.050909 581.911272l-48.407273 47.988364-5.911272-6.423273C-25.808058 483.002182-19.989876 182.365091 168.705396 0z m148.107637 141.172364l45.800727 50.362181a204.427636 204.427636 0 0 0-2.420364 300.45091l-46.592 49.710545a272.570182 272.570182 0 0 1 3.211637-400.523636z m368.128 401.826909l-46.359273-50.222546a204.334545 204.334545 0 0 0-3.444364-303.290182l44.823273-51.2a272.430545 272.430545 0 0 1 4.980364 404.666182zM499.922851 445.114182a102.4 102.4 0 1 1 0.139636-204.660364 102.4 102.4 0 0 1-0.186182 204.613818l0.046546 0.046546z m0-68.096a34.024727 34.024727 0 1 0-0.046546-0.046546l0.046546 0.046546z m16.896 238.592h-33.605818l-97.186909 340.107636h227.84l-97.047273-340.107636z m-84.992-68.328727h136.331636L704.11776 1024H295.634851l136.238545-476.718545z"
                fill="currentColor"></path>
            </svg>
            <!-- 新闻图标使用自定义 SVG -->
            <svg v-else-if="item.key === 'news'" class="nav-icon news-icon" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path
                d="M896 981.333333H96a53.393333 53.393333 0 0 1-53.333333-53.333333V96a53.393333 53.393333 0 0 1 53.333333-53.333333h704a53.393333 53.393333 0 0 1 53.333333 53.333333v117.333333h74.666667a53.393333 53.393333 0 0 1 53.333333 53.333334v629.333333a85.426667 85.426667 0 0 1-85.333333 85.333333z m-42.666667-725.333333v640a42.666667 42.666667 0 0 0 85.333334 0V266.666667a10.666667 10.666667 0 0 0-10.666667-10.666667zM96 85.333333a10.666667 10.666667 0 0 0-10.666667 10.666667v832a10.666667 10.666667 0 0 0 10.666667 10.666667h726.12a84.82 84.82 0 0 1-11.453333-42.666667V96a10.666667 10.666667 0 0 0-10.666667-10.666667z m565.333333 725.333334H234.666667a21.333333 21.333333 0 0 1 0-42.666667h426.666666a21.333333 21.333333 0 0 1 0 42.666667z m0-170.666667H234.666667a21.333333 21.333333 0 0 1 0-42.666667h426.666666a21.333333 21.333333 0 0 1 0 42.666667z m0-213.333333H533.333333a21.333333 21.333333 0 0 1 0-42.666667h128a21.333333 21.333333 0 0 1 0 42.666667z m0-170.666667H533.333333a21.333333 21.333333 0 0 1 0-42.666667h128a21.333333 21.333333 0 0 1 0 42.666667zM412.393333 468.133333A21.333333 21.333333 0 0 0 426.666667 448V234.666667a21.333333 21.333333 0 0 0-42.666667 0v152.52L251.333333 221.333333a21.333333 21.333333 0 0 0-38 13.333334v213.333333a21.333333 21.333333 0 0 0 42.666667 0V295.48L388.666667 461.333333a21.333333 21.333333 0 0 0 23.72 6.806667z"
                fill="currentColor"></path>
            </svg>
            <span class="nav-text">{{ $t(`navbar2.nav.${item.key}`) || item.label }}</span>
          </div>
          <!-- 添加竖杠分隔符 -->
          <div class="nav-divider" v-if="item.key === 'news'"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  activeNav: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['nav-click'])

// 导航项配置
const navItems = [
  { key: 'trends', label: '趋势', path: '/home' }, // 使用自定义 SVG
  { key: 'breaking', label: '热点', path: '/home' }, // 使用自定义 SVG  breaking
  { key: 'news', label: '最新', path: '/home' }, // 使用自定义 SVG
  { key: 'esports', label: '电子竞技', path: null },
  { key: 'sports', label: '体育', path: '/sports-events-h5' }, 
  { key: 'finance', label: '经济', path: null }, 
  { key: 'crypto', label: '加密货币', path: '/bitcoin-up-down' },
  { key: 'company', label: '公司', path: null },
  { key: 'popularCulture', label: '流行文化', path: null },
  { key: 'technology', label: '技术', path: null },
  { key: 'ai', label: '人工智能', path: null }
]

// 路由到导航key的映射（不含带 query 的电子竞技）
const routeToNavKey = {
  '/home': 'trends',
  '/breaking': 'breaking',
  '/news': 'news',
  '/sports-events-h5': 'sports',
  '/bitcoin-up-down': 'crypto',
}

// 当前激活的导航项
const activeNav = ref(props.activeNav || '')

// Refs
const navSectionRef = ref(null)
const navItemRefs = ref({})

// 聚焦到选中的按钮
const focusActiveNav = async () => {
  await nextTick()
  const activeKey = activeNav.value
  if (activeKey && navItemRefs.value[activeKey]) {
    const activeElement = navItemRefs.value[activeKey]
    // 滚动到可视区域
    activeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
    // 聚焦元素（用于键盘导航）
    if (activeElement.focus) {
      activeElement.focus({ preventScroll: true })
    }
  }
}

// 根据当前路由自动设置激活的导航项
const updateActiveNavFromRoute = () => {
  const currentPath = route.path

  // 在 /home 页面上，优先使用 query.nav（用于电子竞技等筛选按钮）
  if (currentPath === '/home' && route.query.nav) {
    activeNav.value = String(route.query.nav)
    return
  }

  const navKey = routeToNavKey[currentPath] || ''
  if (navKey) {
    activeNav.value = navKey
  }
}

// 监听路由变化
watch(() => route.path, () => {
  updateActiveNavFromRoute()
})

// 监听 query.nav 变化（用于电子竞技等筛选按钮）
watch(() => route.query.nav, () => {
  updateActiveNavFromRoute()
})

// 监听 activeNav 变化，自动聚焦
watch(activeNav, () => {
  focusActiveNav()
})

// 组件挂载时设置激活状态
onMounted(() => {
  updateActiveNavFromRoute()
  // 延迟聚焦，确保 DOM 已渲染
  setTimeout(() => {
    focusActiveNav()
  }, 100)
})

// 方法
const handleNavClick = (key) => {
  return
  activeNav.value = key
  emit('nav-click', key)

  const navItem = navItems.find(item => item.key === key)

  // 普通导航：直接跳转到对应 path
  if (navItem && navItem.path !== null) {
    router.push(navItem.path)
    // 聚焦到选中的按钮
    nextTick(() => {
      focusActiveNav()
    })
    return
  }

  // 筛选按钮：通过路由 query 控制页面状态（目前只按需处理电子竞技）
  if (key === 'esports') {
    router.push({
      path: '/home',
      query: { nav: 'esports' },
    })
    // 聚焦到选中的按钮
    nextTick(() => {
      focusActiveNav()
    })
  }
}
</script>

<style scoped lang="scss">
.navbar2 {
  width: 100%;
  background-color: var(--bg-card, #ffffff);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
  height: 48px;
  position: fixed;
  top: 80px; // header高度
  left: 0;
  right: 0;
  z-index: 999;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  .navbar-container {
    max-width: 1400px;
    padding: 0 32px;
    box-sizing: border-box;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 100%;
  }

  // 导航链接区域
  .nav-section {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: left;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.2s;
      white-space: nowrap;
      position: relative;
      outline: none;
    }

    /* 竖杠分隔符样式 */
    .nav-divider {
      width: 1px;
      height: 24px;
      background-color: var(--border-color, #e0e0e0);
      margin: 0 8px;
      align-self: center;
    }

    .nav-item {
      .nav-icon {
        font-size: 16px;
        color: var(--text-gray, #666666);
        transition: color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;

        // Element Plus 图标样式
        :deep(svg) {
          fill: currentColor;

          path {
            fill: currentColor;
            stroke: none;
          }
        }
      }

      // 自定义趋势图标样式
      .trends-icon {
        width: 16px;
        height: 16px;
        fill: currentColor;

        path {
          fill: currentColor;
        }
      }

      // 自定义突发图标样式
      .breaking-icon {
        width: 16px;
        height: 16px;
        fill: currentColor;

        path {
          fill: currentColor;
        }
      }

      // 自定义新闻图标样式
      .news-icon {
        width: 16px;
        height: 16px;
        fill: currentColor;

        path {
          fill: currentColor;
        }
      }

      .nav-text {
        color: var(--text-gray, #666666);
        font-size: 16px;
        transition: color 0.2s, font-size 0.2s, font-weight 0.2s;
      }

      &:hover {
        .nav-icon {
          color: var(--text-color, #1a1a1a);
        }

        .nav-text {
          color: var(--text-color, #1a1a1a);
        }
      }

      &.active {
        .nav-icon {
          color: var(--text-color, #000000);

          :deep(svg) {
            fill: var(--text-color, #000000);

            path {
              fill: var(--text-color, #000000);
            }
          }
        }

        .trends-icon,
        .breaking-icon,
        .news-icon {
          fill: var(--text-color, #000000);

          path {
            fill: var(--text-color, #000000);
          }
        }

        .nav-text {
          color: var(--text-color, #000000);
          font-weight: 600;
          font-size: 16px; // 原有14px基础上增加2px
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1280px) {
  .navbar2 {
    .navbar-container {
      padding: 0 20px;
    }

    .nav-section {
      gap: 20px;

      .nav-item {
        padding: 8px 10px;
        font-size: 13px;
      }
    }
  }
}

@media (max-width: 1024px) {
  .navbar2 {
    .navbar-container {
      padding: 0 16px;
    }

    .nav-section {
      gap: 14px;

      .nav-item {
        padding: 8px 8px;
        margin-right: 10px;
        font-size: 12px;

        .nav-icon {
          font-size: 14px;
        }
      }

      .nav-divider {
        margin: 0 6px;
        height: 20px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 10px;
      }
    }
  }
}

@media (max-width: 768px) {
  .navbar2 {
    padding: 0;
    height: 44px;
    position: static; // 移动端不固定
    top: auto;
    overflow: hidden; // 防止整体溢出

    .navbar-container {
      padding: 0;
      height: 100%;
      max-width: 100%;
      overflow: visible; // 允许内部滚动
      width: 100%;
    }

    .nav-section {
      overflow-x: auto; // 横向滚动
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch; // iOS 平滑滚动
      scrollbar-width: none; // Firefox 隐藏滚动条
      -ms-overflow-style: none; // IE/Edge 隐藏滚动条
      padding: 0 12px;
      white-space: nowrap; // 不折行
      width: 100%;
      height: 100%;
      display: block; // 不使用 flex

      &::-webkit-scrollbar {
        display: none; // Chrome/Safari 隐藏滚动条
      }

      .nav-item {
        display: inline-flex; // 使用 inline-flex 实现横向排列
        align-items: center;
        padding: 8px 12px;
        font-size: 14px;
        min-height: 32px; // 触摸友好的最小高度
        white-space: nowrap; // 不折行
        gap: 6px; // 图标和文字之间的间距
        vertical-align: middle;
        outline: none;


        .nav-icon {
          display: flex; // 移动端显示图标
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #999999; // 非激活状态使用浅灰色

          svg {
            fill: currentColor;
            width: 16px;
            height: 16px;

            path {
              fill: currentColor;
            }
          }

          // 自定义图标样式
          &.trends-icon,
          &.breaking-icon,
          &.news-icon {
            fill: currentColor;

            path {
              fill: currentColor;
            }
          }
        }

        .nav-text {
          color: #999999; // 非激活状态使用浅灰色
        }

        &.active {
          .nav-icon {
            color: var(--text-color, #000000);

            svg {
              fill: var(--text-color, #000000);

              path {
                fill: var(--text-color, #000000);
              }
            }

            &.trends-icon,
            &.breaking-icon,
            &.news-icon {
              fill: var(--text-color, #000000);

              path {
                fill: var(--text-color, #000000);
              }
            }
          }

          .nav-text {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-color, #000000);
          }
        }
      }
    }
  }
}

@media (max-width: 640px) {
  .navbar2 {
    height: 42px;
    position: static; // 移动端不固定
    top: auto;
    overflow: hidden;

    .navbar-container {
      padding: 0;
      max-width: 100%;
      overflow: visible;
      width: 100%;
    }

    .nav-section {
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 0 10px;
      white-space: nowrap;
      width: 100%;
      height: 100%;
      display: block; // 不使用 flex

      &::-webkit-scrollbar {
        display: none;
      }

      .nav-item {
        display: inline-flex;
        align-items: center;
        padding: 8px 12px;
        font-size: 13px;
        min-height: 30px;
        white-space: nowrap;
        gap: 6px;
        vertical-align: middle;
        outline: none;


        .nav-icon {
          display: flex;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #999999;

          svg {
            fill: currentColor;
            width: 16px;
            height: 16px;

            path {
              fill: currentColor;
            }
          }

          &.trends-icon,
          &.breaking-icon,
          &.news-icon {
            fill: currentColor;

            path {
              fill: currentColor;
            }
          }
        }

        .nav-text {
          color: #999999;
        }

        &.active {
          .nav-icon {
            color: var(--text-color, #000000);

            svg {
              fill: var(--text-color, #000000);

              path {
                fill: var(--text-color, #000000);
              }
            }

            &.trends-icon,
            &.breaking-icon,
            &.news-icon {
              fill: var(--text-color, #000000);

              path {
                fill: var(--text-color, #000000);
              }
            }
          }

          .nav-text {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-color, #000000);
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .navbar2 {
    height: 40px;
    position: static; // 移动端不固定
    top: auto;
    overflow: hidden;
    background-color: var(--bg-page-h5, #ffffff);

    .navbar-container {
      padding: 0;
      max-width: 100%;
      overflow: visible;
      width: 100%;
    }

    .nav-section {
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 0 8px;
      white-space: nowrap;
      width: 100%;
      height: 100%;
      display: block; // 不使用 flex

      &::-webkit-scrollbar {
        display: none;
      }

      .nav-item {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        font-size: 12px;
        min-height: 28px;
        white-space: nowrap;
        gap: 5px;
        vertical-align: middle;
        outline: none;


        .nav-icon {
          display: flex;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: #999999;

          svg {
            fill: currentColor;
            width: 14px;
            height: 14px;

            path {
              fill: currentColor;
            }
          }

          &.trends-icon,
          &.breaking-icon,
          &.news-icon {
            fill: currentColor;

            path {
              fill: currentColor;
            }
          }
        }

        .nav-text {
          color: #999999;
        }

        &.active {
          .nav-icon {
            color: var(--text-color, #000000);

            svg {
              fill: var(--text-color, #000000);

              path {
                fill: var(--text-color, #000000);
              }
            }

            &.trends-icon,
            &.breaking-icon,
            &.news-icon {
              fill: var(--text-color, #000000);

              path {
                fill: var(--text-color, #000000);
              }
            }
          }

          .nav-text {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-color, #000000);
          }
        }
      }
    }
  }
}
</style>
