import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import distributedNodeImg from '@/assets/icon/DistributedNode.png'
import distributedNodeImgDark from '@/assets/icon/DistributedNodeDark.png'
import clusterNodeImgDark from '@/assets/icon/ClusterNode.png'
import clusterNodeImg from '@/assets/icon/11.png'
import { useThemeStore } from '@/stores/theme'
import { useAccount, useChainId } from '@wagmi/vue'
import { readContract, switchChain } from '@wagmi/core'
import { ElMessage, ElLoading } from 'element-plus'
import nodeManagerABI from '@/assets/abi/nodeManagerABI.json'
import networks from '@/assets/json/networks.json'
import { checkAllowance, approveToken, writeContractOptimized, safeBigInt, getUserTokenBalance } from '@/utils/requestWEB3.js'
import { config } from '../../wagmi.ts'
import { getNodeServiceProviders, purchaseNode } from '@/api/API'
import { eventBus } from '@/utils/eventBus'

export function useComputingPowerServices() {
  const router = useRouter()
  const { t } = useI18n()
  const { isDark } = useThemeStore()
  const { address } = useAccount()
  const chainId = useChainId()
  // BSC 主网chainId
  const BSC_CHAIN_ID = 56


  // 节点 TAB 状态（用于弹窗标题）
  const activeNodeTab = ref('distributed')

  // 节点金额，单位为 wei
  const nodePriceObj = ref({
    DistributedNode: BigInt('0'),//分布式节点金额
    ClusterNode: BigInt('0'),//集群节点金额
  })

  // 节点卡片数据
  const nodeProducts = ref([])
  // 防止重复请求的标志
  const isFetchingNodeProducts = ref(false)

  // 直接使用接口数据，不再使用硬编码的 fallback
  const displayNodes = computed(() => nodeProducts.value)

  const handleOpenMore = () => {
    // 预留「了解更多」跳转逻辑
  }

  const handleMyNodes = () => {
    // 查找 is_active 为 3 的节点（已购买/已激活）
    const activeNode = nodeProducts.value.find((node) => node.is_active === 3)

    if (!activeNode) {
      // 如果没有已激活的节点，则不跳转并提示
      ElMessage.warning(t('common.noData'))
      return
    }

    // 跳转到 myNode 页面，并传递已激活节点的 id
    router.push({
      path: '/myNode',
      query: {
        id: activeNode.id ?? ''
      }
    })
  }

  const showPurchaseNode = ref(false)

  const purchaseTitle = computed(() =>
    activeNodeTab.value === 1
      ? t('computingPower.tabs.distributed')
      : t('computingPower.tabs.cluster')
  )

  // 使用 nodeProducts 中的真实收益数据（百分比格式）
  const purchaseTradeProfit = computed(() => {
    // 预估交易收益 - 使用 fee_reward（百分比）
    const currentNode = nodeProducts.value.find(node => node.type === activeNodeTab.value)
    if (!currentNode || currentNode.fee == null) {
      return activeNodeTab.value === 1
        ? '0.5%'
        : '0.5%'
    }
    // 格式化：fee_reward 作为百分比显示
    const percent = Number(currentNode.fee)
    return `${percent}%`
  })

  const purchaseFeeProfit = computed(() => {
    // 子币手续费收益 - 使用 sub_coin_reward（百分比）
    const currentNode = nodeProducts.value.find(node => node.type === activeNodeTab.value)
    if (!currentNode || currentNode.subFee == null) {
      return activeNodeTab.value === 1
        ? '3%'
        : '2%'
    }
    // 格式化：sub_coin_reward 作为百分比显示
    const percent = Number(currentNode.subFee)
    return `${percent}%`
  })

  const purchaseSecondaryProfit = computed(() => {
    // 二级市场收益 - 使用 market_reward（百分比）
    const currentNode = nodeProducts.value.find(node => node.type === activeNodeTab.value)
    if (!currentNode || currentNode.marketShare == null) {
      return activeNodeTab.value === 1
        ? '10%'
        : '5%'
    }
    // 格式化：market_reward 作为百分比显示
    const percent = Number(currentNode.marketShare)
    return `${percent}%`
  })
  // mock数据END

  // 打开购买节点弹窗
  const handleBuy = (type) => {
    activeNodeTab.value = type
    showPurchaseNode.value = true
  }


  // 获取节点价格
  const getNodePrice = async () => {
    const obj = {
      DistributedNode: 0, // 分布式 500 USDT (18 decimals)
      ClusterNode: 0    // 集群 10000 USDT (18 decimals)
    }

    const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
    if (!bscNet?.proxyNodeManager) return obj
    obj.DistributedNode = await readContract(config, {
      address: bscNet.proxyNodeManager,
      abi: nodeManagerABI,
      functionName: 'buyDistributedNode',
    })
    obj.ClusterNode = await readContract(config, {
      address: bscNet.proxyNodeManager,
      abi: nodeManagerABI,
      functionName: 'buyClusterNode',
    })
    return obj
  }

  // 确认购买节点
  const handleConfirmBuy = async () => {
    if (!address.value) {
      ElMessage.error(t('computingPower.connectWalletFirst'))
      return
    }

    const loading = ElLoading.service({ lock: true, text: t('computingPower.activatingNode'), background: 'rgba(0, 0, 0, 0.7)' })

    // 1. 网络环境检查 (BSC 56)
    if (Number(chainId.value) !== BSC_CHAIN_ID) {
      await switchChain(config, { chainId: BSC_CHAIN_ID })
      await new Promise(r => setTimeout(r, 1000))
    }

    const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
    const { proxyNodeManager, usdtTokenAddress } = bscNet

    // 检查当前用户是否绑定邀请码
    const inviter = await readContract(config, {
      address: bscNet.proxyNodeManager,
      abi: nodeManagerABI,
      functionName: 'inviters',
      args: [address.value]
    })
    if (inviter == '0x0000000000000000000000000000000000000000') {
      ElMessage.warning(t('请先绑定邀请码'))
      eventBus.emit('showInvite', true)
      loading.close()
      return
    }

    // 2. 确定本次交易需要的金额
    const latest = await getNodePrice()
    let amountBigInt = activeNodeTab.value === 1 ? latest.DistributedNode : latest.ClusterNode
    let nodeId = nodeProducts.value.find(node => node.type == activeNodeTab.value)?.id;

    // ============ 余额检查 ============
    const userBalance = await getUserTokenBalance(usdtTokenAddress, address.value, 'balanceOf')

    if (userBalance < amountBigInt) {
      loading.close()
      // 如果余额不足，直接报错并停止执行
      ElMessage({
        message: t('computingPower.insufficientBalance'),
        type: 'error',
        duration: 5000,
        showClose: true
      })
      return
    }

    // 3. 检查授权 余额充足
    const allowance = await checkAllowance(usdtTokenAddress, address.value, proxyNodeManager)
    if (allowance === BigInt(0) || allowance < amountBigInt) {
      loading.text = t('computingPower.requestingAuth')
      await approveToken({
        tokenAddress: usdtTokenAddress,
        spenderAddress: proxyNodeManager,
        amount: amountBigInt,
        userAddress: address.value,
        BRIDGE_MESSAGES: {
          approvalSuccess: t('bridge.approvalSuccess'),
          userCancelledAuth: t('bridge.userCancelledAuth'),
          approveTokenFailed: t('bridge.approveTokenFailed')
        }
      })
    }

    // 4. 执行购买
    loading.text = t('computingPower.payingAndActivating')
    const result = await writeContractOptimized({
      abi: nodeManagerABI,
      address: proxyNodeManager,
      functionName: 'purchaseNode',
      args: [amountBigInt],
      userAddress: address.value,
      messages: {
        success: t('computingPower.nodeActivationSuccess'),
        failed: t('computingPower.paymentFailed'),
        rejected: t('computingPower.paymentCancelled')
      }
    })
    console.log('result', result)
    console.log('购买节点参数：', {
      address: address.value,
      node_id: nodeId,
      hash: result.hash,
    })

    // 调用接口记录购买节点
    const res = await purchaseNode({
      address: address.value,
      node_id: nodeId,
      hash: result.hash,
    })

    showPurchaseNode.value = false
    await fetchNodeProducts()
    loading.close()
  }

  // 拉取节点数据 
  const fetchNodeProducts = async () => {
    // 如果正在请求中，直接返回，避免重复请求
    if (isFetchingNodeProducts.value) {
      return
    }

    isFetchingNodeProducts.value = true
    try {
      const res = await getNodeServiceProviders({ address: address.value })

      const responseData = res?.data || res
      const list = responseData?.data?.list || responseData?.list || []

      if (!Array.isArray(list) || list.length === 0) {
        nodeProducts.value = []
        return
      }
      // 接口返回字段: id, name, fee_reward, sub_coin_reward, market_reward, status 等
      nodeProducts.value = list.map((item) => {
        // node_type: 1: 分布式, 2: 集群
        const templateKey = item.node_type === 1
          ? 'computingPower.products.distributedDescTemplate'
          : 'computingPower.products.clusterDescTemplate'

        return {
          id: item.id,
          type: item.node_type, // 1: 分布式, 2: 集群
          icon: item.icon || (item.node_type === 1
            ? (isDark.value ? distributedNodeImgDark : distributedNodeImg)
            : (isDark.value ? clusterNodeImgDark : clusterNodeImg)),
          title: item.name || (item.node_type === 1
            ? t('computingPower.tabs.distributed')
            : t('computingPower.tabs.cluster')),
          price: item.price || (item.node_type === 1 ? '500' : '10000'),
          fee: item.fee_reward || 0,
          subFee: item.sub_coin_reward || 0,
          marketShare: item.market_reward || 0,
          is_active: item.is_active || 1,
          descText: t(templateKey, { fee: item.fee_reward, subFee: item.sub_coin_reward, marketShare: item.market_reward })
        }
      })
    } catch (err) {
      ElMessage.error(t('computingPower.fetchNodeDataFailed'))
      nodeProducts.value = []
    } finally {
      isFetchingNodeProducts.value = false
    }
    console.log('list：', nodeProducts.value)
  }

  onMounted(async () => {
    fetchNodeProducts()
  })

  // 保留当前选中节点图（弹窗可能复用）
  const currentNodeImg = computed(() =>
    activeNodeTab.value === 1 ? distributedNodeImg : clusterNodeImg
  )

  // 判断按钮是否显示
  const isNodeButtonVisible = (nodeType) => {
    const currentNode = nodeProducts.value.find(node => node.type === nodeType)
    const otherNode = nodeProducts.value.find(node => node.type !== nodeType)

    if (!currentNode) {
      return false
    }

    // 如果当前节点的 is_active 不为 1（2 或 3），显示按钮
    if (currentNode.is_active !== 1) {
      return true
    }

    // 如果当前节点的 is_active 为 1，检查另一个节点
    // 如果另一个节点不存在，显示按钮
    if (!otherNode) {
      return true
    }

    // 如果另一个节点的 is_active 不为 1，隐藏当前节点的按钮
    if (otherNode.is_active !== 1) {
      return false
    }

    // 如果两个节点的 is_active 都为 1，显示按钮
    return true
  }

  // 判断单个节点的按钮是否可点击
  // 只有当两个节点的 is_active 都为 1 时，按钮才可点击
  const isNodeButtonEnabled = (nodeType) => {
    // 如果两个节点都存在且 is_active 都为 1，则按钮可点击
    if (nodeProducts?.value?.length >= 2) {
      return nodeProducts.value.every(node => node.is_active === 1)
    }
    // 如果节点数据不完整，默认不可点击
    return false
  }

  // 获取按钮文字
  const getButtonText = (nodeType) => {
    const node = nodeProducts.value.find(n => n.type === nodeType)
    if (!node) {
      return t('computingPower.activateBtn')
    }

    const isActive = node.is_active
    if (isActive === 1) {
      return t('computingPower.activateBtn')
    } else if (isActive === 2) {
      return t('computingPower.activating')
    } else if (isActive === 3) {
      return t('computingPower.purchased')
    }

    return t('computingPower.activateBtn')
  }

  return {
    // 响应式数据
    activeNodeTab,
    nodeProducts,
    displayNodes,
    showPurchaseNode,
    purchaseTitle,
    purchaseTradeProfit,
    purchaseFeeProfit,
    purchaseSecondaryProfit,
    currentNodeImg,
    // 方法
    handleOpenMore,
    handleMyNodes,
    handleBuy,
    handleConfirmBuy,
    fetchNodeProducts,
    getButtonText,
    isNodeButtonEnabled,
    isNodeButtonVisible
  }
}

