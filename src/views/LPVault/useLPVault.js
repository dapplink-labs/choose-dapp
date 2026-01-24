import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import clusterNodeImg from '@/assets/icon/ClusterNode.png'
import DistributedNode from '@/assets/icon/DistributedNode.png'
import stakingManagerABI from '@/assets/abi/stakingManagerABI.json'
import { switchChain, readContract } from '@wagmi/core'
import { ElLoading } from 'element-plus'
import Message from '@/utils/message'
import { writeContractOptimized } from '@/utils/requestWEB3.js'
import networks from '@/assets/json/networks.json'
import { config } from '../../wagmi.ts'
import { useChainId, useAccount } from '@wagmi/vue'
import { getUserTokenBalance, approveToken, checkAllowance } from '@/utils/requestWEB3.js'
import { parseUnits, formatUnits } from 'viem'
import { getNodeStakingList, nodeStakingActivate } from '@/api/API'
import { eventBus } from '@/utils/eventBus'
import nodeManagerABI from '@/assets/abi/nodeManagerABI.json'

export const useLPVault = () => {
  const router = useRouter()
  const { t } = useI18n()
  const chainId = useChainId()
  const BSC_CHAIN_ID = 56
  const { address } = useAccount()
  // 临时禁用激活按钮开关，后续开放时改为 false 即可
  const isActivationDisabled = true

  const activationAvatar = clusterNodeImg
  const activationAddress = ref('')
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
      const res = await getNodeStakingList({ address: address.value })

      // 处理接口返回数据
      const responseData = res?.data || res
      const list = responseData?.data?.list || responseData?.list || []

      if (!Array.isArray(list) || list.length === 0) {
        nodeListData.value = []
        return
      }

      // 将接口数据映射到组件需要的格式
      nodeListData.value = list.sort((a, b) => parseInt(a.node_level.match(/\d+/)[0]) - parseInt(b.node_level.match(/\d+/)[0])).map((item) => {

        return {
          id: item.id,
          type: (item.node_level.match(/\d+/)[0]),
          name: t(`lpVault.nodeTypes.${item.node_level}`),
          nodeLevel: item.node_level,
          icon: item.icon || DistributedNode,
          price: String(formatUnits(BigInt(item.staking_amount.toString()), 18)),
          dailyEarnings: String(item.node_income || 0) + "%",
          cycleDays: item.node_period ? `${item.node_period}${t('lpVault.days')}` : `0${t('lpVault.days')}`,
          totalEarnings: String(formatUnits(BigInt(item.forecast_income.toString()), 18) || '0'),
          node_min_income: item.node_min_income,
          node_max_income: item.node_max_income,
        }
      })
    } catch (err) {
      console.warn('获取节点质押列表失败', err)
      nodeListData.value = []
    } finally {
      isFetchingNodeList.value = false
    }
  }

  const nodeList = computed(() => nodeListData.value)

  // 激活节点
  const handleActivate = async (type) => {
    if (!address.value) {
      Message.error(t('lpVault.connectWalletFirst'))
      return
    }

    const loading = ElLoading.service({ lock: true, text: t('lpVault.activatingNode'), background: 'rgba(0, 0, 0, 0.7)' })

    try {
      // 1. 网络环境检查
      if (Number(chainId.value) !== BSC_CHAIN_ID) {
        try {
          await switchChain(config, { chainId: BSC_CHAIN_ID })
          await new Promise(r => setTimeout(r, 1000))
        } catch (switchError) {
          // 用户取消切换网络时关闭加载层
          loading.close()
          return
        }
      }

      // 获取合约地址
      const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
      const { proxyStakingManager, usdtTokenAddress, proxyNodeManager } = bscNet

      // 检查当前用户是否绑定邀请码
      const inviter = await readContract(config, {
        address: proxyNodeManager,
        abi: nodeManagerABI,
        functionName: 'inviters',
        args: [address.value]
      })
      if (inviter == '0x0000000000000000000000000000000000000000') {
        Message.warning(t('lpVault.bindInviteCodeFirst'))
        eventBus.emit('showInvite', true)
        loading.close()
        return
      }

      // 从接口数据中获取对应节点的价格
      const nodeItem = nodeListData.value.find(item => item.type === type)
      if (!nodeItem) {
        Message.error(t('lpVault.nodeTypeNotFound'))
        return
      }

      const price = parseFloat(nodeItem.price) || 0
      if (price <= 0) {
        Message.error(t('lpVault.invalidPrice'))
        return
      }

      const amountBigInt = parseUnits(String(price), 18)
      console.log(amountBigInt)
      // 余额查询START
      const userBalance = await getUserTokenBalance(usdtTokenAddress, address.value, 'balanceOf')
      if (userBalance < amountBigInt) {
        Message.error(t('lpVault.insufficientBalance'))
        return
      }
      // 余额查询END

      // 检查授权
      const allowance = await checkAllowance(usdtTokenAddress, address.value, proxyStakingManager)

      if (allowance === BigInt(0) || allowance < amountBigInt) {
        loading.text = t('lpVault.requestingAuth')
        try {
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
        } catch (approveError) {
          // 用户取消授权时关闭加载层
          return
        }
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
      // 调用接口记录质押节点
      const res = await nodeStakingActivate({
        address: address.value,
        node_id: nodeItem.id,
        hash: result.hash,
      })

      // 激活成功后刷新列表数据
      await fetchNodeStakingList()
    } catch (e) {
      // 所有错误情况（包括用户取消交易）都会在这里处理
      console.error('激活节点失败:', e)
    } finally {
      // 确保在所有情况下都关闭加载层
      loading.close()
    }
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
    handleActivate,
    isActivationDisabled
  }
}

