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
        <label class="form-label">{{ $t('withdraw.selectToken') }}</label>
        <div class="input-wrap select-wrap" @click="showCurrencyPicker = true">
          <span class="input-value">{{ selectedCurrency?.asset_symbol || 'Select Currency' }}</span>
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
          <span class="amount-unit">{{ selectedCurrency?.asset_symbol }}</span>
          <button class="max-btn" @click="handleMaxClick">{{ $t('withdraw.max') }}</button>
        </div>
        <div class="balance-tip">{{ $t('withdraw.balance') }}: {{ balance }} {{ selectedCurrency?.asset_symbol }}</div>
      </div>

    </div>

    <!-- 底部固定：交易摘要 + 确定提币 -->
    <div class="fixed-bottom">
      <!-- <div class="summary-section" v-if="canSubmit">
        <div class="summary-row">
          <span class="summary-label">{{ $t('withdraw.youWillReceive') }}</span>
          <span class="summary-value receive">{{ displayReceiveAmount }} {{ selectedCurrency?.asset_symbol }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">{{ $t('withdraw.feePercent', { percent: feeRate }) }}</span>
          <span class="summary-value">{{ feeAmount }} {{ selectedCurrency?.asset_symbol }}</span>
        </div>
      </div> -->
      <button class="confirm-btn" :disabled="!canSubmit" @click="handleConfirm">
        {{ $t('withdraw.confirmWithdraw') }}
      </button>
    </div>

    <!-- 币种选择弹窗 -->
    <div v-if="showCurrencyPicker" class="picker-overlay" @click.self="showCurrencyPicker = false">
      <div class="picker-panel">
        <div class="picker-header">
          <span class="picker-title">{{ $t('withdraw.selectToken') }}</span>
          <span class="picker-close" @click="showCurrencyPicker = false">×</span>
        </div>
        <div class="picker-list">
          <div v-for="currency in currencyList" :key="currency.asset_address" class="picker-item"
            :class="{ active: selectedCurrency?.asset_address === currency.asset_address }"
            @click="selectCurrency(currency)">
            {{ currency.asset_symbol }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { getAssetList, getUserBalances, userWithdraw } from '@/api/APIEvent'
import { ElLoading } from 'element-plus'
import Message from '@/utils/message'
import { useAccount } from '@wagmi/vue'
import networks from '@/assets/json/networks.js'

const router = useRouter()
const { t } = useI18n()

const { address } = useAccount()

const receiveAddress = ref('')
const withdrawAmount = ref('')
const selectedCurrency = ref(null)
const balance = ref('0.00')
const feeRate = ref(0)
const showCurrencyPicker = ref(false)

const currencyList = ref([])

const selectedNetwork = computed(() => {
  if (!selectedCurrency.value) return 'BNB Smart Chain(BEP20)'
  const targetChainId = Number(selectedCurrency.value.chain_id)
  const net = networks.find(n => Number(n.chainId) === targetChainId)
  return net ? net.name : 'Unknown Network'
})

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

const fetchAssets = async () => {
  try {
    const res = await getAssetList({})
    const { data } = res
    if (data.code === 2000) {
      currencyList.value = data?.data?.filter(item => item.is_active) || []
      if (currencyList.value.length > 0) {
        selectedCurrency.value = currencyList.value[0]
      }
    }
  } catch (error) {
    console.error('Failed to fetch asset list:', error)
  }
}

const fetchBalance = async () => {
  if (!selectedCurrency.value || !address.value) {
    balance.value = '0.00'
    return
  }
  try {
    const res = await getUserBalances({
      user_address: address.value,
      asset_guid: selectedCurrency.value.asset_guid,
      currency: selectedCurrency.value.asset_symbol
    })
    if (res.data?.code === 2000) {
      // The API returns balance according to the selected currency.
      // We will try to extract the cash from the response.
      let cash = '0.00'
      if (Array.isArray(res.data.data?.balances)) {
        const item = res.data.data.balances.find(i => i.asset_guid === selectedCurrency.value.guid)
        if (item) cash = item.available_balance
        feeRate.value = item.exchange_rate || 0
      }
      balance.value = cash
    } else {
      balance.value = '0.00'
    }
  } catch (e) {
    console.error(e)
    balance.value = '0.00'
  }
}

watch([selectedCurrency, address], () => {
  fetchBalance()
})

onMounted(() => {
  // 禁止 iOS 橡皮筋效果
  document.body.style.overscrollBehavior = 'none'
  document.documentElement.style.overscrollBehavior = 'none'
  fetchAssets()

  if (address.value) {
    receiveAddress.value = address.value
  }
})

onUnmounted(() => {
  document.body.style.overscrollBehavior = ''
  document.documentElement.style.overscrollBehavior = ''
})

const handleAmountInput = () => {
  const val = parseFloat(withdrawAmount.value)
  // Disable balance check for now if we don't know the real withdrawable balance
  // if (val > parseFloat(balance.value)) {
  //   withdrawAmount.value = balance.value
  // }
}

const handleMaxClick = () => {
  if (parseFloat(balance.value) > 0) {
    withdrawAmount.value = balance.value
  }
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
    parseFloat(withdrawAmount.value) > 0
  )
})

const handleConfirm = async () => {
  if (!canSubmit.value) return

  const loading = ElLoading.service({
    lock: true,
    text: 'Processing...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    if (!address.value) {
      Message.error(t('lpVault.connectWalletFirst') || 'Please connect wallet first')
      return
    }

    const withdrawAmt = parseFloat(withdrawAmount.value) || 0
    if (withdrawAmt <= 0) {
      Message.error('Please enter a valid amount')
      return
    }

    const tokenAddress = selectedCurrency.value.asset_address

    loading.text = 'Withdrawing...'

    // 调用后端提现接口
    const res = await userWithdraw({
      address: address.value,
      amount: String(withdrawAmt),
      asset_guid: selectedCurrency.value.guid,
      to_address: receiveAddress.value.trim(),
      token_address: tokenAddress,
    })

    if (res.data?.code === 2000) {
      withdrawAmount.value = ''
      Message.success('Withdraw successful!')
      router.push({
        path: '/transaction-success',
        query: {
          type: 'withdraw',
          amount: withdrawAmt,
          currency: selectedCurrency.value.asset_symbol,
          address: receiveAddress.value.trim(),
          network: selectedNetwork.value,
          networkFee: '0.00',
          txId: res.data.data?.guid || 'Processing',
          status: res.data.data?.status || '',
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
    } else {
      Message.error(res.data?.message || 'Withdraw Failed')
    }

  } catch (error) {
    console.error('Withdraw error:', error)
    Message.error('Withdraw error')
  } finally {
    loading.close()
  }
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
  padding: 0 16px;
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
