<template>
  <div class="personal-center-page">
    <div class="personal-center-header">
      <div class="profile-row">
        <img :src="userAvatar" :alt="$t('common.userAvatar')" class="profile-avatar" />
        <div class="profile-copy">
          <div class="profile-name-row">
            <div class="profile-name">{{ username }}</div>
            <img
              v-if="verificationBadge"
              :src="verificationBadge"
              :alt="$t('userInfo.officialVerification')"
              class="verification-badge"
            />
          </div>
          <button type="button" class="profile-address" @click="copyWalletAddress">
            {{ walletAddress }}
          </button>
        </div>
      </div>

      <div class="header-actions">
        <button
          v-if="!isComingSoon"
          type="button"
          class="icon-button"
          :aria-label="$t('common.settings')"
          @click="handleSettings"
        >
          <img :src="settingsIcon" :alt="$t('common.settings')" class="action-icon" />
        </button>
        <button
          type="button"
          class="icon-button"
          :aria-label="$t('common.close')"
          @click="handleClose"
        >
          <img :src="closeIcon" :alt="$t('common.close')" class="action-icon" />
        </button>
      </div>
    </div>

    <section v-for="section in sections" :key="section.title" class="menu-section">
      <h2 class="section-title">{{ section.title }}</h2>
      <div class="menu-grid">
        <button
          v-for="item in section.items"
          :key="item.key"
          type="button"
          class="menu-card"
          @click="handleMenuClick(item)"
        >
          <span class="menu-icon-shell">
            <img :src="item.icon" :alt="item.label" class="menu-icon" />
          </span>
          <span class="menu-label">{{ item.label }}</span>
        </button>
      </div>
    </section>

    <div class="social-row">
      <button
        v-for="link in socialLinks"
        :key="link.label"
        type="button"
        class="social-button"
        :aria-label="link.label"
        @click="goHref(link)"
      >
        <img :src="link.icon" :alt="link.label" class="social-icon" />
      </button>
    </div>

    <div class="disconnect-wrap">
      <PrimaryActionButton
        class="disconnect-btn"
        height="64px"
        radius="18px"
        font-size="18px"
        letter-spacing="0.02em"
        text-color="#141414"
        @click="handleDisconnect"
      >
        {{ $t('link.exit') }}
      </PrimaryActionButton>
    </div>

    <ShareInvitationCode v-model="showShareModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccount, useDisconnect } from '@wagmi/vue'
import { useI18n } from 'vue-i18n'
import Message from '@/utils/message'
import PrimaryActionButton from '@/components/PrimaryActionButton.vue'
import ShareInvitationCode from '@/components/ShareInvitationCode.vue'
import { readContract } from '@wagmi/core'
import { config } from '@/wagmi.ts'
import nodeManagerABI from '@/assets/abi/nodeManagerABI.json'
import networks from '@/assets/json/networks.js'

const BSC_CHAIN_ID = 56
const { t } = useI18n()
const router = useRouter()
const { address } = useAccount()
const { disconnect } = useDisconnect()
const isComingSoon = computed(() => import.meta.env.VITE_IS_COMING_SOON === 'true')

const iconModules = import.meta.glob('@/assets/new_icon/*.{png,svg}', { eager: true })
const iconMap = Object.fromEntries(
  Object.entries(iconModules).map(([path, mod]) => {
    const fileName = path.split('/').pop() || path
    const name = fileName.replace(/\.(png|svg)$/i, '')
    return [name, mod.default]
  }),
)
const getIcon = (name) => iconMap[name]

const randomNumber = ref(Math.floor(Math.random() * 10000))
const username = ref(`Choose Me ${randomNumber.value}`)
const showShareModal = ref(false)

const walletAddress = computed(() => {
  if (!address.value) return '0x000...0000'
  return `${address.value.slice(0, 6)}....${address.value.slice(-4)}`
})

const userAvatar = computed(() => {
  return address.value
    ? `https://effigy.im/a/${address.value}.svg`
    : '/src/assets/icon/noperson.png'
})

const settingsIcon = computed(() => getIcon('personal-center-settings'))
const closeIcon = computed(() => getIcon('personal-center-close'))
const verificationBadge = computed(() => getIcon('personal-center-verified-badge'))

const ecosystemItems = computed(() => [
  {
    key: 'node-purchase',
    label: t('userInfo.stakingPool'),
    icon: getIcon('personal-center-my-staking'),
    path: '/computing-power-services',
  },
  {
    key: 'my-earnings',
    label: t('userInfo.myEarnings'),
    icon: getIcon('personal-center-my-earnings'),
    path: '/my-earnings',
  },
  {
    key: 'lp-vault',
    label: t('userInfo.lpVault'),
    icon: getIcon('personal-center-my-staking'),
    path: '/LPVault',
  },
  {
    key: 'dashboard',
    label: t('userInfo.onChainData'),
    icon: getIcon('personal-center-on-chain-data'),
    path: '/dashboard',
  },
  {
    key: 'assets',
    label: t('userInfo.assets'),
    icon: getIcon('personal-center-on-chain-assets'),
    path: '/asset-management',
  },
  {
    key: 'event-pool',
    label: t('userInfo.eventPool'),
    icon: getIcon('personal-center-event-pool'),
    path: '/event-pool',
  },
  {
    key: 'launchpad',
    label: t('userInfo.launchpad'),
    icon: getIcon('personal-center-task-platform'),
    path: '/',
  },
  {
    key: 'smart-money',
    label: t('userInfo.smartMoney'),
    icon: getIcon('personal-center-smart-money'),
    path: '/',
  },
  {
    key: 'borrow',
    label: t('userInfo.borrow'),
    icon: getIcon('personal-center-borrow'),
    path: '/',
  },
  {
    key: 'earn',
    label: t('userInfo.earn'),
    icon: getIcon('personal-center-earn'),
    path: '/',
  },
  {
    key: 'strategyTrading',
    label: t('userInfo.strategyTrading'),
    icon: getIcon('personal-center-strategy-trading'),
    path: '/',
  },
  {
    key: 'copyTrading',
    label: t('userInfo.copyTrading'),
    icon: getIcon('personal-center-copy-trading'),
    path: '/',
  },
  {
    key: 'airdrop',
    label: t('userInfo.airdrop'),
    icon: getIcon('personal-center-airdrop'),
    path: '/',
  },
  {
    key: 'academy',
    label: t('userInfo.academy'),
    icon: getIcon('personal-center-academy'),
    path: '/',
  },
  {
    key: 'nft',
    label: t('userInfo.nft'),
    icon: getIcon('personal-center-nft'),
    path: '/',
  },
  {
    key: 'inviteShare',
    label: t('userInfo.inviteShare'),
    icon: getIcon('personal-center-invite-share'),
    path: '/',
  },
  {
    key: 'launch-events',
    label: t('userInfo.launchEvents'),
    icon: getIcon('personal-center-launch-events'),
    path: '/',
  },
])

const supportItems = computed(() => [
  {
    key: 'official-verification',
    label: t('userInfo.officialVerification'),
    icon: getIcon('personal-center-official-verification'),
    path: '/',
  },
  {
    key: 'product-feedback',
    label: t('userInfo.productFeedback'),
    icon: getIcon('personal-center-product-feedback'),
    path: '/feedback',
  },
  {
    key: 'api-management',
    label: t('userInfo.apiManagement'),
    icon: getIcon('personal-center-api-management'),
    path: '/',
  },
  {
    key: 'help-center',
    label: t('userInfo.helpCenter'),
    icon: getIcon('personal-center-help-center'),
    path: '/help-center',
  },
  {
    key: 'customer-support',
    label: t('userInfo.customerSupport'),
    icon: getIcon('personal-center-online-support'),
    path: '/help-center',
  },
  {
    key: 'developer-docs',
    label: t('userInfo.developerDocs'),
    icon: getIcon('personal-center-changelog'),
    path: '/',
  },
])

const othersItems = computed(() => [
  {
    key: 'audit',
    label: t('userInfo.audit'),
    icon: getIcon('personal-center-audit'),
    path: '/',
  },
  {
    key: 'github',
    label: t('userInfo.github'),
    icon: getIcon('personal-center-github'),
    href: 'https://github.com/Prediction333/event-contracts',
  },
  {
    key: 'technical-support',
    label: t('userInfo.technicalSupport'),
    icon: getIcon('personal-center-technical-support'),
    path: '/',
  },
  {
    key: 'developer-contributions',
    label: t('userInfo.developerContributions'),
    icon: getIcon('personal-center-developer-contributions'),
    path: '/',
  },
  {
    key: 'tokenomics',
    label: t('userInfo.tokenomics'),
    icon: getIcon('personal-center-tokenomics'),
    path: '/',
  },
  {
    key: 'bug-bounty',
    label: t('userInfo.bugBounty'),
    icon: getIcon('personal-center-bug-bounty'),
    path: '/',
  },
  {
    key: 'language',
    label: t('userInfo.languageEntry'),
    icon: getIcon('personal-center-language'),
    path: '/',
  },
])

const trustMeItems = computed(() => [
  {
    key: 'leaderboardH5',
    label: t('userInfo.leaderboard'),
    icon: getIcon('personal-center-leaderboard'),
    path: '/leaderboardH5',
  },
  {
    key: 'reward',
    label: t('userInfo.reward'),
    icon: getIcon('personal-center-reward'),
    path: '/reward',
  },
  {
    key: 'accuracy',
    label: t('userInfo.accuracy'),
    icon: getIcon('personal-center-accuracy'),
    path: '/accuracy',
  },
  {
    key: 'terms',
    label: t('userInfo.terms'),
    icon: getIcon('personal-center-terms'),
    path: '/terms',
  },
])

const sections = computed(() => [
  { title: t('userInfo.ecosystem'), items: ecosystemItems.value },
  { title: t('userInfo.support'), items: supportItems.value },
  { title: t('userInfo.others'), items: othersItems.value },
  { title: t('userInfo.trustMe'), items: trustMeItems.value },
])

const socialLinks = computed(() => [
  {
    label: 'Facebook',
    icon: getIcon('social-facebook'),
    href: 'https://facebook.com',
  },
  {
    label: 'Instagram',
    icon: getIcon('social-instagram'),
    href: 'https://instagram.com',
  },
  {
    label: 'LinkedIn',
    icon: getIcon('social-linkedin'),
    href: 'https://linkedin.com',
  },
  {
    label: 'Telegram',
    icon: getIcon('social-telegram'),
    href: 'https://t.me/Choosme_Global',
  },
  {
    label: 'X',
    icon: getIcon('social-x'),
    href: 'https://x.com/chooseme_global?s=21',
  },
  {
    label: 'Medium',
    icon: getIcon('social-medium'),
    href: 'https://medium.com/@ChooseMeGlobal',
  },
])

const allowedPaths = [
  '/computing-power-services',
  '/my-earnings',
  '/LPVault',
  '/dashboard',
  '/asset-management',
  '/event-pool',
  '/feedback',
  '/help-center',
  '/leaderboardH5',
  '/accuracy',
]

const copyWalletAddress = async () => {
  if (!address.value) return
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(address.value)
    Message.success(t('userInfo.walletAddressCopied'))
  }
}

function goHref(link) {
  if (!link?.href) {
    Message.info(t('userInfo.underDevelopment'))
    return
  }
  window.open(link.href, '_blank')
}

const handleShare = async () => {
  if (!address.value) {
    Message.info(t('userInfo.underDevelopment'))
    return
  }

  const inviter = await readContract(config, {
    address: networks.find((n) => Number(n.chainId) === BSC_CHAIN_ID).proxyNodeManager,
    abi: nodeManagerABI,
    functionName: 'inviters',
    args: [address.value],
  })

  if (inviter === '0x0000000000000000000000000000000000000000') {
    Message.warning(t('userInfo.bindInviterFirst'))
    return
  }

  showShareModal.value = true
}

const handleSettings = () => {
  router.push('/userInfo')
}

const handleClose = () => {
  router.push('/home')
}

const handleMenuClick = (item) => {
  if (item.key === 'inviteShare') {
    handleShare()
    return
  }

  if (item.href) {
    goHref(item)
    return
  }

  if (item.path && allowedPaths.includes(item.path)) {
    router.push(item.path)
    return
  }

  Message.info(t('userInfo.underDevelopment'))
}

const handleDisconnect = async () => {
  localStorage.removeItem('inviteCode')
  window.sessionStorage.clear()
  try {
    await disconnect()
    router.replace('/')
  } catch (error) {
    console.error('断开连接失败:', error)
    router.replace('/')
  }
}

onMounted(() => {
  document.documentElement.classList.add('theme-dark')
  document.documentElement.classList.remove('theme-light')
})
</script>

<style scoped lang="scss">
.personal-center-page {
  min-height: 100vh;
  padding: 28px 24px 128px;
  box-sizing: border-box;
  background: #232933;
  color: #ffffff;
}

.personal-center-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 40px;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  object-fit: cover;
  flex-shrink: 0;
  background: #313844;
}

.profile-copy {
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-name {
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verification-badge {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}

.profile-address {
  margin-top: 8px;
  border: none;
  padding: 0;
  background: transparent;
  color: #9aa3b2;
  font-size: 14px;
  line-height: 1.2;
  text-align: left;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 16px;
}

.icon-button {
  width: 20px;
  height: 20px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.action-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.menu-section {
  margin-bottom: 44px;
}

.section-title {
  margin: 0 0 24px;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px 20px;
}

.menu-card {
  border: none;
  padding: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.menu-icon-shell {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(47, 55, 67, 0.98);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.menu-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.menu-label {
  font-size: 12px;
  line-height: 1.35;
  color: #f3f4f6;
  text-align: center;
  word-break: break-word;
}

.social-row {
  margin-top: 6px;
  padding-top: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.social-button {
  border: none;
  padding: 0;
  background: transparent;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.social-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.disconnect-wrap {
  margin-top: 28px;
}

.disconnect-btn {}
</style>
