import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConnect, useChainId, useAccount, useConfig } from '@wagmi/vue'
// @ts-ignore 路径别名在 TS 中无类型声明
import { useThemeStore } from '../../stores/theme'

import logoLight from '@/assets/icon/logo.png'
import logoDark from '@/assets/icon/logo.png'
import walletIcon1 from '@/assets/icon/MetaMask.png'
import walletIcon2 from '@/assets/icon/OKX.png'
import walletIcon3 from '@/assets/icon/TP.png'

type WalletItem = {
  key: 'metamask' | 'okx' | 'tp'
  name: string
  icon: string
  rdns: string
  deepLink: {
    ios: string
    android: string
    universal?: string
  }
  downloadLinks: {
    ios: string
    android: string
    website: string
  }
}

type AnyConnector = {
  id?: string
  name?: string
  type?: string
  rdns?: string
}

// 页面展示的钱包列表（与 wagmi connector 绑定）
export const wallets: WalletItem[] = [
  {
    key: 'metamask',
    name: 'Metamask',
    icon: walletIcon1,
    rdns: 'io.metamask',
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
    rdns: 'com.okx.wallet',
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
    rdns: 'pro.tokenpocket',
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
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  )
}

const isIOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  return /iphone|ipad|ipod/i.test(userAgent.toLowerCase())
}

const isAndroid = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  return /android/i.test(userAgent.toLowerCase())
}

// 检测是否在钱包内置浏览器中
const isInWalletBrowser = () => {
  const ua = navigator.userAgent.toLowerCase()
  const isMetaMask = ua.includes('metamask')
  const isOKX = ua.includes('okex') || ua.includes('okx')
  const isTP = ua.includes('tokenpocket') || ua.includes('tpoutside')
  return isMetaMask || isOKX || isTP
}

// Deep Link 唤起钱包
const openWalletApp = (wallet: WalletItem) => {
  return new Promise((resolve, reject) => {
    const deepLink = wallet.deepLink
    if (!deepLink) {
      reject(new Error('No deep link configured'))
      return
    }

    const currentUrl = window.location.href
    let linkToOpen = ''

    if (isIOS()) {
      if (wallet.key === 'okx' || wallet.key === 'tp') {
        linkToOpen = `${deepLink.ios}${encodeURIComponent(currentUrl)}`
      } else if (wallet.key === 'metamask') {
        linkToOpen = deepLink.universal
          ? `${deepLink.universal}${encodeURIComponent(currentUrl)}`
          : deepLink.ios
      } else {
        linkToOpen = deepLink.universal
          ? `${deepLink.universal}${encodeURIComponent(currentUrl)}`
          : deepLink.ios
      }
    } else if (isAndroid()) {
      if (wallet.key === 'okx' || wallet.key === 'tp') {
        linkToOpen = `${deepLink.android}${encodeURIComponent(currentUrl)}`
      } else {
        linkToOpen = deepLink.android || deepLink.universal || deepLink.ios
      }
    } else {
      linkToOpen = deepLink.universal || deepLink.ios || deepLink.android
    }

    const startTime = Date.now()
    let hasLeftPage = false

    const visibilityChangeHandler = () => {
      if (document.hidden) {
        hasLeftPage = true
        cleanup()
        resolve(true)
      }
    }

    const blurHandler = () => {
      hasLeftPage = true
      cleanup()
      resolve(true)
    }

    const cleanup = () => {
      document.removeEventListener('visibilitychange', visibilityChangeHandler)
      window.removeEventListener('blur', blurHandler)
    }

    document.addEventListener('visibilitychange', visibilityChangeHandler)
    window.addEventListener('blur', blurHandler)

    try {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = linkToOpen
      document.body.appendChild(iframe)
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 2000)
      window.location.href = linkToOpen
    } catch (error) {
      console.error('Failed to open deep link:', error)
    }

    setTimeout(() => {
      cleanup()
      const timeElapsed = Date.now() - startTime
      if (!hasLeftPage && timeElapsed >= 2500) {
        reject(new Error('App not installed'))
      } else if (hasLeftPage) {
        resolve(true)
      }
    }, 3000)
  })
}

// 下载提示
const showDownloadPrompt = (wallet: WalletItem) => {
  const downloadLinks = wallet.downloadLinks
  if (!downloadLinks) return

  let downloadUrl = downloadLinks.website

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

// 根据页面上点击的钱包类型，从 wagmi connectors 中找到最合适的 connector
const findConnectorByWalletKey = (walletKey: WalletItem['key'], safeConnectors: AnyConnector[]) => {
  const list: AnyConnector[] = safeConnectors || []
  if (!list.length) return null

  const matchByIdOrName = (ids: string[] = [], names: string[] = []) =>
    list.find((c: AnyConnector) => {
      const id = (c.id || '').toString().toLowerCase()
      const name = (c.name || '').toString().toLowerCase()
      if (ids.some((t) => t.toLowerCase() === id)) return true
      if (names.some((t) => name.includes(t.toLowerCase()))) return true
      return false
    })

  if (walletKey === 'metamask') {
    const mm = matchByIdOrName(['metaMask', 'metamask'], ['metamask'])
    if (mm) return mm
  }

  if (walletKey === 'okx') {
    const okx = matchByIdOrName(['okxWallet', 'okx'], ['okx'])
    if (okx) return okx
  }

  if (walletKey === 'tp') {
    const tp = matchByIdOrName(['tokenPocket', 'tp'], ['tokenpocket', 'tp'])
    if (tp) return tp
  }

  return list.find((c) => c.type === 'injected') || null
}

export const useLinkWallet = () => {
  const router = useRouter()
  const wagmiConfig = useConfig()
  const { connect, connectors } = useConnect()
  const chainId = useChainId()
  const { status } = useAccount()
  const themeStore = useThemeStore()

  const isConnectingFromPage = ref(false)

  const safeConnectors = computed<AnyConnector[]>(() => {
    if (connectors && (connectors as any).value && (connectors as any).value.length > 0) {
      return (connectors as any).value as AnyConnector[]
    }
    if (wagmiConfig && (wagmiConfig as any).connectors && (wagmiConfig as any).connectors.length > 0) {
      return (wagmiConfig as any).connectors as AnyConnector[]
    }
    return []
  })

  const isDark = computed(() => themeStore.isDark)
  const logoUrl = computed(() => (isDark.value ? logoDark : logoLight))

  const handleClose = () => {
    router.back()
  }

  const handleConnect = async (wallet: WalletItem) => {
    try {
      isConnectingFromPage.value = true

      if (!safeConnectors.value || safeConnectors.value.length === 0) {
        alert('钱包连接器未就绪。\n\n可能原因：\n1. Wagmi配置未正确加载\n2. 请检查网络连接\n3. 尝试刷新页面\n\n如问题持续，请查看控制台日志')
        isConnectingFromPage.value = false
        return
      }

      if (isMobile()) {
        if (isInWalletBrowser()) {
          const injectedConnector = findConnectorByWalletKey(wallet.key, safeConnectors.value)

          if (injectedConnector && connect) {
            try {
              await connect({ connector: injectedConnector as any, chainId: chainId.value as any })
            } catch (error: any) {
              alert(`连接失败: ${error?.message || '未知错误'}`)
              isConnectingFromPage.value = false
            }
          } else {
            alert('未找到钱包连接器')
            isConnectingFromPage.value = false
          }
        } else {
          try {
            await openWalletApp(wallet)
            const walletConnectConnector = safeConnectors.value.find((c) => c.type === 'walletConnect')

            if (walletConnectConnector && connect) {
              try {
                await new Promise((resolve) => setTimeout(resolve, 500))
                await connect({ connector: walletConnectConnector as any, chainId: chainId.value as any })
              } catch (error: any) {
                if (error.message && !error.message.includes('User rejected')) {
                  alert(`连接失败: ${error.message}`)
                }
                isConnectingFromPage.value = false
              }
            } else {
              alert('未找到WalletConnect连接器')
              isConnectingFromPage.value = false
            }
          } catch (error) {
            showDownloadPrompt(wallet)
            isConnectingFromPage.value = false
          }
        }
      } else {
        let walletInstalled = false

        if (wallet.rdns === 'io.metamask') {
          if ((window as any).ethereum?.isMetaMask) {
            walletInstalled = true
          }
        } else if (wallet.rdns === 'com.okx.wallet') {
          if ((window as any).okxwallet) {
            walletInstalled = true
          } else if ((window as any).okex) {
            walletInstalled = true
          } else if ((window as any).ethereum?.isOkxWallet) {
            walletInstalled = true
          }
        } else if (wallet.rdns === 'pro.tokenpocket') {
          if ((window as any).tokenpocket) {
            walletInstalled = true
          } else if ((window as any).ethereum?.isTokenPocket) {
            walletInstalled = true
          } else if ((window as any).ethereum?.isTP) {
            walletInstalled = true
          }
        }

        if (!walletInstalled) {
          const shouldDownload = confirm(`未检测到${wallet.name}浏览器扩展，是否前往下载？`)
          if (shouldDownload) {
            window.open(wallet.downloadLinks.website, '_blank')
          }
          isConnectingFromPage.value = false
          return
        }

        const targetConnector = findConnectorByWalletKey(wallet.key, safeConnectors.value)

        if (targetConnector && connect) {
          try {
            await connect({ connector: targetConnector as any, chainId: chainId.value as any })
          } catch (error: any) {
            alert(`连接失败: ${error?.message || '未知错误'}`)
            isConnectingFromPage.value = false
          }
        } else {
          alert('未找到钱包连接器')
          isConnectingFromPage.value = false
        }
      }
    } catch (error: any) {
      alert(`连接失败: ${error?.message || '未知错误'}`)
      isConnectingFromPage.value = false
    }
  }

  onMounted(() => {
    if (safeConnectors.value && safeConnectors.value.length > 0) {
      console.log('✅ Connectors已就绪:', safeConnectors.value.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type
      })))
    } else {
      console.error('❌ Connectors未初始化或为空')
    }
  })

  watch(
    () => safeConnectors.value,
    (newConnectors) => {
      console.log('Connectors更新:', newConnectors?.map((c: AnyConnector) => ({
        id: c.id,
        name: c.name,
        type: c.type
      })))
    },
    { immediate: true }
  )

  watch(
    () => status.value,
    (newStatus) => {
      if (isConnectingFromPage.value && newStatus === 'connected') {
        isConnectingFromPage.value = false
        router.back()
      }
    }
  )

  return {
    logoUrl,
    wallets,
    isConnectingFromPage,
    handleConnect,
    handleClose
  }
}

