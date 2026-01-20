<template>
  <transition name="fade">
    <div v-if="visible" class="bind-email-overlay" @click.self="handleClose">
      <div class="bind-email-card">
        <!-- 顶部小横条 -->
        <div class="card-handle"></div>

        <!-- 标题 -->
        <h2 class="card-title">{{ $t('bindEmail.title') }}</h2>

        <!-- 表单区域 -->
        <div class="form-row">
          <input
            v-model="localEmail"
            class="email-input"
            type="email"
            :placeholder="$t('bindEmail.placeholder')"
          />
          <button class="code-btn" type="button" @click="handleGetCode">
            {{ $t('bindEmail.sendCode') }}
          </button>
        </div>

        <!-- 底部按钮 -->
        <div class="action-row">
          <button class="btn skip-btn" type="button" @click="handleSkip">
            {{ $t('common.skip') }}
          </button>
          <button class="btn primary-btn" type="button" @click="handleConfirm">
            {{ $t('common.continue') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'update:email', 'get-code', 'confirm', 'skip', 'close'])

const visible = computed(() => props.modelValue)
const localEmail = ref(props.email)

watch(
  () => props.email,
  (val) => {
    if (val !== localEmail.value) {
      localEmail.value = val
    }
  }
)

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleGetCode = () => {
  emit('update:email', localEmail.value)
  emit('get-code', localEmail.value)
}

const handleSkip = () => {
  emit('skip')
  handleClose()
}

const handleConfirm = () => {
  emit('update:email', localEmail.value)
  emit('confirm', localEmail.value)
}
</script>

<style scoped lang="scss">
.bind-email-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.bind-email-card {
  width: 100%;
  max-width: 480px;
  background-color: var(--bg-page-h5, #ffffff);
  border-radius: 16px 16px 0 0;
  padding: 16px 20px 24px;
  box-sizing: border-box;
}

.card-handle {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background-color: var(--border-color, #E0E0E0);
  margin: 4px auto 16px;
}

.card-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #000000);
}

.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.email-input {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--border-color, #E0E0E0);
  padding: 0 12px;
  font-size: 14px;
  background-color: var(--bg-page-h5, #ffffff);
  color: var(--text-color, #333333);
  box-sizing: border-box;
}

.email-input::placeholder {
  color: #cccccc;
}

.code-btn {
  height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color, #E0E0E0);
  background-color: var(--bg-page-h5, #ffffff);
  color: var(--text-color, #333333);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
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
  border-color: var(--border-color, #E0E0E0);
  color: var(--text-color, #000000);
}

.primary-btn {
  background-color: var(--bg-opposite, #ffffff);
  color: var();
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

