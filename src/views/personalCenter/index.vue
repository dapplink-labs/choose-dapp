<template>
  <div class="user-info-page">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <img :src="userAvatar" :alt="$t('common.userAvatar')" class="avatar" />
        <div class="user-details">
          <div class="username">{{ username }}</div>
          <div class="wallet-address" @click="copyWalletAddress">
            {{ walletAddress }}
          </div>
        </div>
      </div>
      <div class="action-icons">
        <img :src="isDark ? icon29Dark : icon29" :alt="$t('common.share')" class="icon-img"
          @click="handleShare" />
        <img :src="isDark ? settingIconDark : settingIcon" :alt="$t('common.settings')" class="icon-img"
          @click="handleSettings" />
        <img :src="isDark ? closeIconDark : closeIcon" :alt="$t('common.close')" class="icon-img"
          @click="handleClose" />
      </div>
    </div>

    <!-- Ecosystem 标题 -->
    <div class="section-title">{{ $t('userInfo.ecosystem') }}</div>

    <!-- Ecosystem 网格布局 -->
    <div class="section-grid">
      <div v-for="item in ecosystemItems" :key="item.key" class="section-item" @click="handleMenuClick(item)">
        <div class="section-icon-wrapper">
          <img :src="item.icon" :alt="item.label" class="section-icon" />
        </div>
        <div class="section-label">{{ item.label }}</div>
      </div>
    </div>

    <!-- Support 标题 -->
    <div class="section-title section-title-with-margin">{{ $t('userInfo.support') }}</div>

    <!-- Support 网格布局 -->
    <div class="section-grid">
      <div v-for="item in supportItems" :key="item.key" class="section-item" @click="handleMenuClick(item)">
        <div class="section-icon-wrapper">
          <img :src="item.icon" :alt="item.label" class="section-icon" />
        </div>
        <div class="section-label">{{ item.label }}</div>
      </div>
    </div>

    <!-- Others 标题 -->
    <div class="section-title">{{ $t('userInfo.others') }}</div>

    <!-- Others 网格布局 -->
    <div class="section-grid">
      <div v-for="item in othersItems" :key="item.key" class="section-item" @click="handleMenuClick(item)">
        <div class="section-icon-wrapper">
          <img :src="item.icon" :alt="item.label" class="section-icon" />
        </div>
        <div class="section-label">{{ item.label }}</div>
      </div>
    </div>

    <!-- Choose Me 标题 -->
    <div class="section-title">{{ $t('userInfo.chooseMe') }}</div>

    <!-- Choose Me 网格布局 -->
    <div class="section-grid">
      <div v-for="item in chooseMeItems" :key="item.key" class="section-item" @click="handleMenuClick(item)">
        <div class="section-icon-wrapper">
          <img :src="item.icon" :alt="item.label" class="section-icon" />
        </div>
        <div class="section-label">{{ item.label }}</div>
      </div>
    </div>

    <!-- Social links -->
    <div class="social-links">
      <a v-for="(link, idx) in friendLinks" :key="idx" href="javascript:void(0)" class="social-link"
        :aria-label="link.label">
        <img :src="link.icon" :alt="link.label" />
      </a>
    </div>

    <!-- Disconnect button -->
    <div class="disconnect-section">
      <button class="disconnect-btn" @click="handleDisconnect">{{ $t('userInfo.disconnectWallet') }}</button>
    </div>

    <!-- 语言选择弹窗 -->
    <transition name="slide-up">
      <div v-if="showLanguageModal" class="language-overlay" @click.self="closeLanguageModal">
        <div class="language-modal" @click.stop>
          <!-- 底部拖拽条 -->
          <div class="drag-handle"></div>
          
          <!-- 标题 -->
          <div class="language-title">{{ $t('userInfo.language') }}</div>
          
          <!-- 语言列表 -->
          <div class="language-list">
            <div 
              v-for="lang in languageOptions" 
              :key="lang.value"
              class="language-item"
              :class="{ active: locale === lang.value }"
              @click="selectLanguage(lang.value)"
            >
              <span class="language-name">{{ lang.label }}</span>
              <span v-if="locale === lang.value" class="check-icon">✓</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccount, useDisconnect } from '@wagmi/vue'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { locale, t } = useI18n()

// 批量导入 icon 资源，减少单独 import
const iconModules = import.meta.glob('@/assets/icon/*.{png,svg}', { eager: true })
const iconMap = Object.fromEntries(
  Object.entries(iconModules).map(([path, mod]) => {
    const fileName = path.split('/').pop() || path
    const name = fileName.replace(/\.(png|svg)$/i, '')
    return [name, mod.default]
  })
)
const getIcon = (name) => iconMap[name]

// 亮色 / 暗色图标引用
const settingIcon = getIcon('setting')
const closeIcon = getIcon('close')
const icon1 = getIcon('1')
const icon2 = getIcon('2')
const icon3 = getIcon('3')
const icon4 = getIcon('4')
const icon5 = getIcon('5')
const icon6 = getIcon('6')
const icon7 = getIcon('7')
const icon8 = getIcon('8')
const icon9 = getIcon('9')
const friend1 = getIcon('Facebook')
const friend2 = getIcon('ins')
const friend3 = getIcon('in')
const friend4 = getIcon('dy')
const friend5 = getIcon('Twitter')
const friend6 = getIcon('YouTube')

const settingIconDark = getIcon('settingDark')
const closeIconDark = getIcon('closeDark')
const icon1Dark = getIcon('1Dark')
const icon2Dark = getIcon('2Dark')
const icon3Dark = getIcon('3Dark')
const icon4Dark = getIcon('4Dark')
const icon5Dark = getIcon('5Dark')
const icon6Dark = getIcon('6Dark')
const icon7Dark = getIcon('7Dark')
const icon8Dark = getIcon('8Dark')
const icon9Dark = getIcon('9Dark')
const icon12 = getIcon('12')
const icon12Dark = getIcon('12Dark')
const icon13 = getIcon('13')
const icon13Dark = getIcon('13Dark')
const icon14 = getIcon('14')
const icon14Dark = getIcon('14Dark')
const icon15 = getIcon('15')
const icon15Dark = getIcon('15Dark')
const icon16 = getIcon('16')
const icon16Dark = getIcon('16Dark')
const icon17 = getIcon('17')
const icon17Dark = getIcon('17Dark')
const icon18 = getIcon('18')
const icon18Dark = getIcon('18Dark')
const icon19 = getIcon('19')
const icon19Dark = getIcon('19Dark')
const icon20 = getIcon('20')
const icon20Dark = getIcon('20Dark')
const icon21 = getIcon('21')
const icon21Dark = getIcon('21Dark')
const icon22 = getIcon('22')
const icon22Dark = getIcon('22Dark')
const icon23 = getIcon('23')
const icon23Dark = getIcon('23Dark')
const icon24 = getIcon('24')
const icon24Dark = getIcon('24Dark')
const icon25 = getIcon('25')
const icon25Dark = getIcon('25Dark')
const icon26 = getIcon('26')
const icon26Dark = getIcon('26Dark')
const icon27 = getIcon('27')
const icon27Dark = getIcon('27Dark')
const icon28 = getIcon('28')
const icon28Dark = getIcon('28Dark')
const icon29 = getIcon('29')
const icon29Dark = getIcon('29Dark')

const friend1Dark = getIcon('FacebookDark')
const friend2Dark = getIcon('insDark')
const friend3Dark = getIcon('inDark')
const friend4Dark = getIcon('dyDark')
const friend5Dark = getIcon('TwitterDark')
const friend6Dark = getIcon('YouTubeDark')

const router = useRouter()
const { address, status } = useAccount()
const { disconnect } = useDisconnect()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 用户信息
const username = ref('johnsmith2025')
const walletAddress = computed(() => {
  if (address.value) {
    return `${address.value.slice(0, 6)}....${address.value.slice(-4)}`
  }
  return '0xf6a0....CfbA'
})

// 语言选择弹窗状态
const showLanguageModal = ref(false)

// 语言选项列表
const languageOptions = [
  { value: 'zh-cn', label: '简体中文' },
  { value: 'en-us', label: 'English' },
  { value: 'ko-kr', label: '한국어' },
  { value: 'ja-jp', label: '日本語' }
]

const userAvatar = computed(() => {
  return address.value
    ? `https://effigy.im/a/${address.value}.svg`
    : '/src/assets/icon/avatar.png'
})

// 点击钱包地址复制
const copyWalletAddress = async () => {
  if (!address.value) return
  const fullAddress = address.value

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullAddress)
    } else {
      // 兼容旧浏览器
      const textarea = document.createElement('textarea')
      textarea.value = fullAddress
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    alert(t('userInfo.walletAddressCopied'))
  } catch (e) {
    console.error('复制地址失败', e)
    alert(t('userInfo.copyFailed'))
  }
}

// 生态系统菜单配置
const baseEcosystemItems = computed(() => [
  {
    key: 'computing-power-services',
    label: t('userInfo.stakingPool'),
    icon: icon1,
    iconDark: icon1Dark,
    path: '/computing-power-services'
  },
  {
    key: 'LPVault',
    label: t('userInfo.lpVault'),
    icon: icon2,
    iconDark: icon2Dark,
    path: '/LPVault'
  },
  {
    key: 'dashboard',
    label: t('userInfo.onChainData'),
    icon: icon3,
    iconDark: icon3Dark,
    path: '/dashboard'
  },
  {
    key: 'create',
    label: t('userInfo.predictionMarket'),
    icon: icon4,
    iconDark: icon4Dark,
    path: '/create'
  },
  {
    key: 'fund',
    label: t('userInfo.assets'),
    icon: icon5,
    iconDark: icon5Dark,
    path: '/'
  },
  {
    key: 'event-pool',
    label: t('userInfo.eventPool'),
    icon: icon6,
    iconDark: icon6Dark,
    path: '/'
  },
  {
    key: 'launchpad',
    label: t('userInfo.launchpad'),
    icon: icon14,
    iconDark: icon14Dark,
    path: '/'
  },
  {
    key: 'smart-money',
    label: t('userInfo.smartMoney'),
    icon: icon15,
    iconDark: icon15Dark,
    path: '/'
  }
])

const ecosystemItems = computed(() =>
  baseEcosystemItems.value.map(item => ({
    ...item,
    icon: isDark.value ? item.iconDark : item.icon
  }))
)

// choose me菜单配置
const baseChooseMeItems = computed(() => [
  {
    key: 'leaderboard',
    label: t('userInfo.leaderboard'),
    icon: icon7,
    iconDark: icon7Dark,
    path: '/leaderboard'
  },
  {
    key: 'reward',
    label: '奖励',
    icon: icon25,
    iconDark: icon25Dark,
    path: '/reward'
  },
  {
    key: 'accuracy',
    label: '准确度',
    icon: icon26,
    iconDark: icon26Dark,
    path: '/accuracy'
  },
  {
    key: 'terms',
    label: '使用条款',
    icon: icon27,
    iconDark: icon27Dark,
    path: '/terms'
  }
])

const chooseMeItems = computed(() =>
  baseChooseMeItems.value.map(item => ({
    ...item,
    icon: isDark.value ? item.iconDark : item.icon
  }))
)

// 其他菜单配置
const baseOthersItems = computed(() => [
  {
    key: 'audit',
    label: t('userInfo.audit'),
    icon: icon7,
    iconDark: icon7Dark,
    path: '/'
  },
  {
    key: 'github',
    label: t('userInfo.github'),
    icon: icon17,
    iconDark: icon17Dark,
    path: '/'
  },
  {
    key: 'technical-support',
    label: t('userInfo.technicalSupport'),
    icon: icon18,
    iconDark: icon18Dark,
    path: '/'
  },
  {
    key: 'developer-contributions',
    label: t('userInfo.developerContributions'),
    icon: icon12,
    iconDark: icon12Dark,
    path: '/'
  },
  {
    key: 'tokenomics',
    label: t('userInfo.tokenomics'),
    icon: icon13,
    iconDark: icon13Dark,
    path: '/'
  },
  {
    key: 'bug-bounty',
    label: t('userInfo.bugBounty'),
    icon: icon16,
    iconDark: icon16Dark,
    path: '/'
  },
  {
    key: 'language',
    label: t('userInfo.language'),
    icon: icon28,
    iconDark: icon28Dark,
    path: '',
    action: 'language'
  }
])

const othersItems = computed(() =>
  baseOthersItems.value.map(item => ({
    ...item,
    icon: isDark.value ? item.iconDark : item.icon
  }))
)

// 支持菜单配置
const baseSupportItems = computed(() => [
  {
    key: 'official-verification',
    label: t('userInfo.officialVerification'),
    icon: icon19,
    iconDark: icon19Dark,
    path: '/'
  },
  {
    key: 'product-feedback',
    label: t('userInfo.productFeedback'),
    icon: icon20,
    iconDark: icon20Dark,
    path: '/'
  },
  {
    key: 'api-management',
    label: t('userInfo.apiManagement'),
    icon: icon21,
    iconDark: icon21Dark,
    path: '/'
  },
  {
    key: 'help-center',
    label: t('userInfo.helpCenter'),
    icon: icon22,
    iconDark: icon22Dark,
    path: '/'
  },
  {
    key: 'customer-support',
    label: t('userInfo.customerSupport'),
    icon: icon23,
    iconDark: icon23Dark,
    path: '/'
  },
  {
    key: 'developer-docs',
    label: t('userInfo.developerDocs'),
    icon: icon8,
    iconDark: icon8Dark,
    path: '/doc'
  }
])

const supportItems = computed(() =>
  baseSupportItems.value.map(item => ({
    ...item,
    icon: isDark.value ? item.iconDark : item.icon
  }))
)

// 友链图标（使用 assets/icon 中的图片，随主题切换）
const baseFriendLinks = [
  { label: 'Facebook', icon: friend1, iconDark: friend1Dark },
  { label: 'Instagram', icon: friend2, iconDark: friend2Dark },
  { label: 'LinkedIn', icon: friend3, iconDark: friend3Dark },
  { label: 'TikTok', icon: friend4, iconDark: friend4Dark },
  { label: 'Twitter', icon: friend5, iconDark: friend5Dark },
  { label: 'YouTube', icon: friend6, iconDark: friend6Dark }
]

const friendLinks = computed(() =>
  baseFriendLinks.map(link => ({
    ...link,
    icon: isDark.value ? link.iconDark : link.icon
  }))
)

// 处理分享点击
const handleShare = () => {
  // 分享功能：可以复制链接或调用原生分享
  if (navigator.share) {
    navigator.share({
      title: 'ChooseMe',
      text: 'Check out ChooseMe',
      url: window.location.href
    }).catch(err => {
      console.log('分享失败:', err)
    })
  } else {
    // 如果不支持原生分享，可以复制链接到剪贴板
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    }).catch(err => {
      console.log('复制失败:', err)
    })
  }
}

// 处理设置点击
const handleSettings = () => {
  router.push('/settings')
}

// 处理关闭点击
const handleClose = () => {
  router.back()
}

// 处理菜单项点击
const handleMenuClick = (item) => {
  // 语言切换处理
  if (item.action === 'language') {
    handleLanguageSwitch()
    return
  }

  // 其他菜单项的路由跳转
  if (item.path) {
    router.push(item.path)
  }
}

// 打开语言选择弹窗
const handleLanguageSwitch = () => {
  showLanguageModal.value = true
}

// 关闭语言选择弹窗
const closeLanguageModal = () => {
  showLanguageModal.value = false
}

// 选择语言
const selectLanguage = (langValue) => {
  locale.value = langValue
  document.documentElement.setAttribute('data-lang', langValue)
  localStorage.setItem('app-locale', langValue)
  closeLanguageModal()
}

// 处理断开链接
const handleDisconnect = async () => {
  try {
    console.log('开始断开钱包连接...')
    // 调用 wagmi 断开钱包连接（异步操作）
    await disconnect()

    // 等待状态更新（给钱包扩展一些时间处理断开）
    await new Promise(resolve => setTimeout(resolve, 300))

    console.log('钱包已断开连接，状态:', status.value)

    // 返回首页，header 会根据连接状态自动更新
    router.push('/')
  } catch (error) {
    console.error('断开连接失败:', error)
    // 即使断开失败，也尝试返回首页
    router.push('/')
  }
}

// 初始化主题
onMounted(() => {
  themeStore.applyTheme()
})
</script>

<style scoped lang="scss">
.user-info-page {
  min-height: 100vh;
  background-color: var(--bg-page-h5, #FFFFFF);
  padding: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
  box-sizing: border-box;
  transition: background-color 0.3s ease;

  .user-card {
    background: transparent;
    padding: 17px 0;
    box-sizing: border-box;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .user-info {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 12px;

      .avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .user-details {
        flex: 1;
        min-width: 0;

        .username {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-color, #1a1a1a);
          margin-bottom: 4px;
          line-height: 1.4;
          transition: color 0.3s ease;
        }

        .wallet-address {
          font-size: 12px;
          color: var(--text-gray, #666);
          line-height: 1.4;
          word-break: break-all;
          cursor: pointer;
          transition: color 0.3s ease;
        }
      }
    }

    .action-icons {
      display: flex;
      align-items: center;
      gap: 16px;

      .icon-img {
        width: 20px;
        height: 20px;
        cursor: pointer;
        transition: opacity 0.2s;

        &:active {
          opacity: 0.6;
        }
      }
    }
  }

  // 统一的标题样式
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color, #1a1a1a);
    margin-bottom: 24px;
    transition: color 0.3s ease;

    &.section-title-with-margin {
      margin-top: 32px;
    }
  }

  // 统一的网格布局样式
  .section-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px 0px;
    padding-bottom: 36px;
    border-bottom: 1px solid var(--border-color, #F3F3F3);
    margin-bottom: 32px;

    // 统一的网格项样式
    .section-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.95);
      }

      // 统一的图标包装器样式
      .section-icon-wrapper {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;

        // 统一的图标样式
        .section-icon {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      // 统一的标签样式
      .section-label {
        font-size: 11px;
        color: var(--text-color, #1a1a1a);
        text-align: center;
        line-height: 1.4;
        transition: color 0.3s ease;
      }
    }
  }

  .social-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin: 26px 0 38px;
    padding: 0 8px;

    .social-link {
      width: 42px;
      height: 42px;
      border-radius: 8px;
      background: var(--bg-light, #F5F5F5);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;

      img {
        width: 18px;
        height: 18px;
        filter: grayscale(100%) brightness(1.1);
      }
    }
  }

  .disconnect-section {
    padding: 0 4px 12px;

    .disconnect-btn {
      width: 100%;
      height: 48px;
      border-radius: 10px;
      border: none;
      background: #ffffff;
      color: #1a1a1a;
      border: 1px solid var(--border-color, #E0E0E0);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:active {
        opacity: 0.85;
        transform: scale(0.99);
      }
    }
  }

  // 语言选择弹窗样式
  .language-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 999;
  }

  .language-modal {
    width: 100%;
    background-color: var(--bg-page-h5, #ffffff);
    border-radius: 20px 20px 0 0;
    padding: 20px 20px 28px;
    box-sizing: border-box;
    max-height: 80vh;
    overflow-y: auto;
  }

  .drag-handle {
    width: 40px;
    height: 4px;
    background-color: var(--border-color, #E0E0E0);
    border-radius: 2px;
    margin: 0 auto 20px;
  }

  .language-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color, #1a1a1a);
    margin-bottom: 24px;
    text-align: center;
  }

  .language-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .language-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--bg-light, #F3F3F3);
    cursor: pointer;
    transition: background-color 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: var(--bg-light, #F5F5F5);
    }

    &.active {
      .language-name {
        color: var(--text-color, #1a1a1a);
        font-weight: 500;
      }

      .check-icon {
        color: var(--text-color, #1a1a1a);
        font-weight: 600;
      }
    }
  }

  .language-name {
    font-size: 16px;
    color: var(--text-color, #333333);
  }

  .check-icon {
    font-size: 18px;
    color: var(--text-dark-gray, #999999);
  }

  // 底部弹窗动画
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: opacity 0.3s ease;

    .language-modal {
      transition: transform 0.3s ease;
    }
  }

  .slide-up-enter-from {
    opacity: 0;

    .language-modal {
      transform: translateY(100%);
    }
  }

  .slide-up-leave-to {
    opacity: 0;

    .language-modal {
      transform: translateY(100%);
    }
  }
}
</style>
