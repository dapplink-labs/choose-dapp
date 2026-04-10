<template>
  <transition name="slide-up">
    <div v-if="modelValue" class="trade-overlay" @click.self="handleClose">
      <div class="trade-modal">
        <!-- 顶部拉条 -->
        <div class="grabber" />

        <!-- 1. 顶部切换栏 -->
        <div class="trade-nav">
          <div class="side-tabs">
            <button
              type="button"
              :class="['nav-tab', { active: activeSide === 'buy' }]"
              @click="switchSide('buy')"
            >
              {{ $t("payment.buy") }}
            </button>
            <button
              type="button"
              :class="['nav-tab', { active: activeSide === 'sell' }]"
              @click="switchSide('sell')"
            >
              {{ $t("payment.sell") }}
            </button>
          </div>
          <div class="type-pills">
            <button
              type="button"
              :class="['pill', { active: orderType === 'market' }]"
              @click="switchOrderType('market')"
            >
              {{ $t("payment.marketOrder") }}
            </button>
            <button
              type="button"
              :class="['pill', { active: orderType === 'limit' }]"
              @click="switchOrderType('limit')"
            >
              {{ $t("payment.limitOrder") }}
            </button>
          </div>
        </div>

        <div class="trade-body">
          <!-- 2. 标题与余额 -->
          <div class="target-info">
            <h3 class="target-title">{{ outcomeTitle }}</h3>
            <div class="target-row">
              <div
                class="outcome-badge"
                :class="{
                  'outcome-yes': ['yes', 'up'].includes(
                    outcomeBadge.toLowerCase(),
                  ),
                  'outcome-no': ['no', 'down'].includes(
                    outcomeBadge.toLowerCase(),
                  ),
                }"
              >
                {{ outcomeBadge }}
                <span
                  class="icon"
                  aria-hidden="true"
                  style="display: inline-flex"
                  @click="toggleOutcome"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="11.997"
                    viewBox="0 0 12 11.997"
                  >
                    <path
                      fill="currentColor"
                      d="M12.028,5.674h-.994a.126.126,0,0,0-.125.125V9.787H2.652V8.654a.128.128,0,0,0-.028-.081.131.131,0,0,0-.183-.022L.2,10.307a.137.137,0,0,0,0,.206l2.239,1.756a.128.128,0,0,0,.081.028.133.133,0,0,0,.131-.131V11.032h8.383a1.122,1.122,0,0,0,1.12-1.122V5.8a.129.129,0,0,0-.128-.125ZM.28,6.923h.994A.126.126,0,0,0,1.4,6.8V2.81H9.657V3.943a.128.128,0,0,0,.028.081.131.131,0,0,0,.183.022l2.239-1.757a.137.137,0,0,0,0-.206L9.867.328A.128.128,0,0,0,9.786.3a.133.133,0,0,0-.131.131V1.565H1.275A1.122,1.122,0,0,0,.156,2.687V6.8A.125.125,0,0,0,.28,6.923Z"
                      transform="translate(-0.155 -0.3)"
                    />
                  </svg>
                </span>
              </div>
              <div class="balance-info">
                <el-icon>
                  <Wallet />
                </el-icon>
                <span v-if="activeSide === 'buy'"
                  >{{ $t("payment.balance")
                  }}{{ balanceLoading ? "..." : `$${userBalance}` }}</span
                >
                <span v-else
                  >{{ $t("payment.shares") || "Shares" }}:
                  {{ currentHoldingShares }}</span
                >
              </div>
            </div>
          </div>

          <div class="divider" />

          <!-- 3. 限价输入（仅限价单显示） -->
          <div class="input-section" v-if="orderType === 'limit'">
            <label class="input-label">{{ $t("payment.limitPrice") }}</label>
            <div class="stepper-box">
              <button class="step-btn" @click="stepPrice(-1)">-</button>
              <div class="step-center">
                <input
                  v-model.number="price"
                  type="number"
                  class="price-input"
                  min="1"
                  max="99"
                  @blur="clampPrice"
                />
                <span class="price-unit">¢</span>
              </div>
              <button class="step-btn" @click="stepPrice(1)">+</button>
            </div>
          </div>

          <!-- 4. 市价买入 → 金额输入；其他 → 份数输入 -->
          <div class="input-section" style="margin-bottom: 10px">
            <label class="input-label">
              {{
                isMarketBuy
                  ? $t("payment.amount") || "Amount"
                  : $t("payment.shares")
              }}
            </label>
            <div class="input-box">
              <input
                v-model="inputValue"
                type="number"
                class="main-input"
                :placeholder="isMarketBuy ? '0.00' : '0'"
                @input="onInputChange"
              />
            </div>
          </div>
          <!-- 快捷加减按钮 -->
          <div class="quick-shares-row">
            <div class="quick-shares">
              <button
                v-for="val in quickAdjustValues"
                :key="val"
                class="quick-share-btn"
                @click="adjustInput(val)"
              >
                {{ val > 0 ? "+" + val : val }}
              </button>
            </div>
          </div>

          <!-- 5. 杠杆（暂不对接） -->
          <div class="input-section" style="opacity: 0.4; pointer-events: none">
            <label class="input-label">{{ $t("payment.leverage") }}</label>
            <div class="leverage-group">
              <button
                :class="['lev-btn', { active: leverage === 2 }]"
                @click="leverage = 2"
              >
                x 2
              </button>
              <button
                :class="['lev-btn', { active: leverage === 5 }]"
                @click="leverage = 5"
              >
                🚀 x 5
              </button>
              <button
                :class="['lev-btn', { active: leverage === 10 }]"
                @click="leverage = 10"
              >
                🔥 x MAX
              </button>
            </div>
            <p class="leverage-tip">{{ $t("payment.maxLeverageTip") }}</p>
          </div>

          <!-- 5.1 设置过期时间 -->
          <div class="input-section expiry-section">
            <div class="expiry-header">
              <label class="input-label">{{ $t("payment.expiration") }}</label>
              <button
                type="button"
                class="expiry-switch"
                :class="{ on: enableExpiry }"
                @click="enableExpiry = !enableExpiry"
                aria-label="toggle expiration"
              >
                <span class="knob" />
              </button>
            </div>

            <div v-if="enableExpiry" class="expiry-pills">
              <button
                v-for="opt in expiryOptions"
                :key="opt.key"
                type="button"
                class="expiry-pill"
                :class="{ active: expiryPreset === opt.key }"
                @click="expiryPreset = opt.key"
              >
                {{ opt.label }}
              </button>
            </div>

            <div
              v-if="enableExpiry && expiryPreset === 'custom'"
              class="expiry-custom"
            >
              <input
                v-model.number="customExpiryMinutes"
                type="number"
                min="1"
                step="1"
                class="expiry-input"
              />
              <span class="expiry-unit">{{ $t("payment.expiryMinutes") }}</span>
            </div>
          </div>

          <!-- 6. 结算汇总 -->
          <div class="summary-section">
            <div class="summary-row">
              <span class="s-label">{{ $t("payment.total") }}</span>
              <span class="s-value">{{ displayTotal }}</span>
            </div>
            <div class="summary-row">
              <span class="s-label">{{ $t("payment.potentialGain") }}</span>
              <span class="s-value-gain">💵 +{{ displayGain }}</span>
            </div>
          </div>

          <!-- 7. 执行按钮 -->
          <button
            class="execute-btn"
            :disabled="submitting || !canSubmit"
            @click="handleConfirm"
          >
            <span v-if="submitting">{{
              $t("payment.submitting") || "Submitting..."
            }}</span>
            <span v-else>{{ executeLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Wallet } from "@element-plus/icons-vue";
import { useAccount } from "@wagmi/vue";
import {
  getUserBalances,
  makeOrder,
  getOrderBook,
  getUserPositions,
} from "@/api/APIEvent";
import { ElMessage } from "element-plus";
import { isTradeBlockedForEvent } from "@/utils/blockedTradeEventGuids";
import { AxiosResponse } from "axios";

const { address } = useAccount();

const { t } = useI18n();

const props = defineProps({
  modelValue: Boolean,
  // 事件标题（父事件）
  eventTitle: { type: String, default: "" },
  // 子事件标题（outcome 名称）
  outcomeTitle: { type: String, default: "" },
  // 事件 GUID
  eventGuid: { type: String, default: "" },
  // 子事件 GUID
  subEventGuid: { type: String, default: "" },
  // 初始方向 YES / NO
  initialOutcome: { type: String, default: "YES" },
  // 初始交易动作 buy / sell
  initialSide: { type: String, default: "buy" },
  // yes / no 自定义文本
  yesOutcome: { type: String, default: "" },
  noOutcome: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue", "order-success"]);

// ===================== 基础状态 =====================
const activeSide = ref("buy");
const orderType = ref("market");
const price = ref(48);
const inputValue = ref("");
const leverage = ref(2);
const outcomeBadge = ref(""); // 'yes' | 'no'
const enableExpiry = ref(false);
const expiryPreset = ref("5m"); // '5m' | '1h' | '12h' | '24h' | 'eod' | 'custom'
const customExpiryMinutes = ref(5);

const orderBookData = ref<OrderBookData | null>(null);

const expiryOptions = computed(() => [
  { key: "5m", label: t("payment.expiry5m") || "5m" },
  { key: "1h", label: t("payment.expiry1h") || "1h" },
  { key: "12h", label: t("payment.expiry12h") || "12h" },
  { key: "24h", label: t("payment.expiry24h") || "24h" },
  { key: "eod", label: t("payment.expiryEod") || "EOD" },
  { key: "custom", label: t("payment.expiryCustom") || "Custom" },
]);

// ===================== 异步状态 =====================
const userBalance = ref("0.00");
const balanceLoading = ref(false);
const submitting = ref(false);

type UserPosition = {
  outcome: string;
  shares: string | number;
};

type OrderBookPriceLevel = {
  price: string | number;
  [key: string]: unknown;
};

type OrderBookSide = {
  bids?: OrderBookPriceLevel[];
  asks?: OrderBookPriceLevel[];
};

type OrderBookData = Record<string, OrderBookSide>;

// 用户当前事件的持仓
const userPositions = ref<UserPosition[]>([]);

const currentHoldingShares = computed(() => {
  const position = userPositions.value.find(
    (p) =>
      String(p.outcome).toUpperCase() ===
      String(outcomeBadge.value).toUpperCase(),
  );
  return position ? Number(position.shares) : 0;
});

// ===================== 计算属性 =====================
const isMarketBuy = computed(
  () => activeSide.value === "buy" && orderType.value === "market",
);

// 快捷加减值：市价买入用金额步进，其余用份数步进
const quickAdjustValues = computed(() =>
  isMarketBuy.value ? [-100, -10, 10, 100] : [-100, -10, 10, 100],
);

// 汇总展示
const displayTotal = computed(() => {
  if (orderType.value === "market") {
    if (isMarketBuy.value) {
      // 市价买入：用户输入的就是金额
      return inputValue.value
        ? `$${Number(inputValue.value).toFixed(2)}`
        : "$0.00";
    }
    // 市价卖出：使用 orderBook 的 bids 预测
    const sideStr = outcomeBadge.value?.toLowerCase() || ""; // 'yes' or 'no'
    const bids = orderBookData.value?.[sideStr]?.bids || [];
    if (bids.length > 0) {
      const estPrice = Number(bids[0].price) || 0;
      const s = Number(inputValue.value) || 0;
      return `$${(estPrice * s).toFixed(2)}`;
    }
    return "0";
  }
  // 限价单：price * shares / 100
  const p = Number(price.value) || 0;
  const s = Number(inputValue.value) || 0;
  return `$${((p * s) / 100).toFixed(2)}`;
});

const displayGain = computed(() => {
  if (orderType.value === "market" && !isMarketBuy.value) {
    // 由于移除了卖出预览接口，无法预估利润，显示占位符
    return "0";
  }
  if (orderType.value === "market" && isMarketBuy.value) {
    // 由于移除了买入预览接口，无法预估份额，显示占位符
    return `0`;
  }
  // 限价单潜在收益 = shares
  const s = Number(inputValue.value) || 0;
  return `$${s.toFixed(2)}`;
});

const canSubmit = computed(() => {
  const val = Number(inputValue.value);
  // 提交按钮只依赖本地输入是否有效，其余校验在提交时处理
  return val > 0;
});

// 执行按钮文案
const executeLabel = computed(() => {
  const sideText =
    activeSide.value === "buy"
      ? t("payment.buy") || "Buy"
      : t("payment.sell") || "Sell";
  const ynText = outcomeBadge.value;
  return `${sideText} ${ynText}`;
});

// ===================== 方法 =====================
function toggleOutcome() {
  const current = outcomeBadge.value;
  const yesText = props.yesOutcome || "YES";
  const noText = props.noOutcome || "NO";

  if (current === yesText) {
    outcomeBadge.value = noText;
  } else if (current === noText) {
    outcomeBadge.value = yesText;
  } else {
    // fallback based on common values
    const lower = current.toLowerCase();
    if (["yes", "up"].includes(lower)) {
      outcomeBadge.value = lower === "up" ? "DOWN" : "NO";
    } else {
      outcomeBadge.value = lower === "down" ? "UP" : "YES";
    }
  }
}

function switchSide(side: string) {
  if (activeSide.value === side) return;
  activeSide.value = side;
  inputValue.value = "";
}

function switchOrderType(type: string) {
  if (orderType.value === type) return;
  orderType.value = type;
  inputValue.value = "";
}

function stepPrice(delta: number) {
  price.value = Math.min(99, Math.max(1, (Number(price.value) || 1) + delta));
}

function clampPrice() {
  const v = Number(price.value);
  if (isNaN(v) || v < 1) price.value = 1;
  else if (v > 99) price.value = 99;
  else price.value = Math.floor(v);
}

function adjustInput(val: number) {
  const current = Number(inputValue.value) || 0;
  inputValue.value = String(Math.max(0, current + val));
}

function onInputChange() {
  // 之前用来触发预览逻辑，现在移除
}

// ===================== API 调用 =====================
async function fetchBalance() {
  balanceLoading.value = true;
  try {
    const res = await getUserBalances({ user_address: address.value });
    const data = res?.data?.data;
    if (data) {
      userBalance.value = data.cash || data.portfolio || "0.00";
    }
  } catch (err) {
    console.error("Fetch balance failed", err);
  } finally {
    balanceLoading.value = false;
  }
}

async function fetchOrderBookData() {
  if (!props.eventGuid || !props.subEventGuid) return;
  try {
    const res = await getOrderBook({
      event_guid: props.eventGuid,
      sub_event_guid: props.subEventGuid,
      outcome: "all",
    });
    const code = res?.data?.code;
    console.log(res);

    if (code === 2000) {
      orderBookData.value = res?.data?.data || null;
    }
  } catch (err) {
    console.error("Fetch order book failed in modal", err);
  }
}

async function fetchUserPositions() {
  if (!props.subEventGuid) return;
  try {
    const currentLocale =
      localStorage.getItem("app-locale") || navigator.language || "en";
    const languageLabel = currentLocale.split("-")[0];
    const res = await getUserPositions({
      user_address: address.value || "",
      status: "holding",
      page: 1,
      page_size: 2000,
      language_label: languageLabel,
      sub_event_guid: props.subEventGuid,
    });
    if (isRespSuccess(res)) {
      const list = Array.isArray(res?.data?.data?.list)
        ? res.data.data.list
        : [];
      userPositions.value = list;
    }
  } catch (err) {
    console.error("Fetch positions failed in modal", err);
  }
}

const isRespSuccess = (res: { data: { code: any } }) => {
  const code = res?.data?.code;
  return code === 200 || code === 2000;
};

const isOrderSuccess = (res: AxiosResponse<any, any, {}>) => {
  const code = res?.data?.code;
  const msg = String(res?.data?.message || "").toLowerCase();
  // 后端目前有多种成功码：0 / 200 / 2000，且 message="order created successfully"
  if (code === 0 || code === 200 || code === 2000) return true;
  if (msg.includes("order created successfully") || msg === "success")
    return true;
  return false;
};

// 计算订单过期时间字符串（YYYY-MM-DD HH:mm:ss），仅在启用过期时间时返回
function buildExpireAt() {
  if (!enableExpiry.value) return null;

  const now = new Date();
  let target;

  if (expiryPreset.value === "eod") {
    // 当天 23:59:59（本地时间）
    target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );
    // 如果当前已过 23:59:59，则顺延到下一天的 23:59:59
    if (target.getTime() <= now.getTime()) {
      target = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        23,
        59,
        59,
      );
    }
  } else {
    let minutes = 0;
    switch (expiryPreset.value) {
      case "5m":
        minutes = 5;
        break;
      case "1h":
        minutes = 60;
        break;
      case "12h":
        minutes = 12 * 60;
        break;
      case "24h":
        minutes = 24 * 60;
        break;
      case "custom":
        minutes = Math.max(1, Number(customExpiryMinutes.value) || 0);
        break;
      default:
        minutes = 0;
    }
    if (!minutes) return null;
    target = new Date(now.getTime() + minutes * 60 * 1000);
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const y = target.getFullYear();
  const m = pad(target.getMonth() + 1);
  const d = pad(target.getDate());
  const hh = pad(target.getHours());
  const mm = pad(target.getMinutes());
  const ss = pad(target.getSeconds());

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

async function handleConfirm() {
  if (submitting.value || !canSubmit.value) return;

  if (!props.eventGuid || !props.subEventGuid) {
    ElMessage.error(t("payment.missingIds") || "Missing event or sub-event id");
    return;
  }

  // 兜底拦截：部分事件尚未开放交易（包含 event_guid / sub_event_guid 命中配置）
  if (
    isTradeBlockedForEvent(props.eventGuid) ||
    isTradeBlockedForEvent(props.subEventGuid)
  ) {
    ElMessage.warning(t("home.tradeNotOpen") || "暂未开启");
    return;
  }

  // 校验余额 (Check balance for buy orders)
  if (activeSide.value === "buy") {
    let requiredAmount = 0;
    if (orderType.value === "market") {
      requiredAmount = Number(inputValue.value) || 0;
    } else {
      const p = Number(price.value) || 0;
      const s = Number(inputValue.value) || 0;
      requiredAmount = (p * s) / 100;
    }

    const currentBalance = Number(userBalance.value) || 0;
    if (requiredAmount > currentBalance) {
      ElMessage.error(
        t("payment.insufficientBalance") || "Insufficient balance",
      );
      return;
    }
  }

  // 校验持仓 (Check positions for sell orders)
  if (activeSide.value === "sell") {
    const sellShares = Number(inputValue.value) || 0;
    const holdingShares = currentHoldingShares.value;

    if (sellShares > holdingShares) {
      ElMessage.error(t("payment.insufficientShares") || "Insufficient shares");
      return;
    }
  }

  submitting.value = true;
  try {
    const orderParams: any = {
      event_guid: props.eventGuid,
      sub_event_guid: props.subEventGuid,
      outcome: outcomeBadge.value,
      side: activeSide.value,
      order_type: orderType.value,
      user_address: address.value,
    };

    if (orderType.value === "market") {
      if (activeSide.value === "buy") {
        // 市价买入：传 amount
        orderParams.amount = String(inputValue.value);
      } else {
        // 市价卖出：传 shares
        orderParams.shares = String(inputValue.value);
      }
    } else {
      // 限价单：传 price + shares
      orderParams.price = String(Number(price.value) / 100); // ¢ → USDT
      orderParams.shares = String(inputValue.value);
    }

    // 过期时间（可选）
    const expireAt = buildExpireAt();
    if (expireAt) {
      orderParams.expire_at = expireAt;
    }

    const res = await makeOrder(orderParams);
    if (!res || !res.data) {
      ElMessage.error(
        orderType.value === "market"
          ? t("payment.orderFailed")
          : t("payment.tradeFailed"),
      );
      return;
    }

    if (isOrderSuccess(res)) {
      emit("order-success", res.data.data);
      ElMessage.success(
        orderType.value === "market" ? "" : t("payment.tradeSuccess"),
      );
      fetchBalance(); // 交易成功后刷新用户余额
    } else {
      ElMessage.error(
        res.data.message ||
          t("payment.tradeFailed") ||
          t("payment.orderFailed") ||
          "Trade failed",
      );
    }
  } catch (err) {
    console.error("Make order failed", err);
    ElMessage.error(
      t("payment.tradeFailed") || t("payment.orderFailed") || "Trade failed",
    );
  } finally {
    submitting.value = false;
  }
}

function handleClose() {
  emit("update:modelValue", false);
}

// ===================== 生命周期 & Watch =====================
// 弹窗打开时：初始化状态 & 获取余额
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      activeSide.value = props.initialSide || "buy";
      outcomeBadge.value = props.initialOutcome;
      orderType.value = "market";
      inputValue.value = "";
      fetchBalance();
      fetchOrderBookData();
      fetchUserPositions();
    } else {
      orderBookData.value = null;
      userPositions.value = [];
    }
  },
);
</script>

<style scoped lang="scss">
.trade-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 2001;
  display: flex;
  align-items: flex-end;
}

.trade-modal {
  width: 100%;
  background: var(--bg-page);
  border-radius: 20px 20px 0 0;
  padding: 0 16px 24px;
  color: var(--bg-opposite);
  font-family: sans-serif;
  overflow-y: auto;
  max-height: 80vh;
  position: relative;
}

.grabber {
  position: sticky;
  top: -1px;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1;
  height: 30px;
  background: var(--bg-page);
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    width: 40px;
    height: 4px;
    background: var(--text-dark-gray);
    border-radius: 2px;
    margin: 0 auto 16px;
  }
}

/* 导航切换 */
.trade-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);

  .side-tabs {
    display: flex;
    gap: 20px;

    .nav-tab {
      background: none;
      border: none;
      font-family:
        PingFang SC,
        PingFang SC;
      font-weight: 600;
      font-size: 18px;
      padding: 4px 0;
      cursor: pointer;
      padding-bottom: 12px;
      color: var(--text-dark-gray);
      border-bottom: 2px solid transparent;

      &.active {
        color: var(--text-color-y);
        border-bottom: 2px solid var(--text-color-y);
      }
    }
  }

  .type-pills {
    background: var(--bg-page);
    padding: 4px;
    border-radius: 6px;
    display: flex;

    .pill {
      border: none;
      background: none;
      font-family:
        PingFang SC,
        PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: var(--text-dark-gray);
      padding: 4px 6px;
      border-radius: 4px;
      cursor: pointer;

      &.active {
        background: var(--text-dark-gray);
        color: var(--bg-opposite);
      }
    }
  }
}

/* 目标信息 */
.target-info {
  .target-title {
    font-family:
      PingFang SC,
      PingFang SC;
    font-weight: 600;
    font-size: 16px;
    color: var(--bg-opposite);
    margin: 0 0 12px;
  }

  .target-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .outcome-badge {
    background: var(--button-bg-n);
    color: var(--text-color-n);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;

    &.outcome-yes {
      background: var(--button-bg-y);
      color: var(--text-color-y);
    }

    &.outcome-no {
      background: var(--button-bg-n);
      color: var(--text-color-n);
    }

    &.active {
      background: var(--button-bg-y);
      color: var(--text-color-y);
    }
  }

  .balance-info {
    color: var(--text-dark-gray);
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;

    span {
      font-size: 13px;
      font-weight: 400;
      color: var(--text-dark-gray);
      // 禁止折行
      white-space: nowrap;
    }
  }
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 20px 0;
}

/* 输入区域 */
.input-section {
  display: flex;
  align-items: center;
  margin-top: 20px;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap; // 方便提示文字换行

  .input-label {
    font-size: 15px;
    font-weight: bold;
    color: var(--text-dark-gray);
  }
}

.stepper-box {
  flex: 0.8;
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  height: 48px;
  overflow: hidden;

  .step-btn {
    width: 50px;
    height: 100%;
    background: none;
    border: none;
    color: var(--text-dark-gray);
    font-size: 20px;
    cursor: pointer;

    &:active {
      background: var(--border-color);
    }
  }

  .step-center {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .price-input {
    width: 56px;
    background: none;
    border: none;
    color: var(--bg-opposite);
    text-align: center;
    font-size: 18px;
    font-weight: 800;
    outline: none;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  .price-unit {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-dark-gray);
  }
}

.input-box {
  flex: 1;
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;

  .main-input {
    width: 100%;
    background: none;
    border: none;
    color: var(--bg-opposite);
    text-align: right;
    font-size: 18px;
    font-weight: bold;
    outline: none;
  }
}

.quick-shares-row {
  margin: 8px 0 0;
  display: flex;
  justify-content: flex-end; // 整行按钮靠右对齐
}

.quick-shares {
  display: flex;
  gap: 8px;

  .quick-share-btn {
    background: #2f2f2f;
    border: none;
    color: var(--bg-opposite);
    padding: 6px 15px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
  }
}

.avg-price-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;

  .avg-price-text {
    font-size: 12px;
    color: var(--text-dark-gray);
  }
}

/* 预览信息区 */
.preview-info-row {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;

  .preview-loading {
    font-size: 12px;
    color: var(--text-dark-gray);
  }

  .preview-details {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;

    .preview-text {
      font-size: 12px;
      color: var(--text-dark-gray);
    }
  }
}

/* 杠杆 */
.leverage-group {
  flex: 0.8;
  display: flex;
  gap: 8px;
  justify-content: flex-end; // 杠杆按钮靠右

  .lev-btn {
    opacity: 0.5;
    flex: 1;
    background: #2f2f2f;
    border: none;
    color: var(--text-dark-gray);
    padding: 10px 0;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;

    // &.active {
    //     background: #eee;
    //     color: #000;
    // }
  }
}

.leverage-tip {
  padding-bottom: 20px;
  font-size: 11px;
  color: var(--text-dark-gray);
  text-align: right;
  width: 100%;
  flex-basis: 100%; // 在 flex 容器中独占一整行
  border-bottom: 1px solid var(--border-color);
}

/* 过期时间 */
.expiry-section {
  margin-top: 14px;
}

.expiry-header {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  gap: 12px;
}

.expiry-switch {
  width: 52px;
  height: 30px;
  border-radius: 999px;
  border: none;
  background: #2f2f2f;
  position: relative;
  padding: 0;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.2s ease;

  .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: #ffffff;
    transition: transform 0.2s ease;
  }

  &.on {
    background: var(--text-color-y);

    .knob {
      transform: translateX(22px);
    }
  }
}

.expiry-pills {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.expiry-pill {
  min-width: 60px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: #2f2f2f;
  color: var(--text-dark-gray);
  font-size: 14px;
  font-weight: 600;
  opacity: 0.8;
  cursor: pointer;

  &.active {
    background: var(--button-bg-y);
    color: var(--text-color-y);
    opacity: 1;
  }
}

.expiry-custom {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.expiry-input {
  width: 96px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--bg-opposite);
  text-align: right;
  padding: 0 10px;
  font-size: 14px;
  outline: none;
}

.expiry-unit {
  font-size: 12px;
  color: var(--text-dark-gray);
}

/* 汇总 */
.summary-section {
  margin: 24px 0;

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .s-label {
      color: #888;
      font-size: 15px;
      font-weight: bold;
    }

    .s-value {
      font-size: 18px;
      font-weight: 900;
    }

    .s-value-gain {
      font-size: 18px;
      font-weight: 900;
      color: var(--text-color-y);
    }
  }
}

/* 确认按钮 */
.execute-btn {
  width: 100%;
  height: 52px;
  background: var(--text-color-y);
  border: none;
  border-radius: 14px;
  font-family:
    PingFang SC,
    PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #000000;
  cursor: pointer;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:active {
      transform: none;
    }
  }
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.theme-light {
  .quick-share-btn {
    background: #fff !important;
    border: 1px solid var(--text-dark-gray);
  }

  .lev-btn {
    background: var(--text-dark-gray) !important;
    color: #444;
  }
}
</style>
