<template>
  <transition name="date-sheet-fade">
    <!-- 遮罩层：@touchmove.prevent 阻止背景页面滚动 -->
    <div v-if="modelValue" class="date-range-overlay" @click.self="handleClose" @touchmove.prevent>
      <!-- 内容抽屉：@touchmove.stop 允许内部滑动 -->
      <div class="date-range-sheet" @touchmove.stop>
        <!-- 顶部装饰拉条 -->
        <div class="sheet-handle" />

        <div class="sheet-header">
          <h2 class="sheet-title">{{ $t('datePicker.title') }}</h2>
          <p class="sheet-desc">{{ $t('datePicker.desc', { days: maxDays }) }}</p>
        </div>

        <!-- 快捷选择区 (药丸型) -->
        <div class="quick-select">
          <button v-for="opt in quickOptions" :key="opt.days" type="button" class="quick-btn"
            :class="{ active: activeQuick === opt.days }" @click="applyQuick(opt.days)">
            {{ opt.label }}
          </button>
        </div>

        <!-- 日期展示行 -->
        <div class="date-display-row">
          <div class="date-input-box" :class="{ active: activeField === 'start' }" @click="switchField('start')">
            {{ formatDisplayDate(startDate) }}
          </div>
          <span class="date-sep">-</span>
          <div class="date-input-box" :class="{ active: activeField === 'end' }" @click="switchField('end')">
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
                {{ y }}{{ $t('datePicker.year') }}
              </div>
              <div class="wheel-pad" />
            </div>

            <!-- 月份 -->
            <div ref="monthColRef" class="wheel-col" @scroll="onScroll($event, 'month')">
              <div class="wheel-pad" />
              <div v-for="m in 12" :key="m" class="wheel-item" :class="{ selected: selectedMonth === m }">
                {{ m }}{{ $t('datePicker.month') }}
              </div>
              <div class="wheel-pad" />
            </div>

            <!-- 日期 -->
            <div ref="dayColRef" class="wheel-col" @scroll="onScroll($event, 'day')">
              <div class="wheel-pad" />
              <div v-for="d in maxDayCount" :key="d" class="wheel-item" :class="{ selected: selectedDay === d }">
                {{ d }}{{ $t('datePicker.day') }}
              </div>
              <div class="wheel-pad" />
            </div>
          </div>
        </div>

        <!-- 确定按钮 -->
        <div class="footer-wrap">
          <button type="button" class="confirm-btn" @click="handleConfirm">
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  maxDays: { type: Number, default: 90 },
  minDate: { type: [Date, String], default: null },
  maxDate: { type: [Date, String], default: null },
  defaultStartDate: [Date, String],
  defaultEndDate: [Date, String],
  showTime: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'change'])

const ITEM_HEIGHT = 44

// 状态管理
const startDate = ref(new Date())
const endDate = ref(new Date())
const activeField = ref('start')
const activeQuick = ref(30)
const isScrolling = ref(false)

const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedDay = ref(new Date().getDate())

const yearColRef = ref(null)
const monthColRef = ref(null)
const dayColRef = ref(null)

// 触感反馈
const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
}

// 基础数据
const quickOptions = computed(() => [
  { days: 7, label: t('datePicker.days', { n: 7 }) },
  { days: 30, label: t('datePicker.days', { n: 30 }) },
  { days: 90, label: t('datePicker.days', { n: 90 }) }
])

const yearList = computed(() => {
  const current = new Date().getFullYear()
  const minYear = props.minDate ? new Date(props.minDate).getFullYear() : current - 5
  const maxYear = props.maxDate ? new Date(props.maxDate).getFullYear() : current + 5
  const years = []
  for (let y = minYear; y <= maxYear; y++) years.push(y)
  return years
})

const maxDayCount = computed(() => new Date(selectedYear.value, selectedMonth.value, 0).getDate())

// 格式化输出
function formatDisplayDate(date) {
  if (!date) return '--'
  const f = (n) => String(n).padStart(2, '0')
  const dateStr = `${date.getFullYear()}/${f(date.getMonth() + 1)}/${f(date.getDate())}`
  return props.showTime ? `${dateStr} 06:00:00` : dateStr
}

// 防抖处理滑动
let scrollTimer = null
let lastScrollTime = 0
const SCROLL_DEBOUNCE = 80

function onScroll(e, type) {
  isScrolling.value = true
  const now = Date.now()

  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    const el = e.target
    const index = Math.round(el.scrollTop / ITEM_HEIGHT)
    const clampedIndex = Math.max(0, Math.min(index, getMaxIndex(type)))

    let changed = false
    if (type === 'year') {
      const newYear = yearList.value[clampedIndex]
      if (newYear !== selectedYear.value) {
        selectedYear.value = newYear
        changed = true
      }
    } else if (type === 'month') {
      const newMonth = clampedIndex + 1
      if (newMonth !== selectedMonth.value) {
        selectedMonth.value = newMonth
        changed = true
      }
    } else if (type === 'day') {
      const newDay = clampedIndex + 1
      if (newDay !== selectedDay.value) {
        selectedDay.value = newDay
        changed = true
      }
    }

    // 自动修正月底天数
    if (selectedDay.value > maxDayCount.value) {
      selectedDay.value = maxDayCount.value
      changed = true
    }

    if (changed) {
      triggerHaptic()
      updateDateObject()
    }

    syncScrollPosition()
    isScrolling.value = false
  }, now - lastScrollTime < 50 ? SCROLL_DEBOUNCE : 50)

  lastScrollTime = now
}

function getMaxIndex(type) {
  if (type === 'year') return yearList.value.length - 1
  if (type === 'month') return 11
  return maxDayCount.value - 1
}

function updateDateObject() {
  const newDate = new Date(selectedYear.value, selectedMonth.value - 1, selectedDay.value, 6, 0, 0)

  // 日期范围限制
  const minD = props.minDate ? new Date(props.minDate) : null
  const maxD = props.maxDate ? new Date(props.maxDate) : null

  let finalDate = newDate
  if (minD && newDate < minD) finalDate = minD
  if (maxD && newDate > maxD) finalDate = maxD

  if (activeField.value === 'start') {
    startDate.value = finalDate
    if (startDate.value > endDate.value) endDate.value = new Date(startDate.value)
  } else {
    endDate.value = finalDate
    if (endDate.value < startDate.value) startDate.value = new Date(endDate.value)
  }

  activeQuick.value = null
  emit('change', { startDate: startDate.value, endDate: endDate.value })
}

function syncScrollPosition(behavior = 'smooth') {
  nextTick(() => {
    const yIdx = yearList.value.indexOf(selectedYear.value)
    if (yearColRef.value && yIdx >= 0) {
      yearColRef.value.scrollTo({ top: yIdx * ITEM_HEIGHT, behavior })
    }
    if (monthColRef.value) {
      monthColRef.value.scrollTo({ top: (selectedMonth.value - 1) * ITEM_HEIGHT, behavior })
    }
    if (dayColRef.value) {
      dayColRef.value.scrollTo({ top: (selectedDay.value - 1) * ITEM_HEIGHT, behavior })
    }
  })
}

function applyQuick(days) {
  triggerHaptic()
  activeQuick.value = days
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  startDate.value = start
  endDate.value = end

  const target = activeField.value === 'start' ? start : end
  selectedYear.value = target.getFullYear()
  selectedMonth.value = target.getMonth() + 1
  selectedDay.value = target.getDate()
  syncScrollPosition()

  emit('change', { startDate: startDate.value, endDate: endDate.value })
}

function switchField(field) {
  if (activeField.value === field) return
  triggerHaptic()
  activeField.value = field
  const target = field === 'start' ? startDate.value : endDate.value
  selectedYear.value = target.getFullYear()
  selectedMonth.value = target.getMonth() + 1
  selectedDay.value = target.getDate()
  syncScrollPosition()
}

// 解决滚动穿透
watch(() => props.modelValue, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
    startDate.value = props.defaultStartDate ? new Date(props.defaultStartDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    endDate.value = props.defaultEndDate ? new Date(props.defaultEndDate) : new Date()

    activeField.value = 'start'
    const d = startDate.value
    selectedYear.value = d.getFullYear()
    selectedMonth.value = d.getMonth() + 1
    selectedDay.value = d.getDate()
    nextTick(() => syncScrollPosition('auto'))
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  clearTimeout(scrollTimer)
})

function handleClose() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  triggerHaptic()
  emit('confirm', {
    startDate: startDate.value,
    endDate: endDate.value,
    startDateStr: formatDisplayDate(startDate.value),
    endDateStr: formatDisplayDate(endDate.value)
  })
  handleClose()
}
</script>

<style scoped lang="scss">
/* 动效 */
.date-sheet-fade-enter-active,
.date-sheet-fade-leave-active {
  transition: opacity 0.3s;

  .date-range-sheet {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.date-sheet-fade-enter-from,
.date-sheet-fade-leave-to {
  opacity: 0;

  .date-range-sheet {
    transform: translateY(100%);
  }
}

.date-range-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.date-range-sheet {
  width: 100%;
  max-width: 500px;
  background: var(--bg-page);
  border-radius: 24px 24px 0 0;
  padding: 12px 20px calc(env(safe-area-inset-bottom, 20px) + 10px);
  color: var(--bg-opposite);
  box-sizing: border-box;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: var(--border-color, #333333);
  border-radius: 2px;
  margin: 0 auto 24px;
}

.sheet-header {
  margin-bottom: 24px;

  .sheet-title {
    font-size: 22px;
    font-weight: bold;
    margin: 0 0 8px;
    color: var(--bg-opposite);
  }

  .sheet-desc {
    font-size: 14px;
    color: var(--text-secondary, #666666);
    margin: 0;
  }
}

.quick-select {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;

  .quick-btn {
    flex: 1;
    height: 40px;
    border-radius: 20px;
    border: 1px solid var(--border-color, #333333);
    background: transparent;
    color: var(--text-dark-gray);
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &:active {
      transform: scale(0.96);
    }

    &.active {
      border-color: var(--bg-opposite);
      color: var(--bg-opposite);
    }
  }
}

.date-display-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;

  .date-input-box {
    flex: 1;
    min-width: 0;
    height: 44px;
    line-height: 44px;
    text-align: center;
    border: 1.5px solid var(--border-color, #333333);
    border-radius: 10px;
    font-size: 12px;
    font-family: 'SF Mono', 'Menlo', 'Courier New', monospace;
    color: var(--bg-opposite);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 8px;
    -webkit-tap-highlight-color: transparent;

    &:active {
      transform: scale(0.98);
    }

    &.active {
      border-color: var(--text-color-y);
      background: rgba(204, 255, 51, 0.08);
    }
  }

  .date-sep {
    color: var(--bg-opposite);
    font-weight: bold;
    flex-shrink: 0;
  }
}

.wheel-section {
  position: relative;
  height: 200px;
  margin-bottom: 30px;
  overflow: hidden;

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
    scrollbar-width: none;
    overscroll-behavior: contain;

    &::-webkit-scrollbar {
      display: none;
    }

    -webkit-overflow-scrolling: touch;
  }

  .wheel-pad {
    height: 78px;
  }

  .wheel-item {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--text-dark-gray);
    scroll-snap-align: center;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, opacity;

    &.selected {
      color: var(--bg-opposite);
      font-size: 20px;
      font-weight: 600;
    }
  }

  .wheel-mask-top,
  .wheel-mask-bottom {
    position: absolute;
    left: 0;
    right: 0;
    height: 78px;
    pointer-events: none;
    z-index: 10;
  }

  .wheel-mask-top {
    top: 0;
    background: linear-gradient(to bottom, var(--bg-page, #111111) 10%, transparent);
  }

  .wheel-mask-bottom {
    bottom: 0;
    background: linear-gradient(to top, var(--bg-page, #111111) 10%, transparent);
  }
}

.footer-wrap {
  .confirm-btn {
    width: 100%;
    height: 52px;
    background: var(--text-color-y);
    color: #000000;
    border: none;
    border-radius: 12px;
    font-size: 17px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;

    &:active {
      transform: scale(0.97);
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

</style>