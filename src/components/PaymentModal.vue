<template>
    <transition name="slide-up">
        <div v-if="modelValue" class="trade-overlay" @click.self="handleClose">
            <div class="trade-modal">
                <!-- 顶部拉条 -->
                <div class="grabber" />

                <!-- 1. 顶部切换栏 -->
                <div class="trade-nav">
                    <div class="side-tabs">
                        <button :class="['nav-tab', { active: activeSide === 'buy' }]" @click="activeSide = 'buy'">{{
                            $t('payment.buy') }}</button>
                        <button :class="['nav-tab', { active: activeSide === 'sell' }]" @click="activeSide = 'sell'">{{
                            $t('payment.sell') }}</button>
                    </div>
                    <div class="type-pills">
                        <button :class="['pill', { active: orderType === 'market' }]" @click="orderType = 'market'">{{
                            $t('payment.marketOrder') }}</button>
                        <button :class="['pill', { active: orderType === 'limit' }]" @click="orderType = 'limit'">{{
                            $t('payment.limitOrder') }}</button>
                    </div>
                </div>

                <div class="trade-body">
                    <!-- 2. 标题与余额 -->
                    <div class="target-info">
                        <h3 class="target-title">尼克斯队对阵湖人队</h3>
                        <div class="target-row">
                            <div class="outcome-badge"
                                :class="{ 'outcome-yes': outcomeBadge === 'yes', 'outcome-no': outcomeBadge === 'no' }">
                                尼克斯队 | {{ outcomeBadge === 'yes' ? $t('common.yes') : $t('common.no') }}
                                <span class="icon" aria-hidden="true" style="display: inline-flex;"
                                    @click="outcomeBadge = outcomeBadge === 'no' ? 'yes' : 'no'">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11.997"
                                        viewBox="0 0 12 11.997">
                                        <path fill="currentColor"
                                            d="M12.028,5.674h-.994a.126.126,0,0,0-.125.125V9.787H2.652V8.654a.128.128,0,0,0-.028-.081.131.131,0,0,0-.183-.022L.2,10.307a.137.137,0,0,0,0,.206l2.239,1.756a.128.128,0,0,0,.081.028.133.133,0,0,0,.131-.131V11.032h8.383a1.122,1.122,0,0,0,1.12-1.122V5.8a.129.129,0,0,0-.128-.125ZM.28,6.923h.994A.126.126,0,0,0,1.4,6.8V2.81H9.657V3.943a.128.128,0,0,0,.028.081.131.131,0,0,0,.183.022l2.239-1.757a.137.137,0,0,0,0-.206L9.867.328A.128.128,0,0,0,9.786.3a.133.133,0,0,0-.131.131V1.565H1.275A1.122,1.122,0,0,0,.156,2.687V6.8A.125.125,0,0,0,.28,6.923Z"
                                            transform="translate(-0.155 -0.3)" />
                                    </svg>
                                </span>
                            </div>
                            <div class="balance-info">
                                <el-icon>
                                    <Wallet />
                                </el-icon> {{ $t('payment.balance') }} $1000.03
                            </div>
                        </div>
                    </div>

                    <div class="divider" />

                    <!-- 3. 限价输入 -->
                    <div class="input-section" v-if="orderType === 'limit'">
                        <label class="input-label">{{ $t('payment.limitPrice') }}</label>
                        <div class="stepper-box">
                            <button class="step-btn" @click="price > 1 && price--">-</button>
                            <div class="step-center">
                                <div class="step-value">{{ price }}¢</div>
                            </div>
                            <button class="step-btn" @click="price < 99 && price++">+</button>
                        </div>
                    </div>

                    <!-- 4. 股数输入 -->
                    <div class="input-section" style="margin-bottom: 10px;">
                        <label class="input-label">{{ $t('payment.shares') }}</label>
                        <div class="stepper-box">
                            <div class="input-box">
                                <input v-model.number="shares" type="number" class="main-input" />
                            </div>
                        </div>
                    </div>
                    <!-- 股数快捷加减，单独占一整行 -->
                    <div class="quick-shares-row">
                        <div class="quick-shares">
                            <button v-for="val in [-100, -10, 10, 100]" :key="val" class="quick-share-btn"
                                @click="adjustShares(val)">
                                {{ val > 0 ? '+' + val : val }}
                            </button>
                        </div>
                    </div>
                    <!-- 市价单平均价格 -->
                    <div v-if="orderType === 'market'" class="avg-price-row">
                        <span class="avg-price-text">{{ $t('payment.avgPrice') }}：{{ averagePrice }}¢</span>
                    </div>

                    <!-- 5. 杠杆 -->
                    <div class="input-section">
                        <label class="input-label">{{ $t('payment.leverage') }}</label>
                        <div class="leverage-group">
                            <button :class="['lev-btn', { active: leverage === 2 }]" @click="leverage = 2">x 2</button>
                            <button :class="['lev-btn', { active: leverage === 5 }]" @click="leverage = 5">🚀 x
                                5</button>
                            <button :class="['lev-btn', { active: leverage === 10 }]" @click="leverage = 10">🔥 x
                                MAX</button>
                        </div>
                        <p class="leverage-tip">{{ $t('payment.maxLeverageTip') }}</p>
                    </div>

                    <!-- 5.1 设置过期时间 -->
                    <div class="input-section expiry-section">
                        <div class="expiry-header">
                            <label class="input-label">{{ $t('payment.expiration') }}</label>
                            <button type="button" class="expiry-switch" :class="{ on: enableExpiry }"
                                @click="enableExpiry = !enableExpiry" aria-label="toggle expiration">
                                <span class="knob" />
                            </button>
                        </div>

                        <div v-if="enableExpiry" class="expiry-pills">
                            <button v-for="opt in expiryOptions" :key="opt.key" type="button" class="expiry-pill"
                                :class="{ active: expiryPreset === opt.key }" @click="expiryPreset = opt.key">
                                {{ opt.label }}
                            </button>
                        </div>

                        <div v-if="enableExpiry && expiryPreset === 'custom'" class="expiry-custom">
                            <input v-model.number="customExpiryMinutes" type="number" min="1" step="1"
                                class="expiry-input" />
                            <span class="expiry-unit">{{ $t('payment.expiryMinutes') }}</span>
                        </div>
                    </div>

                    <!-- 6. 结算汇总 -->
                    <div class="summary-section">
                        <div class="summary-row">
                            <span class="s-label">{{ $t('payment.total') }}</span>
                            <span class="s-value">${{ totalCost }}</span>
                        </div>
                        <div class="summary-row">
                            <span class="s-label">{{ $t('payment.potentialGain') }}</span>
                            <span class="s-value-gain">💵 +${{ potentialGain }}</span>
                        </div>
                    </div>

                    <!-- 7. 执行按钮 -->
                    <button class="execute-btn" @click="handleConfirm">
                        {{ executeLabel }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Wallet } from '@element-plus/icons-vue'

const { t } = useI18n()
const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const activeSide = ref('buy') // 'buy' | 'sell'
const orderType = ref('limit')
const price = ref(48)
const shares = ref(100)
const leverage = ref(2)
const outcomeBadge = ref('no') // 'yes' | 'no'
const enableExpiry = ref(false)
const expiryPreset = ref('5m') // '5m' | '1h' | '12h' | '24h' | 'eod' | 'custom'
const customExpiryMinutes = ref(5)

const expiryOptions = computed(() => ([
    { key: '5m', label: t('payment.expiry5m') || '5m' },
    { key: '1h', label: t('payment.expiry1h') || '1h' },
    { key: '12h', label: t('payment.expiry12h') || '12h' },
    { key: '24h', label: t('payment.expiry24h') || '24h' },
    { key: 'eod', label: t('payment.expiryEod') || 'EOD' },
    { key: 'custom', label: t('payment.expiryCustom') || 'Custom' },
]))

const totalCost = computed(() => ((price.value * shares.value) / 100).toFixed(2))
const potentialGain = computed(() => shares.value.toFixed(2))
const averagePrice = computed(() => price.value)

// 执行按钮文案：buy yes / buy no / sell yes / sell no
const executeLabel = computed(() => {
    const sideText = activeSide.value === 'buy'
        ? (t('payment.buy') || t('common.buy') || 'Buy')
        : (t('payment.sell') || t('common.sell') || 'Sell')
    const ynText = outcomeBadge.value === 'yes'
        ? (t('common.yes') || 'Yes')
        : (t('common.no') || 'No')
    return `${sideText} ${ynText}`
})

function adjustShares(val) {
    shares.value = Math.max(0, shares.value + val)
}

function handleClose() { emit('update:modelValue', false) }
function handleConfirm() { console.log('Trade Confirmed') }
</script>

<style scoped lang="scss">
.trade-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 3000;
    display: flex;
    align-items: flex-end;
}

.trade-modal {
    width: 100%;
    background: var(--bg-page);
    border-radius: 20px 20px 0 0;
    padding: 0 16px 24px;
    color: var(--bg-opposite);
    font-family: sans-serif;
    overflow-y: auto;
    max-height: 80vh;
    position: relative;
}

.grabber {
    position: sticky;
    top: -1px;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 1;
    height: 30px;
    background: var(--bg-page);

    &::after {
        content: '';
        position: absolute;
        top: 10px;
        left: 0;
        right: 0;
        width: 40px;
        height: 4px;
        background: var(--text-dark-gray);
        border-radius: 2px;
        margin: 0 auto 16px;
    }
}

/* 导航切换 */
.trade-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border-color);

    .side-tabs {
        display: flex;
        gap: 20px;


        .nav-tab {
            background: none;
            border: none;
            font-family: PingFang SC, PingFang SC;
            font-weight: 600;
            font-size: 18px;
            padding: 4px 0;
            cursor: pointer;
            padding-bottom: 12px;
            color: var(--text-dark-gray);
            border-bottom: 2px solid transparent;


            &.active {
                color: var(--text-color-y);
                border-bottom: 2px solid var(--text-color-y);
            }
        }
    }

    .type-pills {
        background: var(--bg-page);
        padding: 4px;
        border-radius: 6px;
        display: flex;

        .pill {
            border: none;
            background: none;
            font-family: PingFang SC, PingFang SC;
            font-weight: 400;
            font-size: 14px;
            color: var(--text-dark-gray);
            padding: 4px 6px;
            border-radius: 4px;
            cursor: pointer;

            &.active {
                background: var(--text-dark-gray);
                color: var(--bg-opposite);
            }
        }
    }
}

/* 目标信息 */
.target-info {
    .target-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        color: var(--bg-opposite);
        margin: 0 0 12px;
    }

    .target-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .outcome-badge {
        background: var(--button-bg-n);
        color: var(--text-color-n);
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;

        &.outcome-yes {
            background: var(--button-bg-y);
            color: var(--text-color-y);
        }

        &.outcome-no {
            background: var(--button-bg-n);
            color: var(--text-color-n);
        }

        &.active {
            background: var(--button-bg-y);
            color: var(--text-color-y);
        }
    }

    .balance-info {
        color: var(--text-dark-gray);
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
}

.divider {
    height: 1px;
    background: var(--border-color);
    margin: 20px 0;
}

/* 输入区域 */
.input-section {
    display: flex;
    align-items: center;
    margin-top: 20px;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap; // 方便提示文字换行

    .input-label {
        font-size: 15px;
        font-weight: bold;
        color: var(--text-dark-gray);
    }
}

.stepper-box {
    flex: 0.8;
    background: var(--bg-page);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    display: flex;
    align-items: center;
    height: 48px;
    overflow: hidden;

    .step-btn {
        width: 50px;
        height: 100%;
        background: none;
        border: none;
        color: var(--text-dark-gray);
        font-size: 20px;
        cursor: pointer;

        &:active {
            background: var(--border-color);
        }
    }

    .step-center {
        flex: 1;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1.2;
    }

    .step-value {
        font-size: 18px;
        font-weight: 800;
    }

    .step-sub {
        margin-top: 2px;
        font-size: 12px;
        color: var(--text-dark-gray);
    }
}


.input-box {
    flex: 1;
    background: var(--bg-page);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;

    .main-input {
        width: 100%;
        background: none;
        border: none;
        color: var(--bg-opposite);
        text-align: right;
        font-size: 18px;
        font-weight: bold;
        outline: none;
    }
}

.quick-shares-row {
    margin: 8px 0 0;
    display: flex;
    justify-content: flex-end; // 整行按钮靠右对齐
}

.quick-shares {
    display: flex;
    gap: 8px;

    .quick-share-btn {
        background: #2F2F2F;
        border: none;
        color: var(--bg-opposite);
        padding: 6px 15px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: bold;
    }
}

.avg-price-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;

    .avg-price-text {
        font-size: 12px;
        color: var(--text-dark-gray);
    }
}

/* 杠杆 */
.leverage-group {
    flex: 0.8;
    display: flex;
    gap: 8px;
    justify-content: flex-end; // 杠杆按钮靠右

    .lev-btn {
        opacity: 0.5;
        flex: 1;
        background: #2F2F2F;
        border: none;
        color: var(--text-dark-gray);
        padding: 10px 0;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;

        // &.active {
        //     background: #eee;
        //     color: #000;
        // }
    }
}

.leverage-tip {
    padding-bottom: 20px;
    font-size: 11px;
    color: var(--text-dark-gray);
    text-align: right;
    width: 100%;
    flex-basis: 100%; // 在 flex 容器中独占一整行
    border-bottom: 1px solid var(--border-color);
}

/* 过期时间 */
.expiry-section {
    margin-top: 14px;
}

.expiry-header {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    gap: 12px;
}

.expiry-switch {
    width: 52px;
    height: 30px;
    border-radius: 999px;
    border: none;
    background: #2F2F2F;
    position: relative;
    padding: 0;
    flex-shrink: 0;
    cursor: pointer;
    transition: background 0.2s ease;

    .knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 24px;
        height: 24px;
        border-radius: 999px;
        background: #ffffff;
        transition: transform 0.2s ease;
    }

    &.on {
        background: var(--text-color-y);
        .knob {
            transform: translateX(22px);
        }
    }
}

.expiry-pills {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 6px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
}

.expiry-pill {
    min-width: 60px;
    height: 44px;
    border-radius: 12px;
    border: none;
    background: #2F2F2F;
    color: var(--text-dark-gray);
    font-size: 14px;
    font-weight: 600;
    opacity: 0.8;
    cursor: pointer;

    &.active {
        background: var(--button-bg-y);
        color: var(--text-color-y);
        opacity: 1;
    }
}

.expiry-custom {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
}

.expiry-input {
    width: 96px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: transparent;
    color: var(--bg-opposite);
    text-align: right;
    padding: 0 10px;
    font-size: 14px;
    outline: none;
}

.expiry-unit {
    font-size: 12px;
    color: var(--text-dark-gray);
}

/* 汇总 */
.summary-section {
    margin: 24px 0;

    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .s-label {
            color: #888;
            font-size: 15px;
            font-weight: bold;
        }

        .s-value {
            font-size: 18px;
            font-weight: 900;
        }

        .s-value-gain {
            font-size: 18px;
            font-weight: 900;
            color: var(--text-color-y);
        }
    }
}

/* 确认按钮 */
.execute-btn {
    width: 100%;
    height: 52px;
    background: var(--text-color-y);
    border: none;
    border-radius: 14px;
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 16px;
    color: #000000;
    cursor: pointer;
    transition: transform 0.1s;

    &:active {
        transform: scale(0.98);
    }
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}

.theme-light {
    .quick-share-btn {
        background: #fff !important;
        border: 1px solid var(--text-dark-gray);
    }

    .lev-btn {
        background: var(--text-dark-gray) !important;
        color: #444;
    }
}
</style>