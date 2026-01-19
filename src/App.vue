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
import { register } from '@/api/API'

const route = useRoute()
const counterStore = useCounterStore()
const { showInvite } = storeToRefs(counterStore)

const { address } = useAccount()
const isInitialMount = ref(true)
const isWalletConnecting = ref(false)

eventBus.on('wallet-connecting', (connecting) => {
  isWalletConnecting.value = connecting
})

watch(
  () => address.value,
  (newAddress, oldAddress) => {
    // 每次地址变化时，保存到 localStorage
    if (newAddress) {
      localStorage.setItem('address', newAddress)
    } else {
      // 如果地址为空，清除 localStorage 中的地址
      localStorage.removeItem('address')
    }

    if (isWalletConnecting.value) {
      console.log('正在连接钱包中，暂时忽略地址变化')
      return
    }

    if (isInitialMount.value) {
      isInitialMount.value = false
      // 初始化时如果有地址，也保存到 localStorage
      if (newAddress) {
        localStorage.setItem('address', newAddress)
      }
      return
    }

    // 清除邀请人地址
    counterStore.inviterAddress = '';
    if (oldAddress && newAddress && oldAddress !== newAddress) {
      const checkUserStatus = async (walletAddress) => {
        const response = await register({ address: walletAddress })
        const exists = response?.data?.data?.exists ?? response?.data?.exists
        if (!exists) {
          eventBus.emit('showInvite', true);
        }
      }
      // 检查当前用户是否注册
      checkUserStatus(newAddress)
      return
    }

    if (oldAddress && !newAddress) {
      console.log('钱包已断开连接，刷新页面...')
      // window.location.reload()
      return
    }
  },
  { flush: 'post', immediate: true }
)

const isMobile = ref(false)

const checkIsMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 768
  }
}

checkIsMobile()

watch(
  () => route.query.inviteCode,
  (inviteCode) => {
    if (inviteCode) {
      counterStore.inviteCode = String(inviteCode)
      console.log('App.vue: 从 URL 获取邀请码并保存到 store:', inviteCode)
    }
  },
  { immediate: true, flush: 'post' }
)

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)

  eventBus.on('showInvite', (show) => {
    showInvite.value = show
  })
  
  // 调试信息：检查路由和组件加载
  console.log('App.vue mounted:', {
    route: route.path,
    routeName: route.name,
    isMobile: isMobile.value,
    showHeader: showHeader.value,
    showFooterNav: showFooterNav.value
  })
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkIsMobile)
  }
  eventBus.off('showInvite')
})

const showHeader = computed(() => {
  return !route.meta?.hideHeader
})

const showFooterNav = computed(() => {
  return isMobile.value && !route.meta?.hideFooterNav
})

const needBottomPadding = computed(() => {
  return isMobile.value && !route.meta?.hideFooterNav
})


</script>

<template>
  <div class="app-wrapper" :class="{ 'has-footer-nav': needBottomPadding }">
    <Header v-if="showHeader" />
    <navBar2 v-if="!isMobile && showHeader" />
    <RouterView />
    <Footer v-if="!isMobile" />
    <FooterNav v-if="showFooterNav" />
    <Invite v-model="showInvite" />
  </div>
</template>

<style scoped lang="scss">
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

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
