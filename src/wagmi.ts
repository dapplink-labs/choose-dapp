import { http, createConfig, createStorage } from '@wagmi/vue'
import { walletConnect, injected } from '@wagmi/vue/connectors'
import { defineChain, fallback } from 'viem'

const bsc = defineChain({
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://go.getblock.asia/8e87ac495a5941ae9dfb9ea6ed9ae7d2'
      ]
    }
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://bscscan.com',
    },
  },
  testnet: false,
})
const usdt = defineChain({
  id: 97,
  name: 'USDT',
  nativeCurrency: { name: 'USDT', symbol: 'USDT', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://go.getblock.io/00384bdf2ed44f53956c987b6866009e'
      ]
    }
  },
  blockExplorers: {
    default: {
      name: 'USDT',
      url: 'https://bnb-testnet.api.onfinality.io/public',
    },
  },
  testnet: false,
})
// ✅ 2. 构建 wagmi config
// createConfig 用于创建 wagmi 的配置对象
export const config = createConfig({
  chains: [bsc, usdt],// 配置支持的区块链网络
  // connectors: [
  //   // injected(), // ✅ 添加 injected 连接器支持 MetaMask 等浏览器钱包
  //   walletConnect({// WalletConnect 连接器与injected 连接器类似，允许用户通过 WalletConnect 协议连接他们的移动钱包或其他支持 WalletConnect 的钱包。
  //     projectId: 'f87cf4373910e1766c873dc5df019573',// ✅ 替换为你的 WalletConnect 项目 ID
  //   }),
  // ],
  // ✅ 使用本地存储保存连接状态，key 为 'vite-vue'
  // storage: createStorage({ storage: localStorage, key: 'vite-vue' }),
  transports: {
    [bsc.id]: fallback([
      http('https://go.getblock.asia/8e87ac495a5941ae9dfb9ea6ed9ae7d2')
    ]),
    [usdt.id]: fallback([
      http('https://go.getblock.io/00384bdf2ed44f53956c987b6866009e')
    ]),
  },
})

// ✅ 3. 类型注入
declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}