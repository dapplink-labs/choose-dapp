<template>
  <transition name="sheet-slide">
    <div v-if="modelValue" class="claim-overlay" @click.self="handleClose">
      <!-- 动态布局：is-full(初始满屏) / is-compact(点击后卡片) -->
      <div 
        class="claim-container" 
        :class="[isClaimed ? 'is-compact' : 'is-full']"
      >
        <!-- 顶部装饰拉条 -->
        <div class="sheet-handle" />

        <!-- 核心内容 -->
        <div class="sheet-content">
          
          <!-- 1. 顶部 Banner 区域 (带碎纸屑背景) -->
          <div class="banner-area">
            <div class="confetti-bg">
              <img class="coin-icon" :src="SuccessfullyClaimedIcon" alt="Token" />
              <div class="amount-title">
                <span class="val">{{ amount }}</span>
                <span class="unit">{{ tokenSymbol }}</span>
              </div>
              <div class="status-text">恭喜获得</div>
            </div>
          </div>

          <!-- 2. 状态切换区 -->
          <div class="action-area">
            <!-- 初始状态：显示详情列表 (图2) -->
            <div v-if="!isClaimed" class="details-view">
              <div class="fee-list">
                <div class="fee-row">
                  <span class="label">提现手续费(1%)</span>
                  <span class="val">$ 10.3</span>
                </div>
                <div class="fee-row">
                  <span class="label">赢家抽水(3%)</span>
                  <span class="val positive">+$1.2</span>
                </div>
              </div>

              <div class="divider" />

              <!-- 底部推广/问题部分 -->
              <div class="question-row">
                <div class="avatar-box">
                  <!-- 这里替换为 Elon 图标 -->
                  <img src="https://pbs.twimg.com/profile_images/1780044483886211072/0_v9vEB6_400x400.jpg" alt="avatar" />
                </div>
                <div class="q-text">
                  <div class="q-title">以太坊在12月28日的价格—？</div>
                  <div class="q-sub">投$1.00赢得 <span class="green-text">$2.87</span></div>
                </div>
              </div>

              <button class="main-btn" @click="handleClaim">Claim</button>
            </div>

            <!-- 领取后状态：仅显示 Done 按钮 (图1) -->
            <div v-else class="done-view">
              <button class="main-btn is-white" @click="handleDone">Done</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import SuccessfullyClaimedIcon from '@/assets/icon/SuccessfullyClaimedIcon.png'

const props = defineProps({
  modelValue: Boolean,
  amount: { type: String, default: '1000.26' },
  tokenSymbol: { type: String, default: 'USDT' }
})

const emit = defineEmits(['update:modelValue', 'success'])

const isClaimed = ref(false)

// 每次打开弹窗重置状态
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
/* 遮罩层 */
.claim-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* 靠底部对齐 */
  align-items: center;
}

/* 容器基础样式 */
.claim-container {
  background: #000000;
  color: #ffffff;
  transition: all 0.4s cubic-bezier(0.3, 1.4, 0.6, 1);
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}

/* 状态 1：初始满屏显示在底部 */
.claim-container.is-full {
  width: 100%;
  height: 80vh; /* 覆盖大部分屏幕高度 */
  border-radius: 24px 24px 0 0;
  padding: 12px 20px 40px;
}

/* 状态 2：点击后变精致小卡片 */
.claim-container.is-compact {
  width: calc(100% - 40px); /* 左右留空 */
  max-width: 380px;
  height: auto;
  border-radius: 32px;
  margin-bottom: 40px; /* 向上悬浮 */
  padding: 12px 16px 24px;
  background: #111111; /* 稍微浅一点的黑色增强卡片感 */
}

/* 顶部把手 */
.sheet-handle {
  width: 36px;
  height: 4px;
  background: #333;
  border-radius: 10px;
  margin: 0 auto 16px;
}

/* 带有碎纸屑特效的顶部区域 */
.banner-area {
  width: 100%;
  height: 180px;
  background-color: #000;
  /* 碎纸屑背景图 */
  background-image: url('@/assets/icon/SuccessfullyClaimedBg.png'); 
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confetti-bg {
  text-align: center;
  .coin-icon { width: 70px; height: 70px; margin-bottom: 12px; }
  .amount-title {
    font-size: 34px; font-weight: 800; line-height: 1.1;
    .unit { font-size: 24px; margin-left: 8px; }
  }
  .status-text { font-size: 14px; color: #888; margin-top: 6px; }
}

/* 详情列表 */
.details-view {
  padding: 10px 4px 0;
}

.fee-list {
  margin-top: 20px;
  .fee-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 15px;
    .label { color: #888; }
    .val { font-weight: 600; }
    .positive { color: #ffffff; }
  }
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0 20px;
}

/* 底部问题区块 */
.question-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  
  .avatar-box img {
    width: 50px; height: 50px;
    border-radius: 12px;
    object-fit: cover;
  }
  
  .q-text {
    .q-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .q-sub { 
      font-size: 13px; color: #888;
      .green-text { color: #3aff6a; font-weight: bold; }
    }
  }
}

/* 按钮样式：纯白背景黑字 */
.main-btn {
  width: 100%;
  height: 54px;
  border-radius: 16px;
  border: none;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  background: #ffffff; 
  color: #000000;
  transition: all 0.2s;
  
  &:active { transform: scale(0.97); opacity: 0.9; }

  &.is-white {
    background: #ffffff;
    color: #000000;
    margin-top: 10px;
  }
}

/* 进场动画：从底部滑入 */
.sheet-slide-enter-active, .sheet-slide-leave-active {
  transition: opacity 0.3s ease;
  .claim-container { transition: transform 0.4s ease; }
}
.sheet-slide-enter-from, .sheet-slide-leave-to {
  opacity: 0;
  .claim-container { transform: translateY(100%); }
}
</style>