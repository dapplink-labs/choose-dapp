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
    DistributedNode: BigInt('500000000000000000000'),//分布式节点金额
    ClusterNode: BigInt('1000000000000000000000'),//集群节点金额
  })

  // 节点卡片数据（从服务端获取，空时用默认兜底）
  const nodeProducts = ref([])
  // 防止重复请求的标志
  const isFetchingNodeProducts = ref(false)

  const fallbackNodes = computed(() => [
    {
      type: 'distributed',
      icon: isDark.value ? distributedNodeImgDark : distributedNodeImg,
      title: t('computingPower.tabs.distributed'),
      price: '500',
      badge: '',
      fee: 0.5,
      subFee: 3,
      marketShare: 10,
      descText: t('computingPower.products.distributedDescTemplate', {
        fee: 0.5,
        subFee: 3,
        marketShare: 10
      })
    },
    {
      type: 'cluster',
      icon: isDark.value ? clusterNodeImgDark : clusterNodeImg,
      title: t('computingPower.tabs.cluster'),
      price: '10000',
      badge: '',
      fee: 0.5,
      subFee: 2,
      marketShare: 5,
      descText: t('computingPower.products.clusterDescTemplate', {
        fee: 0.5,
        subFee: 2,
        marketShare: 5
      })
    }
  ])

  const displayNodes = computed(() =>
    nodeProducts.value.length > 0 ? nodeProducts.value : fallbackNodes.value
  )

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
    console.log('前往了解更多')
  }

  const handleMyNodes = () => {
    router.push('/myNode')
    console.log('查看我的节点')
  }

  const showPurchaseNode = ref(false)

  const purchaseTitle = computed(() =>
    activeNodeTab.value === 'distributed'
      ? t('computingPower.purchaseTitle.distributed')
      : t('computingPower.purchaseTitle.cluster')
  )

  // 写死的收益数据（后续有接口后替换）
  const purchaseTradeProfit = computed(() => {
    // 预估交易收益 - 写死数据
    return activeNodeTab.value === 'distributed'
      ? '100 USDT+50 MEME'
      : '2000 USDT+1000 MEME'
  })

  const purchaseFeeProfit = computed(() => {
    // 子币手续费收益 - 写死数据
    return activeNodeTab.value === 'distributed'
      ? '50 USDT+25 MEME'
      : '1000 USDT+500 MEME'
  })

  const purchaseSecondaryProfit = computed(() => {
    // 二级市场收益 - 写死数据
    return activeNodeTab.value === 'distributed'
      ? '200 USDT+100 MEME'
      : '4000 USDT+2000 MEME'
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
      ElMessage.error('请先连接钱包')
      return
    }

    const loading = ElLoading.service({ lock: true, text: '正在进行节点激活...', background: 'rgba(0, 0, 0, 0.7)' })

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
          message: `余额不足！`,
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
        loading.text = '正在请求 USDT 授权...'
        await approveToken({
          tokenAddress: usdtTokenAddress,
          spenderAddress: proxyNodeManager,
          amount: amountBigInt,
          userAddress: address.value,
          BRIDGE_MESSAGES: {
            approvalSuccess: '授权成功',
            userCancelledAuth: '你取消了授权',
            approveTokenFailed: '授权失败'
          }
        })
      }

      // 4. 执行购买
      loading.text = '正在支付并激活节点...'
      await writeContractOptimized({
        abi: nodeManagerABI,
        address: proxyNodeManager,
        functionName: 'purchaseNode',
        args: [amountBigInt],
        userAddress: address.value,
        messages: {
          success: '节点激活成功！',
          failed: '支付失败',
          rejected: '你取消了支付'
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

  // 拉取节点数据（示例，替换为真实接口）
  const fetchNodeProducts = async () => {
    // 如果正在请求中，直接返回，避免重复请求
    if (isFetchingNodeProducts.value) {
      return
    }

    isFetchingNodeProducts.value = true
    try {
      const res = await fetch('/api/node-products')
      if (!res.ok) {
        // 如果是 403 或 404，说明接口不存在或未配置，静默使用 fallback 数据
        if (res.status === 403 || res.status === 404) {
          nodeProducts.value = []
          return
        }
        throw new Error(`fetch node products failed: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      // 期望服务端字段：type/icon/title/price/badge/fee/subFee/marketShare/descText(optional)
      nodeProducts.value = Array.isArray(data)
        ? data.map((item) => {
          const type = item.type || 'distributed'
          const fee = item.fee ?? (type === 'distributed' ? 0.5 : 0.5)
          const subFee = item.subFee ?? (type === 'distributed' ? 3 : 2)
          const marketShare = item.marketShare ?? (type === 'distributed' ? 10 : 5)

          const base = {
            type,
            icon: item.icon || (type === 'distributed' ? distributedNodeImg : clusterNodeImg),
            title: item.title || (type === 'distributed'
              ? t('computingPower.tabs.distributed')
              : t('computingPower.tabs.cluster')),
            price: item.price || (type === 'distributed' ? '500' : '10000'),
            badge: item.badge || '',
            fee,
            subFee,
            marketShare
          }

          // 如果后端直接给了已拼好的多语言描述，就直接用；否则用本地 i18n 模板和动态数值生成
          if (item.descText) {
            return {
              ...base,
              descText: item.descText
            }
          }

          const templateKey = type === 'distributed'
            ? 'computingPower.products.distributedDescTemplate'
            : 'computingPower.products.clusterDescTemplate'

          return {
            ...base,
            descText: t(templateKey, { fee, subFee, marketShare })
          }
        })
        : []
    } catch (err) {
      // 网络错误或其他错误才输出警告，403/404 已在上方处理
      if (err.name !== 'TypeError' || !err.message.includes('fetch')) {
        console.warn('node products fetch failed, use fallback', err)
      }
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
    fetchNodeProducts
  }
}

