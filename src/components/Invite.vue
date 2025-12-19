<template>
  <transition name="fade">
    <div v-if="visible" class="invite-overlay" @click.self="handleClose">
      <div class="invite-card">
        <!-- 顶部小横条 -->
        <div class="card-handle"></div>

        <!-- 标题 -->
        <h2 class="card-title">欢迎来到ChooseMe~</h2>

        <!-- 邀请码输入 -->
        <div class="form-row">
          <input
            v-model="localCode"
            class="code-input"
            type="text"
            placeholder="填写邀请码"
          />
        </div>
        <p class="tip-text">* 填写邀请码有机会可以获得更多收益奖励</p>

        <!-- 底部按钮 -->
        <div class="action-row">
          <button class="btn skip-btn" type="button" @click="handleSkip">
            跳过
          </button>
          <button class="btn primary-btn" type="button" @click="handleConfirm">
            确定
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update:modelValue',
  'update:inviteCode',
  'confirm',
  'skip',
  'close'
])

const visible = computed(() => props.modelValue)
const localCode = ref(props.inviteCode)

watch(
  () => props.inviteCode,
  (val) => {
    if (val !== localCode.value) {
      localCode.value = val
    }
  }
)

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleSkip = () => {
  emit('skip')
  handleClose()
}

const handleConfirm = () => {
  emit('update:inviteCode', localCode.value)
  emit('confirm', localCode.value)
}
</script>

<style scoped lang="scss">
.invite-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.invite-card {
  width: 100%;
  max-width: 480px;
  background-color: var(--bg-page-h5, #ffffff);
  border-radius: 16px 16px 0 0;
  padding: 20px 20px 28px;
  box-sizing: border-box;
}

.card-handle {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background-color: #e5e5e5;
  margin: 4px auto 16px;
}

.card-title {
  margin: 0 0 18px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color, #000000);
}

.form-row {
  margin-bottom: 8px;
}

.code-input {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  border: 1px solid #f1f1f1;
  padding: 0 12px;
  font-size: 14px;
  background-color: var(--bg-page-h5, #ffffff);
  color: var(--text-color, #333333);
  box-sizing: border-box;
}

.code-input::placeholder {
  color: #cccccc;
}

.tip-text {
  margin: 0 0 24px;
  font-size: 12px;
  color: var(--text-dark-gray, #999999);
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
}

.skip-btn {
  background-color: var(--bg-page-h5, #ffffff);
  border-color: #f1f1f1;
  color: var(--text-color, #000000);
}

.primary-btn {
  background-color: #c1272e;
  color: #ffffff;
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

