<template>
  <div class="withdraw-page" ref="pageRef">
    <BackHeaderNav :title="$t('withdraw.title')" scrollContainer=".withdraw-page" />

    <div class="main-content">
      <!-- 接收地址 -->
      <div class="form-group">
        <label class="form-label">{{ $t('withdraw.receiveAddress') }}</label>
        <div class="input-wrap">
          <textarea v-model="receiveAddress" class="form-input form-textarea"
            :placeholder="$t('withdraw.receiveAddressPlaceholder')" rows="2" />
        </div>
      </div>

      <!-- 选择币种 -->
      <div class="form-group">
        <label class="form-label">{{ $t('withdraw.selectCurrency') }}</label>
        <div class="input-wrap select-wrap" @click="showCurrencyPicker = true">
          <span class="input-value">{{ selectedCurrency }}</span>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <!-- 提币网络 -->
      <div class="form-group">
        <label class="form-label">{{ $t('withdraw.withdrawNetwork') }}</label>
        <div class="input-wrap">
          <span class="input-value">{{ selectedNetwork }}</span>
        </div>
      </div>

      <!-- 提币数量 -->
      <div class="form-group">
        <label class="form-label">{{ $t('withdraw.withdrawAmount') }}</label>
        <div class="amount-input-wrap">
          <input v-model="withdrawAmount" type="number" class="form-input amount-input"
            :placeholder="$t('withdraw.withdrawAmountPlaceholder')" step="any" min="0" @input="handleAmountInput" />
          <span class="amount-unit">{{ selectedCurrency }}</span>
          <button class="max-btn" @click="handleMaxClick">{{ $t('withdraw.max') }}</button>
        </div>
        <div class="balance-tip">{{ $t('withdraw.balance') }}: {{ balance }} {{ selectedCurrency }}</div>
      </div>

    </div>

    <!-- 底部固定：交易摘要 + 确定提币 -->
    <div class="fixed-bottom">
      <div class="summary-section" v-if="canSubmit">
        <div class="summary-row">
          <span class="summary-label">{{ $t('withdraw.youWillReceive') }}</span>
          <span class="summary-value receive">{{ displayReceiveAmount }} {{ selectedCurrency }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">{{ $t('withdraw.feePercent', { percent: feeRate }) }}</span>
          <span class="summary-value">{{ feeAmount }} {{ selectedCurrency }}</span>
        </div>
      </div>
      <button class="confirm-btn" :disabled="!canSubmit" @click="handleConfirm">
        {{ $t('withdraw.confirmWithdraw') }}
      </button>
    </div>

    <!-- 币种选择弹窗 -->
    <div v-if="showCurrencyPicker" class="picker-overlay" @click.self="showCurrencyPicker = false">
      <div class="picker-panel">
        <div class="picker-header">
          <span class="picker-title">{{ $t('withdraw.selectCurrency') }}</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeaderNav from '@/components/BackHeaderNav.vue'

const router = useRouter()

const receiveAddress = ref('0x0d766a37A0E60f75A9bDFEfA3EDFd12D372a5b85')
const withdrawAmount = ref('200.87')
const selectedCurrency = ref('USDT')
const selectedNetwork = ref('BNB Smart Chain(BEP20)')
const balance = ref('200.87')
const feeRate = ref(3)
const showCurrencyPicker = ref(false)

const currencyList = ['USDT', 'CHO']

// 处理键盘弹出时的滚动问题
const pageRef = ref(null)

const preventOverscroll = (e) => {
  const el = e.currentTarget
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight
  const clientHeight = el.clientHeight
  
  if (scrollTop <= 0 && e.deltaY < 0) {
    e.preventDefault()
  }
  if (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0) {
    e.preventDefault()
  }
}

const handleTouchMove = (e) => {
  const el = document.querySelector('.withdraw-page')
  if (!el) return
  
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight
  const clientHeight = el.clientHeight
  
  // 如果内容不需要滚动，阻止默认行为
  if (scrollHeight <= clientHeight) {
    e.preventDefault()
  }
}

onMounted(() => {
  // 禁止 iOS 橡皮筋效果
  document.body.style.overscrollBehavior = 'none'
  document.documentElement.style.overscrollBehavior = 'none'
})

onUnmounted(() => {
  document.body.style.overscrollBehavior = ''
  document.documentElement.style.overscrollBehavior = ''
})

const handleAmountInput = () => {
  const val = parseFloat(withdrawAmount.value)
  if (val > parseFloat(balance.value)) {
    withdrawAmount.value = balance.value
  }
}

const handleMaxClick = () => {
  withdrawAmount.value = balance.value
}

const selectCurrency = (currency) => {
  selectedCurrency.value = currency
  showCurrencyPicker.value = false
}

const feeAmount = computed(() => {
  const amount = parseFloat(withdrawAmount.value) || 0
  const fee = amount * (feeRate.value / 100)
  return fee.toFixed(2)
})

const displayReceiveAmount = computed(() => {
  const amount = parseFloat(withdrawAmount.value) || 0
  const fee = amount * (feeRate.value / 100)
  const receive = amount - fee
  return receive >= 0 ? receive.toFixed(2) : '0.00'
})

const canSubmit = computed(() => {
  return (
    receiveAddress.value.trim() &&
    selectedCurrency.value &&
    withdrawAmount.value &&
    parseFloat(withdrawAmount.value) > 0 &&
    parseFloat(withdrawAmount.value) <= parseFloat(balance.value)
  )
})

const handleConfirm = () => {
  if (!canSubmit.value) return
  // TODO: 实现实际提币逻辑，成功后跳转
    router.push({
    path: '/transaction-success',
    query: {
      type: 'withdraw',
      amount: withdrawAmount.value,
      currency: selectedCurrency.value,
      address: receiveAddress.value.trim(),
      network: selectedNetwork.value,
      networkFee: '0.05',
      txId: '8jkj90...798h56',
      submitTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      referenceNo: String(Math.floor(10000000 + Math.random() * 90000000))
    }
  })
}
</script>

<style scoped lang="scss">
.withdraw-page {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background-color: var(--bg-page-h5);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
  padding-top: 60px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

.main-content {
  padding: 20px 16px 24px;
  /* 为底部固定区域留出空间 */
}

.form-group {
  margin-bottom: 20px;

  .form-label {
    display: block;
    font-size: 14px;
    color: var(--text-dark-gray, #909090);
    margin-bottom: 8px;
  }

  .input-wrap {
    background: var(--bg-page-h5, #2a2a2a);
    border: 1px solid var(--border-color, #23262f);
    border-radius: 12px;
    padding: 14px 15px;

    &.select-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }

    .form-input {
      width: 100%;
      font-size: 16px;
      color: var(--text-color);
      background: transparent;
      border: none;
      outline: none;
      font-family: PingFang SC, PingFang SC;
      font-weight: 600;
      font-size: 16px;
      color: var(--bg-opposite);

      &::placeholder {
        color: var(--text-dark-gray, #909090);
      }

      &.form-textarea {
        resize: none;
        min-height: 48px;
        line-height: 1.5;
        word-wrap: break-word;
      }
    }

    .input-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--bg-opposite);
    }

    .arrow-icon {
      width: 20px;
      height: 20px;
      color: var(--text-dark-gray, #909090);
    }
  }

  .amount-input-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-page-h5, #2a2a2a);
    border: 1px solid var(--border-color, #23262f);
    border-radius: 12px;
    padding: 14px 15px;

    .amount-input {
      flex: 1;
      min-width: 0;
      font-size: 16px;
      color: var(--text-color);
      background: transparent;
      border: none;
      outline: none;

      &::placeholder {
        color: var(--text-dark-gray, #909090);
      }
    }

    .amount-unit {
      font-size: 16px;
      color: var(--text-color);
      flex-shrink: 0;
    }

    .max-btn {
      padding: 6px 12px;
      background: var(--bg-page, #23262f);
      border-radius: 8px;
      font-size: 14px;
      color: var(--text-color);
      border: none;
      cursor: pointer;
      flex-shrink: 0;

      &:active {
        opacity: 0.8;
      }
    }
  }

  .balance-tip {
    margin-top: 8px;
    font-size: 14px;
    color: var(--text-dark-gray, #909090);
    text-align: right;
  }
}

/* 底部固定区域 */
.fixed-bottom {
  padding: 0 16px ;
  box-sizing: border-box;
}

.summary-section {
  border-radius: 12px;
  margin-bottom: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  .summary-label {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-dark-gray);
  }

  .summary-value {
    font-size: 16px;
    color: var(--bg-opposite);

    &.receive {
      font-weight: 600;
      color: var(--text-color-y);
    }
  }
}

.fixed-bottom .confirm-btn {
  width: 100%;
  height: 48px;
  background: var(--text-color-y);
  border: none;
  border-radius: 12px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  margin-top: 30px;
  color: #000;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    background: var(--border-color, #23262f);
    color: var(--text-dark-gray, #909090);
    cursor: not-allowed;
  }
}

/* 币种选择弹窗 */
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
