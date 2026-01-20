<template>
    <div class="search-page">
        <div class="search-content">
            <!-- 搜索栏 -->
            <div class="search-bar-container">
                <div class="search-bar">
                    <el-icon class="search-icon">
                        <Search />
                    </el-icon>
                    <input v-model="searchQuery" type="text" class="search-input"
                        :placeholder="$t('searchPage.searchPlaceholder')" @keyup.enter="handleSearch"
                        @input="handleSearchInput" />
                </div>
            </div>

            <!-- 浏览部分 -->
            <div class="browse-section">
                <h3 class="section-title">{{ $t('searchPage.browse') }}</h3>
                <div class="browse-buttons">
                    <button v-for="item in browseItems" :key="item.key" class="browse-btn"
                        :class="{ active: activeBrowse === item.key }" @click="handleBrowseClick(item.key)">
                        <el-icon class="browse-icon">
                            <component :is="item.icon" />
                        </el-icon>
                        <span class="browse-text">{{ item.label }}</span>
                    </button>
                </div>
            </div>

            <!-- 主题部分 -->
            <div class="themes-section">
                <h3 class="section-title">{{ $t('searchPage.themes') }}</h3>
                <div class="themes-grid">
                    <button v-for="theme in themeItems" :key="theme.key" class="theme-btn"
                        :class="{ active: activeTheme === theme.key }" @click="handleThemeClick(theme.key)">
                        <div class="theme-thumbnail">
                            <img :src="theme.thumbnail" :alt="theme.label" />
                        </div>
                        <span class="theme-text">{{ theme.label }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Document, TrendCharts, Promotion, Connection, RefreshRight } from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()

// 搜索关键词
const searchQuery = ref('')

// 浏览部分数据
const browseItems = computed(() => [
    {
        key: 'latest',
        label: t('searchPage.browseItems.latest'),
        icon: Document
    },
    {
        key: 'trends',
        label: t('searchPage.browseItems.trends'),
        icon: TrendCharts
    },
    {
        key: 'popular',
        label: t('searchPage.browseItems.popular'),
        icon: Promotion
    },
    {
        key: 'liquidity',
        label: t('searchPage.browseItems.liquidity'),
        icon: Connection
    },
    {
        key: 'endingSoon',
        label: t('searchPage.browseItems.endingSoon'),
        icon: RefreshRight
    }
])

// 主题部分数据
const themeItems = computed(() => [
    {
        key: 'crypto',
        label: t('searchPage.themeItems.crypto'),
        thumbnail: 'https://picsum.photos/seed/crypto/80/80'
    },
    {
        key: 'finance',
        label: t('searchPage.themeItems.finance'),
        thumbnail: 'https://picsum.photos/seed/finance/80/80'
    },
    {
        key: 'sports',
        label: t('searchPage.themeItems.sports'),
        thumbnail: 'https://picsum.photos/seed/sports/80/80'
    },
    {
        key: 'esports',
        label: t('searchPage.themeItems.esports'),
        thumbnail: 'https://picsum.photos/seed/esports/80/80'
    }
])

// 当前激活的浏览项
const activeBrowse = ref('')

// 当前激活的主题
const activeTheme = ref('')

// 处理搜索
const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        return
    }
    // TODO: 实现搜索逻辑
    console.log('搜索:', searchQuery.value)
}

// 处理搜索输入
const handleSearchInput = () => {
    // 可以在这里实现实时搜索建议
}

// 处理浏览项点击
const handleBrowseClick = (key) => {
    activeBrowse.value = key
    // TODO: 实现浏览筛选逻辑
    console.log('浏览:', key)
}

// 处理主题点击
const handleThemeClick = (key) => {
    activeTheme.value = key
    // TODO: 实现主题筛选逻辑
    console.log('主题:', key)
}
</script>

<style scoped lang="scss">
.search-page {
    min-height: calc(100vh - 57px);
    overflow: hidden;
    background-color: var(--bg-page-h5, #FCFCFC);
    color: var(--text-color, #1a1a1a);
    transition: background-color 0.3s ease, color 0.3s ease;
    box-sizing: border-box;
}

.search-content {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px 10px 0 10px;
}

// 搜索栏
.search-bar-container {
    margin-bottom: 32px;
    padding: 0 10px;
}

.search-bar {
    display: flex;
    align-items: center;
    background-color: var(--bg-card, #ffffff);
    border-radius: 12px;
    padding: 12px 16px;
    border: 1px solid var(--border-color, #E0E0E0);
    transition: all 0.3s ease;

    &:focus-within {
        border-color: var(--text-color-y, #2EBE69);
        box-shadow: 0 0 0 3px rgba(46, 190, 105, 0.1);
    }

    .search-icon {
        font-size: 20px;
        color: var(--text-dark-gray, #909090);
        margin-right: 12px;
        flex-shrink: 0;
    }

    .search-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: 16px;
        color: var(--text-color, #1a1a1a);
        font-family: PingFang SC, PingFang SC;

        &::placeholder {
            color: var(--text-dark-gray, #909090);
        }
    }
}

// 浏览部分
.browse-section {
    margin-bottom: 40px;
    padding: 0 10px;
}

.section-title {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 18px;
    color: var(--text-gray, #909090);
    margin: 0 0 16px 0;
    transition: color 0.3s ease;
}

.browse-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.browse-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 12px;
    background-color: var(--bg-card, #1e1e1e);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 80px;

    &:hover {
        background-color: var(--bg-light, #2a2a2a);
        border-color: var(--border-color, rgba(255, 255, 255, 0.2));
    }

    &:active {
        transform: scale(0.98);
    }

    &.active {
        background-color: var(--button-bg-y, rgba(46, 190, 105, 0.2));
        border-color: var(--text-color-y, #2EBE69);
    }

    .browse-icon {
        font-size: 24px;
        color: #FFFFFF;
        margin-bottom: 8px;
        transition: color 0.3s ease;
    }

    .browse-text {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #FFFFFF;
        transition: color 0.3s ease;
    }

    &.active {
        .browse-icon,
        .browse-text {
            color: var(--text-color-y, #2EBE69);
        }
    }
}

// 主题部分
.themes-section {
    padding: 0 10px;
}

.themes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.theme-btn {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: var(--bg-card, #1e1e1e);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;

    &:hover {
        background-color: var(--bg-light, #2a2a2a);
        border-color: var(--border-color, rgba(255, 255, 255, 0.2));
    }

    &:active {
        transform: scale(0.98);
    }

    &.active {
        background-color: var(--button-bg-y, rgba(46, 190, 105, 0.2));
        border-color: var(--text-color-y, #2EBE69);
    }

    .theme-thumbnail {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        overflow: hidden;
        margin-right: 12px;
        flex-shrink: 0;
        background-color: rgba(255, 255, 255, 0.05);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .theme-text {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 15px;
        color: #FFFFFF;
        transition: color 0.3s ease;
        flex: 1;
    }

    &.active {
        .theme-text {
            color: var(--text-color-y, #2EBE69);
            font-weight: 500;
        }
    }
}

// 亮色主题适配
.theme-light {
    .section-title {
        color: var(--text-gray, #666666);
    }

    .browse-btn {
        background-color: var(--bg-card, #ffffff);
        border-color: var(--border-color, #E0E0E0);

        .browse-icon,
        .browse-text {
            color: var(--text-color, #1a1a1a);
        }

        &:hover {
            background-color: var(--bg-light, #F5F5F5);
        }

        &.active {
            .browse-icon,
            .browse-text {
                color: var(--text-color-y, #2EBE69);
            }
        }
    }

    .theme-btn {
        background-color: var(--bg-card, #ffffff);
        border-color: var(--border-color, #E0E0E0);

        .theme-text {
            color: var(--text-color, #1a1a1a);
        }

        &:hover {
            background-color: var(--bg-light, #F5F5F5);
        }

        &.active {
            .theme-text {
                color: var(--text-color-y, #2EBE69);
            }
        }
    }
}

// 暗色主题适配
.theme-dark {
    .search-page {
        background-color: var(--bg-page-h5, #000000);
    }

    .search-bar {
        background-color: var(--bg-card, #1e1e1e);
        border-color: var(--border-color, #23262F);
    }

    .section-title {
        color: var(--text-gray, #909090);
    }
}

// 响应式设计
@media (min-width: 768px) {
    .search-content {
        max-width: 600px;
    }

    .browse-buttons {
        grid-template-columns: repeat(5, 1fr);
    }

    .themes-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
</style>
