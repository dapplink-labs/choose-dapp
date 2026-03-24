<template>
  <div class="navbar2">
    <div class="navbar-container">
      <div class="nav-section" ref="navSectionRef">
        <template v-for="item in navItems" :key="item.key">
          <div class="nav-item" :class="{ active: activeNav === item.key }"
            :ref="el => { if (el) navItemRefs[item.key] = el }" :tabindex="activeNav === item.key ? 0 : -1"
            @click="handleNavClick(item)">
            <!-- 趋势图标 -->
            <svg v-if="item.key === 'trends'" class="nav-icon trends-icon" viewBox="0 0 1024 1024" width="16"
              height="16">
              <path
                d="M928 361.6v182.4c0 19.2 12.8 32 32 32s32-12.8 32-32v-224c0-35.2-28.8-64-64-64h-224c-19.2 0-32 12.8-32 32s12.8 32 32 32h176l-272 272-204.8-204.8c-6.4-6.4-16-9.6-22.4-9.6-9.6 0-16 3.2-22.4 9.6l-316.8 316.8c-12.8 12.8-12.8 32 0 44.8 12.8 12.8 32 12.8 44.8 0l294.4-294.4 204.8 204.8c6.4 6.4 16 9.6 22.4 9.6 9.6 0 16-3.2 22.4-9.6l297.6-297.6z"
                fill="currentColor"></path>
            </svg>
            <!-- 突发图标 -->
            <svg v-else-if="item.key === 'breaking'" class="nav-icon breaking-icon" viewBox="0 0 1024 1024" width="16"
              height="16">
              <path
                d="M837.330851 679.796364l-48.221091-48.128a408.669091 408.669091 0 0 0-4.654545-582.050909l47.662545-48.872728a476.718545 476.718545 0 0 1 5.445818 679.098182h-0.232727zM168.705396 0l47.383273 49.012364a408.576 408.576 0 0 0-6.050909 581.911272l-48.407273 47.988364-5.911272-6.423273C-25.808058 483.002182-19.989876 182.365091 168.705396 0z m148.107637 141.172364l45.800727 50.362181a204.427636 204.427636 0 0 0-2.420364 300.45091l-46.592 49.710545a272.570182 272.570182 0 0 1 3.211637-400.523636z m368.128 401.826909l-46.359273-50.222546a204.334545 204.334545 0 0 0-3.444364-303.290182l44.823273-51.2a272.430545 272.430545 0 0 1 4.980364 404.666182zM499.922851 445.114182a102.4 102.4 0 1 1 0.139636-204.660364 102.4 102.4 0 0 1-0.186182 204.613818l0.046546 0.046546z m0-68.096a34.024727 34.024727 0 1 0-0.046546-0.046546l0.046546 0.046546z m16.896 238.592h-33.605818l-97.186909 340.107636h227.84l-97.047273-340.107636z m-84.992-68.328727h136.331636L704.11776 1024H295.634851l136.238545-476.718545z"
                fill="currentColor"></path>
            </svg>
            <!-- 新闻图标 -->
            <svg v-else-if="item.key === 'news'" class="nav-icon news-icon" viewBox="0 0 1024 1024" width="16"
              height="16">
              <path
                d="M896 981.333333H96a53.393333 53.393333 0 0 1-53.333333-53.333333V96a53.393333 53.393333 0 0 1 53.333333-53.333333h704a53.393333 53.393333 0 0 1 53.333333 53.333333v117.333333h74.666667a53.393333 53.393333 0 0 1 53.333333 53.333334v629.333333a85.426667 85.426667 0 0 1-85.333333 85.333333z m-42.666667-725.333333v640a42.666667 42.666667 0 0 0 85.333334 0V266.666667a10.666667 10.666667 0 0 0-10.666667-10.666667zM96 85.333333a10.666667 10.666667 0 0 0-10.666667 10.666667v832a10.666667 10.666667 0 0 0 10.666667 10.666667h726.12a84.82 84.82 0 0 1-11.453333-42.666667V96a10.666667 10.666667 0 0 0-10.666667-10.666667z m565.333333 725.333334H234.666667a21.333333 21.333333 0 0 1 0-42.666667h426.666666a21.333333 21.333333 0 0 1 0 42.666667z m0-170.666667H234.666667a21.333333 21.333333 0 0 1 0-42.666667h426.666666a21.333333 21.333333 0 0 1 0 42.666667z m0-213.333333H533.333333a21.333333 21.333333 0 0 1 0-42.666667h128a21.333333 21.333333 0 0 1 0 42.666667z m0-170.666667H533.333333a21.333333 21.333333 0 0 1 0-42.666667h128a21.333333 21.333333 0 0 1 0 42.666667zM412.393333 468.133333A21.333333 21.333333 0 0 0 426.666667 448V234.666667a21.333333 21.333333 0 0 0-42.666667 0v152.52L251.333333 221.333333a21.333333 21.333333 0 0 0-38 13.333334v213.333333a21.333333 21.333333 0 0 0 42.666667 0V295.48L388.666667 461.333333a21.333333 21.333333 0 0 0 23.72 6.806667z"
                fill="currentColor"></path>
            </svg>
            <span class="nav-text">{{ item.i18nKey ? t(item.i18nKey) : item.label }}</span>
          </div>
          <div class="nav-divider" v-if="item.key === 'news'"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getCategoryList } from '@/api/APIEvent'
// 获取当前语言环境
const language = (localStorage.getItem('app-locale') || navigator.language).split('-')[0];


const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 状态管理
const activeNav = ref('')
const navItemRefs = ref({})
const navSectionRef = ref(null)

// 基础导航配置
const navItems = ref([
  { key: 'trends', i18nKey: 'navbar2.nav.trends', label: '趋势', query: { nav: 'trends' } },
  { key: 'breaking', i18nKey: 'navbar2.nav.breaking', label: '热点', query: { nav: 'breaking' } },
  { key: 'news', i18nKey: 'navbar2.nav.news', label: '最新', query: { nav: 'news' } },
])

/**
 * 初始化及获取服务端分类
 */
async function getCategoryListData() {
  try {
    const response = await getCategoryList({ language_label: language });
    const categories = response?.data?.data?.categories || [];

    const dynamicItems = categories.map(c => {
      const code = c.code;
      const query = {
        category_guid: c.guid
      };

      if (code) {
        query.nav = code;
      }

      return {
        key: code || `category_guid=${c.guid}`,
        label: c.name || c.title,
        query
      };
    });

    // 过滤重复并插入
    const existingKeys = new Set(navItems.value.map(i => i.key));
    const toAdd = dynamicItems.filter(i => !existingKeys.has(i.key));
    if (toAdd.length) {
      navItems.value.splice(3, 0, ...toAdd);
    }

    // 分类加载后再次同步一次激活状态
    updateActiveNavFromRoute();
  } catch (err) {
    console.error('Fetch categories failed', err);
  }
}

/**
 * 核心逻辑：从路由同步激活状态
 */
const updateActiveNavFromRoute = () => {
  // 1. 优先根据 nav 参数（包含固定项和带 code 的分类）
  if (route.query.nav) {
    activeNav.value = String(route.query.nav);
    return;
  }

  // 2. 如果只有 category_guid，尝试匹配对应的分类项
  if (route.query.category_guid) {
    const matchedItem = navItems.value.find(
      i => i?.query?.category_guid === route.query.category_guid
    );
    if (matchedItem) {
      activeNav.value = matchedItem.key;
      return;
    }
  }

  // 3. 默认兜底：如果是 /home 且无参数，默认高亮趋势
  if (route.path === '/home') {
    activeNav.value = 'trends';
  }
}

/**
 * 点击处理
 */
const handleNavClick = (item) => {
  const query = item.query || {};

  // 体育赛事：跳转到赛事列表页
  if (query.nav === 'sports') {
    router.push({
      path: '/sports-events-h5',
      query
    });
    return;
  }

  // 其他分类统一通过 /home + query 驱动
  router.push({
    path: '/home',
    query
  });
}

/**
 * 滚动聚焦逻辑
 */
const focusActiveNav = async () => {
  await nextTick();
  const el = navItemRefs.value[activeNav.value];
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

// 监听路由 query 变化（这是最关键的一环）
watch(() => route.query, () => {
  updateActiveNavFromRoute();
}, { deep: true });

// 监听激活项变化触发滚动
watch(activeNav, () => {
  focusActiveNav();
});

onMounted(async () => {
  updateActiveNavFromRoute();
  await getCategoryListData();
  setTimeout(focusActiveNav, 150);
});
</script>


<style scoped lang="scss">
.navbar2 {
  width: 100%;
  background-color: var(--bg-card, #ffffff);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
  height: 48px;
  // position: fixed;
  // top: 80px; // header高度
  // left: 0;
  // right: 0;
  // z-index: 999;
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
