<template>
  <transition name="slide-up">
    <div v-if="modelValue" class="purchase-overlay" @click.self="handleClose">
      <div class="purchase-modal" @click.stop>
        <!-- 底部拖拽条 -->
        <div class="drag-handle"></div>

        <!-- 节点类型标题 -->
        <div class="node-type-header">确认购买节点</div>

        <!-- 收益信息列表 -->
        <div class="earnings-list">
          <div class="earnings-item">
            <span class="earnings-label">{{ $t('purchaseNode.nodeType') }}</span>
            <span class="earnings-value">{{ title }}</span>
          </div>
          <div class="earnings-item">
            <span class="earnings-label">节点价格</span>
            <span class="earnings-value">{{ price }} U</span>
          </div>
        </div>
        <!-- 购买按钮 -->
        <button class="buy-btn" @click="handleBuy">{{ $t('purchaseNode.buyBtn') }}</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

const props = defineProps({
  modelValue: { type: Boolean },
  title: { type: String, default: '' },
  price: { type: String, default: '0' },
})

const emit = defineEmits(['update:modelValue', 'buy', 'close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBuy = () => {
  emit('buy')
}
</script>

<style scoped lang="scss">
.purchase-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.purchase-modal {
  width: 100%;
  background-color: var(--bg-page-h5, #ffffff);
  border-radius: 20px 20px 0 0;
  padding: 20px 20px 28px;
  box-sizing: border-box;
  transition: background-color 0.3s ease;
}

.drag-handle {
  width: 40px;
  height: 4px;
  background-color: var(--border-color, #E0E0E0);
  border-radius: 2px;
  margin: 0 auto 20px;
  transition: background-color 0.3s ease;
}

.node-type-header {
  display: block;
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 20px;
  color: var(--text-color, #1a1a1a);
  border-bottom: 1px solid var(--border-color, #E0E0E0);
  padding-bottom: 18px;
}

.earnings-list {
  margin-bottom: 20px;
}

.earnings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;

  &:last-child {
    margin-bottom: 58px;
  }
}

.earnings-label,
.earnings-value {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 16px;
  color: var(--text-color, #1a1a1a);
}


.buy-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background-color: var(--bg-opposite, #000000);
  font-size: 16px;
  font-weight: 500;
  color: var(--bg-page-h5, #ffffff);
  cursor: pointer;
  transition: opacity 0.2s, background-color 0.3s ease, color 0.3s ease;

  &:active {
    opacity: 0.8;
  }
}

// 底部弹窗动画
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.3s ease;

  .purchase-modal {
    transition: transform 0.3s ease;
  }
}

.slide-up-enter-from {
  opacity: 0;

  .purchase-modal {
    transform: translateY(100%);
  }
}

.slide-up-leave-to {
  opacity: 0;

  .purchase-modal {
    transform: translateY(100%);
  }
}
</style>
