<template>
  <div class="cps-card-header" :style="headerStyle">
    <div class="back-btn" @click="handleBack">
      <svg t="1766051544466" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="6246" width="32" height="32">
        <path d="M723.2 1024l-512-512L716.8 0l70.4 70.4L345.6 512l441.6 448-64 64z" p-id="6247" fill="currentColor">
        </path>
      </svg>
    </div>
    <h1 v-if="title" class="page-title">{{ title }}</h1>
    <div class="header-right" v-if="$slots.right || showRecordBtn || showOpenBtn">
      <!-- 自定义右侧内容插槽 -->
      <slot name="right"></slot>

      <!-- 记录按钮 -->
      <button v-if="showRecordBtn" class="action-btn" type="button" @click="handleRecordClick">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 19.308" class="icon">
          <g transform="translate(-314.296 -57)">
            <path
              d="M12.694,19.308H0V0H17.417V9.9a5.352,5.352,0,0,0-1.611-.247,1.519,1.519,0,0,0-.324.053V1.93H1.935V17.377h9.1a5.355,5.355,0,0,0,1.653,1.928Zm.854-8.689H3.874V8.689h9.674v1.929ZM7.743,6.758H3.874V4.828H7.743V6.757Z"
              transform="translate(314.296 57)" fill="currentColor" />
            <path
              d="M4,8A4,4,0,1,1,8,4,4,4,0,0,1,4,8ZM3.487,1.744a.565.565,0,0,0-.564.564v2.53a.565.565,0,0,0,.3.5l1.709.917a.527.527,0,0,0,.265.068.565.565,0,0,0,.267-1.065L4.056,4.5V2.308A.567.567,0,0,0,3.487,1.744Z"
              transform="translate(326.296 68)" fill="currentColor" />
          </g>
        </svg>
        <span class="action-text">{{ type == 1 ? $t('purchaseNodeRecord.title') : $t('purchaseNodeRecord.title2')
        }}</span>
      </button>

      <!-- 分享按钮 -->
      <button v-if="showOpenBtn" class="action-btn" type="button" @click="handleOpenClick">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 14 14" class="icon"
          fill="currentColor">
          <path
            d="M440.193,148.479a.683.683,0,1,0,1.362,0c0-2.541.63-3.356,2.6-3.356h.49a.683.683,0,0,0,.973.955l1.008-1.012a.882.882,0,0,0,0-1.249l-1.012-1.012a.681.681,0,1,0-.969.956h-.49C441.415,143.761,440.193,145.2,440.193,148.479Z"
            transform="translate(-434.173 -140.653)" />
          <path d="M13.3,6.3a.7.7,0,0,0-.7.7A5.618,5.618,0,1,1,7,1.4.7.7,0,1,0,7,0a7,7,0,1,0,7,7,.7.7,0,0,0-.7-.7Z" />
        </svg>
        <span class="action-text">{{ $t('common.share') || '分享' }}</span>
      </button>
    </div>
  </div>

  <!-- 分享邀请码弹窗 -->
  <ShareInvitationCode v-model="showShareModal" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { defineEmits, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ShareInvitationCode from '@/components/ShareInvitationCode.vue'
import { readContract } from '@wagmi/core'
import { config } from '@/wagmi.ts'
import nodeManagerABI from '@/assets/abi/nodeManagerABI.json'
import networks from '@/assets/json/networks.js'
import Message from '@/utils/message'
import { useAccount } from '@wagmi/vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const BSC_CHAIN_ID = 56
const { address } = useAccount()
const props = defineProps({
  // 是否显示记录按钮
  showRecordBtn: {
    type: Boolean,
    default: false
  },
  type: {
    type: Number,
    default: 0
  },
  // 是否显示打开更多按钮
  showOpenBtn: {
    type: Boolean,
    default: false
  },
  // 记录按钮跳转路径（可选，默认跳转到购买记录页面）
  recordPath: {
    type: String,
    default: '/purchase-node-record'
  },
  // 是否使用默认的跳转行为（如果为 false，则只触发事件，不执行跳转）
  useDefaultRecordAction: {
    type: Boolean,
    default: true
  },
  // 是否使用默认的返回行为（如果为 false，则只触发事件，不执行 router.back()）
  useDefaultBackAction: {
    type: Boolean,
    default: true
  },
  // 标题文本（可选，如果不传入则不展示）
  title: {
    type: String,
    default: ''
  },
  // 滚动容器选择器（可选，默认监听 window）
  scrollContainer: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const emit = defineEmits(['back', 'record-click'])
const themeStore = useThemeStore()

const scrollY = ref(0)
const isDark = computed(() => themeStore.isDark)
// 分享弹窗显示状态
const showShareModal = ref(false)

// 使用 requestAnimationFrame 优化滚动性能
let rafId = null
let ticking = false
let scrollElement = null
let mutationObserver = null

// 缓动函数：ease-out-cubic，使过渡更自然
const easeOutCubic = (t) => {
  return 1 - Math.pow(1 - t, 3)
}

// 获取滚动位置
const getScrollTop = () => {
  if (scrollElement && scrollElement !== window) {
    return scrollElement.scrollTop
  }
  return window.scrollY || window.pageYOffset || document.documentElement.scrollTop
}

// 滚动事件处理函数（使用节流优化）
const handleScroll = () => {
  if (!ticking) {
    rafId = requestAnimationFrame(() => {
      scrollY.value = getScrollTop()
      ticking = false
    })
    ticking = true
  }
}

// 监听滚动位置变化，修改 header 样式
const headerStyle = computed(() => {
  // 优化后的滚动阈值和过渡范围
  const scrollThreshold = 30 // 开始渐变的滚动距离（降低阈值，更早开始）
  const maxScroll = 200 // 达到最大透明度的滚动距离（增加范围，过渡更平滑）

  let opacity = 0
  let blurAmount = 0

  if (scrollY.value > scrollThreshold) {
    // 计算进度（0-1）
    const progress = Math.min((scrollY.value - scrollThreshold) / (maxScroll - scrollThreshold), 1)
    // 使用缓动函数使过渡更自然
    const easedProgress = easeOutCubic(progress)
    // 最大透明度 0.98，保留一点透明感
    opacity = easedProgress * 0.98

    // 模糊效果也使用缓动函数，最大模糊 12px
    blurAmount = easedProgress * 12
  }

  // 根据主题选择背景色
  const bgColor = isDark.value
    ? `rgba(0, 0, 0, ${opacity})`
    : `rgba(255, 255, 255, ${opacity})`

  return {
    backgroundColor: bgColor,
    backdropFilter: `blur(${blurAmount}px)`,
    WebkitBackdropFilter: `blur(${blurAmount}px)`
  }
})

// 页面加载完成后监听滚动事件
const setupScrollListeners = () => {
  const possibleContainers = document.querySelectorAll('[class*="-page"], [class*="Page"], .main-content')
  possibleContainers.forEach(el => {
    el.addEventListener('scroll', handleScroll, { passive: true })
  })
}

onMounted(() => {
  // 延迟执行确保 DOM 已渲染
  nextTick(() => {
    // 尝试获取指定的滚动容器
    if (props.scrollContainer) {
      scrollElement = document.querySelector(props.scrollContainer)
    }
    
    // 如果没有指定容器或找不到，同时监听 window 和常见容器
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    } else {
      // 监听 window
      window.addEventListener('scroll', handleScroll, { passive: true })
    }
    
    // 始终监听所有可能的容器
    setupScrollListeners()
    
    // 监听 visualViewport 变化（键盘弹出/收起）
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        // 键盘弹出/收起时重新设置监听
        setupScrollListeners()
        handleScroll()
      })
    }
    
    // 使用 MutationObserver 监听 DOM 变化
    mutationObserver = new MutationObserver(() => {
      setupScrollListeners()
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })
    
    // 初始化时也执行一次
    handleScroll()
  })
})

// 页面卸载前清除滚动事件监听
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollElement && scrollElement !== window) {
    scrollElement.removeEventListener('scroll', handleScroll)
  }
  // 清除可能添加的容器监听
  const possibleContainers = document.querySelectorAll('[class*="-page"], [class*="Page"], .main-content')
  possibleContainers.forEach(el => {
    el.removeEventListener('scroll', handleScroll)
  })
  // 清除 MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect()
  }
  // 清除 visualViewport 监听
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', setupScrollListeners)
  }
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
})

const handleBack = () => {
  emit('back')
  // 如果使用默认行为，则执行返回
  if (props.useDefaultBackAction) {
    router.back()
  }
}

const handleRecordClick = () => {
  emit('record-click')
  // 如果使用默认行为，则执行跳转
  if (props.useDefaultRecordAction) {
    router.push(props.recordPath + "?type=" + props.type)
  }
}

const handleOpenClick = async () => {
  // 合约读取是否绑定邀请人
  const inviter = await readContract(config, {
    address: networks.find(n => Number(n.chainId) === BSC_CHAIN_ID).proxyNodeManager,
    abi: nodeManagerABI,
    functionName: 'inviters',
    args: [address.value]
  })
  if (inviter == '0x0000000000000000000000000000000000000000') {
    Message.warning(t('userInfo.bindInviterFirst'))
    return
  }
  // 打开分享弹窗
  showShareModal.value = true
}
</script>

<style scoped lang="scss">
.theme-dark {
  .action-btn {
    border: 1px solid #ABAAAB !important;
  }
}

.cps-card-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 10px;
  margin-bottom: 0;
  box-sizing: border-box;
  // 默认透明背景，通过内联样式动态改变
  background-color: rgba(255, 255, 255, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  // 使用更平滑的过渡效果
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    -webkit-backdrop-filter 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  .back-btn {
    width: 18px;
    height: 18px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    color: var(--text-color, #FFFFFF);
    background: transparent;
    transition: color 0.3s ease;

    .icon {
      width: 100%;
      height: 100%;
    }

    &:hover {
      opacity: 0.8;
    }

    &:active {
      opacity: 0.6;
    }
  }

  .page-title {
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 18px;
    color: var(--text-color, #FFFFFF);
    text-align: center;
    margin: 0;
    transition: color 0.3s ease;
    flex: 1;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    pointer-events: none;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid #ABAAAB;
    background: transparent;
    color: var(--text-color, #FFFFFF);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;

    .icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .action-text {
      line-height: 1;
      white-space: nowrap;
    }
  }
}

// 暗色主题适配
.theme-dark {
  .cps-card-header {
    background-color: rgba(0, 0, 0, 0);

    // 滚动时的背景色通过内联样式动态设置

    .page-title {
      color: #FFFFFF !important;
    }
  }
}
</style>
