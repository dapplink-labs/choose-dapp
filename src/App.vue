<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAccount, useDisconnect } from '@wagmi/vue'
import navBar from "./components/navBar.vue"
import navBar2 from "./components/navBar2.vue"
import Header from "./components/header.vue"
import Footer from "./components/footer.vue"
import FooterNav from "./components/footerNav.vue"
import Invite from "./components/Invite.vue"
import { eventBus } from '@/utils/eventBus'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const route = useRoute()
const counterStore = useCounterStore()
const { showInvite } = storeToRefs(counterStore)
const { disconnect } = useDisconnect()
const { address } = useAccount()
const isWalletConnecting = ref(false)
const router = useRouter()

// 用于记录当前是否正在连接钱包
eventBus.on('wallet-connecting', (connecting) => {
  isWalletConnecting.value = connecting
})

// 用于记录当前钱包地址变化
watch(
  () => address.value,
  async (newAddress, oldAddress) => {

    if (isWalletConnecting.value) {
      console.log('正在连接钱包中，暂时忽略地址变化')
      return
    }

    console.log('newAddress', newAddress)
    console.log('oldAddress', oldAddress)

    if (!oldAddress && newAddress) {
      // 用户首次连接钱包操作
      localStorage.setItem('address', newAddress)
    } else if (oldAddress && newAddress && oldAddress !== newAddress) {
      // 用户切换钱包操作
      counterStore.inviteCode = '';
      localStorage.removeItem('address')
      router.replace('/')
    } else if (oldAddress && !newAddress) {
      // 已经断开钱包连接操作
      counterStore.inviteCode = '';
      localStorage.removeItem('address')
      router.replace('/')
    }
  },
  // 每次地址变化时，保存到 localStorage
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
  // console.log('App.vue mounted:', {
  //   route: route.path,
  //   routeName: route.name,
  //   isMobile: isMobile.value,
  //   showHeader: showHeader.value,
  //   showFooterNav: showFooterNav.value
  // })
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
      box-sizing: border-box;

      @media (max-width: 480px) {
        padding-bottom: 56px;
        box-sizing: border-box;
      }
    }
  }
}
</style>
