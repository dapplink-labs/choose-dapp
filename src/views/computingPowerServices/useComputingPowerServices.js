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
import { getNodeServiceProviders } from '@/api/API'

export function useComputingPowerServices() {
  const router = useRouter()
  const { t } = useI18n()
  const { isDark } = useThemeStore()
  const { address } = useAccount()
  const chainId = useChainId()
  // BSC 主网chainId
  const BSC_CHAIN_ID = 56


  // 激活提示头像（复用集群节点插图）
  const activationAvatar = clusterNodeImg

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

  // 激活提示文案
  const activationAddress = ref('0xb574...4c7d')
  const activationMsg = computed(() =>
    t('computingPower.activationMsg', {
      address: activationAddress.value,
      nodeType: t('computingPower.tabs.cluster')
    })
  )

  // 将激活消息拆分成部分，以便地址部分可以加粗
  const activationMsgParts = computed(() => {
    const msg = activationMsg.value
    const addr = activationAddress.value
    const parts = []

    // 查找地址在消息中的位置
    const addressIndex = msg.indexOf(addr)

    if (addressIndex === -1) {
      // 如果找不到地址，直接返回整个消息
      return [{ text: msg, isAddress: false }]
    }

    // 地址前的文本
    if (addressIndex > 0) {
      parts.push({ text: msg.substring(0, addressIndex), isAddress: false })
    }

    // 地址部分
    parts.push({ text: addr, isAddress: true })

    // 地址后的文本
    const afterIndex = addressIndex + addr.length
    if (afterIndex < msg.length) {
      parts.push({ text: msg.substring(afterIndex), isAddress: false })
    }

    return parts
  })

  const handleOpenMore = () => {
    // 预留「了解更多」跳转逻辑
  }

  const handleMyNodes = () => {
    router.push('/myNode')
  }

  const showPurchaseNode = ref(false)

  const purchaseTitle = computed(() =>
    activeNodeTab.value === 'distributed'
      ? t('computingPower.tabs.distributed')
      : t('computingPower.tabs.cluster')
  )

  // 使用 nodeProducts 中的真实收益数据（百分比格式）
  const purchaseTradeProfit = computed(() => {
    // 预估交易收益 - 使用 fee_reward（百分比）
    const currentNode = nodeProducts.value.find(node => node.type === activeNodeTab.value)
    if (!currentNode || currentNode.fee == null) {
      return activeNodeTab.value === 'distributed'
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
      return activeNodeTab.value === 'distributed'
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
      return activeNodeTab.value === 'distributed'
        ? '10%'
        : '5%'
    }
    // 格式化：market_reward 作为百分比显示
    const percent = Number(currentNode.marketShare)
    return `${percent}%`
  })

  const purchaseWalletBalance = ref('200000 USDT') // 写死的钱包余额
  // mock数据END

  // 打开购买节点弹窗
  const handleBuy = (type) => {
    activeNodeTab.value = type
    showPurchaseNode.value = true
  }


  // 获取节点价格
  const getNodePrice = async () => {
    const obj = {
      DistributedNode: 0, // 默认 500 USDT (18 decimals)
      ClusterNode: 0    // 默认 10000 USDT (18 decimals)
    }

    try {
      const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
      if (!bscNet?.proxyNodeManager) return obj

      // 这里假设合约中有查询价格的方法，或者通过购买函数的模拟调用获取
      // 如果合约没有直接查价方法，请确保 functionName 对应正确的 view 函数
      const [p1, p2] = await Promise.all([
        readContract(config, {
          address: bscNet.proxyNodeManager,
          abi: nodeManagerABI,
          functionName: 'buyClusterNode', // 请确认 ABI 里的查价函数名
        }),
        readContract(config, {
          address: bscNet.proxyNodeManager,
          abi: nodeManagerABI,
          functionName: 'buyDistributedNode', // 请确认 ABI 里的查价函数名
        })
      ])

      obj.DistributedNode = safeBigInt(p1)
      obj.ClusterNode = safeBigInt(p2)
    } catch (e) {
      console.warn('Fetch price failed, using defaults', e)
    }
    return obj
  }

  const handleConfirmBuy = async () => {
    if (!address.value) {
      ElMessage.error(t('computingPower.connectWalletFirst'))
      return
    }

    const loading = ElLoading.service({ lock: true, text: t('computingPower.activatingNode'), background: 'rgba(0, 0, 0, 0.7)' })

    try {
      // 1. 网络环境检查 (BSC 56)
      if (Number(chainId.value) !== BSC_CHAIN_ID) {
        await switchChain(config, { chainId: BSC_CHAIN_ID })
        await new Promise(r => setTimeout(r, 1000))
      }

      const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
      const { proxyNodeManager, usdtTokenAddress } = bscNet

      // 2. 确定本次交易需要的金额
      const priceKey = activeNodeTab.value === 'distributed' ? 'DistributedNode' : 'ClusterNode'
      let amountBigInt = nodePriceObj.value[priceKey]

      if (amountBigInt <= BigInt(0)) {
        const latest = await getNodePrice()
        amountBigInt = latest[priceKey]
      }

      // ============ 余额检查 ============
      console.log('🔍 Checking balance...')
      const userBalance = await getUserTokenBalance(usdtTokenAddress, address.value)

      console.log('userBalance', userBalance)
      console.log('amountBigInt', amountBigInt)

      if (userBalance < amountBigInt) {
        // 如果余额不足，直接报错并停止执行
        ElMessage({
          message: t('computingPower.insufficientBalance'),
          type: 'error',
          duration: 5000,
          showClose: true
        })
        loading.close() // 关闭加载状态
        return // 停止后续的授权和购买逻辑
      }
      // ==========================================

      // 3. 检查授权 (只有余额充足才会走到这一步)
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
      await writeContractOptimized({
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

      showPurchaseNode.value = false
    } catch (error) {
      console.error('Purchase flow failed:', error)
      // 错误已由工具函数内的 ElMessage 处理
    } finally {
      loading.close()
    }
  }

  // 拉取节点数据 - 使用真实接口
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
          type: item.node_type === 1 ? 'distributed' : 'cluster', // 1: 分布式, 2: 集群
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
  }

  onMounted(async () => {
    fetchNodeProducts()
  })

  // 保留当前选中节点图（弹窗可能复用）
  const currentNodeImg = computed(() =>
    activeNodeTab.value === 'distributed' ? distributedNodeImg : clusterNodeImg
  )

  // 判断按钮是否可点击：只有当两个节点的 is_active 都为 1 时，按钮才可点击
  const isButtonEnabled = computed(() => {
    const distributedNode = nodeProducts.value.find(node => node.type === 'distributed')
    const clusterNode = nodeProducts.value.find(node => node.type === 'cluster')

    // 如果两个节点都存在且 is_active 都为 1，则按钮可点击
    if (distributedNode && clusterNode) {
      return distributedNode.is_active === 1 && clusterNode.is_active === 1
    }

    // 如果节点数据不完整，默认不可点击
    return false
  })

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

  // 判断单个节点的按钮是否可点击（基于全局状态）
  const isNodeButtonEnabled = (nodeType) => {
    return isButtonEnabled.value
  }

  return {
    // 响应式数据
    activationAvatar,
    activeNodeTab,
    nodeProducts,
    displayNodes,
    activationAddress,
    activationMsg,
    activationMsgParts,
    showPurchaseNode,
    purchaseTitle,
    purchaseTradeProfit,
    purchaseFeeProfit,
    purchaseSecondaryProfit,
    purchaseWalletBalance,
    currentNodeImg,
    // 方法
    handleOpenMore,
    handleMyNodes,
    handleBuy,
    handleConfirmBuy,
    fetchNodeProducts,
    isButtonEnabled,
    getButtonText,
    isNodeButtonEnabled
  }
}

