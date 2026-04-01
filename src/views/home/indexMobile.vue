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
                            <div class="tag-scroll-container"
                                :class="{ 'is-esports-search': (!ecosystemList || ecosystemList.length === 0) }">
                                <!-- 当二级分类列表为空时，展示搜索框 -->
                                <div v-if="!ecosystemList || ecosystemList.length === 0" class="esports-search">
                                    <svg class="esports-search-icon" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <input class="esports-search-input" type="text" placeholder="Search"
                                        v-model="searchQuery" @input="handleSearchInput" />
                                </div>
                                <template v-else>
                                    <!-- 二级分类不为空时，只展示分类按钮 -->
                                    <button v-for="tag in ecosystemList" :key="tag.value" class="tag-btn"
                                        :class="{ active: activeTag === tag.value }" @click="handleTagClick(tag.value)">
                                        {{ tag.label }}
                                    </button>
                                </template>
                            </div>
                            <!-- 右侧渐变遮罩 -->
                            <div class="gradient-mask gradient-mask-right"
                                v-if="ecosystemList && ecosystemList.length > 0"></div>
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
                            <div class="action-btn bookmark-btn" :class="{ active: activeTag === 'favorite' }"
                                @click="handleBookmark">
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
                            <div class="filter-dropdowns-row">
                                <!-- 排序按钮 -->
                                <div class="filter-select-wrapper">
                                    <button class="filter-select-btn" @click.stop="toggleSortDropdown">
                                        <div class="filter-label">
                                            <span>{{ $t('home.sortBy') || 'Sort' }}:</span>
                                            <span class="label-value">{{ currentSortLabel }}</span>
                                        </div>
                                        <el-icon class="filter-arrow" :class="{ rotate: showSortList }">
                                            <ArrowDownBold />
                                        </el-icon>
                                    </button>
                                    <div v-if="showSortList" class="custom-dropdown-list">
                                        <div v-for="opt in sortOptions" :key="opt.value" class="dropdown-item"
                                            :class="{ active: selectedSort === opt.value }"
                                            @click="handleSortChange(opt.value)">
                                            {{ opt.label }}
                                        </div>
                                    </div>
                                </div>
                                <!-- 频率按钮 -->
                                <div class="filter-select-wrapper">
                                    <button class="filter-select-btn" @click.stop="toggleFrequencyDropdown">
                                        <div class="filter-label">
                                            <span>{{ $t('home.frequency') || 'Freq' }}:</span>
                                            <span class="label-value">{{ currentFrequencyLabel }}</span>
                                        </div>
                                        <el-icon class="filter-arrow" :class="{ rotate: showFrequencyList }">
                                            <ArrowDownBold />
                                        </el-icon>
                                    </button>
                                    <div v-if="showFrequencyList" class="custom-dropdown-list">
                                        <div v-for="opt in frequencyOptions" :key="opt.value" class="dropdown-item"
                                            :class="{ active: selectedFrequency === opt.value }"
                                            @click="handleFrequencyChange(opt.value)">
                                            {{ opt.label }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>

                <!-- 列表：根据 item.cardType 展示大卡片或小卡片 -->
                <div class="main-list-section">
                    <!-- 列表为空 -->
                    <div v-if="!cardList.length" class="list-empty">
                        <p class="list-empty-text">{{ $t('home.listEmpty') || '暂无事件' }}</p>
                    </div>
                    <div v-else class="card-list">
                        <template v-for="(item, index) in cardList" :key="'card-' + index">
                            <!-- 新用户包赔：独立列表卡片 -->
                            <div v-if="isNewUserEventsCategory" class="new-user-list-item">
                                <div class="new-user-header" @click="navigateToDetail(item)">
                                    <img :src="item.avatar" :alt="$t('common.userAvatar')" class="new-user-avatar"
                                        @error="(e) => (e.target.src = fallbackListImg)" />
                                    <div class="new-user-title">{{ item.title }}</div>
                                    <div class="new-user-badge">
                                        <svg class="new-user-badge-icon" xmlns="http://www.w3.org/2000/svg" width="12"
                                            height="12" viewBox="0 0 12 12">
                                            <path
                                                d="M113.124,109.17v2.211h4.105a.474.474,0,0,0,.474-.474v-1.263a.474.474,0,0,0-.474-.474Zm-.947,2.211V109.17h-4.105a.474.474,0,0,0-.474.474v1.263a.474.474,0,0,0,.474.474Zm0,6.316v-5.368h-3.947v4.895a.474.474,0,0,0,.474.474Zm.947,0H116.6a.474.474,0,0,0,.474-.474v-4.895h-3.947Zm1.658-9.474h2.448a1.421,1.421,0,0,1,1.421,1.421v1.263a1.42,1.42,0,0,1-.632,1.182v5.134a1.421,1.421,0,0,1-1.421,1.421H108.7a1.421,1.421,0,0,1-1.421-1.421v-5.134a1.42,1.42,0,0,1-.632-1.182v-1.263a1.421,1.421,0,0,1,1.421-1.421h2.448l-1.255-.69a.474.474,0,0,1,.457-.83l2.764,1.52h.331l2.764-1.52a.474.474,0,1,1,.457.83l-1.255.69Z"
                                                transform="translate(-106.65 -106.644)" />
                                        </svg>
                                        <span>50U包赔</span>
                                    </div>
                                </div>
                                <div class="new-user-meta">
                                    <div class="meta-item">
                                        <span class="meta-label">{{ $t("home.maxLeverage") || "最大杠杆倍数" }}:</span>
                                        <span class="meta-value">{{ item.maxLeverage || "10X" }}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="meta-label">{{ $t("home.maxReturn") || "最大回报" }}:</span>
                                        <span class="meta-value">{{ item.maxReturn || "182%" }}</span>
                                    </div>
                                </div>
                                <div class="new-user-actions">
                                    <button class="new-user-action-btn"
                                        @click="navigateToDetail(item, 'yes')">Yes</button>
                                    <button class="new-user-action-btn"
                                        @click="navigateToDetail(item, 'no')">No</button>
                                </div>
                                <div class="new-user-footer">
                                    <div class="amount-left">
                                        <div class="time-info">
                                            <span class="time-dot" aria-hidden="true"><em></em></span>
                                            <span class="time-text">{{ getCountdown(item.closeTime) }}</span>
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

                            <!-- 大卡片 -->
                            <div v-else-if="item.cardType === 'large'" class="list-item large-item">
                                <div class="item-header">
                                    <img :src="item.avatar" :alt="$t('common.userAvatar')" class="user-avatar"
                                        @error="(e) => (e.target.src = fallbackListImg)" />
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
                                            <span class="time-text">{{ getCountdown(item.closeTime) }}</span>
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
                                    <img :src="item.avatar" :alt="$t('common.userAvatar')" class="user-avatar"
                                        @error="(e) => (e.target.src = fallbackListImg)" />
                                    <div class="item-meta">
                                        <div class="item-title" @click="handleTitleClick(item)">{{ item.title }}</div>
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
                                <div class="item-options" :class="{ 'scrollable-options': item.options.length > 3 }"
                                    :ref="(el) => setOptionsContainerRef(item.id, el)"
                                    @scroll.passive="handleOptionsScroll(item, $event)">
                                    <div class="option-item" v-for="(opt, optIndex) in item.options" :key="optIndex"
                                        :class="{ 'is-focused': isFocusedOption(item, optIndex) }"
                                        @click="handleOptionRowClick(item, opt)">
                                        <div class="option-text">
                                            <span>{{ opt.text }}</span>
                                            <span>{{ item.percentage }}</span>
                                        </div>
                                        <div class="option-buttons">
                                            <button class="option-btn yes-btn"
                                                @click.stop="navigateToDetail(item, 'yes', opt.subEventGuid)">Yes</button>
                                            <button class="option-btn no-btn"
                                                @click.stop="navigateToDetail(item, 'no', opt.subEventGuid)">No</button>
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
                                            <span class="time-text">{{ getCountdown(item.closeTime) }}</span>
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
                        <!-- 上拉加载：触底哨兵 + 底部状态 -->
                        <div ref="loadMoreSentinel" class="load-more-sentinel" aria-hidden="true"></div>
                        <div class="load-more-footer">
                            <span v-if="loadingMore" class="load-more-text">{{ $t('home.loadingMore') || '加载中...'
                            }}</span>
                            <span v-else-if="cardList.length && !hasMore" class="load-more-text">{{ $t('home.noMore') ||
                                '没有更多了'
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <NotificationModal v-model:visible="showNotice" :title="announcement?.title" :content="announcement?.content"
            :guid="announcement?.guid" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import NavBar2 from "@/components/navBar2.vue";
import { Avatar, ArrowDownBold } from "@element-plus/icons-vue";
import router from "@/router";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import fallbackListImg from "@/assets/icon/LP1.png";
import NotificationModal from '@/components/NotificationModal.vue';
import { getNoticeData } from "@/api/API";
import { getHomeBanner, getEcosystemList, getCategoryList, getEventList, getFavoriteList, toggleFavoriteEvent, getPeriodList } from "@/api/APIEvent";
import { useAccount } from "@wagmi/vue";
import { ElMessage } from 'element-plus';

// 获取用户地址
const { address } = useAccount();
// 获取当前语言环境
const currentLocale = localStorage.getItem('app-locale') || navigator.language || 'en';
const { t } = useI18n();
const route = useRoute();
const isComingSoon = computed(() => import.meta.env.VITE_IS_COMING_SOON === "true");
const language = currentLocale.split('-')[0];

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
// 获取分类列表数据
const categoryList = ref([]);
async function getCategoryListData() {
    const response = await getCategoryList({ language_label: language });
    const data = response?.data?.data?.categories || [];
    console.log("分类列表数据：", data);
    categoryList.value = [...data]
}
// 获取生态列表（用于后续标签筛选）通过分类ID查询生态列表
const ecosystemList = ref([]);
async function getEcosystemListData(categoryId) {
    if (!categoryId) {
        ecosystemList.value = [];
        return;
    }
    const response = await getEcosystemList({ language_label: language, category_guid: categoryId });
    const data = response?.data?.data?.ecosystems || [];
    console.log("生态列表数据：", data);
    ecosystemList.value = data.map(item => ({
        label: item.name,
        value: item.ecosystem_guid
    }));
}

// 监听URL category_id变化，获取对应分类数据（如果需要）
watch(
    () => route.query,
    (data) => {
        const newCategoryId = data.category_guid;
        getEcosystemListData(newCategoryId);
    },
    { immediate: true },
);

// 获取首页轮播图
async function getHomeBannerList() {
    try {
        const response = await getHomeBanner({ language: language, limit: 10 });
        const list = response?.data?.data?.banners || [];
        bannerList.value = list
            .map((item) => ({
                img: item?.logo || '',
                href: item?.link || '',
            }))
            .filter((item) => item.img);
    } catch (error) {
        console.error('Fetch banner list failed', error);
        bannerList.value = [];
    }
}


// Swiper 模块
const swiperModules = [Autoplay, Pagination];

// 轮播图数据
const bannerList = ref([]);

function goHref(item) {
    if (!item?.href) return;
    if (item.href.includes("https")) {
        window.open(item.href, "_blank");
    } else {
        router.push(item.href);
    }
}

// 当前激活的标签
const activeTag = ref("all");

// 移动端筛选面板
const showFilterPanel = ref(false);
const sortOptions = computed(() => [
    // 后端 sort_by 仅支持 string：open_time / trade_volume；“全部”则不传 sort_by
    { value: "all", label: t('home.sortAll') || "全部" },
    { value: "open_time", label: t('home.sortOpenTime') || "开盘时间" },
    { value: "trade_volume", label: t('home.sortTradeVolume') || "交易量" },
]);
// 频率选项：动态从接口加载，value 为 event_period_guid 或 'all'
const frequencyOptions = ref([
    { value: "all", label: t('home.allFrequency') || "全部频率" },
]);

// 拉取时间段列表
const fetchPeriodList = async (categoryGuid) => {
    try {
        const params = { language_label: language };
        if (categoryGuid) params.category_guid = categoryGuid;
        const res = await getPeriodList(params);
        const periods = res?.data?.data?.event_periods || [];
        frequencyOptions.value = [
            { value: "all", label: t('home.allFrequency') || "全部频率" },
            ...periods.map(p => ({ value: p.event_period_guid, label: p.name })),
        ];
    } catch (err) {
        console.error('Fetch period list failed', err);
    }
};
const selectedSort = ref("all");
const selectedFrequency = ref("all");
const searchQuery = ref("");
const showSortList = ref(false);
const showFrequencyList = ref(false);

// 监听 category_guid 变化，重置所有筛选条件并重新拉取时间段列表
watch(
    () => route.query.category_guid,
    (categoryGuid, oldGuid) => {
        // 首次加载（oldGuid 为 undefined）不重置，避免覆盖用户已有状态
        if (oldGuid !== undefined) {
            selectedFrequency.value = 'all';
            selectedSort.value = 'all';
            searchQuery.value = '';
            activeTag.value = 'all';
            showFilterPanel.value = false;
            showSortList.value = false;
            showFrequencyList.value = false;
        }
        fetchPeriodList(categoryGuid);
    },
    { immediate: true },
);

const toggleSortDropdown = () => {
    showSortList.value = !showSortList.value;
    showFrequencyList.value = false;
};

const toggleFrequencyDropdown = () => {
    showFrequencyList.value = !showFrequencyList.value;
    showSortList.value = false;
};

const currentSortLabel = computed(() => sortOptions.value.find((opt) => opt.value === selectedSort.value)?.label || (t('home.sortAll') || "全部"));
const currentFrequencyLabel = computed(() => frequencyOptions.value.find((opt) => opt.value === selectedFrequency.value)?.label || "全部频率");

// 事件列表：通过 item.cardType === 'large' | 'small' 控制展示大卡片或小卡片
const cardList = ref([]);
const eventPage = ref(1);
const eventTotalPages = ref(1);
const loadingMore = ref(false);
const optionsContainerMap = ref({});
const optionsFocusStartMap = ref({});
const PAGE_SIZE = 20;
const hasMore = computed(() => eventPage.value <= eventTotalPages.value);
const isNewUserEventsCategory = computed(
    () => String(route.query.nav || '').toUpperCase() === 'NEW_USER_EVENTS'
);

const getOptionsStep = (container) => {
    if (!container) return 28;
    const items = container.querySelectorAll('.option-item');
    if (items.length >= 2) {
        const diff = items[1].offsetTop - items[0].offsetTop;
        return diff > 0 ? diff : 28;
    }
    if (items.length === 1) return items[0].offsetHeight + 8;
    return 28;
};

const updateFocusedOptions = (item, container) => {
    if (!item?.id || !container) return;
    if (!Array.isArray(item.options) || item.options.length <= 3) {
        optionsFocusStartMap.value[item.id] = 0;
        return;
    }
    const step = getOptionsStep(container);
    const maxStart = Math.max((item.options?.length || 0) - 2, 0);
    const start = Math.min(Math.max(Math.round(container.scrollTop / step), 0), maxStart);
    optionsFocusStartMap.value[item.id] = start;
};

const setOptionsContainerRef = (itemId, el) => {
    if (!itemId) return;
    if (el) {
        optionsContainerMap.value[itemId] = el;
        const item = cardList.value.find((card) => card.id === itemId);
        if (item) nextTick(() => updateFocusedOptions(item, el));
        return;
    }
    delete optionsContainerMap.value[itemId];
};

const handleOptionsScroll = (item, event) => {
    const container = event?.target;
    if (!container || !item) return;
    updateFocusedOptions(item, container);
};

const isFocusedOption = (item, optionIndex) => {
    if (!item?.isCrypto || item?.cardType !== 'small' || (item?.options?.length || 0) <= 3) return false;
    const start = optionsFocusStartMap.value[item.id] ?? 0;
    return optionIndex === start || optionIndex === start + 1;
};

// 根据路由 nav 映射事件类型
const getEventTypeFromNav = (nav) => {
    // 默认使用趋势分类：当路由未携带 nav 时按 trends 处理
    if (!nav) return 0;
    if (nav === 'trends') return 0;
    if (nav === 'breaking') return 1;
    if (nav === 'news') return 2;
    return undefined;
};

// 将接口返回的事件结构映射到页面卡片结构
const mapEventToCard = (e) => {
    const subEvents = Array.isArray(e.sub_events) ? e.sub_events : [];
    const eventCode = String(e.code || '').toUpperCase();
    const categoryCode = String(e.category_code || '').toUpperCase();
    const isCrypto = eventCode === 'CRYPTO' || categoryCode === 'CRYPTO';

    const volumeNum = Number(e.trade_volume);
    const amount =
        Number.isFinite(volumeNum) && !Number.isNaN(volumeNum)
            ? volumeNum.toFixed(2)
            : '0.00';

    return {
        id: e.event_guid,
        code: (e.code || '').toUpperCase(),
        category_guid: e.category_guid || '',
        // 是否体育事件（用于跳转体育详情页）
        isSports: !!e.is_sports,
        // 加密货币列表：子事件=1 大卡，子事件>1 小卡
        // 其他列表：沿用直播中为大卡
        isCrypto,
        cardType: subEvents.length > 1 ? 'small' : 'large',
        avatar: e.logo || '',
        title: e.title || '',
        // 暂无胜率字段，用占位字符串保持布局
        percentage: `${subEvents[0]?.directions?.filter((x) => x.outcome === 'YES')[0]?.chance || '--'}%`,
        maxLeverage: '--',
        maxReturn: '-- %',
        closeTime: e.close_time || '', // "2026-01-25 14:00:00" 用于倒计时
        isTimeUrgent: e.is_live === 1,
        participantCount: 0,
        amount,
        // 初始化渲染：以接口字段 is_favorited 判断收藏状态
        isFavorite: !!e.is_favorited,
        options: subEvents.map((sub) => ({
            text: sub.title || '',
            subEventGuid: sub.sub_event_guid || '',
            percentage: `${sub?.directions?.filter((x) => x.outcome === 'YES')[0]?.chance || '--'}%`,
        })),
    };
};

// 当前时间戳，每秒更新一次，用于倒计时
const now = ref(Date.now());
let countdownTimer = null;

// 根据 close_time 计算距结束的倒计时（时分秒），已过期显示 --
const getCountdown = (closeTime) => {
    if (!closeTime) return '--';
    const end = new Date(closeTime.replace(' ', 'T'));
    const diff = end.getTime() - now.value;
    if (diff <= 0) return '--';
    const totalSec = Math.floor(diff / 1000);
    // 倒计时超过 72h 时，把前面计算为“天”
    const showDays = totalSec > 72 * 3600;
    if (showDays) {
        const d = Math.floor(totalSec / (24 * 3600));
        const remainSec = totalSec % (24 * 3600);
        const h = Math.floor(remainSec / 3600);
        const m = Math.floor((remainSec % 3600) / 60);
        const s = remainSec % 60;
        return `${t('datePicker.days', { n: d })} ${[h, m, s].map((x) => String(x).padStart(2, '0')).join(':')}`;
    }
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [h, m, s].map((x) => String(x).padStart(2, '0')).join(':');
};

// 获取事件列表，append=true 时追加分页数据
const fetchEventList = async (append = false) => {
    if (!append) {
        eventPage.value = 1;
        cardList.value = [];
    }
    if (append && loadingMore.value) return;
    if (append && eventPage.value > eventTotalPages.value) return;

    if (append) loadingMore.value = true;
    try {
        const query = route.query || {};
        const params = {
            language_label: language,
            include_sub_events: true,
            page: eventPage.value,
            page_size: PAGE_SIZE,
            // 获取事件列表接口需要传用户地址（未连接钱包时传空串）
            user_address: address.value || '',
        };
        if (query.category_guid) params.category_guid = query.category_guid;
        if (activeTag.value && activeTag.value !== 'all' && activeTag.value !== 'favorite') params.ecosystem_guid = activeTag.value;
        if (searchQuery.value) params.title = searchQuery.value;
        if (selectedFrequency.value && selectedFrequency.value !== 'all') params.event_period_guid = selectedFrequency.value;
        if (selectedSort.value && selectedSort.value !== 'all') params.sort_by = selectedSort.value;

        const eventType = getEventTypeFromNav(query.nav);
        if (eventType !== undefined) params.event_type = eventType;

        let res;
        if (activeTag.value === 'favorite') {
            res = await getFavoriteList(params);
        } else {
            res = await getEventList(params);
        }

        const data = res?.data?.data || {};
        const list = data.events || [];
        const totalPages = data.total_pages ?? 1;

        eventTotalPages.value = totalPages;
        const mapped = list.map(mapEventToCard);
        if (append) {
            cardList.value = cardList.value.concat(mapped);
        } else {
            cardList.value = mapped;
        }
        eventPage.value += 1;
    } catch (err) {
        console.error('Fetch event list failed', err);
        if (!append) cardList.value = [];
    } finally {
        loadingMore.value = false;
    }
};

// 上拉加载：触底时加载下一页
const loadMoreSentinel = ref(null);
let loadMoreObserver = null;

// 跳转到详情页面
const navigateToDetail = (item, choice, subEventGuid) => {
    const fallbackSubEventGuid = item?.options?.[0]?.subEventGuid || '';
    const finalSubEventGuid = subEventGuid || fallbackSubEventGuid;
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

    // 2. 进入单事件详情页
    if (item?.options?.length === 1) {
        const cryptoQuery = {
            event_guid: item.id,
            ...(finalSubEventGuid ? { sub_event_guid: finalSubEventGuid } : {}),
            ...(isNewUserEventsCategory.value ? { from_new_user_compensation: '1' } : {}),
        };
        router.push({
            path: '/bitcoin-up-down',
            query: cryptoQuery,
        });
        return;
    }

    // 3. 默认行为：跳转通用多事件详情页
    router.push({
        path: "/detail-h5",
        query: {
            choice,
            id: item.id,
            ...(finalSubEventGuid ? { sub_event_guid: finalSubEventGuid } : {}),
        },
    });
};

const handleTitleClick = (item) => {
    // 加密货币小卡仅允许点击子事件按钮跳转
    // if (item?.isCrypto && item?.cardType === 'small') return;
    navigateToDetail(item);
};

const handleOptionRowClick = (item, opt) => {
    // 加密货币小卡仅允许点击子事件按钮跳转
    // if (item?.isCrypto && item?.cardType === 'small') return;
    navigateToDetail(item, undefined, opt?.subEventGuid);
};

// 处理标签点击
const handleTagClick = (tagValue) => {
    activeTag.value = tagValue;
};

// 搜索防抖
let searchTimer = null;
const handleSearchInput = () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        fetchEventList();
    }, 500);
};

// 处理频率选择 (日期筛选面板中的频率)
const handleFrequencyChange = (value) => {
    selectedFrequency.value = value;
    showFrequencyList.value = false;
    fetchEventList();
};

// 处理排序选择
const handleSortChange = (value) => {
    selectedSort.value = value;
    showSortList.value = false;
    fetchEventList();
};

// 处理筛选按钮点击
const handleFilter = () => {
    showFilterPanel.value = !showFilterPanel.value;
    if (!showFilterPanel.value) {
        showSortList.value = false;
        showFrequencyList.value = false;
    }
};

// 处理收藏按钮点击（筛选收藏列表）
const handleBookmark = () => {
    if (!address.value) {
        ElMessage.warning(t('pleaseConnectWallet') || 'Please connect wallet');
        return;
    }
    if (activeTag.value === 'favorite') {
        activeTag.value = 'all';
    } else {
        activeTag.value = 'favorite';
    }
};

// 切换收藏状态
const toggleFavorite = async (item) => {
    if (!address.value) {
        ElMessage.warning(t('pleaseConnectWallet') || 'Please connect wallet');
        return;
    }

    try {
        const res = await toggleFavoriteEvent({
            user_address: address.value || '',
            event_guid: item.id
        });

        // request 封装通常返回 axios response（在 data 上），这里兼容两种返回结构
        const payload = res?.data ?? res;
        const code = payload?.code;
        if (code === 200 || code === 2000 || code === 0) {
            item.isFavorite = !item.isFavorite;
            // 同步更新接口字段，保持数据一致
            item.is_favorited = item.isFavorite;
            ElMessage.success(item.isFavorite ? t('favoriteSuccess') || 'Favorite success' : t('unfavoriteSuccess') || 'Unfavorite success');

            // 如果是在收藏列表中取消收藏，则移除该项
            if (activeTag.value === 'favorite' && !item.isFavorite) {
                cardList.value = cardList.value.filter(card => card.id !== item.id);
            }
        }
    } catch (err) {
        console.error('Toggle favorite failed', err);
        ElMessage.error(t('operateFailed') || 'Operation failed');
    }
};

// 监听筛选条件变化，获取事件列表
watch(
    () => [route.query, activeTag.value],
    () => {
        fetchEventList();
    },
    { deep: true, immediate: true },
);

// 上拉加载：IntersectionObserver 监听触底
function setupLoadMoreObserver() {
    if (typeof IntersectionObserver === 'undefined') return;
    loadMoreObserver = new IntersectionObserver(
        (entries) => {
            const el = entries[0];
            if (!el?.isIntersecting || loadingMore.value || !hasMore.value) return;
            fetchEventList(true);
        },
        { root: null, rootMargin: '100px', threshold: 0 }
    );
}
watch(
    () => cardList.value.length,
    (len) => {
        nextTick(() => {
            if (!loadMoreObserver) setupLoadMoreObserver();
            if (len > 0 && loadMoreSentinel.value) loadMoreObserver?.observe(loadMoreSentinel.value);
        });
    },
    { flush: 'post' }
);

// 页面数据初始化
onMounted(async () => {
    getNotice();
    getCategoryListData();
    getHomeBannerList();
    countdownTimer = setInterval(() => {
        now.value = Date.now();
    }, 1000);
    setupLoadMoreObserver();
});

onUnmounted(() => {
    if (countdownTimer) clearInterval(countdownTimer);
    loadMoreObserver?.disconnect?.();
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

                        &.active {
                            color: var(--text-color-y);
                        }

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

                .filter-dropdowns-row {
                    display: flex;
                    gap: 10px;
                    width: 100%;
                }

                .filter-select-wrapper {
                    position: relative;
                    min-width: 0;
                }

                .filter-select-btn {
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 400;
                    color: var(--bg-opposite);
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: space-between;
                    min-height: 36px;
                    width: 100%;
                    box-sizing: border-box;

                    .filter-label {
                        display: flex;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        flex: 1;
                        gap: 4px;

                        span {
                            flex-shrink: 0;
                        }

                        .label-value {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }

                    .filter-arrow {
                        font-size: 12px;
                        color: var(--text-dark-gray);
                        transition: transform 0.2s;
                        flex-shrink: 0;
                        margin-left: 4px;

                        &.rotate {
                            transform: rotate(180deg);
                        }
                    }
                }

                .custom-dropdown-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    margin-top: 4px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    z-index: 101;
                    overflow: hidden;

                    .dropdown-item {
                        padding: 12px 16px;
                        font-size: 14px;
                        color: var(--bg-opposite);
                        cursor: pointer;
                        transition: background 0.2s;

                        &:active {
                            background: var(--bg-page);
                        }

                        &.active {
                            color: var(--text-color-y);
                            background: var(--bg-page);
                        }
                    }
                }
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

            .list-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 48px 24px;
                text-align: center;


                .list-empty-text {
                    margin: 0;
                    font-size: 14px;
                    color: var(--text-gray, #999);
                }
            }

            .card-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .load-more-sentinel {
                height: 1px;
                width: 100%;
                pointer-events: none;
                visibility: hidden;
            }

            .load-more-footer {
                padding: 16px 0 24px;
                text-align: center;

                .load-more-text {
                    font-size: 12px;
                    color: var(--text-gray, #999);
                }
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
                            transform: scale(1.15);
                        }

                        &.active path {
                            fill: var(--text-color-y);
                        }
                    }
                }

                // 选项列表样式（右侧小卡片）
                .item-options {
                    margin-bottom: 8px;
                    padding: 0 16px;
                    box-sizing: border-box;

                    &.scrollable-options {
                        max-height: 82px;
                        overflow: hidden auto;
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        scroll-snap-type: y proximity;
                        padding-top: 28px;
                        padding-bottom: 28px;
                        mask-image: linear-gradient(to bottom,
                                rgba(0, 0, 0, 0.35) 0%,
                                rgba(0, 0, 0, 1) 18%,
                                rgba(0, 0, 0, 1) 82%,
                                rgba(0, 0, 0, 0.35) 100%);
                    }
                }

                // 选项项样式
                .option-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    transition: opacity 0.2s ease, transform 0.2s ease;

                    &:last-child {
                        margin-bottom: 0;
                    }
                }

                .scrollable-options .option-item {
                    scroll-snap-align: start;
                    opacity: 0.45;
                    transform: translateZ(0) scale(0.98);
                }

                .scrollable-options .option-item.is-focused {
                    opacity: 1;
                    transform: translateZ(0) scale(1);
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

            .new-user-list-item {
                border-radius: 14px;
                overflow: hidden;
                background: #b6ff1d;
                border: 1px solid #a8ef1b;
                position: relative;

                .new-user-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 14px 8px;
                }

                .new-user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    object-fit: cover;
                    flex-shrink: 0;
                }

                .new-user-title {
                    flex: 1;
                    min-width: 0;
                    font-size: 13px;
                    line-height: 1.25;
                    color: #111;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .new-user-badge {
                    height: 28px;
                    padding: 0 10px;
                    border-radius: 999px 0 0 999px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #264015;
                    background: rgba(0, 0, 0, 0.08);
                    flex-shrink: 0;
                    position: absolute;
                    top: 20px;
                    right: 0;
                }

                .new-user-badge-icon {
                    display: inline-block;
                    flex-shrink: 0;
                    fill: currentColor;
                }

                .new-user-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 14px 10px;

                    .meta-item {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        min-width: 0;
                    }

                    .meta-label {
                        font-size: 12px;
                        color: rgba(20, 20, 20, 0.78);
                        white-space: nowrap;
                    }

                    .meta-value {
                        font-size: 12px;
                        color: #111;
                        font-weight: 700;
                        white-space: nowrap;
                    }
                }

                .new-user-actions {
                    display: flex;
                    gap: 12px;
                    padding: 0 14px 12px;
                }

                .new-user-action-btn {
                    flex: 1;
                    height: 40px;
                    border: none;
                    border-radius: 10px;
                    background: #0b0b0b;
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .new-user-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 6px;
                    padding: 8px 14px;
                    background: #97d81a;
                    color: #151515;

                    .amount-left {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        min-width: 0;
                        flex: 1;
                    }

                    .time-info,
                    .participant-info {
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                    }

                    .time-dot {
                        width: 12px;
                        height: 12px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                        line-height: 1;
                    }

                    .time-dot em {
                        display: inline-block;
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #f6465d;
                        // 与大卡片红点一致的呼吸灯效果
                        animation: time-dot-breath 1.4s ease-in-out infinite;
                    }

                    .time-text,
                    .participant-text,
                    .voi-amount,
                    .participant-icon {
                        font-size: 12px;
                        color: #151515;
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
