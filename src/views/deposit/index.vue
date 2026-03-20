<template>
  <div class="deposit-page">
    <BackHeaderNav :title="$t('deposit.title')" />

    <div class="main-content">
      <!-- 选择币种 -->
      <div class="form-group">
        <label class="form-label">{{ $t('deposit.selectCurrency') }}</label>
        <div class="input-wrap select-wrap" @click="showCurrencyPicker = true">
          <span class="input-value">{{ selectedCurrency }}</span>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <!-- 选择网络 -->
      <div class="form-group">
        <label class="form-label">{{ $t('deposit.selectNetwork') }}</label>
        <div class="input-wrap">
          <span class="input-value">{{ selectedNetwork }}</span>
        </div>
      </div>

      <!-- 充币数量 -->
      <div class="form-group">
        <label class="form-label">{{ $t('deposit.amountLabel') }}</label>
        <div class="input-wrap amount-wrap">
          <input type="number" v-model="amount" placeholder="0.00" class="amount-input" />
          <span class="currency-suffix">{{ selectedCurrency }}</span>
        </div>
        <div class="min-deposit-tip">
          <span class="tip-label">{{ $t('deposit.minAmountLabel') }}</span>
          <span class="tip-value">{{ minAmount }} {{ selectedCurrency }}</span>
        </div>
      </div>

    </div>

    <!-- 底部按钮 -->
    <div class="bottom-action">
      <button class="submit-btn" @click="handleDeposit">
        {{ $t('deposit.confirmBtn') }}
      </button>
    </div>

    <!-- 币种选择弹窗 -->
    <div v-if="showCurrencyPicker" class="picker-overlay" @click.self="showCurrencyPicker = false">
      <div class="picker-panel">
        <div class="picker-header">
          <span class="picker-title">{{ $t('deposit.selectCurrency') }}</span>
          <span class="picker-close" @click="showCurrencyPicker = false">×</span>
        </div>
        <div class="picker-list">
          <div v-for="currency in currencyList" :key="currency" class="picker-item"
            :class="{ active: selectedCurrency === currency }" @click="selectCurrency(currency)">
            {{ currency }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'

const router = useRouter()
const { t } = useI18n()

const selectedCurrency = ref('USDT')
const selectedNetwork = ref('BNB Smart Chain(BEP20)')
const amount = ref('')
const minAmount = ref('0.01')
const showCurrencyPicker = ref(false)

const currencyList = ['USDT', 'CHO']

const selectCurrency = (currency) => {
  selectedCurrency.value = currency
  showCurrencyPicker.value = false
}

const handleDeposit = () => {
  // Deposit logic here
  console.log('Deposit confirmed', {
    currency: selectedCurrency.value,
    network: selectedNetwork.value,
    amount: amount.value
  })
}
</script>

<style scoped lang="scss">
.deposit-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-page-h5);
  color: var(--text-color);
  padding-top: 60px;
  padding-bottom: 100px;
  box-sizing: border-box;
}

.main-content {
  padding: 24px 16px;
}

.form-group {
  margin-bottom: 24px;

  .form-label {
    display: block;
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 14px;
    color: var(--text-dark-gray, #909090);
    margin-bottom: 12px;
  }

  .input-wrap {
    border: 1px solid var(--border-color, #23262f);
    border-radius: 12px;
    padding: 14px 16px;
    background: transparent;

    &.select-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }

    &.amount-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .amount-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-color);
        font-size: 16px;
        width: 100%;
        
        &::placeholder {
          color: var(--text-dark-gray, #909090);
        }

        /* Hide spin buttons for input type number */
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        -moz-appearance: textfield;
      }
      
      .currency-suffix {
        font-size: 16px;
        color: var(--text-color);
        margin-left: 8px;
        font-weight: 500;
      }
    }

    .input-value {
      font-size: 16px;
      color: var(--text-color);
    }

    .arrow-icon {
      width: 20px;
      height: 20px;
      color: var(--text-dark-gray, #909090);
    }
  }

  .min-deposit-tip {
    margin-top: 10px;
    font-size: 12px;
    text-align: right;

    .tip-label {
      color: var(--text-dark-gray, #909090);
    }

    .tip-value {
      color: var(--text-dark-gray, #909090);
    }
  }
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 16px 34px;
  background: var(--bg-page-h5);

  .submit-btn {
    width: 100%;
    height: 50px;
    background: var(--text-color-y, #BBFF2E);
    border-radius: 12px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    color: #000000;
    cursor: pointer;

    &:active {
      opacity: 0.8;
    }
  }
}

.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
}

.picker-panel {
  width: 100%;
  max-height: 60vh;
  background: var(--bg-card, #1e1e1e);
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #23262f);

  .picker-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
  }

  .picker-close {
    font-size: 24px;
    color: var(--text-dark-gray, #909090);
    cursor: pointer;
    line-height: 1;
  }
}

.picker-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.picker-item {
  padding: 16px 20px;
  font-size: 16px;
  color: var(--text-color);
  cursor: pointer;

  &.active {
    color: #00ce7a;
    font-weight: 600;
  }

  &:active {
    background: var(--bg-light, #2a2a2a);
  }
}
</style>
