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

        <div class="record-list">
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
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { ArrowDownBold } from '@element-plus/icons-vue'

const { t } = useI18n()

// 当前筛选：服务类型 & 月份
const currentServiceType = ref('computingPower') // 默认：算力服务
const currentMonth = ref('2025-09')

// 服务类型下拉框状态
const showServiceDropdown = ref(false)
const serviceFilterRef = ref(null)

const currentServiceLabel = computed(() => {
    if (currentServiceType.value === 'computingPower') {
        return t('claimRecord.computingPowerService')
    }
    return t('claimRecord.lpVault')
})

const currentMonthLabel = computed(() => currentMonth.value.replace('-', '–'))

// 打开 / 关闭服务类型下拉框
const toggleServiceDropdown = () => {
    showServiceDropdown.value = !showServiceDropdown.value
}

// 选择服务类型（算力服务 / 质押池）
const selectServiceType = (type) => {
    currentServiceType.value = type
    showServiceDropdown.value = false
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
    if (!serviceFilterRef.value) return
    if (!serviceFilterRef.value.contains(event.target)) {
        showServiceDropdown.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

// 模拟数据：按服务类型分别维护记录列表
const allRecords = ref({
    computingPower: [
        {
            title: t('computingPower.tabs.distributed'),
            time: '2026年1月6日 12:12',
            amount: 300
        },
        {
            title: t('computingPower.tabs.distributed'),
            time: '2026年1月6日 12:12',
            amount: 300
        },
        {
            title: t('computingPower.tabs.distributed'),
            time: '2026年1月6日 12:12',
            amount: 300
        },
        {
            title: t('computingPower.tabs.cluster'),
            time: '2026年1月6日 12:12',
            amount: 300
        },
        {
            title: t('computingPower.tabs.cluster'),
            time: '2026年1月6日 12:12',
            amount: 300
        }
    ],
    lpVault: [
        {
            title: 'T1-T2',
            time: '2026年1月6日 12:12',
            amount: 300
        },
        {
            title: 'T1-T2',
            time: '2026年1月6日 12:12',
            amount: 300
        },
        {
            title: 'T1-T2',
            time: '2026年1月6日 12:12',
            amount: 300
        },
        {
            title: 'T1-T2',
            time: '2026年1月6日 12:12',
            amount: 300
        },
        {
            title: 'T1-T2',
            time: '2026年1月6日 12:12',
            amount: 300
        }
    ]
})

// 当前列表（根据服务类型筛选）
const visibleRecords = computed(() => {
    return allRecords.value[currentServiceType.value] || []
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


