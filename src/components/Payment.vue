<template>
    <div class="payment">
        <!-- Cash Used Section -->
        <div class="section">
            <div class="section-title">{{ t('payment.cashUsed') }}</div>
            <div class="cash-input-wrapper">
                <div class="cash-display">
                    <span class="cash-symbol">$</span>
                    <input v-model="cashUsed" type="number" class="cash-input" placeholder="0" />
                </div>
                <div class="quick-buttons">
                    <button v-for="amount in quickAmounts" :key="amount"
                        :class="['quick-btn', { active: selectedQuickAmount === amount }]"
                        @click="handleQuickAmount(amount)">
                        +{{ amount }}
                    </button>
                </div>
            </div>
            <div class="info-text">
                <div class="info-line">
                    <span class="info-label">{{ t('payment.maxTradeSize') }}</span>
                    <span class="info-value">${{ maxTradeSize.toFixed(2) }} MAX</span>
                </div>
                <div class="info-line underline-text">
                    <span class="info-label">{{ t('payment.usableBonusAmount') }}</span>
                    <span class="info-value">${{ usableBonus.toFixed(2) }}/${{ totalBonus.toFixed(2) }}</span>
                </div>
            </div>
        </div>

        <!-- Leverage Section -->
        <div class="section">
            <div class="section-title">{{ t('payment.leverage') }}</div>
            <div class="leverage-buttons">
                <button v-for="(leverage, index) in leverageOptions" :key="index"
                    :class="['leverage-btn', { active: selectedLeverage === leverage.value }]"
                    @click="selectedLeverage = leverage.value">
                    {{ leverage.label }}
                </button>
            </div>
            <div class="info-text">{{ t('payment.maxAvailableLeverage') }} {{ maxLeverage }} MAX</div>
        </div>

        <!-- Prediction Bar -->
        <div class="prediction-section">
            <div class="prediction-bar">
                <div class="prediction-indicator"></div>
                <div class="prediction-content">
                    <span class="prediction-text">{{ t('payment.predictionOutcome') }}</span>
                    <span class="prediction-percentage">86%</span>
                </div>
            </div>
        </div>

        <!-- Leveraged Size Section -->
        <div class="section">
            <div class="section-title">{{ t('payment.leveragedSize') }}</div>
            <div class="leveraged-size-value">
                <span class="leveraged-amount"><span>$</span>{{ leveragedSize.toFixed(0) }}</span>
                <span class="leveraged-multiplier">{{ selectedLeverage }}x</span>
            </div>
            <div class="trade-summary">
                <div class="summary-item">
                    <span class="summary-label">{{ t('payment.cashUsedLabel') }}</span>
                    <span class="summary-value">${{ cashUsed || 0 }}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">{{ t('payment.projectedPnl') }}</span>
                    <span class="summary-value positive">+${{ projectedPnL.toFixed(1) }}(+{{ projectedROI }}%)</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">{{ t('payment.tradedProbability') }}</span>
                    <span class="summary-value">{{ tradedProbability }}%</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">{{ t('payment.marketImpact') }}</span>
                    <span class="summary-value">{{ marketImpact }}</span>
                </div>
            </div>
        </div>

        <!-- Continue Button -->
        <button class="continue-btn" @click="handleContinue">{{ t('payment.continue') }}</button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Cash Used
const cashUsed = ref(21)
const selectedQuickAmount = ref(20)
const quickAmounts = [20, 50, 100]
const maxTradeSize = ref(716.50)
const usableBonus = ref(0.00)
const totalBonus = ref(0.00)

// Leverage
const selectedLeverage = ref(1)
const leverageOptions = [
    { label: 'x 2', value: 2 },
    { label: '🚀 x 5', value: 5 },
    { label: '🔥 x MAX', value: 10 }
]
const maxLeverage = ref(10)

// Computed values
const leveragedSize = computed(() => {
    return (cashUsed.value || 0) * selectedLeverage.value
})

const projectedPnL = computed(() => {
    return (cashUsed.value || 0) * 1.2
})

const projectedROI = computed(() => {
    return Math.round(((projectedPnL.value - (cashUsed.value || 0)) / (cashUsed.value || 1)) * 100)
})

const tradedProbability = ref(14)
const marketImpact = ref(0.1)

// Methods
const handleQuickAmount = (amount) => {
    selectedQuickAmount.value = amount
    cashUsed.value = amount
}

const handleContinue = () => {
    // Handle continue action
    console.log('Continue clicked', {
        cashUsed: cashUsed.value,
        leverage: selectedLeverage.value,
        leveragedSize: leveragedSize.value
    })
}
</script>

<style scoped lang="scss">
.payment {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 24px 20px 32px;
    box-sizing: border-box;
    background-color: var(--bg-page, #000000);
}

.section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}



.section-title {
    font-family: Noto Sans SC, Noto Sans SC;
    font-weight: 900;
    font-size: 20px;
    color: var(--text-color, #FFFFFF);
    letter-spacing: 0.02em;
    margin-bottom: 15px;
}

// Cash Used Section
.cash-input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
}

.cash-display {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 4px;
}

.cash-symbol {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-color, #FFFFFF);
}

.cash-input {
    flex: 1;
    height: auto;
    padding: 0;
    border: none;
    width: 80%;

    background: transparent;
    color: var(--text-color, #FFFFFF);
    font-size: 16px;
    font-weight: 700;
    outline: none;
    transition: color 0.3s ease;
    min-width: 0;

    &::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }

    // Remove number input arrows
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    &[type="number"] {
        -moz-appearance: textfield;
    }
}

.quick-buttons {
    display: flex;
    gap: 8px;
}

.quick-btn {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    color: var(--text-color, #FFFFFF);
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s ease;
    white-space: nowrap;
    background: #2F2F2F;

    &.active {
        background: #FFFFFF;
        color: #000000;
        border-color: #FFFFFF;
        font-weight: 700;
    }
}

.info-text {
    font-size: 14px;
    color: var(--text-color, #FFFFFF);
    line-height: 1.8;
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .info-line {
        display: flex;
        justify-content: right;
        gap: 4px;
        flex-wrap: wrap;
    }

    .info-label {
        color: var(--text-gray, #999999);
        font-weight: 400;
    }

    .info-value {
        color: var(--text-color, #FFFFFF);
        font-weight: 700;
    }

    .underline-text .info-value {
        text-decoration: underline;
    }
}

// Leverage Section
.leverage-buttons {
    display: flex;
    gap: 12px;
}

.leverage-btn {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid var(--border-color, #2E2F32);
    border-radius: 8px;
    background: var(--bg-card, #1E1E1E);
    color: var(--text-color, #FFFFFF);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
        background: var(--bg-opposite, #FFFFFF);
        color: var(--bg-page, #000000);
    }
}

// Prediction Bar
.prediction-section {
    width: 100%;
}

.prediction-bar {
    position: relative;
    width: 100%;
    height: 48px;
    background: rgba(187, 255, 46, 0.2);
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-sizing: border-box;
    overflow: hidden;
}

.prediction-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--text-color-y, #BBFF2E);
}

.prediction-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
}

.prediction-text {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 14px;
    color: var(--text-color-y, #BBFF2E);
}

.prediction-percentage {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color, #FFFFFF);
    transition: color 0.3s ease;
}

// Leveraged Size Section
.leveraged-size-value {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--bg-page, #000000);
    margin-bottom: 11px;

    .leveraged-amount {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-color, #FFFFFF);

        span {
            font-size: 16px;
            margin-right: 5px;
        }
    }

    .leveraged-multiplier {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        color: #EAAB4A;
        margin-left: 10px;
    }
}

.trade-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-radius: 8px;
    transition: background-color 0.3s ease;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.summary-label {
    font-size: 14px;
    color: var(--text-gray, rgba(255, 255, 255, 0.6));
    transition: color 0.3s ease;
}

.summary-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color, #FFFFFF);
    transition: color 0.3s ease;

    &.positive {
        color: var(--text-color-y, #BBFF2E);
    }
}

// Continue Button
.continue-btn {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 8px;
    background: var(--text-color, #2F2F2F);
    color: var(--bg-page, #000);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: var(--bg-hover, #3F3F3F);
    }

    &:active {
        transform: scale(0.98);
    }
}

.theme-light {
    .quick-btn {
        background: #e0e0e0 !important;
        &.active {
            background: #000000 !important;
            color: #FFFFFF !important;
        }
    }
}
</style>
