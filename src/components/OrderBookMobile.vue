<template>
    <div class="obm">
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
                {{ t('detail.last') || '最后' }}:${{ lastPrice }}
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
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
    // 预留：以后可以根据 yes/no 决定数据或配色
    activeSide: {
        type: String,
        default: 'yes'
    }
})

const { t } = useI18n()

// shares 由大到小，形成左侧阶梯形状（紫色）
const sellOrders = ref([
    { price: 88, shares: 10000, total: 71200.0 },
    { price: 88, shares: 8000, total: 56960.0 },
    { price: 88, shares: 6000, total: 42720.0 },
    { price: 88, shares: 4000, total: 28480.0 },
    { price: 88, shares: 2000, total: 14240.0 }
])

// shares 由小到大，形成反向阶梯形状（绿色）
const buyOrders = ref([
    { price: 88, shares: 2000, total: 14240.0 },
    { price: 88, shares: 4000, total: 28480.0 },
    { price: 88, shares: 6000, total: 42720.0 },
    { price: 88, shares: 8000, total: 56960.0 },
    { price: 88, shares: 10000, total: 71200.0 }
])

const lastPrice = ref(84)
const spread = ref(1)

const maxSellShares = computed(() =>
    Math.max(...sellOrders.value.map(o => o.shares))
)
const maxBuyShares = computed(() =>
    Math.max(...buyOrders.value.map(o => o.shares))
)

const formatNumber = (num) => {
    return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}
</script>

<style scoped lang="scss">
.obm {
    margin-top: 12px;
    color: var(--bg-opposite);
    font-size: 12px;
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
    color: rgba(255, 255, 255, 0.7);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.obm-spread-label {
    text-align: right;
}

.obm-panel-buy {
    padding-top: 10px;
}
</style>
