<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <img class="confetti-bg" src="@/assets/images/mask/model-bg.png" alt="background" />
        <div class="icon-wrapper">
          <el-icon class="success-icon" :size="40" color="var(--text-color-y, #ffd94b)"><Check /></el-icon>
        </div>
      </div>
      
      <div class="modal-body">
        <p class="success-text">{{ $t('lpVault.activationSuccess') }}</p>
        <div class="node-badge">
          <span class="badge-label">{{ nodeName }}</span>
          <span class="badge-value">{{ nodeLevel }}</span>
        </div>
        
        <PrimaryActionButton
          class="confirm-btn"
          height="48px"
          radius="12px"
          font-size="16px"
          font-weight="600"
          text-color="#000000"
          gradient-from="#ffffff"
          gradient-to="#ffffff"
          @click="handleClose"
        >
          {{ $t('lpVault.confirm') }}
        </PrimaryActionButton>
        
        <p class="footer-note">
          * {{ $t('lpVault.rewardsDistributionNote') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Check } from '@element-plus/icons-vue'
import PrimaryActionButton from '@/components/PrimaryActionButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  nodeLevel: {
    type: String,
    default: ''
  },
  nodeName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'close'])

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  width: 100%;
  margin: 0 10px;
 
  background: #111111;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-header {
  width: 100%;
  height: 120px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .confetti-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.8;
  }
  
  .icon-wrapper {
    position: relative;
    z-index: 2;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 3px solid var(--text-color-y, #ffd94b);
    background: transparent;
    margin-top: 20px;
  }
  
  .success-icon {
    color: var(--text-color-y, #ffd94b);
  }
}

.modal-body {
    width: 100%;
  padding: 20px 17px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;

  
  .success-text {
    color: #999;
    font-size: 14px;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .node-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    
    .badge-label {
      color: #fff;
      font-size: 24px;
      font-weight: 600;
      margin-right: 8px;
    }
    
    .badge-value {
      background: #333;
      color: #CC9933; /* Gold/Orange color for T3 */
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  .confirm-btn {
    margin-bottom: 16px;
  }
  
  .footer-note {
    width: 100%;
    font-size: 12px;
    color: #666;
    text-align: left;
    line-height: 1.4;
  }
}
</style>
