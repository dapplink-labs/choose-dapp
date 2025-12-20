<template>
  <div class="user-info-page">
    <!-- 右上角固定 close 按钮 -->
    <div class="close-icon-fixed">
      <img :src="currentCloseIcon" alt="关闭" class="icon-img" @click="handleClose" />
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <img :src="userAvatar" alt="用户头像" class="avatar" />
        <div class="user-details">
          <div class="username">{{ username }}</div>
          <div class="wallet-address" @click="copyWalletAddress">
            {{ walletAddress }}
          </div>
        </div>
      </div>
      <div class="action-icons">
        <img :src="currentSettingIcon" alt="设置" class="icon-img" @click="handleSettings" />
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list">
      <!-- 上半部分（带虚线框分组） -->
      <div class="menu-group menu-group-top">
        <div v-for="item in topMenuItems" :key="item.key" class="menu-item" @click="handleMenuClick(item)">
          <img :src="item.icon" :alt="item.label" class="menu-icon" />
          <span class="menu-text">{{ item.label }}</span>
        </div>
      </div>

      <div class="menu-divider"></div>
      <!-- 中部分（普通列表） -->
      <div v-if="isFromFooter" class="menu-group menu-group-bottom">
        <div v-for="item in middleMenuItems" :key="item.key" class="menu-item" @click="handleMenuClick(item)">
          <img :src="item.icon" :alt="item.label" class="menu-icon" />
          <span class="menu-text">{{ item.label }}</span>
        </div>
      </div>
      <div v-if="isFromFooter" class="menu-divider"></div>

      <!-- 下半部分（普通列表） -->
      <div class="menu-group menu-group-bottom">
        <div v-for="item in bottomMenuItems" :key="item.key" class="menu-item" @click="handleMenuClick(item)">
          <img :src="item.icon" :alt="item.label" class="menu-icon" />
          <span class="menu-text">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 友链模块（仅底部导航"更多"页面显示） -->
    <div v-if="isFromFooter" class="friend-links">
      <a v-for="(link, idx) in friendLinks" :key="idx" href="javascript:void(0)" class="friend-link"
        :aria-label="link.label">
        <img :src="link.icon" :alt="link.label" />
      </a>
    </div>

    <!-- 断开链接按钮 -->
    <div class="disconnect-section">
      <button class="disconnect-btn" @click="handleDisconnect">断开链接</button>
    </div>

    <!-- Invite邀请码组件 -->
    <Invite
      v-model="showInvite"
      v-model:invite-code="inviteCode"
      @confirm="handleInviteConfirm"
      @skip="handleInviteSkip"
      @close="handleInviteClose"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAccount, useDisconnect } from '@wagmi/vue'
import { useThemeStore } from '@/stores/theme'
import Invite from '@/components/Invite.vue'

// 图标资源 - 亮色
import settingIcon from '@/assets/icon/setting.png'
import closeIcon from '@/assets/icon/close.png'
import icon1 from '@/assets/icon/1.png'
import icon2 from '@/assets/icon/2.png'
import icon3 from '@/assets/icon/3.png'
import icon4 from '@/assets/icon/4.png'
import icon5 from '@/assets/icon/5.png'
import icon6 from '@/assets/icon/6.png'
import icon7 from '@/assets/icon/7.png'
import icon8 from '@/assets/icon/8.png'
import icon9 from '@/assets/icon/9.png'
import friend1 from '@/assets/icon/Facebook.png'
import friend2 from '@/assets/icon/ins.png'
import friend3 from '@/assets/icon/in.png'
import friend4 from '@/assets/icon/dy.png'
import friend5 from '@/assets/icon/Twitter.png'
import friend6 from '@/assets/icon/YouTube.png'
// 图标资源 - 暗色
import settingIconDark from '@/assets/icon/settingDark.png'
import closeIconDark from '@/assets/icon/closeDark.png'
import icon1Dark from '@/assets/icon/1Dark.png'
import icon2Dark from '@/assets/icon/2Dark.png'
import icon3Dark from '@/assets/icon/3Dark.png'
import icon4Dark from '@/assets/icon/4Dark.png'
import icon5Dark from '@/assets/icon/5Dark.png'
import icon6Dark from '@/assets/icon/6Dark.png'
import icon7Dark from '@/assets/icon/7Dark.png'
import icon8Dark from '@/assets/icon/8Dark.png'
import icon9Dark from '@/assets/icon/9Dark.png'
import friend1Dark from '@/assets/icon/FacebookDark.png'
import friend2Dark from '@/assets/icon/insDark.png'
import friend3Dark from '@/assets/icon/inDark.png'
import friend4Dark from '@/assets/icon/dyDark.png'
import friend5Dark from '@/assets/icon/TwitterDark.png'
import friend6Dark from '@/assets/icon/YouTubeDark.png'

const router = useRouter()
const route = useRoute()
const { address } = useAccount()
const { disconnect } = useDisconnect()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 判断是否来自底部导航的"更多"页面
const isFromFooter = computed(() => {
  return route.query.from === 'footer' || route.meta?.fromFooter
})

// Invite组件控制
const showInvite = ref(false)
const inviteCode = ref('')

// 用户信息
const username = ref('johnsmith2025')
const walletAddress = computed(() => {
  if (address.value) {
    return `${address.value.slice(0, 6)}....${address.value.slice(-4)}`
  }
  return '0xf6a0....CfbA'
})

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
    alert('钱包地址已复制到剪贴板')
  } catch (e) {
    console.error('复制地址失败', e)
    alert('复制失败，请手动复制')
  }
}

// 顶部操作图标（随主题切换）
const currentSettingIcon = computed(() =>
  isDark.value ? settingIconDark : settingIcon
)
const currentCloseIcon = computed(() =>
  isDark.value ? closeIconDark : closeIcon
)

// 第一张图的菜单配置（8个菜单项，无友链）
const baseMenuItems1 = [
  {
    key: 'computing-power-services',
    label: '节点质押',
    icon: icon1,
    iconDark: icon1Dark,
    path: '/computing-power-services'
  },
  {
    key: 'LPVault',
    label: 'LP金库',
    icon: icon2,
    iconDark: icon2Dark,
    path: '/LPVault'
  },
  {
    key: 'dashboard',
    label: '数据看板',
    icon: icon3,
    iconDark: icon3Dark,
    path: '/dashboard'
  },
  {
    key: 'create',
    label: '创建预测市场',
    icon: icon4,
    iconDark: icon4Dark,
    path: '/create'
  },
  {
    key: 'fund',
    label: '资金管理',
    icon: icon5,
    iconDark: icon5Dark,
    path: '/'
  },
  {
    key: 'accuracy',
    label: '准确度',
    icon: icon6,
    iconDark: icon6Dark,
    path: '/accuracy'
  },
  {
    key: 'leaderboard',
    label: '领先看板',
    icon: icon7,
    iconDark: icon7Dark,
    path: '/leaderboard'
  },
  {
    key: 'terms',
    label: '使用条款',
    icon: icon8,
    iconDark: icon8Dark,
    path: '/terms'
  }
]

// 第二张图的菜单配置（9个菜单项，有友链）
const baseMenuItems2 = [
  {
    key: 'computing-power-services',
    label: '节点质押',
    icon: icon1,
    iconDark: icon1Dark,
    path: '/computing-power-services'
  },
  {
    key: 'LPVault',
    label: 'LP金库',
    icon: icon2,
    iconDark: icon2Dark,
    path: '/LPVault'
  },
  {
    key: 'dashboard',
    label: '数据看板',
    icon: icon3,
    iconDark: icon3Dark,
    path: '/dashboard'
  },
  {
    key: 'create',
    label: '创建预测市场',
    icon: icon4,
    iconDark: icon4Dark,
    path: '/create'
  },
  {
    key: 'leaderboard',
    label: '领先看板',
    icon: icon7,
    iconDark: icon7Dark,
    path: '/leaderboard'
  },
  {
    key: 'fund',
    label: '奖励',
    icon: icon5,
    iconDark: icon5Dark,
    path: '/'
  },
  {
    key: 'accuracy',
    label: '准确度',
    icon: icon6,
    iconDark: icon6Dark,
    path: '/accuracy'
  },
  {
    key: 'doc',
    label: '文档',
    icon: icon9,
    iconDark: icon9Dark,
    path: '/doc'
  },
  {
    key: 'terms',
    label: '使用条款',
    icon: icon8,
    iconDark: icon8Dark,
    path: '/terms'
  }
]

// 根据来源选择菜单配置
const baseMenuItems = computed(() => {
  return isFromFooter.value ? baseMenuItems2 : baseMenuItems1
})

// 根据主题返回实际使用的菜单项（图标随主题切换）
const menuItems = computed(() =>
  baseMenuItems.value.map(item => ({
    ...item,
    icon: isDark.value ? item.iconDark : item.icon
  }))
)

// 根据来源分组菜单项
const topMenuItems = computed(() => {
  if (isFromFooter.value) {
    // 第二张图：前4个一组
    return menuItems.value.slice(0, 4)
  } else {
    // 第一张图：前4个一组
    return menuItems.value.slice(0, 4)
  }
})

const middleMenuItems = computed(() => {
  if (isFromFooter.value) {
    // 第二张图：中间2个一组（领先看板、奖励）
    return menuItems.value.slice(4, 6)
  }
})

const bottomMenuItems = computed(() => {
  if (isFromFooter.value) {
    // 第二张图：最后3个一组（准确度、文档、使用条款）
    return menuItems.value.slice(6)
  } else {
    // 第一张图：最后2个一组（领先看板、使用条款）
    return menuItems.value.slice(4)
  }
})

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
  console.log('点击菜单项：', item)
  
  // 如果是奖励菜单项，打开Invite组件
  if (item.key === 'fund') {
    showInvite.value = true
    return
  }
  
  // 其他菜单项的路由跳转
  if (item.path) {
    router.push(item.path)
  }
}

// 处理断开链接
const handleDisconnect = () => {
  // 调用 wagmi 断开钱包连接
  disconnect()
  // 返回首页，header 会根据连接状态自动更新
  router.push('/')
}

// 处理邀请码确定
const handleInviteConfirm = (code) => {
  console.log('确认邀请码：', code)
  showInvite.value = false
}

// 处理邀请码跳过
const handleInviteSkip = () => {
  console.log('跳过邀请码')
  showInvite.value = false
}

// 处理邀请码关闭
const handleInviteClose = () => {
  console.log('关闭邀请码弹窗')
  showInvite.value = false
}
</script>

<style scoped lang="scss">
.user-info-page {
  min-height: 100vh;
  background-color: var(--bg-page-h5, #FFFFFF);
  padding: 16px;
  padding-top: 16px; // 不显示 header，从顶部开始
  padding-bottom: 16px; // 不显示底部导航栏
  box-sizing: border-box;

  .user-card {
    background: var(--bg-page-h5, #ffffff);
    padding: 17px;
    box-sizing: border-box;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-color, #E0E0E0);

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
          color: var(--text-color, #333);
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .wallet-address {
          font-size: 12px;
          color: var(--text-dark-gray, #999);
          line-height: 1.4;
          word-break: break-all;
        }
      }
    }

    .action-icons {
      display: flex;
      align-items: center;
      margin-right: 40px;

      .icon-img {
        width: 16px;
        height: 16px;
        cursor: pointer;
        transition: opacity 0.2s;

        &:active {
          opacity: 0.6;
        }
      }
    }
  }

  .menu-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 16px;

    .menu-group {
      background: var(--bg-page-h5, #ffffff);
      overflow: hidden;
    }

    .menu-group-bottom {
      border: 1px solid transparent;
    }

    .menu-item {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      min-height: 52px;
      box-sizing: border-box;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: var(--bg-light, #f5f5f5);
      }

      .menu-icon {
        width: 14px;
        height: 14px;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .menu-text {
        flex: 1;
        font-size: 14px;
        color: var(--text-color, #333);
      }
    }
  }

  .disconnect-section {
    padding: 16px 0;

    .disconnect-btn {
      width: 100%;
      height: 48px;
      border-radius: 8px;
      border: 1px solid var(--border-color, #E0E0E0);
      background: var(--bg-page-h5, #ffffff);
      color: #C1272E;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:active {
        opacity: 0.8;
        background-color: rgba(193, 39, 46, 0.05);
      }
    }
  }
}

.friend-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin: 8px 0 16px;

  .friend-link {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 24px;
      height: 24px;
      display: block;
    }
  }
}

.close-icon-fixed {
  position: fixed;
  top: 52px;
  right: 30px;
  z-index: 1100;

  .icon-img {
    width: 16px;
    height: 16px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.6;
    }
  }
}

.menu-divider {
  width: 100%;
  height: 1px;
  background-color: var(--border-color, #E0E0E0);
}
</style>
