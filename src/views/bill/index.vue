<template>
    <div class="bill-page">
        <BackHeaderNav :title="$t('bill.title')" />

        <div class="filters-container">
            <div class="filters-row">
                <!-- 类型 -->
                <div class="filter-pill-wrapper" ref="typeFilterRef">
                    <button class="filter-pill" type="button" @click="toggleTypeDropdown">
                        <span class="filter-label">{{ $t('bill.filterType') }}:{{ currentTypeLabel }}</span>
                        <el-icon class="filter-arrow">
                            <ArrowDownBold />
                        </el-icon>
                    </button>
                    <transition name="fade-dropdown">
                        <div v-if="showTypeDropdown" class="dropdown-menu">
                            <div v-for="opt in typeOptions" :key="opt.value" class="dropdown-item"
                                :class="{ active: filterType === opt.value }" @click="selectType(opt.value)">
                                {{ opt.label }}
                            </div>
                        </div>
                    </transition>
                </div>
                <!-- 资产 -->
                <div class="filter-pill-wrapper" ref="assetFilterRef">
                    <button class="filter-pill" type="button" @click="toggleAssetDropdown">
                        <span class="filter-label">{{ $t('bill.filterAsset') }}:{{ currentAssetLabel }}</span>
                        <el-icon class="filter-arrow">
                            <ArrowDownBold />
                        </el-icon>
                    </button>
                    <transition name="fade-dropdown">
                        <div v-if="showAssetDropdown" class="dropdown-menu">
                            <div v-for="opt in assetOptions" :key="opt.value" class="dropdown-item"
                                :class="{ active: filterAsset === opt.value }" @click="selectAsset(opt.value)">
                                {{ opt.label }}
                            </div>
                        </div>
                    </transition>
                </div>
                <!-- 日期 -->
                <div class="filter-pill-wrapper">
                    <button class="filter-pill" type="button" @click="openDatePicker">
                        <span class="filter-label">{{ $t('bill.filterDate') }}:{{ currentDateLabel }}</span>
                        <el-icon class="filter-arrow">
                            <ArrowDownBold />
                        </el-icon>
                    </button>
                </div>
            </div>
        </div>

        <div class="bill-list" ref="listRef">
            <div v-for="(item, index) in filteredList" :key="item.id || index" class="bill-item">
                <div class="bill-icon">
                    <img class="bill-icon-img" src="@/assets/icon/TIcon.png" alt="USDT" />
                </div>
                <div class="bill-content">
                    <div class="bill-type">{{ $t(item.typeLabelKey) }}</div>
                    <div class="bill-time">{{ item.time }}</div>
                </div>
                <div class="bill-amount" :class="item.amount >= 0 ? 'inflow' : 'outflow'">
                    {{ item.amount >= 0 ? '+' : '' }}{{ item.amountFormatted }} USDT
                </div>
            </div>
            <div v-if="isLoading" class="loading-more">
                {{ $t('common.loading') || '加载中...' }}
            </div>
            <div v-if="!hasMore && filteredList.length > 0" class="no-more">
                {{ $t('common.noMoreData') || '没有更多数据了' }}
            </div>
            <div v-if="!isLoading && filteredList.length === 0" class="empty-state">
                {{ $t('common.noData') || '暂无数据' }}
            </div>
        </div>

        <!-- 日期范围选择弹层 -->
        <DateRangePicker
            v-model="showDateRangePicker"
            @confirm="handleDateConfirm"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { ArrowDownBold } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'
import DateRangePicker from '@/components/DateRangePicker.vue'

const { t } = useI18n()
const themeStore = useThemeStore()

const filterType = ref('recharge')
const filterAsset = ref('USDT')
const filterDate = ref(30)

const showTypeDropdown = ref(false)
const showAssetDropdown = ref(false)
const typeFilterRef = ref(null)
const assetFilterRef = ref(null)

// 日期范围弹层 & 显示文案
const showDateRangePicker = ref(false)
const customDateLabel = ref('')
const selectedDateRange = ref(null)

const typeOptions = computed(() => [
    { value: 'all', label: t('bill.typeAll') },
    { value: 'recharge', label: t('bill.typeRecharge') },
    { value: 'withdraw', label: t('bill.typeWithdraw') },
    { value: 'purchase', label: t('bill.typePurchase') },
    { value: 'sell', label: t('bill.typeSell') }
])

const assetOptions = computed(() => [
    { value: 'all', label: t('bill.assetAll') },
    { value: 'USDT', label: 'USDT' },
    { value: 'CHO', label: 'CHO' }
])

const dateOptions = computed(() => [
    { value: 7, label: t('bill.date7') },
    { value: 30, label: t('bill.date30') },
    { value: 90, label: t('bill.date90') }
])

const currentTypeLabel = computed(() => {
    const opt = typeOptions.value.find(o => o.value === filterType.value)
    return opt ? opt.label : ''
})

const currentAssetLabel = computed(() => {
    const opt = assetOptions.value.find(o => o.value === filterAsset.value)
    return opt ? opt.label : filterAsset.value
})

const currentDateLabel = computed(() => {
    if (customDateLabel.value) {
        return customDateLabel.value
    }
    const opt = dateOptions.value.find(o => o.value === filterDate.value)
    return opt ? opt.label : ''
})

const list = ref([])
const isLoading = ref(false)
const hasMore = ref(true)

const filteredList = computed(() => {
    let items = list.value
    if (filterType.value !== 'all') {
        items = items.filter(item => item.type === filterType.value)
    }
    if (filterAsset.value !== 'all') {
        items = items.filter(item => item.asset === filterAsset.value)
    }
    return items
})

function toggleTypeDropdown() {
    showTypeDropdown.value = !showTypeDropdown.value
    showAssetDropdown.value = false
}

function toggleAssetDropdown() {
    showAssetDropdown.value = !showAssetDropdown.value
    showTypeDropdown.value = false
}

function selectType(value) {
    filterType.value = value
    showTypeDropdown.value = false
}

function selectAsset(value) {
    filterAsset.value = value
    showAssetDropdown.value = false
}

function loadMockData() {
    const types = [
        { type: 'recharge', labelKey: 'bill.typeRecharge' },
        { type: 'withdraw', labelKey: 'bill.typeWithdraw' },
        { type: 'purchase', labelKey: 'bill.typePurchase' },
        { type: 'sell', labelKey: 'bill.typeSell' }
    ]
    const now = new Date()
    const items = []
    for (let i = 0; i < 20; i++) {
        const typeInfo = types[i % 4]
        const amount = (i % 2 === 0 ? 1 : -1) * (300 + Math.floor(Math.random() * 1000))
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const timeStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        items.push({
            id: `bill-${i}`,
            type: typeInfo.type,
            typeLabelKey: typeInfo.labelKey,
            asset: 'USDT',
            amount,
            amountFormatted: Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
            time: timeStr
        })
    }
    list.value = items
}

function openDatePicker() {
    showDateRangePicker.value = true
}

function handleDateConfirm(payload) {
    selectedDateRange.value = payload
    // 仅用日期部分作为标签，例如：2026/01/01-2026/01/30
    const start = payload.startDateStr.split(' ')[0]
    const end = payload.endDateStr.split(' ')[0]
    customDateLabel.value = `${start}-${end}`
}

function handleClickOutside(event) {
    if (typeFilterRef.value && !typeFilterRef.value.contains(event.target)) {
        showTypeDropdown.value = false
    }
    if (assetFilterRef.value && !assetFilterRef.value.contains(event.target)) {
        showAssetDropdown.value = false
    }
}

onMounted(() => {
    themeStore.applyTheme()
    loadMockData()
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.bill-page {
    padding: 56px 16px 24px;
    background-color: var(--bg-page-h5, #000000);
    color: var(--text-color, #ffffff);
    min-height: 100vh;
    box-sizing: border-box;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.filters-container {
    margin-top: 16px;
    margin-bottom: 12px;
}

.filters-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .filter-pill-wrapper {
        position: relative;
        flex: 1;
        min-width: 0;
    }

    .filter-pill {
        width: 100%;
        padding: 8px 12px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: transparent;
        color: var(--text-color, #ffffff);
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        transition: background-color 0.2s, border-color 0.2s;
    }

    .filter-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .filter-arrow {
        font-size: 10px;
        color: inherit;
        flex-shrink: 0;
    }
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    min-width: 100px;
    padding: 6px 0;
    border-radius: 10px;
    background-color: var(--bg-card, #1e1e1e);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 20;
}

.dropdown-item {
    padding: 10px 14px;
    font-size: 13px;
    color: var(--text-color, #ffffff);
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;

    &.active {
        font-weight: 600;
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.08);
    }
}

.bill-list {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
}

.bill-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    &:last-child {
        border-bottom: none;
    }
}

.bill-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.bill-icon-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: contain;
}

.bill-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.bill-type {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color, #ffffff);
}

.bill-time {
    font-weight: 400;
    font-size: 14px;
}

.bill-amount {
    font-size: 14px;
    flex-shrink: 0;

    &.inflow {
        color: #32B764;
    }

    &.outflow {
        color: #E44096;
    }
}

.loading-more,
.no-more {
    text-align: center;
    padding: 20px 0;
    font-size: 13px;
    color: var(--text-gray, #a0a0a0);
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    font-size: 14px;
    color: var(--text-gray, #a0a0a0);
}
</style>

<style>
.fade-dropdown-enter-active,
.fade-dropdown-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-dropdown-enter-from,
.fade-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
