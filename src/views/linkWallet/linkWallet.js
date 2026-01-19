import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useConnect, useChainId, useAccount, useDisconnect } from '@wagmi/vue'
import { injected } from '@wagmi/vue/connectors'
import { useThemeStore } from '../../stores/theme'
import { useCounterStore } from '@/stores/counter'
import { register } from '@/api/API'
import { eventBus } from '@/utils/eventBus'
import { readContract } from '@wagmi/core'
import { config } from '@/wagmi.ts'
import networks from '@/assets/json/networks.json'
import nodeManagerABI from '@/assets/abi/nodeManagerABI.json'

const BSC_CHAIN_ID = 56

import logoLight from '@/assets/icon/logo.png'
import logoDark from '@/assets/icon/logoDark.png'

export const wallets = [
  {
    name: 'TokenPocket',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzY4IiBoZWlnaHQ9Ijc2OCIgdmlld0JveD0iMCAwIDc2OCA3NjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI3NjgiIGhlaWdodD0iNzY4IiBmaWxsPSIjMjk4MEZFIi8+CjxwYXRoIGQ9Ik0zMjUuNDc5IDIxMi42NzZIMzIxLjk2MUgxMzQuMzI0QzEyNS4zODQgMjEyLjY3NiAxMTguMTU2IDIxOS45MDQgMTE4LjE1NiAyMjguODQzVjI5NC40NjRDMTE4LjE1NiAzMDMuNDAzIDEyNS4zODQgMzEwLjYzMSAxMzQuMzI0IDMxMC42MzFIMTc4LjM1NkgxOTUuODU1VjMzMC4wMzJWNTM3LjczNkMxOTUuODU1IDU0Ni42NzUgMjAzLjA4MyA1NTMuOTAzIDIxMi4wMjIgNTUzLjkwM0gyODAuODc2QzI4OS44MTYgNTUzLjkwMyAyOTcuMDQ0IDU0Ni42NzUgMjk3LjA0NCA1MzcuNzM2VjMzMC4wMzJWMzI4LjIyNVYzMTAuNjMxSDMxNC41NDNIMzIxLjY3NUgzMjUuMTk0QzM1Mi4yMDMgMzEwLjYzMSAzNzQuMTcyIDI4OC42NjMgMzc0LjE3MiAyNjEuNjU0QzM3NC40NTcgMjM0LjY0NCAzNTIuNDg5IDIxMi42NzYgMzI1LjQ3OSAyMTIuNjc2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTUxMS40OTggMjEyLjY3NkM0MzYuNzQ4IDIxMi42NzYgMzc2LjA3MiAyNzMuMzUxIDM3Ni4wNzIgMzQ4LjEwMlY1MzcuMjZDMzc2LjA3MiA1NDYuMiAzODMuMyA1NTMuNDI4IDM5Mi4yNCA1NTMuNDI4SDQ2NC43MDhDNDczLjY0NyA1NTMuNDI4IDQ4MC44NzUgNTQ2LjIgNDgwLjg3NSA1MzcuMjZWNDgwLjA4Mkw0ODAuOTcgNDgwLjEwNFYzNDguMTAyQzQ4MC45NyAzMzEuMjY4IDQ5NC42NjUgMzE3LjU3NCA1MTEuNDk4IDMxNy41NzRDNTI4LjMzMSAzMTcuNTc0IDU0Mi4wMjYgMzMxLjI2OCA1NDIuMDI2IDM0OC4xMDJDNTQyLjAyNiAzNjIuMjcyIDUzMi40MjEgMzc0LjE2IDUxOS4yOTYgMzc3LjU4M0M1MTYuODI0IDM3OC4yNDkgNTE0LjE2MSAzNzguNjI5IDUxMS40OTggMzc4LjYyOUM1MTAuNzcxIDM3OC42MjkgNTEwLjEzIDM3OC42MyA1MDkuNDEgMzc4LjU0N1YzNzguNTM0QzQ5My41MjggMzc3LjQ4OCA0ODAuOTc1IDM2NC4yNjkgNDgwLjk3NSAzNDguMTAyVjQ4MC4xMDRDNDg0LjU4OSA0ODAuOTYgNDg4LjI5OCA0ODEuNjI1IDQ5Mi4xMDIgNDgyLjE5NkM0OTcuNDI3IDQ4Mi45NTcgNTAyLjk0MyA0ODMuNDMyIDUwOC40NTkgNDgzLjUyN0w1MTEuNSA0ODMuNTI4QzUxNC4xNjIgNDgzLjUyOCA1MTYuNzI5IDQ4My40MzIgNTE5LjI5NiA0ODMuMzM3QzU5MC40MzMgNDc5LjI0OCA2NDYuOTI0IDQyMC4yODQgNjQ2LjkyNCAzNDguMTAyQzY0Ny4wMTkgMjczLjM1MSA1ODYuMzQ0IDIxMi42NzYgNTExLjQ5OCAyMTIuNjc2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
    id: 'https://www.tokenpocket.pro/en/download/app'
  },
  {
    name: 'MetaMask',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAzNSAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyLjcwNzcgMzIuNzUyMkwyNS4xNjg4IDMwLjUxNzRMMTkuNDgzMyAzMy45MDA4TDE1LjUxNjcgMzMuODk5MUw5LjgyNzkzIDMwLjUxNzRMMi4yOTIyNSAzMi43NTIyTDAgMjUuMDQ4OUwyLjI5MjI1IDE2LjQ5OTNMMCA5LjI3MDk0TDIuMjkyMjUgMC4zMTIyNTZMMTQuMDY3NCA3LjMxNTU0SDIwLjkzMjZMMzIuNzA3NyAwLjMxMjI1NkwzNSA5LjI3MDk0TDMyLjcwNzcgMTYuNDk5M0wzNSAyNS4wNDg5TDMyLjcwNzcgMzIuNzUyMloiIGZpbGw9IiNGRjVDMTYiLz4KPHBhdGggZD0iTTIuMjkzOTUgMC4zMTIyNTZMMTQuMDY5MSA3LjMyMDQ3TDEzLjYwMDggMTIuMTMwMUwyLjI5Mzk1IDAuMzEyMjU2WiIgZmlsbD0iI0ZGNUMxNiIvPgo8cGF0aCBkPSJNOS44Mjk1OSAyNS4wNTIyTDE1LjAxMDYgMjguOTgxMUw5LjgyOTU5IDMwLjUxNzVWMjUuMDUyMloiIGZpbGw9IiNGRjVDMTYiLz4KPHBhdGggZD0iTTE0LjU5NjYgMTguNTU2NUwxMy42MDA5IDEyLjEzMzNMNy4yMjY5MiAxNi41MDA5TDcuMjIzNjMgMTYuNDk5M1YxNi41MDI1TDcuMjQzMzUgMjAuOTk4M0w5LjgyODA5IDE4LjU1NjVIOS44Mjk3NEgxNC41OTY2WiIgZmlsbD0iI0ZGNUMxNiIvPgo8cGF0aCBkPSJNMzIuNzA3NyAwLjMxMjI1NkwyMC45MzI2IDcuMzIwNDdMMjEuMzk5MyAxMi4xMzAxTDMyLjcwNzcgMC4zMTIyNTZaIiBmaWxsPSIjRkY1QzE2Ii8+CjxwYXRoIGQ9Ik0yNS4xNzIyIDI1LjA1MjJMMTkuOTkxMiAyOC45ODExTDI1LjE3MjIgMzAuNTE3NVYyNS4wNTIyWiIgZmlsbD0iI0ZGNUMxNiIvPgo8cGF0aCBkPSJNMjcuNzc2NiAxNi41MDI1SDI3Ljc3ODNIMjcuNzc2NlYxNi40OTkzTDI3Ljc3NSAxNi41MDA5TDIxLjQwMSAxMi4xMzMzTDIwLjQwNTMgMTguNTU2NUgyNS4xNzIyTDI3Ljc1ODYgMjAuOTk4M0wyNy43NzY2IDE2LjUwMjVaIiBmaWxsPSIjRkY1QzE2Ii8+CjxwYXRoIGQ9Ik05LjgyNzkzIDMwLjUxNzVMMi4yOTIyNSAzMi43NTIyTDAgMjUuMDUyMkg5LjgyNzkzVjMwLjUxNzVaIiBmaWxsPSIjRTM0ODA3Ii8+CjxwYXRoIGQ9Ik0xNC41OTQ3IDE4LjU1NDlMMTYuMDM0MSAyNy44NDA2TDE0LjAzOTMgMjIuNjc3N0w3LjIzOTc1IDIwLjk5ODRMOS44MjYxMyAxOC41NTQ5SDE0LjU5M0gxNC41OTQ3WiIgZmlsbD0iI0UzNDgwNyIvPgo8cGF0aCBkPSJNMjUuMTcyMSAzMC41MTc1TDMyLjcwNzggMzIuNzUyMkwzNS4wMDAxIDI1LjA1MjJIMjUuMTcyMVYzMC41MTc1WiIgZmlsbD0iI0UzNDgwNyIvPgo8cGF0aCBkPSJNMjAuNDA1MyAxOC41NTQ5TDE4Ljk2NTggMjcuODQwNkwyMC45NjA3IDIyLjY3NzdMMjcuNzYwMiAyMC45OTg0TDI1LjE3MjIgMTguNTU0OUgyMC40MDUzWiIgZmlsbD0iI0UzNDgwNyIvPgo8cGF0aCBkPSJNMCAyNS4wNDg4TDIuMjkyMjUgMTYuNDk5M0g3LjIyMTgzTDcuMjM5OTEgMjAuOTk2N0wxNC4wMzk0IDIyLjY3NkwxNi4wMzQzIDI3LjgzODlMMTUuMDA4OSAyOC45NzZMOS44Mjc5MyAyNS4wNDcySDBWMjUuMDQ4OFoiIGZpbGw9IiNGRjhENUQiLz4KPHBhdGggZD0iTTM1LjAwMDEgMjUuMDQ4OEwzMi43MDc4IDE2LjQ5OTNIMjcuNzc4M0wyNy43NjAyIDIwLjk5NjdMMjAuOTYwNyAyMi42NzZMMTguOTY1OCAyNy44Mzg5TDE5Ljk5MTIgMjguOTc2TDI1LjE3MjIgMjUuMDQ3MkgzNS4wMDAxVjI1LjA0ODhaIiBmaWxsPSIjRkY4RDVEIi8+CjxwYXRoIGQ9Ik0yMC45MzI1IDcuMzE1NDNIMTcuNDk5OUgxNC4wNjczTDEzLjYwMDYgMTIuMTI1MUwxNi4wMzQyIDI3LjgzNEgxOC45NjU2TDIxLjQwMDggMTIuMTI1MUwyMC45MzI1IDcuMzE1NDNaIiBmaWxsPSIjRkY4RDVEIi8+CjxwYXRoIGQ9Ik0yLjI5MjI1IDAuMzEyMjU2TDAgOS4yNzA5NEwyLjI5MjI1IDE2LjQ5OTNINy4yMjE4M0wxMy41OTkxIDEyLjEzMDFMMi4yOTIyNSAwLjMxMjI1NloiIGZpbGw9IiM2NjE4MDAiLz4KPHBhdGggZD0iTTEzLjE3IDIwLjQxOTlIMTAuOTM2OUw5LjcyMDk1IDIxLjYwNjJMMTQuMDQwOSAyMi42NzI3TDEzLjE3IDIwLjQxODJWMjAuNDE5OVoiIGZpbGw9IiM2NjE4MDAiLz4KPHBhdGggZD0iTTMyLjcwNzcgMC4zMTIyNTZMMzQuOTk5OSA5LjI3MDk0TDMyLjcwNzcgMTYuNDk5M0gyNy43NzgxTDIxLjQwMDkgMTIuMTMwMUwzMi43MDc3IDAuMzEyMjU2WiIgZmlsbD0iIzY2MTgwMCIvPgo8cGF0aCBkPSJNMjEuODMzIDIwLjQxOTlIMjQuMDY5NEwyNS4yODUzIDIxLjYwNzlMMjAuOTYwNCAyMi42NzZMMjEuODMzIDIwLjQxODJWMjAuNDE5OVoiIGZpbGw9IiM2NjE4MDAiLz4KPHBhdGggZD0iTTE5LjQ4MTcgMzAuODM2MkwxOS45OTExIDI4Ljk3OTRMMTguOTY1OCAyNy44NDIzSDE2LjAzMjdMMTUuMDA3MyAyOC45Nzk0TDE1LjUxNjcgMzAuODM2MiIgZmlsbD0iIzY2MTgwMCIvPgo8cGF0aCBkPSJNMTkuNDgxNiAzMC44MzU5VjMzLjkwMjFIMTUuNTE2NlYzMC44MzU5SDE5LjQ4MTZaIiBmaWxsPSIjQzBDNENEIi8+CjxwYXRoIGQ9Ik05LjgyOTU5IDMwLjUxNDJMMTUuNTIgMzMuOTAwOFYzMC44MzQ2TDE1LjAxMDYgMjguOTc3OEw5LjgyOTU5IDMwLjUxNDJaIiBmaWxsPSIjRTdFQkY2Ii8+CjxwYXRoIGQ9Ik0yNS4xNzIxIDMwLjUxNDJMMTkuNDgxNyAzMy45MDA4VjMwLjgzNDZMMTkuOTkxMSAyOC45Nzc4TDI1LjE3MjEgMzAuNTE0MloiIGZpbGw9IiNFN0VCRjYiLz4KPC9zdmc+Cg==',
    id: 'io.metamask'
  },
  {
    name: 'OKX Wallet',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII=',
    id: 'com.okex.wallet'
  },

  
]

export const useLinkWallet = () => {
  const router = useRouter()
  const { connect, connectors } = useConnect()
  const chainId = useChainId()
  const { status, address } = useAccount()
  const { disconnect } = useDisconnect()
  const themeStore = useThemeStore()
  const counterStore = useCounterStore()
  const isConnectingFromPage = ref(false)
  let stopWatchConnection = null

  const safeConnectors = computed(() => {
    const maybeRef = connectors?.value
    if (Array.isArray(maybeRef)) {
      return maybeRef
    }
    if (Array.isArray(connectors)) {
      return connectors
    }
    return []
  })

  const isDark = computed(() => themeStore.isDark)
  const logoUrl = computed(() => (isDark.value ? logoDark : logoLight))

  const handleClose = () => {
    router.back()
  }

  // navBar 的连接逻辑
  const wallconnects = async (walletId, targetChainId) => {
    const list = safeConnectors.value || []
    const connector = list.find((c) => c.id === walletId)
    const finalConnector = connector || injected()
    await connect({ connector: finalConnector, chainId: targetChainId })
  }

  // 调用注册接口检查用户状态
  const checkUserStatus = async (walletAddress) => {
    const response = await register({ address: walletAddress })
    // 读取合约中邀请人是否存在
    const inviter = await readContract(config, {
      address: networks.find(n => Number(n.chainId) === BSC_CHAIN_ID).proxyNodeManager,
      abi: nodeManagerABI,
      functionName: 'inviters',
      args: [walletAddress]
    })
    console.log("--------------------------------------------")
    // 如果用户没有绑定邀请码，则改变邀请弹窗的显示状态
    if (inviter == '0x0000000000000000000000000000000000000000') {
      eventBus.emit('showInvite', true)
    } else {
      // 如果已经绑定邀请码，清除邀请码
      counterStore.inviteCode = ''
    }
    await router.push('/')
  }

  const handleConnect = async (wallet) => {
    try {
      // 如果链接钱包就先断开
      if (status.value === 'connected' && address.value) {
        await disconnect()
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      isConnectingFromPage.value = true
      // 链接钱包
      await wallconnects(wallet.id, chainId.value)
      // 存储address，请求头需要携带
      localStorage.setItem('address', address.value)
      // 后端接口记录用户地址，合约检查是否绑定邀请用户
      await checkUserStatus(address.value)
      isConnectingFromPage.value = false
    } catch (error) {
      console.error('连接钱包失败:', error)
      isConnectingFromPage.value = false
    }
  }

  onMounted(async () => {
    if (status.value === 'connected' && address.value) {
      await disconnect()
    }

    if (safeConnectors.value && safeConnectors.value.length > 0) {
      console.log(
        '✅ Connectors已就绪:',
        safeConnectors.value.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type
        }))
      )
    } else {
      console.error('❌ Connectors未初始化或为空')
    }
  })

  onBeforeUnmount(() => {
    if (stopWatchConnection) {
      stopWatchConnection()
      stopWatchConnection = null
    }
  })

  return {
    logoUrl,
    wallets,
    isConnectingFromPage,
    handleConnect,
    handleClose
  }
}

