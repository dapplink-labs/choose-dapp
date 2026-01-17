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
        <img :src="isDark ? getIcon('29Dark') : getIcon('29')" :alt="$t('common.share')" class="icon-img" @click="handleShare" />
        <img :src="isDark ? getIcon('settingDark') : getIcon('setting')" :alt="$t('common.settings')" class="icon-img"
          @click="handleSettings" />
        <img :src="isDark ? getIcon('closeDark') : getIcon('close')" :alt="$t('common.close')" class="icon-img"
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

    <!-- 分享邀请码弹窗 -->
    <ShareInvitationCode v-model="showShareModal" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccount, useDisconnect } from '@wagmi/vue'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import ShareInvitationCode from '@/components/ShareInvitationCode.vue'

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

// 分享邀请码弹窗状态
const showShareModal = ref(false)

const userAvatar = computed(() => {
  return address.value
    ? `https://effigy.im/a/${address.value}.svg`
    : '/src/assets/icon/avatar.png'
})

// 点击钱包地址复制
const copyWalletAddress = async () => {
  if (!address.value) return
  const fullAddress = address.value

  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(fullAddress)
    ElMessage.success(t('userInfo.walletAddressCopied'))
  }
}

// 生态系统菜单配置
const baseEcosystemItems = computed(() => [
  {
    key: 'computing-power-services',
    label: t('userInfo.stakingPool'),
    icon: getIcon('1'),
    iconDark: getIcon("1Dark"),
    path: '/computing-power-services'
  },
  {
    key: 'LPVault',
    label: t('userInfo.lpVault'),
    icon: getIcon('2'),
    iconDark: getIcon("2Dark"),
    path: '/LPVault'
  },
  {
    key: 'dashboard',
    label: t('userInfo.onChainData'),
    icon: getIcon('3'),
    iconDark: getIcon("3Dark"),
    path: '/dashboard'
  },
  {
    key: 'create',
    label: t('userInfo.predictionMarket'),
    icon: getIcon('4'),
    iconDark: getIcon("4Dark"),
    path: '/create'
  },
  {
    key: 'fund',
    label: t('userInfo.assets'),
    icon: getIcon('5'),
    iconDark: getIcon("5Dark"),
    path: '/asset-management'
  },
  {
    key: 'event-pool',
    label: t('userInfo.eventPool'),
    icon: getIcon('6'),
    iconDark: getIcon("6Dark"),
    path: '/'
  },
  {
    key: 'launchpad',
    label: t('userInfo.launchpad'),
    icon: getIcon('14'),
    iconDark: getIcon("14Dark"),
    path: '/'
  },
  {
    key: 'smart-money',
    label: t('userInfo.smartMoney'),
    icon: getIcon('15'),
    iconDark: getIcon("15Dark"),
    path: '/'
  },
  {
    key: 'borrow',
    label: t('userInfo.borrow'),
    icon: getIcon('30'),
    iconDark: getIcon("30Dark"),
    path: '/'
  },
  {
    key: 'earn',
    label: t('userInfo.earn'),
    icon: getIcon('31'),
    iconDark: getIcon("31Dark"),
    path: '/'
  },
  {
    key: 'strategyTrading',
    label: t('userInfo.strategyTrading'),
    icon: getIcon('32'),
    iconDark: getIcon("32Dark"),
    path: '/'
  },
  {
    key: 'copyTrading',
    label: t('userInfo.copyTrading'),
    icon: getIcon('33'),
    iconDark: getIcon("33Dark"),
    path: '/'
  },
  {
    key: 'airdrop',
    label: t('userInfo.airdrop'),
    icon: getIcon('34'),
    iconDark: getIcon("34Dark"),
    path: '/'
  },
  {
    key: 'academy',
    label: t('userInfo.academy'),
    icon: getIcon('35'),
    iconDark: getIcon("35Dark"),
    path: '/'
  },
  {
    key: 'nft',
    label: t('userInfo.nft'),
    icon: getIcon('36'),
    iconDark: getIcon("36Dark"),
    path: '/'
  },
])

const ecosystemItems = computed(() =>
  baseEcosystemItems.value.map(item => ({
    ...item,
    icon: isDark.value ? item.iconDark : item.icon
  }))
)

// 其他菜单配置
const baseOthersItems = computed(() => [
  {
    key: 'audit',
    label: t('userInfo.audit'),
    icon: getIcon('7'),
    iconDark: getIcon("7Dark"),
    path: '/'
  },
  {
    key: 'github',
    label: t('userInfo.github'),
    icon: getIcon('17'),
    iconDark: getIcon("17Dark"),
    path: '/'
  },
  {
    key: 'technical-support',
    label: t('userInfo.technicalSupport'),
    icon: getIcon('18'),
    iconDark: getIcon("18Dark"),
    path: '/'
  },
  {
    key: 'developer-contributions',
    label: t('userInfo.developerContributions'),
    icon: getIcon('12'),
    iconDark: getIcon("12Dark"),
    path: '/'
  },
  {
    key: 'tokenomics',
    label: t('userInfo.tokenomics'),
    icon: getIcon('13'),
    iconDark: getIcon("13Dark"),
    path: '/'
  },
  {
    key: 'bug-bounty',
    label: t('userInfo.bugBounty'),
    icon: getIcon('16'),
    iconDark: getIcon("16Dark"),
    path: '/'
  },
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
    icon: getIcon('19'),
    iconDark: getIcon("19Dark"),
    path: '/'
  },
  {
    key: 'product-feedback',
    label: t('userInfo.productFeedback'),
    icon: getIcon('20'),
    iconDark: getIcon("20Dark"),
    path: '/'
  },
  {
    key: 'api-management',
    label: t('userInfo.apiManagement'),
    icon: getIcon('21'),
    iconDark: getIcon("21Dark"),
    path: '/'
  },
  {
    key: 'help-center',
    label: t('userInfo.helpCenter'),
    icon: getIcon('22'),
    iconDark: getIcon("22Dark"),
    path: '/'
  },
  {
    key: 'customer-support',
    label: t('userInfo.customerSupport'),
    icon: getIcon('23'),
    iconDark: getIcon("23Dark"),
    path: '/'
  },
  {
    key: 'developer-docs',
    label: t('userInfo.developerDocs'),
    icon: getIcon('8'),
    iconDark: getIcon("8Dark"),
    path: '/doc'
  }
])

const supportItems = computed(() =>
  baseSupportItems.value.map(item => ({
    ...item,
    icon: isDark.value ? item.iconDark : item.icon
  }))
)


// choose me菜单配置
const baseChooseMeItems = computed(() => [
  {
    key: 'leaderboard',
    label: t('userInfo.leaderboard'),
    icon: getIcon('38'),
    iconDark: getIcon('38Dark'),
    path: '/leaderboard'
  },
  {
    key: 'reward',
    label: t('userInfo.reward'),
    icon: getIcon('25'),
    iconDark: getIcon('25Dark'),
    path: '/reward'
  },
  {
    key: 'accuracy',
    label: t('userInfo.accuracy'),
    icon: getIcon('26'),
    iconDark: getIcon('26Dark'),
    path: '/accuracy'
  },
  {
    key: 'terms',
    label: t('userInfo.terms'),
    icon: getIcon('27'),
    iconDark: getIcon('27Dark'),
    path: '/terms'
  }
])

const chooseMeItems = computed(() =>
  baseChooseMeItems.value.map(item => ({
    ...item,
    icon: isDark.value ? item.iconDark : item.icon
  }))
)

// 友链图标（使用 assets/icon 中的图片，随主题切换）
const baseFriendLinks = [
  { label: 'Facebook', icon: getIcon('Facebook'), iconDark: getIcon('FacebookDark') },
  { label: 'Instagram', icon: getIcon('ins'), iconDark: getIcon('insDark') },
  { label: 'LinkedIn', icon: getIcon('in'), iconDark: getIcon('inDark') },
  { label: 'TikTok', icon: getIcon('dy'), iconDark: getIcon('dyDark') },
  { label: 'Twitter', icon: getIcon('Twitter'), iconDark: getIcon('TwitterDark') },
  { label: 'YouTube', icon: getIcon('YouTube'), iconDark: getIcon('YouTubeDark') }
]

const friendLinks = computed(() =>
  baseFriendLinks.map(link => ({
    ...link,
    icon: isDark.value ? link.iconDark : link.icon
  }))
)

// 处理分享点击
const handleShare = () => {
  // 打开分享邀请码弹窗
  showShareModal.value = true
}

// 处理设置点击
const handleSettings = () => {
  router.push('/settings')
}

// 处理关闭点击
const handleClose = () => {
  router.push('/')
}

// 处理菜单项点击
const handleMenuClick = (item) => {
  // 菜单项的路由跳转
  if (item.path) {
    router.push(item.path)
  }
}

// 处理断开链接
const handleDisconnect = async () => {
  try {
    console.log('开始断开钱包连接...')
    // 调用 wagmi 断开钱包连接（异步操作）
    await disconnect()

    // 立即跳转到首页，不等待状态更新
    router.replace('/')
  } catch (error) {
    console.error('断开连接失败:', error)
    // 即使断开失败，也立即返回首页
    router.replace('/')
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
        width: 18px;
        height: 18px;
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

}
</style>
