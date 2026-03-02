<template>
  <div class="user-info-page">
    <!-- 自定义顶部导航，仅在 H5 内使用 -->
    <BackHeaderNav :title="$t('userInfo.profileTitle') || '个人信息'" />

    <div class="content">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img class="avatar-img" :src="userAvatar" alt="avatar" />
          <button class="avatar-edit" type="button" aria-label="edit avatar" @click="handleAvatarClick">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <g>
                <path
                  fill="#2f2f2f"
                  d="M 12 23 C 9.061790466308594 23 6.299449920654297 21.85580062866211 4.221819877624512 19.77817916870117 C 2.144200086593628 17.7005500793457 1 14.93820953369141 1 12 C 1 9.061790466308594 2.144200086593628 6.299449920654297 4.221819877624512 4.221819877624512 C 6.299449920654297 2.144200086593628 9.061790466308594 1 12 1 C 14.93820953369141 1 17.7005500793457 2.144200086593628 19.77817916870117 4.221819877624512 C 21.85580062866211 6.299449920654297 23 9.061790466308594 23 12 C 23 14.93820953369141 21.85580062866211 17.7005500793457 19.77817916870117 19.77817916870117 C 17.7005500793457 21.85580062866211 14.93820953369141 23 12 23 Z"
                />
                <path
                  fill="#141414"
                  d="M 12 2 C 6.485979080200195 2 2 6.485979080200195 2 12 C 2 17.51401901245117 6.485979080200195 22 12 22 C 17.51401901245117 22 22 17.51401901245117 22 12 C 22 6.485979080200195 17.51401901245117 2 12 2 M 12 0 C 18.62742042541504 0 24 5.372579574584961 24 12 C 24 18.62742042541504 18.62742042541504 24 12 24 C 5.372579574584961 24 0 18.62742042541504 0 12 C 0 5.372579574584961 5.372579574584961 0 12 0 Z"
                />
              </g>
              <path
                fill="#ffffff"
                d="M93.107,128a1.01,1.01,0,0,1,.965.712l.315,1.02h.9a1.587,1.587,0,0,1,1.587,1.587v5.772a1.587,1.587,0,0,1-1.587,1.587H86.921a1.587,1.587,0,0,1-1.587-1.587v-5.772a1.587,1.587,0,0,1,1.587-1.587h.9l.315-1.02A1.01,1.01,0,0,1,89.1,128Zm-2,3.752a2.165,2.165,0,1,0,2.165,2.165A2.165,2.165,0,0,0,91.105,131.752Zm0,3.463a1.3,1.3,0,1,0-1.3-1.3A1.3,1.3,0,0,0,91.105,135.215Z"
                transform="translate(-79.105 -121.34)"
              />
            </svg>
          </button>
          <input
            ref="avatarInputRef"
            class="avatar-file-input"
            type="file"
            accept="image/*"
            @change="handleAvatarChange"
          />
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="form-section">
        <!-- 邮箱 -->
        <div class="field-group">
          <label class="field-label">{{ $t('userInfo.email') || '邮箱' }}</label>
          <div class="input-wrapper">
            <input
              v-model="email"
              class="text-input"
              type="email"
              :placeholder="$t('userInfo.emailPlaceholder') || '请输入邮箱地址'"
            />
          </div>
          <div class="helper-row">
            <svg
              class="helper-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <!-- 实心圆（警告底色） -->
              <circle cx="8" cy="8" r="8" fill="var(--text-gray, #a0a0a0)" />
              <!-- 镂空感叹号（用背景色模拟镂空效果） -->
              <rect x="7.25" y="3.5" width="1.5" height="7" rx="0.75" fill="var(--bg-page-h5, #000000)" />
              <circle cx="8" cy="12.3" r="1" fill="var(--bg-page-h5, #000000)" />
            </svg>
            <span class="helper-text">
              {{ $t('userInfo.emailHelper') || '用来接收ChooseMe重要更新信息' }}
            </span>
          </div>
        </div>

        <!-- 用户名 -->
        <div class="field-group">
          <label class="field-label">{{ $t('userInfo.username') || '用户名' }}</label>
          <div class="input-wrapper">
            <input
              v-model="username"
              class="text-input"
              type="text"
              :placeholder="$t('userInfo.usernamePlaceholder') || '请输入用户名'"
            />
          </div>
        </div>

        <!-- 简介 -->
        <div class="field-group">
          <label class="field-label">{{ $t('userInfo.bio') || '简介' }}</label>
          <div class="input-wrapper textarea-wrapper">
            <textarea
              v-model="bio"
              class="text-area"
              :placeholder="$t('userInfo.bioPlaceholder') || '请输入简介'"
            />
          </div>
        </div>

        <!-- Twitter -->
        <div class="field-group">
          <label class="field-label">Twitter</label>
          <div class="twitter-connect">
            <button
              class="twitter-btn"
              type="button"
              @click="handleTwitterConnect"
            >
              <span class="twitter-x" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                  <rect width="18" height="18" fill="none" />
                  <path
                    fill="#fff"
                    d="M96.308,122h2.755l-6.018,6.879,7.08,9.36H94.581l-4.342-5.677-4.968,5.677H82.515l6.437-7.357L82.16,122h5.684l3.925,5.189Zm-.967,14.59h1.526l-9.853-13.028H85.377Z"
                    transform="translate(-82.16 -121)"
                  />
                </svg>
              </span>
              <span class="twitter-text">connect X</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 保存按钮（不固定） -->
      <button class="save-btn" type="button" @click="handleSave">
        {{ $t('userInfo.save') || '保存修改' }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAccount } from '@wagmi/vue'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { useThemeStore } from '@/stores/theme'
import Message from '@/utils/message'

// 简单声明 message 辅助类型，避免 ts 报错
interface MessageFunc {
  (options: any): any
  success?: (message: string, options?: any) => any
  info?: (message: string, options?: any) => any
}

const message = Message as MessageFunc

const { address } = useAccount()
const { t } = useI18n()
const themeStore = useThemeStore()

const email = ref('')
const username = ref('')
const bio = ref('')
const customAvatar = ref<string | null>(null)
const avatarInputRef = ref<HTMLInputElement | null>(null)

const userAvatar = computed<string>(() => {
  if (customAvatar.value) return customAvatar.value
  return address.value
    ? `https://effigy.im/a/${address.value}.svg`
    : 'https://effigy.im/a/default.svg'
})

const handleAvatarClick = () => {
  avatarInputRef.value?.click()
}

let lastObjectUrl: string | null = null
const handleAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files && target.files[0]
  if (!file) return

  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = null
  }

  const objectUrl = URL.createObjectURL(file)
  lastObjectUrl = objectUrl
  customAvatar.value = objectUrl
}

const handleTwitterConnect = () => {
  message.info?.(t('userInfo.twitterComingSoon') || 'Twitter 绑定功能即将开放')
}

const handleSave = () => {
  // 这里后续可接入后端保存接口，目前仅提示成功
  message.success?.(t('userInfo.saveSuccess') || '保存成功')
}

onMounted(() => {
  themeStore.applyTheme()
})
</script>

<style scoped lang="scss">
.user-info-page {
  position: relative;
  min-height: 100vh;
  background-color: var(--bg-page-h5, #000000);
  color: var(--text-color, #ffffff);
  padding-top: 56px; // 顶部返回导航高度预留
  box-sizing: border-box;

  .content {
    padding: 24px 16px 32px;
    box-sizing: border-box;
  }

  .avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;

    .avatar-wrapper {
      position: relative;
      width: 88px;
      height: 88px;
      border-radius: 50%;

        .avatar-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
        }

      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .avatar-edit {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.85);
        cursor: pointer;
        padding: 0;

        .camera-icon {
          font-size: 14px;
        }
      }
    }
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color, #ffffff);
    }

    .input-wrapper {
      border-radius: 10px;
      border: 1px solid var(--border-color, #333333);
      background-color: transparent;
      padding: 0 14px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 46px;
    }

    .textarea-wrapper {
      height: auto;
      padding: 10px 14px;
      align-items: flex-start;
    }

    .text-input,
    .text-area {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: var(--text-color, #ffffff);
      font-size: 14px;

      &::placeholder {
        color: var(--text-gray, #6b7280);
      }
    }

    .text-area {
      min-height: 96px;
      resize: none;
    }

    .helper-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-gray, #a0a0a0);

      .helper-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        display: block;
      }
    }

    .twitter-connect {
      .twitter-btn {
        width: 140px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid var(--border-color, #333333);
        background-color: #000000;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #ffffff;
        font-size: 14px;
        cursor: pointer;
        padding: 0 16px;
        box-sizing: border-box;

        .twitter-x {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;

          svg {
            width: 18px;
            height: 18px;
            display: block;
          }
        }
      }
    }
  }

  .save-btn {
    height: 46px;
    border-radius: 999px;
    border: none;
    background-color: var(--bg-opposite);
    color: var(--bg-page-h5);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    margin-top: 40px;
  }
}

@media (min-width: 769px) {
  .user-info-page {
    max-width: 480px;
    margin: 0 auto;
  }
}
</style>

