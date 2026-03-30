<template>
    <div class="home-page">
        <!-- Banner轮播图板块 -->
        <div class="banner-section">
            <div class="banner-container">
                <swiper :modules="swiperModules" :slides-per-view="1" :space-between="0" :loop="true" :autoplay="{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,
                }" :pagination="{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet',
                    bulletActiveClass: 'swiper-pagination-bullet-active',
                }" :navigation="false" class="banner-swiper">
                    <swiper-slide v-for="(banner, index) in bannerList" :key="index">
                        <div class="banner-item" @click="goHref(banner)">
                            <img :src="banner.img" class="banner-image" />
                        </div>
                    </swiper-slide>
                </swiper>
            </div>
        </div>

        <NavBar2 />
        <div class="main-content">
            <!-- 功能暂不开放覆盖层 -->
            <div class="coming-soon-overlay" v-if="isComingSoon">
                <div class="coming-soon-content">
                    <img src="@/assets/icon/11.png" :alt="$t('home.comingSoonAlt') || '暂不开放'"
                        class="coming-soon-icon" />
                    <p class="coming-soon-text">
                        {{ $t("home.comingSoon") || "预测功能即将上线" }}
                    </p>
                </div>
            </div>
            <div class="content-wrapper">
                <!-- 筛选栏 -->
                <div class="filter-section">
                    <div class="filter-container">
                        <!-- 标签按钮行 -->
                        <div class="tag-scroll-wrapper">
                            <div class="tag-scroll-container" :class="{ 'is-esports-search': showDateFilter }">
                                <!-- 电子竞技选中：隐藏标签按钮，替换为搜索输入框 -->
                                <div v-if="showDateFilter" class="esports-search">
                                    <svg class="esports-search-icon" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <input class="esports-search-input" type="text" placeholder="Search"
                                        @focus="handleEsportsSearch" />
                                </div>
                                <template v-else>
                                    <button v-for="tag in tagButtons" :key="tag.value" class="tag-btn"
                                        :class="{ active: activeTag === tag.value }" @click="handleTagClick(tag.value)">
                                        {{ tag.label }}
                                    </button>
                                </template>
                            </div>
                            <!-- 右侧渐变遮罩 -->
                            <div class="gradient-mask gradient-mask-right" v-if="!showDateFilter"></div>
                        </div>

                        <!-- 右侧操作按钮 -->
                        <div class="action-buttons">
                            <div class="action-btn" @click="handleFilter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    class="icon">
                                    <g transform="translate(-295 -358)">
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
                                        <g transform="translate(340 361)">
                                            <path fill="currentColor"
                                                d="M12.988,19a2.964,2.964,0,0,1-1.789-.606L8,16l-3.2,2.4A2.962,2.962,0,0,1,3.012,19a3.069,3.069,0,0,1-2.089-.836A2.954,2.954,0,0,1,0,16V3A3,3,0,0,1,3,0H13a3,3,0,0,1,3,3V16a2.954,2.954,0,0,1-.923,2.168A3.069,3.069,0,0,1,12.988,19ZM8,14a1.984,1.984,0,0,1,1.2.4l3.2,2.4a.987.987,0,0,0,.6.2,1.024,1.024,0,0,0,.7-.279A.984.984,0,0,0,14,16V3a1,1,0,0,0-1-1H3A1,1,0,0,0,2,3V16a1,1,0,0,0,1,1,.987.987,0,0,0,.6-.2l3.2-2.4A1.984,1.984,0,0,1,8,14Z" />
                                            <path fill="currentColor"
                                                d="M0,1A1,1,0,0,1,1,0H7A1,1,0,0,1,7,2H1A1,1,0,0,1,0,1Z"
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
                                        <div class="filter-label">
                                            <span>排序:</span> {{ currentSortLabel }}
                                        </div>
                                        <el-icon class="filter-arrow">
                                            <ArrowDownBold />
                                        </el-icon>
                                    </button>
                                    <!-- 频率按钮 -->
                                    <button class="filter-select-btn">
                                        <div class="filter-label">
                                            <span>频率:</span> {{ currentFrequencyLabel }}
                                        </div>
                                        <el-icon class="filter-arrow">
                                            <ArrowDownBold />
                                        </el-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>

                <!-- 日期筛选模块：仅电子竞技选中时显示 -->
                <div v-if="showDateFilter" class="date-filter-section">
                    <!-- 固定在最左侧的"全部" -->
                    <div class="date-card fixed-all" :class="{ active: activeDateKey === 'all' }"
                        @click="handleDateClick('all')">
                        <div class="date-title">{{ $t('home.dateFilter.all') }}</div>
                        <div class="date-subtitle">{{ $t('home.dateFilter.allDates') }}</div>
                        <div class="date-count">{{ totalDateCount }}</div>
                    </div>

                    <!-- 可横向滚动的日期列表 -->
                    <div class="date-scroll-wrapper">
                        <div class="date-scroll">
                            <div v-for="item in dateFilterList" :key="item.key" class="date-card"
                                :class="{ active: activeDateKey === item.key }" @click="handleDateClick(item.key)">
                                <div class="date-title">{{ $t(`home.dateFilter.weekdays.${item.weekKey}`) }}</div>
                                <div class="date-subtitle">{{ item.date }}</div>
                                <div class="date-count">{{ item.count }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 列表：根据 item.cardType 展示大卡片或小卡片 -->
                <div class="main-list-section">
                    <div class="card-list">
                        <template v-for="(item, index) in cardList" :key="'card-' + index">
                            <!-- 大卡片 -->
                            <div v-if="item.cardType === 'large'" class="list-item large-item">
                                <div class="item-header">
                                    <img :src="item.avatar" :alt="$t('common.userAvatar')" class="user-avatar" />
                                    <div class="item-meta">
                                        <div class="item-title" @click="navigateToDetail(item)">
                                            {{ item.title }}
                                        </div>
                                    </div>
                                    <div class="percentage-semicircle">
                                        <svg class="semicircle-chart" viewBox="0 0 100 60">
                                            <path class="semicircle-background" d="M 10 50 A 40 40 0 0 1 90 50"
                                                fill="none" stroke-width="8" />
                                            <path class="semicircle-progress" d="M 10 50 A 40 40 0 0 1 90 50"
                                                fill="none" stroke="#E44096" stroke-width="8" stroke-linecap="round"
                                                :stroke-dasharray="125.6"
                                                :stroke-dashoffset="(125.6 * (100 - parseInt(item.percentage))) / 100" />
                                            <text class="semicircle-percentage" x="52" y="50" text-anchor="middle"
                                                dy="0">
                                                {{ item.percentage }}
                                            </text>
                                        </svg>
                                        <div class="percentage-label">
                                            {{ $t("home.opportunity") }}
                                        </div>
                                    </div>
                                </div>
                                <div class="item-leverage-info">
                                    <div class="leverage-item">
                                        <span class="leverage-label">{{ $t("home.maxLeverage") || "最大杠杆倍数" }}:</span>
                                        <span class="leverage-value">{{ item.maxLeverage || "10X" }}</span>
                                    </div>
                                    <div class="leverage-item">
                                        <span class="leverage-label">{{ $t("home.maxReturn") || "最大回报" }}:</span>
                                        <span class="leverage-value">{{ item.maxReturn || "182%" }}</span>
                                    </div>
                                </div>
                                <div class="item-actions">
                                    <button class="action-btn yes-btn"
                                        @click="navigateToDetail(item, 'yes')">Yes</button>
                                    <button class="action-btn no-btn" @click="navigateToDetail(item, 'no')">No</button>
                                </div>
                                <div class="item-amount">
                                    <div class="amount-left">
                                        <div class="time-info" :class="{ urgent: item.isTimeUrgent }">
                                            <span v-if="item.isTimeUrgent" class="time-dot"
                                                aria-hidden="true"><em></em></span>
                                            <svg v-else class="time-icon" aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                                viewBox="0 0 12 12">
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
                                            <span class="participant-text">{{ item.participantCount.toLocaleString()
                                                }}</span>
                                        </div>
                                        <span class="voi-amount">VOI：${{ item.amount }}</span>
                                    </div>
                                    <svg t="1765591111184" class="icon-sc" :class="{ active: item.isFavorite }"
                                        viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                        p-id="5484" width="14" height="14" @click.stop="toggleFavorite(item)">
                                        <path
                                            d="M389.461333 85.333333l253.354667 0.021334c5.397333 0.042667 10.602667 0.128 15.616 0.256l14.506667 0.490666 13.482666 0.789334c43.306667 3.072 71.104 10.965333 99.733334 26.282666a197.738667 197.738667 0 0 1 82.005333 82.005334c15.317333 28.629333 23.210667 56.426667 26.282667 99.733333l0.789333 13.482667 0.490667 14.506666 0.149333 7.658667 0.128 16.213333v501.525334a85.333333 85.333333 0 0 1-123.498667 76.330666L518.186667 797.44l-3.2-1.557333-2.965334-1.322667-2.986666 1.322667-257.514667 128.725333A85.333333 85.333333 0 0 1 128 848.298667l0.021333-509.781334c0.042667-5.397333 0.128-10.602667 0.256-15.616l0.490667-14.506666 0.789333-13.482667c3.072-43.306667 10.965333-71.104 26.282667-99.733333a197.738667 197.738667 0 0 1 82.005333-82.005334c28.629333-15.317333 56.426667-23.210667 99.733334-26.282666l13.482666-0.789334 14.506667-0.490666 7.658667-0.149334 16.213333-0.128z m252.16 85.354667H382.378667l-13.184 0.170667-6.122667 0.149333-11.413333 0.426667-10.325334 0.64c-4.906667 0.384-9.493333 0.832-13.76 1.365333l-8.149333 1.173333c-11.712 1.92-21.12 4.650667-29.866667 8.32l-5.76 2.602667c-1.92 0.917333-3.797333 1.877333-5.674666 2.88a112.426667 112.426667 0 0 0-47.018667 47.018667 145.664 145.664 0 0 0-2.88 5.674666l-2.602667 5.76c-3.669333 8.746667-6.4 18.154667-8.32 29.866667l-1.173333 8.149333c-0.533333 4.266667-0.981333 8.832-1.344 13.76l-0.64 10.325334a514.133333 514.133333 0 0 0-0.256 5.546666l-0.341333 11.989334-0.170667 13.184L213.333333 848.277333l256.469334-128.170666c10.965333-5.312 18.112-7.850667 26.88-9.536a80.213333 80.213333 0 0 1 30.634666 0c9.856 1.898667 17.664 4.885333 31.189334 11.648L810.666667 848.298667l-0.021334-508.586667-0.170666-13.226667a709.973333 709.973333 0 0 0-0.149334-6.101333l-0.426666-11.413333-0.64-10.325334c-0.384-4.906667-0.832-9.493333-1.365334-13.76l-1.173333-8.149333a129.984 129.984 0 0 0-8.32-29.866667l-2.602667-5.76a145.664 145.664 0 0 0-2.88-5.674666 112.426667 112.426667 0 0 0-47.018666-47.018667 145.664 145.664 0 0 0-5.674667-2.88l-5.76-2.602667c-8.746667-3.669333-18.154667-6.4-29.866667-8.32l-8.149333-1.173333c-4.266667-0.533333-8.832-0.981333-13.76-1.344l-10.325333-0.64a514.133333 514.133333 0 0 0-5.546667-0.256l-11.989333-0.341333L641.642667 170.666667zM576 298.666667a42.666667 42.666667 0 0 1 3.2 85.226666L576 384h-128a42.666667 42.666667 0 0 1-3.2-85.226667L448 298.666667h128z"
                                            :fill="item.isFavorite ? '#CA4064' : '#909090'" p-id="5485"></path>
                                    </svg>
                                </div>
                            </div>

                            <!-- 小卡片 -->
                            <div v-else class="list-item small-item">
                                <div class="item-header">
                                    <img :src="item.avatar" :alt="$t('common.userAvatar')" class="user-avatar" />
                                    <div class="item-meta">
                                        <div class="item-title" @click="navigateToDetail(item)">{{ item.title }}</div>
                                    </div>
                                </div>
                                <div class="item-leverage-info">
                                    <div class="leverage-item">
                                        <span class="leverage-label">{{ $t("home.maxLeverage") || "最大杠杆倍数" }}:</span>
                                        <span class="leverage-value">{{ item.maxLeverage || "10X" }}</span>
                                    </div>
                                    <div class="leverage-item">
                                        <span class="leverage-label">{{ $t("home.maxReturn") || "最大回报" }}:</span>
                                        <span class="leverage-value">{{ item.maxReturn || "182%" }}</span>
                                    </div>
                                </div>
                                <div class="item-options">
                                    <div class="option-item" v-for="(opt, optIndex) in item.options" :key="optIndex">
                                        <div class="option-text">
                                            <span>{{ opt.text }}</span>
                                            <span>{{ item.percentage }}</span>
                                        </div>
                                        <div class="option-buttons">
                                            <button class="option-btn yes-btn"
                                                @click="navigateToDetail(item, 'yes')">Yes</button>
                                            <button class="option-btn no-btn"
                                                @click="navigateToDetail(item, 'no')">No</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="item-amount">
                                    <div class="amount-left">
                                        <div class="time-info" :class="{ urgent: item.isTimeUrgent }">
                                            <span v-if="item.isTimeUrgent" class="time-dot"
                                                aria-hidden="true"><em></em></span>
                                            <svg v-else class="time-icon" aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                                viewBox="0 0 12 12">
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
                                            <span class="participant-text">{{ item.participantCount.toLocaleString()
                                                }}</span>
                                        </div>
                                        <span class="voi-amount">VOI：${{ item.amount }}</span>
                                    </div>
                                    <svg t="1765591111184" class="icon-sc" :class="{ active: item.isFavorite }"
                                        viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                        p-id="5484" width="14" height="14" @click.stop="toggleFavorite(item)">
                                        <path
                                            d="M389.461333 85.333333l253.354667 0.021334c5.397333 0.042667 10.602667 0.128 15.616 0.256l14.506667 0.490666 13.482666 0.789334c43.306667 3.072 71.104 10.965333 99.733334 26.282666a197.738667 197.738667 0 0 1 82.005333 82.005334c15.317333 28.629333 23.210667 56.426667 26.282667 99.733333l0.789333 13.482667 0.490667 14.506666 0.149333 7.658667 0.128 16.213333v501.525334a85.333333 85.333333 0 0 1-123.498667 76.330666L518.186667 797.44l-3.2-1.557333-2.965334-1.322667-2.986666 1.322667-257.514667 128.725333A85.333333 85.333333 0 0 1 128 848.298667l0.021333-509.781334c0.042667-5.397333 0.128-10.602667 0.256-15.616l0.490667-14.506666 0.789333-13.482667c3.072-43.306667 10.965333-71.104 26.282667-99.733333a197.738667 197.738667 0 0 1 82.005333-82.005334c28.629333-15.317333 56.426667-23.210667 99.733334-26.282666l13.482666-0.789334 14.506667-0.490666 7.658667-0.149334 16.213333-0.128z m252.16 85.354667H382.378667l-13.184 0.170667-6.122667 0.149333-11.413333 0.426667-10.325334 0.64c-4.906667 0.384-9.493333 0.832-13.76 1.365333l-8.149333 1.173333c-11.712 1.92-21.12 4.650667-29.866667 8.32l-5.76 2.602667c-1.92 0.917333-3.797333 1.877333-5.674666 2.88a112.426667 112.426667 0 0 0-47.018667 47.018667 145.664 145.664 0 0 0-2.88 5.674666l-2.602667 5.76c-3.669333 8.746667-6.4 18.154667-8.32 29.866667l-1.173333 8.149333c-0.533333 4.266667-0.981333 8.832-1.344 13.76l-0.64 10.325334a514.133333 514.133333 0 0 0-0.256 5.546666l-0.341333 11.989334-0.170667 13.184L213.333333 848.277333l256.469334-128.170666c10.965333-5.312 18.112-7.850667 26.88-9.536a80.213333 80.213333 0 0 1 30.634666 0c9.856 1.898667 17.664 4.885333 31.189334 11.648L810.666667 848.298667l-0.021334-508.586667-0.170666-13.226667a709.973333 709.973333 0 0 0-0.149334-6.101333l-0.426666-11.413333-0.64-10.325334c-0.384-4.906667-0.832-9.493333-1.365334-13.76l-1.173333-8.149333a129.984 129.984 0 0 0-8.32-29.866667l-2.602667-5.76a145.664 145.664 0 0 0-2.88-5.674666 112.426667 112.426667 0 0 0-47.018666-47.018667 145.664 145.664 0 0 0-5.674667-2.88l-5.76-2.602667c-8.746667-3.669333-18.154667-6.4-29.866667-8.32l-8.149333-1.173333c-4.266667-0.533333-8.832-0.981333-13.76-1.344l-10.325333-0.64a514.133333 514.133333 0 0 0-5.546667-0.256l-11.989333-0.341333L641.642667 170.666667zM576 298.666667a42.666667 42.666667 0 0 1 3.2 85.226666L576 384h-128a42.666667 42.666667 0 0 1-3.2-85.226667L448 298.666667h128z"
                                            :fill="item.isFavorite ? '#CA4064' : '#909090'" p-id="5485"></path>
                                    </svg>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <NotificationModal v-model:visible="showNotice" :title="announcement?.title" :content="announcement?.content"
            :guid="announcement?.guid" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import NavBar2 from "@/components/navBar2.vue";
import { Avatar, ArrowDownBold } from "@element-plus/icons-vue";
import router from "@/router";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import bannerImg from "@/assets/images/banner.png";
import banner0Img from "@/assets/images/banner0.png";
import banner6Img from "@/assets/images/banner6.png";
import banner2Img from "@/assets/images/banner2.png";
import linghua1Img from "@/assets/images/linghua1.png";
import banner4Img from "@/assets/images/banner4.png";
import NotificationModal from '@/components/NotificationModal.vue';
import { tagButtons as rawTagButtons, cardList as rawCardList } from "./homeData";
import { getNoticeData } from "@/api/API";
import { getHomeBanner } from "@/api/APIEvent";
import { useAccount } from "@wagmi/vue";

// 获取用户地址
const { address } = useAccount();
// 获取当前语言环境
const savedLocale = localStorage.getItem('app-locale')
const currentLocale = savedLocale || navigator.language || 'en';

const { t } = useI18n();
const route = useRoute();
const isComingSoon = computed(() => import.meta.env.VITE_IS_COMING_SOON === "true");


const showNotice = ref(false);

// 公告数据
const announcement = ref();

// 获取公告数据
async function getNotice() {
    const response = await getNoticeData({ address: address.value, language: currentLocale });
    if (response?.data?.announcement) {
        announcement.value = response.data.announcement;
        showNotice.value = true;
    }
}

// 获取首页轮播图
async function getHomeBannerList() {
    // const response = await getHomeBanner({ language: currentLocale, limit: 4 });
    // console.log(response);
}


// Swiper 模块
const swiperModules = [Autoplay, Pagination];

// 轮播图数据
const bannerList = ref([
    {
        img: bannerImg,
        href: "https://web.chooseme.vip/",
    },
    {
        img: banner6Img,
        href: "",
    },
    {
        img: banner2Img,
        href: "https://web.chooseme.vip/",
    },
    {
        img: linghua1Img,
        href: "https://web.chooseme.vip/",
    },
    {
        img: banner4Img,
        href: "https://web.chooseme.vip/",
    },

]);

function goHref(item) {
    if (item.href.includes("https")) {
        window.open(item.href, "_blank");
    } else {
        router.push(item.href);
    }
}

// 标签按钮数据
const tagButtons = ref(rawTagButtons);

// 当前激活的标签
const activeTag = ref("all");

// 移动端筛选面板
const showFilterPanel = ref(false);
const sortOptions = [
    { value: "latest", label: "最新" },
    { value: "hot", label: "最热" },
];
const frequencyOptions = [
    { value: "all", label: "全部频率" },
    { value: "daily", label: "每日" },
];
const selectedSort = ref("latest");
const selectedFrequency = ref("all");
const currentSortLabel = computed(() => sortOptions.find((opt) => opt.value === selectedSort.value)?.label || "最新");
const currentFrequencyLabel = computed(() => frequencyOptions.find((opt) => opt.value === selectedFrequency.value)?.label || "全部频率");

// 根据路由查询参数判断是否显示日期筛选模块（仅电子竞技选中时显示）
const showDateFilter = computed(() => route.query.nav === "esports");

// 日期筛选数据
const dateFilterList = ref([
    { key: "mon", weekKey: "mon", date: "01.01", count: 0 },
    { key: "tue", weekKey: "tue", date: "01.02", count: 6 },
    { key: "wed", weekKey: "wed", date: "01.03", count: 0 },
    { key: "thu", weekKey: "thu", date: "01.04", count: 0 },
    { key: "fri", weekKey: "fri", date: "01.05", count: 0 },
    { key: "sat", weekKey: "sat", date: "01.06", count: 0 },
]);

const activeDateKey = ref("all");
const totalDateCount = computed(() =>
    dateFilterList.value.reduce((sum, item) => sum + (item.count || 0), 0),
);

const handleDateClick = (key) => {
    activeDateKey.value = key;
    // TODO: 根据日期筛选列表数据
};

// 合并后的卡片列表，通过 item.cardType === 'large' | 'small' 控制展示大卡片或小卡片
const cardList = ref(rawCardList);

// 跳转到详情页面
const navigateToDetail = (item, choice) => {
    // 如果当前通过导航条处于“加密货币”场景，则进入加密货币详情页
    if (route.query.nav === 'crypto') {
        router.push({
            path: '/bitcoin-up-down',
            query: {
                id: item.id || item.title,
            },
        });
        return;
    }

    // 默认行为：跳转通用详情页
    router.push({
        path: "/detail-h5",
        query: {
            choice,
            id: item.id || item.title,
        },
    });
};

// 处理标签点击
const handleTagClick = (tagValue) => {
    activeTag.value = tagValue;
};


// 处理筛选按钮点击
const handleFilter = () => {
    showFilterPanel.value = !showFilterPanel.value;
};

// 处理收藏点击
const handleBookmark = () => {
    // 这里可以实现收藏功能
};

// 切换收藏状态
const toggleFavorite = (item) => {
    item.isFavorite = !item.isFavorite;
};

// 页面数据初始化
onMounted(async () => {
    getNotice();
    getHomeBannerList();
});
</script>

<style scoped lang="scss">
.icon-sc {
    cursor: pointer;
}

.theme-dark {
    .list-item {
        border: 1px solid #383838 !important;
    }
}

$gradient-mask-right: linear-gradient(to right,
        transparent 0%,
        rgba(255, 255, 255, 0.3) 30%,
        rgba(255, 255, 255, 0.7) 70%,
        var(--bg-page-h5, #1a1a1a) 100%);

.theme-dark {
    $gradient-mask-right: linear-gradient(to right,
            transparent 0%,
            rgba(0, 0, 0, 0.3) 30%,
            rgba(0, 0, 0, 0.7) 70%,
            var(--bg-page-h5, #1a1a1a) 100%);

    .gradient-mask-right {
        background: $gradient-mask-right;
    }
}

.gradient-mask-right {
    right: -1px;
    display: block;
    background: $gradient-mask-right;
}

.home-page {
    min-height: 100vh;
    padding-top: 60px;
    background-color: var(--bg-page-h5, #ffffff);
    color: var(--text-color, #1a1a1a);
    transition:
        background-color 0.3s ease,
        color 0.3s ease;

    .banner-section {
        display: block;
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
                        border-radius: 12px;
                    }
                }

                // 轮播图指示点样式：长方形灰白主题
                :deep(.swiper-pagination) {
                    bottom: 6px;

                    .swiper-pagination-bullet {
                        width: 6px;
                        height: 4px;
                        border-radius: 999px;
                        margin: 0 3px;
                        background: rgba(200, 200, 210, 0.5);
                        opacity: 1;
                    }

                    .swiper-pagination-bullet-active {
                        width: 16px;
                        height: 4px;
                        border-radius: 999px;
                        background: linear-gradient(90deg, #f7f7f8 0%, #e0e2e8 100%);
                    }
                }
            }
        }
    }

    .main-content {
        position: relative;
        width: 100%;
        margin: 0;
        padding: 12px 12px 32px;
        box-sizing: border-box;

        .content-wrapper {
            width: 100%;
        }

        .filter-section {
            margin-bottom: 12px;

            .filter-container {
                display: flex;
                gap: 6px;
                padding: 0;
                align-items: center;

                .tag-scroll-wrapper {
                    position: relative;
                    width: 80%;
                    flex-shrink: 0;
                    overflow: hidden;

                    .tag-scroll-container {
                        display: flex;
                        padding-right: 30px;
                        gap: 5px;
                        flex-wrap: nowrap;
                        white-space: nowrap;
                        overflow-x: auto;
                        overflow-y: hidden;
                        scroll-behavior: smooth;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none;
                        -ms-overflow-style: none;

                        &::-webkit-scrollbar {
                            display: none;
                        }

                        .tag-btn {
                            padding: 6px 12px;
                            font-size: 14px;
                            border: 1px solid var(--border-color, #e0e0e0);
                            border-radius: 5px;
                            color: var(--text-gray, #666666);
                            background: var(--bg-page, #f5f5f5);
                            cursor: pointer;
                            transition: all 0.2s;
                            white-space: nowrap;
                            flex-shrink: 0;
                            font-weight: 400;

                            &.active {
                                color: var(--text-color, #1a1a1a);
                            }
                        }

                        &.is-esports-search {
                            padding-right: 0;
                            gap: 0;
                            overflow: hidden;
                        }

                        .esports-search {
                            width: 100%;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 10px 12px;
                            border-radius: 10px;
                            border: 1px solid var(--border-color);
                            background: var(--bg-page);
                            box-sizing: border-box;
                            cursor: text;

                            .esports-search-icon {
                                width: 18px;
                                height: 18px;
                                flex-shrink: 0;
                                color: var(--text-dark-gray);
                            }

                            .esports-search-input {
                                flex: 1;
                                min-width: 0;
                                border: none;
                                outline: none;
                                background: transparent;
                                color: var(--bg-opposite);
                                font-size: 16px;
                                line-height: 1.2;
                                padding: 0;

                                &::placeholder {
                                    color: var(--text-dark-gray);
                                }
                            }
                        }
                    }

                    .gradient-mask {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: 40px;
                        pointer-events: none;
                        z-index: 1;
                        margin-right: -2px;
                    }
                }

                .action-buttons {
                    display: flex;
                    margin-left: auto;
                    gap: 8px;
                    align-items: center;
                    flex-shrink: 0;

                    .action-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 28px;
                        height: 28px;
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
            }

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
                    width: 100%;
                }

                .filter-dropdown {
                    display: block;
                    width: 100%;
                }

                .filter-select-btn {
                    padding: 10px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 999px;
                    font-size: 14px;
                    font-weight: 400;
                    color: var(--bg-opposite);
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: space-between;
                    min-height: 40px;
                    box-sizing: border-box;
                    margin-right: 10px;


                    .filter-arrow {
                        margin-left: 12px;
                        font-size: 14px;
                        color: var(--bg-opposite);
                        transition: transform 0.2s;
                        flex-shrink: 0;
                    }
                }
            }
        }

        // 日期筛选模块
        .date-filter-section {
            margin: 8px 0 14px;
            display: flex;
            align-items: stretch;
            gap: 4px;

            .date-card {
                padding: 6px 4px 8px;
                box-sizing: border-box;
                background: var(--bg-page);
                border-radius: 0;
                border-top: 3px solid var(--border-color);
                text-align: center;
                color: var(--text-dark-gray);
                font-family:
                    PingFang SC,
                    PingFang SC;
                flex-shrink: 0;

                .date-title {
                    font-size: 13px;
                    margin-bottom: 4px;
                }

                .date-subtitle {
                    font-size: 11px;
                    margin-bottom: 2px;
                }

                .date-count {
                    font-size: 11px;
                }

                &.active {
                    border-top-color: var(--text-color-y);
                    color: var(--bg-opposite);
                }
            }

            .fixed-all {
                flex-shrink: 0;
            }

            .date-scroll-wrapper {
                flex: 1;
                overflow-x: auto;
                overflow-y: hidden;
            }

            .date-scroll {
                display: flex;
                gap: 4px;
                min-width: max-content;
            }
        }

        // 移动端隐藏 PC 顶部栏
        .pc-filter-section {
            display: none;
        }

        .main-list-section {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .card-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .list-item {
                overflow: hidden;
                border-radius: 12px;
                background: var(--bg-card, #ffffff);
                border: 1px solid #f4f4f4;
                box-sizing: border-box;
                transition: all 0.2s;

                .item-header {
                    display: flex;
                    margin-bottom: 10px;
                    align-items: center;
                    gap: 10px;
                    padding: 16px 16px 0;
                    box-sizing: border-box;

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

                        .semicircle-percentage {
                            font-size: 24px;
                            font-weight: 600;
                            fill: var(--text-color, #333);
                        }

                        .percentage-label {
                            font-size: 9px;
                            color: var(--text-dark-gray, #999);
                            margin-top: 0;
                        }
                    }
                }

                .item-leverage-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
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
                    gap: 10px;
                    margin-bottom: 12px;
                    padding: 0 16px;
                    box-sizing: border-box;

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
                            background: var(--button-bg-y, #2ebe69);
                            color: var(--text-color-y, #2ebe69);

                            &.active {
                                background: var(--button-bg-y, #2ebe69);
                            }
                        }

                        &.no-btn {
                            background: var(--button-bg-n, #e44096);
                            color: var(--text-color-n, #e44096);

                            &.active {
                                background: rgba(228, 64, 150, 1);
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
                    gap: 6px;
                    padding: 7px 16px;
                    box-sizing: border-box;
                    background: var(--bg-page, #f5f5f5);
                    border-radius: 0 0 12px 12px;

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

                                    em {
                                        // 大卡片左下角呼吸灯效果
                                        animation: time-dot-breath 1.4s ease-in-out infinite;
                                    }
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
                            font-family:
                                PingFang SC,
                                PingFang SC;
                            font-weight: 400;
                            font-size: 12px;
                            color: var(--text-dark-gray, #999);
                        }
                    }

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
                            fill: #ca4064;
                        }
                    }
                }

                // 选项列表样式（右侧小卡片）
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

                // 选项按钮区域样式
                .option-buttons {
                    display: flex;
                    gap: 8px;
                }

                .option-btn {
                    padding: 4px 12px;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;

                    &.yes-btn {
                        color: var(--text-color-y, #2ebe69);
                        background: var(--button-bg-y, #2ebe69);
                    }

                    &.no-btn {
                        color: var(--text-color-n, #e44096);
                        background: var(--button-bg-n, #e44096);
                    }
                }
            }
        }

        @keyframes time-dot-breath {
            0% {
                transform: scale(0.9);
                box-shadow: 0 0 0 0 rgba(246, 70, 93, 0.8);
            }

            50% {
                transform: scale(1.3);
                box-shadow: 0 0 0 8px rgba(246, 70, 93, 0);
            }

            100% {
                transform: scale(0.9);
                box-shadow: 0 0 0 0 rgba(246, 70, 93, 0);
            }
        }
    }
}

/* 功能暂不开放覆盖层 */
.coming-soon-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    padding-top: 100px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(1px);
    z-index: 90;
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

.filter-panel-enter-active,
.filter-panel-leave-active {
    transition: all 0.3s ease;
}

.filter-panel-enter-from,
.filter-panel-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
