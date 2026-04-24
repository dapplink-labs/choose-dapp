<template>
    <transition name="fade">
        <div v-if="visible" class="share-invite-overlay" @click.self="handleClose">
            <div class="share-invite-card" :class="{ 'theme-dark': isDark, 'theme-light': !isDark }">
                <!-- 礼物盒图标 -->
                <div class="icon-wrapper">
                    <img src="@/assets/icon/inviteIcon.png" alt="Invitation" class="invite-icon" />
                </div>

                <!-- 标题 -->
                <h2 class="card-title">{{ $t('invite.bindInvitationTitle') }}</h2>

                <!-- 描述文字 -->
                <p class="card-description">{{ $t('invite.bindInvitationDesc') }}</p>

                <!-- 邀请地址显示 -->
                <div class="address-row">
                    <div class="address-label">{{ $t('invite.myInvitationAddress') }}:</div>
                    <div class="address-value">{{ displayInvitationCode || $t('invite.noInvitationCode') }}</div>
                </div>

                <!-- 分享按钮 -->
                <div class="action-row">
                    <PrimaryActionButton
                        class="btn primary-btn"
                        height="48px"
                        radius="12px"
                        font-size="16px"
                        font-weight="600"
                        @click="handleShare"
                    >
                        {{ $t('invite.shareNow') }}
                    </PrimaryActionButton>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Message from '@/utils/message'
import { useThemeStore } from '@/stores/theme'
import { useAccount } from '@wagmi/vue'
import PrimaryActionButton from '@/components/PrimaryActionButton.vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
const { address } = useAccount()

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits([
    'update:modelValue'
])

const visible = computed(() => props.modelValue)

// 使用当前用户的地址作为邀请码
const displayInvitationCode = computed(() => {
    return address.value || ''
})

// 处理关闭
const handleClose = () => {
    emit('update:modelValue', false)
}

// 通用复制函数：优先使用 Clipboard API，失败则回退到 textarea + execCommand
const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text)
            return true
        }
    } catch (e) {
        // ignore and fallback
    }

    try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textarea)
        return successful
    } catch (e) {
        return false
    }
}

// 处理分享（复制邀请链接到剪贴板，兼容手机端）
const handleShare = async () => {
    const code = displayInvitationCode.value
    if (!code) {
        Message.error(t('lpVault.connectWalletFirst') || '请先连接钱包')
        return
    }

    // 构建分享链接地址：当前网站地址?inviteCode=当前用户地址
    const shareUrl = `${window.location.origin}/#/?inviteCode=${code}`

    const ok = await copyToClipboard(shareUrl)
    if (ok) {
        Message.success(t('invite.invitationCodeCopied'))
        // 复制成功后关闭弹窗
        handleClose()
    } else {
        Message.error(t('invite.copyFailed') || '复制失败，请手动复制链接')
    }
}
</script>

<style scoped lang="scss">
.share-invite-overlay {
    position: fixed;
    inset: 0;
    z-index: 2001;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    padding: 20px;
    box-sizing: border-box;
}

.share-invite-card {
    width: 100%;
    max-width: 460px;
    background: var(--bg-color);
    border-radius: 22px;
    padding: 28px 24px 32px;
    box-sizing: border-box;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-height: 90vh;
    overflow-y: auto;
}

.icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 24px;

    .invite-icon {
        width: 120px;
        height: 120px;
        object-fit: contain;
    }
}

.card-title {
    margin: 0 0 16px;
    font-size: 24px;
    font-weight: 700;
    color: var(--invite-title, #ffffff);
    text-align: center;
    line-height: 1.3;
}

.card-description {
    margin: 0 0 24px;
    font-size: 14px;
    color: var(--text-gray, rgba(255, 255, 255, 0.7));
    text-align: center;
    line-height: 1.6;
    padding: 0 8px;
}

.address-row {
    background-color: var(--invite-input-bg, #2F2F2F);
    border: 1px solid var(--invite-input-border, #3F3F3F);
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 24px;
    box-sizing: border-box;

    .address-label {
        font-size: 13px;
        color: var(--text-gray, rgba(255, 255, 255, 0.6));
        margin-bottom: 8px;
    }

    .address-value {
        font-size: 15px;
        font-weight: 600;
        color: var(--invite-input-text, #ffffff);
        word-break: break-all;
        font-family: 'Courier New', monospace;
    }
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

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;

    .share-invite-card {
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
}

.fade-enter-from {
    opacity: 0;

    .share-invite-card {
        transform: scale(0.9);
        opacity: 0;
    }
}

.fade-leave-to {
    opacity: 0;

    .share-invite-card {
        transform: scale(0.9);
        opacity: 0;
    }
}

// 暗色主题适配
:deep(.theme-dark) {
    .share-invite-card {
        background-color: #1a1a1a;
    }

    .card-title {
        color: #ffffff;
    }

    .card-description {
        color: rgba(255, 255, 255, 0.7);
    }

    .address-row {
        background-color: #2F2F2F;
        border-color: #3F3F3F;

        .address-label {
            color: rgba(255, 255, 255, 0.6);
        }

        .address-value {
            color: #ffffff;
        }
    }
}

// 浅色主题适配
:deep(.theme-light) {
    .share-invite-card {
        background-color: #ffffff;
    }

    .card-title {
        color: #1a1a1a;
    }

    .card-description {
        color: rgba(0, 0, 0, 0.7);
    }

    .address-row {
        background-color: #F5F5F5;
        border-color: #E0E0E0;

        .address-label {
            color: rgba(0, 0, 0, 0.6);
        }

        .address-value {
            color: #1a1a1a;
        }
    }
}
</style>
