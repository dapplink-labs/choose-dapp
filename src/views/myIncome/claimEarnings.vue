<template>
  <div class="claim-earnings-page">
    <BackHeaderNav :title="$t('collectEarnings.title') || '领取收益'" />

    <div class="page-content">
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

      <div class="form-section">
        <label class="section-label">{{ $t('collectEarnings.claimAmount') || '领取数量' }}</label>
        <div class="amount-input-wrapper disabled">
          <input type="number" :value="formatAmount(amount)"  class="amount-input" />
          <div class="suffix-group">
            <span class="unit">CHO</span>
            <div class="max-btn" @click.stop="handleMax">Max</div>
          </div>
        </div>
        <div class="balance-info">
          <span class="usdt-value">≈ {{ usdtValue }} USDT</span>
          <span class="claimable-text">
            {{ $t('collectEarnings.claimable') || '可领取收益' }}: {{ selectedNode ? formatAmount(selectedNode.node_reward) :
              '--' }}
          </span>
        </div>
      </div>
    </div>

    <div class="fixed-footer">
      <div class="summary-info">
        <div class="summary-row">
          <span class="label">{{ $t('collectEarnings.youWillReceive') || '你将收到' }}</span>
          <span class="value green">{{ formatAmount(amount || 0) }} CHO</span>
        </div>
        <div class="summary-row ">
          <span class="label dashed-underline">{{ $t('collectEarnings.predictedAmount') || '我的预测金额(20%)' }}</span>
          <span class="value">{{ formatAmount(predictedAmount) }} CHO</span>
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
import { switchChain } from '@wagmi/core'
import { parseEther } from 'viem'
import { config } from '@/wagmi'
import { ElLoading } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import Message from '@/utils/message'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import NodeSelectorModal from '@/components/NodeSelectorModal.vue'
import { getNodeStakingRecords, stakingclaimReward } from '@/api/API'
import { formatDateTime } from '@/utils/format_date.js'
import { writeContractOptimized } from '@/utils/requestWEB3.js'
import { formatChoAmount, formatTokenAmount } from '@/utils/format_amount.js'
import stakingManagerABI from '@/assets/abi/stakingManagerABI.json'
import networks from '@/assets/json/networks.js'

const router = useRouter()
const { t } = useI18n()
const { address } = useAccount()
const chainId = useChainId()

// State
const nodes = ref([])
const loadingNodes = ref(false)
const showNodeSelector = ref(false)
const selectedNode = ref(null)
const amount = ref('')
// TODO: Fetch real price from API or contract. Currently hardcoded as placeholder.
const coinPrice = ref(0.05)

// Constants
const BSC_CHAIN_ID = 56
const CONTRACT_MESSAGES = {
  success: () => t('myNode.claimSuccess') || '领取成功',
  failed: () => t('myNode.claimFailed') || '领取失败',
  rejected: () => t('myNode.claimCancelled') || '用户取消'
}

const nodeTypeMap = {
  'T1': { nodeTag: 'T1', nodeNameKey: 'purchaseNodeRecord.informationNode' },
  'T2': { nodeTag: 'T2', nodeNameKey: 'myIncome.nodeNames.dataNode' },
  'T3': { nodeTag: 'T3', nodeNameKey: 'myIncome.nodeNames.validationNode' },
  'T4': { nodeTag: 'T4', nodeNameKey: 'myIncome.nodeNames.consensusNode' },
  'T5': { nodeTag: 'T5', nodeNameKey: 'myIncome.superNode' },
  'T6': { nodeTag: 'T6', nodeNameKey: 'myIncome.nodeNames.genesisNode' },
}

// Computed
const maxAmount = computed(() => {
  return selectedNode.value ? Number(selectedNode.value.node_reward) : 0
})

const predictedAmount = computed(() => {
  const val = Number(amount.value) || 0
  return val * 0.2
})

const usdtValue = computed(() => {
  const val = Number(amount.value) || 0
  // Convert CHO (6 decimals) to standard unit then multiply by price
  const choAmount = val / 1e6
  return (choAmount * coinPrice.value).toFixed(2)
})

const canClaim = computed(() => {
  return selectedNode.value && Number(amount.value) > 0
})

// Formatting
const formatAmount = (value) => {
  return formatChoAmount(value, { maxFractionDigits: 4, useGrouping: true })
}

// Methods
const handleMax = () => {
  if (selectedNode.value) {
    amount.value = selectedNode.value.node_reward
  }
}

const handleNodeSelect = (node) => {
  selectedNode.value = node
  amount.value = node.node_reward // Set amount to node reward (Wei)
}

const fetchNodeStakingRecords = async () => {
  if (!address.value) {
    nodes.value = []
    return
  }

  loadingNodes.value = true
  try {
    const res = await getNodeStakingRecords({ address: address.value })
    const list = res?.data?.data?.list || []

    if (list.length === 0) {
      nodes.value = []
      return
    }

    list.forEach(item => {
      item.name = t(nodeTypeMap[item.type]?.nodeNameKey || '')
      item.tag = nodeTypeMap[item.type]?.nodeTag || ''
      item.time = item.created ? formatDateTime(item.created) : ''
      item.orderIds = item.id
      item.node_reward = Number(item.node_reward) // Ensure number
    })

    // Calculate total reward
    const totalReward = list.reduce((sum, item) => sum + item.node_reward, 0)

    // Add "All Nodes" option if there are multiple nodes
    if (list.length > 1) {
      list.unshift({
        id: 'all',
        name: t('collectEarnings.allNodes') || '全部节点',
        tag: '',
        node_reward: totalReward,
        round: 'all',
        orderIds: list.map(n => n.id).join(',')
      })
    }

    nodes.value = list
    // Default select first one
    if (nodes.value.length > 0) {
      handleNodeSelect(nodes.value[0])
    }

  } catch (error) {
    console.error('Failed to fetch node records:', error)
    nodes.value = []
  } finally {
    loadingNodes.value = false
  }
}

const validateSelection = () => {
  if (!address.value) {
    Message.error(t('myNode.connectWalletFirst') || '请先连接钱包')
    return false
  }
  if (!selectedNode.value || !selectedNode.value.orderIds) {
    Message.error('没有可领取的收益')
    return false
  }
  return true
}

const switchToBSC = async (loading) => {
  if (Number(chainId.value) !== BSC_CHAIN_ID) {
    loading.text = '切换网络中...'
    await switchChain(config, { chainId: BSC_CHAIN_ID })
    await new Promise(r => setTimeout(r, 1000))
  }
}

const callClaimRewardContract = async (round, loading) => {
  const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
  if (!bscNet?.proxyStakingManager) {
    throw new Error('未找到 StakingManager 合约地址')
  }

  loading.text = '调用合约中...'

  const result = await writeContractOptimized({
    abi: stakingManagerABI,
    address: bscNet.proxyStakingManager,
    functionName: round === 'all' ? '_liquidityProviderClaimRewardBatch' : 'liquidityProviderClaimReward',
    args: round === 'all' ? [] : [BigInt(round)], // Use round ID or empty for batch
    userAddress: address.value,
    messages: CONTRACT_MESSAGES,
    showErrorToast: false
  })

  if (!result.success || !result.hash) {
    throw new Error('合约调用失败')
  }
  return result.hash
}

const submitRewardData = async (txHash, selectedOption, loading) => {
  loading.text = '提交数据中...'

  const requestData = {
    user_address: address.value,
    request_tx_hash: txHash,
    round: String(selectedOption.round),
    raw_amount_token: String(selectedOption.node_reward) // Send the claimed amount (Wei)
  }
  const res = await stakingclaimReward(requestData)
  console.log(res)
}

const handleError = (error) => {
  console.error('领取收益失败:', error)
  const isUserCancelled = error.message?.includes('用户取消') || error.message?.includes('User rejected')
  if (!isUserCancelled) {
    Message.error(error.message || CONTRACT_MESSAGES.failed())
  }
}

const handleConfirm = async () => {
  if (!selectedNode.value) return
  if (selectedNode.value.round === -1) {
    Message.warning(t('myNode.nodeActivatingTryLater'))
    return
  }

  if (Number(amount.value) <= 0) {
    Message.warning(t('myNode.noIncome'))
    return
  }

  if (!validateSelection()) return

  const loading = ElLoading.service({
    lock: true,
    text: t('common.loading') || '处理中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    await switchToBSC(loading)
    // Call contract
    const txHash = await callClaimRewardContract(selectedNode.value.round, loading)

    // Submit data to backend
    if (selectedNode.value.id === 'all') {
      // Loop through all individual nodes (skip the first "All" option)
      const individualNodes = nodes.value.filter(n => n.id !== 'all')
      for (const node of individualNodes) {
        await submitRewardData(txHash, node, loading)
      }
    } else {
      await submitRewardData(txHash, selectedNode.value, loading)
    }

    Message.success(CONTRACT_MESSAGES.success())
    router.back() // Go back after success
  } catch (error) {
    handleError(error)
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
  background-color: var(--bg-color-010101, #010101);
  display: flex;
  flex-direction: column;
  padding-bottom: 120px; // Space for fixed footer
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
  color: var(--text-color-tabBtn, #999999);
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 16px;
}

.node-selector-trigger {
  background: var(--bg-color-010101, #010101);
  border-radius: 8px 8px 8px 8px;
  border: 1px solid #2F2F2F;
  padding: 14px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    opacity: 0.8;
  }

  span {
    font-size: 16px;
    color: var(--text-color, #000);

    &.placeholder {
      color: #999;
    }
  }

  .arrow-icon {
    font-size: 16px;
    color: #999;
  }
}

.amount-input-wrapper {
  background: var(--bg-color-010101, #010101);
  border-radius: 12px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  border-radius: 8px 8px 8px 8px;
  border: 1px solid #23262F;
  transition: border-color 0.3s;

  &:focus-within {
    border-color: #FFFFFF;
  }

  // &.disabled {
  //   background: rgba(255, 255, 255, 0.1);
  //   border-color: #444;

  //   .amount-input {
  //     color: #999;
  //     cursor: not-allowed;
  //   }
  // }

  .amount-input {
    flex: 1;
    border: none;
    background: transparent;
    height: 40px;
    font-size: 16px;
    color: var(--text-color, #fff); // Assuming dark theme default
    outline: none;

    &::placeholder {
      color: #666;
    }
  }

  .suffix-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .unit {
      color: #fff;
      font-size: 16px;
    }

    .max-btn {
      background: #333;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
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
  background: var(--bg-card-color, #000);
  padding: 20px;
  z-index: 100;
}

.summary-info {
  margin-bottom: 27px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 400;
  font-size: 14px;
  color: #909090;

  .value {
    color: #fff;
    font-family: DIN, DIN;
    font-weight: bold;
    font-size: 16px;

    &.green {
      color: #a4f128; // Lime green from image
      // font-size: 18px;
    }
  }

  .dashed-underline {
    border-bottom: 1px dashed #333;
    padding-bottom: 4px;
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
    color: #fff;
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Dark theme adjustments mostly</style>
