<template>
  <div class="bitcoin-up-down-page">
    <!-- 1. 固定顶部状态栏 -->
    <div class="top-bar">
      <button class="top-btn back-btn" type="button" @click="handleBack">
        <el-icon>
          <ArrowLeft />
        </el-icon>
      </button>
      <div class="top-right">
        <div class="top-center">
          <el-icon class="trophy-icon">
            <Trophy />
          </el-icon>
          <span class="top-volume">{{ topVolumeText }}</span>
        </div>
        <button class="top-btn bookmark-btn" type="button">
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
        </button>
      </div>
    </div>

    <!-- 滚动容器 -->
    <div class="content-scroller" @scroll="handleScroll">
      <!-- 2. 吸顶标题区与倒计时 -->
      <div class="asset-profile-wrapper" :class="{ 'is-sticky': isSticky }">
        <div class="asset-profile">
          <div class="asset-logo">
            <svg viewBox="0 0 32 32" width="100%" height="100%">
              <path
                fill="#fff"
                d="M21.7 14.3c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.6-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.2v-.1l-2.2-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.1c0 0 .1 0 .2.1h-.2l-1.1 4.4c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.8-2.1 0-3.3-1.5-4.1 1.1-.2 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.2-4.2 1-5.4.7l1-3.9c1.2.3 5 .9 4.4 3.2zm.6-5.3c-.5 2-3.5.9-4.5.7l.9-3.5c1 .2 4.1.7 3.6 2.8z"
              />
            </svg>
          </div>
          <div class="asset-text">
            <h2>
              <span>{{
                detailData.eventTitle || $t("bitcoinUpDown.questionTitle")
              }}</span>
              <span v-if="showBaopeiTag" class="baopei-tag">{{
                $t("bitcoinUpDown.baopei")
              }}</span>
            </h2>
            <p v-if="titleTimeRangeText" class="asset-time-range">
              {{ titleTimeRangeText }}
            </p>
          </div>
          <!-- 倒计时规则：进入历史视图隐藏；剩余时间超过 24h 隐藏 -->
          <div
            class="timer"
            v-show="activeSegmentMode !== 'past' && shouldShowCountDown"
          >
            <div class="time-block">
              <div class="time-value">
                <span
                  class="digit-wrapper"
                  v-for="(char, i) in countDown.hours.split('')"
                  :key="'h' + i"
                >
                  <transition name="fast-roll"
                    ><span class="digit unit" :key="char">{{
                      char
                    }}</span></transition
                  >
                </span>
              </div>
              <span class="label">{{ $t("bitcoinUpDown.hrs") }}</span>
            </div>
            <div class="time-block">
              <div class="time-value">
                <span
                  class="digit-wrapper"
                  v-for="(char, i) in countDown.minutes.split('')"
                  :key="'m' + i"
                >
                  <transition name="fast-roll"
                    ><span class="digit unit" :key="char">{{
                      char
                    }}</span></transition
                  >
                </span>
              </div>
              <span class="label">{{ $t("bitcoinUpDown.mins") }}</span>
            </div>
            <div class="time-block">
              <div class="time-value">
                <span
                  class="digit-wrapper"
                  v-for="(char, i) in countDown.seconds.split('')"
                  :key="'s' + i"
                >
                  <transition name="fast-roll"
                    ><span class="digit unit" :key="char">{{
                      char
                    }}</span></transition
                  >
                </span>
              </div>
              <span class="label">{{ $t("bitcoinUpDown.secs") }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 价格看板 -->
      <div class="price-dashboard">
        <div class="price-item">
          <div class="label">{{ $t("bitcoinUpDown.openPrice") }}</div>
          <div class="value">
            {{
              activeSegmentMode === "future"
                ? "--"
                : formatPrice(displayTargetPrice)
            }}
          </div>
        </div>

        <div class="price-item current">
          <div class="label">
            {{
              activeSegmentMode === "past"
                ? $t("bitcoinUpDown.finalPrice")
                : $t("bitcoinUpDown.currentPrice")
            }}
            <span
              v-if="activeSegmentMode !== 'future'"
              :class="['diff', diffData.status]"
            >
              <span class="svg-icon-wrapper diff-icon" :class="diffData.status">
                <svg v-if="diffData.status === 'up'" viewBox="0 0 12 12">
                  <path
                    d="M5.14 2.22a1 1 0 011.72 0l4.28 7.4A1 1 0 0110.28 11H1.72a1 1 0 01-.86-1.5z"
                    fill="currentColor"
                  />
                </svg>
                <svg v-else viewBox="0 0 12 12">
                  <path
                    d="M10.86 1H1.72a1 1 0 00-.86 1.5l4.28 7.4a1 1 0 001.72 0l4.28-7.4A1 1 0 0010.86 1z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              ${{ diffData.value }}
            </span>
          </div>
          <div class="value price-value">
            <span class="symbol">$</span>
            <template v-if="activeSegmentMode === 'past'">
              <span class="digit-static">{{
                selectedPastRecord?.finalPrice.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })
              }}</span>
            </template>
            <template v-else>
              <template v-for="(char, i) in currentPriceChars" :key="'p' + i">
                <span v-if="['.', ','].includes(char)" class="symbol">{{
                  char
                }}</span>
                <span v-else class="digit-wrapper">
                  <transition name="fast-roll">
                    <span class="digit" :key="char">{{ char }}</span>
                  </transition>
                </span>
              </template>
            </template>
          </div>
        </div>
      </div>

      <!-- 4. 图表与工具栏 -->
      <div class="chart-section">
        <div class="chart-container">
          <div
            ref="chartRef"
            class="main-chart"
            style="touch-action: none"
          ></div>
          <!-- 拖拽价格浮窗 -->
          <transition name="cdt">
            <div
              v-if="chartDragState.tooltipVisible"
              class="chart-drag-tooltip"
              :style="{
                left: chartDragState.tooltipLeft + 'px',
                top: chartDragState.tooltipTop + 'px',
              }"
            >
              <div class="cdt-time">{{ chartDragState.tooltipTime }}</div>
              <div
                v-for="item in chartDragState.tooltipItems"
                :key="item.name"
                class="cdt-row"
              >
                <span
                  class="cdt-dot"
                  :style="{ background: item.color }"
                ></span>
                <span class="cdt-name">{{ item.name }}</span>
                <span class="cdt-price">${{ item.price }}</span>
              </div>
            </div>
          </transition>
        </div>

        <div class="chart-toolbar">
          <!-- 下拉菜单：选择历史记录 -->
          <el-dropdown
            trigger="click"
            placement="bottom-start"
            @command="selectPastRecord"
            popper-class="custom-history-dropdown"
          >
            <div class="record-capsule">
              <div class="record-selector">
                {{ $t("bitcoinUpDown.past") }}
                <el-icon>
                  <ArrowDown />
                </el-icon>
              </div>
              <div class="trend-markers">
                <span
                  v-for="res in lastThreeResults"
                  :key="res.id"
                  class="svg-icon-wrapper"
                  :class="res.result"
                >
                  <svg
                    v-if="res.result === 'up'"
                    style="width: 12px; height: 12px"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M5.14 2.22a1 1 0 011.72 0l4.28 7.4A1 1 0 0110.28 11H1.72a1 1 0 01-.86-1.5z"
                      fill="currentColor"
                    />
                  </svg>
                  <svg
                    v-else
                    style="width: 12px; height: 12px"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M10.86 1H1.72a1 1 0 00-.86 1.5l4.28 7.4a1 1 0 001.72 0l4.28-7.4A1 1 0 0010.86 1z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="record in pastRecords"
                  :key="record.id"
                  :command="record"
                >
                  <div class="drop-item-content">
                    <span
                      class="svg-icon-wrapper dropdown-icon"
                      :class="record.result"
                    >
                      <svg
                        v-if="record.result === 'up'"
                        style="width: 14px; height: 14px"
                        viewBox="0 0 12 12"
                      >
                        <path
                          d="M5.14 2.22a1 1 0 011.72 0l4.28 7.4A1 1 0 0110.28 11H1.72a1 1 0 01-.86-1.5z"
                          fill="currentColor"
                        />
                      </svg>
                      <svg
                        v-else
                        style="width: 14px; height: 14px"
                        viewBox="0 0 12 12"
                      >
                        <path
                          d="M10.86 1H1.72a1 1 0 00-.86 1.5l4.28 7.4a1 1 0 001.72 0l4.28-7.4A1 1 0 0010.86 1z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    {{ record.label }}
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 🔥 动态时间轴按钮逻辑 🔥 -->
          <div class="time-segments">
            <!-- 1. 最左侧：临时生成的历史记录游标 (仅在选择历史且存在时显示) -->
            <span
              v-if="activeSegmentMode === 'past' && selectedPastRecord"
              class="time-pill active past-active"
            >
              {{ $t("bitcoinUpDown.ended") }}: {{ selectedPastRecord.date }}
            </span>

            <!-- 2. 中间：常驻实时按钮 (点击清除历史游标) -->
            <span
              class="time-pill"
              :class="{ active: activeSegmentMode === 'live' }"
              @click="selectLiveSegment"
            >
              <i class="dot breathing-dot"></i> {{ liveSegment.label }}
            </span>

            <!-- 3. 右侧：当天未来按钮 (只有一个) -->
            <span
              v-for="ft in futureSegments"
              :key="ft.id"
              class="time-pill"
              :class="{
                active:
                  activeSegmentMode === 'future' && selectedFutureId === ft.id,
              }"
              @click="selectFutureSegment(ft)"
            >
              {{ ft.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- 5. 底部业务逻辑 -->
      <div class="business-tabs">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'Positions' }"
          @click="activeTab = 'Positions'"
        >
          {{ $t("crypto.positions") }}
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'Orders' }"
          @click="activeTab = 'Orders'"
        >
          {{ $t("crypto.orders") }}
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'History' }"
          @click="activeTab = 'History'"
        >
          {{ $t("crypto.history") }}
        </div>
      </div>

      <!-- Positions -->
      <div v-if="activeTab === 'Positions'" class="position-content">
        <div v-if="positions.length">
          <div v-for="(pos, index) in positions" :key="pos.id" class="pos-card">
            <h3 v-if="index === 0" class="pos-title">
              {{ detailData.title || pos.title }}
            </h3>
            <span
              class="pos-tag"
              :class="['yes','up'].includes(pos.outcome.toLowerCase()) ? 'up' : 'down'"
              >{{ pos.tagLabel }}</span
            >
            <div class="pos-grid">
              <div class="grid-item">
                <div class="g-label">{{ $t("crypto.avgPrice") }}</div>
                <div class="g-val">{{ pos.avgPrice }}</div>
              </div>
              <div class="grid-item">
                <div class="g-label">{{ $t("crypto.cost") }}</div>
                <div class="g-val">{{ pos.cost }}</div>
              </div>
              <div class="grid-item">
                <div class="g-label">{{ $t("crypto.current") }}</div>
                <div class="g-val">{{ pos.positionValue }}</div>
              </div>
              <div class="grid-item">
                <div class="g-label">{{ $t("crypto.profit") }}</div>
                <div
                  class="g-val"
                  :class="{
                    neon: pos.profitPositive,
                    'hot-pink': !pos.profitPositive,
                  }"
                >
                  {{ pos.profit }}
                </div>
              </div>
            </div>
            <button
              class="withdraw-hero-btn"
              :class="['yes','up'].includes(pos.outcome.toLowerCase()) ? 'up' : 'down'"
              type="button"
              :disabled="Number(pos?.raw?.shares) === 0"
              @click="handlePositionWithdraw(pos)"
            >
              {{ $t("crypto.withdraw") }}
            </button>
          </div>
        </div>
        <div v-else class="orders-empty">
          {{ $t("common.noData") || "暂无数据..." }}
        </div>
      </div>

      <!-- Orders -->
      <div v-else-if="activeTab === 'Orders'" class="orders-content">
        <div class="orders-header-row">
          <div class="orders-title">{{ $t("crypto.openOrders") }}</div>
          <button
            class="cancel-all-btn"
            type="button"
            v-if="openOrders.length"
            :disabled="cancelAllLoading"
            @click="handleCancelAllOrders"
          >
            <span v-if="cancelAllLoading" class="loading-icon">
              <svg viewBox="0 0 24 24" width="1em" height="1em" class="spinner">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4 31.4" stroke-linecap="round">
                  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 12 12;360 12 12"/>
                </circle>
              </svg>
            </span>
            {{ $t("crypto.cancelAll") }}
          </button>
        </div>

        <div v-if="openOrders.length" class="orders-list">
          <div v-for="order in openOrders" :key="order.id" class="order-row">
            <div class="order-left">
              <div class="order-side" :class="outcomeToTrend(order.outcome)">
                {{ order.side==="BUY"? $t("common.buy"): $t("common.sell")}}
                <span class="side-text">{{
                  ['yes','up'].includes(order.outcome.toLowerCase())?detailData.yesOutcome:detailData.noOutcome
                }}</span>
              </div>
              <div :class="['order-chip',outcomeToTrend(order.outcome)]">
                <span class="chip-price">{{ order.price }} ¢</span>
                <span class="chip-sep">|</span>
                <span class="chip-cost">${{ order.cost }}</span>
              </div>
            </div>
            <div class="order-right">
              <div>
                <div class="order-progress">
                  {{ order.filled }}/{{ order.total }}
                </div>
                <div class="order-until" v-if="order.untilCancel">
                  {{ $t("crypto.untilCancel") }}
                </div>
              </div>
              <button
                class="order-cancel-btn"
                type="button"
                :disabled="cancelingId === order.orderGuid"
                @click="handleCancelOrder(order.id)"
                aria-label="cancel"
              >
                <span v-if="cancelingId === order.orderGuid" class="loading-icon">
                  <svg viewBox="0 0 24 24" width="1em" height="1em" class="spinner">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4 31.4" stroke-linecap="round">
                      <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 12 12;360 12 12"/>
                    </circle>
                  </svg>
                </span>
                <span v-else>✕</span>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="orders-empty">
          {{ $t("common.noData") || "暂无数据..." }}
        </div>
      </div>

      <!-- History -->
      <div v-else-if="activeTab === 'History'" class="history-content">
        <div class="history-header">{{ $t("crypto.history") }}</div>
        <div v-if="orderHistory.length" class="history-list">
          <div v-for="item in orderHistory" :key="item.id" class="history-row">
            <div class="history-main">
              <div class="history-text">
                    {{ item.side==="BUY"? $t("common.buy"): $t("common.sell")}}
                <span class="history-side" :class="outcomeToTrend(item.outcome)">
                  {{ item.shares }}
                  {{
                   ['yes','up'].includes(item.outcome.toLowerCase())?detailData.yesOutcome:detailData.noOutcome                  }}
                </span>
                at {{ item.price }}¢
                <span class="muted">(${{ item.notional }})</span>
              </div>
            </div>
            <div class="history-time">{{ item.timeAgo }}</div>
          </div>
        </div>
        <div v-else class="orders-empty">
          {{ $t("common.noData") || "暂无数据..." }}
        </div>
      </div>

      <div class="orderbook-header" @click="isBookOpen = !isBookOpen">
        <span>{{ $t("sports.orderBook") }}</span>
        <div class="header-right">
          <span class="vol">{{ orderBookVolumeText }}</span>
          <el-icon :class="{ rotate: isBookOpen }">
            <ArrowDown />
          </el-icon>
        </div>
      </div>

      <div v-if="isBookOpen" class="book-body">
        <div class="orderbook-tabs">
          <button
            class="orderbook-tab"
            :class="{ active: orderBookTab === 'yes' }"
            @click="orderBookTab = 'yes'"
          >
            {{ detailData.yesOutcome || "" }}
          </button>
          <button
            class="orderbook-tab"
            :class="{ active: orderBookTab === 'no' }"
            @click="orderBookTab = 'no'"
          >
            {{ detailData.noOutcome || "" }}
          </button>
        </div>
        <OrderBookMobile
          :active-side="orderBookTab"
          :asks="currentOrderBook.asks"
          :bids="currentOrderBook.bids"
          :last-trade-price="currentOrderBook.last_trade_price"
          :loading="orderBookLoading"
          :use-mock-fallback="false"
        />
      </div>

      <div v-if="detailData.rulesDescription" class="rules-footer">
        <h4>{{ $t("detail.rules") }}</h4>
        <p>{{ detailData.rulesDescription }}</p>
      </div>
    </div>

    <!-- 吸底操作栏 -->
    <div class="bottom-dock-actions">
      <!-- 事件未结束时显示购买按钮 -->
      <template v-if="!isEventEnded">
        <button class="trade-btn up" type="button" @click="openPayment('up')">
          {{ $t("common.buy") }} {{ detailData.yesOutcome || "" }}
          {{ upTradePriceText }}
        </button>
        <button
          class="trade-btn down"
          type="button"
          @click="openPayment('down')"
        >
          {{ $t("common.buy") }} {{ detailData.noOutcome || "" }}
          {{ downTradePriceText }}
        </button>
      </template>
      <!-- 事件已结束时显示提示 -->
      <div v-else class="event-ended-tip">
        {{ $t("bitcoinUpDown.eventEnded") }}
      </div>
    </div>

    <PaymentModal
      v-model="showPayment"
      :event-title="detailData.title"
      :outcome-title="paymentOutcomeTitle"
      :event-guid="currentEventGuid"
      :sub-event-guid="resolvedSubEventGuid"
      :initial-outcome="paymentInitialOutcome"
      :initial-side="paymentInitialSide"
      :yes-outcome="detailData.yesOutcome"
      :no-outcome="detailData.noOutcome"
      @order-success="onOrderSuccess"
    />

    <CashoutModal
      v-model="showCashoutModal"
      :position="cashoutPosition"
      :event-guid="currentEventGuid"
      :sub-event-guid="resolvedSubEventGuid"
      @order-success="onOrderSuccess"
    />
  </div>
</template>

<script src="./index.js"></script>

<style scoped lang="scss">
$hot-pink: var(--text-color-n);
$neon-green: var(--text-color-y);
$primary-blue: #5073e5;

.bitcoin-up-down-page {
  background: var(--bg-page-h5);
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  position: relative;
  flex-shrink: 0;
  z-index: 30;
  background-color: var(--bg-page-h5);
  height: 48px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  color: var(--text-dark-gray);
  font-size: 12px;
}

.top-btn {
  background: transparent;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  cursor: pointer;
}

.top-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn .el-icon {
  font-size: 18px;
  color: var(--bg-opposite);
}

.top-center {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.85;
}

.trophy-icon {
  font-size: 14px;
  color: var(--text-dark-gray);
}

.top-volume {
  font-size: 11px;
}

.content-scroller {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 80px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.asset-profile-wrapper {
  position: sticky;
  top: -1px;
  z-index: 20;
  background-color: var(--bg-page-h5);
  margin: 0 -16px 24px -16px;
  padding: 16px 16px 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &.is-sticky {
    padding: 10px 16px;
    background-color: var(--bg-page-h5);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);

    .asset-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }

    .asset-text h2 {
      font-size: 14px;
    }

    .timer .unit {
      font-size: 16px;
    }
  }
}

.asset-profile {
  display: flex;
  align-items: center;
  gap: 12px;

  .asset-logo {
    width: 44px;
    height: 44px;
    background: $primary-blue;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .asset-text {
    flex: 1;
    min-width: 0;
  }

  .asset-text h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
    color: var(--bg-opposite);
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: font-size 0.3s ease;
  }

  .asset-time-range {
    margin: 6px 0 0;
    color: var(--text-dark-gray);
    font-size: 12px;
    line-height: 1.35;
  }

  .baopei-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
    color: #000;
    background: linear-gradient(
      90deg,
      rgb(62, 195, 197) 0%,
      rgb(153, 89, 189) 100%
    );
    white-space: nowrap;
  }

  .timer {
    display: flex;
    gap: 10px;
    margin-left: auto;
    flex-shrink: 0;

    .time-block {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .unit {
      font-size: 20px;
      font-weight: 700;
      color: #f6465d;
      line-height: 1;
      transition: font-size 0.3s ease;
    }

    .label {
      font-size: 9px;
      color: #666;
      margin-top: 4px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  }
}

.time-value,
.price-value {
  display: flex;
  align-items: center;
}

.digit-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 1.2em;
  width: 1ch;
}

.symbol {
  margin: 0 2px;
  color: inherit;
}

.digit,
.digit-static {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}

.fast-roll-enter-active,
.fast-roll-leave-active {
  transition:
    transform 0.25s cubic-bezier(0.33, 1, 0.68, 1),
    opacity 0.2s linear;
}

.fast-roll-enter-from {
  transform: translateY(-80%);
  opacity: 0;
}

.fast-roll-leave-to {
  transform: translateY(80%);
  opacity: 0;
  position: absolute;
}

.price-dashboard {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;

  .price-item {
    .label {
      font-size: 13px;
      color: #888;
      font-weight: 600;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;

      .diff {
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .diff.up {
        color: $neon-green;
      }

      .diff.down {
        color: $hot-pink;
      }

      .diff-icon {
        width: 10px;
        height: 10px;
      }
    }

    .value {
      font-weight: 700;
      font-size: 26px;
      color: #888;
    }

    &.current .label,
    &.current .value {
      color: var(--text-color-y);
    }
  }
}

.chart-section {
  margin-bottom: 10px;
}

.chart-container {
  position: relative;
  height: 220px;
  background: transparent;
  border-bottom: 1px solid var(--border-color);

  .main-chart {
    width: 100%;
    height: 100%;
    -webkit-tap-highlight-color: transparent;
  }
}

/* ── 图表拖拽探索浮窗 ── */
.chart-drag-tooltip {
  position: absolute;
  z-index: 10;
  background: var(--bg-page, rgba(20, 24, 30, 0.92));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: 10px;
  padding: 10px 14px;
  pointer-events: none;
  backdrop-filter: blur(8px);
  min-width: 120px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  .cdt-time {
    font-size: 11px;
    color: var(--text-dark-gray, #888);
    margin-bottom: 6px;
    white-space: nowrap;
  }

  .cdt-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }

  .cdt-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cdt-name {
    font-size: 12px;
    color: var(--text-dark-gray, #888);
    min-width: 30px;
  }

  .cdt-price {
    font-size: 13px;
    font-weight: 700;
    color: var(--bg-opposite, #fff);
    margin-left: auto;
  }
}

.cdt-enter-active,
.cdt-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.cdt-enter-from,
.cdt-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}

.svg-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }

  &.up {
    color: $neon-green;
  }

  &.down {
    color: $hot-pink;
  }
}

.chart-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 30px;

  .record-capsule {
    display: flex;
    align-items: center;
    background: var(--bg-page);
    border-radius: 20px;
    padding: 10px 16px;
    gap: 8px;
    border: 1px solid var(--border-color);
    flex-shrink: 0;
    cursor: pointer;

    .record-selector {
      font-size: 13px;
      color: var(--bg-opposite);
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;

      .el-icon {
        font-size: 12px;
        color: var(--bg-opposite);
      }
    }

    .trend-markers {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .time-segments {
    display: flex;
    gap: 8px;
    align-items: center;
    overflow-x: auto;
    flex: 1;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .time-pill {
      font-size: 13px;
      font-weight: 600;
      background: var(--bg-page-h5);
      color: var(--bg-opposite);
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.2s;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $hot-pink;
      }

      &.active {
        background: var(--bg-opposite);
        color: var(--bg-page-h5);
      }

      &.past-active {
        background: var(--bg-page);
        color: var(--bg-opposite);
      }
    }
  }
}

@keyframes redPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(228, 64, 150, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(228, 64, 150, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(228, 64, 150, 0);
  }
}

.breathing-dot {
  animation: redPulse 1.5s infinite;
}

.business-tabs {
  display: flex;
  gap: 50px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
  padding-bottom: 0;

  .tab-item {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-dark-gray);
    padding-bottom: 14px;
    position: relative;
    cursor: pointer;

    &.active {
      color: var(--bg-opposite);

      &::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--bg-opposite);
      }
    }
  }
}

.position-content,
.orders-content,
.history-content {
  margin-bottom: 20px;
}

.orders-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .orders-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--bg-opposite);
  }

  .cancel-all-btn {
    background: transparent;
    border: none;
    color: var(--text-color-n);
    font-size: 13px;
    cursor: pointer;
  }
}

/* 订单列表：超过 10 条时出现滚动条 */
.orders-list {
  max-height: 520px;
  overflow-y: auto;
}

.order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);

  .order-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .order-side {
    font-size: 15px;
    font-weight: 500;
    color: var(--bg-opposite);
  }

  .order-chip {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    background: var(--button-bg-n);
    color: var(--text-color-n);
    font-size: 12px;
    font-weight: 600;
  }

  .order-right {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 8px;
    flex-direction: row;
    font-size: 12px;
    color: var(--text-dark-gray);
  }

  .order-progress {
    font-weight: 500;
  }

  .order-until {
    white-space: nowrap;
  }

  .order-cancel-btn {
    background: transparent;
    border: none;
    color: var(--text-dark-gray);
    font-size: 16px;
    cursor: pointer;
  }

  /* stacked progress block on right */
  .order-right > div {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    margin-right: 6px;
  }

  .loading-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .order-chip.up {
    background: var(--button-bg-y);
    color: var(--text-color-y);
  }

  .order-chip.down {
    background: var(--button-bg-n);
    color: var(--text-color-n);
  }

  .order-chip .chip-price,
  .order-chip .chip-cost {
    font-size: 12px;
    font-weight: 700;
  }

  .order-chip .chip-sep {
    margin: 0 6px;
    opacity: 0.9;
  }

  // History 方向高亮颜色（只给 Yes/No 文案上色）
  .history-side.up {
    color: $neon-green;
  }

  .history-side.down {
    color: $hot-pink;
  }
}

.orders-empty {
  text-align: center;
  font-size: 13px;
  color: var(--text-dark-gray);
  padding: 24px 0;
}

/* 历史列表：超过 10 条时出现滚动条 */
.history-list {
  max-height: 560px;
  overflow-y: auto;
}

.history-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--bg-opposite);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);

  .history-text {
    font-size: 14px;
    color: var(--bg-opposite);
  }

  .history-side {
    font-weight: 600;
    margin-right: 4px;

    &.up {
      color: var(--text-color-y);
    }

    &.down {
      color: var(--text-color-n);
    }
  }

  .history-time {
    font-size: 12px;
    color: var(--text-dark-gray);
    white-space: nowrap;
  }
}

// 括号内金额灰色（提高优先级，且放在最后保证覆盖）
.history-row .history-text .muted {
  color: var(--text-dark-gray);
}

.pos-card {
  margin-bottom: 20px;

  &:first-child {
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .pos-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: var(--bg-opposite);
  }

  .pos-tag {
    display: inline-block;
    background: var(--button-bg-y);
    color: var(--text-color-y);
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 24px;

    &.up {
      background: var(--button-bg-y);
      color: var(--text-color-y);
    }

    &.down {
      background: var(--button-bg-n);
      color: var(--text-color-n);
    }
  }

  .pos-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-bottom: 28px;
    gap: 12px;

    .grid-item {
      .g-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }

      .g-val {
        font-size: 18px;
        font-weight: 600;
        color: var(--bg-opposite);

        &.neon {
          color: var(--text-color-y);
        }

        &.hot-pink {
          color: var(--text-color-n);
        }
      }
    }
  }

  .withdraw-hero-btn {
    width: 100%;
    height: 56px;
    background: var(--text-color-y);
    color: #000;
    border: none;
    border-radius: 14px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
  }
}

.orderbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 15px;
  color: var(--bg-opposite);

  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;

    .vol {
      color: var(--text-dark-gray);
      font-size: 13px;
    }

    .el-icon {
      transition: transform 0.2s;

      &.rotate {
        transform: rotate(180deg);
      }
    }
  }
}

.book-body {
  padding: 12px 0;
}

.orderbook-tabs {
  display: flex;
  gap: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 8px;
}

.orderbook-tab {
  background: transparent;
  border: none;
  color: var(--text-dark-gray);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;

  &.active {
    color: var(--bg-opposite);
  }
}

.rules-footer {
  margin-top: 20px;
  padding-bottom: 20px;

  h4 {
    color: var(--bg-opposite);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  p {
    font-size: 12px;
    color: var(--text-dark-gray);
    line-height: 1.7;
  }
}

.bottom-dock-actions {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  gap: 12px;
  background: var(--bg-page-h5);
  z-index: 40;

  .event-ended-tip {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: var(--text-dark-gray);
    padding: 12px 0;
    border: 1px solid var(--border-color);
    border-radius: 12px;
  }

  .trade-btn {
    flex: 1;
    height: 48px;
    background: transparent;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;

    &.up {
      color: var(--text-color-y);
      border: 1.5px solid var(--text-color-y);
      background: rgba(187, 255, 46, 0.08);
    }

    &.down {
      color: $hot-pink;
      border: 1.5px solid var(--text-color-n);
      background: var(--button-bg-n);
    }
  }
}
</style>

<style lang="scss">
.custom-history-dropdown {
  background: var(--bg-page) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;

  .el-dropdown-menu {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .el-dropdown-menu__item {
    color: var(--bg-opposite) !important;
    font-size: 14px;
    padding: 12px 16px;
    transition: background 0.2s;
  }

  .drop-item-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
  }

  .el-popper__arrow::before {
    background: var(--bg-page) !important;
    border: 1px solid var(--border-color) !important;
  }
}
</style>
