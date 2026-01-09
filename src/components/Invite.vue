<template>
  <transition name="fade">
    <div v-if="visible" class="invite-overlay" @click.self="handleClose">
      <div class="invite-card">
        <!-- 顶部小横条 -->
        <div class="card-handle"></div>

        <!-- 标题 -->
        <h2 class="card-title">{{ $t('invite.title') }}</h2>

        <!-- 邀请码输入 -->
        <div class="form-row">
          <input
            v-model="localCode"
            class="code-input"
            type="text"
            :placeholder="$t('invite.placeholder')"
          />
        </div>
        <p class="tip-text">{{ $t('invite.tip') }}</p>

        <!-- 底部按钮 -->
        <div class="action-row">
          <button class="btn skip-btn" type="button" @click="handleSkip">
            {{ $t('common.skip') }}
          </button>
          <button class="btn primary-btn" type="button" @click="handleConfirm">
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccount } from '@wagmi/vue'
import { ElMessage } from 'element-plus'
import { bindInviteCode } from '@/api/api'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const { address } = useAccount()
const counterStore = useCounterStore()
const { showInvite } = storeToRefs(counterStore)

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue'
])

const visible = computed(() => props.modelValue || showInvite.value)
// 邀请码完全由用户输入控制，不依赖 props
const localCode = ref('')

// 监听弹窗显示状态，每次打开时清空输入框
watch(visible, (newVal) => {
  if (newVal) {
    // 弹窗打开时，清空输入框，让用户重新输入
    localCode.value = ''
  }
})

// 处理邀请码关闭
const handleClose = () => {
  showInvite.value = false
  emit('update:modelValue', false)
}

// 处理邀请码跳过
const handleSkip = () => {
  console.log('跳过邀请码')
  handleClose()
}

// 处理邀请码确定
const handleConfirm = () => {
  console.log('确认邀请码：', localCode.value)
  if (!address.value) {
    console.error('钱包地址不存在，无法绑定邀请码')
    ElMessage.error('请先连接钱包')
    return
  }
  if (!localCode.value) {
    ElMessage.error('邀请码不能为空')
    return
  }

  bindInviteCode({
    address: address.value,
    invitation_code: localCode.value || ''
  }).then(res => {
    ElMessage.success('绑定邀请码成功')
    console.log('绑定邀请码成功：', res)
    handleClose()
  }).catch(err => {
    ElMessage.error('绑定邀请码失败')
    console.error('绑定邀请码失败：', err)
  })
}
</script>

<style scoped lang="scss">
.invite-overlay {
  position: fixed;
  inset: 0;
  z-index: 1001;
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
  background-color: var(--border-color, #E0E0E0);
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
  border: 1px solid var(--border-color, #E0E0E0);
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
  border-color: var(--border-color, #E0E0E0);
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

