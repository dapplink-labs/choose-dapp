<template>
    <div class="sports-events-h5-page">
        <!-- 顶部导航栏 (保持现状) -->
        <NavBar2 />

        <!-- 1. 体育子分类：使用您提供的原生 SVG -->
        <div class="sports-categories">
            <div v-for="category in sportsCategories" :key="category.key" class="category-item"
                :class="{ active: activeCategory === category.key }" @click="handleCategoryClick(category.key)">
                <div class="category-icon-wrapper">
                    <div class="category-icon" :class="category.key">
                        <!-- 足球图标逻辑 (世界杯/足球) -->
                        <svg v-if="category.key === 'worldcup' || category.key === 'football'"
                            xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 20 20.001">
                            <path
                                d="M95.579,57.689l1.067-.667c-.4,0-.667-.133-1.067-.133H94.512Zm-7.863,6,2.8,1.067,4.531-3.067.133-3.067-2-1.467a10.317,10.317,0,0,0-6.262,4.267l.8,2.267Zm7.73-1.2-4.264,2.933,1.465,5.067,5.2.133,1.732-4.933-4.131-3.2Zm.533-3.867v3.067l4.261,3.2,2.932-.933.8-2.133a10.52,10.52,0,0,0-6-4.667l-2,1.467Zm-9.33,5.2-.4-1.2a7.71,7.71,0,0,0-.667,1.867Zm17.855.8-.133-.933-.267.667Zm-2.8,9.867h-1.333l-.4,1.2A5.074,5.074,0,0,0,101.707,74.489Zm1.732-9.467-2.8.8-1.865,5.2,1.733,2.533h2.264a9.436,9.436,0,0,0,2.532-6.4v-.667l-1.867-1.467ZM89.848,73.156l1.867-2.267-1.6-5.2-2.931-1.067-1.867,1.333v.8a10.387,10.387,0,0,0,2.133,6.534Zm-1.465.933a6.268,6.268,0,0,0,1.6,1.2l-.4-1.2Zm11.194-.133-1.6-2.267-5.6-.133-1.865,2.4.8,2.133a8.94,8.94,0,0,0,3.731.8,8.828,8.828,0,0,0,3.731-.667Z"
                                transform="translate(-85.305 -56.889)" fill="currentColor" />
                        </svg>
                        <!-- 篮球图标逻辑 (NBA/篮球) -->
                        <svg v-else-if="category.key === 'nba' || category.key === 'basketball'"
                            xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 20 19.999">
                            <path
                                d="M180.016,170.921a7.381,7.381,0,0,1-1.391,6.813l2.216,2.216,6.582-6.582A9.957,9.957,0,0,0,180.016,170.921ZM190.81,181.67a9.975,9.975,0,0,0-2.45-7.368l-6.583,6.583,2.155,2.155A7.383,7.383,0,0,1,190.81,181.67ZM184.891,184l3.47,3.469A9.934,9.934,0,0,0,190.614,183,6.075,6.075,0,0,0,184.891,184Zm-1.936,6.66a9.9,9.9,0,0,0,4.471-2.254l-3.47-3.47a6.071,6.071,0,0,0-1,5.724Zm-6.226-12.95-3.407-3.407a9.932,9.932,0,0,0-2.246,4.434A6.07,6.07,0,0,0,176.729,177.709ZM183,183.977l-2.155-2.156-6.584,6.584a9.958,9.958,0,0,0,7.369,2.448A7.369,7.369,0,0,1,183,183.977Zm-12.122-3.918a9.966,9.966,0,0,0,2.447,7.41l6.584-6.583-2.218-2.217A7.376,7.376,0,0,1,170.875,180.059Zm7.817-8.938a9.956,9.956,0,0,0-4.434,2.245l3.408,3.408A6.066,6.066,0,0,0,178.692,171.122Z"
                                transform="translate(-170.841 -170.886)" fill="currentColor" />
                        </svg>
                    </div>
                    <div v-if="category.badge > 0" class="category-badge">{{ category.badge }}</div>
                </div>
                <div class="category-label">{{ category.label }}</div>
            </div>
        </div>

        <div class="main-body">
            <!-- 2. NBA 标题与日期选择 -->
            <div class="nba-title-row">
                <div class="title-left">
                    <div class="icon-circle blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 19.999">
                            <path
                                d="M180.016,170.921a7.381,7.381,0,0,1-1.391,6.813l2.216,2.216,6.582-6.582A9.957,9.957,0,0,0,180.016,170.921ZM190.81,181.67a9.975,9.975,0,0,0-2.45-7.368l-6.583,6.583,2.155,2.155A7.383,7.383,0,0,1,190.81,181.67ZM184.891,184l3.47,3.469A9.934,9.934,0,0,0,190.614,183,6.075,6.075,0,0,0,184.891,184Zm-1.936,6.66a9.9,9.9,0,0,0,4.471-2.254l-3.47-3.47a6.071,6.071,0,0,0-1,5.724Zm-6.226-12.95-3.407-3.407a9.932,9.932,0,0,0-2.246,4.434A6.07,6.07,0,0,0,176.729,177.709ZM183,183.977l-2.155-2.156-6.584,6.584a9.958,9.958,0,0,0,7.369,2.448A7.369,7.369,0,0,1,183,183.977Zm-12.122-3.918a9.966,9.966,0,0,0,2.447,7.41l6.584-6.583-2.218-2.217A7.376,7.376,0,0,1,170.875,180.059Zm7.817-8.938a9.956,9.956,0,0,0-4.434,2.245l3.408,3.408A6.066,6.066,0,0,0,178.692,171.122Z"
                                transform="translate(-170.841 -170.886)" fill="currentColor" />
                        </svg>
                    </div>
                    <span>NBA</span>
                </div>
                <div class="day-pill">
                    比赛日 {{ selectedMatchday }} <el-icon class="ml-1">
                        <ArrowDown />
                    </el-icon>
                </div>
            </div>

            <!-- 3. 类型切换 Tab -->
            <div class="type-tabs">
                <button class="tab-btn active">比赛</button>
                <button class="tab-btn">属性</button>
            </div>

            <!-- 4. 赛事列表 -->
            <div class="event-list">
                <div v-for="(event, idx) in eventsList" :key="idx" class="event-wrapper">
                    <div v-if="event.date" class="date-label">{{ event.date }}</div>

                    <div class="event-card" @click="handleEventClick(event)">
                        <div class="card-meta">
                            <div class="meta-left">
                                <span class="time-tag">{{ event.time }}</span>
                                <span class="vol-text">{{ event.volume }} 交易量</span>
                            </div>
                            <div class="view-btn">游戏视角 <span class="arrow">›</span></div>
                        </div>

                        <div class="teams-box">
                            <div class="team-line">
                                <img :src="event.team1.logo" class="logo-img" />
                                <span class="name">{{ event.team1.name }}</span>
                                <span class="record">{{ event.team1.record }}</span>
                            </div>
                            <div class="team-line">
                                <img :src="event.team2.logo" class="logo-img" />
                                <span class="name">{{ event.team2.name }}</span>
                                <span class="record">{{ event.team2.record }}</span>
                            </div>
                        </div>

                        <div class="bet-row">
                            <button class="odds-btn knicks">{{ event.team1.shortName }} {{ event.team1.odds }}¢</button>
                            <button class="odds-btn lakers">{{ event.team2.shortName }} {{ event.team2.odds }}¢</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import tyIcon01 from '@/assets/icon/tyIcon01.png'
import tyIcon02 from '@/assets/icon/tyIcon02.png'
import NavBar2 from '@/components/navBar2.vue'

const router = useRouter()
const activeCategory = ref('nba')
const selectedMatchday = ref(9)

const handleEventClick = (event) => {
    router.push('/sports-detail-h5')
}

const sportsCategories = ref([
    { key: 'worldcup', label: '世界杯', badge: 14 },
    { key: 'nba', label: 'NBA', badge: 32 },
    { key: 'football', label: '足球', badge: 0 },
    { key: 'basketball', label: '篮球', badge: 0 }
])

const eventsList = ref([
    {
        date: '周一,1月5日', time: '4:00 AM', volume: '$37,755,917',
        team1: { name: '尼克斯队', shortName: '尼克斯', record: '5-6-8', logo: tyIcon01, odds: '32' },
        team2: { name: '湖人队', shortName: '湖人', record: '8-6-5', logo: tyIcon02, odds: '69' }
    },
    {
        date: '', time: '4:00 AM', volume: '$37,755,917',
        team1: { name: '尼克斯队', shortName: 'DET', record: '5-6-8', logo: tyIcon01, odds: '32' },
        team2: { name: '湖人队', shortName: 'Cle', record: '8-6-5', logo: tyIcon02, odds: '69' }
    },
    {
        date: '周一,1月5日', time: '4:00 AM', volume: '$37,755,917',
        team1: { name: '尼克斯队', shortName: '尼克斯', record: '5-6-8', logo: tyIcon01, odds: '32' },
        team2: { name: '湖人队', shortName: '湖人', record: '8-6-5', logo: tyIcon02, odds: '69' }
    },
    {
        date: '', time: '4:00 AM', volume: '$37,755,917',
        team1: { name: '尼克斯队', shortName: 'DET', record: '5-6-8', logo: tyIcon01, odds: '32' },
        team2: { name: '湖人队', shortName: 'Cle', record: '8-6-5', logo: tyIcon02, odds: '69' }
    },
    {
        date: '周一,1月5日', time: '4:00 AM', volume: '$37,755,917',
        team1: { name: '尼克斯队', shortName: '尼克斯', record: '5-6-8', logo: tyIcon01, odds: '32' },
        team2: { name: '湖人队', shortName: '湖人', record: '8-6-5', logo: tyIcon02, odds: '69' }
    },
    {
        date: '', time: '4:00 AM', volume: '$37,755,917',
        team1: { name: '尼克斯队', shortName: 'DET', record: '5-6-8', logo: tyIcon01, odds: '32' },
        team2: { name: '湖人队', shortName: 'Cle', record: '8-6-5', logo: tyIcon02, odds: '69' }
    }
])
</script>

<style scoped lang="scss">
// 全局防止横向滚动
:deep(body),
:deep(html) {
    overflow-x: hidden !important;
    max-width: 100vw !important;
}

.sports-events-h5-page {
    background-color: #000;
    min-height: 100vh;
    padding-top: 50px;
    color: #fff;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
    position: relative;

    // 确保 NavBar2 不会导致横向滚动
    :deep(.navbar2) {
        max-width: 100vw;
        overflow-x: hidden;

        .navbar-container {
            max-width: 100vw;
        }

        .nav-section {
            max-width: 100%;
        }
    }
}

/* 分类滚动区 */
.sports-categories {
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    padding: 16px 10px;
    gap: 28px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    position: relative;

    &::-webkit-scrollbar {
        display: none;
    }

    .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
        min-width: auto;

        .category-icon-wrapper {
            position: relative;
        }

        .category-icon {
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #555; // 默认图标颜色
            transition: all 0.3s;

            &.worldcup {
                color: #f68b24;
            }

            &.nba {
                color: #1e88e5;
            }
        }

        .category-badge {
            position: absolute;
            top: -10px;
            right: -15px;
            background: #ca4064;
            font-size: 11px;
            padding: 0 5px;
            border-radius: 20px;
            border: 2px solid #000;
            min-width: 14px;
        }

        .category-label {
            font-size: 12px;
            color: #888;
            margin-top: 8px;
        }

        &.active {
            .category-icon {
                background: #2a2a2a;
                transform: scale(1.05);
            }

            .category-label {
                color: #fff;
                font-weight: bold;
            }
        }
    }
}

/* NBA 标题行 */
.nba-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    width: 100%;
    box-sizing: border-box;

    .title-left {
        display: flex;
        align-items: baseline;
        gap: 10px;

        .icon-circle.blue {
            color: #1e88e5;
        }

        span {
            font-family: Noto Sans SC, Noto Sans SC;
            font-weight: 900;
            font-size: 24px;
            color: var(--bg-opposite);
        }
    }

    .day-pill {
        background: #222;
        padding: 6px 14px;
        border-radius: 20px;
        color: #999;
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;
    }
}

/* Tab 切换 */
.type-tabs {
    padding: 15px 0;
    display: flex;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;

    .tab-btn {
        padding: 8px 28px;
        border-radius: 8px;
        border: none;
        background: #1c1c1c;
        color: #888;
        font-weight: bold;

        &.active {
            background: #fff;
            color: #000;
        }
    }
}

.main-body {
    width: 100%;
    max-width: 100vw;
    padding: 0 10px;
    box-sizing: border-box;
    overflow-x: hidden;
    position: relative;
}

/* 列表卡片 */
.event-list {
    padding-bottom: 40px;
    width: 100%;
    box-sizing: border-box;

    .date-label {
        font-size: 19px;
        font-weight: bold;
        padding: 15px 0 10px;
    }

    .event-card {
        border-bottom: 1px solid #1a1a1a;
        padding: 10px 0 25px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: opacity 0.2s;

        &:active {
            opacity: 0.7;
        }

        .card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            width: 100%;
            box-sizing: border-box;

            .time-tag {
                background: #1c1c1c;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: bold;
                margin-right: 10px;
            }

            .vol-text {
                color: #666;
                font-size: 14px;
            }

            .view-btn {
                background: #141414;
                padding: 4px 10px;
                border-radius: 6px;
                color: #888;
                font-size: 13px;
            }
        }

        .teams-box {
            margin-bottom: 22px;

            .team-line {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                width: 100%;
                box-sizing: border-box;
                overflow: hidden;

                .logo-img {
                    width: 26px;
                    height: 26px;
                    border-radius: 4px;
                    margin-right: 12px;
                }

                .name {
                    font-size: 17px;
                    font-weight: bold;
                    margin-right: 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex-shrink: 0;
                }

                .record {
                    color: #444;
                    font-size: 14px;
                }
            }
        }

        .bet-row {
            display: flex;
            gap: 12px;
            width: 100%;
            box-sizing: border-box;

            .odds-btn {
                flex: 1;
                height: 54px;
                border-radius: 12px;
                border: none;
                color: #fff;
                font-size: 18px;
                font-weight: bold;
                transition: transform 0.1s;
                position: relative;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;

                // 3D立体效果 - 底部实色边缘条带（在按钮内部）
                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 8px;
                    border-radius: 0 0 12px 12px;
                }

                &:active {
                    transform: translateY(2px);
                    
                    &::after {
                        height: 6px;
                    }
                }

                &.knicks {
                    background: #f68b24;
                    
                    &::after {
                        background: #c96f1a; // 较暗的棕橙色边缘
                    }
                }

                &.lakers {
                    background: #eab308;
                    
                    &::after {
                        background: #c99a06; // 较暗的棕金色边缘
                    }
                }
            }
        }
    }
}

.ml-1 {
    margin-left: 4px;
}
</style>