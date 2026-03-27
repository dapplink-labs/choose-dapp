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
                    <el-icon v-if="showClear" class="close-icon" @click="clearSearch">
                        <Close />
                    </el-icon>
                </div>
            </div>

            <!-- 浏览部分 -->
            <div v-if="!searchQuery.trim()" class="browse-section">
                <h3 class="section-title">{{ $t('searchPage.browse') }}</h3>
                <div class="browse-buttons">
                    <button v-for="item in browseItems" :key="item.key" class="browse-btn"
                        @click="handleBrowseClick(item)">
                        <el-icon class="browse-icon">

                            <!-- 渲染内联 SVG 图标 -->
                            <svg v-if="item.icon === 'trends'" xmlns="http://www.w3.org/2000/svg" width="14"
                                height="8.166" viewBox="0 0 14 8.166" class="custom-svg">
                                <path fill="currentColor"
                                    d="M10.846,213.333a.583.583,0,1,0,0,1.167h2.091l-4.145,4.145-2.415-2.416-.089-.087a.583.583,0,0,0-.825,0l-.239.239L1.1,220.5a.583.583,0,1,0,.825.825l3.951-3.951,2.151,2.15.353.354a.583.583,0,0,0,.825,0l.191-.191,4.366-4.366v2.091a.583.583,0,1,0,1.167,0V213.9l0-.03,0,.05a.586.586,0,0,0-.225-.46l.054.048a.588.588,0,0,0-.242-.146l-.012,0-.055-.012-.013,0-.022,0-.049,0H10.846Z"
                                    transform="translate(-0.93 -213.333)" />
                            </svg>
                            <svg v-else-if="item.icon === 'popular'" xmlns="http://www.w3.org/2000/svg" width="11.429"
                                height="14" viewBox="0 0 11.429 14" class="custom-svg">
                                <path fill="currentColor"
                                    d="M5.714,14a5.781,5.781,0,0,1-4-1.528A5.634,5.634,0,0,1,0,8.249a15.1,15.1,0,0,1,.831-4.07.638.638,0,0,1,.616-.466.66.66,0,0,1,.609.416l.006.015.008.021c.181.487.326.893.431,1.209A2.508,2.508,0,0,0,3.571,6.81l0-.005a5.138,5.138,0,0,1-.194-1.725,4.972,4.972,0,0,1,.169-1.048A6.836,6.836,0,0,1,6.2.1a.552.552,0,0,1,.31-.1.711.711,0,0,1,.646.683,5.337,5.337,0,0,0,1.41,3.253c.1.1.229.216.377.349l.006.005a6.081,6.081,0,0,1,2.474,4.678A4.7,4.7,0,0,1,9.71,12.562,6.214,6.214,0,0,1,5.714,14ZM1.6,6.808a7.525,7.525,0,0,0-.174,1.441,4.244,4.244,0,0,0,1.266,3.174,4.346,4.346,0,0,0,3.02,1.139,4.652,4.652,0,0,0,3.07-1.095A3.363,3.363,0,0,0,10,8.968,4.541,4.541,0,0,0,8.08,5.442c-.175-.16-.355-.326-.519-.49A6.231,6.231,0,0,1,6,2.224,6.288,6.288,0,0,0,4.94,4.349a3.711,3.711,0,0,0-.12,1.445,3.231,3.231,0,0,0,.1.548l0,.008v0a1.44,1.44,0,0,1-.412,1.538A1.421,1.421,0,0,1,2.933,8.1l.63-1.268C2.948,8.067,2.932,8.1,2.931,8.1a2.379,2.379,0,0,1-.291-.176,3.6,3.6,0,0,1-.481-.407A4.075,4.075,0,0,1,1.6,6.808Z" />
                            </svg>
                            <svg v-else-if="item.icon === 'liquidity'" xmlns="http://www.w3.org/2000/svg" width="14"
                                height="12.444" viewBox="0 0 14 12.444" class="custom-svg">
                                <path fill="currentColor"
                                    d="M5.186,1.383A.561.561,0,0,0,4.64,1.8l-.9,3.539A2.1,2.1,0,0,1,1.707,6.914H.7a.691.691,0,1,1,0-1.383H1.707a.7.7,0,0,0,.679-.524l.9-3.539a1.967,1.967,0,0,1,3.851.23l1.124,8.877a.564.564,0,0,0,1.1.066l.9-3.539a2.1,2.1,0,0,1,2.037-1.571H13.3a.691.691,0,1,1,0,1.383H12.293a.7.7,0,0,0-.679.524l-.9,3.539a1.967,1.967,0,0,1-3.851-.23L5.744,1.869A.56.56,0,0,0,5.186,1.383Z" />
                            </svg>
                            <svg v-else-if="item.icon === 'endingSoon'" xmlns="http://www.w3.org/2000/svg" width="13.5"
                                height="14" viewBox="0 0 13.5 14" class="custom-svg">
                                <g transform="translate(-10.135 -9.141)">
                                    <path fill="currentColor"
                                        d="M1.385,7A5.569,5.569,0,0,1,6.923,1.4,5.41,5.41,0,0,1,11.2,3.5l-1.163,0a.7.7,0,0,0,0,1.4L12.42,4.9a.682.682,0,0,0,.08,0h.306a.689.689,0,0,0,.491-.2.7.7,0,0,0,.2-.5V1.4a.692.692,0,1,0-1.385,0V2.415A6.775,6.775,0,0,0,6.923,0,6.962,6.962,0,0,0,0,7a6.962,6.962,0,0,0,6.923,7,6.85,6.85,0,0,0,6.158-3.889.7.7,0,0,0-.312-.938.689.689,0,0,0-.928.315A5.467,5.467,0,0,1,6.923,12.6,5.569,5.569,0,0,1,1.385,7Z"
                                        transform="translate(10.135 9.141)" />
                                    <path fill="currentColor"
                                        d="M.692,0a.7.7,0,0,1,.692.7V3.21L2.566,4.405a.706.706,0,0,1,0,.99.687.687,0,0,1-.979,0L.406,4.2A1.408,1.408,0,0,1,0,3.21V.7A.7.7,0,0,1,.692,0Z"
                                        transform="translate(16.366 12.641)" />
                                </g>
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"
                                class="custom-svg">
                                <g transform="translate(-128 -128)" fill="currentColor">
                                    <path d="M262.439,640h-5.853a.585.585,0,0,0,0,1.171h5.853a.585.585,0,0,0,0-1.171Z"
                                        transform="translate(-125.675 -502.67)" />
                                    <path
                                        d="M259.045,341.33a.593.593,0,0,0-.585.585v1.319l-1.733-1.733a.492.492,0,0,0-.219-.125.569.569,0,0,0-.453,0,.577.577,0,0,0-.312.312.562.562,0,0,0-.016.226v2.732a.585.585,0,1,0,1.171,0v-1.319l1.733,1.733a.57.57,0,0,0,.414.172.593.593,0,0,0,.585-.585v-2.732A.593.593,0,0,0,259.045,341.33Z"
                                        transform="translate(-125.398 -209.446)" />
                                    <path
                                        d="M513.756,341.333h-1.171a.585.585,0,1,0,0,1.171h1.171a.585.585,0,1,0,0-1.171Zm0,2.732h-1.171a.585.585,0,0,0,0,1.171h1.171a.585.585,0,0,0,0-1.171Z"
                                        transform="translate(-377.005 -209.45)" />
                                    <path
                                        d="M141.222,131.111h-1.556v-2.333a.778.778,0,0,0-.778-.778H128.778a.778.778,0,0,0-.778.778v12.444a.778.778,0,0,0,.778.778h12.444a.778.778,0,0,0,.778-.778v-9.333A.778.778,0,0,0,141.222,131.111Zm-2.722,9.722h-9.333V129.167H138.5Zm2.333,0h-1.167v-8.556h1.167Z" />
                                </g>
                            </svg>
                        </el-icon>
                        <span class="browse-text">{{ item.label }}</span>
                    </button>
                </div>
            </div>

            <!-- 主题部分 -->
            <div v-if="!searchQuery.trim()" class="themes-section">
                <h3 class="section-title">{{ $t('searchPage.themes') }}</h3>
                <div class="themes-grid">
                    <button v-for="theme in themeItems" :key="theme.key" class="theme-btn"
                        @click="handleThemeClick(theme)">
                        <div class="theme-thumbnail">
                            <img :src="theme.thumbnail" :alt="theme.label" />
                        </div>
                        <span class="theme-text">{{ theme.label }}</span>
                    </button>
                </div>
            </div>

            <!-- 搜索结果列表 -->
            <div v-if="searchQuery.trim()" class="search-results">
                <div v-if="loading" class="list-loading">{{ $t('common.loading') }}</div>
                <div v-else-if="!results.length" class="list-empty">{{ $t('common.noData') }}</div>
                <div v-else class="results-list">
                    <div v-for="(item, index) in results" :key="index" class="result-item"
                        @click="navigateToDetail(item)">
                        <div class="result-left">
                            <img :src="item.avatar" class="result-avatar"
                                @error="(e) => (e.target.src = fallbackListImg)" />
                            <div class="result-title">{{ item.title }}</div>
                        </div>
                        <div class="result-right">
                            <span class="result-percentage">{{ item.percentage }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Avatar } from '@element-plus/icons-vue'
import si1 from '@/assets/images/searchIcon01.png'
import si2 from '@/assets/images/searchIcon02.png'
import si3 from '@/assets/images/searchIcon03.png'
import si4 from '@/assets/images/searchIcon04.png'
import { getEventList } from '@/api/APIEvent'
import fallbackListImg from '@/assets/images/searchIcon01.png'
import { useAccount } from '@wagmi/vue'

const router = useRouter()
const { t, locale } = useI18n()
const { address } = useAccount()

// 搜索关键词
const searchQuery = ref('')
const loading = ref(false)
const results = ref([])

// 搜索框右侧图标（清除或搜索）
const showClear = computed(() => searchQuery.value.length > 0)
const clearSearch = () => {
    searchQuery.value = ''
    results.value = []
}

// 浏览部分数据
const browseItems = computed(() => [
    { key: 'trends', label: t('searchPage.trending'), icon: 'trends' },
    { key: 'popular', label: t('searchPage.popular'), icon: 'popular' },
    { key: 'liquidity', label: t('searchPage.liquidity'), icon: 'liquidity' },
    { key: 'endingSoon', label: t('searchPage.endingSoon'), icon: 'endingSoon' }
])

// 主题部分数据
const themeItems = computed(() => [
    { key: 'crypto', label: t('searchPage.crypto'), thumbnail: si1, guid: 'crypto_guid' },
    { key: 'sports', label: t('searchPage.sports'), thumbnail: si2, guid: 'sports_guid' },
    { key: 'politics', label: t('searchPage.politics'), thumbnail: si3, guid: 'politics_guid' },
    { key: 'science', label: t('searchPage.science'), thumbnail: si4, guid: 'science_guid' }
])


// 处理搜索
const handleSearch = async () => {
    const query = searchQuery.value.trim()
    if (!query) {
        results.value = []
        return
    }

    loading.value = true
    try {
        const lang = locale.value === 'zh-cn' ? 'zh' :
            locale.value === 'ko-kr' ? 'ko' :
                locale.value === 'ja-jp' ? 'ja' : 'en'

        const params = {
            language_label: lang,
            user_address: address.value || '',
            search_key: query,
            page: 1,
            page_size: 50,
            include_sub_events: true
        }

        const res = await getEventList(params)
        const list = res?.data?.data?.events || res?.data?.events || []

        results.value = list.map(e => {
            const subEvents = Array.isArray(e.sub_events) ? e.sub_events : []
            const firstSub = subEvents[0] || {}
            const percentage = firstSub.price ? Math.round(Number(firstSub.price) * 100) + '%' : '0%'

            return {
                guid: e.event_guid,
                title: e.event_title || e.title,
                avatar: e.logo || fallbackListImg,
                percentage: percentage
            }
        })
    } catch (error) {
        console.error('Search failed:', error)
    } finally {
        loading.value = false
    }
}

// 处理搜索输入
let searchTimer = null
const handleSearchInput = () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        handleSearch()
    }, 500)
}

const handleBrowseClick = async (item) => {
    loading.value = true
    try {
        const lang = locale.value === 'zh-cn' ? 'zh' :
            locale.value === 'ko-kr' ? 'ko' :
                locale.value === 'ja-jp' ? 'ja' : 'en'

        const params = {
            language_label: lang,
            user_address: address.value || '',
            page: 1,
            page_size: 50,
            include_sub_events: true
        }

        // 根据不同的 key 设置排序
        if (item.key === 'trends') {
            params.sort_type = 2 // 假设 2 是 trends/成交量
        } else if (item.key === 'popular') {
            params.sort_type = 1 // 假设 1 是 popular/热门
        } else if (item.key === 'liquidity') {
            params.sort_type = 3 // 假设 3 是流动性
        } else if (item.key === 'endingSoon') {
            params.sort_type = 4 // 假设 4 是即将结束
        }

        const res = await getEventList(params)
        const list = res?.data?.data?.events || res?.data?.events || []

        searchQuery.value = item.label // 显示当前浏览的项目名
        results.value = list.map(e => {
            const subEvents = Array.isArray(e.sub_events) ? e.sub_events : []
            const firstSub = subEvents[0] || {}
            const percentage = firstSub.price ? Math.round(Number(firstSub.price) * 100) + '%' : '0%'

            return {
                guid: e.event_guid,
                title: e.event_title || e.title,
                avatar: e.logo || fallbackListImg,
                percentage: percentage
            }
        })
    } catch (error) {
        console.error('Browse fetch failed:', error)
    } finally {
        loading.value = false
    }
}

const handleThemeClick = async (theme) => {
    loading.value = true
    try {
        const lang = locale.value === 'zh-cn' ? 'zh' :
            locale.value === 'ko-kr' ? 'ko' :
                locale.value === 'ja-jp' ? 'ja' : 'en'

        const params = {
            language_label: lang,
            user_address: address.value || '',
            page: 1,
            page_size: 50,
            include_sub_events: true
        }

        // 根据主题 key 映射 category_guid (这里需要根据实际情况配置)
        // params.category_guid = theme.guid 

        const res = await getEventList(params)
        const list = res?.data?.data?.events || res?.data?.events || []

        searchQuery.value = theme.label
        results.value = list.map(e => {
            const subEvents = Array.isArray(e.sub_events) ? e.sub_events : []
            const firstSub = subEvents[0] || {}
            const percentage = firstSub.price ? Math.round(Number(firstSub.price) * 100) + '%' : '0%'

            return {
                guid: e.event_guid,
                title: e.event_title || e.title,
                avatar: e.logo || fallbackListImg,
                percentage: percentage
            }
        })
    } catch (error) {
        console.error('Theme fetch failed:', error)
    } finally {
        loading.value = false
    }
}

const navigateToDetail = (item) => {
    router.push({
        path: '/prediction-detail-h5',
        query: { guid: item.guid }
    })
}
</script>

<style scoped lang="scss">
/* ... existing code ... */
.search-page {
    padding: 20px 0;
    box-sizing: border-box;
    width: 100%;
    /* ... existing code ... */
}

// 搜索结果
.search-results {
    padding: 0 10px;
}

.result-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
    cursor: pointer;

    &:active {
        opacity: 0.7;
    }

    .result-left {
        display: flex;
        align-items: center;
        flex: 1;
        margin-right: 16px;

        .result-avatar {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            object-fit: cover;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .result-title {
            font-size: 15px;
            font-weight: 500;
            line-height: 1.4;
            color: var(--bg-opposite);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    }

    .result-right {
        .result-percentage {
            font-size: 18px;
            font-weight: 700;
            color: var(--bg-opposite);
        }
    }
}

.list-loading,
.list-empty {
    text-align: center;
    padding: 40px 0;
    color: var(--text-dark-gray);
    font-size: 14px;
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
        margin-right: 10px;
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
