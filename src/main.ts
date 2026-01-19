import { Buffer } from 'buffer'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { createApp } from 'vue'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import './styles/global.scss'
import i18n from "./languages"
// `@coinbase-wallet/sdk` uses `Buffer`
globalThis.Buffer = Buffer
import Vue3Marquee from 'vue3-marquee'
import App from './App.vue'
// import './style.css'
import { config } from './wagmi'

// 初始化 VConsole（用于手机端调试）
// 在开发环境或 URL 中包含 ?vconsole=1 时启用
const initVConsole = () => {
  // 检查 URL 参数
  const urlParams = new URLSearchParams(window.location.search)
  const vconsoleParam = urlParams.get('vconsole')
  
  // 判断是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // 判断是否为开发环境
  const isDev = import.meta.env.DEV
  
  // 如果满足以下任一条件，则启用 VConsole：
  // 1. URL 参数包含 vconsole=1
  // 2. 开发环境且是移动设备
  if (vconsoleParam === '1' || (isDev && isMobile)) {
    import('vconsole').then((module) => {
      const VConsole = module.default || module
      if (VConsole) {
        new VConsole({
          theme: 'dark', // 可选：'light' 或 'dark'
          defaultPlugins: ['system', 'network', 'element', 'storage'],
          maxLogNumber: 1000,
          onReady() {
            console.log('VConsole 已启用，可用于手机端调试')
          },
          onClearLog() {
            console.log('VConsole 日志已清除')
          }
        })
      }
    }).catch((err) => {
      console.error('VConsole 加载失败:', err)
    })
  }
}

// 初始化 VConsole
initVConsole()

// import "./utils/font.js"

// 模拟递增

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(ElementPlus)
app.use(WagmiPlugin, { config }).use(VueQueryPlugin, {})
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(Vue3Marquee)

// 初始化主题（必须在 pinia 安装后调用）
import { useThemeStore } from './stores/theme'
import { nextTick } from 'vue'

app.mount('#app')

// 在应用挂载后应用主题
nextTick(() => {
  const themeStore = useThemeStore()
  themeStore.applyTheme()
})


