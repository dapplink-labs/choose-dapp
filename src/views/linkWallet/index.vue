<template>
  <div class="link-wallet-page">
    <!-- 右上角关闭按钮 -->
    <button class="close-btn" type="button" @click="handleClose">
      ✕
    </button>

    <!-- 欢迎卡片 / banner -->
    <div class="welcome-section">
      <div class="logo-box">
        <img :src="logoUrl" alt="CHOOSME Logo" class="logo-img" />
      </div>
      <h1 class="welcome-title">欢迎来到 CHOOSEME</h1>
      <div class="subtitle-row">
        <span class="subtitle-line"></span>
        <span class="welcome-subtitle">请选择登录方式</span>
        <span class="subtitle-line"></span>
      </div>
    </div>

    <!-- 钱包列表 -->
    <div class="wallet-list">
      <div
        v-for="wallet in wallets"
        :key="wallet.key"
        class="wallet-card"
        @click="handleConnect(wallet)"
      >
        <div class="wallet-info">
          <div class="wallet-icon-box">
            <img :src="wallet.icon" :alt="wallet.name" class="wallet-icon" />
          </div>
          <span class="wallet-name">{{ wallet.name }}</span>
        </div>
        <button class="connect-btn" type="button">
          链接
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useConnect, useChainId, useAccount } from '@wagmi/vue'
import { computed, ref, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

import logoLight from '@/assets/icon/logo.png'
import logoDark from '@/assets/icon/logo.png'
import walletIcon1 from '@/assets/icon/MetaMask.png'
import walletIcon2 from '@/assets/icon/OKX.png'
import walletIcon3 from '@/assets/icon/TP.png'

const router = useRouter()
const { connect, connectors } = useConnect()
const chainId = useChainId()
const { status } = useAccount()

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

const logoUrl = computed(() => (isDark.value ? logoDark : logoLight))

// 是否由当前页面发起连接，用于控制何时自动关闭页面
const isConnectingFromPage = ref(false)

// 页面展示的钱包列表（与 wagmi connector 绑定）
const wallets = [
  {
    key: 'metamask',
    name: 'Metamask',
    icon: walletIcon1,
    connectorId: 'io.metamask'
  },
  {
    key: 'okx',
    name: 'Okx Web3钱包',
    icon: walletIcon2,
    connectorId: 'com.okex.wallet'
  },
  {
    key: 'tp',
    name: 'TP钱包',
    icon: walletIcon3,
    connectorId: 'https://www.tokenpocket.pro/en/download/app'
  }
]

const handleClose = () => {
  router.back()
}

const handleConnect = async (wallet) => {
  try {
    isConnectingFromPage.value = true
    const connector = connectors.find(c => c.id === wallet.connectorId)

    if (connector && connect) {
      await connect({ connector, chainId })
    }
  } catch (error) {
    console.error('connect error', error)
    isConnectingFromPage.value = false
  }
}

// 监听 wagmi 连接状态，连接成功后再关闭当前页面
watch(
  () => status.value,
  (newStatus) => {
    if (isConnectingFromPage.value && newStatus === 'connected') {
      isConnectingFromPage.value = false
      router.back()
    }
  }
)
</script>

<style scoped lang="scss">
.link-wallet-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24px 16px 24px;
  background-color: var(--bg-page-h5, #FFFFFF);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.close-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--bg-page-h5, rgba(0, 0, 0, 0.04));
  color: var(--text-color, #333333);
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.welcome-section {
  margin-top: 40px;
  margin-bottom: 24px;
  padding: 24px 16px 28px;
  background-color: var(--bg-page-h5, #ffffff);
  border-radius: 12px;
  box-sizing: border-box;
  text-align: center;
}

.logo-box {
  width: 100%;
  border-radius: 12px;
  padding: 24px 8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.logo-img {
  max-width: 122px;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.welcome-title {
  margin: 0 0 24px;
  font-family: Lantinghei SC, Lantinghei SC;
  font-weight: 800;
  font-size: 20px;
  color: var(--text-color, #000000);
  text-align: center;
}

.subtitle-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.subtitle-line {
  flex: 1;
  height: 1px;
  background-color: #E5E5E5;
}

.welcome-subtitle {
  font-size: 12px;
  color: var(--text-dark-gray, #bbbbbb);
}

.wallet-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallet-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background-color: var(--bg-card, #f7f7f7);
  border-radius: 16px;
  box-sizing: border-box;
  cursor: pointer;
  border: 1px solid #f1f1f1;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wallet-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wallet-icon {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.wallet-name {
  font-size: 15px;
  color: var(--text-color, #333333);
}

.connect-btn {
  min-width: 76px;
  height: 34px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background-color: #c1272e;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
</style>
