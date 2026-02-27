<template>
    <transition name="fade">
        <div v-if="visible" class="node-selector-overlay" @click.self="handleClose">
            <div class="node-selector-card">
                <!-- 顶部固定区域 -->
                <div class="card-header">
                    <!-- 顶部小横条 -->
                    <div class="card-handle"></div>
                    <!-- 标题 -->
                    <h2 class="card-title">{{ $t('collectEarnings.selectNode') || '选择领取节点' }}</h2>
                </div>

                <!-- 可滚动内容区域 -->
                <div class="card-content">
                    <!-- 选项列表 -->
                    <div class="options-list">
                        <div v-if="loading" class="loading-text">{{ $t('common.loading') || '加载中...' }}</div>
                        <div v-else-if="options.length === 0" class="empty-text">{{ $t('common.noData') || '暂无数据' }}
                        </div>
                        <div v-else v-for="(option, index) in options" :key="index" class="option-item"
                            :class="{ 'option-selected': tempSelected?.id === option.id }"
                            @click="selectOption(option)">
                            <div class="option-main">
                                <div class="option-header">
                                    <span class="option-name">{{ option.name }}</span>
                                    <span v-if="option.tag" class="option-tag">{{ option.tag }}</span>
                                </div>
                                <div class="option-amount">
                                    {{ formatAmount(option.node_reward) }} CHO
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部区域 -->
                <div class="card-footer">
                    <!-- <p class="footer-note">* {{ $t('collectEarnings.claimNote') || '可领取全部节点收益，也可以选择领取单个节点收益' }}</p> -->
                    <button class="confirm-btn" @click="handleConfirm">
                        {{ $t('common.confirm') || '确认' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { formatChoAmount } from '@/utils/format_amount.js'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    selected: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:visible', 'select'])

const tempSelected = ref(null)

// Body 滚动控制
let originalBodyOverflow = ''
let originalBodyPaddingRight = ''

const preventScroll = (e) => {
    const modalCard = document.querySelector('.node-selector-card')
    if (modalCard?.contains(e.target)) return
    e.preventDefault()
}

const lockBodyScroll = () => {
    originalBodyOverflow = document.body.style.overflow || ''
    originalBodyPaddingRight = document.body.style.paddingRight || ''

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.addEventListener('touchmove', preventScroll, { passive: false })
}

const unlockBodyScroll = () => {
    document.body.style.overflow = originalBodyOverflow
    document.body.style.paddingRight = originalBodyPaddingRight
    document.body.removeEventListener('touchmove', preventScroll)
}

// 监听 visible 变化，初始化 tempSelected
watch(() => props.visible, (val) => {
    if (val) {
        tempSelected.value = props.selected
        lockBodyScroll()
    } else {
        unlockBodyScroll()
    }
}, { immediate: true })

// CHO 金额（默认 6 精度）
const formatAmount = (value) => {
    return formatChoAmount(value, { maxFractionDigits: 4, useGrouping: true })
}

// 选择选项（仅更新临时状态）
const selectOption = (option) => {
    tempSelected.value = option
}

// 确认选择
const handleConfirm = () => {
    if (tempSelected.value) {
        emit('select', tempSelected.value)
    }
    handleClose()
}

// 关闭弹窗
const handleClose = () => {
    emit('update:visible', false)
}

onUnmounted(() => {
    unlockBodyScroll()
})
</script>

<style scoped lang="scss">
.node-selector-overlay {
    position: fixed;
    inset: 0;
    z-index: 2002;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.7);
    overflow: hidden;
    touch-action: none;
}

.node-selector-card {
    width: 100%;
    max-width: 480px;
    background-color: #111; // Dark background
    border-radius: 20px 20px 0 0;
    box-sizing: border-box;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #fff;
}

.card-header {
    flex-shrink: 0;
    padding: 12px 20px 0;
    background-color: #111;
    z-index: 10;
}

.card-handle {
    width: 40px;
    height: 4px;
    border-radius: 999px;
    background-color: #333;
    margin: 0 auto 16px;
}

.card-title {
    margin: 0 0 20px;
    padding: 0;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
}

.card-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px;
    box-sizing: border-box;
}

.options-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 100px;
}

.loading-text,
.empty-text {
    text-align: center;
    padding: 40px 20px;
    color: #999;
    font-size: 14px;
}

.option-item {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-radius: 12px;
    background-color: #1A1A1A;
    border: 1px solid #333;
    cursor: pointer;
    transition: all 0.2s ease;

    .option-main {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .option-header {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .option-name {
        color: #fff;
        font-size: 15px;
        font-weight: 500;
    }

    .option-tag {
        display: inline-block;
        padding: 2px 6px;
        background: rgba(234, 171, 74, 0.2);
        color: #EAAB4A;
        border-radius: 4px;
        font-size: 11px;
        line-height: 1.2;
    }

    .option-amount {
        font-size: 15px;
        color: #a4f128; // Lime green
        font-weight: 500;
    }

    &.option-selected {
        border: 1px solid #fff;
        background-color: #222;
    }
}

.card-footer {
    flex-shrink: 0;
    padding: 16px 20px 30px; // Extra bottom padding for safe area
    background-color: #111;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.footer-note {
    margin: 0;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
}

.confirm-btn {
    width: 100%;
    height: 50px;
    background: #a4f128; // Lime green
    color: #000;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;

    &:active {
        opacity: 0.9;
    }
}

// Animation
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
