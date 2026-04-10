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
                                :class="{ active: filterCurrency === opt.value }" @click="selectAsset(opt.value)">
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
                    <div class="bill-type">
                        {{ item.typeLabelKey ? $t(item.typeLabelKey) : item.type }}
                    </div>
                    <div class="bill-time">{{ item.time }}</div>
                </div>
                <div class="bill-right">
                    <div class="bill-amount" :class="item.amount >= 0 ? 'inflow' : 'outflow'">
                        {{ item.amount >= 0 ? '+' : '-' }}{{ item.amountFormatted }} {{  'USDT' }}
                    </div>
                    <div v-if="item.status" class="bill-status">
                        {{ item.status ? $t(`bill.status.${item.status}`) : '' }}
                    </div>
                    <div v-if="['REJECTED'].includes(item.status) && item.remark"
                        class="bill-remark">
                        {{ item.remark }}
                    </div>
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
        <DateRangePicker v-model="showDateRangePicker" @confirm="handleDateConfirm" @reset="handleDateReset" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { ArrowDownBold } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'
import DateRangePicker from '@/components/DateRangePicker.vue'
import { getTransactionHistory } from '@/api/APIEvent'
import { useAccount } from '@wagmi/vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const { address } = useAccount()

// 后端类型：all / FIAT_DEPOSIT / FIAT_WITHDRAW / ...
const filterType = ref('all')
const filterCurrency = ref('all')
const filterDate = ref(30)

const showTypeDropdown = ref(false)
const showAssetDropdown = ref(false)
const typeFilterRef = ref(null)
const assetFilterRef = ref(null)
const listRef = ref(null)

// 日期范围弹层 & 显示文案
const showDateRangePicker = ref(false)
const customDateLabel = ref('')
const selectedDateRange = ref(null)

const typeOptions = computed(() => [
    { value: 'all', label: t('bill.typeAll') },
    { value: 'FIAT_DEPOSIT', label: t('bill.typeRecharge') },
    { value: 'FIAT_WITHDRAW', label: t('bill.typeWithdraw') },
    { value: 'FIAT_BIG_WITHDRAW', label: t('bill.typeBigWithdraw') },
    { value: 'BET_FREEZE', label: t('bill.typeBetFreeze') },
    { value: 'BET_DEDUCT', label: t('bill.typeBetDeduct') },
    { value: 'BET_CANCEL', label: t('bill.typeBetCancel') },
    { value: 'SETTLE_WIN', label: t('bill.typeSettleWin') },
    { value: 'SETTLE_LOSE', label: t('bill.typeSettleLose') },
    { value: 'BET_SETTLE', label: t('bill.typeBetSettle') },
])

const assetOptions = computed(() => {
    const base = [{ value: 'all', label: t('bill.assetAll') }]
    const uniq = new Map()
    list.value.forEach((it) => {
        const code = it.currency_code || ''
        const symbol = it.currency_symbol || ''
        if (!code) return
        const key = code
        if (!uniq.has(key)) {
            uniq.set(key, {
                value: key,
                label: symbol ? `${symbol} ${key}` : key,
            })
        }
    })
    return base.concat(Array.from(uniq.values()))
})

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
    if (filterCurrency.value === 'all') {
        const opt = assetOptions.value.find(o => o.value === 'all')
        return opt ? opt.label : ''
    }
    const opt = assetOptions.value.find(o => o.value === filterCurrency.value)
    return opt ? opt.label : filterCurrency.value
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
const page = ref(1)
const totalPages = ref(1)
const PAGE_SIZE = 20


const isRespSuccess = (res) => {
    const code = res?.data?.code
    return code === 0 || code === 200 || code === 2000
}

const filteredList = computed(() => {
    let items = list.value
    // 资产筛选（前端兜底：按 currency_code 过滤当前已拉取数据）
    if (filterCurrency.value !== 'all') {
        items = items.filter(item => item.currency_code === filterCurrency.value)
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
    resetAndFetch()
}

function selectAsset(value) {
    filterCurrency.value = value
    showAssetDropdown.value = false
    resetAndFetch()
}

const formatTime = (item) => item?.created_at || ''

const TYPE_LABEL_KEY_MAP = {
    FIAT_DEPOSIT: 'bill.typeRecharge',
    FIAT_WITHDRAW: 'bill.typeWithdraw',
    FIAT_BIG_WITHDRAW: 'bill.typeBigWithdraw',
    BET_FREEZE: 'bill.typeBetFreeze',
    BET_DEDUCT: 'bill.typeBetDeduct',
    BET_CANCEL: 'bill.typeBetCancel',
    SETTLE_WIN: 'bill.typeSettleWin',
    SETTLE_LOSE: 'bill.typeSettleLose',
}

const getSignedAmount = (tx) => {
    const n = Number(tx?.amount)
    const amt = Number.isFinite(n) ? n : 0
    const type = String(tx?.type || '').toUpperCase()
    // 充值为流入，提现为流出；其它类型默认按正数展示（可后续补映射）
    if (['FIAT_WITHDRAW', 'FIAT_BIG_WITHDRAW', 'BET_FREEZE', 'BET_DEDUCT', 'SETTLE_LOSE'].includes(type)) return -Math.abs(amt)
    if (['FIAT_DEPOSIT', 'BET_CANCEL', 'SETTLE_WIN'].includes(type)) return Math.abs(amt)
    return amt
}

const mapTxToRow = (tx) => {

    const signed = getSignedAmount(tx)
    const type = String(tx?.type || '').toUpperCase()
    const code = tx?.currency_code || ''
    const symbol = tx?.currency_symbol || ''
    return {
        id: tx?.guid || tx?.ref_order_guid || '',
        type,
        typeLabelKey: TYPE_LABEL_KEY_MAP[type] || '',
        currency_code: code,
        currency_symbol: symbol,
        amount: signed,
        amountFormatted: Math.abs(signed).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 6 }),
        time: formatTime(tx),
        status: tx?.status || '',
        remark: tx?.remark || '',
        raw: tx,
    }
}

const toYMD = (dateLike) => {
    const d = dateLike instanceof Date ? dateLike : new Date(dateLike)
    if (Number.isNaN(d.getTime())) return ''
    const f = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${f(d.getMonth() + 1)}-${f(d.getDate())}`
}

const getDateRangeParams = () => {
    const payload = selectedDateRange.value
    if (payload?.startDate && payload?.endDate) {
        return { start_date: toYMD(payload.startDate), end_date: toYMD(payload.endDate) }
    }
    if (payload?.startDateStr && payload?.endDateStr) {
        // 兼容 "YYYY/MM/DD" 或含时间的字符串
        return {
            start_date: String(payload.startDateStr).slice(0, 10).replaceAll('/', '-'),
            end_date: String(payload.endDateStr).slice(0, 10).replaceAll('/', '-'),
        }
    }
    return {}
}

const fetchTransactionHistory = async (append = false) => {
    if (isLoading.value) return
    if (append && (!hasMore.value || page.value > totalPages.value)) return

    isLoading.value = true
    try {
        const type = filterType.value === 'all' ? 'all' : filterType.value
        const { start_date, end_date } = getDateRangeParams()
        const res = await getTransactionHistory({
            user_address: address?.value || '',
            type, // all / FIAT_DEPOSIT / FIAT_WITHDRAW / ...
            start_date: start_date || undefined,
            end_date: end_date || undefined,
            page: page.value,
            page_size: PAGE_SIZE,
        })
        if (!isRespSuccess(res)) {
            throw new Error(res?.data?.message || 'fetch transaction history failed')
        }

        const data = res?.data?.data || {}
        const txs = Array.isArray(data.list) ? data.list : []
        const mapped = txs.map(mapTxToRow)
        console.log(mapped)
        totalPages.value = Number(data.total_pages) || 1
        hasMore.value = page.value < totalPages.value
        list.value = append ? list.value.concat(mapped) : mapped
        page.value += 1
    } catch (e) {
        console.error('Fetch transaction history failed:', e)
        if (!append) list.value = []
        hasMore.value = false
    } finally {
        isLoading.value = false
    }
}

const resetAndFetch = () => {
    page.value = 1
    totalPages.value = 1
    hasMore.value = true
    list.value = []
    fetchTransactionHistory(false)
}

const onListScroll = (e) => {
    const el = e?.target
    if (!el || isLoading.value || !hasMore.value) return
    const threshold = 40
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
        fetchTransactionHistory(true)
    }
}

function openDatePicker() {
    showDateRangePicker.value = true
}

function handleDateConfirm(payload) {
    if (!payload) return
    selectedDateRange.value = payload
    // 仅用日期部分作为标签；兼容 startDateStr/endDateStr 或 startDate/endDate
    const startStr = payload.startDateStr ?? (payload.startDate ? formatDateForLabel(payload.startDate) : '')
    const endStr = payload.endDateStr ?? (payload.endDate ? formatDateForLabel(payload.endDate) : '')
    const start = startStr ? startStr.split(' ')[0] : ''
    const end = endStr ? endStr.split(' ')[0] : ''
    customDateLabel.value = start && end ? `${start}-${end}` : customDateLabel.value
    resetAndFetch()
}

function handleDateReset() {
    selectedDateRange.value = null
    customDateLabel.value = ''
    resetAndFetch()
}

function formatDateForLabel(date) {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return ''
    const f = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}/${f(d.getMonth() + 1)}/${f(d.getDate())}`
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
    document.addEventListener('click', handleClickOutside)
    resetAndFetch()
    if (listRef.value) {
        listRef.value.addEventListener('scroll', onListScroll, { passive: true })
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    if (listRef.value) {
        listRef.value.removeEventListener('scroll', onListScroll)
    }
})

watch(() => filterType.value, () => {
    // 已在 selectType 中 resetAndFetch，这里兜底防止外部改值
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

.bill-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
}

.bill-amount {
    font-size: 14px;

    &.inflow {
        color: #32B764;
    }

    &.outflow {
        color: #E44096;
    }
}

.bill-status {
    font-size: 12px;

    // &.processing,
    // &.pending {
    //     color: #E6A23C;
    // }

    // &.completed {
    //     color: #32B764;
    // }

    // &.rejected,
    // &.failed {
    //     color: #F56C6C;
    // }
}

.bill-remark {
    font-size: 12px;
    // color: #F56C6C;
    max-width: 150px;
    text-align: right;
    word-break: break-all;
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
