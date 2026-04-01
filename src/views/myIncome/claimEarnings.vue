<template>
  <div class="claim-earnings-page">
    <BackHeaderNav :title="$t('collectEarnings.title') || '领取收益'" />

    <div class="page-content">
      <!-- 选择节点 -->
      <div class="form-section">
        <label class="section-label">{{ $t('collectEarnings.selectNode') || '选择领取节点' }}</label>
        <div class="node-selector-trigger" @click="showNodeSelector = true">
          <span :class="{ 'placeholder': !selectedNode }">
            {{ selectedNode ? selectedNode.name : ($t('collectEarnings.selectNodePlaceholder') || '选择节点') }}
          </span>
          <el-icon class="arrow-icon">
            <ArrowDown />
          </el-icon>
        </div>
      </div>

      <!-- 领取数量 -->
      <div class="form-section">
        <label class="section-label">{{ $t('collectEarnings.claimAmount') || '领取数量' }}</label>
        <div class="amount-input-wrapper">
          <input type="number" v-model="displayAmount" class="amount-input"
            :placeholder="$t('collectEarnings.inputAmount') || '请输入领取数量'" />
          <div class="suffix-group">
            <span class="unit">CHO</span>
            <div class="max-btn" @click.stop="handleMax">Max</div>
          </div>
        </div>
        <div class="balance-info">
          <!-- 动态计算 USDT：基于比例和不同精度的转换 -->
          <span class="usdt-value">≈ {{ usdtValue }} USDT</span>
          <span class="claimable-text">
            {{ $t('collectEarnings.claimable') || '可领取收益' }}:
            {{ selectedNode ? formatAmount(selectedNode.node_reward) : '--' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 底部固定汇总区域 -->
    <div class="fixed-footer">
      <!-- 仅当输入金额大于 0 时显示收益拆分 -->
      <div class="summary-info" v-if="Number(displayAmount) > 0">
        <div class="summary-row">
          <span class="label">{{ $t('collectEarnings.youWillReceive') || '你将收到' }}</span>
          <span class="value green">{{ formatDisplayValue(receivedAmount) }} CHO</span>
        </div>
        <div class="summary-row">
          <span class="label dashed-underline">{{ $t('collectEarnings.predictedAmount') || '我的预测金额(20%)' }}</span>
          <span class="value">{{ formatDisplayValue(predictedAmount) }} CHO</span>
        </div>
      </div>

      <button class="confirm-btn" :disabled="!canClaim" @click="handleConfirm">
        {{ $t('collectEarnings.confirmClaim') || '确定领取' }}
      </button>
    </div>

    <NodeSelectorModal v-model:visible="showNodeSelector" :options="nodes" :loading="loadingNodes"
      :selected="selectedNode" @select="handleNodeSelect" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAccount, useChainId } from '@wagmi/vue'
import { switchChain, readContract } from '@wagmi/core'
import { config } from '@/wagmi'
import { ElLoading } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import Message from '@/utils/message'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import NodeSelectorModal from '@/components/NodeSelectorModal.vue'
import { getNodeStakingRecords, stakingclaimReward } from '@/api/API'
import { formatDateTime } from '@/utils/format_date.js'
import { writeContractOptimized, checkAllowance, approveToken } from '@/utils/requestWEB3.js'
import { formatChoAmount } from '@/utils/format_amount.js'
import stakingManagerABI from '@/assets/abi/stakingManagerABI.json'
import networks from '@/assets/json/networks.js'
import { parseUnits } from "viem";


const router = useRouter()
const { t } = useI18n()
const { address } = useAccount()
const chainId = useChainId()

// 状态
const nodes = ref([])
const loadingNodes = ref(false)
const showNodeSelector = ref(false)
const selectedNode = ref(null)

const displayAmount = ref('') // 用户输入的可读金额 (如 655.27)

// 精度常量
const PRECISION_CHO = 1e6     // CHO 6位
const PRECISION_USDT = 1e18    // USDT 18位
const BSC_CHAIN_ID = 56

const CONTRACT_MESSAGES = {
  success: () => t('myNode.claimSuccess') || '领取成功',
  failed: () => t('myNode.claimFailed') || '领取失败',
  rejected: () => t('myNode.claimCancelled') || '用户取消'
}

// --- 计算属性 ---

/**
 * 预估 USDT 计算逻辑：
 * 1. 将输入的 displayAmount 转为数字
 * 2. 将选中的 node_reward (6位) 转为可读数字
 * 3. 将选中的 node_reward_usdt (18位) 转为可读数字
 * 4. 比例 = (输入 / 总奖励) * 总U价值
 */
const usdtValue = computed(() => {
  if (!selectedNode.value || !selectedNode.value.node_reward || Number(displayAmount.value) <= 0) {
    return '0.00'
  }

  const inputReadable = Number(displayAmount.value)
  const totalRewardReadable = Number(selectedNode.value.node_reward) / PRECISION_CHO
  const totalUsdtValueReadable = Number(selectedNode.value.node_reward_usdt || 0) / PRECISION_USDT

  if (totalRewardReadable <= 0) return '0.00'

  const result = (inputReadable / totalRewardReadable) * totalUsdtValueReadable
  return result.toFixed(2)
})

const receivedAmount = computed(() => (Number(displayAmount.value) || 0) * 0.8)
const predictedAmount = computed(() => (Number(displayAmount.value) || 0) * 0.2)

const canClaim = computed(() => {
  return selectedNode.value && Number(displayAmount.value) > 0
})

// --- 监听器：限制输入金额 ---
watch(displayAmount, (newVal) => {
  if (!selectedNode.value) return
  const maxDisplay = Number(selectedNode.value.node_reward) / PRECISION_CHO
  if (Number(newVal) > maxDisplay) {
    displayAmount.value = String(maxDisplay)
    Message.warning(t('collectEarnings.exceedMax') || '输入金额不能超过可领取收益')
  }
})

// --- 格式化 ---
const formatAmount = (value) => {
  return formatChoAmount(value, { maxFractionDigits: 4, useGrouping: true })
}

const formatDisplayValue = (val) => {
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

// --- 业务方法 ---

const handleMax = () => {
  if (selectedNode.value) {
    displayAmount.value = String(Number(selectedNode.value.node_reward) / PRECISION_CHO)
  }
}

const handleNodeSelect = (node) => {
  selectedNode.value = node
  displayAmount.value = String(Number(node.node_reward) / PRECISION_CHO)
}

const fetchNodeStakingRecords = async () => {
  if (!address.value) return
  loadingNodes.value = true
  try {
    const res = await getNodeStakingRecords({ address: address.value })
    const list = res?.data?.data?.list || []

    const nodeTypeMap = {
      'T1': { nodeTag: 'T1', nodeNameKey: 'purchaseNodeRecord.informationNode' },
      'T2': { nodeTag: 'T2', nodeNameKey: 'myIncome.nodeNames.dataNode' },
      'T3': { nodeTag: 'T3', nodeNameKey: 'myIncome.nodeNames.validationNode' },
      'T4': { nodeTag: 'T4', nodeNameKey: 'myIncome.nodeNames.consensusNode' },
      'T5': { nodeTag: 'T5', nodeNameKey: 'myIncome.superNode' },
      'T6': { nodeTag: 'T6', nodeNameKey: 'myIncome.nodeNames.genesisNode' },
    }

    list.forEach(item => {
      item.name = t(nodeTypeMap[item.type]?.nodeNameKey || '')
      item.tag = nodeTypeMap[item.type]?.nodeTag || ''
      item.time = item.created ? formatDateTime(item.created) : ''
      item.node_reward = Number(item.node_reward) // 6位精度的整数
      item.node_reward_usdt = item.node_reward_usdt // 18位精度的原始值/大数
    })

    nodes.value = list
    if (nodes.value.length > 0) {
      handleNodeSelect(nodes.value[0])
    }
  } catch (error) {
    console.error('Failed to fetch node records:', error)
  } finally {
    loadingNodes.value = false
  }
}

const handleConfirm = async () => {
  if (!selectedNode.value || Number(displayAmount.value) <= 0) return

  const loading = ElLoading.service({
    lock: true,
    text: t('common.loading') || '处理中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    if (Number(chainId.value) !== BSC_CHAIN_ID) {
      await switchChain(config, { chainId: BSC_CHAIN_ID })
    }

    const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)

    // 使用 parseUnits 安全转换精度（与 predictionDetailH5 一致）
    const amountString = String(displayAmount.value)
    const amountBigInt = parseUnits(amountString, 6) // CHO 6位精度

    // 链上预检查：读取合约中实际可领取的奖励
    const lpInfo = await readContract(config, {
      address: bscNet.proxyStakingManager,
      abi: stakingManagerABI,
      functionName: 'getLiquidityProviderInfo',
      args: [address.value, BigInt(selectedNode.value.round)],
    })
    const onChainReward = lpInfo.rewardAmount ?? BigInt(0)
    const onChainClaimed = lpInfo.claimedAmount ?? BigInt(0)
    const onChainClaimable = onChainReward - onChainClaimed

    console.log('On-chain LP info:', {
      rewardAmount: onChainReward.toString(),
      claimedAmount: onChainClaimed.toString(),
      claimable: onChainClaimable.toString(),
      requestAmount: amountBigInt.toString(),
    })

    if (onChainClaimable <= BigInt(0)) {
      Message.error(t('collectEarnings.noClaimableReward') || '链上暂无可领取的奖励')
      return
    }

    if (amountBigInt > onChainClaimable) {
      Message.error(t('collectEarnings.exceedOnChain') || '领取数量超过链上可领取额度')
      return
    }

    // 检查 CHO 授权
    const choTokenAddress = bscNet.proxyChooseMeToken
    const allowance = await checkAllowance(
      choTokenAddress,
      address.value,
      bscNet.proxyStakingManager
    )

    if (allowance === BigInt(0) || allowance < amountBigInt) {
      loading.text = t('collectEarnings.requestingAuth') || '授权中...'
      try {
        await approveToken({
          tokenAddress: choTokenAddress,
          spenderAddress: bscNet.proxyStakingManager,
          amount: amountBigInt,
          userAddress: address.value,
          BRIDGE_MESSAGES: {
            approvalSuccess: t('collectEarnings.approvalSuccess') || '授权成功',
            userCancelledAuth: t('collectEarnings.userCancelledAuth') || '用户取消授权',
            approveTokenFailed: t('collectEarnings.approveTokenFailed') || '授权失败',
          },
        })
      } catch (approveError) {
        return
      }
    }

    const txHash = await writeContractOptimized({
      abi: stakingManagerABI,
      address: bscNet.proxyStakingManager,
      functionName: 'liquidityProviderClaimReward',
      value: parseUnits("0.001", 18),
      args: [BigInt(selectedNode.value.round), amountBigInt],
      userAddress: address.value,
      messages: CONTRACT_MESSAGES
    })

    if (txHash.success) {
      await stakingclaimReward({
        user_address: address.value,
        request_tx_hash: txHash.hash,
        round: String(selectedNode.value.round),
        raw_amount_token: amountBigInt.toString()
      })
      Message.success(CONTRACT_MESSAGES.success())
      router.back()
    }
  } catch (error) {
    console.error('Claim Error:', error)
    if (!error.message?.includes('User rejected')) {
      Message.error(error.message || '领取失败')
    }
  } finally {
    loading.close()
  }
}

onMounted(() => {
  fetchNodeStakingRecords()
})
</script>

<style scoped lang="scss">
.claim-earnings-page {
  min-height: calc(100vh - 170px);
  background-color: #010101;
  display: flex;
  flex-direction: column;
  padding-bottom: 140px;
  padding-top: 50px;
}

.page-content {
  padding: 20px;
}

.form-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  color: #999999;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 16px;
}

.node-selector-trigger {
  background: #010101;
  border-radius: 8px;
  border: 1px solid #2F2F2F;
  padding: 14px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  span {
    font-size: 16px;
    color: #fff;

    &.placeholder {
      color: #999;
    }
  }

  .arrow-icon {
    color: #999;
  }
}

.amount-input-wrapper {
  background: #010101;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  border: 1px solid #23262F;

  &:focus-within {
    border-color: #a4f128;
  }

  .amount-input {
    flex: 1;
    border: none;
    background: transparent;
    height: 40px;
    font-size: 18px;
    color: #fff;
    outline: none;
    font-family: DIN;

    &::-webkit-inner-spin-button {
      display: none;
    }
  }

  .suffix-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .unit {
      color: #fff;
      font-size: 16px;
      font-weight: bold;
    }

    .max-btn {
      background: #333;
      color: #fff;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
    }
  }
}

.balance-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000;
  padding: 20px;
  z-index: 100;
  border-top: 1px solid #1a1a1a;
}

.summary-info {
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #909090;

  .value {
    color: #fff;
    font-family: DIN;
    font-weight: bold;
    font-size: 16px;

    &.green {
      color: #a4f128;
    }
  }

  .dashed-underline {
    border-bottom: 1px dashed #333;
  }
}

.confirm-btn {
  width: 100%;
  height: 50px;
  background: #a4f128;
  color: #000;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
  }
}
</style>