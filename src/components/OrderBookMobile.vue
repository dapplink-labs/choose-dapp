<template>
    <div class="obm">
        <!-- 加载中 -->
        <div v-if="loading" class="obm-loading">{{ $t('common.loading') || 'Loading...' }}</div>
        <template v-else>
        <!-- 表头 -->
        <div class="obm-header">
            <div class="obm-header-cell obm-header-volume">{{ t('detail.volume') || '交易量' }}</div>
            <div class="obm-header-cell">{{ t('common.price') || '价格' }}</div>
            <div class="obm-header-cell">{{ t('detail.shares') || '股票' }}</div>
            <div class="obm-header-cell">{{ t('common.all') || '全部' }}</div>
        </div>

        <!-- 上半部分：卖盘（紫色） -->
        <div class="obm-panel obm-panel-sell">
            <div class="obm-rows">
                <div v-for="(order, index) in sellOrders" :key="'sell-' + index" class="obm-row">
                    <div class="obm-cell obm-volume-cell">
                        <div class="obm-volume-bar obm-volume-sell"
                            :style="{ width: `${(order.shares / maxSellShares) * 100}%` }" />
                    </div>
                    <div class="obm-cell obm-price-cell obm-price-sell">
                        ${{ order.price }}
                    </div>
                    <div class="obm-cell obm-shares-cell">
                        {{ formatNumber(order.shares) }}
                    </div>
                    <div class="obm-cell obm-total-cell">
                        ${{ formatNumber(order.total) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 中间：最后价格与价差 -->
        <div class="obm-last-row">
            <div class="obm-last-label">
                {{ t('detail.last') || '最后' }}: ${{ lastPrice }}
            </div>
            <div class="obm-spread-label">
                {{ t('detail.spread') || '价差' }}: ${{ spread }}
            </div>
        </div>

        <!-- 下半部分：买盘（绿色） -->
        <div class="obm-panel obm-panel-buy">
            <div class="obm-rows">
                <div v-for="(order, index) in buyOrders" :key="'buy-' + index" class="obm-row">
                    <div class="obm-cell obm-volume-cell">
                        <div class="obm-volume-bar obm-volume-buy"
                            :style="{ width: `${(order.shares / maxBuyShares) * 100}%` }" />
                    </div>
                    <div class="obm-cell obm-price-cell obm-price-buy">
                        ${{ order.price }}
                    </div>
                    <div class="obm-cell obm-shares-cell">
                        {{ formatNumber(order.shares) }}
                    </div>
                    <div class="obm-cell obm-total-cell">
                        ${{ formatNumber(order.total) }}
                    </div>
                </div>
            </div>
        </div>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    activeSide: { type: String, default: 'yes' },
    // 卖单列表 [{price, quantity}]
    asks: { type: Array, default: () => [] },
    // 买单列表 [{price, quantity}]
    bids: { type: Array, default: () => [] },
    // 最近成交价
    lastTradePrice: { type: String, default: '' },
    // 是否加载中
    loading: { type: Boolean, default: false },
    // 是否允许在无数据时回退到 mock
    useMockFallback: { type: Boolean, default: true },
})

const { t } = useI18n()

// 卖单（asks）从大到小排序（保留全部，超出 10 条用滚动）
const sellOrders = computed(() => {
    const list = props.asks.length ? props.asks : (props.useMockFallback ? MOCK_SELL : [])
    return [...list]
        .sort((a, b) => Number(b.price) - Number(a.price))
        .map(o => ({
            price: Number(o.price).toFixed(4),
            shares: Number(o.quantity),
            total: (Number(o.price) * Number(o.quantity)).toFixed(2)
        }))
})

// 买单（bids）从大到小排序（保留全部，超出 10 条用滚动）
const buyOrders = computed(() => {
    const list = props.bids.length ? props.bids : (props.useMockFallback ? MOCK_BUY : [])
    return [...list]
        .sort((a, b) => Number(b.price) - Number(a.price))
        .map(o => ({
            price: Number(o.price).toFixed(4),
            shares: Number(o.quantity),
            total: (Number(o.price) * Number(o.quantity)).toFixed(2)
        }))
})

const lastPrice = computed(() => {
    if (props.lastTradePrice) return Number(props.lastTradePrice).toFixed(4)
    // 取买一价作为兜底
    return buyOrders.value[0]?.price || '--'
})

const spread = computed(() => {
    const best_ask = Number(sellOrders.value[sellOrders.value.length - 1]?.price || 0)
    const best_bid = Number(buyOrders.value[0]?.price || 0)
    if (!best_ask || !best_bid) return '--'
    return Math.abs(best_ask - best_bid).toFixed(4)
})

const maxSellShares = computed(() =>
    Math.max(1, ...sellOrders.value.map(o => o.shares))
)
const maxBuyShares = computed(() =>
    Math.max(1, ...buyOrders.value.map(o => o.shares))
)

const formatNumber = (num) => {
    return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

// 占位 mock 数据（无真实数据时展示）
const MOCK_SELL = [
    { price: '0.9200', quantity: '10000' },
    { price: '0.9000', quantity: '8000' },
    { price: '0.8800', quantity: '6000' },
    { price: '0.8600', quantity: '4000' },
    { price: '0.8400', quantity: '2000' },
]
const MOCK_BUY = [
    { price: '0.8000', quantity: '2000' },
    { price: '0.7800', quantity: '4000' },
    { price: '0.7600', quantity: '6000' },
    { price: '0.7400', quantity: '8000' },
    { price: '0.7200', quantity: '10000' },
]
</script>

<style scoped lang="scss">
.obm {
    margin-top: 12px;
    color: var(--bg-opposite);
    font-size: 12px;
}

.obm-loading {
    text-align: center;
    padding: 24px 0;
    color: var(--text-dark-gray);
    font-size: 13px;
}

.obm-header {
    display: flex;
    padding: 4px 0 8px;
    color: var(--text-dark-gray);
}

.obm-header-cell {
    flex: 1;
    text-align: right;
}

.obm-header-volume {
    text-align: left;
}

.obm-panel {
    padding: 10px 0 0;
}

.obm-rows {
    border-top: 1px solid var(--border-color);
    max-height: 300px; /* 30px * 10 行 */
    overflow-y: auto;
}

.obm-row {
    display: flex;
    align-items: stretch;
    height: 30px;
    position: relative;
}

.obm-cell {
    flex: 1;
    text-align: right;
    padding-right: 4px;
}

.obm-volume-cell {
    flex: 1.2;
    text-align: left;
    padding-right: 0;
    position: relative;
}

.obm-volume-bar {
    height: calc(100% + 1px);
    background: var(--bg-opposite);
    position: relative;
    z-index: 1;
}

/* 让每一行的柱子覆盖上一行的底部，消除缝隙 */
.obm-row + .obm-row .obm-volume-bar {
    margin-top: -1px;
}

.obm-volume-sell {
    background: #7a184c;
}

.obm-volume-buy {
    background: #4b6f16;
}

.obm-price-cell {
    width: 64px;
}

.obm-price-sell {
    color: var(--text-color-n);
    font-weight: 600;
}

.obm-price-buy {
    color: var(--text-color-y);
    font-weight: 600;
}

.obm-last-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    color: var(--text-dark-gray);
    border-top: 1px solid var(--border-color);
}

.obm-spread-label {
    text-align: right;
}

.obm-panel-buy {
    padding-top: 10px;
}
</style>
