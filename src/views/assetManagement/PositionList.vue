<template>
    <div class="position-list">
        <!-- 顶部 Tab -->
        <div class="position-tabs">
            <div v-for="tab in tabs" :key="tab.value"
                :class="['position-tab-item', { active: activeTab === tab.value }]" @click="activeTab = tab.value">
                {{ tab.label }}
            </div>
        </div>

        <!-- 搜索与筛选 -->
        <div class="position-filters">
            <div class="search-box">
                <el-icon class="search-icon">
                    <Search />
                </el-icon>
                <input v-model="searchKeyword" type="text" class="search-input" :placeholder="t('assetManagement.search')" />
            </div>

            <div class="filter-pill" @click="toggleTypeDropdown">
                <span>{{ currentTypeLabel }}</span>
                <el-icon class="arrow">
                    <ArrowDownBold />
                </el-icon>
                <div v-if="showTypeDropdown" class="dropdown-menu" @click.stop>
                    <div v-for="item in typeOptions" :key="item.value"
                        :class="['dropdown-item', { active: item.value === filterType }]"
                        @click="selectType(item.value)">
                        {{ item.label }}
                    </div>
                </div>
            </div>

            <div class="filter-pill" @click="toggleMonthDropdown">
                <span>{{ currentMonthLabel }}</span>
                <el-icon class="arrow">
                    <ArrowDownBold />
                </el-icon>
                <div v-if="showMonthDropdown" class="dropdown-menu" @click.stop>
                    <div v-for="item in monthOptions" :key="item.value"
                        :class="['dropdown-item', { active: item.value === filterMonth }]"
                        @click="selectMonth(item.value)">
                        {{ item.label }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 列表 -->
        <div class="position-list-content">
            <div v-for="item in filteredList" :key="item.id" class="position-item">
                <div class="position-left">
                    <div class="token-icon" :style="{ backgroundColor: item.iconBg }">
                        <span class="token-text">{{ item.tokenSymbol.slice(0, 1) }}</span>
                    </div>
                </div>

                <div class="position-middle">
                    <div class="title-row">
                        <span class="title-text">{{ item.title }}</span>
                        <!-- 右侧金额：
                             - 仓位事件(open)：显示价格
                             - 历史仓位事件(history)：显示盈亏金额
                             - 委托仓位(pending)：不显示任何金额 -->
                        <span v-if="activeTab === 'open'" class="price-text">
                            ${{ item.price }}
                        </span>
                        <span v-else-if="activeTab === 'history'" class="price-text"
                            :class="item.resultAmount > 0 ? 'pnl-positive' : 'pnl-negative'">
                            {{ item.resultAmount > 0 ? '+' : '' }}${{ Math.abs(item.resultAmount) }}
                        </span>
                    </div>

                    <div class="meta-row">
                        <span class="side-tag" :class="item.side.toLowerCase()">
                            {{ item.side }}
                        </span>
                        <span class="odds-tag" :class="item.oddsType || 'no'">
                            {{ item.oddsLabel || 'No 10 · 98.7 ¢' }}
                        </span>

                        <template v-if="activeTab === 'open'">
                            <span class="pnl-text" :class="item.pnl > 0 ? 'pnl-positive' : 'pnl-negative'">
                                {{ item.pnl > 0 ? '+' : '' }}{{ item.pnl }}%
                            </span>
                        </template>

                        <template v-else-if="activeTab === 'pending'">
                            <span class="limit-text">
                                0/5
                            </span>
                        </template>

                        <!-- 历史仓位事件：仅展示状态，不再在中间行重复金额 -->
                        <template v-else>
                            <span
                                class="status-pill status-right"
                                :class="item.status === 'lost' ? 'status-lost' : 'status-claimed'"
                            >
                                <el-icon class="status-icon">
                                    <CloseBold v-if="item.status === 'lost'" />
                                    <Select v-else />
                                </el-icon>
                                <span class="status-text">{{ t(`assetManagement.${item.status}`) }}</span>
                            </span>
                        </template>
                    </div>

                    <div class="sub-row">
                        <span class="value-text">{{ t('assetManagement.valueLabel') }}: $1.55</span>
                        <span class="time-text">2026-01-01 12:12</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDownBold, CloseBold, Select, Search } from '@element-plus/icons-vue'

const { t } = useI18n()

const tabs = computed(() => [
    { label: t('assetManagement.positionEvents'), value: 'open' },
    { label: t('assetManagement.entrustedPositions'), value: 'pending' },
    { label: t('assetManagement.historyPositionEvents'), value: 'history' }
])

const activeTab = ref('open')

const searchKeyword = ref('')
const filterType = ref('all')
const filterMonth = ref('2026-01')

const typeOptions = computed(() => [
    { value: 'all', label: t('assetManagement.all') },
    { value: 'buy', label: t('assetManagement.buy') },
    { value: 'sell', label: t('assetManagement.sell') }
])

const monthOptions = [
    { value: '2026-01', label: '2026-01' },
    { value: '2025-12', label: '2025-12' }
]

const showTypeDropdown = ref(false)
const showMonthDropdown = ref(false)

const currentTypeLabel = computed(() => {
    return typeOptions.value.find(v => v.value === filterType.value)?.label ?? t('assetManagement.all')
})

const currentMonthLabel = computed(() => {
    return monthOptions.find(v => v.value === filterMonth.value)?.label ?? '2026-01'
})

const openList = [
    {
        id: 1,
        tokenSymbol: 'BTC',
        title: '以太坊在12月28日的价格—？',
        price: '0.74',
        side: 'Buy',
        iconBg: '#F7931A',
        pnl: -28,
        oddsType: 'no',
        oddsLabel: 'No 10 · 98.7 ¢'
    },
    {
        id: 2,
        tokenSymbol: 'BTC',
        title: '1月7日，比特币的价格会落在…',
        price: '0.74',
        side: 'Buy',
        iconBg: '#C1FFB3',
        pnl: 28,
        oddsType: 'no',
        oddsLabel: 'No 10 · 98.7 ¢'
    },
    {
        id: 3,
        tokenSymbol: 'XRP',
        title: '以太坊在12月28日的价格—？',
        price: '0.74',
        side: 'Buy',
        iconBg: '#1D61FF',
        pnl: 100.52,
        oddsType: 'no',
        oddsLabel: 'No 10 · 98.7 ¢'
    }
]

const pendingList = [
    {
        id: 4,
        tokenSymbol: 'ETH',
        title: '以太坊在12月28日的价格—？',
        price: '0.74',
        side: 'Buy',
        iconBg: '#4C6FFF',
        oddsType: 'yes',
        oddsLabel: 'yes 98.7 ¢'
    },
    {
        id: 5,
        tokenSymbol: 'F',
        title: '以太坊在12月28日的价格—？',
        price: '0.74',
        side: 'Buy',
        iconBg: '#111827',
        oddsType: 'yes',
        oddsLabel: 'yes 98.7 ¢'
    },
    {
        id: 6,
        tokenSymbol: 'A',
        title: '以太坊在12月28日的价格—？',
        price: '0.74',
        side: 'Buy',
        iconBg: '#111827',
        oddsType: 'yes',
        oddsLabel: 'yes 98.7 ¢'
    }
]

const historyList = [
    {
        id: 7,
        tokenSymbol: 'ALT',
        title: '以太坊在12月28日的价格—？',
        price: '0.74',
        side: 'Buy',
        iconBg: '#FFD600',
        resultAmount: -0.74,
        status: 'lost',
        oddsType: 'no',
        oddsLabel: 'No 10 · 98.7 ¢'
    },
    {
        id: 8,
        tokenSymbol: 'IV',
        title: '1月7日，比特币的价格会落在…',
        price: '0.74',
        side: 'Sell',
        iconBg: '#7C3AED',
        resultAmount: 0.74,
        status: 'claimed',
        oddsType: 'no',
        oddsLabel: 'No 10 · 98.7 ¢'
    },
    {
        id: 9,
        tokenSymbol: 'TG',
        title: '以太坊在12月28日的价格—？',
        price: '0.74',
        side: 'Buy',
        iconBg: '#111827',
        resultAmount: 0.74,
        status: 'claimed',
        oddsType: 'no',
        oddsLabel: 'No 10 · 98.7 ¢'
    }
]

const baseList = computed(() => {
    if (activeTab.value === 'open') return openList
    if (activeTab.value === 'pending') return pendingList
    return historyList
})

const filteredList = computed(() => {
    return baseList.value.filter(item => {
        if (filterType.value === 'buy' && item.side !== 'Buy') return false
        if (filterType.value === 'sell' && item.side !== 'Sell') return false

        if (searchKeyword.value.trim()) {
            const kw = searchKeyword.value.trim().toLowerCase()
            if (
                !item.title.toLowerCase().includes(kw) &&
                !item.tokenSymbol.toLowerCase().includes(kw)
            ) {
                return false
            }
        }
        return true
    })
})

const toggleTypeDropdown = (event) => {
    event.stopPropagation()
    showTypeDropdown.value = !showTypeDropdown.value
    if (showTypeDropdown.value) {
        showMonthDropdown.value = false
    }
}

const toggleMonthDropdown = (event) => {
    event.stopPropagation()
    showMonthDropdown.value = !showMonthDropdown.value
    if (showMonthDropdown.value) {
        showTypeDropdown.value = false
    }
}

const selectType = (val) => {
    filterType.value = val
    showTypeDropdown.value = false
}

const selectMonth = (val) => {
    filterMonth.value = val
    showMonthDropdown.value = false
}

// 点击页面其它地方关闭下拉
if (typeof window !== 'undefined') {
    window.addEventListener('click', () => {
        showTypeDropdown.value = false
        showMonthDropdown.value = false
    })
}
</script>

<style scoped lang="scss">
.position-list {
    margin-top: 20px;
}

.position-tabs {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;

    .position-tab-item {
        font-size: 14px;
        color: var(--text-gray, #666);
        cursor: pointer;
        position: relative;
        padding-bottom: 6px;

        &.active {
            color: var(--text-color, #fff);
            font-weight: 600;
        }
    }
}

.position-filters {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
}

.search-box {
    max-width: 37%;
    display: flex;
    align-items: center;
    border-radius: 999px;
    padding: 10px 14px;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    transition: border-color 0.2s;

    &:focus-within {
        border-color: var(--text-gray);
    }

    .search-icon {
        margin-right: 8px;
        font-size: 16px;
        color: var(--text-gray);
        flex-shrink: 0;
    }

    .search-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-color);
        font-size: 14px;
        min-width: 0;

        &::placeholder {
            color: var(--text-gray);
        }
    }
}

.filter-pill {
    position: relative;
    display: flex;
    align-items: center;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    white-space: nowrap;

    span:not(.arrow) {
        margin-right: 4px;
        font-family: PingFang SC, PingFang SC;
        font-weight: 500;
        font-size: 14px;
        color: var(--text-color, #fff);
    }

    .arrow {
        margin-left: 4px;
        font-size: 12px;
        color: var(--text-gray);
        display: inline-flex;
        align-items: center;
    }
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 100%;
    border-radius: 10px;
    padding: 6px 0;
    border: 1px solid var(--border-color);
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    .dropdown-item {
        padding: 8px 14px;
        font-size: 14px;
        color: var(--text-color);
        cursor: pointer;
        transition: background-color 0.2s, color 0.2s;

        &.active {
            color: var(--text-color);
            background-color: var(--border-color);
        }
    }
}

.position-list-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.position-item {
    display: flex;
    padding: 14px 0;
    border-bottom: 1px solid var(--border-color);
}

.position-left {
    margin-right: 12px;

    .token-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 700;
        font-size: 22px;
    }
}

.position-middle {
    flex: 1;
}

.title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .title-text {
        flex: 1;
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 14px;
        color: #FFFFFF;
        color: var(--text-color, #fff);
        padding-right: 12px;
    }

    .price-text {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 14px;
        color: var(--text-color, #fff);
    }
}

.meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;

    .side-tag {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: var(--text-gray, #999);
    }

    .odds-tag {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 4px;
        font-weight: 600;

        &.no {
            background: rgba(255, 75, 130, 0.2);
            color: var(--text-color-n, #E44096);
        }

        &.yes {
            background: rgba(46, 190, 105, 0.2);
            color: var(--text-color-y, #2EBE69);
        }
    }

    .pnl-text,
    .result-amount {
        margin-left: auto;
        font-size: 13px;
        font-weight: 600;
    }

    .pnl-positive {
        color: #2FBC87;
    }

    .pnl-negative {
        color: #FF4B82;
    }

    .limit-text {
        margin-left: auto;
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 14px;
        color: var(--text-color, #999);
    }

    .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        margin-left: auto;

        .status-icon {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #ffffff;
        }

        .status-text {
            font-family: PingFang SC, PingFang SC;
            font-weight: 600;
        }

        &.status-lost {
            color: #FF4B82;

            .status-icon {
                background-color: #FF4B82;
            }
        }

        &.status-claimed {
            color: #2FBC87;

            .status-icon {
                background-color: #2FBC87;
            }
        }
    }
}

.sub-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: var(--text-gray, #888);

    .value-text {
        margin-right: 8px;
    }
}
</style>
