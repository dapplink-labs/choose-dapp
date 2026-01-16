<template>
    <div class="claim-record-page">
        <BackHeaderNav :title="$t('claimRecord.title')" />

        <div class="filters-row">
            <!-- 服务类型下拉框：算力服务 / 质押池 -->
            <div class="filter-pill-wrapper" ref="serviceFilterRef">
                <button class="filter-pill" type="button" @click="toggleServiceDropdown">
                    <span class="filter-label">{{ currentServiceLabel }}</span>
                    <el-icon class="filter-arrow">
                        <ArrowDownBold />
                    </el-icon>
                </button>
                <transition name="fade-dropdown">
                    <div v-if="showServiceDropdown" class="dropdown-menu">
                        <div
                            class="dropdown-item"
                            :class="{ active: currentServiceType === 'computingPower' }"
                            @click="selectServiceType('computingPower')"
                        >
                            {{ $t('claimRecord.computingPowerService') }}
                        </div>
                        <div
                            class="dropdown-item"
                            :class="{ active: currentServiceType === 'lpVault' }"
                            @click="selectServiceType('lpVault')"
                        >
                            {{ $t('claimRecord.lpVault') }}
                        </div>
                    </div>
                </transition>
            </div>
            <button class="filter-pill" type="button">
                <span class="filter-label">{{ currentMonthLabel }}</span>
                <el-icon class="filter-arrow">
                    <ArrowDownBold />
                </el-icon>
            </button>
        </div>

        <div class="record-list" ref="recordListRef" @scroll="handleScroll">
            <div
                v-for="(item, index) in visibleRecords"
                :key="index"
                class="record-item"
            >
                <div class="record-left">
                    <div class="record-title">{{ item.title }}</div>
                    <div class="record-time">{{ item.time }}</div>
                </div>
                <div class="record-amount">
                    +{{ item.amount }} CHO
                </div>
            </div>
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-more">
                {{ $t('common.loading') || '加载中...' }}
            </div>
            <!-- 没有更多数据 -->
            <div v-if="!hasMore && visibleRecords.length > 0" class="no-more">
                {{ $t('common.noMoreData') || '没有更多数据了' }}
            </div>
            <!-- 空状态 -->
            <div v-if="!isLoading && visibleRecords.length === 0" class="empty-state">
                {{ $t('common.noData') || '暂无数据' }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccount } from '@wagmi/vue'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { ArrowDownBold } from '@element-plus/icons-vue'
import { getNodeServiceProviderRewardRecords, getNodeStakingRewardRecords } from '@/api/API'
import { formatDateTime } from '@/utils/format_date.js'

const { t } = useI18n()
const { address } = useAccount()

// 当前筛选：服务类型 & 月份
const currentServiceType = ref('computingPower') // 默认：算力服务
const currentMonth = ref('2025-09')

// 服务类型下拉框状态
const showServiceDropdown = ref(false)
const serviceFilterRef = ref(null)

// 列表相关
const recordListRef = ref(null)
const allRecords = ref({
    computingPower: [],
    lpVault: []
})

// 分页相关
const page = ref({
    computingPower: 1,
    lpVault: 1
})
const pageSize = ref(10)
const hasMore = ref({
    computingPower: true,
    lpVault: true
})
const isLoading = ref(false)

// 格式化金额
const formatAmount = (value) => {
    const num = Number(value ?? 0)
    if (!Number.isFinite(num)) return '0'
    const fixed = num.toFixed(4)
    const trimmed = fixed.replace(/\.?0+$/, '')
    const [intPart, decimalPart] = trimmed.split('.')
    const intFormatted = Number(intPart).toLocaleString('en-US')
    return decimalPart ? `${intFormatted}.${decimalPart}` : intFormatted
}

const currentServiceLabel = computed(() => {
    if (currentServiceType.value === 'computingPower') {
        return t('claimRecord.computingPowerService')
    }
    return t('claimRecord.lpVault')
})

const currentMonthLabel = computed(() => currentMonth.value.replace('-', '–'))

// 当前列表（根据服务类型筛选）
const visibleRecords = computed(() => {
    return allRecords.value[currentServiceType.value] || []
})

// 打开 / 关闭服务类型下拉框
const toggleServiceDropdown = () => {
    showServiceDropdown.value = !showServiceDropdown.value
}

// 选择服务类型（算力服务 / 质押池）
const selectServiceType = (type) => {
    currentServiceType.value = type
    showServiceDropdown.value = false
    // 切换类型时，如果当前类型没有数据，则加载第一页
    if (allRecords.value[type].length === 0) {
        page.value[type] = 1
        hasMore.value[type] = true
        fetchRecords()
    }
}

// 获取记录列表
const fetchRecords = async (isLoadMore = false) => {
    if (!address.value || isLoading.value) return
    
    const currentType = currentServiceType.value
    const currentPage = isLoadMore ? page.value[currentType] + 1 : 1
    
    // 如果没有更多数据，不继续请求
    if (!hasMore.value[currentType] && isLoadMore) return
    
    isLoading.value = true
    
    try {
        const params = {
            address: address.value,
            page: currentPage,
            page_size: pageSize.value
        }
        
        let res
        if (currentType === 'computingPower') {
            // 算力服务
            res = await getNodeServiceProviderRewardRecords(params)
        } else {
            // 质押池
            res = await getNodeStakingRewardRecords(params)
        }
        
        const data = res?.data?.data || {}
        const list = data.list || []
        const total = data.total || 0
        
        // 映射 type 字段（仅针对算力服务）
        const mapNodeType = (type, serviceType) => {
            if (serviceType === 'computingPower') {
                // 算力服务：type 1 为分布节点，type 2 为集群节点
                if (type === 1 || type === '1') {
                    return t('claimRecord.distributedNode')
                } else if (type === 2 || type === '2') {
                    return t('claimRecord.clusterNode')
                }
            }
            // 其他情况直接返回原始值
            return type
        }
        
        // 映射数据格式
        const mappedList = list.map(item => {
            // 根据接口返回的字段映射，可能需要根据实际接口调整
            const title = mapNodeType(item.type, currentType)
            
            const time = formatDateTime(item.created || item.create_time || item.time || item.created_at)
            const amount = formatAmount(item.amount || item.reward || item.total_reward || 0)
            
            return {
                title,
                time,
                amount
            }
        })
        
        if (isLoadMore) {
            // 加载更多：追加数据
            allRecords.value[currentType].push(...mappedList)
            page.value[currentType] = currentPage
        } else {
            // 首次加载或刷新：替换数据
            allRecords.value[currentType] = mappedList
            page.value[currentType] = 1
        }
        
        // 判断是否还有更多数据
        const currentTotal = allRecords.value[currentType].length
        hasMore.value[currentType] = currentTotal < total && mappedList.length === pageSize.value
        
    } catch (error) {
        console.error('获取记录列表失败：', error)
    } finally {
        isLoading.value = false
    }
}

// 上拉加载
const handleScroll = () => {
    if (!recordListRef.value || isLoading.value || !hasMore.value[currentServiceType.value]) return
    
    const { scrollTop, scrollHeight, clientHeight } = recordListRef.value
    // 距离底部 50px 时触发加载
    if (scrollHeight - scrollTop - clientHeight < 50) {
        fetchRecords(true)
    }
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
    if (!serviceFilterRef.value) return
    if (!serviceFilterRef.value.contains(event.target)) {
        showServiceDropdown.value = false
    }
}

// 监听服务类型变化
watch(currentServiceType, () => {
    // 切换类型时，如果当前类型没有数据，则加载第一页
    if (allRecords.value[currentServiceType.value].length === 0) {
        page.value[currentServiceType.value] = 1
        hasMore.value[currentServiceType.value] = true
        fetchRecords()
    }
})

// 监听地址变化
watch(() => address.value, (newAddress) => {
    if (newAddress) {
        // 地址变化时，重置所有数据并重新加载
        allRecords.value = {
            computingPower: [],
            lpVault: []
        }
        page.value = {
            computingPower: 1,
            lpVault: 1
        }
        hasMore.value = {
            computingPower: true,
            lpVault: true
        }
        fetchRecords()
    }
})

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    // 初始加载数据
    if (address.value) {
        fetchRecords()
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.claim-record-page {
    padding: 50px 16px 0;
    background-color: var(--bg-page-h5, #FFFFFF);
    color: var(--text-color, #1a1a1a);
    min-height: 100vh;
    box-sizing: border-box;
    transition: background-color 0.3s ease, color 0.3s ease;

    .filters-row {
        display: flex;
        gap: 12px;
        margin-top: 16px;
        margin-bottom: 12px;

        .filter-pill-wrapper {
            position: relative;
        }

        .filter-pill {
            flex: 0 0 auto;
            padding: 6px 14px;
            border-radius: 999px;
            border: 1px solid var(--border-color, #23262F);
            background: transparent;
            color: var(--text-color, #1a1a1a);
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }

        .filter-label {
            white-space: nowrap;
        }

        .filter-arrow {
            font-size: 10px;
            color: inherit; // 继承按钮文字颜色，适配明暗主题
        }
    }

    .record-list {
        max-height: calc(100vh - 200px);
        overflow-y: auto;
        
        .record-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;

            .record-left {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .record-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-color, #1a1a1a);
                    transition: color 0.3s ease;
                }

                .record-time {
                    font-size: 12px;
                    color: var(--text-dark-gray, #999999);
                    transition: color 0.3s ease;
                }
            }

            .record-amount {
                font-size: 14px;
                font-weight: 500;
                color: #3DD077;
            }
        }
        
        .loading-more,
        .no-more {
            text-align: center;
            padding: 20px 0;
            font-size: 14px;
            color: var(--text-dark-gray, #999999);
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            font-size: 14px;
            color: var(--text-dark-gray, #999999);
        }
    }
}

// 下拉框淡入淡出动画
.fade-dropdown-enter-active,
.fade-dropdown-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-dropdown-enter-from,
.fade-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 140px;
    padding: 6px 0;
    border-radius: 10px;
    background-color: var(--bg-page-h5, #FFFFFF);
    border: 1px solid var(--border-color, #23262F);
    box-shadow: 0 8px 20px rgba(15, 15, 15, 0.18);
    z-index: 20;
}

.dropdown-item {
    padding: 8px 14px;
    font-size: 13px;
    color: var(--text-color, #1a1a1a);
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;

    &.active {
        font-weight: 600;
    }

    &:hover {
        background-color: rgba(0, 0, 0, 0.04);
    }
}

</style>


