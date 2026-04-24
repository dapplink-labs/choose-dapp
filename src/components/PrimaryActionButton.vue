<template>
  <button
    class="primary-action-button"
    :class="{ 'primary-action-button--block': block }"
    :disabled="disabled"
    :type="nativeType"
    :style="buttonStyle"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  nativeType: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: true,
  },
  height: {
    type: String,
    default: '52px',
  },
  radius: {
    type: String,
    default: '14px',
  },
  fontSize: {
    type: String,
    default: '17px',
  },
  fontWeight: {
    type: [String, Number],
    default: 700,
  },
  letterSpacing: {
    type: String,
    default: '0',
  },
  textColor: {
    type: String,
    default: 'var(--button-text-color, #121212)',
  },
  disabledTextColor: {
    type: String,
    default: 'var(--button-disabled-text-color, #9aa3b2)',
  },
  gradientFrom: {
    type: String,
    default: 'var(--button-gradient-from, #ffd94b)',
  },
  gradientTo: {
    type: String,
    default: 'var(--button-gradient-to, #ffcc1f)',
  },
  disabledBg: {
    type: String,
    default: 'var(--button-disabled-bg, #565d68)',
  },
})

const buttonStyle = computed(() => ({
  '--primary-action-height': props.height,
  '--primary-action-radius': props.radius,
  '--primary-action-font-size': props.fontSize,
  '--primary-action-font-weight': String(props.fontWeight),
  '--primary-action-letter-spacing': props.letterSpacing,
  '--primary-action-text-color': props.textColor,
  '--primary-action-disabled-text-color': props.disabledTextColor,
  '--primary-action-gradient-from': props.gradientFrom,
  '--primary-action-gradient-to': props.gradientTo,
  '--primary-action-disabled-bg': props.disabledBg,
}))
</script>

<style scoped>
.primary-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--primary-action-height);
  padding: 0 20px;
  border: none;
  border-radius: var(--primary-action-radius);
  background: linear-gradient(180deg, var(--primary-action-gradient-from) 0%, var(--primary-action-gradient-to) 100%);
  color: var(--primary-action-text-color);
  font-size: var(--primary-action-font-size);
  font-weight: var(--primary-action-font-weight);
  letter-spacing: var(--primary-action-letter-spacing);
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.12s ease,
    opacity 0.12s ease;
}

.primary-action-button--block {
  width: 100%;
}

.primary-action-button:not(:disabled):active {
  transform: scale(0.985);
}

.primary-action-button:disabled {
  background: var(--primary-action-disabled-bg);
  color: var(--primary-action-disabled-text-color);
  cursor: not-allowed;
}
</style>
