<template>
  <div class="settings-page">

    <div class="card">
      <h1 class="page-title">{{ $t('settings.title') }}</h1>

      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img class="avatar-img" :src="userAvatar" alt="avatar" />
          <div class="avatar-edit">
            <span class="camera-icon">📷</span>
          </div>
        </div>
      </div>

      <div class="form-section">
        <label class="field-label">{{ $t('settings.email') }}</label>
        <div class="input-group">
          <input class="text-input" type="email" :placeholder="$t('settings.emailPlaceholder')" />
          <div class="helper-text">{{ $t('settings.emailHelper') }}</div>
        </div>

        <label class="field-label">{{ $t('settings.username') }}</label>
        <div class="input-group">
          <input class="text-input" type="text" :placeholder="$t('settings.usernamePlaceholder')" />
        </div>

        <label class="field-label">{{ $t('settings.twitter') }}</label>
        <div class="input-group">
          <button class="link-btn">
            {{ $t('settings.bindTwitter') }}
            <span class="arrow">→</span>
          </button>
        </div>
      </div>

      <div class="actions">
        <button class="save-btn">{{ $t('settings.saveText') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useAccount } from "@wagmi/vue"
import { useI18n } from 'vue-i18n'

const { address, status } = useAccount()
const { t } = useI18n()

interface Props {
  portfolioAmount?: string | number
  cashAmount?: string | number
  userAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  portfolioAmount: '4.17',
  cashAmount: '3.88',
  userAvatar: 'https://effigy.im/a/default.svg'
})

const userAvatar = computed<string>(() => {
  if (props.userAvatar !== 'https://effigy.im/a/default.svg') {
    return props.userAvatar
  }
  return address.value
    ? `https://effigy.im/a/${address.value}.svg`
    : 'https://effigy.im/a/default.svg'
})
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background: var(--bg-page, #fcfcfc);
  color: var(--text-color, #1a1a1a);
  padding: 140px 24px 80px;
  box-sizing: border-box;
  padding-top: 128px; // header(80px) + navbar2(48px)

  .page-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 32px 0;
    color: var(--text-color, #1a1a1a);
  }

  .card {
    max-width: 720px;
    margin: 0 auto;
    background: var(--bg-card, var(--bg-secondary, #ffffff));
    border: 1px solid var(--card-border, var(--border-color, #1f1f1f));
    border-radius: 16px;
    padding: 32px;
    box-sizing: border-box;
    color: var(--text-color, #1a1a1a);
  }

  .avatar-section {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 32px;

    .avatar-wrapper {
      position: relative;
      width: 96px;
      height: 96px;
      border-radius: 50%;

      .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid var(--avatar-border, #8e8e92);
      }

      .avatar-edit {
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--bg-card, #ffffff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .field-label {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--text-color, #1a1a1a);
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .text-input {
      width: 100%;
      height: 44px;
      border-radius: 10px;
      border: 1px solid var(--border-color, #E0E0E0);
      background: var(--bg-card, #ffffff);
      color: var(--text-color, #1a1a1a);
      padding: 0 14px;
      outline: none;
      font-size: 14px;
      box-sizing: border-box;

      &::placeholder {
        color: var(--text-gray, #6b7280);
      }

      &:focus {
        border-color: var(--primary-color, #3b82f6);
      }
    }

    .helper-text {
      font-size: 12px;
      color: var(--text-gray, #8e8e92);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .link-btn {
      height: 44px;
      border-radius: 10px;
      border: 1px solid var(--border-color, #E0E0E0);
      background: var(--bg-card, #ffffff);
      color: var(--text-color, #1a1a1a);
      padding: 0 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--primary-color, #3b82f6);
        color: var(--text-color, #1a1a1a);
      }

      .arrow {
        font-size: 16px;
      }
    }
  }

  .actions {
    margin-top: 32px;
    display: flex;
    justify-content: flex-start;

    .save-btn {
      min-width: 140px;
      height: 44px;
      border-radius: 10px;
      background: var(--text-color, #ffffff);
      color: var(--bg-card, #0f0f0f);
      border: none;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
      }
    }
  }
}

// 响应式设计
@media (max-width: 1280px) {
  .settings-page {
    padding: 128px 28px 64px;

    .card {
      padding: 28px;
    }
  }
}

@media (max-width: 1024px) {
  .settings-page {
    padding: 128px 24px 56px;

    .card {
      padding: 24px;

      .page-title {
        font-size: 26px;
        margin-bottom: 28px;
      }

      .avatar-section {
        margin-bottom: 28px;

        .avatar-wrapper {
          width: 88px;
          height: 88px;

          .avatar-edit {
            width: 26px;
            height: 26px;
            font-size: 13px;
          }
        }
      }

      .form-section {
        gap: 18px;
      }
    }
  }
}

@media (max-width: 768px) {
  .settings-page {
    padding: 108px 16px 40px;

    .card {
      padding: 20px;
      border-radius: 12px;

      .page-title {
        font-size: 24px;
        margin-bottom: 24px;
      }

      .avatar-section {
        margin-bottom: 24px;
        justify-content: center;

        .avatar-wrapper {
          width: 80px;
          height: 80px;

          .avatar-edit {
            width: 24px;
            height: 24px;
            font-size: 12px;
            bottom: 2px;
            right: 2px;
          }
        }
      }

      .form-section {
        gap: 16px;

        .field-label {
          font-size: 13px;
          margin-bottom: 8px;
        }

        .text-input {
          height: 44px; // 保持触摸友好的高度
          font-size: 14px;
          padding: 0 12px;
        }

        .helper-text {
          font-size: 11px;
        }

        .link-btn {
          height: 44px; // 保持触摸友好的高度
          font-size: 14px;
          padding: 0 12px;
        }
      }

      .actions {
        margin-top: 28px;

        .save-btn {
          width: 100%; // 移动端全宽按钮
          min-width: auto;
          height: 44px; // 触摸友好的高度
          font-size: 15px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .settings-page {
    padding: 96px 12px 32px;
    box-sizing: border-box;
    margin-top: 20px;

    .card {
      padding: 16px;
      border-radius: 10px;
      box-sizing: border-box;

      .page-title {
        font-size: 22px;
        margin-bottom: 20px;
      }

      .avatar-section {
        margin-bottom: 20px;

        .avatar-wrapper {
          width: 72px;
          height: 72px;

          .avatar-edit {
            width: 22px;
            height: 22px;
            font-size: 11px;
          }
        }
      }

      .form-section {
        gap: 14px;

        .field-label {
          font-size: 13px;
          margin-bottom: 6px;
        }

        .text-input {
          height: 42px;
          font-size: 14px;
          padding: 0 12px;
          border-radius: 8px;
        }

        .helper-text {
          font-size: 11px;
          line-height: 1.4;
        }

        .link-btn {
          height: 42px;
          font-size: 13px;
          padding: 0 12px;
          border-radius: 8px;

          .arrow {
            font-size: 14px;
          }
        }
      }

      .actions {
        margin-top: 24px;

        .save-btn {
          height: 42px;
          font-size: 14px;
          border-radius: 8px;
        }
      }
    }
  }
}
</style>
