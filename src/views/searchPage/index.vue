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
                    <button v-for="item in browseItems" :key="item.key" class="browse-btn">
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
                    <button v-for="theme in themeItems" :key="theme.key" class="theme-btn">
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
    background-color: transparent;
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
    width: 100%;
}

.browse-btn {
    display: inline-flex;
    align-items: center;
    padding: 6px 13px;
    background-color: transparent;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    border-radius: 99px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-right: 10px;
    margin-bottom: 15px;

    .browse-icon {
        font-size: 14px;
        color: var(--bg-opposite);
        transition: color 0.3s ease;
    }

    .browse-text {
        font-family: PingFang SC, PingFang SC;
        font-weight: 500;
        font-size: 14px;
        color: var(--bg-opposite);
        margin-left: 3px;
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
    display: inline-flex;
    align-items: center;
    padding: 12px;
    background-color: transparent;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;

    .theme-thumbnail {
        width: 30px;
        height: 30px;
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
        font-weight: 500;
        font-size: 14px;
        color: var(--bg-opposite);
        flex: 1;
    }
}

</style>
