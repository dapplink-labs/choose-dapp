import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import distributedNodeImg from '@/assets/icon/DistributedNode.png'
import distributedNodeImgDark from '@/assets/icon/DistributedNodeDark.png'
import clusterNodeImgDark from '@/assets/icon/ClusterNode.png'
import clusterNodeImg from '@/assets/icon/11.png'
import { useThemeStore } from '@/stores/theme'
import { useAccount, useChainId } from '@wagmi/vue'
import { writeContract, waitForTransactionReceipt, readContract, switchChain } from '@wagmi/core'
import { ElMessage, ElLoading } from 'element-plus'
import erc20ABI from '@/assets/abi/erc20ABI.json'
import nodeManagerABI from '@/assets/abi/nodeManagerABI.json'
import networks from '@/assets/json/networks.json'
import { computedGas, checkAllowance, approveToken } from '@/views/bridge/bridgeCore.js'
import { formatUnits, parseUnits } from 'viem'
import { config } from '../../wagmi'

export function useComputingPowerServices() {
  const router = useRouter()
  const { t } = useI18n()
  const { isDark } = useThemeStore()
  const { address } = useAccount()
  const chainId = useChainId()
  // 当前链id
  const currentChainId = Number(chainId.value)
  // BSC 主网chainId
  const BSC_CHAIN_ID = 56


  // 激活提示头像（复用集群节点插图）
  const activationAvatar = clusterNodeImg

  // 节点 TAB 状态（用于弹窗标题）
  const activeNodeTab = ref('distributed')

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


  // 打开loading弹窗
  const openLoading = () => {
    ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)',
      customClass: 'custom-loading'
    })
  }

  /**
 * 检查是否为用户拒绝错误
 */
  const isUserRejectedError = (error, message) => {
    if (message) {
      ElMessage({
        message: message,
        type: 'warning',
        duration: 4000
      })
    }
    return (
      error.info?.error?.code === 4001 ||
      error.code === 4001 ||
      error.message?.includes('User rejected') ||
      error.message?.includes('user rejected') ||
      error.message?.includes('User denied') ||
      error.message?.includes('cancelled')
    )
  }

  /**
   * 检查 USDT 授权额度
   */
  const checkAllowance = async (tokenAddress, ownerAddress, spenderAddress) => {
    try {
      // readContract 方法用于读取区块链上的合约数据
      // 这里调用 ERC20 合约的 allowance 方法来获取授权额度
      const allowanceResult = await readContract(config, {
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'allowance',// ERC20 标准的 allowance 方法
        args: [ownerAddress, spenderAddress]
      })
      // 返回授权额度，确保是 BigInt 类型
      return BigInt(allowanceResult || 0)
    } catch (error) {
      console.error('Failed to check allowance:', error)
      return BigInt(0)
    }
  }

  /**
 * 安全的 BigInt 转换函数
 */
  function safeBigInt(value) {
    // 如果当前传入的amount金额已经是bigint类型，则直接返回
    if (typeof value === 'bigint') return value
    // 如果当前传入的金额为字符串或者数值类型，则尝试转换为bigint类型
    if (typeof value === 'string' || typeof value === 'number') {
      try {
        return BigInt(value)
      } catch (error) {
        throw new Error(`Invalid amount format: ${value}`)
      }
    }
    throw new Error(`Unsupported amount type: ${typeof value}`)
  }

  // 确认购买节点
  const handleConfirmBuy = async () => {

    try {
      // 1. 检查钱包连接
      if (!address.value) {
        ElMessage.error('请先连接钱包')
        return
      }
      // 打开加载弹窗
      openLoading()

      // 2. 如果当前不是 BSC 主网，尝试切换
      if (currentChainId !== BSC_CHAIN_ID) {
        ElMessage({
          message: `当前网络不是 BSC 主网，正在切换到 BSC 主网（chainId: ${BSC_CHAIN_ID}）...`,
          type: 'warning',
          duration: 3000
        })
        // 切换到 BSC 主网
        await switchChain(config, { chainId: BSC_CHAIN_ID })

        // 等待网络切换完成
        await new Promise((resolve) => setTimeout(() => resolve(), 1000))

        // 验证切换是否成功
        const newChainId = Number(chainId.value)
        if (newChainId !== BSC_CHAIN_ID) throw new Error('网络切换失败，请手动切换到 BSC 主网')

        ElMessage({
          message: '已成功切换到 BSC 主网',
          type: 'success',
          duration: 2000
        })
      }

      // 3. 获取 BSC 主网配置
      const currentChain = networks.find((n) => Number(n.chainId) === BSC_CHAIN_ID)

      if (!currentChain) {
        ElMessage.error('未找到 BSC 主网配置，请检查网络连接')
        return
      }


      // 交易START
      const proxyNodeManager = currentChain.proxyNodeManager // 节点管理合约地址
      const usdtTokenAddress = currentChain.usdtTokenAddress // USDT 代币合约地址

      // ========== 步骤 1: 读取 USDT 的 decimals ==========
      let usdtDecimals = Number(18) 
      // const decimals = await readContract(config, {
      //   address: usdtTokenAddress,
      //   abi: erc20ABI,
      //   functionName: 'decimals',
      //   chainId: BSC_CHAIN_ID
      // })
      // usdtDecimals = Number(decimals)
      // console.log('USDT decimals:', usdtDecimals)

      // ========== 步骤 2: 从合约读取节点价格（后续有接口后替换为接口数据） ==========
      let nodePrice
      // 读取节点价格
      // const price = await readContract(config, {
      //   address: proxyNodeManager,
      //   abi: nodeManagerABI,
      //   functionName: activeNodeTab.value === 'distributed' ? 'buyDistributedNode' : 'buyClusterNode',
      //   chainId: BSC_CHAIN_ID
      // })
      // nodePrice = safeBigInt(price.toString())
      // console.log('从合约读取的节点价格:', nodePrice.toString())

      const fixedAmount = activeNodeTab.value === 'distributed' ? '500' : '10000'
      nodePrice = parseUnits(fixedAmount, usdtDecimals)

      const amountBigInt = nodePrice
      console.log('最终使用的金额:', amountBigInt.toString())

      // ========== 步骤 3: 读取 USDT 余额 ==========
      const usdtBalance = await checkAllowance(usdtTokenAddress, address.value, proxyNodeManager)
      console.log(usdtBalance)
      ElLoading.service().close()
      return


      const balanceDisplay = formatUnits(usdtBalance, usdtDecimals)
      const amountDisplay = formatUnits(amountBigInt, usdtDecimals)

      console.log('========== 余额计算结果 ==========')
      console.log('USDT 余额 (BigInt/wei):', usdtBalance.toString())
      console.log('USDT 余额 (显示):', balanceDisplay)
      console.log('需要金额 (BigInt/wei):', amountBigInt.toString())
      console.log('需要金额 (显示):', amountDisplay)
      console.log('USDT decimals:', usdtDecimals)
      console.log('===================================')

      // 如果余额为 0，给出提示
      if (balanceBigInt === 0n) {
        console.warn('⚠️ 警告：查询到的余额为 0')
        console.warn('请确认：')
        console.warn('1. 您的钱包地址是否正确:', address.value)
        console.warn('2. 您持有的 USDT 合约地址是否为:', usdtTokenAddress)
        console.warn('3. 您是否在 BSC 主网上（chainId: 56）')
        console.warn('4. 标准 BSC USDT 地址为: 0x55d398326f99059fF775485246999027B3197955')
        console.warn('   当前使用的地址为:', usdtTokenAddress)
      }

      if (balanceBigInt < amountBigInt) {
        ElMessage.error(`USDT 余额不足！当前余额: ${balanceDisplay} USDT，需要: ${amountDisplay} USDT`)
        return
      }

      // ========== 步骤 2: 使用 bridgeCore 中的方法检查并授权 USDT 给 proxyNodeManager ==========

      // 先检查当前授权额度
      const allowanceBigInt = await checkAllowance(
        usdtTokenAddress,
        address.value,
        proxyNodeManager
      )
      console.log('当前授权额度:', allowanceBigInt.toString(), '需要额度:', amountBigInt.toString())

      if (allowanceBigInt < amountBigInt) {
        ElMessage({
          message: '正在授权 USDT...',
          type: 'info',
          duration: 2000
        })

        try {
          // 复用桥接模块中的授权逻辑（包含 gas 预估与错误提示）
          await approveToken({
            tokenAddress: usdtTokenAddress,
            spenderAddress: proxyNodeManager,
            amount: amountBigInt,
            userAddress: address.value,
            useExactApproval: true,
            BRIDGE_MESSAGES: {
              approvalSuccess: 'USDT 授权成功',
              userCancelledAuth: '用户取消了授权',
              approveTokenFailed: 'USDT 授权失败：'
            }
          })
        } catch (approveError) {
          console.error('USDT 授权失败:', approveError)
          ElMessage.error(approveError?.message || 'USDT 授权失败，请重试')
          return
        }
      } else {
        console.log('当前授权额度已足够，无需重新授权')
      }

      // ========== 步骤 3: 使用 bridgeCore 的 gas 预估方法调用 purchaseNode 激活节点 ==========

      ElMessage({
        message: '正在激活节点...',
        type: 'info',
        duration: 2000
      })

      try {
        // 先预估 purchaseNode 所需的 gas（内部会自动处理失败并给出兜底值）
        const gasEstimate = await computedGas(
          nodeManagerABI,
          'purchaseNode',
          [amountBigInt],
          proxyNodeManager,
          address.value
        )

        // 发起交易，带上预估 gas 与费用配置
        const purchaseHash = await writeContract(config, {
          address: proxyNodeManager,
          abi: nodeManagerABI,
          functionName: 'purchaseNode',
          args: [amountBigInt],
          chainId: BSC_CHAIN_ID,
          gas: gasEstimate.gas,
          maxFeePerGas: gasEstimate.maxFeePerGas,
          maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas
        })

        console.log('交易哈希:', purchaseHash)

        // 等待交易确认
        const purchaseReceipt = await waitForTransactionReceipt(config, {
          hash: purchaseHash
        })

        // 检查交易状态
        if (purchaseReceipt.status === 'success') {
          ElMessage({
            message: '节点激活成功！',
            type: 'success',
            duration: 3000
          })

          // 关闭弹窗
          showPurchaseNode.value = false
        } else {
          ElMessage.error('节点激活交易失败')
        }
      } catch (purchaseError) {
        console.error('激活节点失败:', purchaseError)
        // 提供更详细的错误信息
        const err = purchaseError || {}
        if (err.message?.includes('reverted') || err.message?.includes('execution reverted')) {
          ElMessage.error('合约执行失败。请检查：1) USDT 余额是否充足 2) 是否已正确授权 3) 节点价格是否正确')
        } else if (err.code === 4001 || err.message?.includes('User rejected')) {
          ElMessage({
            message: '用户取消了交易',
            type: 'warning',
            duration: 2000
          })
        } else {
          ElMessage.error(purchaseError?.message || '激活节点失败，请重试')
        }
        throw purchaseError
      }

      // 关闭加载弹窗
      ElLoading.service().close()

    } catch (error) {
      // 关闭加载弹窗
      ElLoading.service().close()
      console.error('激活节点失败:', error)

      const err = error || {}

      // 处理用户拒绝错误
      if (err.code === 4001 ||
        err.message?.includes('User rejected') ||
        err.message?.includes('user rejected') ||
        err.message?.includes('User denied')) {
        ElMessage({
          message: '用户取消了交易',
          type: 'warning',
          duration: 2000
        })
      } else if (err.message?.includes('reverted') || err.message?.includes('execution reverted')) {
        // 合约执行被 revert
        const errorSignature = err.data?.errorName || err.data?.signature || 'unknown'
        console.error('合约执行被 revert，错误签名:', errorSignature)
        console.error('合约地址:', err.data?.address || 'unknown')
        console.error('函数名:', err.data?.functionName || 'unknown')
        ElMessage.error(`合约执行失败：${err.message || '未知错误'}。请检查：1) USDT 余额是否充足 2) 是否已正确授权 3) 金额是否正确`)
      } else {
        ElMessage.error(err.message || '激活节点失败，请重试')
      }
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

  onMounted(fetchNodeProducts)

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

