import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import clusterNodeImg from '@/assets/icon/ClusterNode.png'
import DistributedNode from '@/assets/icon/DistributedNode.png'
import stakingManagerABI from '@/assets/abi/stakingManagerABI.json'
import { switchChain } from '@wagmi/core'
import { ElMessage, ElLoading } from 'element-plus'
import { writeContractOptimized } from '@/utils/requestWEB3.js'
import networks from '@/assets/json/networks.json'
import { config } from '../../wagmi.ts'
import { useChainId, useAccount } from '@wagmi/vue'
import { getUserTokenBalance, approveToken, checkAllowance } from '@/utils/requestWEB3.js'
import { parseUnits } from 'viem'
import { getNodeStakingList } from '@/api/API'

export const useLPVault = () => {
  const router = useRouter()
  const { t } = useI18n()
  const chainId = useChainId()
  const BSC_CHAIN_ID = 56
  const { address } = useAccount()

  const activationAvatar = clusterNodeImg
  const activationAddress = ref('0xb574...4c7d')
  const activationMsg = computed(() =>
    t('lpVault.activationMsg', {
      address: activationAddress.value,
      nodeType: t('lpVault.nodeTypes.T1')
    })
  )

  const handleOpenMore = () => {
    console.log('前往了解更多')
  }

  const handleOpenMyIncome = () => {
    router.push('/myIncome')
  }

  // 节点列表数据（从接口获取）
  const nodeListData = ref([])
  const isFetchingNodeList = ref(false)

  // 获取节点质押列表数据
  const fetchNodeStakingList = async () => {
    if (isFetchingNodeList.value) {
      return
    }

    isFetchingNodeList.value = true
    try {
      const res = await getNodeStakingList()
      console.log('节点质押列表接口返回：', res)

      // 处理接口返回数据
      // 接口返回结构: { success: true, message: "success", data: { list: [...] } }
      const responseData = res?.data || res
      const list = responseData?.data?.list || responseData?.list || []

      if (!Array.isArray(list) || list.length === 0) {
        nodeListData.value = []
        return
      }

      // 将接口数据映射到组件需要的格式
      nodeListData.value = list.sort((a, b) => a.node_level - b.node_level).map((item) => {
        // 映射接口字段到组件字段
        const type = 'T ' + item.node_level || ''
        const price = item.staking_amount || '0'
        const dailyEarnings = item.node_income + "%" || '0%'
        const cycleDays = item.node_period || item.cycle || 0
        const totalEarnings = item.forecast_income || '0'

        return {
          type,
          name: item.name || t(`lpVault.nodeTypes.${type}`) || type,
          icon: item.icon || DistributedNode,
          price: String(price),
          dailyEarnings: String(dailyEarnings),
          cycleDays: cycleDays ? `${cycleDays}${t('lpVault.days')}` : `0${t('lpVault.days')}`,
          totalEarnings: String(totalEarnings)
        }
      })
    } catch (err) {
      console.warn('获取节点质押列表失败', err)
      nodeListData.value = []
    } finally {
      isFetchingNodeList.value = false
    }
  }

  // 计算属性：直接使用接口数据
  const nodeList = computed(() => nodeListData.value)

  const handleActivate = async (type) => {
    if (!address.value) {
      ElMessage.error(t('lpVault.connectWalletFirst'))
      return
    }

    const loading = ElLoading.service({ lock: true, text: t('lpVault.activatingNode'), background: 'rgba(0, 0, 0, 0.7)' })
    // 1. 网络环境检查
    if (Number(chainId.value) !== BSC_CHAIN_ID) {
      await switchChain(config, { chainId: BSC_CHAIN_ID })
      await new Promise(r => setTimeout(r, 1000))
    }

    // 获取合约地址
    const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
    const { proxyStakingManager, usdtTokenAddress } = bscNet

    // 从接口数据中获取对应节点的价格
    const nodeItem = nodeListData.value.find(item => item.type === type)
    if (!nodeItem) {
      ElMessage.error(t('lpVault.nodeTypeNotFound'))
      loading.close()
      return
    }

    const price = parseFloat(nodeItem.price) || 0
    if (price <= 0) {
      ElMessage.error(t('lpVault.invalidPrice'))
      loading.close()
      return
    }

    const amountBigInt = parseUnits(String(price), 18)
    // 余额查询START
    console.log('usdtTokenAddress', usdtTokenAddress)
    console.log('address.value', address.value)
    const userBalance = await getUserTokenBalance(usdtTokenAddress, address.value, 'balanceOf')
    if (userBalance < amountBigInt) {
      ElMessage.error(t('lpVault.insufficientBalance'))
      loading.close()
      return
    }
    // 余额查询END

    // 检查授权
    const allowance = await checkAllowance(usdtTokenAddress, address.value, proxyStakingManager)

    console.log('allowance===', allowance)
    console.log('amountBigInt', amountBigInt)
    console.log('userBalance=', userBalance)
    if (allowance === BigInt(0) || allowance < amountBigInt) {
      loading.text = t('lpVault.requestingAuth')
      await approveToken({
        tokenAddress: usdtTokenAddress,
        spenderAddress: proxyStakingManager,
        amount: amountBigInt,
        userAddress: address.value,
        BRIDGE_MESSAGES: {
          approvalSuccess: t('lpVault.approvalSuccess'),
          userCancelledAuth: t('lpVault.userCancelledAuth'),
          approveTokenFailed: t('lpVault.approveTokenFailed')
        }
      })
    }


    const result = await writeContractOptimized({
      abi: stakingManagerABI,
      address: proxyStakingManager,
      functionName: 'liquidityProviderDeposit',
      args: [amountBigInt],
      userAddress: address.value,
      messages: {
        success: t('lpVault.nodeActivationSuccess'),
        failed: t('lpVault.paymentFailed'),
        rejected: t('lpVault.paymentCancelled')
      }
    })
    console.log('result', result)
    loading.close()
  }

  // 组件挂载时获取数据
  onMounted(() => {
    fetchNodeStakingList()
  })

  return {
    activationAvatar,
    activationMsg,
    handleOpenMore,
    handleOpenMyIncome,
    nodeList,
    handleActivate
  }
}

