import { computed, ref } from 'vue'
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

  const nodeList = computed(() => [
    {
      type: 'T1',
      name: t('lpVault.nodeTypes.T1'),
      icon: DistributedNode,
      price: '200',
      dailyEarnings: '0.5%-1%',
      cycleDays: `2${t('lpVault.days')}`,
      totalEarnings: '3000000'
    },
    {
      type: 'T2',
      name: t('lpVault.nodeTypes.T2'),
      icon: DistributedNode,
      price: '600',
      dailyEarnings: '0.6%-1.1%',
      cycleDays: `3${t('lpVault.days')}`,
      totalEarnings: '3000000'
    },
    {
      type: 'T3',
      name: t('lpVault.nodeTypes.T3'),
      icon: DistributedNode,
      price: '1200',
      dailyEarnings: '0.7%-1.2%',
      cycleDays: `4${t('lpVault.days')}`,
      totalEarnings: '3000000'
    },
    {
      type: 'T4',
      name: t('lpVault.nodeTypes.T4'),
      icon: DistributedNode,
      price: '2500',
      dailyEarnings: '0.8%-1.3%',
      cycleDays: `5${t('lpVault.days')}`,
      totalEarnings: '3000000'
    },
    {
      type: 'T5',
      name: t('lpVault.nodeTypes.T5'),
      icon: DistributedNode,
      price: '6000',
      dailyEarnings: '0.9%-1.4%',
      cycleDays: `6${t('lpVault.days')}`,
      totalEarnings: '3000000'
    },
    {
      type: 'T6',
      name: t('lpVault.nodeTypes.T6'),
      icon: DistributedNode,
      price: '14000',
      dailyEarnings: '1%-1.5%',
      cycleDays: `7${t('lpVault.days')}`,
      totalEarnings: '3000000'
    }
  ])

  const handleActivate = async (type) => {
    if (!address.value) {
      ElMessage.error('请先连接钱包')
      return
    }

    const loading = ElLoading.service({ lock: true, text: '正在进行节点激活...', background: 'rgba(0, 0, 0, 0.7)' })
    try {
      // 1. 网络环境检查
      if (Number(chainId.value) !== BSC_CHAIN_ID) {
        await switchChain(config, { chainId: BSC_CHAIN_ID })
        await new Promise(r => setTimeout(r, 1000))
      }

      // 获取合约地址
      const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
      const { proxyStakingManager, usdtTokenAddress } = bscNet

      const nodeType = {
        "T1": 200,
        "T2": 600,
        "T3": 1200,
        "T4": 2500,
        "T5": 6000,
        "T6": 14000
      }
      const amountBigInt = parseUnits(String(nodeType[type]), 18);
      // 余额查询START
      const userBalance = await getUserTokenBalance(usdtTokenAddress, address.value)
      if (userBalance < amountBigInt) {
        ElMessage.error('余额不足')
        loading.close()
        return
      }
      // 余额查询END

      // 检查授权
      const allowance = await checkAllowance(usdtTokenAddress, address.value, proxyStakingManager)

      console.log('allowance', allowance)
      console.log('amountBigInt', amountBigInt)
      console.log('userBalance', userBalance)
      if (allowance === BigInt(0) || allowance < amountBigInt) {
        loading.text = '正在请求USDT授权...'
        await approveToken({
          tokenAddress: usdtTokenAddress,
          spenderAddress: proxyStakingManager,
          amount: amountBigInt,
          userAddress: address.value,
          BRIDGE_MESSAGES: {
            approvalSuccess: '授权成功',
            userCancelledAuth: '你取消了授权',
            approveTokenFailed: '授权失败'
          }
        })
      }

      // 邀请人地址
      const inviterAddress = '0xD837FF8cb366D1f9ebDB0659b066b709804D52bc'

      const result = await writeContractOptimized({
        abi: stakingManagerABI,
        address: proxyStakingManager,
        functionName: 'liquidityProviderDeposit',
        args: [inviterAddress, amountBigInt],
        userAddress: address.value,
        messages: {
          success: '节点激活成功！',
          failed: '支付失败',
          rejected: '你取消了支付'
        }
      })
      console.log('result', result)

      ElLoading.service({ lock: true, text: '节点激活成功！', background: 'rgba(0, 0, 0, 0.7)' }).close()
    } catch (error) {
      console.error('Activate node failed:', error)
      ElMessage.error('节点激活失败')
    } finally {
      loading.close()
      ElLoading.service({ lock: true, text: '节点激活成功！', background: 'rgba(0, 0, 0, 0.7)' }).close()
    }
  }

  return {
    activationAvatar,
    activationMsg,
    handleOpenMore,
    handleOpenMyIncome,
    nodeList,
    handleActivate
  }
}

