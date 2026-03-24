<template>
  <div class="navbar2">
    <div class="navbar-container">
      <div class="nav-section" ref="navSectionRef">
        <template v-for="(item, index) in navItems" :key="item.key">
          <!-- 导航项 -->
          <div 
            class="nav-item" 
            :class="{ 
              active: activeNav === item.key, 
              'new-user-events-item': isNewUserEvents(item) 
            }"
            :ref="el => { if (el) navItemRefs[item.key] = el }" 
            :tabindex="activeNav === item.key ? 0 : -1"
            @click="handleNavClick(item)"
          >
            <!-- 趋势图标 -->
            <svg v-if="item.key === 'trends'" class="nav-icon" viewBox="0 0 1024 1024">
              <path d="M928 361.6v182.4c0 19.2 12.8 32 32 32s32-12.8 32-32v-224c0-35.2-28.8-64-64-64h-224c-19.2 0-32 12.8-32 32s12.8 32 32 32h176l-272 272-204.8-204.8c-6.4-6.4-16-9.6-22.4-9.6-9.6 0-16 3.2-22.4 9.6l-316.8 316.8c-12.8 12.8-12.8 32 0 44.8 12.8 12.8 32 12.8 44.8 0l294.4-294.4 204.8 204.8c6.4 6.4 16 9.6 22.4 9.6 9.6 0 16-3.2 22.4-9.6l297.6-297.6z" fill="currentColor"></path>
            </svg>
            <!-- 突发图标 -->
            <svg v-else-if="item.key === 'breaking'" class="nav-icon" viewBox="0 0 1024 1024">
              <path d="M837.330851 679.796364l-48.221091-48.128a408.669091 408.669091 0 0 0-4.654545-582.050909l47.662545-48.872728a476.718545 476.718545 0 0 1 5.445818 679.098182h-0.232727zM168.705396 0l47.383273 49.012364a408.576 408.576 0 0 0-6.050909 581.911272l-48.407273 47.988364-5.911272-6.423273C-25.808058 483.002182-19.989876 182.365091 168.705396 0z m148.107637 141.172364l45.800727 50.362181a204.427636 204.427636 0 0 0-2.420364 300.45091l-46.592 49.710545a272.570182 272.570182 0 0 1 3.211637-400.523636z m368.128 401.826909l-46.359273-50.222546a204.334545 204.334545 0 0 0-3.444364-303.290182l44.823273-51.2a272.430545 272.430545 0 0 1 4.980364 404.666182zM499.922851 445.114182a102.4 102.4 0 1 1 0.139636-204.660364 102.4 102.4 0 0 1-0.186182 204.613818l0.046546 0.046546z m0-68.096a34.024727 34.024727 0 1 0-0.046546-0.046546l0.046546 0.046546z m16.896 238.592h-33.605818l-97.186909 340.107636h227.84l-97.047273-340.107636z m-84.992-68.328727h136.331636L704.11776 1024H295.634851l136.238545-476.718545z" fill="currentColor"></path>
            </svg>
            <!-- 新闻图标 -->
            <svg v-else-if="item.key === 'news'" class="nav-icon" viewBox="0 0 1024 1024">
              <path d="M896 981.333333H96a53.393333 53.393333 0 0 1-53.333333-53.333333V96a53.393333 53.393333 0 0 1 53.333333-53.333333h704a53.393333 53.393333 0 0 1 53.333333 53.333333v117.333333h74.666667a53.393333 53.393333 0 0 1 53.333333 53.333334v629.333333a85.426667 85.426667 0 0 1-85.333333 85.333333z m-42.666667-725.333333v640a42.666667 42.666667 0 0 0 85.333334 0V266.666667a10.666667 10.666667 0 0 0-10.666667-10.666667zM96 85.333333a10.666667 10.666667 0 0 0-10.666667 10.666667v832a10.666667 10.666667 0 0 0 10.666667 10.666667h726.12a84.82 84.82 0 0 1-11.453333-42.666667V96a10.666667 10.666667 0 0 0-10.666667-10.666667z m565.333333 725.333334H234.666667a21.333333 21.333333 0 0 1 0-42.666667h426.666666a21.333333 21.333333 0 0 1 0 42.666667z m0-170.666667H234.666667a21.333333 21.333333 0 0 1 0-42.666667h426.666666a21.333333 21.333333 0 0 1 0 42.666667z m0-213.333333H533.333333a21.333333 21.333333 0 0 1 0-42.666667h128a21.333333 21.333333 0 0 1 0 42.666667z m0-170.666667H533.333333a21.333333 21.333333 0 0 1 0-42.666667h128a21.333333 21.333333 0 0 1 0 42.666667zM412.393333 468.133333A21.333333 21.333333 0 0 0 426.666667 448V234.666667a21.333333 21.333333 0 0 0-42.666667 0v152.52L251.333333 221.333333a21.333333 21.333333 0 0 0-38 13.333334v213.333333a21.333333 21.333333 0 0 0 42.666667 0V295.48L388.666667 461.333333a21.333333 21.333333 0 0 0 23.72 6.806667z" fill="currentColor"></path>
            </svg>
            
            <!-- 文字内容 -->
            <span class="nav-text">{{ item.i18nKey ? t(item.i18nKey) : item.label }}</span>
          </div>

          <!-- 分隔线：在“最新”后显示 -->
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

const language = (localStorage.getItem('app-locale') || navigator.language).split('-')[0];
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const activeNav = ref('')
const navItemRefs = ref({})
const navSectionRef = ref(null)

const navItems = ref([
  { key: 'trends', i18nKey: 'navbar2.nav.trends', label: '趋势', query: { nav: 'trends' } },
  { key: 'breaking', i18nKey: 'navbar2.nav.breaking', label: '热点', query: { nav: 'breaking' } },
  { key: 'news', i18nKey: 'navbar2.nav.news', label: '最新', query: { nav: 'news' } },
])

async function getCategoryListData() {
  try {
    const response = await getCategoryList({ language_label: language });
    const categories = response?.data?.data?.categories || [];
    const dynamicItems = categories.map(c => ({
      key: c.code || `category_guid=${c.guid}`,
      code: c.code ? String(c.code).toUpperCase() : '',
      label: c.name || c.title,
      query: c.code ? { nav: c.code } : { category_guid: c.guid }
    }));

    const existingKeys = new Set(navItems.value.map(i => i.key));
    const toAdd = dynamicItems.filter(i => !existingKeys.has(i.key));
    if (toAdd.length) navItems.value.splice(3, 0, ...toAdd);
    updateActiveNavFromRoute();
  } catch (err) {
    console.error('Fetch categories failed', err);
  }
}

const updateActiveNavFromRoute = () => {
  if (route.query.nav) {
    activeNav.value = String(route.query.nav);
    return;
  }
  if (route.query.category_guid) {
    const matched = navItems.value.find(i => i?.query?.category_guid === route.query.category_guid);
    if (matched) { activeNav.value = matched.key; return; }
  }
  if (route.path === '/home') activeNav.value = 'trends';
}

const handleNavClick = (item) => {
  const query = item.query || {};
  if (query.nav === 'SPORTS') {
    router.push({ path: '/sports-events-h5', query });
  } else {
    router.push({ path: '/home', query });
  }
}

const isNewUserEvents = (item) => String(item?.code || item?.key || '').toUpperCase() === 'NEW_USER_EVENTS';

const focusActiveNav = async () => {
  await nextTick();
  const el = navItemRefs.value[activeNav.value];
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

watch(() => route.query, updateActiveNavFromRoute, { deep: true });
watch(activeNav, focusActiveNav);

onMounted(async () => {
  updateActiveNavFromRoute();
  await getCategoryListData();
  setTimeout(focusActiveNav, 150);
});
</script>

<style scoped lang="scss">
.navbar2 {
  width: 100%;
  background-color: #000; // 背景调深，更显发光效果
  height: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;

  .navbar-container {
    max-width: 1400px;
    padding: 0 32px;
    margin: 0 auto;
    width: 100%;
    overflow: hidden;
  }

  .nav-section {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;

      .nav-icon {
        width: 16px;
        height: 16px;
        color: #888;
      }

      .nav-text {
        color: #888;
        font-size: 16px;
        font-weight: 400;
        transition: all 0.2s;
      }

      &:hover .nav-text, &.active .nav-text {
        color: #fff;
      }

      &.active .nav-icon {
        color: #fff;
      }

      // --- 核心优化：新用户包赔样式 ---
      &.new-user-events-item {
        .nav-text {
          /* 颜色：电光绿到荧光黄（从左到右） */
          background: linear-gradient(90deg, #52FF00 0%, #E2FF00 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          
          /* 形状：极粗+强倾斜 */
          font-weight: 900 !important;
          transform: skewX(-15deg);
          display: inline-block;
          letter-spacing: -0.5px;
          padding: 0 4px;
          
          /* 光效：使用多重 drop-shadow 实现霓虹感 */
          filter: 
            drop-shadow(0 0 1px rgba(226, 255, 0, 0.3)) 
            drop-shadow(0 0 6px rgba(82, 255, 0, 0.6));
        }
      }
    }

    /* 分隔线样式 */
    .nav-divider {
      width: 1px;
      height: 14px;
      background-color: #333;
      margin: 0 10px;
      flex-shrink: 0;
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .navbar2 {
    height: 44px;
    background-color: #000;
    
    .navbar-container { padding: 0; }
    
    .nav-section {
      padding: 0 12px;
      
      .nav-item {
        padding: 6px 10px;
        
        .nav-text { font-size: 14px; }
        
        &.new-user-events-item .nav-text {
          font-size: 15px;
          transform: skewX(-12deg); // 移动端稍微减小倾斜度
          filter: drop-shadow(0 0 5px rgba(82, 255, 0, 0.6));
        }
      }
      
      .nav-divider { margin: 0 8px; }
    }
  }
}
</style>