<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
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

// 检测是否为移动端
const isMobile = ref(false)

const checkIsMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 768
  }
}

// 立即检查（在组件渲染前）
checkIsMobile()

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
