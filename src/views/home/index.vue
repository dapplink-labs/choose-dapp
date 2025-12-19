<template>
  <div class="home-page ">


    <!-- Banner轮播图板块 -->
    <div class="banner-section">
      <div class="banner-container">
        <div class="banner-item">
          <img src="/src/assets/images/banner.png" class="banner-image" />
        </div>
      </div>
    </div>

    <NavBar2 />
    <div class="main-content">
      <!-- 功能暂不开放覆盖层 -->
      <div class="coming-soon-overlay">
        <div class="coming-soon-content">
          <img src="@/assets/icon/11.png" alt="暂不开放" class="coming-soon-icon" />
          <p class="coming-soon-text">预测功能即将上线</p>
        </div>
      </div>
      <div class="content-wrapper">


        <div class="filter-section">
          <div class="filter-container">
            <div class="search-box">
              <el-icon class="search-icon">
                <Search />
              </el-icon>
              <input type="text" placeholder="搜索" class="search-input" v-model="searchQuery" @input="handleSearch" />
            </div>

            <div class="action-buttons">
              <button class="action-btn" @click="handleFilter">
                <svg t="1765525668660" class="icon" viewBox="0 0 1228 1024" version="1.1"
                  xmlns="http://www.w3.org/2000/svg" p-id="16362" width="20" height="20">
                  <path
                    d="M819.038649 0a204.759662 204.759662 0 0 1 198.309733 153.569747h185.614634a25.594958 25.594958 0 0 1 25.594958 25.594958v51.189915a25.594958 25.594958 0 0 1-25.594958 25.594958l-185.614634 0.10238a204.759662 204.759662 0 0 1-396.619466 0L25.594958 255.949578A25.594958 25.594958 0 0 1 0 230.35462v-51.189915a25.594958 25.594958 0 0 1 25.594958-25.594958h595.133958A204.759662 204.759662 0 0 1 819.038649 0z m0 102.379831a102.379831 102.379831 0 1 0 0 204.759663 102.379831 102.379831 0 0 0 0-204.759663zM409.519325 614.278987a204.759662 204.759662 0 0 1 198.309733 153.569747h595.133958a25.594958 25.594958 0 0 1 25.594958 25.594958v51.189915a25.594958 25.594958 0 0 1-25.594958 25.594958l-595.133958 0.10238a204.759662 204.759662 0 0 1-396.619466 0L25.594958 870.228565A25.594958 25.594958 0 0 1 0 844.633607v-51.189915a25.594958 25.594958 0 0 1 25.594958-25.594958h185.614634A204.759662 204.759662 0 0 1 409.519325 614.278987z m0 102.379831a102.379831 102.379831 0 1 0 0 204.759663 102.379831 102.379831 0 0 0 0-204.759663z"
                    p-id="16363" fill="currentColor"></path>
                </svg>
              </button>
              <button class="action-btn" @click="handleViewToggle">
                <svg t="1765591111184" class="icon" viewBox="0 0 1024 1024" version="1.1"
                  xmlns="http://www.w3.org/2000/svg" p-id="5484" width="32" height="32">
                  <path
                    d="M389.461333 85.333333l253.354667 0.021334c5.397333 0.042667 10.602667 0.128 15.616 0.256l14.506667 0.490666 13.482666 0.789334c43.306667 3.072 71.104 10.965333 99.733334 26.282666a197.738667 197.738667 0 0 1 82.005333 82.005334c15.317333 28.629333 23.210667 56.426667 26.282667 99.733333l0.789333 13.482667 0.490667 14.506666 0.149333 7.658667 0.128 16.213333v501.525334a85.333333 85.333333 0 0 1-123.498667 76.330666L518.186667 797.44l-3.2-1.557333-2.965334-1.322667-2.986666 1.322667-257.514667 128.725333A85.333333 85.333333 0 0 1 128 848.298667l0.021333-509.781334c0.042667-5.397333 0.128-10.602667 0.256-15.616l0.490667-14.506666 0.789333-13.482667c3.072-43.306667 10.965333-71.104 26.282667-99.733333a197.738667 197.738667 0 0 1 82.005333-82.005334c28.629333-15.317333 56.426667-23.210667 99.733334-26.282666l13.482666-0.789334 14.506667-0.490666 7.658667-0.149334 16.213333-0.128z m252.16 85.354667H382.378667l-13.184 0.170667-6.122667 0.149333-11.413333 0.426667-10.325334 0.64c-4.906667 0.384-9.493333 0.832-13.76 1.365333l-8.149333 1.173333c-11.712 1.92-21.12 4.650667-29.866667 8.32l-5.76 2.602667c-1.92 0.917333-3.797333 1.877333-5.674666 2.88a112.426667 112.426667 0 0 0-47.018667 47.018667 145.664 145.664 0 0 0-2.88 5.674666l-2.602667 5.76c-3.669333 8.746667-6.4 18.154667-8.32 29.866667l-1.173333 8.149333c-0.533333 4.266667-0.981333 8.832-1.344 13.76l-0.64 10.325334a514.133333 514.133333 0 0 0-0.256 5.546666l-0.341333 11.989334-0.170667 13.184L213.333333 848.277333l256.469334-128.170666c10.965333-5.312 18.112-7.850667 26.88-9.536a80.213333 80.213333 0 0 1 30.634666 0c9.856 1.898667 17.664 4.885333 31.189334 11.648L810.666667 848.298667l-0.021334-508.586667-0.170666-13.226667a709.973333 709.973333 0 0 0-0.149334-6.101333l-0.426666-11.413333-0.64-10.325334c-0.384-4.906667-0.832-9.493333-1.365334-13.76l-1.173333-8.149333a129.984 129.984 0 0 0-8.32-29.866667l-2.602667-5.76a145.664 145.664 0 0 0-2.88-5.674666 112.426667 112.426667 0 0 0-47.018666-47.018667 145.664 145.664 0 0 0-5.674667-2.88l-5.76-2.602667c-8.746667-3.669333-18.154667-6.4-29.866667-8.32l-8.149333-1.173333c-4.266667-0.533333-8.832-0.981333-13.76-1.344l-10.325333-0.64a514.133333 514.133333 0 0 0-5.546667-0.256l-11.989333-0.341333L641.642667 170.666667zM576 298.666667a42.666667 42.666667 0 0 1 3.2 85.226666L576 384h-128a42.666667 42.666667 0 0 1-3.2-85.226667L448 298.666667h128z"
                    fill="currentColor" p-id="5485"></path>
                </svg>
              </button>
            </div>

            <div class="nav-divider">|</div>

            <div class="filter-tags">
              <button v-for="tag in filterTags" :key="tag.value" class="filter-tag"
                :class="{ active: activeTag === tag.value }" @click="handleTagClick(tag.value)">
                {{ tag.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="main-list-section">
          <div class="left-vertical-list">
            <div class="list-item large-item" v-for="(item, index) in leftList" :key="'left-' + index">
              <div class="item-header">
                <img :src="item.avatar" alt="用户头像" class="user-avatar">
                <div class="item-meta">
                  <div class="item-title" @click="navigateToEarnings()">{{ item.title }}</div>
                </div>
                <div class="percentage-semicircle">
                  <svg class="semicircle-chart" viewBox="0 0 100 60">
                    <!-- 背景半圆 -->
                    <path class="semicircle-background" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke-width="8" />
                    <!-- 进度半圆 -->
                    <path class="semicircle-progress" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#FF4D4F"
                      stroke-width="8" stroke-linecap="round" :stroke-dasharray="125.6"
                      :stroke-dashoffset="(125.6 * (100 - parseInt(item.percentage))) / 100" />
                    <!-- 百分比文本 -->
                    <text class="semicircle-percentage" x="52" y="50" text-anchor="middle" dy="0">{{ item.percentage
                    }}</text>
                  </svg>
                  <div class="percentage-label">机会</div>
                </div>
              </div>
              <div class="item-actions">
                <button class="action-btn yes-btn" @click="navigateToDetail(item, 'yes')">Yes</button>
                <button class="action-btn no-btn" @click="navigateToDetail(item, 'no')">No</button>
              </div>
              <div class="item-amount">
                <span>{{ item.amount }}</span>
                <svg t="1765591111184" class="icon-sc" :class="{ active: item.isFavorite }" viewBox="0 0 1024 1024"
                  version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5484" width="14" height="14"
                  @click.stop="toggleFavorite(item)">
                  <path
                    d="M389.461333 85.333333l253.354667 0.021334c5.397333 0.042667 10.602667 0.128 15.616 0.256l14.506667 0.490666 13.482666 0.789334c43.306667 3.072 71.104 10.965333 99.733334 26.282666a197.738667 197.738667 0 0 1 82.005333 82.005334c15.317333 28.629333 23.210667 56.426667 26.282667 99.733333l0.789333 13.482667 0.490667 14.506666 0.149333 7.658667 0.128 16.213333v501.525334a85.333333 85.333333 0 0 1-123.498667 76.330666L518.186667 797.44l-3.2-1.557333-2.965334-1.322667-2.986666 1.322667-257.514667 128.725333A85.333333 85.333333 0 0 1 128 848.298667l0.021333-509.781334c0.042667-5.397333 0.128-10.602667 0.256-15.616l0.490667-14.506666 0.789333-13.482667c3.072-43.306667 10.965333-71.104 26.282667-99.733333a197.738667 197.738667 0 0 1 82.005333-82.005334c28.629333-15.317333 56.426667-23.210667 99.733334-26.282666l13.482666-0.789334 14.506667-0.490666 7.658667-0.149334 16.213333-0.128z m252.16 85.354667H382.378667l-13.184 0.170667-6.122667 0.149333-11.413333 0.426667-10.325334 0.64c-4.906667 0.384-9.493333 0.832-13.76 1.365333l-8.149333 1.173333c-11.712 1.92-21.12 4.650667-29.866667 8.32l-5.76 2.602667c-1.92 0.917333-3.797333 1.877333-5.674666 2.88a112.426667 112.426667 0 0 0-47.018667 47.018667 145.664 145.664 0 0 0-2.88 5.674666l-2.602667 5.76c-3.669333 8.746667-6.4 18.154667-8.32 29.866667l-1.173333 8.149333c-0.533333 4.266667-0.981333 8.832-1.344 13.76l-0.64 10.325334a514.133333 514.133333 0 0 0-0.256 5.546666l-0.341333 11.989334-0.170667 13.184L213.333333 848.277333l256.469334-128.170666c10.965333-5.312 18.112-7.850667 26.88-9.536a80.213333 80.213333 0 0 1 30.634666 0c9.856 1.898667 17.664 4.885333 31.189334 11.648L810.666667 848.298667l-0.021334-508.586667-0.170666-13.226667a709.973333 709.973333 0 0 0-0.149334-6.101333l-0.426666-11.413333-0.64-10.325334c-0.384-4.906667-0.832-9.493333-1.365334-13.76l-1.173333-8.149333a129.984 129.984 0 0 0-8.32-29.866667l-2.602667-5.76a145.664 145.664 0 0 0-2.88-5.674666 112.426667 112.426667 0 0 0-47.018666-47.018667 145.664 145.664 0 0 0-5.674667-2.88l-5.76-2.602667c-8.746667-3.669333-18.154667-6.4-29.866667-8.32l-8.149333-1.173333c-4.266667-0.533333-8.832-0.981333-13.76-1.344l-10.325333-0.64a514.133333 514.133333 0 0 0-5.546667-0.256l-11.989333-0.341333L641.642667 170.666667zM576 298.666667a42.666667 42.666667 0 0 1 3.2 85.226666L576 384h-128a42.666667 42.666667 0 0 1-3.2-85.226667L448 298.666667h128z"
                    :fill="item.isFavorite ? '#CA4064' : '#909090'" p-id="5485"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="right-horizontal-list">
            <div class="horizontal-row" v-for="(row, rowIndex) in rightList" :key="'row-' + rowIndex">
              <div class="list-item small-item" v-for="(item, itemIndex) in row"
                :key="'right-' + rowIndex + '-' + itemIndex">
                <div class="item-header">
                  <img :src="item.avatar" alt="用户头像" class="user-avatar">
                  <div class="item-meta">
                    <div class="item-title">{{ item.title }}</div>
                  </div>
                </div>
                <div class="item-options">
                  <div class="option-item">
                    <div class="option-text"><span>{{ item.options[0].text }}</span> <span>{{ item.percentage }}</span>
                    </div>
                    <div class="option-buttons">
                      <button class="option-btn yes-btn" @click="navigateToDetail(item, 'yes')">Yes</button>
                      <button class="option-btn no-btn" @click="navigateToDetail(item, 'no')">No</button>
                    </div>
                  </div>
                  <div class="option-item">
                    <div class="option-text"><span>{{ item.options[1].text }}</span> <span>{{ item.percentage }}</span>
                    </div>
                    <div class="option-buttons">
                      <button class="option-btn yes-btn" @click="navigateToDetail(item, 'yes')">Yes</button>
                      <button class="option-btn no-btn" @click="navigateToDetail(item, 'no')">No</button>
                    </div>
                  </div>
                </div>
                <div class="item-amount">
                  <span>{{ item.amount }}</span>
                  <span>
                    <svg t="1765591111184" class="icon-sc" :class="{ active: item.isFavorite }" viewBox="0 0 1024 1024"
                      version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5484" width="14" height="14"
                      @click.stop="toggleFavorite(item)">
                      <path
                        d="M389.461333 85.333333l253.354667 0.021334c5.397333 0.042667 10.602667 0.128 15.616 0.256l14.506667 0.490666 13.482666 0.789334c43.306667 3.072 71.104 10.965333 99.733334 26.282666a197.738667 197.738667 0 0 1 82.005333 82.005334c15.317333 28.629333 23.210667 56.426667 26.282667 99.733333l0.789333 13.482667 0.490667 14.506666 0.149333 7.658667 0.128 16.213333v501.525334a85.333333 85.333333 0 0 1-123.498667 76.330666L518.186667 797.44l-3.2-1.557333-2.965334-1.322667-2.986666 1.322667-257.514667 128.725333A85.333333 85.333333 0 0 1 128 848.298667l0.021333-509.781334c0.042667-5.397333 0.128-10.602667 0.256-15.616l0.490667-14.506666 0.789333-13.482667c3.072-43.306667 10.965333-71.104 26.282667-99.733333a197.738667 197.738667 0 0 1 82.005333-82.005334c28.629333-15.317333 56.426667-23.210667 99.733334-26.282666l13.482666-0.789334 14.506667-0.490666 7.658667-0.149334 16.213333-0.128z m252.16 85.354667H382.378667l-13.184 0.170667-6.122667 0.149333-11.413333 0.426667-10.325334 0.64c-4.906667 0.384-9.493333 0.832-13.76 1.365333l-8.149333 1.173333c-11.712 1.92-21.12 4.650667-29.866667 8.32l-5.76 2.602667c-1.92 0.917333-3.797333 1.877333-5.674666 2.88a112.426667 112.426667 0 0 0-47.018667 47.018667 145.664 145.664 0 0 0-2.88 5.674666l-2.602667 5.76c-3.669333 8.746667-6.4 18.154667-8.32 29.866667l-1.173333 8.149333c-0.533333 4.266667-0.981333 8.832-1.344 13.76l-0.64 10.325334a514.133333 514.133333 0 0 0-0.256 5.546666l-0.341333 11.989334-0.170667 13.184L213.333333 848.277333l256.469334-128.170666c10.965333-5.312 18.112-7.850667 26.88-9.536a80.213333 80.213333 0 0 1 30.634666 0c9.856 1.898667 17.664 4.885333 31.189334 11.648L810.666667 848.298667l-0.021334-508.586667-0.170666-13.226667a709.973333 709.973333 0 0 0-0.149334-6.101333l-0.426666-11.413333-0.64-10.325334c-0.384-4.906667-0.832-9.493333-1.365334-13.76l-1.173333-8.149333a129.984 129.984 0 0 0-8.32-29.866667l-2.602667-5.76a145.664 145.664 0 0 0-2.88-5.674666 112.426667 112.426667 0 0 0-47.018666-47.018667 145.664 145.664 0 0 0-5.674667-2.88l-5.76-2.602667c-8.746667-3.669333-18.154667-6.4-29.866667-8.32l-8.149333-1.173333c-4.266667-0.533333-8.832-0.981333-13.76-1.344l-10.325333-0.64a514.133333 514.133333 0 0 0-5.546667-0.256l-11.989333-0.341333L641.642667 170.666667zM576 298.666667a42.666667 42.666667 0 0 1 3.2 85.226666L576 384h-128a42.666667 42.666667 0 0 1-3.2-85.226667L448 298.666667h128z"
                        :fill="item.isFavorite ? '#CA4064' : '#909090'" p-id="5485"></path>
                    </svg>
                  </span>
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
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar2 from '@/components/navBar2.vue'
import { Search } from '@element-plus/icons-vue'
import router from '@/router'

// 禁止页面滚动
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

// 搜索相关
const searchQuery = ref('')

// 筛选标签数据
const filterTags = [
  { value: 'all', label: '全部' },
  { value: 'premium', label: '王牌' },
  { value: 'ukraine', label: '乌克兰' },
  { value: 'afghanistan', label: '爱泼斯坦' },
  { value: 'trump', label: '特朗普' },
  { value: 'fed', label: '美联储' },
  { value: 'token', label: '代币销售' }
]

// 当前激活的标签
const activeTag = ref('all')

// 模拟数据：左边垂直列表
const leftList = ref([
  {
    avatar: 'https://picsum.photos/seed/user1/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '75%',
    amount: '1.51亿美元交易量',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false
  },
  {
    avatar: 'https://picsum.photos/seed/user2/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '25%',
    amount: '1.51亿美元交易量',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false
  },
  {
    avatar: 'https://picsum.photos/seed/user3/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '50%',
    amount: '1.51亿美元交易量',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false
  },
  {
    avatar: 'https://picsum.photos/seed/user4/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '90%',
    amount: '1.51亿美元交易量',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false
  },
  {
    avatar: 'https://picsum.photos/seed/user5/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '33%',
    amount: '1.51亿美元交易量',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false
  }
])

// 生成右边列表项的辅助函数
const createRightListItem = (seed, title = '美联储12月会做出决定吗？') => ({
  avatar: `https://picsum.photos/seed/user${seed}/40/40`,
  title,
  percentage: '14%',
  amount: '1.51亿美元交易量',
  isFavorite: false,
  options: [
    { text: '下调50个基点以上', percentage: '2%', yesCount: 123, noCount: 456 },
    { text: '增长超过25基点', percentage: '32%', yesCount: 789, noCount: 101 }
  ]
})

// 生成一行数据
const createRightListRow = (startSeed, count = 4) => {
  return Array.from({ length: count }, (_, i) => createRightListItem(startSeed + i))
}

// 模拟数据：右边横向列表
const rightList = ref([
  createRightListRow(6),
  createRightListRow(10),
  createRightListRow(14),
  createRightListRow(18),
  createRightListRow(22)
])

// 处理搜索
const handleSearch = () => {
  // 这里可以实现搜索逻辑
}

// 处理筛选
const handleFilter = () => {
  // 这里可以实现筛选面板逻辑
  router.push('/accuracy')
}

// 处理视图切换
const handleViewToggle = () => {
  router.push('/leaderboard')
}

// 跳转到收益页面
const navigateToEarnings = () => {
  router.push('/earnings')
}

// 跳转到详情页面
const navigateToDetail = (item, choice) => {
  router.push({
    path: '/detail',
    query: {
      choice,
      id: item.id || item.title
    }
  })
}

// 处理标签点击
const handleTagClick = (tagValue) => {
  activeTag.value = tagValue
  // 这里可以根据标签筛选内容
}

// 切换收藏状态
const toggleFavorite = (item) => {
  item.isFavorite = !item.isFavorite
}
</script>

<style scoped lang="scss">
// 公共样式变量（使用CSS变量以支持主题切换）
$yes-color: #25A750;
$no-color: #CA4064;
$yes-bg-light: rgba(37, 167, 80, 0.2);
$no-bg-light: rgba(202, 64, 100, 0.2);

// 公共按钮样式 mixin
@mixin yes-no-button($color, $bg-light) {
  background: $bg-light;
  color: $color;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  padding: 10px 16px;

  &.active {
    background: $color;
    color: #fff;
  }
}

.icon-sc {
  cursor: pointer;
}

.home-page {
  min-height: 100vh;
  background-color: var(--bg-page, #FCFCFC);
  color: var(--text-color, #1a1a1a);
  padding-top: 112px; // header(64px) + navbar2(48px)
  transition: background-color 0.3s ease, color 0.3s ease;

  // Banner图样式
  .banner-section {
    display: none; // PC端默认隐藏

    .banner-container {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .banner-item {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.02);
        }

        .banner-image {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }
      }
    }
  }

  .main-content {
    position: relative;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 32px 64px;
    box-sizing: border-box;

    .content-wrapper {
      width: 100%;
    }



    // 筛选模块样式
    .filter-section {
      margin-bottom: 24px;

      .filter-container {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 12px 0;
        border-radius: 8px;

        // 搜索框样式
        .search-box {
          display: flex;
          align-items: center;
          background: var(--bg-light, #F5F5F5);
          border-radius: 6px;
          padding: 8px 12px;
          box-sizing: border-box;
          min-width: 200px;

          .search-icon {
            color: var(--text-dark-gray, #999);
            margin-right: 8px;
            font-size: 16px;
          }

          .search-input {
            border: none;
            background: transparent;
            outline: none;
            font-size: 14px;
            color: var(--text-color, #333);
            width: 100%;

            &::placeholder {
              color: var(--text-dark-gray, #999);
            }
          }
        }

        // 功能按钮样式
        .action-buttons {
          display: flex;
          gap: 20px;

          .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            background: var(--bg-page, #FCFCFC);
            color: var(--text-color, #000000);

            .icon {
              width: 20px;
              height: 20px;
              fill: currentColor;
              font-weight: 600;

              path {
                fill: currentColor;
              }
            }

            &:hover {
              background: var(--bg-light, #F5F5F5);
            }
          }
        }

        // 分隔符样式
        .nav-divider {
          color: var(--border-color, #e0e0e0);
          font-size: 16px;
          margin: 0 8px;
          transition: color 0.3s ease;
        }

        // 筛选标签样式
        .filter-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;

          .filter-tag {
            padding: 6px 12px;
            border: none;
            border-radius: 3px;
            font-size: 14px;
            color: var(--text-gray, #666);
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
            background: rgba(0, 0, 0, 0);

            &.active {
              background: var(--text-color, #1a1a1a);
              border-color: var(--text-color, #1a1a1a);
              color: var(--bg-card, #ffffff);
            }
          }
        }
      }
    }

    // 主体列表模块样式
    .main-list-section {
      display: flex;
      gap: 10px;

      // 左边垂直列表样式
      .left-vertical-list {
        flex: 0 0 300px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      // 右边横向列表样式
      .right-horizontal-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      // 横向行样式
      .horizontal-row {
        display: flex;
        gap: 10px;
      }

      // 列表项基础样式
      .list-item {
        background: var(--bg-card, #ffffff);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.2s;
        box-sizing: border-box;

        &:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      }

      // 大列表项样式
      .large-item {
        width: 100%;
      }

      // 小列表项样式
      .small-item {
        flex: 1;
        min-width: 0;
      }

      // 列表项头部样式
      .item-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
      }

      // 用户头像样式
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      // 列表项元数据样式
      .item-meta {
        padding-left: 12px;
        flex: 1;
      }

      // 列表项标题样式
      .item-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-color, #333);
        margin-bottom: 4px;
        line-height: 1.4;
        overflow: hidden;
      }

      // 列表项百分比样式
      .item-percentage {
        font-size: 12px;
        color: var(--text-gray, #666);
      }

      // 百分比半圆线样式
      .percentage-semicircle {
        position: relative;
      }

      // 半圆线图表样式
      .semicircle-chart {
        width: 40px;
        height: 25px;
      }

      // 半圆线文本样式
      .percentage-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -20%);
      }

      // 百分比数值样式
      .percentage-value {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-color, #333);
      }

      // 百分比标签样式
      .percentage-label {
        font-size: 10px;
        color: var(--text-dark-gray, #999);
      }

      // 百分比半圆样式
      .percentage-semicircle {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      // 半圆图表样式
      .semicircle-chart {
        width: 60px;
        height: 30px;
      }

      // 半圆进度条样式
      .semicircle-progress {
        stroke-linecap: round;
      }

      // 半圆背景样式
      .semicircle-background {
        stroke: var(--border-color, #E5E5E5);
        transition: stroke 0.3s ease;
      }

      // 半圆百分比文本样式
      .semicircle-percentage {
        font-size: 30px;
        font-weight: 600;
        fill: var(--text-color, #333);
        transition: fill 0.3s ease;

        @media (max-width: 768px) {
          font-size: 24px;
          fill: #FF4D4F; // 移动端使用红色
        }

        @media (max-width: 480px) {
          font-size: 20px;
          fill: #FF4D4F; // 移动端使用红色
        }
      }

      // 列表项操作按钮样式
      .item-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 8px;
      }

      // 操作按钮基础样式
      .action-btn {
        flex: 1;
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      // Yes/No按钮样式
      .yes-btn {
        @include yes-no-button($yes-color, $yes-bg-light);
      }

      .no-btn {
        @include yes-no-button($no-color, $no-bg-light);
      }

      // 列表项金额样式
      .item-amount {
        font-size: 12px;
        color: var(--text-dark-gray, #999);
        display: flex;
        align-items: center;
        justify-content: space-between;

        .icon {
          width: 20px;
          height: 20px;
          color: var(--text-dark-gray, #999);
        }
      }

      // 选项列表样式
      .item-options {
        margin-bottom: 8px;
      }

      // 选项项样式
      .option-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      // 选项文本样式
      .option-text {
        font-size: 12px;
        color: var(--text-color, #000);
        flex: 1;
        margin-right: 7px;
        display: flex;
        justify-content: space-around;
      }

      // 选项百分比样式
      .option-percentage {
        font-size: 12px;
        color: var(--text-dark-gray, #999);
        margin-right: 12px;
      }

      // 选项按钮样式
      .option-buttons {
        display: flex;
        gap: 8px;
      }

      // 选项按钮基础样式
      .option-btn {
        padding: 4px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;

        &.yes-btn {
          @include yes-no-button($yes-color, $yes-bg-light);
          padding: 4px 12px;
          font-size: 12px;
        }

        &.no-btn {
          @include yes-no-button($no-color, $no-bg-light);
          padding: 4px 12px;
          font-size: 12px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1280px) {
  .home-page {
    .main-content {
      padding: 28px 24px 56px;
      max-width: 100%;


      .filter-section {
        .filter-container {
          flex-wrap: wrap;
          gap: 16px;

          .search-box {
            order: 1;
            flex: 1;
            min-width: 200px;
          }

          .action-buttons {
            order: 2;
            gap: 12px;
          }

          .nav-divider {
            order: 3;
            display: none;
          }

          .filter-tags {
            display: none; // 移动端隐藏
          }
        }
      }

      .main-list-section {
        flex-direction: column;
        gap: 16px;

        .left-vertical-list {
          flex: none;
          width: 100%;
        }

        .right-horizontal-list {
          flex: none;
          width: 100%;

          .horizontal-row {
            flex-wrap: wrap;
            gap: 12px;

            .list-item {
              flex: 0 0 calc(50% - 6px);
              min-width: 280px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .home-page {
    .main-content {
      padding: 24px 20px 48px;

      .filter-section {
        margin-bottom: 20px;

        .filter-container {
          gap: 12px;

          .search-box {
            min-width: 180px;
            padding: 8px 10px;
          }

          .action-buttons {
            gap: 10px;

            .action-btn {
              .icon {
                width: 18px;
                height: 18px;
              }
            }
          }

          .filter-tags {
            display: none; // 移动端隐藏
          }
        }
      }

      .main-list-section {
        gap: 14px;

        .left-vertical-list {
          gap: 14px;

          .list-item {
            padding: 16px;

            .item-header {
              .percentage-semicircle {
                .semicircle-chart {
                  width: 55px;
                  height: 28px;
                }
              }
            }
          }
        }

        .right-horizontal-list {
          .horizontal-row {
            gap: 12px;

            .list-item {
              flex: 0 0 calc(50% - 6px);
              min-width: 240px;
              padding: 16px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .home-page {
    padding-top: 108px;
    background-color: var(--bg-page-h5, #FFFFFF);

    .banner-section {
      display: block; // 移动端显示
      margin: 10px 0;
      padding: 0 10px;
      box-sizing: border-box;

      .banner-container {
        .banner-item {
          border-radius: 8px;

          .banner-image {
            max-height: 200px;
          }
        }
      }
    }

    .main-content {
      padding: 16px 16px 40px;


      .filter-section {
        margin-bottom: 16px;

        .filter-container {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0;

          .search-box {
            flex: 1;
            display: flex;
            align-items: center;
            background: var(--bg-light, #F5F5F5);
            border-radius: 8px;
            padding: 10px 12px;
            min-width: 0; // 允许收缩

            .search-icon {
              color: var(--text-dark-gray, #999);
              margin-right: 8px;
              font-size: 16px;
              flex-shrink: 0;
            }

            .search-input {
              border: none;
              background: transparent;
              outline: none;
              font-size: 14px;
              color: var(--text-color, #333);
              width: 100%;
              flex: 1;

              &::placeholder {
                color: var(--text-dark-gray, #999);
              }
            }
          }

          .action-buttons {
            display: flex;
            gap: 8px;
            flex-shrink: 0;

            .action-btn {
              width: 44px;
              height: 44px;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
              border: 1px solid var(--border-color, #e0e0e0);
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
              flex-shrink: 0;

              &:hover {
                background: var(--bg-light, #F5F5F5);
              }

              .icon {
                width: 20px;
                height: 20px;
                fill: currentColor;
                color: var(--text-color, #333);
              }
            }
          }

          .nav-divider {
            display: none;
          }

          .filter-tags {
            display: none; // 移动端隐藏
          }
        }
      }

      .main-list-section {
        gap: 12px;

        .left-vertical-list {
          gap: 12px;

          .list-item {
            padding: 16px;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

            .item-header {
              margin-bottom: 16px;
              align-items: center;
              gap: 12px;

              .user-avatar {
                width: 48px;
                height: 48px;
                border-radius: 8px; // 方形头像，圆角
                object-fit: cover;
                flex-shrink: 0;
              }

              .item-meta {
                padding-left: 0;
                flex: 1;
                min-width: 0;

                .item-title {
                  font-size: 14px;
                  line-height: 1.5;
                  color: var(--text-color, #333);
                  font-weight: 500;
                }
              }

              .percentage-semicircle {
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;

                .semicircle-chart {
                  width: 60px;
                  height: 30px;
                }

                .percentage-label {
                  font-size: 10px;
                  color: var(--text-dark-gray, #999);
                  margin-top: 0;
                }
              }
            }

            .item-actions {
              gap: 12px;
              margin-bottom: 12px;

              .action-btn {
                flex: 1;
                padding: 12px 16px;
                font-size: 14px;
                font-weight: 600;
                min-height: 44px; // 触摸友好的最小高度
                border-radius: 8px;
                border: none;
                cursor: pointer;
                transition: all 0.2s;

                &.yes-btn {
                  background: #E8F5E9; // 浅绿色背景
                  color: #4CAF50; // 绿色文字

                  &:hover {
                    background: #C8E6C9;
                  }

                  &.active {
                    background: #4CAF50;
                    color: #ffffff;
                  }
                }

                &.no-btn {
                  background: #FCE4EC; // 浅粉色背景
                  color: #E91E63; // 粉色文字

                  &:hover {
                    background: #F8BBD0;
                  }

                  &.active {
                    background: #E91E63;
                    color: #ffffff;
                  }
                }
              }
            }

            .item-amount {
              font-size: 12px;
              color: var(--text-dark-gray, #999);
              display: flex;
              align-items: center;
              justify-content: space-between;

              .icon-sc {
                width: 16px;
                height: 16px;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  transform: scale(1.1);
                }

                &.active {
                  fill: #CA4064;
                }
              }
            }
          }
        }

        .right-horizontal-list {
          gap: 12px;

          .horizontal-row {
            flex-direction: column;
            gap: 12px;

            .list-item {
              flex: 0 0 100%;
              width: 100%;
              padding: 16px;
              border-radius: 12px;
              background: var(--bg-card, #ffffff);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

              .item-header {
                margin-bottom: 16px;
                align-items: center;
                gap: 12px;

                .user-avatar {
                  width: 48px;
                  height: 48px;
                  border-radius: 8px; // 方形头像，圆角
                  object-fit: cover;
                  flex-shrink: 0;
                }

                .item-meta {
                  padding-left: 0;
                  flex: 1;
                  min-width: 0;

                  .item-title {
                    font-size: 14px;
                    line-height: 1.5;
                    color: var(--text-color, #333);
                    font-weight: 500;
                  }
                }
              }

              .item-options {
                margin-bottom: 12px;

                .option-item {
                  margin-bottom: 12px;
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                  gap: 12px;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  .option-text {
                    flex: 1;
                    font-size: 13px;
                    color: var(--text-color, #333);
                    margin-right: auto;
                    display: flex;
                    align-items: center;

                    span:first-child {
                      flex: 1;
                    }

                    span:last-child {
                      display: none; // 移动端隐藏百分比
                    }
                  }

                  .option-buttons {
                    display: flex;
                    gap: 8px;
                    flex-shrink: 0;

                    .option-btn {
                      padding: 6px 12px;
                      font-size: 12px;
                      font-weight: 600;
                      min-height: 32px;
                      border-radius: 6px;
                      border: none;
                      cursor: pointer;
                      transition: all 0.2s;
                      white-space: nowrap;

                      &.yes-btn {
                        background: rgba(37, 167, 80, 0.2);
                        color: #25A750;

                        &:hover {
                          background: rgba(37, 167, 80, 0.3);
                        }

                        &.active {
                          background: #25A750;
                          color: #ffffff;
                        }
                      }

                      &.no-btn {
                        background: rgba(202, 64, 100, 0.2);
                        color: #CA4064;

                        &:hover {
                          background: rgba(202, 64, 100, 0.3);
                        }

                        &.active {
                          background: #CA4064;
                          color: #ffffff;
                        }
                      }
                    }
                  }
                }
              }

              .item-amount {
                font-size: 12px;
                color: var(--text-dark-gray, #999);
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 8px;

                span:first-child {
                  &::before {
                    content: '交易额: ';
                  }
                }

                .icon-sc {
                  width: 16px;
                  height: 16px;
                  cursor: pointer;
                  transition: all 0.2s;

                  &:hover {
                    transform: scale(1.1);
                  }

                  &.active {
                    fill: #CA4064;
                  }
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
  .coming-soon-overlay {
    display: flex !important;
  }

  .home-page {
    padding-top: 60px;

    .main-content {
      padding: 12px 12px 32px;

      .filter-section {
        margin-bottom: 12px;

        .filter-container {
          gap: 8px;

          .search-box {
            padding: 8px 10px;
            border-radius: 6px;
            height: 40px;
            border-radius: 8px 8px 8px 8px;
            border: 1px solid var(--border-color, #e0e0e0);
            background-color: var(--bg-page-h5, #F5F5F5);

            .search-icon {
              font-size: 14px;
              margin-right: 6px;
            }

            .search-input {
              font-size: 13px;
            }
          }

          .action-buttons {
            gap: 6px;

            .action-btn {
              width: 40px;
              height: 40px;
              padding: 0;
              border-radius: 6px;
              background: var(--bg-card, #F5F5F5);
              border: 1px solid var(--border-color, #e0e0e0);

              .icon {
                width: 18px;
                height: 18px;
              }
            }
          }

          .filter-tags {
            gap: 6px;

            .filter-tag {
              padding: 5px 10px;
              font-size: 12px;
              min-height: 30px; // 触摸友好的最小高度
            }
          }
        }
      }

      .main-list-section {
        gap: 10px;

        .left-vertical-list {
          gap: 12px;

          .list-item {
            padding: 14px;
            border-radius: 12px;
            background: var(--bg-card, #ffffff);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

            .item-header {
              margin-bottom: 14px;
              align-items: center;
              gap: 10px;

              .user-avatar {
                width: 44px;
                height: 44px;
                border-radius: 8px;
                object-fit: cover;
                flex-shrink: 0;
              }

              .item-meta {
                padding-left: 0;
                flex: 1;
                min-width: 0;

                .item-title {
                  font-size: 13px;
                  line-height: 1.5;
                  color: var(--text-color, #333);
                  font-weight: 500;
                }
              }

              .percentage-semicircle {
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;

                .semicircle-chart {
                  width: 55px;
                  height: 28px;
                }

                .percentage-label {
                  font-size: 9px;
                  color: var(--text-dark-gray, #999);
                  margin-top: 0;
                }
              }
            }

            .item-actions {
              gap: 10px;
              margin-bottom: 12px;

              .action-btn {
                flex: 1;
                padding: 10px 14px;
                font-size: 13px;
                font-weight: 600;
                min-height: 40px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                transition: all 0.2s;

                &.yes-btn {
                  background: rgba(37, 167, 80, 0.2);
                  color: #4CAF50;

                  &:hover {
                    background: #C8E6C9;
                  }

                  &.active {
                    background: #4CAF50;
                    color: #ffffff;
                  }
                }

                &.no-btn {
                  background: rgba(202, 64, 100, 0.2);
                  color: #E91E63;

                  &:hover {
                    background: #F8BBD0;
                  }

                  &.active {
                    background: #E91E63;
                    color: #ffffff;
                  }
                }
              }
            }

            .item-amount {
              font-size: 11px;
              color: var(--text-dark-gray, #999);
              display: flex;
              align-items: center;
              justify-content: space-between;

              .icon-sc {
                width: 16px;
                height: 16px;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  transform: scale(1.1);
                }

                &.active {
                  fill: #CA4064;
                }
              }
            }
          }
        }

        .right-horizontal-list {
          gap: 12px;

          .horizontal-row {
            flex-direction: column;
            gap: 12px;

            .list-item {
              flex: 0 0 100%;
              width: 100%;
              padding: 14px;
              border-radius: 12px;
              background: var(--bg-card, #ffffff);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

              .item-header {
                margin-bottom: 14px;
                align-items: center;
                gap: 10px;

                .user-avatar {
                  width: 44px;
                  height: 44px;
                  border-radius: 8px;
                  object-fit: cover;
                  flex-shrink: 0;
                }

                .item-meta {
                  padding-left: 0;
                  flex: 1;
                  min-width: 0;

                  .item-title {
                    font-size: 13px;
                    line-height: 1.5;
                    color: var(--text-color, #333);
                    font-weight: 500;
                  }
                }
              }

              .item-options {
                margin-bottom: 12px;

                .option-item {
                  margin-bottom: 6px;
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                  gap: 12px;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  .option-text {
                    flex: 1;
                    font-size: 12px;
                    color: var(--text-color, #333);
                    margin-right: auto;
                    display: flex;
                    align-items: center;

                    span:first-child {
                      flex: 1;
                    }

                    span:last-child {
                      display: none; // 移动端隐藏百分比
                    }
                  }

                  .option-buttons {
                    display: flex;
                    gap: 8px;
                    flex-shrink: 0;

                    .option-btn {
                      padding: 6px 16px;
                      font-size: 12px;
                      font-weight: 600;
                      min-height: 32px;
                      border-radius: 6px;
                      border: none;
                      cursor: pointer;
                      transition: all 0.2s;
                      white-space: nowrap;

                      &.yes-btn {
                        background: rgba(37, 167, 80, 0.2);
                        color: #25A750;

                        &:hover {
                          background: rgba(37, 167, 80, 0.3);
                        }

                        &.active {
                          background: #25A750;
                          color: #ffffff;
                        }
                      }

                      &.no-btn {
                        background: rgba(202, 64, 100, 0.2);
                        color: #CA4064;

                        &:hover {
                          background: rgba(202, 64, 100, 0.3);
                        }

                        &.active {
                          background: #CA4064;
                          color: #ffffff;
                        }
                      }
                    }
                  }
                }
              }

              .item-amount {
                font-size: 11px;
                color: var(--text-dark-gray, #999);
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 8px;

                span:first-child {
                  &::before {
                    content: '交易额: ';
                  }
                }

                .icon-sc {
                  width: 16px;
                  height: 16px;
                  cursor: pointer;
                  transition: all 0.2s;

                  &:hover {
                    transform: scale(1.1);
                  }

                  &.active {
                    fill: #CA4064;
                  }
                }
              }
            }
          }
        }

        .left-vertical-list {
          gap: 12px;

          .list-item {
            padding: 14px;
            border-radius: 12px;
            background: var(--bg-card, #ffffff);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

            .item-header {
              margin-bottom: 14px;
              align-items: center;
              gap: 10px;

              .user-avatar {
                width: 44px;
                height: 44px;
                border-radius: 8px;
                object-fit: cover;
                flex-shrink: 0;
              }

              .item-meta {
                padding-left: 0;
                flex: 1;
                min-width: 0;

                .item-title {
                  font-size: 13px;
                  line-height: 1.5;
                  color: var(--text-color, #333);
                  font-weight: 500;
                }
              }

              .percentage-semicircle {
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;

                .semicircle-chart {
                  width: 55px;
                  height: 28px;
                }

                .percentage-label {
                  font-size: 9px;
                  color: var(--text-dark-gray, #999);
                  margin-top: 0;
                }
              }
            }

            .item-actions {
              gap: 10px;
              margin-bottom: 12px;

              .action-btn {
                padding: 8px 10px;
                font-size: 12px;
                min-height: 38px; // 触摸友好的最小高度
              }
            }

            .item-amount {
              font-size: 10px;
              margin-top: 8px;

              span:first-child {
                &::before {
                  content: '交易额: ';
                }
              }

              .icon-sc {
                width: 12px;
                height: 12px;
              }
            }

            .item-options {
              margin-bottom: 8px;

              .option-item {
                margin-bottom: 8px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 10px;

                .option-text {
                  flex: 1;
                  font-size: 11px;
                  margin-bottom: 0;
                  margin-right: auto;
                  display: flex;
                  align-items: center;

                  span:first-child {
                    flex: 1;
                  }

                  span:last-child {
                    display: none; // 移动端隐藏百分比
                  }
                }

                .option-buttons {
                  display: flex;
                  gap: 6px;
                  flex-shrink: 0;

                  .option-btn {
                    padding: 5px 10px;
                    font-size: 11px;
                    min-height: 30px;
                    border-radius: 6px;
                    white-space: nowrap;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/* 功能暂不开放覆盖层 */
.coming-soon-overlay {
  display: none;
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  justify-content: center;
  z-index: 1000;
  padding-top: 100px;
  box-sizing: border-box;
}

.theme-dark .coming-soon-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.coming-soon-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.coming-soon-icon {
  width: 48px;
  height: 30px;
}

.coming-soon-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color, #333333);
}

.home-page.no-scroll {
  overflow: hidden;
  height: 100vh;
}
</style>
