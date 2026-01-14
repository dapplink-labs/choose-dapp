<template>
  <div class="cps-card-header" :style="headerStyle">
    <div class="back-btn" @click="handleBack">
      <svg t="1766051544466" class="icon" viewBox="0 0 1024 1024" version="1.1"
        xmlns="http://www.w3.org/2000/svg" p-id="6246" width="32" height="32">
        <path d="M723.2 1024l-512-512L716.8 0l70.4 70.4L345.6 512l441.6 448-64 64z" p-id="6247"
          fill="currentColor"></path>
      </svg>
    </div>
    <h1 v-if="title" class="page-title">{{ title }}</h1>
    <div class="header-right" v-if="$slots.right || showRecordBtn || showOpenBtn">
      <!-- 自定义右侧内容插槽 -->
      <slot name="right"></slot>
      
      <!-- 记录按钮 -->
      <div v-if="showRecordBtn" class="record-btn" @click="handleRecordClick">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19.308" viewBox="0 0 20 19.308" class="icon">
          <g transform="translate(-314.296 -57)">
            <path
              d="M12.694,19.308H0V0H17.417V9.9a5.352,5.352,0,0,0-1.611-.247,1.519,1.519,0,0,0-.324.053V1.93H1.935V17.377h9.1a5.355,5.355,0,0,0,1.653,1.928Zm.854-8.689H3.874V8.689h9.674v1.929ZM7.743,6.758H3.874V4.828H7.743V6.757Z"
              transform="translate(314.296 57)" fill="currentColor" />
            <path
              d="M4,8A4,4,0,1,1,8,4,4,4,0,0,1,4,8ZM3.487,1.744a.565.565,0,0,0-.564.564v2.53a.565.565,0,0,0,.3.5l1.709.917a.527.527,0,0,0,.265.068.565.565,0,0,0,.267-1.065L4.056,4.5V2.308A.567.567,0,0,0,3.487,1.744Z"
              transform="translate(326.296 68)" fill="currentColor" />
          </g>
        </svg>
      </div>
      
      <!-- 打开更多按钮 -->
      <div v-if="showOpenBtn" class="open-btn" @click="handleOpenClick">
        <svg t="1766051224777" class="icon" viewBox="0 0 1024 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg" p-id="4731" width="32" height="32">
          <path
            d="M842.724 571.473c0-22.93 18.588-41.518 41.518-41.518s41.518 18.587 41.518 41.518v271.251c0 45.86-37.177 83.036-83.036 83.036H182.126c-45.86 0-83.036-37.177-83.036-83.036V182.126c0-45.86 37.176-83.036 83.036-83.036h271.251c22.93 0 41.518 18.588 41.518 41.518s-18.588 41.518-41.518 41.518H182.126v660.598h660.598V571.473z m2.865-332.009L562.576 521.869c-16.45 16.414-43.119 16.414-59.57 0-16.448-16.414-16.448-43.027 0-59.441l283.95-283.339H646.05c-22.138 0-40.084-17.907-40.084-40 0-22.09 17.946-39.998 40.084-39.998h203.56c42.056-0.001 76.149 34.019 76.149 75.985v203.122c0 22.092-17.947 40-40.086 40s-40.085-17.908-40.085-40V239.464z"
            fill="currentColor" p-id="4732">
          </path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { defineEmits, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  // 是否显示记录按钮
  showRecordBtn: {
    type: Boolean,
    default: false
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
  // 是否使用默认的打开更多行为（如果为 false，则只触发事件，不执行默认行为）
  useDefaultOpenAction: {
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
  }
})

const router = useRouter()
const emit = defineEmits(['back', 'record-click', 'open-click'])
const themeStore = useThemeStore()

const scrollY = ref(0)
const isDark = computed(() => themeStore.isDark)

// 使用 requestAnimationFrame 优化滚动性能
let rafId = null
let ticking = false

// 缓动函数：ease-out-cubic，使过渡更自然
const easeOutCubic = (t) => {
  return 1 - Math.pow(1 - t, 3)
}

// 滚动事件处理函数（使用节流优化）
const handleScroll = () => {
  if (!ticking) {
    rafId = requestAnimationFrame(() => {
      scrollY.value = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
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
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  // 初始化时也执行一次
  handleScroll()
})

// 页面卸载前清除滚动事件监听
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
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
    router.push(props.recordPath)
  }
}

const handleOpenClick = () => {
  emit('open-click')
  // 如果使用默认行为，则执行默认操作（目前是预留功能）
  if (props.useDefaultOpenAction) {
    // 预留「了解更多」跳转逻辑
    console.log('前往了解更多')
  }
}
</script>

<style scoped lang="scss">
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
    font-size: 20px;
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

  .record-btn,
  .open-btn {
    width: 24px;
    height: 24px;
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

