<template>
  <transition :name="isClaimed ? 'claim-zoom' : 'sheet-slide'">
  <div v-if="modelValue" :class="['claim-overlay', { 'is-centered': isClaimed }]" @click.self="handleClose">
      <!-- 动态布局：is-full(初始满屏) / is-compact(点击后卡片) -->
      <div class="claim-container" :class="[isClaimed ? 'is-compact' : 'is-full']">
        <!-- 顶部装饰拉条 -->
        <div class="sheet-handle" />

        <div class="sheet-content">
          <!-- 1. 顶部 Banner 区域 (带碎纸屑背景) -->
          <div class="banner-area">
            <div class="confetti-bg">
              <img class="coin-icon" :src="SuccessfullyClaimedIcon" alt="Token" />
              <div class="amount-title">
                <span class="val">{{ amount }}</span>
                <span class="unit">{{ tokenSymbol }}</span>
              </div>
              <div class="status-text">{{ $t('claimSuccess.congratulations') }}</div>
            </div>
          </div>

          <!-- 2. 详情内容与按钮区 -->
          <div class="action-area">
            <div v-if="!isClaimed" class="details-view">
              <!-- 费用列表 -->
              <div class="fee-list">
                <div class="fee-row">
                  <span class="label">{{ $t('claimSuccess.withdrawFee') }}</span>
                  <span class="val">$ 10.3</span>
                </div>
                <div class="fee-row">
                  <span class="label">{{ $t('claimSuccess.winnerFee') }}</span>
                  <span class="val positive">+$1.2</span>
                </div>
              </div>

              <div class="divider" />

              <!-- 问题/推广卡片 (还原图片中的深灰卡片感) -->
              <div class="question-card">
                <div class="avatar-wrap">
                  <img src="https://picsum.photos/seed/user24/400/400" alt="avatar" />
                </div>
                <div class="q-content">
                  <div class="q-title">{{ $t('claimSuccess.questionTitle') }}</div>
                  <div class="q-bet">
                    {{ $t('claimSuccess.betWin', { bet: '$1.00' }) }} <span class="green-text">$2.87</span>
                  </div>
                </div>
              </div>

              <button class="main-btn" @click="handleClaim">{{ $t('claimSuccess.claim') }}</button>
            </div>

            <!-- 领取后的状态 -->
            <div v-else class="done-view">
              <button class="main-btn is-white" @click="handleDone">{{ $t('claimSuccess.done') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SuccessfullyClaimedIcon from '@/assets/icon/SuccessfullyClaimedIcon.png'

const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  amount: { type: [String, Number], default: '1000.26' },
  tokenSymbol: { type: String, default: 'USDT' }
})

const emit = defineEmits(['update:modelValue', 'success'])

const isClaimed = ref(false)

watch(() => props.modelValue, (val) => {
  if (val) isClaimed.value = false
})

const handleClaim = () => {
  isClaimed.value = true
  emit('success')
}

const handleDone = () => {
  emit('update:modelValue', false)
}

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.claim-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.claim-overlay.is-centered {
  justify-content: center;
}

.claim-container {
  background: var(--bg-card); // 极深灰，比纯黑更有质感
  color: #ffffff;
  transition: all 0.4s cubic-bezier(0.3, 1.4, 0.6, 1);
  overflow: hidden;
  position: relative;
  transform-origin: center center;
}

.claim-container.is-full {
  width: 100%;
  border-radius: 28px 28px 0 0;
  padding: 0 10px;
  box-sizing: border-box;
}

.claim-container.is-compact {
  // 屏幕居中显示
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 20px);
  border-radius: 12px;
  padding: 12px 16px 7px;
  background: var(--bg-card);
  box-sizing: border-box;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--bg-page);
  border-radius: 10px;
  margin: 0 auto;
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
}


/* 亮色主题：浅色遮罩（:deep 使变量能应用到 body 上的 .theme-light） */
.theme-light .claim-overlay {
  --claim-mask-radial-start: rgba(255, 255, 255, 0);
  --claim-mask-radial-mid: rgba(255, 255, 255, 0.4);
  --claim-mask-radial-end: rgba(252, 252, 252, 0.92);
  --claim-mask-linear-start: rgba(255, 255, 255, 0);
  --claim-mask-linear-mid: rgba(248, 248, 248, 0.7);
  --claim-mask-linear-end: var(--bg-page, #fcfcfc);
}

/* 暗色主题：深色遮罩 */
.theme-dark .claim-overlay {
  --claim-mask-radial-start: rgba(17, 17, 17, 0);
  --claim-mask-radial-mid: rgba(17, 17, 17, 0.45);
  --claim-mask-radial-end: rgba(17, 17, 17, 0.9);
  --claim-mask-linear-start: rgba(17, 17, 17, 0);
  --claim-mask-linear-mid: rgba(17, 17, 17, 0.69);
  --claim-mask-linear-end: var(--bg-page, #111111);
  --bg-card: #111111;
}

.banner-area {
  width: 100%;
  padding-top: 20px;
  /* var() 带 fallback，避免未定义时整条 background-image 失效导致背景图不显示 */
  background-image: radial-gradient(ellipse 85% 75% at 50% 42%,
      var(--claim-mask-radial-start) 0%,
      var(--claim-mask-radial-mid) 55%,
      var(--claim-mask-radial-end) 100%),
    linear-gradient(180deg,
      var(--claim-mask-linear-start) 0%,
      var(--claim-mask-linear-mid) 31.53%,
      var(--claim-mask-linear-end) 100%),
    url('@/assets/icon/SuccessfullyClaimedBg.png');
  background-size: 100% 100%, 100% 100%, contain;
  background-repeat: no-repeat, no-repeat, no-repeat;
  background-position: top center, top center, top center;
  display: flex;
  justify-content: center;
}

.confetti-bg {
  text-align: center;

  .coin-icon {
    width: 110px;
    height: auto;
    margin: 30px 0 10px;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
  }

  .amount-title {
    font-family: DIN, DIN;
    font-weight: bold;
    font-size: 24px;
    color: var(--bg-opposite);

    .unit {
      font-size: 22px;
      margin-left: 6px;
      font-weight: 700;
    }
  }

  .status-text {
    font-size: 14px;
    color: var(--bg-opposite);
    margin-top: 8px;
  }
}

.action-area {
  margin-top: 24px;
}

.fee-list {
  padding: 0 4px;

  .fee-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 15px;

    .label {
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: var(--text-dark-gray);
    }

    .val,
    .positive {
      font-weight: bold;
      font-size: 16px;
      color: var(--bg-opposite);
    }

  }
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 20px 0;
}

.question-card {
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  .avatar-wrap img {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;
  }

  .q-content {
    .q-title {
      font-family: PingFang SC, PingFang SC;
      font-weight: 600;
      font-size: 14px;
      color: var(--bg-opposite);
      margin-bottom: 8px;
    }

    .q-bet {
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: var(--text-dark-gray);

      .green-text {
        color: #32B764;
        font-weight: 700;
        margin-left: 2px;
      }
    }
  }
}

.main-btn {
  width: 100%;
  height: 56px;
  border-radius: 8px;
  border: none;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  background: var(--bg-opposite);
  color: var(--bg-page);
  transition: all 0.2s ease;
  margin: 26px 0;
}

/* 底部滑入动画（未领取时） */
.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: opacity 0.3s;

  .claim-container {
    transition: transform 0.4s cubic-bezier(0.3, 1.4, 0.6, 1);
  }
}

.sheet-slide-enter-from,
.sheet-slide-leave-to {
  opacity: 0;

  .claim-container {
    transform: translateY(100%);
  }
}

/* 领取完成后的状态：从中间缩放弹出 */
.claim-zoom-enter-active,
.claim-zoom-leave-active {
  transition: opacity 0.25s ease;

  .claim-container {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.4, 1);
  }
}

.claim-zoom-enter-from,
.claim-zoom-leave-to {
  opacity: 0;

  .claim-container {
    transform: scale(0.85);
  }
}
</style>