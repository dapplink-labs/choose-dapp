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

const router = useRouter()
const { t, locale } = useI18n()
const { isDark } = useThemeStore()

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

const handleConfirmBuy = () => {
  console.log('确认购买', activeNodeTab.value)
  showPurchaseNode.value = false
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