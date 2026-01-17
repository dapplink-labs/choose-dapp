<template>
  <div class="home-page ">


    <!-- Banner轮播图板块 -->
    <div class="banner-section">
      <div class="banner-container">
        <swiper :modules="swiperModules" :slides-per-view="1" :space-between="0" :loop="true" :autoplay="{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false
        }" :pagination="{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active'
        }" :navigation="false" class="banner-swiper">
          <swiper-slide v-for="(banner, index) in bannerList" :key="index">
            <div class="banner-item">
              <img :src="banner" class="banner-image" />
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>

    <NavBar2 />
    <div class="main-content">
      <!-- 功能暂不开放覆盖层 -->
      <div class="coming-soon-overlay">
        <div class="coming-soon-content">
          <img src="@/assets/icon/11.png" :alt="$t('home.comingSoonAlt') || '暂不开放'" class="coming-soon-icon" />
          <p class="coming-soon-text">{{ $t('home.comingSoon') || '预测功能即将上线' }}</p>
        </div>
      </div>
      <div class="content-wrapper">

        <!-- PC 顶部筛选栏（PC端显示，移动端隐藏） -->
        <div class="pc-filter-section">
          <div class="pc-filter-container">
            <div class="pc-search-box">
              <el-icon class="pc-search-icon" aria-hidden="true">
                <Search />
              </el-icon>
              <input v-model="searchQuery" class="pc-search-input" type="text"
                :placeholder="`${t('home.searchPlaceholder')}${t('home.multiMarket')}`" />
            </div>

            <div class="pc-action-icons">
              <div class="pc-action-btn" @click="handleBookmark" aria-label="bookmark">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M12.988,19a2.964,2.964,0,0,1-1.789-.606L8,16l-3.2,2.4A2.962,2.962,0,0,1,3.012,19a3.069,3.069,0,0,1-2.089-.836A2.954,2.954,0,0,1,0,16V3A3,3,0,0,1,3,0H13a3,3,0,0,1,3,3V16a2.954,2.954,0,0,1-.923,2.168A3.069,3.069,0,0,1,12.988,19ZM8,14a1.984,1.984,0,0,1,1.2.4l3.2,2.4a.987.987,0,0,0,.6.2,1.024,1.024,0,0,0,.7-.279A.984.984,0,0,0,14,16V3a1,1,0,0,0-1-1H3A1,1,0,0,0,2,3V16a1,1,0,0,0,1,1,.987.987,0,0,0,.6-.2l3.2-2.4A1.984,1.984,0,0,1,8,14Z" />
                  <path fill="currentColor" d="M0,1A1,1,0,0,1,1,0H7A1,1,0,0,1,7,2H1A1,1,0,0,1,0,1Z"
                    transform="translate(4 4)" />
                </svg>
              </div>
            </div>

            <div class="pc-divider" aria-hidden="true"></div>

            <div class="pc-tab-wrapper">
              <div class="pc-tab-scroll">
                <button v-for="tag in pcTagButtons" :key="tag.value" class="pc-tab-btn"
                  :class="{ active: activeTag === tag.value }" @click="handleTagClick(tag.value)">
                  {{ tag.label }}
                </button>
              </div>
            </div>
          </div>
        </div>


        <div class="filter-section">
          <div class="filter-container">
            <!-- 标签按钮行 -->
            <div class="tag-scroll-wrapper">
              <div class="tag-scroll-container">
                <button v-for="tag in tagButtons" :key="tag.value" class="tag-btn"
                  :class="{ active: activeTag === tag.value }" @click="handleTagClick(tag.value)">
                  {{ tag.label }}
                </button>
              </div>
              <!-- 右侧渐变遮罩 -->
              <div class="gradient-mask gradient-mask-right"></div>
            </div>

            <!-- 右侧操作按钮 -->
            <div class="action-buttons">
              <div class="action-btn" @click="handleFilter"">
                <svg xmlns=" http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <g transform="translate(-295 -358)">
                  <rect fill="none" width="24" height="24" transform="translate(295 358)" />
                  <g transform="translate(298 361)">
                    <path fill="currentColor"
                      d="M7,8A4,4,0,0,1,3.126,5H1A1,1,0,0,1,1,3H3.126a4,4,0,0,1,7.748,0H17a1,1,0,0,1,0,2H10.874A4,4,0,0,1,7,8ZM7,2A2,2,0,1,0,9,4,2,2,0,0,0,7,2Z"
                      transform="translate(0 10)" />
                    <path fill="currentColor"
                      d="M11,8A4,4,0,0,1,7.126,5H1A1,1,0,0,1,1,3H7.126a4,4,0,0,1,7.748,0H17a1,1,0,0,1,0,2H14.874A4,4,0,0,1,11,8Zm0-6a2,2,0,1,0,2,2A2,2,0,0,0,11,2Z" />
                  </g>
                </g>
                </svg>
              </div>
              <div class="action-btn bookmark-btn" @click="handleBookmark">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <g transform="translate(-336 -358)">
                    <rect fill="none" width="24" height="24" transform="translate(336 358)" />
                    <g transform="translate(340 361)">
                      <path fill="currentColor"
                        d="M12.988,19a2.964,2.964,0,0,1-1.789-.606L8,16l-3.2,2.4A2.962,2.962,0,0,1,3.012,19a3.069,3.069,0,0,1-2.089-.836A2.954,2.954,0,0,1,0,16V3A3,3,0,0,1,3,0H13a3,3,0,0,1,3,3V16a2.954,2.954,0,0,1-.923,2.168A3.069,3.069,0,0,1,12.988,19ZM8,14a1.984,1.984,0,0,1,1.2.4l3.2,2.4a.987.987,0,0,0,.6.2,1.024,1.024,0,0,0,.7-.279A.984.984,0,0,0,14,16V3a1,1,0,0,0-1-1H3A1,1,0,0,0,2,3V16a1,1,0,0,0,1,1,.987.987,0,0,0,.6-.2l3.2-2.4A1.984,1.984,0,0,1,8,14Z" />
                      <path fill="currentColor" d="M0,1A1,1,0,0,1,1,0H7A1,1,0,0,1,7,2H1A1,1,0,0,1,0,1Z"
                        transform="translate(4 4)" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <!-- 筛选面板（移动端） -->
          <transition name="filter-panel">
            <div v-if="showFilterPanel" class="filter-panel">
              <div class="filter-dropdowns">
                <div class="filter-dropdown">
                  <!-- 排序按钮 -->
                  <button class="filter-select-btn">
                    <div class="filter-label"><span>排序:</span> {{ currentSortLabel }}</div>
                    <el-icon class="filter-arrow">
                      <ArrowDownBold />
                    </el-icon>
                  </button>
                  <!-- 频率按钮 -->

                  <button class="filter-select-btn">
                    <div class="filter-label"><span>频率:</span> {{ currentFrequencyLabel }}</div>
                    <el-icon class="filter-arrow">
                      <ArrowDownBold />
                    </el-icon>
                  </button>
                </div>

              </div>
            </div>
          </transition>
        </div>

        <div class="main-list-section">
          <div class="left-vertical-list">
            <div class="list-item large-item" v-for="(item, index) in leftList" :key="'left-' + index">
              <div class="item-header">
                <img :src="item.avatar" :alt="$t('common.userAvatar')" class="user-avatar">
                <div class="item-meta">
                  <div class="item-title" @click="navigateToEarnings()">{{ item.title }}</div>
                </div>
                <div class="percentage-semicircle">
                  <svg class="semicircle-chart" viewBox="0 0 100 60">
                    <!-- 背景半圆 -->
                    <path class="semicircle-background" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke-width="8" />
                    <!-- 进度半圆 -->
                    <path class="semicircle-progress" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E44096"
                      stroke-width="8" stroke-linecap="round" :stroke-dasharray="125.6"
                      :stroke-dashoffset="(125.6 * (100 - parseInt(item.percentage))) / 100" />
                    <!-- 百分比文本 -->
                    <text class="semicircle-percentage" x="52" y="50" text-anchor="middle" dy="0">{{ item.percentage
                      }}</text>
                  </svg>
                  <div class="percentage-label">{{ $t('home.opportunity') }}</div>
                </div>
              </div>
              <div class="item-leverage-info">
                <div class="leverage-item">
                  <span class="leverage-label">{{ $t('home.maxLeverage') || '最大杠杆倍数' }}:</span>
                  <span class="leverage-value">{{ item.maxLeverage || '10X' }}</span>
                </div>
                <div class="leverage-item">
                  <span class="leverage-label">{{ $t('home.maxReturn') || '最大回报' }}:</span>
                  <span class="leverage-value">{{ item.maxReturn || '182%' }}</span>
                </div>
              </div>
              <div class="item-actions">
                <button class="action-btn yes-btn" @click="navigateToDetail(item, 'yes')">Yes</button>
                <button class="action-btn no-btn" @click="navigateToDetail(item, 'no')">No</button>
              </div>
              <div class="item-amount">
                <div class="amount-left">
                  <div class="time-info" :class="{ urgent: item.isTimeUrgent }">
                    <span v-if="item.isTimeUrgent" class="time-dot" aria-hidden="true">
                      <em></em>
                    </span>
                    <svg v-else class="time-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12"
                      height="12" viewBox="0 0 12 12">
                      <path
                        d="M75.818,69.818a6,6,0,1,1-6,6A6,6,0,0,1,75.818,69.818ZM75.66,72.66a.474.474,0,0,0-.474.474v2.842a.474.474,0,0,0,.474.474H78.5a.474.474,0,1,0,0-.947H76.134V73.134A.474.474,0,0,0,75.66,72.66Z"
                        transform="translate(-69.818 -69.818)" fill="currentColor" />
                    </svg>
                    <span class="time-text">{{ item.timeRemaining }}</span>
                  </div>
                  <div class="participant-info">
                    <el-icon class="participant-icon">
                      <Avatar />
                    </el-icon>
                    <span class="participant-text">{{ item.participantCount.toLocaleString() }}</span>
                  </div>
                  <span class="voi-amount">VOI：${{ item.amount }}</span>
                </div>
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
            <div class="list-item small-item" v-for="(item, index) in rightList" :key="'right-' + index">
              <div class="item-header">
                <img :src="item.avatar" :alt="$t('common.userAvatar')" class="user-avatar">
                <div class="item-meta">
                  <div class="item-title">{{ item.title }}</div>
                </div>
              </div>
              <div class="item-leverage-info">
                <div class="leverage-item">
                  <span class="leverage-label">{{ $t('home.maxLeverage') || '最大杠杆倍数' }}:</span>
                  <span class="leverage-value">{{ item.maxLeverage || '10X' }}</span>
                </div>
                <div class="leverage-item">
                  <span class="leverage-label">{{ $t('home.maxReturn') || '最大回报' }}:</span>
                  <span class="leverage-value">{{ item.maxReturn || '182%' }}</span>
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
                <div class="amount-left">
                  <div class="time-info" :class="{ urgent: item.isTimeUrgent }">
                    <span v-if="item.isTimeUrgent" class="time-dot" aria-hidden="true">
                      <em></em>
                    </span>
                    <svg v-else class="time-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12"
                      height="12" viewBox="0 0 12 12">
                      <path
                        d="M75.818,69.818a6,6,0,1,1-6,6A6,6,0,0,1,75.818,69.818ZM75.66,72.66a.474.474,0,0,0-.474.474v2.842a.474.474,0,0,0,.474.474H78.5a.474.474,0,1,0,0-.947H76.134V73.134A.474.474,0,0,0,75.66,72.66Z"
                        transform="translate(-69.818 -69.818)" fill="currentColor" />
                    </svg>
                    <span class="time-text">{{ item.timeRemaining }}</span>
                  </div>
                  <div class="participant-info">
                    <el-icon class="participant-icon">
                      <Avatar />
                    </el-icon>
                    <span class="participant-text">{{ item.participantCount.toLocaleString() }}</span>
                  </div>
                  <span class="voi-amount">VOI：${{ item.amount }}</span>
                </div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavBar2 from '@/components/navBar2.vue'
import { Search, Avatar, ArrowDownBold } from '@element-plus/icons-vue'
import router from '@/router'
import { useI18n } from 'vue-i18n'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import bannerImg from '@/assets/images/banner.png'
import banner0Img from '@/assets/images/banner0.png'
import banner2Img from '@/assets/images/banner2.png'
import linghua1Img from '@/assets/images/linghua1.png'

const { t } = useI18n()

// Swiper 模块
const swiperModules = [Autoplay, Pagination]

// 轮播图数据
const bannerList = ref([
  bannerImg,
  banner0Img,
  banner2Img,
  linghua1Img
])

// 禁止页面滚动
onMounted(() => {
  // document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

// 搜索相关（PC 顶部栏）
const searchQuery = ref('')

// 标签按钮数据
const tagButtons = ref([
  { value: 'bitcoin', label: 'Bitcoin' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'solana', label: 'Solana' },
  { value: 'meme', label: 'Meme' },
  { value: 'defi', label: 'DeFi' },
  { value: 'nft', label: 'NFT' },
  { value: 'web3', label: 'Web3' },
  { value: 'ai', label: 'AI' }
])

// PC tab（含“全部”）
const pcTagButtons = computed(() => [{ value: 'all', label: t('home.all') }, ...tagButtons.value])

// 当前激活的标签
const activeTag = ref('all')

// 模拟数据：左边垂直列表
const leftList = ref([
  {
    avatar: 'https://picsum.photos/seed/user1/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '75%',
    amount: '19.00',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false,
    maxLeverage: '10X',
    maxReturn: '182%',
    timeRemaining: '04:30:57',
    participantCount: 1280,
    isTimeUrgent: false // 时间是否紧急（控制图标状态）
  },
  {
    avatar: 'https://picsum.photos/seed/user2/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '25%',
    amount: '19.00',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false,
    maxLeverage: '10X',
    maxReturn: '182%',
    timeRemaining: '02:15:30',
    participantCount: 1280,
    isTimeUrgent: true // 时间紧急状态
  },
  {
    avatar: 'https://picsum.photos/seed/user3/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '50%',
    amount: '19.00',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false,
    maxLeverage: '10X',
    maxReturn: '182%',
    timeRemaining: '12:45:20',
    participantCount: 1280,
    isTimeUrgent: false
  },
  {
    avatar: 'https://picsum.photos/seed/user4/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '90%',
    amount: '19.00',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false,
    maxLeverage: '10X',
    maxReturn: '182%',
    timeRemaining: '01:20:10',
    participantCount: 1280,
    isTimeUrgent: true
  },
  {
    avatar: 'https://picsum.photos/seed/user5/40/40',
    title: '鲍威尔：美联储在2025年11月18日至20日会议会宣布降息2%？',
    percentage: '33%',
    amount: '19.00',
    yesCount: 1234,
    noCount: 567,
    isFavorite: false,
    maxLeverage: '10X',
    maxReturn: '182%',
    timeRemaining: '08:15:45',
    participantCount: 1280,
    isTimeUrgent: false
  }
])

// 生成右边列表项的辅助函数
const createRightListItem = (seed, title = '美联储12月会做出决定吗？') => ({
  avatar: `https://picsum.photos/seed/user${seed}/40/40`,
  title,
  percentage: '14%',
  amount: '19.00',
  isFavorite: false,
  maxLeverage: '10X',
  maxReturn: '182%',
  timeRemaining: '04:30:57',
  participantCount: 1280,
  isTimeUrgent: false,
  options: [
    { text: '下调50个基点以上', percentage: '2%', yesCount: 123, noCount: 456 },
    { text: '增长超过25基点', percentage: '32%', yesCount: 789, noCount: 101 }
  ]
})

// 模拟数据：右边横向列表（通过 CSS 控制每行展示数量）
const rightList = ref(
  Array.from({ length: 20 }, (_, index) => createRightListItem(6 + index))
)

// 处理搜索
const handleSearch = () => {
  // 这里可以实现搜索逻辑
}

// 筛选面板显示状态
const showFilterPanel = ref(false)

// 排序选项
const sortOptions = [
  { value: 'liquidity', label: '流动性' },
  { value: 'volume', label: '24小时交易量' },
  { value: 'time', label: '时间排序' },
  { value: 'default', label: '默认排序' }
]

// 频率选项
const frequencyOptions = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'all', label: '全部' }
]

// 选中的排序方式
const selectedSort = ref('liquidity')

// 选中的频率
const selectedFrequency = ref('daily')

// 获取当前排序标签
const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.value === selectedSort.value)
  return option ? option.label : '流动性'
})

// 获取当前频率标签
const currentFrequencyLabel = computed(() => {
  const option = frequencyOptions.find(opt => opt.value === selectedFrequency.value)
  return option ? option.label : '每日'
})

// 处理筛选
const handleFilter = () => {
  showFilterPanel.value = !showFilterPanel.value
}

// 处理视图切换
const handleViewToggle = () => {
  router.push('/leaderboard')
}

// 跳转到收益页面
const navigateToEarnings = () => {
  router.push('/earnings')
}

// 检测是否为移动端
const checkIsMobile = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768
  }
  return false
}

// 跳转到详情页面
const navigateToDetail = (item, choice) => {
  const isMobile = checkIsMobile()
  const detailPath = isMobile ? '/detail-h5' : '/detail'

  router.push({
    path: detailPath,
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

// 处理收藏点击
const handleBookmark = () => {
  // 这里可以实现收藏功能
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

.theme-dark {
  .list-item {
    border: 1px solid #383838 !important;
  }
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
      width: 100%;

      .banner-swiper {
        width: 100%;
        height: 100%;

        .banner-item {
          width: 100%;
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

        // 分页指示器样式
        :deep(.swiper-pagination) {
          bottom: 10px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
        }

        :deep(.swiper-pagination-bullet) {
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          border-radius: 50%;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        :deep(.swiper-pagination-bullet-active) {
          width: 20px;
          height: 6px;
          background: #ffffff;
          border-radius: 3px;
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
        flex-direction: row;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-radius: 8px;
        position: relative;

        // 标签滚动容器
        .tag-scroll-wrapper {
          position: relative;
          width: 80%;
          flex-shrink: 0;
          overflow: hidden;

          .tag-scroll-container {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; // Firefox
            -ms-overflow-style: none; // IE/Edge

            &::-webkit-scrollbar {
              display: none; // Chrome/Safari
            }

            .tag-btn {
              padding: 6px 14px;
              border: 1px solid var(--border-color, #E0E0E0);
              border-radius: 5px;
              font-size: 13px;
              color: var(--text-gray, #666666);
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              cursor: pointer;
              transition: all 0.2s;
              white-space: nowrap;
              background: var(--bg-page, #F5F5F5);
              font-weight: 400;

              &.active {
                color: var(--text-color, #1a1a1a);
              }
            }
          }

          // 渐变遮罩
          .gradient-mask {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 60px;
            pointer-events: none;
            z-index: 1;
          }
        }

        // 功能按钮样式
        .action-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
          margin-left: auto;

          .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            background: transparent;
            color: var(--text-color, #ffffff);

            .icon {
              fill: currentColor;

              path {
                fill: currentColor;
              }
            }

            &:hover {
              opacity: 0.8;
            }
          }
        }

        // 移动端筛选面板
        .filter-panel {
          position: relative;
          width: 100%;
          margin-top: 8px;
          padding: 0;
          background: transparent;
          border: none;
          box-shadow: none;
          z-index: 100;

          .filter-dropdowns {
            display: flex;
            gap: 12px;
            flex-wrap: nowrap;
            align-items: flex-start;
            width: 100%;
          }

          .filter-dropdown {
            position: relative;
            flex: 1;
            min-width: 140px;
            max-width: calc(50% - 6px);
          }

          .filter-select-btn {
            margin-right: 10px;
            border-radius: 16px;
            border: 1px solid #2F2F2F;
            background: transparent;
            color: #ffffff;
            padding: 6px 15px;

            .filter-label {
              display: inline-block;
            }
          }

          .filter-select-btn {
            width: 100%;
            padding: 10px 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            font-size: 14px;
            color: #ffffff;
            background: rgba(26, 26, 26, 0.6);
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 400;
            min-height: 40px;
            box-sizing: border-box;

            .filter-label {
              flex: 1;
              text-align: left;
              color: #ffffff;
              white-space: nowrap;
              display: inline-block;

              span {
                color: #999999;
              }
            }

            .filter-arrow {
              margin-left: 12px;
              font-size: 14px;
              color: #ffffff;
              transition: transform 0.2s;
              flex-shrink: 0;
            }

            &:hover {
              background: rgba(26, 26, 26, 0.8);
              border-color: rgba(255, 255, 255, 0.4);
            }

            &:active {
              background: rgba(26, 26, 26, 0.7);
            }
          }

        }
      }
    }

    // PC 顶部筛选栏（仅 PC 显示）
    .pc-filter-section {
      display: block;
      margin-bottom: 18px;

      .pc-filter-container {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 0 10px;
      }

      .pc-search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 8px;
        background: #F4F4F4;
        border: 1px solid #F1F1F1;
        min-width: 260px;
        height: 40px;
        box-sizing: border-box;
      }

      .pc-search-icon {
        font-size: 16px;
        color: rgba(0, 0, 0, 0.35);
      }

      .pc-search-input {
        border: none;
        outline: none;
        background: transparent;
        font-size: 13px;
        color: var(--text-color, #1a1a1a);
        width: 100%;

        &::placeholder {
          color: rgba(0, 0, 0, 0.40);
        }
      }

      .pc-action-icons {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 6px;
        height: 28px;
      }

      .pc-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(0, 0, 0, 0.62);
        cursor: pointer;
        border-radius: 8px;
        transition: background 0.2s, color 0.2s;

        &.active {
          background: rgba(0, 0, 0, 0.05);
          color: rgba(0, 0, 0, 0.85);
        }
      }

      .pc-divider {
        width: 1px;
        height: 18px;
        background: rgba(0, 0, 0, 0.10);
        flex-shrink: 0;
      }

      .pc-tab-wrapper {
        flex: 1;
        min-width: 0;
      }

      .pc-tab-scroll {
        display: flex;
        align-items: center;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .pc-tab-btn {
        min-width: 90px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        padding: 8px 16px;
        font-family: PingFang SC, PingFang SC;
        font-weight: 500;
        font-size: 12px;
        color: var(--text-color, #1a1a1a);
        background: transparent;
        transition: background 0.2s, color 0.2s;

        &.active {
          background: #000;
          color: #fff;
          font-weight: 600;
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
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr)); // 默认每行 3 个
        gap: 16px;

        // 仅右侧卡片：头像与标题垂直居中对齐
        .item-header {
          align-items: center;

          .item-meta {
            display: flex;
            align-items: center;
          }

          .item-title {
            margin-bottom: 0;
          }
        }
      }

      // 列表项基础样式
      .list-item {
        overflow: hidden;
        background: var(--bg-card, #ffffff);
        border-radius: 8px;
        border: 1px solid #F4F4F4;
        transition: all 0.2s;
        box-sizing: border-box;
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
        padding: 16px 16px 0;
        box-sizing: border-box;
        min-height: 63px;
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
        // 跟随主题：亮色黑字，暗色白字
        fill: var(--text-color, #333);
        transition: fill 0.3s ease;

        @media (max-width: 768px) {
          font-size: 24px;
        }

        @media (max-width: 480px) {
          font-size: 20px;
        }
      }

      // 列表项操作按钮样式
      .item-leverage-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 0 16px;
        box-sizing: border-box;

        .leverage-item {
          display: flex;
          align-items: center;

          .leverage-label {
            font-size: 12px;
            color: var(--text-gray, #666666);
            white-space: nowrap;
          }

          .leverage-value {
            font-size: 12px;
            color: var(--text-color, #333333);
            font-weight: 600;
            white-space: nowrap;
          }
        }
      }

      .item-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 8px;
        padding: 0 16px;
        box-sizing: border-box;
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
        padding: 7px 16px;
        box-sizing: border-box;
        background: var(--bg-page, #F5F5F5);
        border-radius: 0 0 8px 8px;
        gap: 8px;

        .amount-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          min-width: 0;

          .time-info,
          .participant-info {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-radius: 999px;
          }

          .time-info {
            &.urgent {
              .time-dot {
                background: rgba(246, 70, 93, 0.2);
              }
            }

            .time-dot {
              width: 15px;
              height: 15px;
              border-radius: 50%;
              flex-shrink: 0;
              text-align: center;
              line-height: 14px;

              em {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(246, 70, 93, 1);
              }
            }
          }

          .time-text,
          .participant-text,
          .voi-amount,
          .time-icon,
          .participant-icon {
            font-family: PingFang SC, PingFang SC;
            font-weight: 400;
            font-size: 12px;
            color: var(--text-dark-gray, #999);
          }

        }

        .icon-sc {
          width: 14px;
          height: 14px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;

          &.active {
            fill: #CA4064;
          }
        }
      }

      // 选项列表样式
      .item-options {
        margin-bottom: 8px;
        padding: 0 16px;
        box-sizing: border-box;
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
        justify-content: space-between;
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
          gap: 10px;
          flex-direction: row;
          align-items: center;

          .tag-scroll-wrapper {
            width: 80%;

            .gradient-mask {
              width: 40px;
            }
          }

          .action-buttons {
            margin-left: auto;
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
          grid-template-columns: repeat(2, minmax(0, 1fr)); // 中等屏幕每行 2 个
        }
      }
    }
  }
}

// 移动端样式（480px 及以下）
@media (max-width: 480px) {
  .gradient-mask-right {
    right: -1px;
    display: block;
    background: linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.7) 70%, var(--bg-page-h5, #1a1a1a) 100%) !important;
  }

  .theme-dark {
    .gradient-mask-right {
      background: linear-gradient(to right, transparent 0%, rgba(26, 26, 26, 0.3) 30%, rgba(26, 26, 26, 0.7) 70%, var(--bg-page-h5, #1a1a1a) 100%) !important;
    }
  }

  .home-page {
    padding-top: 60px;
    background-color: var(--bg-page-h5, #FFFFFF);

    .banner-section {
      display: block; // 移动端显示
      margin: 10px 0;
      padding: 0 10px;
      box-sizing: border-box;

      .banner-container {
        width: 100%;

        .banner-swiper {
          width: 100%;

          .banner-item {
            border-radius: 8px;
            width: 100%;

            .banner-image {
              width: 100%;
              height: auto;
              max-height: 200px;
              object-fit: cover;
              display: block;
            }
          }
        }
      }
    }

    .main-content {
      padding: 12px 12px 32px;

      .filter-section {
        margin-bottom: 12px;

        .filter-container {
          gap: 6px;
          padding: 0;
          flex-direction: row;
          align-items: center;

          .tag-scroll-wrapper {
            width: 80%;

            .tag-scroll-container {
              gap: 5px;

              .tag-btn {
                padding: 4px 10px;
                font-size: 11px;
              }
            }

            .gradient-mask {
              width: 60px;
            }
          }

          .action-buttons {
            margin-left: auto;
            gap: 8px;

            .action-btn {
              width: 28px;
              height: 28px;
            }
          }
        }
      }

      // 移动端隐藏 PC 顶部栏
      .pc-filter-section {
        display: none;
      }

      .main-list-section {
        gap: 10px;

        .left-vertical-list {
          gap: 12px;

          .list-item {
            border-radius: 12px;
            background: var(--bg-card, #ffffff);
            border: 1px solid #F4F4F4;

            .item-header {
              margin-bottom: 10px;
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

            .item-leverage-info {
              margin-bottom: 10px;
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

            // 当存在 .item-options 时，.item-actions 的样式需要调整
            &:has(.item-options) .item-actions .action-btn {
              padding: 8px 10px;
              font-size: 12px;
              min-height: 38px; // 触摸友好的最小高度
            }

            .item-amount {
              font-size: 11px;
              color: var(--text-dark-gray, #999);
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 6px;

              .icon-sc {
                width: 16px;
                height: 16px;
                cursor: pointer;
                transition: all 0.2s;
                flex-shrink: 0;

                &:hover {
                  transform: scale(1.1);
                }

                &.active {
                  fill: #CA4064;
                }
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

        .right-horizontal-list {
          gap: 12px;
          grid-template-columns: 1fr; // 移动端每行 1 个

          .list-item {
            width: 100%;
            border-radius: 12px;
            background: var(--bg-card, #ffffff);
            border: 1px solid #F4F4F4;

            .item-header {
              margin-bottom: 10px;
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
              gap: 6px;


              .icon-sc {
                width: 16px;
                height: 16px;
                cursor: pointer;
                transition: all 0.2s;
                flex-shrink: 0;

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

  .pc-filter-section {
    .pc-search-box {
      background: var(--bg-page, #F5F5F5);
      border: 1px solid rgba(255, 255, 255, 0.10);
    }

    .pc-search-icon {
      color: rgba(255, 255, 255, 0.6);
    }

    .pc-search-input {
      color: rgba(255, 255, 255, 0.9);

      &::placeholder {
        color: rgba(255, 255, 255, 0.45);
      }
    }

    .pc-action-btn {
      color: rgba(255, 255, 255, 0.72);
    }

    .pc-divider {
      background: rgba(255, 255, 255, 0.18);
    }

    .pc-tab-btn {
      color: rgba(255, 255, 255, 0.65);

      &.active {
        background: #ffffff;
        color: #000000;
      }
    }
  }

  .filter-section {
    .filter-panel {
      margin-top: 15px;

      .filter-select-btn {
        margin-right: 10px;
        border-radius: 16px;
        border: 1px solid #2F2F2F;
        background: transparent;
        color: var(--text-color, #1a1a1a);
        padding: 6px 15px;

        .filter-label {
          display: inline-block;
        }
      }

      .el-icon.filter-arrow {
        margin-left: 7px;
        vertical-align: middle;
        color: var(--text-color, #1a1a1a);
      }

    }
  }

}

// PC 端隐藏移动端 filter-section（> 480px）
@media (min-width: 481px) {
  .home-page {
    .main-content {
      .filter-section {
        display: none;
      }
    }
  }
}

/* 功能暂不开放覆盖层 */
.coming-soon-overlay {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  justify-content: center;
  z-index: 90;
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
  width: 72px;
  height: 72px;
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

// 筛选面板过渡动画
.filter-panel-enter-active,
.filter-panel-leave-active {
  transition: all 0.3s ease;
}

.filter-panel-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.filter-panel-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 下拉菜单过渡动画</style>
