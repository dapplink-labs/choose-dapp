<template>
    <div class="sports-detail-h5-page">
        <!-- 顶部导航 -->
        <BackHeaderNav :title="matchData.title" :showRecordBtn="false" :showOpenBtn="false" />

        <div class="content">
            <!-- 计分板卡片 -->
            <div class="match-card">
                <!-- SVG 描边背景：实现顶部特殊的折线缺口 -->
                <svg class="card-border" viewBox="0 0 350 160" preserveAspectRatio="none">
                    <path
                        d="M 10,0 H 100 L 115,20 H 235 L 250,0 H 340 A 10,10 0 0 1 350,10 V 150 A 10,10 0 0 1 340,160 H 10 A 10,10 0 0 1 0,150 V 10 A 10,10 0 0 1 10,0 Z"
                        fill="none" class="card-border-path" stroke-width="1" />
                </svg>

                <!-- 顶部日期标签 -->
                <div class="match-time-tag">
                    {{ matchData.date }} {{ matchData.time }}
                </div>

                <div class="card-content">
                    <!-- 尼克斯队 -->
                    <div class="team-block">
                        <img :src="matchData.team1.logo" class="team-logo" />
                        <div class="team-name">{{ matchData.team1.name }}</div>
                        <div class="team-record">{{ matchData.team1.record }}</div>
                    </div>

                    <!-- 中间统计 -->
                    <div class="stats-center">
                        <div class="prob-row">
                            <span class="val">{{ matchData.stats.team1Percent }}%</span>
                            <div class="blocks">
                                <div class="b y"></div>
                                <div class="b g"></div>
                                <div class="b m"></div>
                            </div>
                            <span class="val">{{ matchData.stats.team2Percent }}%</span>
                        </div>
                        <div class="volume-row">{{ matchData.volume }} {{ $t('sports.volume') }}</div>
                        <div class="chooseme-watermark">
                            <img :src="logoUrl" alt="ChooseMe" class="chooseme-watermark-img" />
                        </div>
                    </div>

                    <!-- 湖人队 -->
                    <div class="team-block">
                        <img :src="matchData.team2.logo" class="team-logo" />
                        <div class="team-name">{{ matchData.team2.name }}</div>
                        <div class="team-record">{{ matchData.team2.record }}</div>
                    </div>
                </div>
            </div>

            <!-- 下方投注区域 (胜负盘) -->
            <div class="betting-area">
                <h2 class="area-title">{{ $t('sports.moneyline') }}</h2>
                <div class="volume-sub">{{ matchData.volume }} {{ $t('sports.volume') }}</div>

                <div class="bet-grid">
                    <button class="bet-btn-3d yellow" @click="handleBet('1')">
                        {{ matchData.team1.name }} 32 ¢
                    </button>
                    <button class="bet-btn-3d grey" @click="handleBet('draw')">
                        {{ $t('sports.draw') }} 32 ¢
                    </button>
                    <button class="bet-btn-3d pink" @click="handleBet('2')">
                        {{ matchData.team2.name }} 32 ¢
                    </button>
                </div>
            </div>

            <!-- 让球盘 -->
            <div class="spread-area">
                <h2 class="area-title" @click="toggleSpreadOrderBook">{{ $t('sports.spread') }}</h2>
                <div class="volume-sub">{{ matchData.volume }} {{ $t('sports.volume') }}</div>

                <!-- 上方两侧盘口按钮 -->
                <div class="spread-grid">
                    <button class="spread-btn" :class="{ active: selectedSpreadSide === 'home' }"
                        @click="selectedSpreadSide = 'home'">
                        {{ matchData.team1.name }} -{{ currentSpread }} 32 ¢
                    </button>
                    <button class="spread-btn" :class="{ active: selectedSpreadSide === 'away' }"
                        @click="selectedSpreadSide = 'away'">
                        {{ matchData.team2.name }} +{{ currentSpread }} 69 ¢
                    </button>
                </div>

                <!-- 底部让分刻度选择 -->
                <div class="spread-slider">
                    <button class="arrow-btn" :disabled="selectedSpreadIndex === 0" @click="prevSpread">
                        ‹
                    </button>
                    <div class="spread-values">
                        <div v-for="(val, idx) in spreadValues" :key="val" class="spread-val"
                            :class="{ active: idx === selectedSpreadIndex }" @click="selectSpread(idx)">
                            {{ val }}
                        </div>
                    </div>
                    <button class="arrow-btn" :disabled="selectedSpreadIndex === spreadValues.length - 1"
                        @click="nextSpread">
                        ›
                    </button>
                </div>

                <!-- 选中某个让球刻度后展示订单簿 -->
                <SportsOrderBook v-if="showSpreadOrderBook && selectedSpreadIndex !== -1" />
            </div>

            <!-- 总比分 -->
            <div class="spread-area total-area">
                <h2 class="area-title" @click="toggleTotalOrderBook">{{ $t('sports.total') }}</h2>
                <div class="volume-sub">{{ matchData.volume }} {{ $t('sports.volume') }}</div>

                <!-- 上方两侧盘口按钮 -->
                <div class="spread-grid">
                    <button class="spread-btn" :class="{ active: selectedTotalSide === 'over' }"
                        @click="selectedTotalSide = 'over'">
                        {{ $t('sports.over') }} {{ currentTotal }} 32 ¢
                    </button>
                    <button class="spread-btn" :class="{ active: selectedTotalSide === 'under' }"
                        @click="selectedTotalSide = 'under'">
                        {{ $t('sports.under') }} {{ currentTotal }} 69 ¢
                    </button>
                </div>

                <!-- 底部总比分刻度选择（独立状态） -->
                <div class="spread-slider">
                    <button class="arrow-btn" :disabled="selectedTotalIndex === 0" @click="prevTotal">
                        ‹
                    </button>
                    <div class="spread-values">
                        <div v-for="(val, idx) in totalValues" :key="'total-' + val" class="spread-val"
                            :class="{ active: idx === selectedTotalIndex }" @click="selectTotal(idx)">
                            {{ val }}
                        </div>
                    </div>
                    <button class="arrow-btn" :disabled="selectedTotalIndex === totalValues.length - 1"
                        @click="nextTotal">
                        ›
                    </button>
                </div>

                <!-- 选中某个总比分刻度后展示订单簿 -->
                <SportsOrderBook v-if="showTotalOrderBook && selectedTotalIndex !== -1" />
            </div>
        </div>
    </div>

    <!-- 购买弹窗 -->
    <PaymentModal v-model="showPayment" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import tyIcon01 from '@/assets/icon/tyIcon01.png'
import tyIcon02 from '@/assets/icon/tyIcon02.png'
import logoIcon from '@/assets/icon/logoIcon.png'
import SportsOrderBook from './SportsOrderBook.vue'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import PaymentModal from '@/components/PaymentModal.vue'

const { t } = useI18n()
const router = useRouter()
const logoUrl = logoIcon

const matchData = ref({
    title: '尼克斯队对阵湖人队',
    date: '1月5日',
    time: '4:00 AM',
    volume: '$37,755,917',
    team1: { name: '尼克斯队', record: '5-6-8', logo: tyIcon01 },
    team2: { name: '湖人队', record: '5-6-8', logo: tyIcon02 },
    stats: { team1Percent: 30, team2Percent: 41 },
})

// 让球盘 / 总比分 盘口状态（刻度互相独立，默认不选中）
const spreadValues = [1.5, 2.5, 3.5, 4.5]
const totalValues = [1.5, 2.5, 3.5, 4.5]
const defaultSpreadIndex = 1
const defaultTotalIndex = 1
const selectedSpreadIndex = ref(-1) // 默认不选中
const selectedTotalIndex = ref(-1) // 默认不选中
const selectedSpreadSide = ref('home')
const selectedTotalSide = ref('over')
const showSpreadOrderBook = ref(false)
const showTotalOrderBook = ref(false)

const showPayment = ref(false)
const selectedBetSide = ref(null)

// 按钮文案使用的盘口数值：未选中时使用默认中间值
const currentSpread = computed(() => {
    const idx = selectedSpreadIndex.value === -1 ? defaultSpreadIndex : selectedSpreadIndex.value
    return spreadValues[idx]
})

const currentTotal = computed(() => {
    const idx = selectedTotalIndex.value === -1 ? defaultTotalIndex : selectedTotalIndex.value
    return totalValues[idx]
})

const selectSpread = (idx) => {
    selectedSpreadIndex.value = idx
    showSpreadOrderBook.value = false
}

const prevSpread = () => {
    if (selectedSpreadIndex.value === -1) {
        // 从默认中间值向左一步
        selectedSpreadIndex.value = Math.max(0, defaultSpreadIndex - 1)
    } else if (selectedSpreadIndex.value > 0) {
        selectedSpreadIndex.value -= 1
    }
    showSpreadOrderBook.value = false
}

const nextSpread = () => {
    if (selectedSpreadIndex.value === -1) {
        // 从默认中间值向右一步
        selectedSpreadIndex.value = Math.min(spreadValues.length - 1, defaultSpreadIndex + 1)
    } else if (selectedSpreadIndex.value < spreadValues.length - 1) {
        selectedSpreadIndex.value += 1
    }
    showSpreadOrderBook.value = false
}

const selectTotal = (idx) => {
    selectedTotalIndex.value = idx
    showTotalOrderBook.value = false
}

const prevTotal = () => {
    if (selectedTotalIndex.value === -1) {
        selectedTotalIndex.value = Math.max(0, defaultTotalIndex - 1)
    } else if (selectedTotalIndex.value > 0) {
        selectedTotalIndex.value -= 1
    }
    showTotalOrderBook.value = false
}

const nextTotal = () => {
    if (selectedTotalIndex.value === -1) {
        selectedTotalIndex.value = Math.min(totalValues.length - 1, defaultTotalIndex + 1)
    } else if (selectedTotalIndex.value < totalValues.length - 1) {
        selectedTotalIndex.value += 1
    }
    showTotalOrderBook.value = false
}

const toggleSpreadOrderBook = () => {
    if (selectedSpreadIndex.value === -1) return
    showSpreadOrderBook.value = !showSpreadOrderBook.value
}

const toggleTotalOrderBook = () => {
    if (selectedTotalIndex.value === -1) return
    showTotalOrderBook.value = !showTotalOrderBook.value
}

const handleBet = (side) => {
    selectedBetSide.value = side
    showPayment.value = true
}
</script>

<style scoped lang="scss">
.sports-detail-h5-page {
    padding-top: 40px;
    min-height: 100vh;
    background-color: var(--bg-page-h5);
    color: var(--text-color);
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
}

/* 卡片容器 */
.match-card {
    margin: 30px 16px 20px;
    position: relative;
    height: 160px;
    /* 固定高度以匹配 SVG 路径 */

    .card-border {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
    }

    .match-time-tag {
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-page);
        padding: 4px 14px;
        border-radius: 6px;
        font-family: PingFang SC, PingFang SC;
        font-weight: 500;
        font-size: 12px;
        color: var(--bg-opposite);
        z-index: 2;
    }

    .card-content {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px 20px;
        height: 100%;
    }
}

.team-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 75px;

    .team-logo {
        width: 42px;
        height: 42px;
        margin-bottom: 15px;
    }

    .team-name {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 8px;
        white-space: nowrap;
    }

    .team-record {
        font-size: 13px;
        color: var(--text-dark-gray);
    }
}

.stats-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .prob-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .val {
            font-size: 19px;
            font-weight: 700;
            color: var(--bg-opposite);
        }

        .blocks {
            display: flex;
            gap: 3px;

            .b {
                width: 15px;
                height: 9px;
                border-radius: 1px;

                &.y {
                    background: #f2c94c;
                }

                &.g {
                    background: #333;
                }

                &.m {
                    background: #ca4064;
                }
            }
        }
    }

    .volume-row {
        font-size: 13px;
        color: var(--text-dark-gray);
        font-weight: 400;
        margin-bottom: 12px;
    }

    .chooseme-watermark {
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
    }

    .chooseme-watermark-img {
        height: 16px;
        width: auto;
        display: block;
        filter: grayscale(1);
    }
}

/* 投注区 */
.betting-area {
    padding: 20px 16px 35px;

    .area-title {
        font-size: 19px;
        font-weight: bold;
        margin-bottom: 6px;
    }

    .volume-sub {
        font-size: 13px;
        color: var(--text-dark-gray);
        margin-bottom: 25px;
    }

    .bet-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
    }
}

/* 3D 按钮 */
.bet-btn-3d {
    height: 40px;
    border: none;
    border-radius: 8px;
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
    color: var(--bg-opposite);
    cursor: pointer;
    transition: all 0.1s;

    &:active {
        transform: translateY(4px);
        box-shadow: none !important;
    }

    &.yellow {
        background: #f2c94c;
        box-shadow: 0 5px 0 #9e8125;
    }

    &.grey {
        background: #333;
        box-shadow: 0 5px 0 #1a1a1a;
    }

    &.pink {
        background: #ca4064;
        box-shadow: 0 5px 0 #7e233b;
    }
}

/* 让球盘区域 */
.spread-area {
    padding: 0 16px 24px;

    .area-title {
        font-size: 19px;
        font-weight: bold;
        margin-bottom: 6px;
    }

    .volume-sub {
        font-size: 13px;
        color: var(--text-dark-gray);
        margin-bottom: 18px;
    }

    .spread-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 18px;
    }

    .spread-btn {
        height: 44px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
        box-shadow: 0 4px 0 #1a1a1a, inset 0 1px 0 rgba(255, 255, 255, 0.08);
        color: #fff;
        font-size: 15px;
        font-weight: 600;
        font-family: PingFang SC, PingFang SC;
        cursor: pointer;
        transition: all 0.1s;

    }

    .spread-slider {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 8px;
    }

    .arrow-btn {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: var(--text-dark-gray);
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:disabled {
            opacity: 0.3;
            cursor: default;
        }
    }

    .spread-values {
        flex: 1;
        display: flex;
        justify-content: space-around;
        position: relative;
        font-size: 14px;
        color: var(--text-dark-gray);
    }

    .spread-val {
        position: relative;
        padding-top: 6px;
        padding-bottom: 4px;
        min-width: 32px;
        text-align: center;

        &.active {
            color: var(--bg-opposite);

            &::after {
                content: '';
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 6px solid var(--bg-opposite);
            }
        }
    }
}

.total-area {
    margin-top: 10px;
}

// 亮色主题适配
:global(.theme-light) {
    .sports-detail-h5-page {
        .card-border-path {
            stroke: rgba(0, 0, 0, 0.12);
        }
    }
}

// 暗色主题（默认）
:global(.theme-dark) {
    .sports-detail-h5-page {
        .card-border-path {
            stroke: rgba(255, 255, 255, 0.12);
        }
    }
}
</style>