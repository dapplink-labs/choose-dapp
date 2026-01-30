<template>
  <transition name="date-sheet-fade">
    <!-- 遮罩层：@touchmove.prevent 阻止背景页面滚动 -->
    <div 
      v-if="modelValue" 
      class="date-range-overlay" 
      @click.self="handleClose"
      @touchmove.prevent
    >
      <!-- 内容抽屉：@touchmove.stop 允许内部滑动 -->
      <div class="date-range-sheet" @touchmove.stop>
        <!-- 顶部装饰拉条 -->
        <div class="sheet-handle" />

        <div class="sheet-header">
          <h2 class="sheet-title">按日期范围筛选</h2>
          <p class="sheet-desc">你可以查看过去的{{ maxDays }}天的订单记录</p>
        </div>

        <!-- 快捷选择区 (药丸型) -->
        <div class="quick-select">
          <button
            v-for="opt in quickOptions"
            :key="opt.days"
            type="button"
            class="quick-btn"
            :class="{ active: activeQuick === opt.days }"
            @click="applyQuick(opt.days)"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- 日期展示行 -->
        <div class="date-display-row">
          <div 
            class="date-input-box" 
            :class="{ active: activeField === 'start' }"
            @click="activeField = 'start'"
          >
            {{ formatDisplayDate(startDate) }}
          </div>
          <span class="date-sep">-</span>
          <div 
            class="date-input-box" 
            :class="{ active: activeField === 'end' }"
            @click="activeField = 'end'"
          >
            {{ formatDisplayDate(endDate) }}
          </div>
        </div>

        <!-- 滚轮选择器核心 -->
        <div class="wheel-section">
          <!-- 背景遮罩：pointer-events: none 允许手指穿透滑动下方列表 -->
          <div class="wheel-mask-top"></div>
          <div class="wheel-mask-bottom"></div>
          
          <div class="wheel-columns">
            <!-- 年份 -->
            <div ref="yearColRef" class="wheel-col" @scroll="onScroll($event, 'year')">
              <div class="wheel-pad" />
              <div v-for="y in yearList" :key="y" class="wheel-item" :class="{ selected: selectedYear === y }">
                {{ y }}年
              </div>
              <div class="wheel-pad" />
            </div>

            <!-- 月份 -->
            <div ref="monthColRef" class="wheel-col" @scroll="onScroll($event, 'month')">
              <div class="wheel-pad" />
              <div v-for="m in 12" :key="m" class="wheel-item" :class="{ selected: selectedMonth === m }">
                {{ m }}月
              </div>
              <div class="wheel-pad" />
            </div>

            <!-- 日期 -->
            <div ref="dayColRef" class="wheel-col" @scroll="onScroll($event, 'day')">
              <div class="wheel-pad" />
              <div v-for="d in maxDayCount" :key="d" class="wheel-item" :class="{ selected: selectedDay === d }">
                {{ d }}日
              </div>
              <div class="wheel-pad" />
            </div>
          </div>
        </div>

        <!-- 确定按钮 -->
        <div class="footer-wrap">
          <button type="button" class="confirm-btn" @click="handleConfirm">
            确定
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  maxDays: { type: Number, default: 90 },
  defaultStartDate: [Date, String],
  defaultEndDate: [Date, String]
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const ITEM_HEIGHT = 44 // 对应 CSS 中的 wheel-item 高度

// 状态管理
const startDate = ref(new Date())
const endDate = ref(new Date())
const activeField = ref('start')
const activeQuick = ref(30)

const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedDay = ref(new Date().getDate())

const yearColRef = ref(null)
const monthColRef = ref(null)
const dayColRef = ref(null)

// 基础数据
const quickOptions = [
  { days: 7, label: '7 天' },
  { days: 30, label: '30 天' },
  { days: 90, label: '90 天' }
]

const yearList = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 11 }, (_, i) => current - 5 + i)
})

const maxDayCount = computed(() => new Date(selectedYear.value, selectedMonth.value, 0).getDate())

// 格式化输出：YYYY/MM/DD 06:00:00
function formatDisplayDate(date) {
  if (!date) return '--'
  const f = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}/${f(date.getMonth() + 1)}/${f(date.getDate())} 06:00:00`
}

// 处理滑动逻辑
let scrollTimer = null
function onScroll(e, type) {
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    const el = e.target
    const index = Math.round(el.scrollTop / ITEM_HEIGHT)
    
    if (type === 'year') selectedYear.value = yearList.value[index]
    else if (type === 'month') selectedMonth.value = index + 1
    else if (type === 'day') selectedDay.value = index + 1

    // 自动修正月底天数 (例如从 1月31日 切换到 2月)
    if (selectedDay.value > maxDayCount.value) {
      selectedDay.value = maxDayCount.value
    }
    
    updateDateObject()
    syncScrollPosition()
  }, 100)
}

function updateDateObject() {
  const newDate = new Date(selectedYear.value, selectedMonth.value - 1, selectedDay.value, 6, 0, 0)
  if (activeField.value === 'start') {
    startDate.value = newDate
    if (startDate.value > endDate.value) endDate.value = new Date(startDate.value)
  } else {
    endDate.value = newDate
    if (endDate.value < startDate.value) startDate.value = new Date(endDate.value)
  }
  activeQuick.value = null // 手动滑动时取消快捷项高亮
}

function syncScrollPosition(behavior = 'smooth') {
  nextTick(() => {
    const yIdx = yearList.value.indexOf(selectedYear.value)
    if (yearColRef.value) yearColRef.value.scrollTo({ top: yIdx * ITEM_HEIGHT, behavior })
    if (monthColRef.value) monthColRef.value.scrollTo({ top: (selectedMonth.value - 1) * ITEM_HEIGHT, behavior })
    if (dayColRef.value) dayColRef.value.scrollTo({ top: (selectedDay.value - 1) * ITEM_HEIGHT, behavior })
  })
}

function applyQuick(days) {
  activeQuick.value = days
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  startDate.value = start
  endDate.value = end
  
  // 更新当前轮盘指针位置（基于当前激活的输入框）
  const target = activeField.value === 'start' ? start : end
  selectedYear.value = target.getFullYear()
  selectedMonth.value = target.getMonth() + 1
  selectedDay.value = target.getDate()
  syncScrollPosition()
}

// 解决滚动穿透：锁定背景
watch(() => props.modelValue, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
    // 初始化日期
    startDate.value = props.defaultStartDate ? new Date(props.defaultStartDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    endDate.value = props.defaultEndDate ? new Date(props.defaultEndDate) : new Date()
    
    activeField.value = 'start'
    const d = startDate.value
    selectedYear.value = d.getFullYear()
    selectedMonth.value = d.getMonth() + 1
    selectedDay.value = d.getDate()
    syncScrollPosition('auto')
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

function handleClose() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  emit('confirm', {
    startDate: startDate.value,
    endDate: endDate.value
  })
  handleClose()
}
</script>

<style scoped lang="scss">
/* 动效 */
.date-sheet-fade-enter-active, .date-sheet-fade-leave-active {
  transition: opacity 0.3s;
  .date-range-sheet { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
}
.date-sheet-fade-enter-from, .date-sheet-fade-leave-to {
  opacity: 0;
  .date-range-sheet { transform: translateY(100%); }
}

.date-range-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.date-range-sheet {
  width: 100%;
  max-width: 500px;
  background: #111111; /* 极深灰背景 */
  border-radius: 24px 24px 0 0;
  padding: 12px 20px 30px;
  color: #ffffff;
  box-sizing: border-box;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: #333333;
  border-radius: 2px;
  margin: 0 auto 24px;
}

.sheet-header {
  margin-bottom: 24px;
  .sheet-title { font-size: 26px; font-weight: bold; margin: 0 0 8px; color: #fff; }
  .sheet-desc { font-size: 15px; color: #666666; margin: 0; }
}

.quick-select {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  
  .quick-btn {
    flex: 1;
    height: 42px;
    border-radius: 21px; /* 完全圆角药丸型 */
    border: 1px solid #333333;
    background: transparent;
    color: #888888;
    font-size: 14px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &.active {
      border-color: #ffffff;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.date-display-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  
  .date-input-box {
    flex: 1;
    height: 48px;
    line-height: 48px;
    text-align: center;
    background: #1a1a1a;
    border: 1px solid #333333;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Courier New', Courier, monospace; /* 模拟数字字体 */
    color: #ffffff;
    transition: border-color 0.2s;
    
    &.active {
      border-color: #ffffff; /* 活跃时白框 */
    }
  }
  .date-sep { color: #666666; font-weight: bold; }
}

.wheel-section {
  position: relative;
  height: 220px;
  margin-bottom: 35px;
  overflow: hidden;
  background: #111111;

  .wheel-columns {
    display: flex;
    height: 100%;
    position: relative;
    z-index: 1;
  }

  .wheel-col {
    flex: 1;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar { display: none; } /* Chrome/Safari */
    
    /* 惯性滚动优化 */
    -webkit-overflow-scrolling: touch;
  }

  .wheel-pad {
    height: 88px; /* (容器高度220 - 项高度44) / 2 */
  }

  .wheel-item {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #444444; /* 非选中项暗色 */
    scroll-snap-align: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &.selected {
      color: #ffffff;
      font-size: 22px;
      font-weight: bold;
    }
  }

  /* 遮罩实现渐变消失效果 */
  .wheel-mask-top, .wheel-mask-bottom {
    position: absolute;
    left: 0; right: 0; height: 90px;
    pointer-events: none; /* 必须为none，否则无法滑动列表 */
    z-index: 10;
  }
  .wheel-mask-top {
    top: 0;
    background: linear-gradient(to bottom, #111111 15%, rgba(17, 17, 17, 0));
  }
  .wheel-mask-bottom {
    bottom: 0;
    background: linear-gradient(to top, #111111 15%, rgba(17, 17, 17, 0));
  }
}

.footer-wrap {
  .confirm-btn {
    width: 100%;
    height: 56px;
    background: #ccff33; /* 荧光亮绿 */
    color: #000000;
    border: none;
    border-radius: 14px;
    font-size: 18px;
    font-weight: 900;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.2s;
    
    &:active {
      transform: scale(0.97);
      opacity: 0.8;
    }
  }
}
</style>