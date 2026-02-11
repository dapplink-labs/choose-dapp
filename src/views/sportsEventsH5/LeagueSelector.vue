<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="visible" class="league-selector-overlay" @click.self="handleClose">
        <div class="league-selector-drawer">
          <!-- 顶部拉条 -->
          <div class="grabber"></div>
          
          <!-- 标题区域 -->
          <div class="drawer-header">
            <svg class="header-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20.001">
              <path
                d="M95.579,57.689l1.067-.667c-.4,0-.667-.133-1.067-.133H94.512Zm-7.863,6,2.8,1.067,4.531-3.067.133-3.067-2-1.467a10.317,10.317,0,0,0-6.262,4.267l.8,2.267Zm7.73-1.2-4.264,2.933,1.465,5.067,5.2.133,1.732-4.933-4.131-3.2Zm.533-3.867v3.067l4.261,3.2,2.932-.933.8-2.133a10.52,10.52,0,0,0-6-4.667l-2,1.467Zm-9.33,5.2-.4-1.2a7.71,7.71,0,0,0-.667,1.867Zm17.855.8-.133-.933-.267.667Zm-2.8,9.867h-1.333l-.4,1.2A5.074,5.074,0,0,0,101.707,74.489Zm1.732-9.467-2.8.8-1.865,5.2,1.733,2.533h2.264a9.436,9.436,0,0,0,2.532-6.4v-.667l-1.867-1.467ZM89.848,73.156l1.867-2.267-1.6-5.2-2.931-1.067-1.867,1.333v.8a10.387,10.387,0,0,0,2.133,6.534Zm-1.465.933a6.268,6.268,0,0,0,1.6,1.2l-.4-1.2Zm11.194-.133-1.6-2.267-5.6-.133-1.865,2.4.8,2.133a8.94,8.94,0,0,0,3.731.8,8.828,8.828,0,0,0,3.731-.667Z"
                transform="translate(-85.305 -56.889)" fill="currentColor" />
            </svg>
            <span class="header-title">足球</span>
          </div>
          
          <!-- 联赛列表 -->
          <div class="league-list">
            <div 
              v-for="league in leagues" 
              :key="league.id" 
              class="league-item"
              :class="{ active: selectedLeague === league.id }"
              @click="handleSelect(league)"
            >
              {{ league.name }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedLeague: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'select'])

// 联赛数据
const leagues = ref([
  { id: 'epl', name: '英超联赛' },
  { id: 'laliga', name: '西甲联赛' },
  { id: 'ucl', name: '欧洲冠军联赛' },
  { id: 'bundesliga', name: '德甲联赛' },
  { id: 'ligue1', name: '法甲联赛' },
  { id: 'seriea', name: '意甲联赛' },
  { id: 'mls', name: '美国职业足球大联盟联赛' },
  { id: 'uel', name: '欧洲联赛' },
  { id: 'uecl', name: '欧洲协会联赛' }
])

const handleClose = () => {
  emit('update:visible', false)
}

const handleSelect = (league) => {
  emit('select', league)
  handleClose()
}
</script>

<style scoped lang="scss">
.league-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.league-selector-drawer {
  width: 100%;
  max-height: 70vh;
  background: var(--bg-page);
  border-radius: 16px 16px 0 0;
  padding: 12px 20px 34px;
  overflow-y: auto;
}

.grabber {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1;
  height: 30px;
  background: var(--bg-page);

  &::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    width: 40px;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    margin: 0 auto;
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0 20px;
  border-bottom: 1px solid var(--border-color);
  
  .header-icon {
    width: 22px;
    height: 22px;
    color: var(--bg-opposite);
  }
  
  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--bg-opposite);
  }
}

.league-list {
  padding-top: 8px;
}

.league-item {
  padding: 18px 0;
  font-size: 16px;
  color: var(--bg-opposite);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    color: #BBFF2E;
  }
}

/* 动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
  
  .league-selector-drawer {
    transition: transform 0.3s ease;
  }
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  
  .league-selector-drawer {
    transform: translateY(100%);
  }
}

.drawer-enter-to,
.drawer-leave-from {
  opacity: 1;
  
  .league-selector-drawer {
    transform: translateY(0);
  }
}
</style>
