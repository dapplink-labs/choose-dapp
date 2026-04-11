<template>
  <div class="detail-h5-page">
    <!-- 顶部导航 -->
    <NavBar2 />

    <div class="content">
      <!-- 1. 事件标题和基本信息 -->
      <div class="event-header">
        <div class="event-title-section">
          <img
            :src="detailData.avatar || fallbackAvatar"
            :alt="$t('detail.avatar')"
            class="event-avatar"
            @error="(e) => (e.target.src = fallbackAvatar)"
          />
          <h1 class="event-title">{{ detailData.title }}</h1>
          <!-- 倒计时 -->
          <div v-if="!isEventEnded" class="event-countdown">
            <div class="countdown-block">
              <span class="countdown-num">{{ countdownDisplay.days }}</span>
              <span class="countdown-label">{{ $t("detail.day") }}</span>
            </div>
            <div class="countdown-block">
              <span class="countdown-num">{{ countdownDisplay.hours }}</span>
              <span class="countdown-label">{{ $t("detail.hour") }}</span>
            </div>
            <div class="countdown-block">
              <span class="countdown-num">{{ countdownDisplay.minutes }}</span>
              <span class="countdown-label">{{ $t("detail.minute") }}</span>
            </div>
            <div class="countdown-block">
              <span class="countdown-num">{{ countdownDisplay.seconds }}</span>
              <span class="countdown-label">{{ $t("detail.second") }}</span>
            </div>
          </div>
          <div v-else class="event-ended-badge">
            {{ $t("detail.eventEnded") || "已结束" }}
          </div>
        </div>

        <!-- 附加信息栏 -->
        <div class="event-info-section">
          <div class="event-info-row event-info-row-top">
            <div class="info-item">
              <el-icon class="info-icon">
                <Trophy />
              </el-icon>
              <span class="info-text">{{ detailData.volume }}</span>
            </div>
            <div class="info-item">
              <el-icon class="info-icon">
                <Clock />
              </el-icon>
              <span class="info-text">{{ detailData.closeDate }}</span>
            </div>
            <div
              class="bookmark-icon"
              :class="{ active: detailData.isFavorite }"
              @click="handleBookmark"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <div class="event-info-row event-info-row-bottom">
            <div class="leverage-info">
              <span class="leverage-label"
                >{{ $t("detail.maximumLeverage") }}:</span
              >
              <span class="leverage-value">{{ detailData.maxLeverage }}</span>
            </div>
            <div class="return-info">
              <span class="return-label"
                >{{ $t("detail.maximumReturn") }}:</span
              >
              <span class="return-value">{{ detailData.maxReturn }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 图表区域 -->
      <div class="chart-section">
        <div class="chart-title">{{ $t("detail.popularity") }}</div>

        <!-- 时间选择器 -->
        <div class="time-range-selector">
          <button
            v-for="range in timeRanges"
            :key="range.value"
            class="time-range-btn"
            :class="{ active: selectedTimeRange === range.value }"
            @click="handleTimeRangeChange(range.value)"
          >
            {{ range.label }}
          </button>
        </div>

        <!-- 动态生成图例 -->
        <div class="chart-legend">
          <div
            v-for="(outcome, index) in outcomes"
            :key="index"
            class="legend-item"
          >
            <span
              class="legend-dot"
              :style="{ backgroundColor: outcome.color }"
            ></span>
            <span class="legend-text"
              >{{ outcome.title }} {{ outcome.chance }}%</span
            >
          </div>
        </div>

        <!-- ECharts 图表容器 -->
        <div
          class="chart-container"
          ref="chartContainerRef"
          @touchstart="onChartTouchStart"
          @touchmove.prevent="onChartTouchMove"
          @touchend="onChartTouchEnd"
          @mouseleave="onChartTouchEnd"
        >
          <div ref="chartRef" class="chart-canvas"></div>

          <div class="interaction-layer">
            <div
              v-if="isDragging"
              class="axis-pointer"
              :style="{ left: cursorX + 'px' }"
            ></div>
            <!-- 数据圆点 -->
            <div
              v-for="(dot, idx) in activeDots"
              :key="'dot-' + idx"
              class="data-dot"
              :style="{
                left: dot.x + 'px',
                top: dot.y + 'px',
                backgroundColor: dot.color,
              }"
            ></div>
            <!-- 浮动信息卡 -->
            <div v-if="isDragging" class="custom-tooltip" :style="tooltipStyle">
              <div class="tt-time">{{ tooltipTimeLabel }}</div>
              <div
                v-for="dot in activeDots"
                :key="'tt-' + dot.name"
                class="tt-row"
                :style="{ backgroundColor: dot.color, color: dot.textColor }"
              >
                <span class="tt-name">{{ dot.name }}</span>
                <span class="tt-val">${{ dot.val }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 结果预测列表 (已增加到4条数据) -->
      <div class="outcome-prediction-section" v-if="outcomes.length > 0">
        <div class="section-title">{{ $t("detail.whatDoYouPredict") }}</div>
        <div class="section-header">
          <div class="header-label outcome-label">
            {{ $t("detail.outcome") }}
          </div>
          <div class="header-label chance-label">{{ $t("detail.chance") }}</div>
        </div>

        <div class="outcome-list">
          <div
            v-for="(outcome, index) in outcomes"
            :key="index"
            class="outcome-row"
          >
            <div class="outcome-content" @click="openPredictionDetail(outcome)">
              <div class="outcome-left">
                <div class="outcome-title">{{ outcome.title }}</div>
                <div class="outcome-volume">{{ outcome.volume }}</div>
              </div>
              <div class="outcome-chance">{{ outcome.chance }}%</div>
            </div>
            <div
              class="outcome-divider"
              v-if="outcome.positions && outcome.positions.length"
            >
              <span
                v-for="(pos, pIdx) in outcome.positions"
                :key="pIdx"
                :class="(['YES','UP','Up'].includes(pos.outcome || '')?'yes':'no').toLowerCase()"
              >
                {{ getDisplayOutcome(pos.outcome) }}
                {{ Number(pos.shares) }} ·
                {{ Number(pos.avg_price * 100).toFixed(1) }} ¢
              </span>
              <!-- <span v-else class="outcome-divider-placeholder">-</span> -->
            </div>
            <div v-if="!isEventEnded" class="outcome-actions">
              <button
                class="outcome-btn yes-btn"
                :class="{ active: outcome.selected === 'yes' }"
                @click="selectOutcome(index, 'yes')"
              >
                {{ getDisplayOutcome(outcome.yesOutcome) }} {{ outcome.yesPrice }} ¢
              </button>
              <button
                class="outcome-btn no-btn"
                :class="{ active: outcome.selected === 'no' }"
                @click="selectOutcome(index, 'no')"
              >
                {{ getDisplayOutcome(outcome.noOutcome) }} {{ outcome.noPrice }} ¢
              </button>
            </div>
            <div v-else class="outcome-actions-ended">
              {{ $t("detail.eventEnded") || "已结束" }}
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 查看结果模块 (折叠，仅事件结束后显示) -->
      <div v-if="isEventEnded" class="view-results-section">
        <div
          class="view-results-header"
          @click="showViewResultsExpanded = !showViewResultsExpanded"
        >
          <h3 class="view-results-title">{{ $t("detail.viewResults") }}</h3>
          <span class="view-results-caret">
            <el-icon v-if="showViewResultsExpanded">
              <ArrowUpBold />
            </el-icon>
            <el-icon v-else>
              <ArrowDownBold />
            </el-icon>
          </span>
        </div>
        <transition name="view-results-collapse">
          <div v-show="showViewResultsExpanded" class="view-results-list">
            <div
              v-for="(item, index) in viewResults"
              :key="index"
              class="view-results-item"
            >
              <div class="view-results-content">
                <div class="view-results-desc">{{ item.title }}</div>
                <div class="view-results-volume">{{ item.volume }}</div>
              </div>
              <span class="view-results-status">{{
                item.result === "yes"
                  ? $t("detail.resultYes")
                  : $t("detail.resultNo")
              }}</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- 5. 关于模块 -->
      <div class="about-section">
        <h3 class="section-block-title">{{ $t("detail.about") || "关于" }}</h3>
        <div class="about-rows">
          <div class="about-row">
            <div class="about-left">
              <el-icon class="about-icon">
                <Trophy />
              </el-icon>
              <span class="about-label">{{
                $t("detail.volume") || "交易量"
              }}</span>
            </div>
            <span class="about-value">{{ detailData.volume }}</span>
          </div>
          <div class="about-row">
            <div class="about-left">
              <el-icon class="about-icon">
                <Clock />
              </el-icon>
              <span class="about-label">{{
                $t("detail.endDate") || "结束日期"
              }}</span>
            </div>
            <span class="about-value">{{ detailData.closeDate }}</span>
          </div>
          <div class="about-row">
            <div class="about-left">
              <el-icon class="about-icon">
                <Calendar />
              </el-icon>
              <span class="about-label">{{
                $t("detail.createDate") || "创建日期"
              }}</span>
            </div>
            <span class="about-value">{{ detailData.createDate || "--" }}</span>
          </div>
        </div>
      </div>

      <!-- 6. 规则模块 -->
      <div class="rules-section" v-if="detailData.rules">
        <h3 class="section-block-title">{{ $t("detail.rules") || "规则" }}</h3>
        <p class="rules-text">
          {{ detailData.rules }}
        </p>
      </div>

      <!-- 7. 选项卡模块 (评论/持仓/活动) -->
      <div class="tabs-section">
        <div class="tabs-nav">
          <button
            v-if="SHOW_COMMENTS"
            class="tab-nav-item"
            :class="{ active: activeListTab === 'comments' }"
            @click="activeListTab = 'comments'"
          >
            {{ $t("detail.comments") || "评论" }}
          </button>
          <button
            class="tab-nav-item"
            :class="{ active: activeListTab === 'holds' }"
            @click="activeListTab = 'holds'"
          >
            {{ $t("detail.holds") || "持仓" }}
          </button>
          <button
            class="tab-nav-item"
            :class="{ active: activeListTab === 'activity' }"
            @click="activeListTab = 'activity'"
          >
            {{ $t("detail.activity") || "活动" }}
          </button>
        </div>

        <!-- 评论列表 -->
        <div
          v-if="SHOW_COMMENTS && activeListTab === 'comments'"
          class="tab-pane"
        >
          <div
            v-for="(comment, index) in commentsData"
            :key="index"
            class="comment-item"
          >
            <img :src="comment.avatar" class="user-avatar" />
            <div class="comment-main">
              <div class="comment-header">
                <span class="user-name">{{ comment.name }}</span>
                <span class="comment-tag" :class="comment.type">{{
                  comment.tag
                }}</span>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
              <p class="comment-msg">{{ comment.message }}</p>
              <div class="comment-actions">
                <span class="likes"
                  ><el-icon>
                    <Pointer />
                  </el-icon>
                  {{ comment.likes }}</span
                >
              </div>
            </div>
          </div>
          <div v-if="!commentsData.length" class="empty-state">
            {{ $t("common.noData") || "暂无数据" }}
          </div>
        </div>

        <!-- 持仓列表 -->
        <div v-if="activeListTab === 'holds'" class="tab-pane">
          <div
            v-if="!yesHolders.length && !noHolders.length"
            class="empty-state"
          >
            {{ $t("common.noData") || "暂无数据" }}
          </div>
          <template v-else>
            <div class="holds-grid">
              <div class="hold-col">
                <div class="hold-title">Yes Holders</div>
                <div v-for="h in yesHolders" :key="h.rank" class="holder-row">
                  <div class="avatar-wrap">
                    <img :src="h.avatar" />
                    <span
                      class="rank-badge"
                      :style="{ background: h.rankColor }"
                      >{{ h.rank }}</span
                    >
                  </div>
                  <div class="holder-info">
                    <div class="name">{{ h.name }}</div>
                    <div class="amount yes">{{ h.amount }}</div>
                  </div>
                </div>
              </div>
              <div class="hold-col">
                <div class="hold-title">No Holders</div>
                <div v-for="h in noHolders" :key="h.rank" class="holder-row">
                  <div class="avatar-wrap">
                    <img :src="h.avatar" />
                    <span
                      class="rank-badge"
                      :style="{ background: h.rankColor }"
                      >{{ h.rank }}</span
                    >
                  </div>
                  <div class="holder-info">
                    <div class="name">{{ h.name }}</div>
                    <div class="amount no">{{ h.amount }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 活动列表 -->
        <div v-if="activeListTab === 'activity'" class="tab-pane">
          <div v-if="!activityData.length" class="empty-state">
            {{ $t("common.noData") || "暂无数据" }}
          </div>
          <div
            v-for="(act, index) in activityData"
            :key="index"
            class="activity-item"
          >
            <img :src="act.avatar" class="user-avatar" />
            <div class="activity-info">
              <div class="user-name">{{ act.name }}</div>
              <div class="act-desc">
                Bought
                <span class="highlight" :class="act.result">{{
                  act.outcome
                }}</span>
                –
                {{ act.amount }}
              </div>
              <div class="act-time">{{ act.time }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 支付模态框 -->
      <PaymentModal
        v-model="showPayment"
        :event-title="detailData.title"
        :outcome-title="paymentOutcomeTitle"
        :event-guid="currentEventGuid"
        :sub-event-guid="paymentSubEventGuid"
        :initial-outcome="paymentInitialOutcome"
        :initial-side="paymentInitialSide"
        :yes-outcome="paymentInitYesOutcome" 
        :no-outcome="paymentInitNoOutcome"
        @order-success="onOrderSuccess"
      />
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  shallowRef,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  Trophy,
  Clock,
  Calendar,
  ArrowUpBold,
  ArrowDownBold,
  Pointer,
} from "@element-plus/icons-vue";
import * as echarts from "echarts";
import PaymentModal from "@/components/PaymentModal.vue";
import NavBar2 from "@/components/navBar2.vue";
import { useDark } from "@vueuse/core";
import router from "@/router";
import {
  getEventDetailItem,
  getEventActivity,
  getEventTopHolders,
  getEventCommentList,
  getEventPriceHistory,
  getSubEventDetail,
  toggleFavoriteEvent,
  getUserSubEventPositions,
} from "@/api/APIEvent";
import fallbackAvatar from "@/assets/icon/LP1.png";
import { ElMessage } from "element-plus";
import { useAccount } from "@wagmi/vue";
import { createIotMqttClient, hasWebCrypto } from "@/utils/mqttClient";

// ── MQTT 配置 ──────────────────────────────────────────────────
const IOT_REGION = import.meta.env.VITE_IOT_REGION || "ap-southeast-1";
const IOT_ENDPOINT =
  import.meta.env.VITE_IOT_ENDPOINT ||
  "a3awip9q9thtco-ats.iot.ap-southeast-1.amazonaws.com";
const COGNITO_IDENTITY_POOL_ID =
  import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID ||
  "ap-southeast-1:ec400695-b709-4af1-a19b-455cded69acf";

/** @type {ReturnType<typeof createIotMqttClient>|null} */
let iotMqtt = null;
let mqttDestroyed = false;

const shouldUseMqtt = computed(
  () => !!IOT_ENDPOINT && !!COGNITO_IDENTITY_POOL_ID && hasWebCrypto(),
);

const route = useRoute();
const { t } = useI18n();
const isDarkMode = useDark();
const { address } = useAccount();

// --- 基础数据 ---
const detailData = ref({
  title: "",
  avatar: fallbackAvatar,
  volume: "--",
  closeDate: "--",
  createDate: "--",
  maxLeverage: "--",
  maxReturn: "--",
  isFavorite: false,
  rules: "",
});

const PALETTE = computed(() => [
  isDarkMode.value ? "#2EBE69" : "#BBFF2E",
  "#E44096",
  "#3B82F6",
  "#F59E0B",
]);

// 预测列表数据（完全依赖接口返回的 sub_events，不再使用本地假数据）
const outcomes = ref([]);

const viewResults = ref([]);

// 评论列表（从 /api/v1/eventComment/list 获取）
const commentsData = ref([]);
const commentPage = ref(1);
const commentTotalPages = ref(1);
const loadingComments = ref(false);
const COMMENT_PAGE_SIZE = 20;

const yesHolders = ref([]);
const noHolders = ref([]);

const getDisplayOutcome = (outcome) => {
  if (!outcome) return '';
  const str = String(outcome).toLowerCase();
  if (str === 'up') return t('bitcoinUpDown.up') || '涨';
  if (str === 'down') return t('bitcoinUpDown.down') || '跌';
  return outcome;
};

// 事件活动记录（从 /api/v1/event/activity 获取）
const activityData = ref([]);
const activityPage = ref(1);
const activityTotalPages = ref(1);
const loadingActivity = ref(false);
const ACTIVITY_PAGE_SIZE = 20;

// --- 状态控制 ---
// 备注：评论模块第二期再启用；当前先隐藏并避免请求接口
const SHOW_COMMENTS = false;
const activeListTab = ref(SHOW_COMMENTS ? "comments" : "holds");
const showViewResultsExpanded = ref(false);
const showPayment = ref(false);

// 支付弹窗传参
const currentEventGuid = computed(
  () => route.query.id || route.query.event_guid || "",
);
const paymentSubEventGuid = ref("");
const paymentOutcomeTitle = ref("");
const paymentInitialOutcome = ref("YES");
const paymentInitialSide = ref("buy");
const paymentInitYesOutcome = ref("YES");
const paymentInitNoOutcome = ref("NO");
const timeRanges = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "ALL", value: "all" },
];
const selectedTimeRange = ref("1w");

// --- 倒计时 ---
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
const isEventEnded = ref(false);
let countdownTimer = null;
const targetTime = ref(0);

const updateCountdown = () => {
  if (!targetTime.value) {
    isEventEnded.value = false;
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return;
  }
  const now = Date.now();
  const diff = Math.max(0, Math.floor((targetTime.value - now) / 1000));
  isEventEnded.value = diff === 0 && targetTime.value < now;
  countdown.value = {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  };
};

const countdownDisplay = computed(() => ({
  days: String(countdown.value.days).padStart(2, "0"),
  hours: String(countdown.value.hours).padStart(2, "0"),
  minutes: String(countdown.value.minutes).padStart(2, "0"),
  seconds: String(countdown.value.seconds).padStart(2, "0"),
}));

// --- 事件详情：对接 /api/v1/eventDetail/item ---
const loadingDetail = ref(false);

const formatVolume = (v) => {
  const num = Number(v);
  if (!Number.isFinite(num)) return "$0 Vol.";
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M Vol.`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K Vol.`;
  return `$${num.toFixed(2)} Vol.`;
};

const mapSubEventsToOutcomes = (subEvents = []) => {
  const list = Array.isArray(subEvents) ? subEvents : [];
  return list.map((sub, idx) => {
    const directions = Array.isArray(sub.directions) ? sub.directions : [];
    const yesDir =
      directions.find((d) => ['YES','UP'].includes((d.outcome || "").toUpperCase())) || {};
    const noDir =
      directions.find((d) => ['NO','DOWN'].includes((d.outcome || "").toUpperCase())) || {};

    // chance 字段可能是 0-1 概率，也可能是 0-100，统一转为 0-100 显示
    const chanceRaw = Number(yesDir.chance ?? 0);
    const chancePercent = Number.isFinite(chanceRaw)
      ? chanceRaw <= 1
        ? chanceRaw * 100
        : chanceRaw
      : 0;

    // 买 Yes/No 时均使用对应方向的 new_ask_price（卖价 = 市场报价）
    const yesPrice = Number(yesDir.new_ask_price) || yesDir.chance || "0";
    const noPrice = Number(noDir.new_ask_price) || noDir.chance || "0";

    return {
      title: sub.title || "",
      volume: formatVolume(sub.trade_volume),
      chance: Number(chancePercent.toFixed(1)),
      yesPrice: String(yesPrice),
      noPrice: String(noPrice),
      color: PALETTE.value[idx % PALETTE.value.length],
      selected: null,
      sub_event_guid: sub.sub_event_guid || "",
      subEventGuid: sub.sub_event_guid || "",
      positions: [],
      yesOutcome: yesDir?.outcome || "YES",
      noOutcome: noDir?.outcome || "NO",
    };
  });
};

const fetchDetail = async () => {
  const eventGuid = currentEventGuid.value;
  if (!eventGuid) return;

  loadingDetail.value = true;
  try {
    const currentLocale =
      localStorage.getItem("app-locale") || navigator.language || "en";
    const language = currentLocale.split("-")[0];
    const res = await getEventDetailItem({
      event_guid: eventGuid,
      language_label: language,
      user_address: address.value,
    });

    const data = res?.data?.data || {};
    const ev = Array.isArray(data.events) ? data.events[0] : null;
    if (!ev) return;

    // 检查事件是否已结束
    const ENDED_STATUSES = ['settled', 'ended', 'closed', 'resolved', 'expired', 'finished', 'completed'];
    if (ENDED_STATUSES.includes(String(ev.status || '').toLowerCase()) || ev.is_settled) {
      isEventEnded.value = true;
    }

    // 头部基本信息
    detailData.value = {
      title: ev.title || "",
      avatar: ev.logo || detailData.value.avatar,
      volume: formatVolume(ev.trade_volume),
      closeDate: ev.close_time || "",
      createDate: ev.created_at || "",
      maxLeverage: "--",
      maxReturn: "--",
      isFavorite: !!ev.is_favorited,
      rules: ev.rules || "",
    };

    // 使用 close_time 作为倒计时目标
    if (ev.close_time) {
      const ts = new Date(ev.close_time.replace(" ", "T")).getTime();
      if (!Number.isNaN(ts)) {
        targetTime.value = ts;
        updateCountdown();
      }
    }

    // 子事件映射为预测列表
    if (Array.isArray(ev.sub_events) && ev.sub_events.length) {
      outcomes.value = mapSubEventsToOutcomes(ev.sub_events);
      fetchOutcomesPositions();
    }
  } catch (err) {
    console.error("Fetch event detail failed", err);
  } finally {
    loadingDetail.value = false;
  }
};

const fetchOutcomesPositions = async () => {
  if (!address.value || !outcomes.value.length) return;
  const eventGuid = currentEventGuid.value;

  for (let i = 0; i < outcomes.value.length; i++) {
    const outcome = outcomes.value[i];
    if (!outcome.sub_event_guid) continue;

    try {
      const res = await getUserSubEventPositions({
        event_guid: eventGuid,
        sub_event_guid: outcome.sub_event_guid,
        user_address: address.value,
      });
      if (res?.data?.code === 2000 && res?.data?.data?.positions) {
        outcome.positions = res.data.data.positions;
      }
    } catch (err) {
      console.error("Fetch outcome positions failed", err);
    }
  }
};

// --- 事件活动记录：对接 /api/v1/event/activity ---
const hasMoreActivity = computed(
  () => activityPage.value <= activityTotalPages.value,
);

const mapActivityItem = (item) => {
  const costNum = Number(item.cost);
  const formattedCost = Number.isFinite(costNum)
    ? `$${costNum.toFixed(2)}`
    : `$${item.cost || "0"}`;
  return {
    name: item.user_name || "",
    outcome: item.outcome || "",
    amount: formattedCost,
    time: formatTimeAgo(item.timestamp || ""),
    avatar: item.avatar || fallbackAvatar,
    result: (item.outcome || "").toLowerCase() === "yes" ? "yes" : "no",
  };
};

const fetchActivity = async (append = false) => {
  const eventGuid = currentEventGuid.value;
  if (!eventGuid) return;
  if (append && (loadingActivity.value || !hasMoreActivity.value)) return;

  if (!append) {
    activityPage.value = 1;
    activityData.value = [];
  }

  loadingActivity.value = true;
  try {
    const res = await getEventActivity({
      event_guid: eventGuid,
      page: activityPage.value,
      page_size: ACTIVITY_PAGE_SIZE,
    });
    const data = res?.data?.data || {};
    const list = Array.isArray(data.activities) ? data.activities : [];
    const totalPages = data.total_pages ?? 1;

    activityTotalPages.value = totalPages;
    const mapped = list.map(mapActivityItem);
    activityData.value = append ? activityData.value.concat(mapped) : mapped;

    activityPage.value += 1;
  } catch (err) {
    console.error("Fetch event activity failed", err);
  } finally {
    loadingActivity.value = false;
  }
};

// --- 评论列表：对接 /api/v1/eventComment/list ---
const hasMoreComments = computed(
  () => commentPage.value <= commentTotalPages.value,
);

const formatTimeAgo = (value) => {
  if (!value) return "";
  const date =
    typeof value === "number"
      ? new Date(value)
      : new Date(String(value).replace(" ", "T"));
  const ts = date.getTime();
  if (Number.isNaN(ts)) return String(value);

  const diffSeconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  const minutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

const mapCommentItem = (c) => ({
  name: c.user_name || "",
  avatar: c.avatar || fallbackAvatar,
  tag: c.extra_label || "",
  type: (c.direction || "").toLowerCase() === "no" ? "no" : "yes",
  time: formatTimeAgo(c.created_at || ""),
  message: c.content || "",
  likes: c.likes ?? 0,
});

const fetchComments = async (append = false) => {
  const eventGuid = currentEventGuid.value;
  if (!eventGuid) return;
  if (append && (loadingComments.value || !hasMoreComments.value)) return;

  if (!append) {
    commentPage.value = 1;
    commentsData.value = [];
  }

  loadingComments.value = true;
  try {
    const res = await getEventCommentList({
      event_guid: eventGuid,
      page: commentPage.value,
      page_size: COMMENT_PAGE_SIZE,
    });
    const data = res?.data?.data || {};
    const list = Array.isArray(data.comments) ? data.comments : [];
    const totalPages = data.total_pages ?? 1;

    commentTotalPages.value = totalPages;
    const mapped = list.map(mapCommentItem);
    commentsData.value = append ? commentsData.value.concat(mapped) : mapped;

    commentPage.value += 1;
  } catch (err) {
    console.error("Fetch comments failed", err);
  } finally {
    loadingComments.value = false;
  }
};

// --- 持仓排行榜：对接 /api/v1/event/topHolders ---
const formatPosition = (v) => {
  const num = Number(v);
  if (!Number.isFinite(num)) return "$0";
  return `$${num.toFixed(2)}`;
};

const getRankColor = (rank) => {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#25A750";
  if (rank === 3) return "#3B82F6";
  return "#999999";
};

const mapHolderItem = (item) => ({
  rank: item.rank,
  name: item.user_name || "",
  amount: formatPosition(item.position_value),
  avatar: item.avatar || fallbackAvatar,
  rankColor: getRankColor(item.rank),
});

const fetchTopHolders = async () => {
  const eventGuid = currentEventGuid.value;
  if (!eventGuid) return;
  try {
    const res = await getEventTopHolders({
      event_guid: eventGuid,
      page: 1,
      page_size: 10,
    });
    const data = res?.data?.data || {};
    const yesList = Array.isArray(data.yes_holders) ? data.yes_holders : [];
    const noList = Array.isArray(data.no_holders) ? data.no_holders : [];

    yesHolders.value = yesList.map(mapHolderItem);
    noHolders.value = noList.map(mapHolderItem);
  } catch (err) {
    console.error("Fetch top holders failed", err);
  }
};

// --- 图表核心逻辑 ---
const chartRef = ref(null);
const chartContainerRef = ref(null);
const chartInstance = shallowRef(null);
const isDragging = ref(false);
const cursorX = ref(0);
const activeDots = ref([]);
const tooltipStyle = ref({ left: "0px", top: "0px" });
const tooltipTimeLabel = ref("");
let gridRect = { x: 0, y: 0, width: 0, height: 0 };
let chartSourceData = null;
const loadingPriceHistory = ref(false);

// 将价格字段标准化到 0~1 区间（兼容 0~1 和 0~100 两种来源）
const parsePrice = (p) => {
  const n = Number(p);
  if (!Number.isFinite(n) || Number.isNaN(n)) return null;
  // 后端字段描述为 "概率/价格"，0~1 直接使用，0~100 则除以 100
  const normalized = n > 1 ? n / 100 : n;
  return Math.max(0, Math.min(1, normalized));
};

// 根据实际数据时间跨度自动决定 x 轴格式
const getXAxisSpanMs = () => {
  const labels = chartSourceData?.xLabels;
  if (!labels?.length) return 0;
  const first = new Date(labels[0]).getTime();
  const last = new Date(labels[labels.length - 1]).getTime();
  return Number.isFinite(last - first) ? last - first : 0;
};

const formatXAxisLabel = (idx) => {
  if (!chartSourceData?.xLabels?.length) return "";
  const i = Number(idx);
  if (!Number.isInteger(i) || i < 0 || i >= chartSourceData.xLabels.length)
    return "";

  const raw = chartSourceData.xLabels[i];
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);

  const locale =
    localStorage.getItem("app-locale") || navigator.language || "en-US";
  const spanMs = getXAxisSpanMs();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (spanMs <= oneDayMs) {
    // 时间跨度 ≤ 1 天：显示 时:分
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }
  // 时间跨度 > 1 天：显示 月/日
  return new Intl.DateTimeFormat(locale, {
    month: "2-digit",
    day: "2-digit",
  }).format(d);
};

// tooltip 需要展示“时间日期”，因此比 x 轴标签更完整一些：
// - 1d：显示“月/日 + 时:分”
// - 其他范围：显示“月/日”
const formatTooltipXAxisLabel = (idx) => {
  if (!chartSourceData?.xLabels?.length) return "";
  const i = Number(idx);
  if (!Number.isInteger(i) || i < 0 || i >= chartSourceData.xLabels.length)
    return "";

  const raw = chartSourceData.xLabels[i];
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);

  const locale =
    localStorage.getItem("app-locale") || navigator.language || "en-US";
  // “完整时间”：包含 年-月-日 时-分-秒
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
};

const buildChartSourceFromPriceHistory = (priceHistoryData) => {
  const points = Array.isArray(priceHistoryData?.data_points)
    ? priceHistoryData.data_points
    : [];
  if (!points.length) return null;

  // x 轴时间：用第一条有非空 history.data 的数据做基准
  const first = points.find((p) => {
    const histArr = Array.isArray(p?.history) ? p.history : [];
    return histArr.some((h) => Array.isArray(h?.data) && h.data.length > 0);
  });
  const firstHistory =
    first?.history?.find((h) => (h?.outcome || "").toLowerCase() === "yes") ||
    first?.history?.[0];
  const baseData = Array.isArray(firstHistory?.data) ? firstHistory.data : [];
  if (!baseData.length) return null;

  // 注意：不要 filter 掉空值，避免 x 轴长度和 series 对齐出问题
  const xLabels = baseData.map((dp) => dp?.t || "");
  const xData = Array.from({ length: xLabels.length }, (_, i) => i);
  const timeIndex = new Map(xLabels.map((t, i) => [t, i]));

  const currentOutcomes = outcomes.value;

  const sData = points.slice(0, 4).map((p, idx) => {
    const historyArr = Array.isArray(p?.history) ? p.history : [];
    const picked =
      historyArr.find((h) => (h?.outcome || "").toLowerCase() === "yes") || {};
    const rawSeries = Array.isArray(picked?.data) ? picked.data : [];

    const data = new Array(xLabels.length).fill(null);
    rawSeries.forEach((pt) => {
      const i = timeIndex.get(pt?.t);
      if (i === undefined) return;
      const v = parsePrice(pt?.p);
      if (v === null) return;
      data[i] = Number(v.toFixed(4));
    });

    // 按 sub_event_guid / title 与 outcomes 对齐颜色索引，防止顺序不一致导致颜色错乱
    let colorIdx = idx;
    if (currentOutcomes.length > 0) {
      const matchIdx = currentOutcomes.findIndex(
        (o) =>
          (p.sub_event_guid &&
            (o.sub_event_guid === p.sub_event_guid ||
              o.subEventGuid === p.sub_event_guid)) ||
          (p.title && o.title === p.title),
      );
      if (matchIdx >= 0) colorIdx = matchIdx;
    }

    return {
      name: p?.title || "",
      color: PALETTE.value[colorIdx % PALETTE.value.length],
      data,
    };
  });

  return { xData, xLabels, sData };
};

const updateOverlay = (idx) => {
  if (!chartInstance.value || !chartSourceData) return;
  idx = Math.max(0, Math.min(chartSourceData.xData.length - 1, idx));
  const xPx = chartInstance.value.convertToPixel({ xAxisIndex: 0 }, idx);
  cursorX.value = xPx;
  tooltipTimeLabel.value = formatTooltipXAxisLabel(idx);

  activeDots.value = chartSourceData.sData
    .filter((line) => Number.isFinite(line.data[idx]))
    .map((line) => ({
      name: line.name,
      val: line.data[idx].toFixed(4),
      color: line.color,
      textColor:
        line.color === "#BBFF2E" || line.color === "#2EBE69" ? "#000" : "#fff",
      x: xPx,
      y: chartInstance.value.convertToPixel({ yAxisIndex: 0 }, line.data[idx]),
    }))
    .sort((a, b) => b.val - a.val);

  tooltipStyle.value = {
    left:
      xPx > chartContainerRef.value.offsetWidth / 2
        ? `${xPx - 130}px`
        : `${xPx + 15}px`,
    top: "10%",
  };

  const newSeries = [];
  chartSourceData.sData.forEach((line, i) => {
    newSeries.push({});
    newSeries.push({ data: line.data.slice(0, idx + 1) });
  });
  chartInstance.value.setOption({ series: newSeries });
};

const fetchPriceHistory = async () => {
  const eventGuid = currentEventGuid.value;
  if (!eventGuid) return null;

  loadingPriceHistory.value = true;
  try {
    const res = await getEventPriceHistory({
      event_guid: eventGuid,
      range: selectedTimeRange.value,
    });
    const data = res?.data?.data || {};
    return buildChartSourceFromPriceHistory(data);
  } catch (err) {
    console.error("Fetch price history failed", err);
    return null;
  } finally {
    loadingPriceHistory.value = false;
  }
};

const initChart = (source = null) => {
  if (!chartRef.value) return;
  // 复用已有实例，避免切换时间范围时重复 init 报错
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value);
  }
  chartSourceData = source || null;
  if (!chartSourceData?.xData?.length || !chartSourceData?.sData?.length) {
    activeDots.value = [];
    tooltipTimeLabel.value = "";
    chartInstance.value.clear();
    return;
  }

  const series = [];
  chartSourceData.sData.forEach((line) => {
    series.push({
      type: "line",
      data: line.data,
      smooth: 0.3,
      symbol: "none",
      lineStyle: { color: line.color, opacity: 0.15, width: 2 },
    });
    series.push({
      type: "line",
      data: line.data,
      smooth: 0.3,
      symbol: "none",
      lineStyle: { color: line.color, width: 3 },
    });
  });

  const step = Math.max(1, Math.round(chartSourceData.xData.length / 4));
  chartInstance.value.setOption(
    {
      backgroundColor: "transparent",
      grid: { left: "2%", right: "12%", top: "20%", bottom: "12%" },
      xAxis: {
        type: "category",
        data: chartSourceData.xData,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#555",
          interval: (index) =>
            index === 0 ||
            index === chartSourceData.xData.length - 1 ||
            index % step === 0,
          formatter: (value, index) =>
            formatXAxisLabel(Number.isInteger(index) ? index : Number(value)),
        },
      },
      yAxis: {
        type: "value",
        position: "right",
        min: 0,
        max: 1,
        axisLabel: {
          formatter: (value) => `$${value.toFixed(2)}`,
          color: "#555",
        },
        splitLine: {
          lineStyle: {
            color: isDarkMode.value ? "#23262F" : "#E0E0E0",
            type: "dashed",
          },
        },
      },
      series,
    },
    true,
  );

  setTimeout(() => {
    const grid = chartInstance.value
      .getModel()
      .getComponent("grid")
      .coordinateSystem.getRect();
    gridRect = grid;
    updateOverlay(chartSourceData.xData.length - 1);
    // 图表数据就绪后重建子事件 → sData 索引映射
    rebuildSubEventIndexMap();
  }, 100);
};

// --- MQTT 实时价格推送合并到图表 ---
// sub_event_guid → sData 数组下标的快速查找映射（每次 initChart 后重建）
const subEventIndexMap = new Map();

const rebuildSubEventIndexMap = () => {
  subEventIndexMap.clear();
  if (!chartSourceData) return;
  outcomes.value.forEach((o, idx) => {
    const guid = o.sub_event_guid || o.subEventGuid;
    if (guid) subEventIndexMap.set(guid, idx);
  });
};

/**
 * 将 MQTT 推送的单个价格点合并到 chartSourceData 的对应 series。
 * @param {string} subGuid - 子事件 GUID
 * @param {string} t - ISO 时间字符串
 * @param {number|string} p - 价格（0~1 或 0~100）
 */
const pushMqttPricePoint = (subGuid, t, p) => {
  if (!chartSourceData) return;
  const seriesIdx = subEventIndexMap.get(subGuid);
  if (seriesIdx === undefined) return;

  const price = parsePrice(p);
  if (price === null) return;

  const timeLabel = t || new Date().toISOString();

  // 在 xLabels 中查找是否已有该时间戳
  let xIdx = chartSourceData.xLabels.indexOf(timeLabel);
  if (xIdx === -1) {
    // 追加新时间点
    chartSourceData.xLabels.push(timeLabel);
    chartSourceData.xData.push(chartSourceData.xData.length);
    xIdx = chartSourceData.xData.length - 1;
    // 其余所有 series 在该位置补 null
    chartSourceData.sData.forEach((line) => {
      line.data.push(null);
    });
  }

  // 更新目标 series 的价格
  chartSourceData.sData[seriesIdx].data[xIdx] = Number(price.toFixed(4));

  // 同步更新图例中的 chance（可选：更新 outcomes 百分比）
  const chancePercent = price <= 1 ? price * 100 : price;
  if (outcomes.value[seriesIdx]) {
    outcomes.value[seriesIdx].chance = Number(chancePercent.toFixed(1));
  }

  // 重绘图表到最新一帧（不处于拖拽状态时）
  if (!isDragging.value) {
    updateOverlay(chartSourceData.xData.length - 1);
  }
};

const handleMqttBusinessMessage = (data, _topic) => {
  if (!data || typeof data !== "object") return;
  const type = data.type;

  if (type === "price_update" && data.prices) {
    const subGuid = data.sub_event_guid || "";
    // prices 格式: { YES: [{t, p}], NO: [{t, p}] }
    // 本页每条折线对应一个子事件的 YES 方向概率
    const yesPoints = Array.isArray(data.prices?.YES) ? data.prices.YES : [];
    const latestYes = yesPoints[yesPoints.length - 1];
    if (latestYes?.p && subGuid) {
      pushMqttPricePoint(subGuid, latestYes.t || null, latestYes.p);
    }

    // 同时更新对应 outcome 的 yesPrice / noPrice
    const noPoints = Array.isArray(data.prices?.NO) ? data.prices.NO : [];
    const latestNo = noPoints[noPoints.length - 1];
    const seriesIdx = subEventIndexMap.get(subGuid);
    if (seriesIdx !== undefined && outcomes.value[seriesIdx]) {
      if (latestYes?.p)
        outcomes.value[seriesIdx].yesPrice = String(latestYes.p);
      if (latestNo?.p) outcomes.value[seriesIdx].noPrice = String(latestNo.p);
    }
  }
};

const stopMqttStream = () => {
  if (!iotMqtt) return;
  iotMqtt.destroy();
  iotMqtt = null;
};

const startMqttStream = async () => {
  if (mqttDestroyed) return;
  if (!shouldUseMqtt.value) return;
  if (isEventEnded.value) return;
  if (iotMqtt) return;

  const eventGuid = currentEventGuid.value;
  if (!eventGuid) return;

  // 为每个子事件订阅 price topic
  const subGuids = outcomes.value
    .map((o) => o.sub_event_guid || o.subEventGuid)
    .filter(Boolean);
  if (!subGuids.length) return;

  const topics = subGuids.map((sg) => `price/${eventGuid}/${sg}`);

  iotMqtt = createIotMqttClient({
    region: IOT_REGION,
    endpoint: IOT_ENDPOINT,
    identityPoolId: COGNITO_IDENTITY_POOL_ID,
  });

  iotMqtt.on("connect", () => {
    console.log("[MQTT detailH5] connected, subscribing", topics);
    iotMqtt.subscribe(topics);
  });

  iotMqtt.on("message", (_topic, data) => {
    if (mqttDestroyed) return;
    handleMqttBusinessMessage(data, _topic);
  });

  try {
    await iotMqtt.connect();
  } catch (e) {
    console.error("[MQTT detailH5] connect failed", e);
    iotMqtt?.destroy();
    iotMqtt = null;
  }
};

// --- 事件 ---
const onChartTouchMove = (e) => {
  if (!isDragging.value) return;
  const rect = chartContainerRef.value.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const idx = Math.round(
    chartInstance.value?.convertFromPixel(
      { xAxisIndex: 0 },
      Math.max(gridRect.x, Math.min(gridRect.x + gridRect.width, x)),
    ),
  );
  updateOverlay(idx);
};
const onChartTouchStart = (e) => {
  isDragging.value = true;
  onChartTouchMove(e);
};
const onChartTouchEnd = () => {
  isDragging.value = false;
  if (!chartSourceData?.xData?.length) return;
  updateOverlay(chartSourceData.xData.length - 1);
};

const handleTimeRangeChange = async (v) => {
  selectedTimeRange.value = v;
  // 切换时间范围：先断开旧的 MQTT，重新拉取历史数据后再重连
  stopMqttStream();
  const source = await fetchPriceHistory();
  initChart(source);
  // 图表初始化后（rebuildSubEventIndexMap 会在 setTimeout 100ms 内完成），重启 MQTT
  if (shouldUseMqtt.value && !isEventEnded.value) {
    setTimeout(() => startMqttStream(), 150);
  }
};
const selectOutcome = (i, type) => {
  const outcome = outcomes.value[i];
  if (!outcome) return;
  // 优先使用已经解析好的 subEventGuid
  let subGuid = outcome.subEventGuid || outcome.sub_event_guid || "";

  const ensureSubGuid = async () => {
    if (subGuid) return subGuid;

    const eventGuid = currentEventGuid.value;
    if (!eventGuid) return "";

    try {
      const currentLocale =
        localStorage.getItem("app-locale") || navigator.language || "en";
      const language = currentLocale.split("-")[0];
      const res = await getSubEventDetail({
        event_guid: eventGuid,
        language_label: language,
      });
      const data = res?.data?.data || {};
      const subEvents = Array.isArray(data.sub_events) ? data.sub_events : [];

      // 1) 先按索引匹配
      let sub = subEvents[i];
      // 2) 再按标题兜底匹配
      if (!sub && outcome.title) {
        sub = subEvents.find((s) => s.title === outcome.title);
      }
      const resolved = sub?.sub_event_guid || "";
      if (resolved) {
        outcome.subEventGuid = resolved;
        outcome.sub_event_guid = resolved;
      }
      return resolved;
    } catch (err) {
      console.error("Resolve sub_event_guid failed", err);
      return "";
    }
  };

  ensureSubGuid().then((resolvedGuid) => {
    subGuid = resolvedGuid || subGuid;

    outcome.selected = type;
    paymentSubEventGuid.value = subGuid;
    paymentOutcomeTitle.value = outcome.title || "";
    paymentInitialOutcome.value = type === "yes" ? "YES" : "NO";
    paymentInitialSide.value = "buy";
    paymentInitYesOutcome.value = outcome.yesOutcome;
    paymentInitNoOutcome.value = outcome.noOutcome;
    showPayment.value = true;
  });
};

const onOrderSuccess = (orderData) => {
  // 刷新相关数据
  fetchDetail();
  fetchActivity();
  fetchTopHolders();
};

// --- 收藏/取消收藏 ---
const handleBookmark = async () => {
  if (!address.value) {
    ElMessage.warning(t("pleaseConnectWallet") || "Please connect wallet");
    return;
  }

  const eventGuid = currentEventGuid.value;
  if (!eventGuid) return;

  try {
    const res = await toggleFavoriteEvent({
      user_address: address.value,
      event_guid: eventGuid,
    });

    const payload = res?.data ?? res;
    const code = payload?.code;
    if (code === 200 || code === 2000 || code === 0) {
      detailData.value.isFavorite = !detailData.value.isFavorite;
      ElMessage.success(
        detailData.value.isFavorite
          ? t("favoriteSuccess") || "Favorite success"
          : t("unfavoriteSuccess") || "Unfavorite success",
      );
    } else {
      ElMessage.error(payload?.msg || t("operateFailed") || "Operation failed");
    }
  } catch (err) {
    console.error("Toggle favorite failed", err);
    ElMessage.error(t("operateFailed") || "Operation failed");
  }
};

const openPredictionDetail = (outcome) => {
  router.push({
    name: "predictionDetailH5",
    query: {
      id: currentEventGuid.value,
      sub_event_guid: outcome.sub_event_guid || "",
    },
  });
};
onMounted(async () => {
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);
  if (SHOW_COMMENTS) fetchComments();
  fetchActivity();
  fetchTopHolders();
  // 先等 detail 加载完毕，outcomes 有数据后再初始化图表，
  // 以便 buildChartSourceFromPriceHistory 能按 guid/title 匹配正确颜色
  await fetchDetail();
  await nextTick();
  const source = await fetchPriceHistory();
  initChart(source);
  // 启动 MQTT 实时推送
  if (shouldUseMqtt.value && !isEventEnded.value) {
    setTimeout(() => startMqttStream(), 150);
  }
});

watch(
  () => address.value,
  (newAddr) => {
    if (newAddr && outcomes.value.length) {
      fetchOutcomesPositions();
    }
  },
);

watch(isEventEnded, (ended) => {
  if (ended) stopMqttStream();
});

onUnmounted(() => {
  clearInterval(countdownTimer);
  mqttDestroyed = true;
  stopMqttStream();
  chartInstance.value?.dispose();
});
</script>

<style scoped lang="scss">
.detail-h5-page {
  min-height: 100vh;
  background-color: var(--bg-page-h5);
  color: var(--bg-opposite);
  padding-top: 50px;
}

.content {
  padding: 16px;
}

// 头部
.event-header {
  margin-bottom: 24px;

  .event-title-section {
    display: flex;
    gap: 12px;
    align-items: flex-start;

    .event-avatar {
      width: 54px;
      height: 54px;
      border-radius: 8px;
    }

    .event-title {
      flex: 1;
      font-size: 16px;
      margin: 0;
      line-height: 1.4;
    }

    .event-countdown {
      display: flex;
      gap: 6px;

      .countdown-block {
        display: flex;
        flex-direction: column;
        align-items: center;

        .countdown-num {
          font-size: 18px;
          color: #e44096;
          font-weight: bold;
        }

        .countdown-label {
          font-size: 10px;
          color: var(--text-dark-gray);
        }
      }
    }

    .event-ended-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: bold;
      color: var(--text-dark-gray);
      background: var(--border-color);
      white-space: nowrap;
    }
  }

  .event-info-section {
    margin-top: 16px;
    font-size: 12px;
    color: var(--text-dark-gray);

    .event-info-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 10px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 4px;

        .info-icon {
          color: var(--text-dark-gray);
        }
      }
    }

    .bookmark-icon {
      margin-left: auto;
      width: 18px;
      cursor: pointer;
      transition: color 0.3s;
      color: var(--text-dark-gray);

      &.active {
        color: var(--text-color-y);
      }
    }

    .leverage-value,
    .return-value {
      color: var(--bg-opposite);
      font-weight: bold;
      margin-left: 4px;
    }
  }
}

// 图表
.chart-section {
  margin-bottom: 30px;

  .chart-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .time-range-selector {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .time-range-btn {
      background: none;
      border: none;
      color: var(--text-dark-gray);
      font-size: 12px;

      &.active {
        color: var(--bg-opposite);
        font-weight: bold;
      }
    }
  }

  .chart-legend {
    display: flex;
    gap: 12px;
    flex-wrap: wrap; // 增加换行支持
    margin-bottom: 10px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;

      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }
  }

  .chart-container {
    position: relative;
    width: 100%;
    height: 240px;
    touch-action: none;

    .chart-canvas {
      width: 100%;
      height: 100%;
    }

    .interaction-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .axis-pointer {
      position: absolute;
      top: 20%;
      bottom: 12%;
      width: 1px;
      background: repeating-linear-gradient(
        to bottom,
        var(--text-dark-gray) 0,
        var(--text-dark-gray) 4px,
        transparent 4px,
        transparent 8px
      );
      transform: translateX(-50%);
    }

    .data-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--border-color);
      transform: translate(-50%, -50%);
      z-index: 10;
    }

    .custom-tooltip {
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 20;

      .tt-time {
        font-size: 10px;
        color: var(--text-dark-gray);
        padding: 2px 4px;
        white-space: nowrap;
      }

      .tt-row {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: bold;
        min-width: 120px;
        display: flex;
        justify-content: space-between;
        gap: 8px;

        .tt-name {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tt-val {
          flex-shrink: 0;
        }
      }
    }
  }
}

// 预测列表
.outcome-prediction-section {
  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-dark-gray);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }

  .outcome-row {
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);

    .outcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .outcome-title {
        font-size: 15px;
        font-weight: bold;
      }

      .outcome-volume {
        font-size: 12px;
        color: var(--text-dark-gray);
        margin-top: 4px;
      }

      .outcome-chance {
        font-size: 18px;
        font-weight: 800;
      }
    }

    .outcome-divider {
      font-size: 12px;
      margin-bottom: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px 8px;

      span {
        padding: 2px 6px;
        border-radius: 6px;
        white-space: nowrap;
      }

      .outcome-divider-placeholder {
        visibility: hidden;
        display: inline-block;
      }

      span.yes {
        color: var(--text-color-y);
        background: var(--button-bg-y);
      }

      span.no {
        color: var(--text-color-n);
        background: var(--button-bg-n);
      }
    }

    .outcome-actions {
      display: flex;
      gap: 10px;

      .outcome-btn {
        flex: 1;
        height: 44px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
      }

      .yes-btn {
        background: var(--button-bg-y);
        color: var(--text-color-y);
      }

      .no-btn {
        background: var(--button-bg-n);
        color: var(--text-color-n);
      }
    }

    .outcome-actions-ended {
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      color: var(--text-dark-gray);
      background: var(--border-color);
    }
  }
}

// 公共标题
.section-block-title,
.view-results-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--bg-opposite);
  margin: 24px 0 16px;
}

// 折叠
.view-results-section {
  border-bottom: 1px solid var(--border-color);

  .view-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .view-results-title {
      margin: 20px 0;
    }
  }

  .el-icon {
    color: var(--bg-opposite);
  }

  .view-results-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-top: 1px solid var(--border-color);

    .view-results-desc {
      font-size: 14px;
      margin-bottom: 4px;
    }

    .view-results-volume {
      font-size: 12px;
      color: var(--text-dark-gray);
    }

    .view-results-status {
      font-weight: bold;
    }
  }
}

// 关于
.about-rows {
  .about-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    font-size: 14px;

    .about-left {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--bg-opposite);

      .about-icon {
        color: var(--bg-opposite);
      }
    }

    .about-value {
      color: var(--text-dark-gray);
    }
  }
}

// 规则
.rules-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-dark-gray);
  margin-bottom: 30px;
}

// 底部选项卡
.tabs-section {
  .tabs-nav {
    display: flex;
    gap: 24px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 20px;

    .tab-nav-item {
      background: none;
      border: none;
      padding: 10px 0;
      color: var(--text-dark-gray);
      font-size: 16px;
      font-weight: bold;
      position: relative;

      &.active {
        color: var(--bg-opposite);

        &::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--bg-opposite);
        }
      }
    }
  }

  .tab-pane {
    padding-bottom: 40px;
  }

  .empty-state {
    padding: 28px 0;
    text-align: center;
    font-size: 13px;
    color: var(--text-dark-gray);
  }

  .comment-item {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }

    .comment-main {
      flex: 1;

      .comment-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;

        .user-name {
          font-size: 13px;
          font-weight: bold;
        }

        .comment-tag {
          font-size: 11px;
          padding: 2px 10px;
          border-radius: 999px;
          background: rgba(46, 190, 105, 0.16);
          color: #2ebe69;
          font-weight: 600;
          max-width: 70%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          &.no {
            background: rgba(228, 64, 150, 0.16);
            color: #e44096;
          }
        }

        .comment-time {
          color: var(--text-dark-gray);
          font-size: 11px;
          margin-left: auto;
        }
      }

      .comment-msg {
        font-size: 14px;
        line-height: 1.4;
      }

      .comment-actions {
        color: var(--text-dark-gray);
        font-size: 12px;
        margin-top: 8px;

        .likes {
          display: flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            font-size: 14px;
            color: var(--text-dark-gray);
          }
        }
      }
    }
  }

  .holds-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    .hold-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 15px;
    }

    .holder-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;

      .avatar-wrap {
        position: relative;

        img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .rank-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          border: 1px solid var(--border-color);
        }
      }

      .holder-info {
        .name {
          font-size: 12px;
          color: var(--text-dark-gray);
        }

        .amount {
          font-size: 12px;
          font-weight: bold;

          &.yes {
            color: var(--text-color-y);
          }

          &.no {
            color: var(--text-color-n);
          }
        }
      }
    }
  }

  .activity-item {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }

    .activity-info {
      .user-name {
        font-size: 13px;
        font-weight: bold;
      }

      .act-desc {
        font-size: 13px;
        margin-top: 4px;

        .highlight {
          font-weight: bold;

          &.yes {
            color: var(--text-color-y);
          }

          &.no {
            color: var(--text-color-n);
          }
        }
      }

      .act-time {
        font-size: 11px;
        color: #555;
        margin-top: 4px;
      }
    }
  }
}

// 动画
.view-results-collapse-enter-active,
.view-results-collapse-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.view-results-collapse-enter-from,
.view-results-collapse-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
