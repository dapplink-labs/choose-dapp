<template>
  <div class="activation-marquee">
    <!-- 固定背景 -->
    <div class="marquee-background"></div>
    <!-- Swiper 内容容器 -->
    <div class="marquee-container">
      <swiper v-if="displayItems.length > 0" :modules="swiperModules" :slides-per-view="1" :space-between="0"
        :direction="'vertical'" :loop="displayItems.length > 1" :allowTouchMove="false" :autoplay="displayItems.length > 1 ? {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false
        } : false" :speed="500" :pagination="false" :navigation="false" class="activation-swiper">
        <swiper-slide v-for="(item, index) in displayItems" :key="index">
          <div class="marquee-item">
            <div class="activation-avatar">
              <img :src="item.avatar" alt="avatar" />
            </div>
            <div class="activation-text">
              <template v-for="(part, partIndex) in item.parts" :key="partIndex">
                <strong v-if="part.isAddress">{{ part.text }}</strong>
                <span v-else>{{ part.text }}</span>
              </template>
              <span v-if="item.amountText" class="amount-text">{{ item.amountText }}</span>
            </div>
          </div>
        </swiper-slide>
      </swiper>
      <!-- 无数据时显示 -->
      <div v-else-if="!loading" class="marquee-empty">
        <div class="marquee-item">
          <div class="activation-text">
            <span>{{ t('common.noData') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import { getNodeAndNodeServiceRecordNew } from '@/api/API'
import { useI18n } from 'vue-i18n'
import clusterNodeImg from '@/assets/icon/11.png'
import avatarImg1 from '@/assets/icon/avatarImg1.png'
import avatarImg2 from '@/assets/icon/avatarImg2.png'
import avatarImg3 from '@/assets/icon/avatarImg3.png'
import avatarImg4 from '@/assets/icon/avatarImg4.png'
import avatarImg5 from '@/assets/icon/avatarImg5.png'

const { t } = useI18n()

const props = defineProps({
  type: {
    type: Number,
    default: 2
  }
})

// Swiper 模块
const swiperModules = [Autoplay]

// 随机头像数组
const avatarImages = [avatarImg1, avatarImg2, avatarImg3, avatarImg4, avatarImg5]

// 根据地址生成稳定的随机头像（同一地址总是返回相同头像）
const getRandomAvatar = (addr) => {
  if (!addr) return avatarImg1
  // 使用地址的字符码总和来选择头像，确保同一地址总是返回相同头像
  let hash = 0
  for (let i = 0; i < addr.length; i++) {
    hash = ((hash << 5) - hash) + addr.charCodeAt(i)
    hash = hash & hash // 转换为32位整数
  }
  const index = Math.abs(hash) % avatarImages.length
  return avatarImages[index]
}

// 激活消息列表
const activationMessages = ref([])
const loading = ref(false)

// 获取激活消息数据
const getNodeAndNodeServiceRecordNewData = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const res = await getNodeAndNodeServiceRecordNew({ type: props.type === 4 ? 1 : props.type === 3 ? 2 : props.type })
    const list = res?.data?.data?.list || []

    // 转换数据格式
    activationMessages.value = list.map(item => {
      item.type = item.type.match(/\d+/)[0]
      const address = item.address || ''
      const addressText = address.length > 10 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address

      // type 1: 质押节点（LPVault），根据 node_type/type 映射到不同节点类型
      if (props.type === 1) {
        const rawType = Number(item.node_type ?? item.type ?? 1)
        const nodeTypeKey = `lpVault.nodeTypes.T${rawType}`
        const nodeTypeText = t(nodeTypeKey)

        return {
          message: t('lpVault.activationMsg', {
            address: addressText,
            nodeType: nodeTypeText
          }),
          avatar: getRandomAvatar(address),
          amountText: ''
        }
      }

      const typeText = Number(item.type) === 1
        ? t('computingPower.tabs.distributed')
        : t('computingPower.tabs.cluster')

      if (props.type === 3 || props.type === 4) {
        const amountText = `+${item.income || 0}CHO`

        return {
          message: `${t('common.address') || '地址'} ${addressText} ${t('myNode.earnPromptShort') || '赚取收益'}`,
          avatar: getRandomAvatar(address),
          amountText
        }
      }

      return {
        message: t('computingPower.activationMsg', {
          address: addressText,
          nodeType: typeText
        }),
        avatar: getRandomAvatar(address),
        amountText: ''
      }
    })
  } catch (error) {
    console.error('获取激活消息失败:', error)
    activationMessages.value = []
  } finally {
    loading.value = false
  }
}

// 处理消息部分
const displayItems = computed(() => {
  return activationMessages.value.map(item => {
    const parts = []
    const msg = item.message || ''

    // type=3 时直接整段展示
    if (props.type === 3) {
      parts.push({ text: msg, isAddress: false })
      return { ...item, parts }
    }

    // 默认按地址拆分
    const addrMatch = msg.match(/0x[a-zA-Z0-9.]{11,}/)
    const addr = addrMatch ? addrMatch[0] : ''
    if (!addr || msg.indexOf(addr) === -1) {
      parts.push({ text: msg, isAddress: false })
      return { ...item, parts }
    }

    const addressIndex = msg.indexOf(addr)
    if (addressIndex > 0) {
      parts.push({ text: msg.substring(0, addressIndex), isAddress: false })
    }
    parts.push({ text: addr, isAddress: true })
    const afterIndex = addressIndex + addr.length
    if (afterIndex < msg.length) {
      parts.push({ text: msg.substring(afterIndex), isAddress: false })
    }

    return { ...item, parts }
  })
})

onMounted(() => {
  getNodeAndNodeServiceRecordNewData()
})
</script>

<style scoped lang="scss">
.activation-marquee {
  margin: 12px 0 16px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  height: 50px; // 固定高度
}

// 固定背景（不滚动）
.marquee-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #F4F4F4;
  border-radius: 999px;
  z-index: 1;
}

// Swiper 内容容器（在背景上方）
.marquee-container {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}

// 无数据状态
.marquee-empty {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 2;
}

.activation-swiper {
  width: 100%;
  height: 100%;

  :deep(.swiper-wrapper) {
    height: 100%;
  }

  :deep(.swiper-slide) {
    height: 100%;
    display: flex;
    align-items: center;
  }
}

// 内容项（无背景，只有文字和头像）
.marquee-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  width: 100%;
  box-sizing: border-box;
  background: transparent; // 透明背景，使用外层背景
  color: #111111;
  min-height: 50px;

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
    flex: 1;
  }

  .amount-text {
    margin-left: 8px;
    color: #2EBE69;
    font-weight: 700;
    font-size: 14px;
    white-space: nowrap;
  }
}

/* 暗色主题 */
.theme-dark .marquee-background {
  background: #2F2F2F;
}

.theme-dark .marquee-item {
  color: #F4F4F4;
}
</style>
