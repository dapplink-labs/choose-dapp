<template>
  <div class="cps-page">
    <div class="cps-bg"></div>

    <div class="cps-content">
      <div class="cps-card">
        <BackHeaderNav 
          :show-open-btn="true"
          :use-default-open-action="false"
          @open-click="handleOpenMore"
        />

        <h1 class="cps-title">{{ t('computingPower.title') }}</h1>

        <p class="cps-desc">
          {{ t('computingPower.desc') }}
          <a href="javascript:void(0)" class="cps-link" @click="handleOpenMore">{{ t('computingPower.learnMore') }}</a>
        </p>

        <!-- 激活提示模块 -->
        <div class="activation-banner">
          <div class="activation-avatar">
            <img :src="activationAvatar" alt="avatar" />
          </div>
          <div class="activation-text">
            <template v-for="(part, index) in activationMsgParts" :key="index">
              <strong v-if="part.isAddress">{{ part.text }}</strong>
              <span v-else>{{ part.text }}</span>
            </template>
          </div>
        </div>

        <!-- 购买节点标题区域 -->
        <div class="node-header">
          <div class="node-title-wrap">
            <h2 class="node-section-title">{{ t('computingPower.buyNode') }}</h2>
          </div>
          <div class="my-node-btn" @click="handleMyNodes">
            {{ t('computingPower.myNodes') }}
            <svg t="1766063981785" class="icon-next" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" p-id="1589" width="18" height="18">
              <path
                d="M340.688 830.24l11.312 11.328a16 16 0 0 0 22.624 0L685.76 530.448a16 16 0 0 0 0-22.64L374.624 196.688a16 16 0 0 0-22.624 0l-11.312 11.312a16 16 0 0 0 0 22.624l288.496 288.496-288.496 288.512a16 16 0 0 0 0 22.624z"
                fill="currentColor" p-id="1590"></path>
            </svg>
          </div>
        </div>

        <!-- 购买节点模块：卡片列表 -->
        <div class="node-card-list">
          <div v-for="node in displayNodes" :key="node.type" class="node-card-item">
            <div class="node-item-header">
              <div class="node-item-icon">
                <img :src="node.icon" :alt="node.title" />
                <span v-if="node.badge" class="node-badge">
                  {{ node.badge }}
                </span>
              </div>
              <div class="node-item-main">
                <div class="node-item-title">{{ node.title }}</div>
                <div class="node-item-price">
                  <span class="label">{{ t('computingPower.priceLabel') }}</span>
                  <span class="value">
                    <img class="coin" :src="TIcon" alt="T" />{{ node.price }}
                  </span>
                </div>
              </div>
            </div>

            <div class="node-item-desc">
              <p>{{ node.descText }}</p>
            </div>

            <button class="node-item-btn" @click="handleBuy(node.type)">
              {{ t('computingPower.activateBtn') }}
            </button>
          </div>
        </div>

      </div>
    </div>


    <PurchaseNode v-model="showPurchaseNode" :title="purchaseTitle" @buy="handleConfirmBuy" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import cpsBg from '@/assets/icon/cpsBg.png'
import distributedNodeImg from '@/assets/icon/DistributedNode.png'
import distributedNodeImgDark from '@/assets/icon/DistributedNodeDark.png'
import clusterNodeImgDark from '@/assets/icon/ClusterNode.png'
import clusterNodeImg from '@/assets/icon/11.png'
import TIcon from '@/assets/icon/TIcon.png'
import PurchaseNode from '@/components/PurchaseNode.vue'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { useThemeStore } from '@/stores/theme'
import { useAccount, useChainId } from '@wagmi/vue'
import { writeContract, waitForTransactionReceipt, readContract, switchChain, getPublicClient } from '@wagmi/core'
import { config } from '@/wagmi.ts'
import { ElMessage } from 'element-plus'
import erc20ABI from '@/assets/abi/erc20ABI'

import nodeManagerABI from '@/assets/abi/nodeManagerABI.json'

import networks from '@/assets/json/networks.json'
import { parseUnits, formatUnits } from 'viem'
import { estimateContractGas } from 'viem/actions'


const router = useRouter()
const { t, locale } = useI18n()
const { isDark } = useThemeStore()
const { address } = useAccount()
const chainId = useChainId()

// 激活提示头像（复用集群节点插图）
const activationAvatar = clusterNodeImg

// 节点 TAB 状态（用于弹窗标题）
const activeNodeTab = ref('distributed')

// 节点卡片数据（从服务端获取，空时用默认兜底）
const nodeProducts = ref([])

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
  nodeProducts.value.length ? nodeProducts.value : fallbackNodes.value
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
  const address = activationAddress.value
  const parts = []
  
  // 查找地址在消息中的位置
  const addressIndex = msg.indexOf(address)
  
  if (addressIndex === -1) {
    // 如果找不到地址，直接返回整个消息
    return [{ text: msg, isAddress: false }]
  }
  
  // 地址前的文本
  if (addressIndex > 0) {
    parts.push({ text: msg.substring(0, addressIndex), isAddress: false })
  }
  
  // 地址部分
  parts.push({ text: address, isAddress: true })
  
  // 地址后的文本
  const afterIndex = addressIndex + address.length
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

const handleBuy = (type) => {
  activeNodeTab.value = type
  showPurchaseNode.value = true
}

const handleConfirmBuy = async () => {
  try {
    // 1. 检查钱包连接
    if (!address.value) {
      ElMessage.error('请先连接钱包')
      return
    }

    // 2. 检查并切换到 BSC 主网（chainId: 56）
    const BSC_CHAIN_ID = 56
    const currentChainId = Number(chainId.value)
    
    console.log('当前 chainId:', chainId.value, '类型:', typeof chainId.value)
    
    // 如果当前不是 BSC 主网，尝试切换
    if (currentChainId !== BSC_CHAIN_ID) {
      ElMessage({
        message: `当前网络不是 BSC 主网，正在切换到 BSC 主网（chainId: ${BSC_CHAIN_ID}）...`,
        type: 'warning',
        duration: 3000
      })
      
      try {
        await switchChain(config, { chainId: BSC_CHAIN_ID })
        
        // 等待网络切换完成
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 验证切换是否成功
        const newChainId = Number(chainId.value)
        if (newChainId !== BSC_CHAIN_ID) {
          throw new Error('网络切换失败，请手动切换到 BSC 主网')
        }
        
        ElMessage({
          message: '已成功切换到 BSC 主网',
          type: 'success',
          duration: 2000
        })
      } catch (error) {
        console.error('切换网络失败:', error)
        
        // 处理用户拒绝切换的情况
        if (error.code === 4001 || 
            error.message?.includes('User rejected') || 
            error.message?.includes('user rejected') ||
            error.message?.includes('User denied')) {
          ElMessage({
            message: '用户取消了网络切换，请手动切换到 BSC 主网（chainId: 56）',
            type: 'warning',
            duration: 4000
          })
        } else {
          ElMessage.error(`网络切换失败: ${error.message || '请手动切换到 BSC 主网（chainId: 56）'}`)
        }
        return
      }
    }

    // 3. 获取 BSC 主网配置
    const currentChain = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
    
    if (!currentChain) {
      console.error('未找到 BSC 主网配置')
      ElMessage.error('BSC 主网配置不存在，请联系管理员')
      return
    }

    console.log('当前链配置:', currentChain)

    // 4. 获取合约地址
    const proxyNodeManager = currentChain.proxyNodeManager // 节点管理合约地址
    const proxyChooseMeToken = currentChain.proxyChooseMeToken // ERC20 代币合约地址
    const proxyStakingManager = currentChain.proxyStakingManager // 质押管理合约地址
    
    console.log('proxyNodeManager:', proxyNodeManager)
    console.log('proxyChooseMeToken:', proxyChooseMeToken)
    
    if (!proxyNodeManager) {
      console.error('节点管理合约地址未配置，当前链配置:', currentChain)
      ElMessage.error(`节点管理合约地址未配置（当前链: ${currentChain.name}，chainId: ${currentChain.chainId}）`)
      return
    }
    
    if (!proxyChooseMeToken) {
      console.error('代币合约地址未配置，当前链配置:', currentChain)
      ElMessage.error(`代币合约地址未配置（当前链: ${currentChain.name}，chainId: ${currentChain.chainId}）`)
      return
    }

    // ========== 步骤 1: 读取 proxyNodeManager 合约上的 t1Staking 得到金额大小 ==========
    ElMessage({
      message: '正在查询节点质押金额...',
      type: 'info',
      duration: 2000
    })

    // 确保使用正确的 chainId
    let t1StakingAmount
    try {
      t1StakingAmount = await readContract(config, {
        address: proxyStakingManager,
        abi: nodeManagerABI,
        functionName: 't1Staking',
        chainId: BSC_CHAIN_ID // 显式指定 chainId，确保使用正确的 RPC
      })
    } catch (error) {
      console.error('读取 t1Staking 失败:', error)
      
      // 处理不同类型的错误
      if (error.message?.includes('Failed to fetch') || error.message?.includes('HTTP request failed')) {
        ElMessage.error('网络请求失败，请检查网络连接或稍后重试。如果问题持续，可能是 BSC RPC 端点暂时不可用。')
      } else if (error.message?.includes('reverted') || error.message?.includes('execution reverted')) {
        // 合约执行被 revert，可能是合约地址错误、函数不存在或合约状态问题
        ElMessage.error('合约调用失败：函数执行被回退。请检查合约地址是否正确，或联系管理员确认合约状态。')
        console.error('合约地址:', proxyNodeManager)
        console.error('函数名: t1Staking')
        console.error('ChainId:', BSC_CHAIN_ID)
      } else if (error.message?.includes('function') && error.message?.includes('not found')) {
        ElMessage.error('合约函数不存在，请检查 ABI 配置是否正确。')
      } else {
        ElMessage.error(`查询质押金额失败: ${error.message || '未知错误'}`)
      }
      throw error
    }
    console.log('t1StakingAmount:', t1StakingAmount)
    const amountBigInt = BigInt(t1StakingAmount.toString())
    const amountDisplay = parseFloat(formatUnits(amountBigInt, 18))
    
    console.log('T1 质押金额:', amountDisplay, '代币')
    console.log('金额 (BigInt):', amountBigInt.toString())


    // ========== 步骤 2: 调用 proxyChooseMeToken 合约的 approve 方法 ==========
    ElMessage({
      message: '正在授权代币...',
      type: 'info',
      duration: 2000
    })

    // 检查当前授权额度
    const currentAllowance = await readContract(config, {
      address: proxyChooseMeToken,
      abi: erc20ABI,
      functionName: 'allowance',
      args: [address.value, proxyNodeManager],
      chainId: BSC_CHAIN_ID // 显式指定 chainId
    })

    const allowanceBigInt = BigInt(currentAllowance.toString())
    console.log('当前授权额度:', formatUnits(allowanceBigInt, 18))

    // 如果授权额度不足，执行授权
    if (allowanceBigInt < amountBigInt) {
      console.log('授权额度不足，执行授权...')
      
      const approveHash = await writeContract(config, {
        address: proxyChooseMeToken,
        abi: erc20ABI,
        functionName: 'approve',
        args: [proxyNodeManager, amountBigInt],
        chainId: BSC_CHAIN_ID // 显式指定 chainId
      })

      console.log('授权交易已提交，哈希:', approveHash)

      ElMessage({
        message: '授权交易已提交，等待确认...',
        type: 'info',
        duration: 3000
      })

      // 等待授权交易确认
      const approveReceipt = await waitForTransactionReceipt(config, {
        hash: approveHash
      })

      if (approveReceipt.status !== 'success') {
        ElMessage.error('授权失败')
        return
      }

      ElMessage({
        message: '授权成功！',
        type: 'success',
        duration: 2000
      })
    } else {
      console.log('授权额度充足，跳过授权步骤')
    }
    // ========== 步骤 3: 调用 proxyNodeManager 的 liquidityProviderDeposit 方法 ==========
    ElMessage({
      message: '正在提交节点质押交易...',
      type: 'info',
      duration: 2000
    })

    // 邀请人地址
    const inviterAddress = '0xD837FF8cb366D1f9ebDB0659b066b709804D52bc'

    // 预估质押交易 gas
    const depositGas = await estimateContractGas(getPublicClient(config), {
      address: proxyStakingManager,
      abi: nodeManagerABI,
      functionName: 'liquidityProviderDeposit',
      args: [inviterAddress, amountBigInt],
      chainId: BSC_CHAIN_ID // 显式指定 chainId
    })
    // 调用 proxyNodeManager 的 liquidityProviderDeposit 方法
    // 注意：根据用户需求，应该调用 proxyNodeManager，而不是 proxyStakingManager
    const depositHash = await writeContract(config, {
      address: proxyNodeManager, // 使用 proxyNodeManager，不是 proxyStakingManager
      abi: nodeManagerABI,
      functionName: 'liquidityProviderDeposit',
      args: [inviterAddress, amountBigInt],
      chainId: BSC_CHAIN_ID // 显式指定 chainId
    })

    console.log('质押交易已提交，哈希:', depositHash)

    ElMessage({
      message: '质押交易已提交，等待确认...',
      type: 'info',
      duration: 3000
    })

    // 等待质押交易确认
    const depositReceipt = await waitForTransactionReceipt(config, {
      hash: depositHash
    })

    // 检查交易状态
    if (depositReceipt.status === 'success') {
      ElMessage({
        message: '节点质押成功！',
        type: 'success',
        duration: 3000
      })
      
      // 关闭弹窗
      showPurchaseNode.value = false
      
      // 可以在这里刷新节点列表或跳转到我的节点页面
      // router.push('/myNode')
    } else {
      ElMessage.error('质押交易失败')
    }

  } catch (error) {
    console.error('购买节点失败:', error)
    
    // 处理用户拒绝错误
    if (error.code === 4001 || 
        error.message?.includes('User rejected') || 
        error.message?.includes('user rejected') ||
        error.message?.includes('User denied')) {
      ElMessage({
        message: '用户取消了交易',
        type: 'warning',
        duration: 2000
      })
    } else if (error.message?.includes('reverted') || error.message?.includes('execution reverted')) {
      // 合约执行被 revert
      const errorSignature = error.data?.errorName || error.data?.signature || 'unknown'
      console.error('合约执行被 revert，错误签名:', errorSignature)
      console.error('合约地址:', error.data?.address || 'unknown')
      console.error('函数名:', error.data?.functionName || 'unknown')
      
      // 根据错误签名提供更友好的提示
      if (errorSignature === '0xfb8f41b2' || error.message?.includes('0xfb8f41b2')) {
        ElMessage.error('合约执行失败：可能是余额不足、授权不足或合约状态不正确。请检查：1) 代币余额是否充足 2) 是否已正确授权 3) 邀请人地址是否正确')
      } else {
        ElMessage.error(`合约执行失败：${error.message || '未知错误'}。请检查合约状态和参数是否正确。`)
      }
    } else {
      ElMessage.error(error.message || '购买节点失败，请重试')
    }
  }
}

// 拉取节点数据（示例，替换为真实接口）
const fetchNodeProducts = async () => {
  try {
    const res = await fetch('/api/node-products')
    if (!res.ok) throw new Error('fetch node products failed')
    const data = await res.json()
    // 期望服务端字段：type/icon/title/price/badge/fee/subFee/marketShare/descText(optional)
    nodeProducts.value = Array.isArray(data)
      ? data.map(item => {
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
    console.warn('node products fetch failed, use fallback', err)
    nodeProducts.value = []
  }
}

onMounted(fetchNodeProducts)

// 保留当前选中节点图（弹窗可能复用）
const currentNodeImg = computed(() =>
  activeNodeTab.value === 'distributed' ? distributedNodeImg : clusterNodeImg
)
</script>

<style scoped lang="scss">
.cps-page {
  width: 100%;
  position: relative;
  background-color: var(--bg-page-h5, #FFFFFF);
  min-height: 100vh;
}

.cps-bg {
  position: absolute;
  top: 0;
  left: 0;
  background: url("@/assets/icon/cpsBg.png") no-repeat;
  background-size: 100% 100%;
  pointer-events: none;
  width: 100%;
  min-height: 230px;
  z-index: 1;
}

/* 暗色主题下使用深色背景图 */
.theme-dark .cps-bg {
  background-image: url("@/assets/icon/cpsBgDark.png");
}

.cps-content {
  z-index: 999;
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20px 16px 32px;
  box-sizing: border-box;
}

.cps-card {
  width: 100%;
  box-sizing: border-box;
  padding-top: 60px; // 为 fixed 的 BackHeaderNav 预留空间

}

// 节点列表卡片
.node-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-card-item {
  background: var(--bg-card, #ffffff);
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-item-icon {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }
}

.node-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #fff;
  color: #000;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.node-item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-item-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color, #000000);
}

.node-item-price {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #9ca3af;

  .label {
    color: #9ca3af;
  }

  .value {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
    color: #2EBE69;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .coin {
    width: 18px;
    height: 18px;
    display: inline-block;
    object-fit: contain;
  }
}

.node-item-desc {
  line-height: 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  p {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-dark-gray, #909090);
    line-height: 20px;
    text-align: left;
  }
}

.node-item-btn {
  margin-top: 4px;
  height: 44px;
  border-radius: 22px;
  border: none;
  background: #2B6C18;
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(43, 108, 24, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
}

.cps-title {
  margin: 0 0 10px;
  font-family: Noto Sans SC, Noto Sans SC;
  font-weight: bold;
  font-size: 28px;
  color: #FFFFFF;
  color: var(--text-color, #111111);
}

.cps-desc {
  margin: 0;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  color: var(--text-color-F4, #F4F4F4);
  padding-right: 25%;
  box-sizing: border-box;
}

.cps-link {
  font-size: 12px;
  color: var(--text-color-F4, #F4F4F4);
  text-decoration: underline;
}

// 激活提示模块样式
.activation-banner {
  margin: 12px 0 16px;
  padding: 10px 14px;
  width: 100%;
  box-sizing: border-box;
  background: #F4F4F4;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #111111;
}

.activation-avatar {
  width: 36px;
  height: 36px;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  border-radius: 50%;
  background: #2F2F2F;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.activation-text {
  font-size: 13px;
  line-height: 18px;
  color: inherit;
}

/* 关灯（暗色主题）下的激活提示背景色与文字色 */
.theme-dark .activation-banner {
  background: #2F2F2F;
  color: #F4F4F4;
}

.node-header {
  margin-top: 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-section-title {
  margin: 0;
  font-family: Noto Sans SC, Noto Sans SC;
  font-weight: bold;
  font-size: 20px;
  line-height: 16px;
  text-align: left;
  color: var(--text-color, #000000);
}

.my-node-btn {
  border: none;
  background: transparent;
  color: var(--text-color, #FFF);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;

  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 16px;
  text-align: right;
  font-style: normal;
  text-transform: none;
}

.node-card {
  margin-top: 8px;
  background-color: var(--bg-card, #ffffff);
  border-radius: 18px;
  border: 1px solid var(--border-color, #E0E0E0);
  padding: 16px 16px 20px;
  box-sizing: border-box;
}

.node-tabs {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  border-bottom: 1px solid #3B3B3B;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.node-tab {
  font-size: 14px;
  color: var(--text-dark-gray, #999999);
  cursor: pointer;
  padding: 0 0 4px;
  position: relative;
}

.node-tab.active {
  color: var(--text-color, #000000);
  font-weight: 600;
  border-color: var(--text-color, #000000);

  &::after {
    content: '';
    width: 100%;
    height: 2px;
    background-color: var(--text-color, #FFFFFF);
    position: absolute;
    bottom: -9px;
    left: 0;
  }
}

.node-image-wrap {
  width: 100%;
  overflow: hidden;
  margin-bottom: 12px;
}

.node-image {
  width: 100%;
  display: block;
}

.benefit-list {
  list-style: none;
  padding: 0 16px;
  margin: 0 0 24px;
  box-sizing: border-box;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-color, #111111);
  margin-bottom: 16px;

  .text {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-color, #000000);
    line-height: 20px;
    text-align: left;
  }
}

.check-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--check-icon-bg, #000000);
  flex-shrink: 0;
  position: relative;
}

.check-icon::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 3px;
  width: 7px;
  height: 4px;
  border-left: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  transform: rotate(-45deg);
}

.price-row {
  padding: 0 16px;
  box-sizing: border-box;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: var(--text-dark-gray, #909090);
  margin-bottom: 31px;
  vertical-align: middle;
}

.price-value {
  font-family: DIN, DIN;
  font-weight: bold;
  font-size: 24px;
  color: #DE9800;
  margin-left: 6px;
  vertical-align: middle;
}

.theme-dark .node-item-btn {
  background: #ffffff !important;
  color: #111111 !important;
}
</style>