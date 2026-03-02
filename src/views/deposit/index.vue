<template>
  <div class="deposit-page">
    <BackHeaderNav :title="$t('deposit.title')" />

    <div class="main-content">
      <!-- QR 码区域 -->
      <div class="qr-section">
        <div class="qr-wrap">
          <img :src="qrCodeUrl" alt="Deposit QR" class="qr-image" />
        </div>
        <div class="min-deposit-tip">
          <span class="tip-label">{{ $t('deposit.minAmountLabel') }}</span>
          <span class="tip-value">{{ minAmount }} {{ selectedCurrency }}</span>
        </div>
      </div>

      <!-- 存款地址 -->
      <div class="form-group">
        <label class="form-label">{{ $t('deposit.yourAddress') }}</label>
        <div class="address-wrap">
          <span class="address-text">{{ displayAddress }}</span>
          <button class="copy-btn" @click="copyAddress">{{ $t('deposit.copy') }}</button>
        </div>
      </div>

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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAccount } from '@wagmi/vue'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import Message from '@/utils/message'
import QRCode from 'qrcode'

const router = useRouter()
const { t } = useI18n()
const { address } = useAccount()

const depositAddress = computed(() => address.value || '0x0d766a37A0E60f75A9bDFEfA3EDFd12D372a5b85')
const selectedCurrency = ref('USDT')
const selectedNetwork = ref('BNB Smart Chain(BEP20)')
const minAmount = ref('0.01')
const showCurrencyPicker = ref(false)
const qrCodeUrl = ref('')

const currencyList = ['USDT', 'CHO']

const displayAddress = computed(() => {
  return depositAddress.value
})

const copyAddress = async () => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(depositAddress.value)
      Message.success(t('common.copied'))
      return
    }
  } catch (e) {
    // ignore
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = depositAddress.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (ok) Message.success(t('common.copied'))
  } catch (e) {
    // ignore
  }
}

const selectCurrency = (currency) => {
  selectedCurrency.value = currency
  showCurrencyPicker.value = false
}

const generateQR = async () => {
  if (!depositAddress.value) return
  try {
    qrCodeUrl.value = await QRCode.toDataURL(depositAddress.value, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (e) {
    console.error('QR generate failed:', e)
    qrCodeUrl.value = ''
  }
}

watch(depositAddress, generateQR, { immediate: true })

// 已完成充值按钮逻辑已下线，保留页面展示与地址复制功能
</script>

<style scoped lang="scss">
.deposit-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-page-h5);
  color: var(--text-color);
  padding-top: 60px;
  box-sizing: border-box;
}

.main-content {
  padding: 24px 16px;
}

.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.qr-wrap {
  border-radius: 12px;
  overflow: hidden;
  display: inline-block;
  padding: 8px;
  border: 1px solid var(--border-color);
}

.qr-image {
  display: block;
  width: 128px;
  height: 128px;
  border-radius: 12px;
}

.min-deposit-tip {
  margin-top: 16px;
  font-size: 14px;

  .tip-label {
    color: var(--text-color);
  }

  .tip-value {
    color: var(--text-dark-gray, #909090);
  }
}

.form-group {
  margin-bottom: 20px;

  .form-label {
    display: block;
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 14px;
    color: var(--text-dark-gray);
    margin-bottom: 15px;
  }

  .address-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--border-color, #23262f);
    border-radius: 12px;
    padding: 14px 16px;

    .address-text {
      flex: 1;
      font-size: 16px;
      color: var(--text-color);
      word-break: break-all;
      white-space: pre-line;
    }

    .copy-btn {
      flex-shrink: 0;
      padding: 8px 16px;
      background: var(--border-color, #23262f);
      border-radius: 8px;
      font-size: 14px;
      color: var(--text-color);
      border: none;
      cursor: pointer;

      &:active {
        opacity: 0.8;
      }
    }
  }

  .input-wrap {
    border: 1px solid var(--border-color, #23262f);
    border-radius: 12px;
    padding: 14px 16px;

    &.select-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
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
