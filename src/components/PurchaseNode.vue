<template>
  <div v-if="modelValue" class="purchase-overlay" @click.self="handleClose">
    <div class="purchase-modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <div class="close-btn" @click="handleClose">
          <svg viewBox="0 0 1024 1024" width="20" height="20">
            <path
              d="M572.16 512l183.466667-183.04a42.666667 42.666667 0 1 0-60.586667-60.586667L512 451.84l-183.04-183.466667a42.666667 42.666667 0 0 0-60.586667 60.586667L451.84 512l-183.466667 183.04a42.666667 42.666667 0 0 0 0 60.586667 42.666667 42.666667 0 0 0 60.586667 0L512 572.16l183.04 183.466667a42.666667 42.666667 0 0 0 60.586667 0 42.666667 42.666667 0 0 0 0-60.586667z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">{{ $t('purchaseNode.estimatedTradeProfit') }}</span>
          <span class="info-value">{{ tradeProfit }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('purchaseNode.subCoinFeeProfit') }}</span>
          <span class="info-value">{{ feeProfit }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('purchaseNode.secondaryProfit') }}</span>
          <span class="info-value">{{ secondaryProfit }}</span>
        </div>
      </div>

      <p class="tip-text">{{ $t('purchaseNode.tipText') }}</p>

      <button class="buy-btn" @click="handleBuy">{{ $t('purchaseNode.buyBtn') }}</button>

      <div class="wallet-row">
        <img :src="walletIcon" alt="wallet" class="wallet-icon" />
        <span class="wallet-label">{{ $t('purchaseNode.walletBalance') }}</span>
        <span class="wallet-value">{{ walletBalance }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
import walletIcon from '@/assets/icon/10.png'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '集群节点-10000 USDT' },
  tradeProfit: { type: String, default: 'XX USDT+XX MEME' },
  feeProfit: { type: String, default: 'XX USDT+XX MEME' },
  secondaryProfit: { type: String, default: 'XX USDT+XX MEME' },
  walletBalance: { type: String, default: '200000 USDT' }
})

const emit = defineEmits(['update:modelValue', 'buy', 'close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBuy = () => {
  emit('buy')
}
</script>

<style scoped lang="scss">
.purchase-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.purchase-modal {
  width: 90%;
  max-width: 360px;
  background-color: var(--bg-pn, #ffffff);
  border-radius: 16px;
  padding: 24px 20px;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 20px;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #000000);
}

.close-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-dark-gray, #999999);
}

.info-card {
  background-color: var(--bg-card , #FAFAFA);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 14px;
  color: var(--text-color, #333333);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #000000);
}

.tip-text {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--text-dark-gray, #999999);
}

.buy-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  background-color: var(--bg-opposite, #000000);
  font-size: 16px;
  font-weight: 500;
  color: var(--bg-page-h5, #ffffff);
  cursor: pointer;
  margin-bottom: 16px;
}

.wallet-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.wallet-icon {
  width: 20px;
  height: 20px;
}

.wallet-label {
  font-size: 13px;
  color: var(--text-dark-gray, #999999);
}

.wallet-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color, #000000);
}
</style>
