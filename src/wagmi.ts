import { http, createConfig, createStorage } from '@wagmi/vue'
import { walletConnect, injected } from '@wagmi/vue/connectors'
import { defineChain, fallback } from 'viem'

// ✅ 1. 定义各链
const cpChain = defineChain({
  id: 86606,// CPChain 测试网 Chain ID
  name: 'CPChain Testnet',
  nativeCurrency: { name: 'CPChain', symbol: 'CP', decimals: 18 },// 本链的原生代币信息，name 是代币名称，symbol 是代币符号，decimals 是小数位数
  rpcUrls: { default: { http: ['https://rpc-testnet.cpchain.com'] } },// RPC URL 列表，用于与区块链网络进行通信
  blockExplorers: {// 区块浏览器信息，包含名称和 URL
    default: {
      name: 'CP Explorer',
      url: 'https://explorer-testnet.cpchain.com',
    },
  },
  testnet: true,
})

const sepolia = defineChain({
  id: 11155111,
  name: 'Sepolia Testnet',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://eth-sepolia.g.alchemy.com/v2/afSCtxPWD3NE5vSjJm2GQ'] } },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  },
  testnet: true,
})

const optimism = defineChain({
  id: 11155420,
  name: 'Optimism Sepolia',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://opt-sepolia.g.alchemy.com/v2/afSCtxPWD3NE5vSjJm2GQ'] } },
  blockExplorers: {
    default: {
      name: 'OP Explorer',
      url: 'https://sepolia-optimism.etherscan.io',
    },
  },
  testnet: true,
})

const bsc = defineChain({
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://bsc-dataseed.binance.org'
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

// ✅ 2. 构建 wagmi config
// createConfig 用于创建 wagmi 的配置对象
export const config = createConfig({
  chains: [cpChain, sepolia, optimism, bsc],// 配置支持的区块链网络
  connectors: [
    injected(), // ✅ 添加 injected 连接器支持 MetaMask 等浏览器钱包
    walletConnect({// WalletConnect 连接器与injected 连接器类似，允许用户通过 WalletConnect 协议连接他们的移动钱包或其他支持 WalletConnect 的钱包。
      projectId: 'f87cf4373910e1766c873dc5df019573',// ✅ 替换为你的 WalletConnect 项目 ID
    }),
  ],
  // ✅ 使用本地存储保存连接状态，key 为 'vite-vue'
  storage: createStorage({ storage: localStorage, key: 'vite-vue' }),
  transports: {
    [cpChain.id]: http(cpChain.rpcUrls.default.http[0]),
    [sepolia.id]: http(sepolia.rpcUrls.default.http[0]),
    [optimism.id]: http(optimism.rpcUrls.default.http[0]),
    [bsc.id]: fallback([
      http('https://bsc-dataseed.binance.org')
    ])
  },
})

// ✅ 3. 类型注入
declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}