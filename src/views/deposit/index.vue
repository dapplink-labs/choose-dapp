<template>
  <div class="deposit-page">
    <BackHeaderNav :title="$t('deposit.title')" />

    <div class="main-content">
      <!-- 选择币种 -->
      <div class="form-group">
        <label class="form-label">{{ $t('deposit.selectToken') }}</label>
        <div class="input-wrap select-wrap" @click="showCurrencyPicker = true">
          <span class="input-value">{{ selectedCurrency?.asset_symbol || $t('deposit.selectCurrency') }}</span>
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
          <input type="number" v-model="amount" placeholder="0.00" class="amount-input" @input="handleAmountInput" />
          <span class="currency-suffix">{{ selectedCurrency?.asset_symbol }}</span>
        </div>
        <div class="min-deposit-tip">
          <span class="tip-label">{{ $t('deposit.minAmountLabel') }}</span>
          <span class="tip-value">{{ minAmount }} {{ selectedCurrency?.asset_symbol }}</span>
        </div>
      </div>

    </div>

    <!-- 底部按钮 -->
    <div class="bottom-action">
      <PrimaryActionButton
        class="submit-btn"
        height="50px"
        radius="12px"
        font-size="16px"
        font-weight="600"
        @click="handleDeposit"
      >
        {{ $t('deposit.confirmBtn') }}
      </PrimaryActionButton>
    </div>

    <!-- 币种选择弹窗 -->
    <div v-if="showCurrencyPicker" class="picker-overlay" @click.self="showCurrencyPicker = false">
      <div class="picker-panel">
        <div class="picker-header">
          <span class="picker-title">{{ $t('deposit.selectToken') }}</span>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import PrimaryActionButton from '@/components/PrimaryActionButton.vue'
import { getAssetList } from '@/api/APIEvent'
import { ElLoading } from 'element-plus'
import Message from '@/utils/message'
import { useChainId, useAccount } from '@wagmi/vue'
import { switchChain } from '@wagmi/core'
import { parseUnits } from 'viem'
import { config } from '../../wagmi.ts'
import networks from '@/assets/json/networks.js'
import fundingPodABI from '@/assets/abi/fundingPodABI.json'
import {
  getUserTokenBalance,
  approveToken,
  checkAllowance,
  writeContractOptimized
} from '@/utils/requestWEB3.js'

const router = useRouter()
const { t } = useI18n()

const chainId = useChainId()
const { address } = useAccount()

const selectedCurrency = ref(null)
const selectedNetwork = computed(() => {
  if (!selectedCurrency.value) return t('deposit.defaultNetwork')
  const targetChainId = Number(selectedCurrency.value.chain_id)
  const net = networks.find(n => Number(n.chainId) === targetChainId)
  return net ? net.name : t('deposit.unknownNetwork')
})
const amount = ref('')
const minAmount = ref('0.01')
const showCurrencyPicker = ref(false)

const currencyList = ref([])

const handleAmountInput = (e) => {
  let val = e.target.value
  // 如果包含小数点
  if (val.includes('.')) {
    let parts = val.split('.')
    // 限制只能有一个小数点，且小数部分最多2位
    if (parts[1].length > 2) {
      parts[1] = parts[1].slice(0, 2)
      val = parts.join('.')
      amount.value = val
    }
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

const selectCurrency = (currency) => {
  selectedCurrency.value = currency
  showCurrencyPicker.value = false
}

const handleDeposit = async () => {

  const loading = ElLoading.service({
    lock: true,
    text: t('commonManagement.processing'),
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    if (!address.value) {
      Message.error(t('lpVault.connectWalletFirst') || 'Please connect wallet first')
      return
    }

    if (!selectedCurrency.value) {
      Message.error(t('deposit.pleaseSelectCurrency'))
      return
    }

    const depositAmount = parseFloat(amount.value) || 0
    if (depositAmount <= 0) {
      Message.error(t('deposit.pleaseEnterValidAmount'))
      return
    }

    const targetChainId = Number(selectedCurrency.value.chain_id)
    const tokenAddress = selectedCurrency.value.asset_address
    const tokenDecimals = selectedCurrency.value.asset_decimal

    console.log('Number(chainId.value) !== targetChainId', chainId.value, targetChainId)
    // 1. Check network
    if (Number(chainId.value) !== targetChainId) {
      try {
        await switchChain(config, { chainId: targetChainId })
        await new Promise((r) => setTimeout(r, 1000))
      } catch (switchError) {
        console.error('Failed to switch chain:', switchError)
        loading.close()
        return
      }
    }

    const netConfig = networks.find((n) => Number(n.chainId) === targetChainId)
    // Using proxyEventFundingManager as the funding manager
    const proxyFundingManager = netConfig?.proxyFundingPod

    if (!proxyFundingManager) {
      Message.error(t('deposit.contractNotFound'))
      return
    }

    const amountBigInt = parseUnits(String(depositAmount), tokenDecimals)

    // Check Balance
    const userBalance = await getUserTokenBalance(
      tokenAddress,
      address.value,
      "balanceOf"
    )

    if (userBalance < amountBigInt) {
      Message.error(t('commonManagement.insufficientBalance') || 'Insufficient balance')
      return
    }

    // Native token check (usually 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE or similar)
    const isNative = tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

    // Check Allowance if not native token
    if (!isNative) {
      const allowance = await checkAllowance(
        tokenAddress,
        address.value,
        proxyFundingManager
      )

      if (allowance === BigInt(0) || allowance < amountBigInt) {
        loading.text = t('deposit.requestingApproval')
        try {
          await approveToken({
            tokenAddress: tokenAddress,
            spenderAddress: proxyFundingManager,
            amount: amountBigInt,
            userAddress: address.value,
            BRIDGE_MESSAGES: {
              approvalSuccess: t('commonManagement.approvalSuccess') || 'Approval Success',
              userCancelledAuth: t('commonManagement.userCancelledAuth') || 'User Cancelled',
              approveTokenFailed: t('commonManagement.approveTokenFailed') || 'Approval Failed',
            },
          })
        } catch (approveError) {
          loading.close()
          return
        }
      }
    }

    loading.text = t('deposit.depositing')
    // Call contract deposit
    const result = await writeContractOptimized({
      abi: fundingPodABI,
      address: proxyFundingManager,
      functionName: "deposit",
      args: [tokenAddress, amountBigInt],
      userAddress: address.value,
      value: isNative ? amountBigInt : parseUnits("0", 18),
      messages: {
        success: t('commonManagement.confirmed') || 'Deposit Success',
        failed: t('commonManagement.failed') || 'Deposit Failed',
        rejected: t('commonManagement.rejected') || 'Deposit Cancelled',
      },
    })

    if (result && result.hash) {
      amount.value = ''
      Message.success(t('deposit.depositSuccess'))
    }

  } catch (error) {
    console.error('Deposit error:', error)
  } finally {
    loading.close()
  }
}

onMounted(() => {
  fetchAssets()
})
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
      font-weight: bold;
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
    color: var(--text-color-y);
    font-weight: 600;
  }

  &:active {
    background: var(--bg-light, #2a2a2a);
  }
}
</style>
