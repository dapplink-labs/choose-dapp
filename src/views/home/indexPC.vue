<template>
    <div class="home-page">
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

                <div class="main-list-section">
                    <div class="left-vertical-list">
                        <div class="list-item large-item" v-for="(item, index) in leftList" :key="'left-' + index">
                            <div class="item-header">
                                <img :src="item.avatar" :alt="$t('common.userAvatar')" class="user-avatar" />
                                <div class="item-meta">
                                    <div class="item-title" @click="navigateToEarnings()">
                                        {{ item.title }}
                                    </div>
                                </div>
                                <div class="percentage-semicircle">
                                    <svg class="semicircle-chart" viewBox="0 0 100 60">
                                        <!-- 背景半圆 -->
                                        <path class="semicircle-background" d="M 10 50 A 40 40 0 0 1 90 50" fill="none"
                                            stroke-width="8" />
                                        <!-- 进度半圆 -->
                                        <path class="semicircle-progress" d="M 10 50 A 40 40 0 0 1 90 50" fill="none"
                                            stroke="#E44096" stroke-width="8" stroke-linecap="round"
                                            :stroke-dasharray="125.6" :stroke-dashoffset="(125.6 * (100 - parseInt(item.percentage))) / 100
                                                " />
                                        <!-- 百分比文本 -->
                                        <text class="semicircle-percentage" x="52" y="50" text-anchor="middle" dy="0">
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
                                    <span class="leverage-value">{{
                                        item.maxLeverage || "10X"
                                    }}</span>
                                </div>
                                <div class="leverage-item">
                                    <span class="leverage-label">{{ $t("home.maxReturn") || "最大回报" }}:</span>
                                    <span class="leverage-value">{{
                                        item.maxReturn || "182%"
                                    }}</span>
                                </div>
                            </div>
                            <div class="item-actions">
                                <button class="action-btn yes-btn" @click="navigateToDetail(item, 'yes')">
                                    Yes
                                </button>
                                <button class="action-btn no-btn" @click="navigateToDetail(item, 'no')">
                                    No
                                </button>
                            </div>
                            <div class="item-amount">
                                <div class="amount-left">
                                    <div class="time-info" :class="{ urgent: item.isTimeUrgent }">
                                        <span v-if="item.isTimeUrgent" class="time-dot" aria-hidden="true">
                                            <em></em>
                                        </span>
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
                                        <span class="participant-text">{{
                                            item.participantCount.toLocaleString()
                                        }}</span>
                                    </div>
                                    <span class="voi-amount">VOI：${{ item.amount }}</span>
                                </div>
                                <svg t="1765591111184" class="icon-sc" :class="{ active: item.isFavorite }"
                                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5484"
                                    width="14" height="14" @click.stop="toggleFavorite(item)">
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
                                <img :src="item.avatar" :alt="$t('common.userAvatar')" class="user-avatar" />
                                <div class="item-meta">
                                    <div class="item-title">{{ item.title }}</div>
                                </div>
                            </div>
                            <div class="item-leverage-info">
                                <div class="leverage-item">
                                    <span class="leverage-label">{{ $t("home.maxLeverage") || "最大杠杆倍数" }}:</span>
                                    <span class="leverage-value">{{
                                        item.maxLeverage || "10X"
                                    }}</span>
                                </div>
                                <div class="leverage-item">
                                    <span class="leverage-label">{{ $t("home.maxReturn") || "最大回报" }}:</span>
                                    <span class="leverage-value">{{
                                        item.maxReturn || "182%"
                                    }}</span>
                                </div>
                            </div>
                            <div class="item-options">
                                <div class="option-item">
                                    <div class="option-text">
                                        <span>{{ item.options?.[0]?.text || '' }}</span>
                                        <span>{{ item.percentage }}</span>
                                    </div>
                                    <div class="option-buttons">
                                        <button class="option-btn yes-btn" @click="navigateToDetail(item, 'yes')">
                                            Yes
                                        </button>
                                        <button class="option-btn no-btn" @click="navigateToDetail(item, 'no')">
                                            No
                                        </button>
                                    </div>
                                </div>
                                <div class="option-item">
                                    <div class="option-text">
                                        <span>{{ item.options?.[1]?.text || '' }}</span>
                                        <span>{{ item.percentage }}</span>
                                    </div>
                                    <div class="option-buttons">
                                        <button class="option-btn yes-btn" @click="navigateToDetail(item, 'yes')">
                                            Yes
                                        </button>
                                        <button class="option-btn no-btn" @click="navigateToDetail(item, 'no')">
                                            No
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="item-amount">
                                <div class="amount-left">
                                    <div class="time-info" :class="{ urgent: item.isTimeUrgent }">
                                        <span v-if="item.isTimeUrgent" class="time-dot" aria-hidden="true">
                                            <em></em>
                                        </span>
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
                                        <span class="participant-text">{{
                                            item.participantCount.toLocaleString()
                                        }}</span>
                                    </div>
                                    <span class="voi-amount">VOI：${{ item.amount }}</span>
                                </div>
                                <svg t="1765591111184" class="icon-sc" :class="{ active: item.isFavorite }"
                                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5484"
                                    width="14" height="14" @click.stop="toggleFavorite(item)">
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import NavBar2 from "@/components/navBar2.vue";
import { Search, Avatar } from "@element-plus/icons-vue";
import router from "@/router";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { useAccount } from "@wagmi/vue";
import { getCategoryList, getEventList, getFavoriteList, toggleFavoriteEvent } from "@/api/APIEvent";

const { t } = useI18n();
const route = useRoute();
const isComingSoon = computed(() => import.meta.env.VITE_IS_COMING_SOON === "true");

const { address } = useAccount();

// 语言环境（给接口的 language_label 用）
const currentLocale = localStorage.getItem("app-locale") || navigator.language || "en";
const language = String(currentLocale).split("-")[0];

// 搜索相关（PC 顶部栏）
const searchQuery = ref("");
const categoryList = ref([]);

// 当前激活的标签（用于高亮；值为 category_guid 或 all）
const activeTag = ref("all");
const favoriteOnly = ref(false);

const PAGE_SIZE = 20;

const cardList = ref([]);
const leftList = computed(() => cardList.value.filter((i) => i.cardType === "large"));
const rightList = computed(() => cardList.value.filter((i) => i.cardType === "small"));

const pcTagButtons = computed(() => {
    const base = [{ value: "all", label: t("home.all") || "All" }];
    const cats = categoryList.value.map((c) => ({
        value: c.guid,
        label: c.name || c.title || c.code || c.guid,
    }));
    return base.concat(cats);
});

const now = ref(Date.now());
let countdownTimer = null;

const getCountdown = (closeTime) => {
    if (!closeTime) return "--";
    const end = new Date(String(closeTime).replace(" ", "T"));
    const diff = end.getTime() - now.value;
    if (diff <= 0) return "--";
    const totalSec = Math.floor(diff / 1000);
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
    return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
};

// 跳转到收益页面
const navigateToEarnings = () => {
    router.push("/earnings");
};

// 跳转到详情页面
const navigateToDetail = (item, choice) => {
    // 如果当前通过导航条处于“加密货币”场景，则进入加密货币详情页
    if (route.query.nav === 'crypto' || route.query.nav === 'crypto-chinese') {
        router.push({
            path: '/bitcoin-up-down',
            query: {
                id: item.id || item.title,
            },
        });
        return;
    }

    router.push({
        path: "/detail",
        query: {
            choice,
            id: item.id || item.title,
        },
    });
};

const getEventTypeFromNav = (nav) => {
    if (!nav) return 0;
    if (nav === "trends") return 0;
    if (nav === "breaking") return 1;
    if (nav === "news") return 2;
    return undefined;
};

const mapEventToCard = (e) => {
    const subEvents = Array.isArray(e.sub_events) ? e.sub_events : [];
    const volumeNum = Number(e.trade_volume);
    const amount =
        Number.isFinite(volumeNum) && !Number.isNaN(volumeNum) ? volumeNum.toFixed(2) : "0.00";

    const clusterNum = Number(e.cluster_score);
    const percentage =
        Number.isFinite(clusterNum) && !Number.isNaN(clusterNum) ? `${clusterNum}%` : "0%";

    const maxLeverageNum = Number(e.max_leverage);
    const maxLeverage =
        Number.isFinite(maxLeverageNum) && !Number.isNaN(maxLeverageNum) ? `${maxLeverageNum}X` : "--";

    const maxReturnNum = Number(e.max_return);
    let maxReturn = "--";
    if (Number.isFinite(maxReturnNum) && !Number.isNaN(maxReturnNum)) {
        // max_return 通常是小数倍数（如 1.82 -> 182%），但若后端返回 230 这种整数则直接当作百分比
        maxReturn = maxReturnNum <= 10 ? `${Math.round(maxReturnNum * 100)}%` : `${Math.round(maxReturnNum)}%`;
    }

    return {
        id: e.event_guid,
        cardType: e.is_live === 1 ? "large" : "small",
        avatar: e.logo || "",
        title: e.title || "",
        percentage,
        amount,
        participantCount: Number(e.participant_count) || 0,
        maxLeverage,
        maxReturn,
        closeTime: e.close_time || "",
        isTimeUrgent: e.is_live === 1,
        options: subEvents.map((sub) => ({
            text: sub.title || sub.option_title || "",
        })),
        isFavorite: !!e.is_favorited,
    };
};

const fetchCategoryListData = async () => {
    try {
        const response = await getCategoryList({ language_label: language });
        const cats = response?.data?.data?.categories || [];
        categoryList.value = [...cats];
    } catch (err) {
        console.error("Fetch category list failed:", err);
        categoryList.value = [];
    }
};

const fetchEventList = async () => {
    try {
        const query = route.query || {};
        const params = {
            language_label: language,
            include_sub_events: true,
            page: 1,
            page_size: PAGE_SIZE,
            user_address: address.value || "",
        };

        // 优先用路由查询条件（NavBar2 已经在做）
        if (query.category_guid) params.category_guid = query.category_guid;
        if (query.ecosystem_guid) params.ecosystem_guid = query.ecosystem_guid;

        if (searchQuery.value) params.title = searchQuery.value;

        const eventType = getEventTypeFromNav(query.nav);
        if (eventType !== undefined) params.event_type = eventType;

        const res = favoriteOnly.value ? await getFavoriteList(params) : await getEventList(params);
        const data = res?.data?.data || {};
        const list = data.events || [];
        cardList.value = list.map(mapEventToCard);
    } catch (err) {
        console.error("Fetch PC event list failed:", err);
        cardList.value = [];
    }
};

// 处理标签点击（更新路由，让 watch 触发刷新）
const handleTagClick = (tagValue) => {
    const newQuery = { ...(route.query || {}) };
    delete newQuery.ecosystem_guid;
    if (tagValue === "all") {
        delete newQuery.category_guid;
    } else {
        newQuery.category_guid = tagValue;
    }
    activeTag.value = tagValue;
    router.push({ path: "/home", query: newQuery });
};

// 处理收藏点击（收藏模式）
const handleBookmark = async () => {
    if (!address.value) {
        ElMessage.warning(t("pleaseConnectWallet") || "Please connect wallet");
        return;
    }
    favoriteOnly.value = !favoriteOnly.value;
};

// 切换收藏状态
const toggleFavorite = async (item) => {
    if (!address.value) {
        ElMessage.warning(t("pleaseConnectWallet") || "Please connect wallet");
        return;
    }

    try {
        const res = await toggleFavoriteEvent({
            user_address: address.value || "",
            event_guid: item.id,
        });

        const payload = res?.data ?? res;
        const code = payload?.code;
        if (code === 200 || code === 2000 || code === 0) {
            item.isFavorite = !item.isFavorite;
            item.is_favorited = item.isFavorite;
            // 收藏筛选模式下，如果取消收藏则把卡片从列表移除
            if (favoriteOnly.value && !item.isFavorite) {
                cardList.value = cardList.value.filter((i) => i.id !== item.id);
            }
        }
    } catch (err) {
        console.error("Toggle favorite failed:", err);
        ElMessage.error(t("operateFailed") || "Operation failed");
    }
};

watch(
    () => route.query,
    () => {
        activeTag.value = route.query?.category_guid ? String(route.query.category_guid) : "all";
        fetchEventList();
    },
    { deep: true, immediate: true }
);

let searchTimer = null;
watch(searchQuery, () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        fetchEventList();
    }, 500);
});

watch(address, () => {
    fetchEventList();
});

watch(favoriteOnly, () => {
    fetchEventList();
});

onMounted(async () => {
    fetchCategoryListData();
    countdownTimer = window.setInterval(() => {
        now.value = Date.now();
    }, 1000);
});

onUnmounted(() => {
    if (countdownTimer) window.clearInterval(countdownTimer);
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

.home-page {
    min-height: 100vh;
    background-color: var(--bg-page, #fcfcfc);
    color: var(--text-color, #1a1a1a);
    padding-top: 112px; // header(64px) + navbar2(48px)
    transition:
        background-color 0.3s ease,
        color 0.3s ease;

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

        .filter-section {
            margin-bottom: 24px;

            .filter-container {
                display: flex;
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
                            border: 1px solid var(--border-color, #e0e0e0);
                            border-radius: 5px;
                            font-size: 14px;
                            color: var(--text-gray, #666666);
                            backdrop-filter: blur(10px);
                            -webkit-backdrop-filter: blur(10px);
                            cursor: pointer;
                            transition: all 0.2s;
                            white-space: nowrap;
                            background: var(--bg-page, #f5f5f5);
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
                        width: 100%;
                        padding: 10px 16px;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 400;
                        color: #fff;
                        background: rgba(26, 26, 26, 0.6);
                        cursor: pointer;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        min-height: 40px;
                        box-sizing: border-box;

                        .filter-label {
                            flex: 1;
                            text-align: left;
                            color: #fff;
                            white-space: nowrap;

                            span {
                                color: #999;
                            }
                        }

                        .filter-arrow {
                            margin-left: 12px;
                            font-size: 14px;
                            color: #fff;
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
                background: var(--bg-page);
                border: 1px solid var(--border-color, #e0e0e0);
                min-width: 260px;
                height: 40px;
                box-sizing: border-box;
            }

            .pc-search-icon {
                font-size: 16px;
                color: var(--text-color, #1a1a1a);
            }

            .pc-search-input {
                border: none;
                outline: none;
                background: transparent;
                font-size: 13px;
                color: var(--text-color, #1a1a1a);
                width: 100%;

                &::placeholder {
                    color: var(--text-gray, #666666);
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
                color: var(--text-color, #1a1a1a);
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s;

                &.active {
                    background: var(--bg-light, #f5f5f5);
                    color: var(--text-color, #1a1a1a);
                }
            }

            .pc-divider {
                width: 1px;
                height: 18px;
                background: rgba(0, 0, 0, 0.1);
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
                font-family:
                    PingFang SC,
                    PingFang SC;
                font-weight: 500;
                font-size: 12px;
                color: var(--text-color, #1a1a1a);
                background: transparent;
                transition: all 0.2s;

                &.active {
                    background: var(--bg-opposite, #000000);
                    color: var(--bg-page-h5, #ffffff);
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

            .list-item {
                overflow: hidden;
                background: var(--bg-card, #ffffff);
                border-radius: 8px;
                border: 1px solid #f4f4f4;
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

            .item-percentage {
                font-size: 12px;
                color: var(--text-gray, #666);
            }

            // 半圆进度：容器 + 图表 + 文本
            .percentage-semicircle {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;

                .semicircle-chart {
                    width: 60px;
                    height: 30px;
                }

                .semicircle-progress {
                    stroke-linecap: round;
                }

                .semicircle-background {
                    stroke: var(--border-color, #e5e5e5);
                    transition: stroke 0.3s ease;
                }

                .semicircle-percentage {
                    font-size: 30px;
                    font-weight: 600;
                    fill: var(--text-color, #333);
                    transition: fill 0.3s ease;
                }

                .percentage-label {
                    font-size: 10px;
                    color: var(--text-dark-gray, #999);
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
                color: var(--text-color-y, #2ebe69);
                background: var(--button-bg-y, rgba(47, 188, 135, 0.2));
            }

            .no-btn {
                color: var(--text-color-n, #e44096);
                background: var(--button-bg-n, rgba(228, 64, 150, 0.2));
            }

            .item-amount {
                font-size: 12px;
                color: var(--text-dark-gray, #999);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 7px 16px;
                box-sizing: border-box;
                background: var(--bg-page, #f5f5f5);
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
                        font-family:
                            PingFang SC,
                            PingFang SC;
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
                        fill: #ca4064;
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
                    padding: 4px 12px;
                    font-size: 12px;
                }

                &.no-btn {
                    color: var(--text-color-n, #e44096);
                    padding: 4px 12px;
                    font-size: 12px;
                }
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

