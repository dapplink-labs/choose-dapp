<template>
    <div class="dashboard-page">
        <!-- 头部导航 -->
        <div class="header">
            <div class="header-bg"></div>
            <div class="header-content">
                <div class="goback" @click="goBack">
                    <el-icon class="goback-icon">
                        <ArrowLeft />
                    </el-icon>
                </div>
                <h1 class="page-title">{{ $t('dashboard.title') }}</h1>
            </div>
        </div>

        <!-- Tab导航栏 -->
        <div class="tab-nav-container">
            <div class="tab-nav" ref="tabNavRef">
                <div v-for="(tab, index) in tabs" :key="index" :class="['tab-item', { active: activeTab === index }]"
                    @click="handleTabClick(index)">
                    {{ tab }}
                </div>
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-area">
            <!-- CMT现价组件 -->
            <CMTCurrentPrice v-if="activeTab === 0" />
            <!-- CMT质押组件 -->
            <CMTPledge v-if="activeTab === 1" />
            <!-- 市场收益组件 -->
            <LPVault v-if="activeTab === 2" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from '@element-plus/icons-vue'
import CMTCurrentPrice from '@/components/CMTCurrentPrice.vue'
import CMTPledge from '@/components/CMTPledge.vue'
import LPVault from '@/components/LPVault.vue'

const { t } = useI18n()
const router = useRouter()
const tabNavRef = ref(null)
const activeTab = ref(0)

const tabs = computed(() => [
  t('dashboard.tabs.currentPrice'),
  t('dashboard.tabs.pledge'),
  t('dashboard.tabs.marketReturns')
])

// 返回上一页
const goBack = () => {
    router.back()
}

// 处理Tab点击
const handleTabClick = (index) => {
    activeTab.value = index
    // 滚动到选中的tab
    scrollToActiveTab(index)
}

// 滚动到选中的tab
const scrollToActiveTab = (index) => {
    if (!tabNavRef.value) return

    const tabItems = tabNavRef.value.querySelectorAll('.tab-item')
    const activeTabItem = tabItems[index]

    if (activeTabItem) {
        const container = tabNavRef.value
        const containerWidth = container.offsetWidth
        const tabLeft = activeTabItem.offsetLeft
        const tabWidth = activeTabItem.offsetWidth
        const scrollLeft = container.scrollLeft

        // 计算需要滚动的距离，使选中的tab居中或至少可见
        const targetScrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2)

        container.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        })
    }
}

onMounted(() => {
    // 初始化时滚动到第一个tab
    scrollToActiveTab(0)
})
</script>

<style scoped lang="scss">
.dashboard-page {
    min-height: 100vh;
    background-color: var(--bg-dashboard, #FFFFFF);
    color: var(--text-color, #1a1a1a);
    transition: background-color 0.3s ease, color 0.3s ease;
    padding-bottom: 60px; // 为底部导航栏留出空间
}

.header {
    position: relative;
    padding: 50px 12px 0;
    overflow: hidden;

    .header-bg {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 170px;
        background-image: url('@/assets/icon/DashboardBg.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        pointer-events: none;
        z-index: 1;
    }

    .header-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-bottom: 8px;
    }

    .goback {
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: transform 0.2s ease;
        width: fit-content;
        -webkit-tap-highlight-color: transparent;

        &:active {
            transform: translateX(-4px);
        }

        .goback-icon {
            color: var(--text-color, #000000);
            font-size: 20px;
            transition: color 0.3s ease;
        }
    }

    .page-title {
        font-family: Noto Sans SC, Noto Sans SC;
        font-weight: bold;
        font-size: 28px;
        color: #000000;
        color: var(--text-color, #000000);
        margin: 26px 0 53px;
        white-space: nowrap;
    }
}

.tab-nav-container {
    width: 100%;
    overflow: hidden;
    position: relative;
    z-index: 1;
    border-bottom: 1px solid var(--border-color, #E0E0E0);
    transition: border-color 0.3s ease;
}

.tab-nav {
    display: flex;
    gap: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none; // Firefox 隐藏滚动条
    -ms-overflow-style: none; // IE/Edge 隐藏滚动条
    -webkit-overflow-scrolling: touch; // iOS 平滑滚动
    padding: 0 8px;

    &::-webkit-scrollbar {
        display: none; // Chrome/Safari 隐藏滚动条
    }

    .tab-item {
        color: var(--text-gray, #909090);
        cursor: pointer;
        margin-right: 34px;
        padding-bottom: 24px;
        transition: all 0.3s ease;
        position: relative;
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        white-space: nowrap;

        &.active {
            color: var(--text-color, #000000);
            font-weight: 600;
            border-bottom: 2px solid var(--text-color, #000000);
        }
    }
}

.content-area {
    padding: 12px 8px;
    min-height: calc(100vh - 140px);
    position: relative;
    z-index: 1;
}

// 暗色主题适配
:deep(.theme-dark) {
    .dashboard-page {
        background-color: var(--bg-dashboard, #000000);
        color: var(--text-color, #f2f2f2);
    }

    .header {
        .page-title {
            color: var(--text-color, #f2f2f2);
        }

        .goback-icon {
            color: var(--text-color, #f2f2f2);
        }
    }

    .tab-nav-container {
        border-bottom-color: var(--border-color, #23262F);
    }

    .tab-item {
        color: var(--text-gray, #a0a0a0);

        &.active {
            color: var(--text-color, #f2f2f2);
            border-bottom-color: var(--text-color, #f2f2f2);
        }
    }
}

// 浅色主题适配
:deep(.theme-light) {
    .dashboard-page {
        background-color: var(--bg-dashboard, #FFFFFF);
        color: var(--text-color, #1a1a1a);
    }

    .header {
        .page-title {
            color: var(--text-color, #1a1a1a);
        }

        .goback-icon {
            color: var(--text-color, #1a1a1a);
        }
    }

    .tab-nav-container {
        border-bottom-color: var(--border-color, #E0E0E0);
    }

    .tab-item {
        color: var(--text-gray, #666);

        &.active {
            color: var(--text-color, #1a1a1a);
            border-bottom-color: var(--text-color, #1a1a1a);
        }
    }
}
</style>
