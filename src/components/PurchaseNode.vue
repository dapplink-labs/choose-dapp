<template>
  <transition name="slide-up">
    <div v-if="modelValue" class="purchase-overlay" @click.self="handleClose">
      <div class="purchase-modal" @click.stop>
        <!-- 底部拖拽条 -->
        <div class="drag-handle"></div>
        
        <!-- 节点类型标题 -->
        <div class="node-type-header">
          <span class="node-type-label">{{ $t('purchaseNode.nodeType') }}</span>
          <span class="node-type-value">{{ title }}</span>
        </div>

        <!-- 收益信息列表 -->
        <div class="earnings-list">
          <div class="earnings-item">
            <span class="earnings-label">{{ $t('purchaseNode.estimatedTradeProfit') }}</span>
            <span class="earnings-value">{{ tradeProfit }}</span>
          </div>
          <div class="earnings-item">
            <span class="earnings-label">{{ $t('purchaseNode.subCoinFeeProfit') }}</span>
            <span class="earnings-value">{{ feeProfit }}</span>
          </div>
          <div class="earnings-item">
            <span class="earnings-label">{{ $t('purchaseNode.secondaryProfit') }}</span>
            <span class="earnings-value">{{ secondaryProfit }}</span>
          </div>
        </div>

        <!-- 提示文字 -->
        <p class="tip-text">{{ $t('purchaseNode.tipText') }}</p>

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
  tradeProfit: { type: String, default: '0%' },
  feeProfit: { type: String, default: '0%' },
  secondaryProfit: { type: String, default: '0%' }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.node-type-label,
.node-type-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color, #1a1a1a);
  transition: color 0.3s ease;
}

.earnings-list {
  margin-bottom: 20px;
}

.earnings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.earnings-label {
  font-size: 14px;
  color: var(--text-color, #1a1a1a);
  flex: 1;
  transition: color 0.3s ease;
}

.earnings-value {
  font-size: 14px;
  color: var(--text-color, #1a1a1a);
  font-weight: 400;
  transition: color 0.3s ease;
}

.tip-text {
  margin: 0 0 24px;
  font-size: 12px;
  color: var(--text-dark-gray, #909090);
  line-height: 1.5;
  transition: color 0.3s ease;
  border-top: 1px solid var(--bg-light, #F3F3F3);
  padding-top: 14px;
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
