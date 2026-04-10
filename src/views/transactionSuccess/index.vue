<template>
  <div class="transaction-success-page">
    <BackHeaderNav />

    <div class="main-content">
      <!-- 交易成功摘要 -->
      <div class="success-summary">
        <div class="amount-label">{{ amountLabel }}</div>
        <div class="amount-value">{{ completedText }} {{ amount }} {{ currency }}</div>
        <div class="status-row">
          <svg class="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M8 12l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <span class="status-text">{{ successText }}</span>
        </div>
      </div>

      <!-- 交易详情列表 -->
      <div class="detail-list">
        <div class="detail-item">
          <span class="detail-label">{{ $t('transactionSuccess.address') }}</span>
          <div class="detail-value-wrap">
            <span class="detail-value address">{{ displayAddress }}</span>
            <button class="copy-btn" @click="copyAddress" aria-label="copy">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div class="detail-item">
          <span class="detail-label">{{ $t('transactionSuccess.network') }}</span>
          <div class="detail-value-wrap">
            <img :src="networkIcon" alt="network" class="network-icon" />
            <span class="detail-value">{{ network }}</span>
          </div>
        </div>
<!-- 
        <div v-if="isWithdraw" class="detail-item">
          <span class="detail-label">{{ $t('transactionSuccess.networkFee') }}</span>
          <span class="detail-value">{{ networkFee }} {{ currency }}</span>
        </div> -->

        <!-- <div class="detail-item">
          <span class="detail-label">{{ $t('transactionSuccess.txId') }}</span>
          <div class="detail-value-wrap">
            <span class="detail-value">{{ txId }}</span>
            <button class="copy-btn" @click="copyTxId" aria-label="copy">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div> -->

        <div class="detail-item">
          <span class="detail-label">{{ $t('transactionSuccess.submitTime') }}</span>
          <span class="detail-value">{{ submitTime }}</span>
        </div>

        <!-- <div class="detail-item">
          <span class="detail-label">{{ $t('transactionSuccess.referenceNo') }}</span>
          <div class="detail-value-wrap">
            <span class="detail-value">{{ referenceNo }}</span>
            <button class="copy-btn" @click="copyReferenceNo" aria-label="copy">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div> -->

        <div v-if="isDeposit" class="detail-item">
          <span class="detail-label">{{ $t('transactionSuccess.depositAccount') }}</span>
          <span class="detail-value">{{ depositAccount }}</span>
        </div>
      </div>
    </div>

    <!-- 底部固定按钮 -->
    <div class="fixed-bottom">
      <button class="view-btn" @click="handleViewExplorer">
        {{ $t('transactionSuccess.viewOnExplorer') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import Message from '@/utils/message'
import networks from '@/assets/json/networks.js'
import bnbIcon from '@/assets/images/chain/bnb.png'

const route = useRoute()
const { t } = useI18n()

const txType = ref(route.query.type || 'withdraw')
const isWithdraw = computed(() => txType.value === 'withdraw')
const isDeposit = computed(() => txType.value === 'deposit')

const amountLabel = computed(() =>
  t(`transactionSuccess.${txType.value}.amountLabel`)
)
const completedText = computed(() =>
  t(`transactionSuccess.${txType.value}.completed`)
)

const status = ref(route.query.status || '')

const successText = computed(() => {
  if (isWithdraw.value && status.value === 'PENDING') {
    return t('transactionSuccess.withdraw.pending')
  }
  return t(`transactionSuccess.${txType.value}.success`)
})

const depositAccount = ref(route.query.depositAccount || 'ChooseMe 账户')

// 从路由参数获取，默认展示数据
const amount = ref(route.query.amount || '')
const currency = ref(route.query.currency || '')
const address = ref(route.query.address || '')
const network = ref(route.query.network || '')
const networkFee = ref(route.query.networkFee || '')
const txId = ref(route.query.txId || '')
const txIdFull = ref(route.query.txIdFull || '')
const submitTime = ref(route.query.submitTime || '')
const referenceNo = ref(route.query.referenceNo || '')

const displayAddress = computed(() => {
  return address.value.length > 20
    ? `${address.value.slice(0, 22)}\n${address.value.slice(22)}`
    : address.value
})

const networkIcon = bnbIcon

const explorerUrl = computed(() => {
  const bnb = networks.find((n) => n.name?.includes('BSC') || n.name?.includes('BNB'))
  const base = bnb?.explorerUrl || 'https://bscscan.com'
  return txIdFull.value ? `${base}/tx/${txIdFull.value}` : base
})

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (e) {
    // ignore
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch (e) {
    return false
  }
}

const copyAddress = async () => {
  const ok = await copyToClipboard(address.value)
  if (ok) Message.success(t('common.copied') || '已复制')
  else Message.error(t('common.copyFailed') || '复制失败')
}

const copyTxId = async () => {
  const text = txIdFull.value || txId.value
  const ok = await copyToClipboard(text)
  if (ok) Message.success(t('common.copied') || '已复制')
  else Message.error(t('common.copyFailed') || '复制失败')
}

const copyReferenceNo = async () => {
  const ok = await copyToClipboard(referenceNo.value)
  if (ok) Message.success(t('common.copied') || '已复制')
  else Message.error(t('common.copyFailed') || '复制失败')
}

const handleViewExplorer = () => {
  window.open(explorerUrl.value, '_blank')
}

onMounted(() => {
  if (route.query.txIdFull) txIdFull.value = route.query.txIdFull
  if (route.query.type) txType.value = route.query.type
  if (route.query.depositAccount) depositAccount.value = route.query.depositAccount
})
</script>

<style scoped lang="scss">
.transaction-success-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-page-h5);
  color: var(--text-color);
  padding-top: 60px;
  box-sizing: border-box;
  padding-bottom: 60px;
}

.main-content {
  padding: 24px 16px;
}

.success-summary {
  text-align: center;
  margin-bottom: 66px;

  .amount-label {
    font-size: 14px;
    color: var(--text-dark-gray, #909090);
    margin-bottom: 8px;
  }

  .amount-value {
    font-family: PingFang SC, PingFang SC;
    font-weight: 700;
    font-size: 25px;
    color: var(--bg-opposite);
    margin-bottom: 12px;
  }

  .status-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .check-icon {
      width: 20px;
      height: 20px;
      color: #00ce7a;
    }

    .status-text {
      font-size: 16px;
      font-weight: 700;
      color: var(--bg-opposite);
    }
  }
}

.detail-list {
  width: 100%;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  .detail-label {
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 16px;
    color: var(--bg-opposite);
    flex-shrink: 0;
    margin-right: 12px;
  }

  .detail-value-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .detail-value {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 16px;
    color: var(--text-dark-gray);
    text-align: right;
    word-break: break-all;

    &.address {
      white-space: pre-line;
      text-align: right;
    }
  }

  .network-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .copy-btn {
    flex-shrink: 0;
    margin-left: auto;
    padding: 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-dark-gray, #909090);

    svg {
      width: 18px;
      height: 18px;
    }

    &:active {
      opacity: 0.7;
    }
  }
}

.fixed-bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  z-index: 100;
}

.view-btn {
  width: 100%;
  height: 48px;
  background: var(--text-color-y);
  border: none;
  border-radius: 12px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #000;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:active {
    opacity: 0.9;
  }
}
</style>
