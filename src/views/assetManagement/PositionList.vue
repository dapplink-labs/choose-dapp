<template>
    <div class="position-list">
        <!-- 顶部 Tab -->
        <div class="position-tabs">
            <div v-for="tab in tabs" :key="tab.value"
                :class="['position-tab-item', { active: activeTab === tab.value }]" @click="switchTab(tab.value)">
                {{ tab.label }}
            </div>
        </div>

        <!-- 搜索与筛选 -->
        <div class="position-filters">
            <div class="search-box">
                <el-icon class="search-icon">
                    <Search />
                </el-icon>
                <input v-model="searchKeyword" type="text" class="search-input"
                    :placeholder="t('assetManagement.search')" />
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

            <button v-if="activeTab === 'pending'" type="button" class="filter-pill filter-action-btn"
                :disabled="cancelAllLoading" @click.stop="onCancelAllPending">
                {{ cancelAllLoading ? (t('common.loading') || 'Loading...') : (t('assetManagement.cancelAllOrders') ||
                'Cancel all') }}
            </button>

            <div v-else class="filter-pill" @click="toggleMonthDropdown">
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
            <template v-for="item in filteredList" :key="item.id">
                <div class="position-item">
                    <div class="position-left">
                        <div class="token-icon" :style="{ backgroundColor: item.iconBg }">
                            <span class="token-text">{{ item.tokenSymbol.slice(0, 1) }}</span>
                        </div>
                    </div>

                    <div class="position-middle">
                        <div class="title-row">
                            <span class="title-text">{{ item.title }}</span>
                            <!-- 仓位事件：显示价格；历史仓位事件：显示盈亏金额 -->
                            <span v-if="activeTab === 'open'" class="price-text">
                                ${{ item.price }}
                            </span>
                            <span v-else-if="activeTab === 'history'" class="price-text"
                                :class="item.resultAmount > 0 ? 'pnl-positive' : 'pnl-negative'">
                                {{ item.resultAmount > 0 ? '+' : '' }}${{ Math.abs(item.resultAmount) }}
                            </span>
                        </div>

                        <div class="meta-row">
                            <span class="side-tag" :class="String(item.side || '').toLowerCase()">
                                {{ item.side === 'SELL' ? t('assetManagement.sell') : t('assetManagement.buy') }}
                            </span>
                            <span class="odds-tag" :class="item.oddsType || 'no'">
                                {{ item.oddsLabel }}
                            </span>

                            <!-- 仓位事件：显示盈亏百分比 -->
                            <template v-if="activeTab === 'open'">
                                <span class="pnl-text" :class="item.pnl > 0 ? 'pnl-positive' : 'pnl-negative'">
                                    {{ item.pnl > 0 ? '+' : '' }}{{ item.pnl }}%
                                </span>
                            </template>

                            <!-- 委托仓位：显示进度 -->
                            <template v-else-if="activeTab === 'pending'">
                                <button type="button" class="cancel-btn" :disabled="cancelingId === item.id"
                                    @click.stop="onCancelPending(item)">
                                    {{ cancelingId === item.id ? (t('common.loading') || 'Loading...') :
                                        (t('assetManagement.cancelOrder') || 'Cancel') }}
                                </button>
                            </template>

                            <!-- 历史仓位事件：显示状态图标 -->
                            <template v-else-if="activeTab === 'history'">
                                <span class="status-pill status-right"
                                    :class="item.status === 'lost' ? 'status-lost' : 'status-claimed'">
                                    <el-icon class="status-icon">
                                        <CloseBold v-if="item.status === 'lost'" />
                                        <Select v-else />
                                    </el-icon>
                                    <span class="status-text">{{ item.status }}</span>
                                </span>
                            </template>
                        </div>

                        <div class="sub-row">
                            <span class="value-text">{{ t('assetManagement.valueLabel') }}: ${{ item.value }}</span>
                            <span class="time-text">{{ item.time }}</span>
                        </div>
                    </div>
                </div>
            </template>

            <!-- 上拉加载哨兵 -->
            <div ref="loadMoreSentinel" class="load-more-sentinel" aria-hidden="true"></div>

        <!-- 底部加载 / 无更多 文案 -->
        <div v-if="filteredList.length > 0" class="load-more-footer">
            <span v-if="loading && hasMore" class="load-more-text">
                {{ t('common.loading') || 'Loading...' }}
            </span>
            <span v-else-if="!loading && !hasMore" class="load-more-text">
                {{ t('common.noMoreData') || 'No more data' }}
            </span>
        </div>

        <!-- 为空态 -->
        <div v-if="!loading && filteredList.length === 0" class="list-empty">
            {{ t('common.noData') || 'No data' }}
        </div>
    </div>

    <!-- 自定义底部取消挂单弹窗 -->
    <transition name="slide-up-modal">
        <div v-if="cancelDialogVisible" class="custom-bottom-modal-overlay" @click.self="onCancelClose">
            <div class="custom-bottom-modal">
                <div class="modal-handle"></div>
                <div class="modal-icon">
                    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="24" cy="24" r="22" stroke="#f3a228" stroke-width="4" fill="none" />
                        <path d="M24 14V26" stroke="#f3a228" stroke-width="4" stroke-linecap="square"/>
                        <circle cx="24" cy="34" r="2.5" fill="#f3a228"/>
                    </svg>
                </div>
                <div class="modal-title">
                    {{ cancelDialogType === 'all' ? ($t('assetManagement.cancelAllOrdersConfirm') || '是否取消所有挂单？') : ($t('assetManagement.cancelOrderConfirm') || '是否取消该挂单？') }}
                </div>
                <div class="modal-subtitle">
                    {{ $t('assetManagement.cancelOrderSubTitle') || '挂单取消后，金额将返还到资金账户' }}
                </div>
                <div class="modal-actions">
                    <button class="btn-cancel" @click="onCancelClose">{{ $t('common.cancel') || '取消' }}</button>
                    <button class="btn-confirm" @click="onCancelConfirm">{{ $t('common.confirm') || '确认' }}</button>
                </div>
            </div>
        </div>
    </transition>
</div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDownBold, CloseBold, Select, Search } from '@element-plus/icons-vue'
import { useAccount } from '@wagmi/vue'
import { getOpenOrders, getOrderHistory, getUserPositions, cancelOrder } from '@/api/APIEvent'
import { ElMessage, ElMessageBox } from 'element-plus'

const { t } = useI18n()
const { address } = useAccount()

const tabs = computed(() => [
    { label: t('assetManagement.positionEvents'), value: 'open' },
    { label: t('assetManagement.entrustedPositions'), value: 'pending' },
    { label: t('assetManagement.historyPositionEvents'), value: 'history' }
])

const activeTab = ref('open')

const searchKeyword = ref('')
const filterType = ref('all')
const filterMonth = ref('')

const typeOptions = computed(() => {
    if (activeTab.value === 'history') {
        // 历史仓位：按订单状态筛选
        return [
            { value: 'all', label: t('assetManagement.all') },
            { value: 'COMPLETED', label: t('assetManagement.completed') || 'COMPLETED' },
            { value: 'CANCELLED', label: t('assetManagement.cancelled') || 'CANCELLED' },
        ]
    }
    // 仓位事件：目前只有 Buy 持仓
    if (activeTab.value === 'open') {
        return [
            { value: 'all', label: t('assetManagement.all') },
            { value: 'BUY', label: t('assetManagement.buy') || 'Buy' }
        ]
    }
    // 委托仓位：按 Buy / Sell 筛选
    return [
        { value: 'all', label: t('assetManagement.all') },
        { value: 'BUY', label: t('assetManagement.buy') || 'Buy' },
        { value: 'SELL', label: t('assetManagement.sell') || 'Sell' },
    ]
})

const monthOptions = computed(() => {
    const now = new Date()
    const list = []
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const ym = `${y}-${m}`
        list.push({ value: ym, label: ym })
    }
    return list
})

const showTypeDropdown = ref(false)
const showMonthDropdown = ref(false)

const currentTypeLabel = computed(() => {
    return typeOptions.value.find(v => v.value === filterType.value)?.label ?? t('assetManagement.all')
})

const currentMonthLabel = computed(() => {
    return monthOptions.value.find(v => v.value === filterMonth.value)?.label ?? (t('common.all') || 'All')
})

const list = ref([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const hasMore = computed(() => page.value <= totalPages.value)
const PAGE_SIZE = 20


const isRespSuccess = (res) => {
    const code = res?.data?.code
    return code === 0 || code === 200 || code === 2000
}

const cancelingId = ref('')
const cancelAllLoading = ref(false)

// 自定义取消挂单弹窗逻辑
const cancelDialogVisible = ref(false)
const cancelDialogType = ref('single') // 'single' 或 'all'
const cancelResolve = ref(null)
const cancelReject = ref(null)

const showCustomConfirm = (type) => {
    cancelDialogType.value = type
    cancelDialogVisible.value = true
    return new Promise((resolve, reject) => {
        cancelResolve.value = resolve
        cancelReject.value = reject
    })
}

const onCancelConfirm = () => {
    cancelDialogVisible.value = false
    if (cancelResolve.value) cancelResolve.value()
}

const onCancelClose = () => {
    cancelDialogVisible.value = false
    if (cancelReject.value) cancelReject.value()
}

const onCancelPending = async (item) => {
    if (activeTab.value !== 'pending') return
    const order_guid = item?.id || item?.raw?.guid || ''
    if (!order_guid) {
        ElMessage.error('Missing order guid')
        return
    }

    try {
        await showCustomConfirm('single')
    } catch {
        return
    }

    if (cancelingId.value) return
    cancelingId.value = order_guid
    try {
        const res = await cancelOrder({
            order_guid,
            user_address: address.value,
        })
        if (!isRespSuccess(res)) {
            throw new Error(res?.data?.message || 'Cancel failed')
        }
        ElMessage.success(res?.data?.data?.message || res?.data?.message || (t('assetManagement.cancelSuccess') || 'Canceled'))
        resetAndFetch()
    } catch (e) {
        ElMessage.error(e?.message || 'Cancel failed')
    } finally {
        cancelingId.value = ''
    }
}

const fetchAllOpenOrderGuids = async () => {
    const guids = []
    let p = 1
    let total = 1
    while (p <= total) {
        const res = await getOpenOrders({
            user_address: address.value,
            page: p,
            page_size: 100,
            event_guid: undefined,
            sub_event_guid: undefined,
            order_type: 'all',
            side: getSideFilterParam(),
        })
        if (!isRespSuccess(res)) {
            throw new Error(res?.data?.message || 'fetch open orders failed')
        }
        const data = res?.data?.data || {}
        total = Number(data.total_pages) || 1
        const orders = Array.isArray(data.orders) ? data.orders : []
        for (const o of orders) {
            const guid = o?.guid || o?.order_guid || ''
            if (guid) guids.push(guid)
        }
        p += 1
    }
    return Array.from(new Set(guids))
}

const onCancelAllPending = async () => {
    if (activeTab.value !== 'pending') return
    if (cancelAllLoading.value) return

    try {
        await showCustomConfirm('all')
    } catch {
        return
    }

    cancelAllLoading.value = true
    try {
        const guids = await fetchAllOpenOrderGuids()
        if (!guids.length) {
            ElMessage.info(t('assetManagement.noOpenOrdersToCancel') || 'No open orders')
            return
        }

        let successCount = 0
        let failCount = 0
        for (const order_guid of guids) {
            try {
                const res = await cancelOrder({ order_guid, user_address: address.value })
                if (!isRespSuccess(res)) throw new Error(res?.data?.message || 'Cancel failed')
                successCount += 1
            } catch {
                failCount += 1
            }
        }

        if (successCount > 0) {
            ElMessage.success(
                t('assetManagement.cancelAllSuccess', { n: successCount }) || `Canceled ${successCount}`,
            )
        }
        if (failCount > 0) {
            ElMessage.warning(
                t('assetManagement.cancelAllFailed', { n: failCount }) || `Failed ${failCount}`,
            )
        }
        resetAndFetch()
    } catch (e) {
        ElMessage.error(e?.message || 'Cancel failed')
    } finally {
        cancelAllLoading.value = false
    }
}

const tabToStatus = (tab) => {
    if (tab === 'open') return 'holding'
    if (tab === 'pending') return 'closed'
    return 'settled'
}

const toYMD = (d) => {
    const date = d instanceof Date ? d : new Date(d)
    if (Number.isNaN(date.getTime())) return ''
    const f = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${f(date.getMonth() + 1)}-${f(date.getDate())}`
}

const monthToRange = (ym) => {
    if (!ym) return null
    const [y, m] = String(ym).split('-').map(v => Number(v))
    if (!y || !m) return null
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 0)
    return { start_date: toYMD(start), end_date: toYMD(end) }
}

const parsePct = (v) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return null
    return n <= 1 ? n * 100 : n
}

const formatNum = (v, digits = 2) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return '0'
    return n.toFixed(digits)
}

const formatPriceToCentText = (v) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return '--'
    // 常见价格为 0~1 之间的小数，展示为 ¢
    if (n > 0 && n <= 1) return `${(n * 100).toFixed(1)} ¢`
    return `${formatNum(n, 2)} USDT`
}

const getSideFilterParam = () => {
    if (activeTab.value === 'open') return 'all'
    if (filterType.value === 'BUY' || filterType.value === 'SELL') return filterType.value
    return 'all'
}

const getStatusFilterParam = () => {
    if (activeTab.value !== 'history') return ''
    if (filterType.value === 'COMPLETED' || filterType.value === 'CANCELLED') return filterType.value
    return ''
}

const getDisplayOutcome = (outcome) => {
    if (!outcome) return '';
    const str = String(outcome).toLowerCase();
    if (str === 'up') return t('bitcoinUpDown.up') || '涨';
    if (str === 'down') return t('bitcoinUpDown.down') || '跌';
    return outcome;
}

const mapPositionToRow = (p) => {
    const title = p?.event_name || ''
    const outcome = String(p?.outcome || '').toUpperCase() || 'YES'
    const chancePct = parsePct(p?.chance)
    const oddsType = outcome === 'NO' ? 'no' : 'yes'
    const price = Number(p?.current_price ?? p?.avg_price)
    const priceText = Number.isFinite(price) ? formatNum(price, 2) : '--'

    const bet = Number(p?.bet_amount)
    const pnlAbs = Number(p?.profit_loss)
    const pnlPct = (Number.isFinite(bet) && bet !== 0 && Number.isFinite(pnlAbs))
        ? (pnlAbs / bet) * 100
        : Number(p?.lost_rate)

    const positionValue = Number(p?.position_value)
    const time = (p?.trade_at || p?.updated_at || p?.created_at || '').replace('T', ' ').replace('Z', '')

    return {
        id: p?.guid || '',
        tokenSymbol: title ? title.slice(0, 1).toUpperCase() : 'P',
        title,
        // 右上角显示当前价格（USDT）
        price: priceText,
        // 左侧标签显示 Buy（目前接口无 side 字段，统一视为买入持仓）
        side: 'BUY',
        outcome,
        iconBg: outcome === 'NO' ? '#E44096' : '#2FBC87',
        // 中间行右侧显示盈亏百分比
        pnl: Number.isFinite(pnlPct) ? Number(pnlPct.toFixed(2)) : 0,
        oddsType,
        // 中间粉/绿标签：Buy/Sell + 价格（¢）
        oddsLabel: `${getDisplayOutcome(outcome)} ${formatPriceToCentText(price)}`,
        // 底部右上角状态和历史复用字段
        resultAmount: Number.isFinite(pnlAbs) ? Number(pnlAbs.toFixed(2)) : 0,
        status: (Number(pnlAbs) < 0) ? 'lost' : 'claimed',
        // 底部“价值”使用 position_value
        value: Number.isFinite(positionValue) ? positionValue.toFixed(2) : '0.00',
        time,
        raw: p,
    }
}

const mapOpenOrderToRow = (o) => {
    const title = o?.event_title || ''
    const outcome = String(o?.outcome || '').toUpperCase() || 'YES'
    const tradeSide = String(o?.side || '').toUpperCase() || 'BUY' // BUY / SELL
    const dealedSizeNum = Number(o?.dealed_size)
    const sizeNum = Number(o?.size)
    const progressText = (Number.isFinite(dealedSizeNum) && Number.isFinite(sizeNum) && sizeNum > 0)
        ? `${formatNum(dealedSizeNum, 2)}/${formatNum(sizeNum, 2)}`
        : (o?.progress ? `${o.progress}%` : '--')

    const priceNum = Number(o?.price)
    const time = (o?.expire_at || o?.updated_at || o?.created_at || '').replace('T', ' ').replace('Z', '')

    const costNum = Number(o?.cost)
    const valueText = Number.isFinite(costNum) ? costNum.toFixed(2) : (o?.cost || '0.00')

    return {
        id: o?.guid || '',
        tokenSymbol: title ? title.slice(0, 1).toUpperCase() : 'O',
        title,
        price: Number.isFinite(priceNum) ? formatNum(priceNum, 2) : '--',
        side: tradeSide, // BUY/SELL（pending tab 左侧标签）
        outcome,
        iconBg: outcome === 'NO' ? '#E44096' : '#2FBC87',
        pnl: 0,
        oddsType: outcome === 'NO' ? 'no' : 'yes',
        oddsLabel: `${getDisplayOutcome(outcome)} ${formatPriceToCentText(priceNum)}`,
        resultAmount: 0,
        status: String(o?.status || '').toLowerCase(),
        value: valueText,
        time,
        progressText,
        raw: o,
    }
}

const mapOrderHistoryToRow = (o) => {
    const title = o?.event_title || o?.event_guid || ''
    const outcome = String(o?.outcome || '').toUpperCase() || 'YES'
    const tradeSide = String(o?.side || '').toUpperCase() || 'BUY' // BUY/SELL

    const priceNum = Number(o?.dealed_price ?? o?.price)
    const principalNum = Number(o?.dealed_cost)
    const pnlAbs = Number(o?.profit)
    const pnlPct = (Number.isFinite(principalNum) && principalNum !== 0 && Number.isFinite(pnlAbs))
        ? (pnlAbs / principalNum) * 100
        : 0

    const time = (o?.dealed_at || o?.created_at || '').replace('T', ' ').replace('Z', '')

    return {
        id: o?.order_guid || o?.guid || '',
        tokenSymbol: title ? title.slice(0, 1).toUpperCase() : 'H',
        title,
        price: Number.isFinite(priceNum) ? formatNum(priceNum, 2) : '--',
        side: tradeSide, // BUY/SELL（history tab）
        outcome,
        iconBg: outcome === 'NO' ? '#E44096' : '#2FBC87',
        pnl: Number.isFinite(pnlPct) ? Number(pnlPct.toFixed(2)) : 0,
        oddsType: outcome === 'NO' ? 'no' : 'yes',
        oddsLabel: `${o?.sub_event_title || getDisplayOutcome(outcome)} · ${formatPriceToCentText(priceNum)}`,
        resultAmount: Number.isFinite(pnlAbs) ? Number(pnlAbs.toFixed(2)) : 0,
        status: (Number.isFinite(pnlAbs) && pnlAbs < 0) ? 'lost' : 'claimed',
        value: Number.isFinite(principalNum) ? principalNum.toFixed(2) : (o?.dealed_cost || '0.00'),
        time,
        raw: o,
    }
}

const filteredList = computed(() => {
    return list.value.filter(item => {
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
    resetAndFetch()
}

const selectMonth = (val) => {
    filterMonth.value = val
    showMonthDropdown.value = false
    resetAndFetch()
}

const fetchPositions = async (append = false) => {
    if (loading.value) return
    if (append && !hasMore.value) return
    if (!address.value && !getUserGuid()) return

    loading.value = true
    try {
        const currentLocale = localStorage.getItem('app-locale') || navigator.language || 'en'
        const language_label = currentLocale.split('-')[0]

        let res
        if (activeTab.value === 'pending') {
            // 委托仓位（挂单）
            res = await getOpenOrders({
                user_address: address.value || '',
                page: page.value,
                page_size: PAGE_SIZE,
                event_guid: undefined,
                sub_event_guid: undefined,
                order_type: 'all',
                side: getSideFilterParam(),
            })
        } else if (activeTab.value === 'history') {
            // 历史仓位订单
            const range = monthToRange(filterMonth.value)
            res = await getOrderHistory({
                user_address: address.value || '',
                page: page.value,
                page_size: PAGE_SIZE,
                start_date: range?.start_date,
                end_date: range?.end_date,
                status: getStatusFilterParam(),
                is_settled: '',
                event_guid: undefined,
                sub_event_guid: undefined,
            })
        } else {
            const status = tabToStatus(activeTab.value)
            const range = monthToRange(filterMonth.value)
            res = await getUserPositions({
                user_address: address.value || '',
                status,
                page: page.value,
                page_size: PAGE_SIZE,
                language_label,
                start_date: range?.start_date,
                end_date: range?.end_date,
            })
        }

        if (!isRespSuccess(res)) {
            throw new Error(res?.data?.message || 'fetch positions failed')
        }

        const data = res?.data?.data || {}
        const rows = activeTab.value === 'pending'
            ? (Array.isArray(data.orders) ? data.orders : []).map(mapOpenOrderToRow)
            : activeTab.value === 'history'
                ? (Array.isArray(data.orders) ? data.orders : []).map(mapOrderHistoryToRow)
                : (Array.isArray(data.list) ? data.list : []).map(mapPositionToRow)
        totalPages.value = Number(data.total_pages) || 1
        list.value = append ? list.value.concat(rows) : rows
        page.value += 1
    } catch (e) {
        console.error('Fetch positions failed:', e)
        if (!append) list.value = []
        totalPages.value = page.value - 1
    } finally {
        loading.value = false
    }
}

const resetAndFetch = () => {
    page.value = 1
    totalPages.value = 1
    list.value = []
    fetchPositions(false)
}

const switchTab = (tab) => {
    if (activeTab.value === tab) return
    activeTab.value = tab
    filterType.value = 'all' // 切换 tab 时重置筛选类型
    resetAndFetch()
}

// 上拉加载：IntersectionObserver 监听触底
const loadMoreSentinel = ref(null)
let loadMoreObserver = null

const setupLoadMoreObserver = () => {
    if (typeof IntersectionObserver === 'undefined') return
    loadMoreObserver = new IntersectionObserver(
        (entries) => {
            const entry = entries[0]
            if (!entry?.isIntersecting || loading.value || !hasMore.value) return
            fetchPositions(true)
        },
        {
            root: null,
            rootMargin: '100px',
            threshold: 0,
        },
    )
}

watch(
    () => filteredList.value.length,
    (len) => {
        nextTick(() => {
            if (!loadMoreObserver) setupLoadMoreObserver()
            if (len > 0 && loadMoreSentinel.value) {
                loadMoreObserver.observe(loadMoreSentinel.value)
            }
        })
    },
    { flush: 'post' },
)

onMounted(() => {
    // 默认月份为本月
    if (!filterMonth.value) filterMonth.value = monthOptions.value[0]?.value || ''
    resetAndFetch()
})

watch(() => address.value, () => {
    resetAndFetch()
})

// 点击页面其它地方关闭下拉
if (typeof window !== 'undefined') {
    window.addEventListener('click', () => {
        showTypeDropdown.value = false
        showMonthDropdown.value = false
    })
}

onBeforeUnmount(() => {
    loadMoreObserver?.disconnect?.()
})
</script>

<style scoped lang="scss">
.position-list {
    margin-top: 20px;
}

.load-more-footer {
    text-align: center;
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

.filter-action-btn {
    background: rgba(255, 75, 130, 0.12);
    border-color: rgba(255, 75, 130, 0.35);
    color: #FF4B82;
    font-weight: 600;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 100%;
    max-height: 150px;
    overflow-y: auto;
    border-radius: 10px;
    padding: 6px 0;
    border: 1px solid var(--border-color);
    background-color: var(--bg-page-h5);
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    /* 滚动条样式 */
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: var(--border-color);
        border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }

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
}

.list-loading,
.list-no-more,
.list-empty {
    text-align: center;
    padding: 18px 0;
    font-size: 13px;
    color: var(--text-gray, #888);
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
        max-width: 50%;

        &.no {
            background: rgba(255, 75, 130, 0.2);
            color: var(--text-color-n, #E44096);
        }

        &.yes {
            background: rgba(46, 190, 105, 0.2);
            color: var(--text-color-y, #2EBE69);
        }
    }

    .pnl-text {
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

    .cancel-btn {
        margin-left: auto;
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 14px;
        color: #FF4B82;
        background: rgba(255, 75, 130, 0.12);
        border: 1px solid rgba(255, 75, 130, 0.35);
        border-radius: 8px;
        padding: 4px 10px;
        cursor: pointer;

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
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

/* 自定义底部弹窗样式 */
.custom-bottom-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.custom-bottom-modal {
    width: 100%;
    background: var(--bg-page-h5, #1e1e1e);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 24px 20px 32px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    .modal-handle {
        width: 40px;
        height: 4px;
        background: var(--border-color, #444);
        border-radius: 2px;
        margin-bottom: 24px;
        position: absolute;
        top: 12px;
    }

    .modal-icon {
        margin-bottom: 20px;
        margin-top: 10px;
    }

    .modal-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--bg-opposite, #fff);
        margin-bottom: 12px;
    }

    .modal-subtitle {
        font-size: 14px;
        color: var(--text-dark-gray, #888);
        margin-bottom: 32px;
    }

    .modal-actions {
        width: 100%;
        display: flex;
        gap: 16px;

        button {
            flex: 1;
            height: 48px;
            border-radius: 24px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            cursor: pointer;
        }

        .btn-cancel {
            background: var(--bg-pn, #2a2a2a);
            color: var(--bg-opposite, #fff);
        }

        .btn-confirm {
            background: var(--text-color-y, #b8ff22);
            color: #000;
        }
    }
}

.slide-up-modal-enter-active,
.slide-up-modal-leave-active {
    transition: opacity 0.3s;

    .custom-bottom-modal {
        transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    }
}

.slide-up-modal-enter-from,
.slide-up-modal-leave-to {
    opacity: 0;

    .custom-bottom-modal {
        transform: translateY(100%);
    }
}
</style>

<style lang="scss">
.cancel-order-confirm {
    width: min(380px, calc(100vw - 48px));
    border-radius: 14px;

    .el-message-box__title {
        line-height: 1.2;
    }

    .el-message-box__content {
        padding-top: 10px;
        padding-bottom: 6px;
        line-height: 1.35;
        word-break: break-word;
        overflow-wrap: anywhere;
    }

    .el-message-box__btns {
        gap: 10px;
    }

    .el-button {
        min-width: 108px;
    }
}
</style>
