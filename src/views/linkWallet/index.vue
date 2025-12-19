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
import { useConnect, useChainId, useAccount, useConfig } from '@wagmi/vue'
import { computed, ref, watch, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

import logoLight from '@/assets/icon/logo.png'
import logoDark from '@/assets/icon/logo.png'
import walletIcon1 from '@/assets/icon/MetaMask.png'
import walletIcon2 from '@/assets/icon/OKX.png'
import walletIcon3 from '@/assets/icon/TP.png'

const router = useRouter()
const wagmiConfig = useConfig()
const { connect, connectors } = useConnect()
const chainId = useChainId()
const { status } = useAccount()

// 确保connectors是响应式引用，如果未定义则初始化为空数组
// 优先使用useConnect返回的connectors，如果为空则从config中获取
const safeConnectors = computed(() => {
  // 从useConnect获取
  if (connectors && connectors.value && connectors.value.length > 0) {
    return connectors.value
  }
  // 从config获取
  if (wagmiConfig && wagmiConfig.connectors && wagmiConfig.connectors.length > 0) {
    return wagmiConfig.connectors
  }
  return []
})

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
    rdns: 'io.metamask', // 用于PC端识别injected钱包
    deepLink: {
      ios: 'metamask://',
      android: 'metamask://',
      universal: 'https://metamask.app.link/dapp/'
    },
    downloadLinks: {
      ios: 'https://apps.apple.com/app/metamask/id1438144202',
      android: 'https://play.google.com/store/apps/details?id=io.metamask',
      website: 'https://metamask.io/download/'
    }
  },
  {
    key: 'okx',
    name: 'Okx Web3钱包',
    icon: walletIcon2,
    rdns: 'com.okx.wallet', // OKX钱包的正确rdns标识
    deepLink: {
      ios: 'okx://wallet/dapp/url?dappUrl=',
      android: 'okx://wallet/dapp/url?dappUrl=',
      universal: 'https://www.okx.com/download'
    },
    downloadLinks: {
      ios: 'https://apps.apple.com/app/okx-buy-bitcoin-btc-crypto/id1327268470',
      android: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
      website: 'https://www.okx.com/download'
    }
  },
  {
    key: 'tp',
    name: 'TP钱包',
    icon: walletIcon3,
    rdns: 'pro.tokenpocket', // TokenPocket钱包的rdns标识
    deepLink: {
      ios: 'tpoutside://wap?url=',
      android: 'tpoutside://wap?url=',
      universal: 'https://tokenpocket.pro/download'
    },
    downloadLinks: {
      ios: 'https://apps.apple.com/app/tp-global-wallet/id6444625622',
      android: 'https://play.google.com/store/apps/details?id=vip.mytokenpocket',
      website: 'https://www.tokenpocket.pro/en/download/app'
    }
  }
]

// 移动端检测工具函数
const isMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
}

// 检测是否为iOS设备
const isIOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return /iphone|ipad|ipod/i.test(userAgent.toLowerCase())
}

// 检测是否为Android设备
const isAndroid = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return /android/i.test(userAgent.toLowerCase())
}

// 尝试通过Deep Link唤起钱包APP
const openWalletApp = (wallet) => {
  return new Promise((resolve, reject) => {
    const deepLink = wallet.deepLink
    if (!deepLink) {
      reject(new Error('No deep link configured'))
      return
    }

    // 获取当前页面URL用于deep link
    const currentUrl = window.location.href
    let linkToOpen = ''

    console.log('=== Deep Link配置 ===')
    console.log('钱包:', wallet.name)
    console.log('当前URL:', currentUrl)
    console.log('Deep Link配置:', deepLink)

    // 根据设备类型选择合适的链接
    if (isIOS()) {
      // iOS: 对于OKX和TP，使用scheme + 当前URL
      if (wallet.key === 'okx') {
        linkToOpen = `${deepLink.ios}${encodeURIComponent(currentUrl)}`
      } else if (wallet.key === 'tp') {
        linkToOpen = `${deepLink.ios}${encodeURIComponent(currentUrl)}`
      } else if (wallet.key === 'metamask') {
        linkToOpen = deepLink.universal ? `${deepLink.universal}${encodeURIComponent(currentUrl)}` : deepLink.ios
      } else {
        linkToOpen = deepLink.universal ? `${deepLink.universal}${encodeURIComponent(currentUrl)}` : deepLink.ios
      }
    } else if (isAndroid()) {
      // Android: 对于OKX和TP，使用scheme + 当前URL
      if (wallet.key === 'okx') {
        linkToOpen = `${deepLink.android}${encodeURIComponent(currentUrl)}`
      } else if (wallet.key === 'tp') {
        linkToOpen = `${deepLink.android}${encodeURIComponent(currentUrl)}`
      } else {
        linkToOpen = deepLink.android || deepLink.universal
      }
    } else {
      linkToOpen = deepLink.universal || deepLink.ios
    }
    
    console.log('最终Deep Link:', linkToOpen)

    // 记录尝试打开的时间
    const startTime = Date.now()
    let hasLeftPage = false

    // 监听页面可见性变化
    const visibilityChangeHandler = () => {
      if (document.hidden) {
        hasLeftPage = true
        cleanup()
        resolve(true) // 页面被隐藏，说明APP被唤起
      }
    }

    // 监听页面失焦
    const blurHandler = () => {
      hasLeftPage = true
      cleanup()
      resolve(true) // 页面失焦，说明APP被唤起
    }

    // 清理事件监听
    const cleanup = () => {
      document.removeEventListener('visibilitychange', visibilityChangeHandler)
      window.removeEventListener('blur', blurHandler)
    }

    // 添加事件监听
    document.addEventListener('visibilitychange', visibilityChangeHandler)
    window.addEventListener('blur', blurHandler)

    // 尝试打开Deep Link
    try {
      // 创建隐藏的iframe来触发deep link（兼容性更好）
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = linkToOpen
      document.body.appendChild(iframe)

      // 2秒后移除iframe
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 2000)

      // 同时尝试直接打开链接
      window.location.href = linkToOpen
    } catch (error) {
      console.error('Failed to open deep link:', error)
    }

    // 设置超时检测（3秒后如果页面没有被隐藏，认为APP未安装）
    setTimeout(() => {
      cleanup()
      const timeElapsed = Date.now() - startTime
      
      // 如果页面没有离开且时间超过2.5秒，认为APP未安装
      if (!hasLeftPage && timeElapsed >= 2500) {
        reject(new Error('App not installed'))
      } else if (hasLeftPage) {
        resolve(true)
      }
    }, 3000)
  })
}

// 显示下载提示
const showDownloadPrompt = (wallet) => {
  const downloadLinks = wallet.downloadLinks
  if (!downloadLinks) return

  let downloadUrl = downloadLinks.website

  // 根据设备类型选择下载链接
  if (isIOS()) {
    downloadUrl = downloadLinks.ios || downloadLinks.website
  } else if (isAndroid()) {
    downloadUrl = downloadLinks.android || downloadLinks.website
  }

  const message = `检测到您尚未安装${wallet.name}，是否前往下载？`
  
  if (confirm(message)) {
    window.open(downloadUrl, '_blank')
  }
}

const handleClose = () => {
  router.back()
}

// 组件挂载时检查connectors初始化状态
onMounted(() => {
  console.log('=== 钱包连接页面初始化 ===')
  console.log('wagmiConfig:', wagmiConfig)
  console.log('connectors from useConnect:', connectors)
  console.log('connectors.value:', connectors?.value)
  console.log('config.connectors:', wagmiConfig?.connectors)
  console.log('safeConnectors:', safeConnectors.value)
  console.log('safeConnectors length:', safeConnectors.value?.length)
  
  if (safeConnectors.value && safeConnectors.value.length > 0) {
    console.log('✅ Connectors已就绪:', safeConnectors.value.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type
    })))
  } else {
    console.error('❌ Connectors未初始化或为空')
  }
})

// 监听connectors变化
watch(
  () => safeConnectors.value,
  (newConnectors) => {
    console.log('Connectors更新:', newConnectors?.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type
    })))
  },
  { immediate: true }
)

// 检查钱包是否在移动端钱包内置浏览器中
const isInWalletBrowser = () => {
  const ua = navigator.userAgent.toLowerCase()
  console.log('检测钱包内置浏览器, UserAgent:', ua)
  
  // 检测各种钱包的UserAgent特征
  const isMetaMask = ua.includes('metamask')
  const isOKX = ua.includes('okex') || ua.includes('okx')
  const isTP = ua.includes('tokenpocket') || ua.includes('tpoutside')
  
  console.log('钱包检测结果:', { isMetaMask, isOKX, isTP })
  
  return isMetaMask || isOKX || isTP
}

// 检测当前是否在特定钱包的内置浏览器中
const detectWalletBrowser = () => {
  const ua = navigator.userAgent.toLowerCase()
  
  if (ua.includes('metamask')) return 'metamask'
  if (ua.includes('okex') || ua.includes('okx')) return 'okx'
  if (ua.includes('tokenpocket') || ua.includes('tpoutside')) return 'tp'
  
  return null
}

const handleConnect = async (wallet) => {
  try {
    isConnectingFromPage.value = true
    console.log('=== 开始连接钱包 ===')
    console.log('目标钱包:', wallet.name)
    console.log('connectors原始值:', connectors)
    console.log('connectors.value:', connectors?.value)
    console.log('wagmiConfig.connectors:', wagmiConfig?.connectors)
    console.log('safeConnectors.value:', safeConnectors.value)
    
    // 检查connectors是否可用
    if (!safeConnectors.value || safeConnectors.value.length === 0) {
      console.error('❌ Connectors未初始化或为空')
      console.error('调试信息:', {
        connectors: connectors,
        'connectors?.value': connectors?.value,
        'wagmiConfig': wagmiConfig,
        'wagmiConfig?.connectors': wagmiConfig?.connectors,
        'safeConnectors.value': safeConnectors.value
      })
      alert('钱包连接器未就绪。\n\n可能原因：\n1. Wagmi配置未正确加载\n2. 请检查网络连接\n3. 尝试刷新页面\n\n如问题持续，请查看控制台日志')
      isConnectingFromPage.value = false
      return
    }
    
    console.log('✅ 可用的connectors:', safeConnectors.value.map(c => ({ id: c.id, name: c.name, type: c.type })))

    // 检测是否为移动端
    if (isMobile()) {
      console.log('移动端设备检测到')
      
      // 检查是否在钱包内置浏览器中
      const walletBrowserType = detectWalletBrowser()
      
      if (isInWalletBrowser()) {
        console.log('在钱包内置浏览器中，使用injected connector')
        console.log('检测到的钱包类型:', walletBrowserType)
        console.log('目标钱包:', wallet.key)
        
        // 在钱包内置浏览器中，直接使用injected connector
        const injectedConnector = safeConnectors.value.find(c => c.type === 'injected')
        
        if (injectedConnector && connect) {
          try {
            console.log('使用injected connector连接:', injectedConnector.name)
            await connect({ connector: injectedConnector, chainId: chainId.value })
            console.log('✅ 移动端内置浏览器连接成功')
          } catch (error) {
            console.error('❌ Injected连接失败:', error)
            console.error('错误详情:', {
              message: error.message,
              code: error.code,
              stack: error.stack
            })
            alert(`连接失败: ${error.message || '未知错误'}`)
            isConnectingFromPage.value = false
          }
        } else {
          console.error('❌ 未找到injected connector')
          alert('未找到钱包连接器')
          isConnectingFromPage.value = false
        }
      } else {
        console.log('在普通移动端浏览器中，尝试唤起APP并使用WalletConnect')
        
        try {
          // 尝试唤起钱包APP
          await openWalletApp(wallet)
          console.log('钱包APP已唤起')
          
          // 使用WalletConnect connector进行连接
          const walletConnectConnector = safeConnectors.value.find(c => c.type === 'walletConnect')
          
          if (walletConnectConnector && connect) {
            console.log('找到WalletConnect connector，开始连接')
            try {
              // 给用户一点时间切换到钱包APP
              await new Promise(resolve => setTimeout(resolve, 500))
              await connect({ connector: walletConnectConnector, chainId: chainId.value })
              console.log('WalletConnect连接成功')
            } catch (error) {
              console.error('WalletConnect连接失败:', error)
              // 如果WalletConnect连接失败，可能是用户取消或超时
              if (error.message && !error.message.includes('User rejected')) {
                alert(`连接失败: ${error.message}`)
              }
              isConnectingFromPage.value = false
            }
          } else {
            console.error('未找到WalletConnect connector')
            alert('未找到WalletConnect连接器')
            isConnectingFromPage.value = false
          }
          
        } catch (error) {
          // APP未安装，显示下载提示
          console.log('钱包APP未安装，显示下载提示')
          showDownloadPrompt(wallet)
          isConnectingFromPage.value = false
        }
      }
    } else {
      // PC端：使用浏览器扩展的injected connector
      console.log('PC端设备检测到，使用浏览器扩展')
      console.log('目标钱包rdns:', wallet.rdns)
      
      // 详细检测钱包安装情况
      console.log('=== 钱包扩展检测 ===')
      console.log('window.ethereum:', window.ethereum)
      console.log('window.ethereum?.isMetaMask:', window.ethereum?.isMetaMask)
      console.log('window.okxwallet:', window.okxwallet)
      console.log('window.okex:', window.okex)
      console.log('window.tokenpocket:', window.tokenpocket)
      console.log('window.ethereum?.isTokenPocket:', window.ethereum?.isTokenPocket)
      
      // 检查是否安装了对应的钱包扩展
      let walletProvider = null
      let walletInstalled = false
      
      if (wallet.rdns === 'io.metamask') {
        // MetaMask检测
        if (window.ethereum?.isMetaMask) {
          walletInstalled = true
          walletProvider = window.ethereum
          console.log('✅ 检测到MetaMask扩展')
        }
      } else if (wallet.rdns === 'com.okx.wallet') {
        // OKX钱包检测 - 支持多种可能的注入方式
        if (window.okxwallet) {
          walletInstalled = true
          walletProvider = window.okxwallet
          console.log('✅ 检测到OKX扩展 (window.okxwallet)')
        } else if (window.okex) {
          walletInstalled = true
          walletProvider = window.okex
          console.log('✅ 检测到OKX扩展 (window.okex)')
        } else if (window.ethereum?.isOkxWallet) {
          walletInstalled = true
          walletProvider = window.ethereum
          console.log('✅ 检测到OKX扩展 (window.ethereum.isOkxWallet)')
        }
      } else if (wallet.rdns === 'pro.tokenpocket') {
        // TokenPocket钱包检测 - 支持多种可能的注入方式
        if (window.tokenpocket) {
          walletInstalled = true
          walletProvider = window.tokenpocket
          console.log('✅ 检测到TokenPocket扩展 (window.tokenpocket)')
        } else if (window.ethereum?.isTokenPocket) {
          walletInstalled = true
          walletProvider = window.ethereum
          console.log('✅ 检测到TokenPocket扩展 (window.ethereum.isTokenPocket)')
        } else if (window.ethereum?.isTP) {
          walletInstalled = true
          walletProvider = window.ethereum
          console.log('✅ 检测到TokenPocket扩展 (window.ethereum.isTP)')
        }
      }
      
      if (!walletInstalled) {
        console.warn(`❌ 未检测到${wallet.name}扩展`)
        const shouldDownload = confirm(`未检测到${wallet.name}浏览器扩展，是否前往下载？`)
        if (shouldDownload) {
          window.open(wallet.downloadLinks.website, '_blank')
        }
        isConnectingFromPage.value = false
        return
      }
      
      console.log('钱包提供者对象:', walletProvider)
      
      // 尝试根据rdns查找匹配的connector
      let targetConnector = null
      
      // 首先尝试通过rdns精确匹配
      targetConnector = safeConnectors.value.find(c => {
        console.log(`检查connector: id=${c.id}, name=${c.name}, type=${c.type}`)
        // 检查connector的rdns属性
        if (c.rdns === wallet.rdns) {
          console.log(`✅ 找到匹配的connector (rdns): ${c.name}`)
          return true
        }
        return false
      })
      
      // 如果没有找到精确匹配，使用injected类型的connector
      if (!targetConnector) {
        console.log('未找到rdns匹配的connector，使用injected类型')
        targetConnector = safeConnectors.value.find(c => c.type === 'injected')
      }
      
      if (targetConnector && connect) {
        try {
          console.log(`使用connector连接: id=${targetConnector.id}, name=${targetConnector.name}`)
          await connect({ connector: targetConnector, chainId: chainId.value })
          console.log('✅ PC端连接成功')
        } catch (error) {
          console.error('❌ PC端连接失败:', error)
          console.error('错误详情:', {
            message: error.message,
            code: error.code,
            stack: error.stack
          })
          alert(`连接失败: ${error.message || '未知错误'}`)
          isConnectingFromPage.value = false
        }
      } else {
        console.error('❌ 未找到可用的connector')
        alert('未找到钱包连接器')
        isConnectingFromPage.value = false
      }
    }
  } catch (error) {
    console.error('连接过程发生错误:', error)
    alert(`连接失败: ${error.message || '未知错误'}`)
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
