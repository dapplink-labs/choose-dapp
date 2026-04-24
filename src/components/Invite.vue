<template>
  <transition name="fade">
    <!-- <div v-if="visible" class="invite-overlay" @click="handleClose"> -->
      <div v-if="visible" class="invite-overlay" @click="handleClose">
      <div class="invite-card" @click.stop>
        <div class="card-handle"></div>
        <div class="skip-btn" @click="handleClose">{{ $t('common.skip') || '跳过' }}</div>

        <h2 class="card-title">{{ $t('invite.title') }}</h2>

        <div class="form-row">
          <input v-model="localCode" class="code-input" type="text" :placeholder="$t('invite.placeholder')" />
        </div>
        <p class="tip-text">{{ $t('invite.tip') }}</p>

        <div class="action-row">
          <PrimaryActionButton
            class="btn primary-btn"
            :disabled="loading"
            height="48px"
            radius="12px"
            font-size="16px"
            font-weight="600"
            text-color="#0a0a0a"
            gradient-from="var(--text-color-y)"
            gradient-to="var(--text-color-y)"
            disabled-bg="#2f2f2f"
            disabled-text-color="#7b7b7b"
            @click="handleConfirm"
          >
            <span v-if="loading">{{ $t('common.loading') || '...' }}</span>
            <span v-else>{{ $t('common.confirm') }}</span>
          </PrimaryActionButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccount, useChainId } from '@wagmi/vue'
import { useRoute } from 'vue-router'
import Message from '@/utils/message'
import { switchChain, readContract } from '@wagmi/core'
import { bindInviteCode } from '@/api/API'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'
import nodeManagerABI from '@/assets/abi/nodeManagerABI.json'
import networks from '@/assets/json/networks.js'
import { writeContractOptimized } from '@/utils/requestWEB3.js'
import { config } from '@/wagmi.ts'
import PrimaryActionButton from '@/components/PrimaryActionButton.vue'

const { t } = useI18n()
const { address } = useAccount()
const chainId = useChainId()
const route = useRoute()
const counterStore = useCounterStore()
const { showInvite, inviteCode } = storeToRefs(counterStore)
const BSC_CHAIN_ID = 56

const loading = ref(false)
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue'
])

const visible = computed(() => showInvite.value)

const localCode = ref('')

// 保存原始样式值
let originalBodyOverflow = ''
let originalBodyPosition = ''
let originalBodyTop = ''
let scrollTop = 0

// 阻止触摸滚动的事件处理函数
const preventTouchMove = (e) => {
  // 如果触摸事件发生在弹窗卡片内部，检查是否需要滚动
  const target = e.target
  const card = target.closest('.invite-card')
  if (card) {
    // 检查是否在输入框内（输入框可能需要滚动来查看内容）
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }
    // 检查卡片是否可滚动且触摸点在卡片边缘
    const isScrollable = card.scrollHeight > card.clientHeight
    const touch = e.touches?.[0] || e.changedTouches?.[0]
    if (isScrollable && touch) {
      const cardRect = card.getBoundingClientRect()
      const touchY = touch.clientY
      // 如果触摸点在卡片内部，允许滚动
      if (touchY >= cardRect.top && touchY <= cardRect.bottom) {
        return
      }
    }
  }
  // 阻止其他所有触摸滚动
  e.preventDefault()
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      showInvite.value = true
    }
  }
)

watch(visible, (newVal) => {
  if (newVal) {
    // 优先使用 store 中的 inviteCode，如果为空则尝试从 URL 参数中获取
    let code = inviteCode.value || ''
    if (!code && route.query.inviteCode) {
      code = String(route.query.inviteCode)
      // 如果从 URL 获取到邀请码，更新 store
      if (code) {
        counterStore.inviteCode = code
      }
    }
    if (!code && localStorage.getItem('inviteCode')) {
      code = String(localStorage.getItem('inviteCode'))
      // 如果从 localStorage 获取到邀请码，更新 store
      if (code) {
        counterStore.inviteCode = code
      }
    }
    console.log('code', code)
    localCode.value = code
    // 禁止页面滚动 - 移动端兼容处理
    scrollTop = window.pageYOffset || document.documentElement.scrollTop
    originalBodyOverflow = document.body.style.overflow
    originalBodyPosition = document.body.style.position
    originalBodyTop = document.body.style.top
    
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollTop}px`
    document.body.style.width = '100%'
    
    // 阻止触摸滚动
    document.addEventListener('touchmove', preventTouchMove, { passive: false })
  } else {
    // 恢复页面滚动
    document.body.style.overflow = originalBodyOverflow
    document.body.style.position = originalBodyPosition
    document.body.style.top = originalBodyTop
    document.body.style.width = ''
    
    // 恢复滚动位置
    window.scrollTo(0, scrollTop)
    
    // 移除触摸事件监听
    document.removeEventListener('touchmove', preventTouchMove)
  }
})

// 组件卸载时确保恢复页面滚动
onUnmounted(() => {
  document.body.style.overflow = originalBodyOverflow || ''
  document.body.style.position = originalBodyPosition || ''
  document.body.style.top = originalBodyTop || ''
  document.body.style.width = ''
  document.removeEventListener('touchmove', preventTouchMove)
  if (scrollTop) {
    window.scrollTo(0, scrollTop)
  }
})

const handleClose = () => {
  showInvite.value = false
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  if (loading.value) return
  if (!address.value) {
    Message.error(t('computingPower.connectWalletFirst') || '请先连接钱包')
    return
  }
  if (!localCode.value) {
    Message.error(t('invite.codeRequired') || '邀请码不能为空')
    return
  }

  loading.value = true

  try {
    console.log('localCode.value', localCode.value)

    if (!localCode.value || !localCode.value.startsWith('0x') || localCode.value.length !== 42) {
      Message.error(t('invite.invalidAddress') || '无效的邀请码地址格式')
      loading.value = false
      return
    }

    if (Number(chainId.value) !== BSC_CHAIN_ID) {
      await switchChain(config, { chainId: BSC_CHAIN_ID })
      await new Promise(r => setTimeout(r, 500))
    }

    const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
    if (!bscNet?.proxyNodeManager) {
      Message.error(t('invite.missingContract') || '未找到 nodeManager 合约地址')
      return
    }
    // 读取合约中邀请人是否存在
    const inviter = await readContract(config, {
      address: bscNet.proxyNodeManager,
      abi: nodeManagerABI,
      functionName: 'inviters',
      args: [localCode.value]
    })
    if (inviter == '0x0000000000000000000000000000000000000000') {
      Message.error(t('invite.inviterExists') || '邀请人不存在')
      loading.value = false
      return
    }

    // 确保地址存在且有效
    if (!address.value || typeof address.value !== 'string') {
      Message.error(t('computingPower.connectWalletFirst') || '请先连接钱包')
      loading.value = false
      return
    }

    await writeContractOptimized({
      abi: nodeManagerABI,
      address: bscNet.proxyNodeManager,
      functionName: 'bindInviter',
      args: [localCode.value],
      userAddress: address.value,
      messages: {
        success: t('invite.contractBindSuccess') || '合约绑定邀请码成功',
        failed: t('invite.contractBindFailed') || '合约绑定邀请码失败',
        rejected: t('invite.contractBindCancelled') || '你取消了合约绑定'
      },
      showErrorToast: true
    })

    Message.success(t('invite.bindSuccess') || '绑定邀请码成功')
    handleClose()
  } catch (error) {
    Message.error(t('invite.bindFailed') || '绑定邀请码失败')
  }
  loading.value = false
}
</script>

<style scoped lang="scss">
.invite-overlay {
  position: fixed;
  inset: 0;
  z-index: 1001;
  display: flex;
  align-items: end;
  justify-content: center;
  background-color: var(--invite-overlay-bg);
  backdrop-filter: blur(6px);
  overflow: hidden;
}

.invite-card {
  width: 100%;
  max-width: 460px;
  background: var(--invite-card-bg);
  border-radius: 22px 22px 0 0;
  padding: 28px 24px 32px;
  box-sizing: border-box;
  box-shadow: var(--invite-card-shadow);
  border: 1px solid var(--invite-card-border);
  position: relative;
}

.skip-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 14px;
  color: var(--invite-tip);
  cursor: pointer;
  padding: 4px;
  transition: opacity 0.2s ease;
}

.skip-btn:hover {
  opacity: 0.8;
}

.card-handle {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background-color: var(--invite-handle);
  margin: 4px auto 20px;
}

.card-title {
  margin: 0 0 18px;
  font-size: 22px;
  font-weight: 700;
  color: var(--invite-title);
}

.form-row {
  margin-bottom: 10px;
}

.code-input {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 1px solid var(--invite-input-border);
  padding: 0 16px;
  font-size: 15px;
  background-color: var(--invite-input-bg);
  color: var(--invite-input-text);
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.code-input::placeholder {
  color: var(--invite-placeholder);
}

.code-input:focus {
  border-color: var(--invite-accent);
  box-shadow: 0 0 0 3px var(--invite-accent-shadow);
}

.tip-text {
  margin: 4px 0 28px;
  font-size: 12px;
  color: var(--invite-tip);
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn {
  width: 100%;
  letter-spacing: 0.2px;
}

.primary-btn {
  box-shadow: 0 12px 30px rgba(180, 255, 40, 0.28);
}

.primary-btn:disabled {
  box-shadow: none;
}

:global(:root),
:global(.theme-light) {
  --invite-overlay-bg: rgba(0, 0, 0, 0.35);
  --invite-card-bg: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
  --invite-card-shadow: 0 16px 50px rgba(0, 0, 0, 0.12);
  --invite-card-border: var(--border-color);
  --invite-handle: var(--border-color);
  --invite-title: var(--text-color);
  --invite-input-border: var(--border-color);
  --invite-input-bg: var(--bg-card);
  --invite-input-text: var(--text-color);
  --invite-placeholder: var(--text-dark-gray);
  --invite-tip: var(--text-gray);
  --invite-accent: var(--text-color-y);
  --invite-accent-shadow: rgba(46, 190, 105, 0.16);
}

:global(.theme-dark) {
  --invite-overlay-bg: rgba(0, 0, 0, 0.6);
  --invite-card-bg: linear-gradient(180deg, #111111 0%, #0b0b0b 100%);
  --invite-card-shadow: 0 16px 70px rgba(0, 0, 0, 0.55);
  --invite-card-border: var(--border-color);
  --invite-handle: var(--border-color);
  --invite-title: var(--text-color);
  --invite-input-border: var(--border-color);
  --invite-input-bg: #111111;
  --invite-input-text: var(--text-color);
  --invite-placeholder: var(--text-dark-gray);
  --invite-tip: var(--text-gray);
  --invite-accent: var(--text-color-y);
  --invite-accent-shadow: rgba(187, 255, 46, 0.12);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
