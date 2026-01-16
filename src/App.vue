<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAccount } from '@wagmi/vue'
import navBar from "./components/navBar.vue"
import navBar2 from "./components/navBar2.vue"
import Header from "./components/header.vue"
import Footer from "./components/footer.vue"
import FooterNav from "./components/footerNav.vue"
import Invite from "./components/Invite.vue"
import { eventBus } from '@/utils/eventBus'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const route = useRoute()
const counterStore = useCounterStore()
const { showInvite } = storeToRefs(counterStore)

// 监听钱包地址变化
const { address } = useAccount()
const isInitialMount = ref(true)

// 监听地址变化，如果地址改变则刷新页面
watch(
  () => address.value,
  (newAddress, oldAddress) => {
    // 跳过首次挂载时的触发（避免页面加载时刷新）
    if (isInitialMount.value) {
      isInitialMount.value = false
      return
    }

    // 如果地址从有值变为另一个值（切换钱包），则刷新页面
    if (oldAddress && newAddress && oldAddress !== newAddress) {
      console.log('钱包地址已更改，刷新页面...', { oldAddress, newAddress })
      window.location.reload()
      return
    }

    // 如果地址从有值变为无值（断开连接），也刷新页面
    if (oldAddress && !newAddress) {
      console.log('钱包已断开连接，刷新页面...')
      window.location.reload()
      return
    }

    // 如果地址从无值变为有值（首次连接），不刷新（让页面正常加载）
  }
)

// 检测是否为移动端
const isMobile = ref(false)

const checkIsMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 768
  }
}

// 立即检查（在组件渲染前）
checkIsMobile()

// 监听路由变化，检测 URL 中的 inviteCode 参数
watch(
  () => route.query.inviteCode,
  (inviteCode) => {
    if (inviteCode) {
      counterStore.inviteCode = String(inviteCode)
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 再次检查确保准确性
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  
  // 监听 showInvite 事件
  eventBus.on('showInvite', (show) => {
    showInvite.value = show
  })
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkIsMobile)
  }
  // 移除事件监听
  eventBus.off('showInvite')
})

// 根据路由 meta 判断是否显示 header
const showHeader = computed(() => {
  return !route.meta?.hideHeader
})

// 根据路由 meta 判断是否显示底部导航
const showFooterNav = computed(() => {
  return isMobile.value && !route.meta?.hideFooterNav
})

// 根据路由 meta 判断是否需要底部 padding
const needBottomPadding = computed(() => {
  return isMobile.value && !route.meta?.hideFooterNav
})


</script>

<template>
  <div class="app-wrapper" :class="{ 'has-footer-nav': needBottomPadding }">
    <Header v-if="showHeader" />
    <navBar2 v-if="!isMobile && showHeader" />
    <!-- <navBar/> -->
    <RouterView />
    <Footer v-if="!isMobile" />
    <FooterNav v-if="showFooterNav" />
    <!-- Invite邀请码组件 - 全局显示 -->
    <Invite v-model="showInvite" />
    <!-- <bottomBar/> -->
  </div>
</template>

<style scoped lang="scss">
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  // 移动端为底部导航栏预留空间（仅在显示底部导航时）
  @media (max-width: 768px) {
    &.has-footer-nav {
      padding-bottom: 60px;
      
      @media (max-width: 480px) {
        padding-bottom: 56px;
      }
    }
  }
}
</style>
