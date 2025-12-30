<template>
    <transition name="fade">
        <div v-if="modelValue" class="collect-earnings-overlay" @click.self="handleClose">
            <div class="collect-earnings-card">
                <!-- 顶部小横条 -->
                <div class="card-handle"></div>

                <!-- 标题 -->
                <h2 class="card-title">{{ $t('collectEarnings.title') }}</h2>

                <!-- 选项列表 -->
                <div class="options-list">
                    <div v-for="(option, index) in options" :key="index" class="option-item"
                        :class="{ 'option-selected': selectedIndex === index }" @click="selectOption(index)">
                        <div class="option-header">
                            <span class="option-name">{{ option.name }}</span>
                            <span v-if="option.tag" class="option-tag">{{ option.tag }}</span>
                        </div>
                        <div class="option-amount">{{ option.amount }} CHO</div>
                    </div>
                </div>

                <!-- 说明文字 -->
                <p class="tip-text">{{ $t('collectEarnings.tip') }}</p>

                <!-- 确认按钮 -->
                <button class="confirm-btn" @click="handleConfirm">
                    {{ $t('common.confirm') }}
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { defineProps, defineEmits, watch, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array,
        default: () => [
            {
                name: 'All Node Rewards',
                tag: '',
                amount: '100,0000'
            },
            {
                name: 'Data Node',
                tag: 'T2',
                amount: '80,000'
            },
            {
                name: 'Validation Node',
                tag: 'T3',
                amount: '200,000'
            }
        ]
    }
})

const emit = defineEmits(['update:modelValue', 'close', 'confirm'])

// 选中的选项索引
const selectedIndex = ref(0)

// 选择选项
const selectOption = (index) => {
    selectedIndex.value = index
}

// 保存原始 body 样式
let originalBodyOverflow = ''
let originalBodyPaddingRight = ''

// 阻止背景滚动
const lockBodyScroll = () => {
    // 保存原始样式
    originalBodyOverflow = document.body.style.overflow || ''
    originalBodyPaddingRight = document.body.style.paddingRight || ''

    // 计算滚动条宽度（避免内容跳动）
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // 设置 body 样式
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    // 阻止触摸滚动（移动端）
    document.body.addEventListener('touchmove', preventScroll, { passive: false })
}

// 恢复背景滚动
const unlockBodyScroll = () => {
    // 恢复原始样式
    document.body.style.overflow = originalBodyOverflow
    document.body.style.paddingRight = originalBodyPaddingRight

    // 移除触摸滚动阻止
    document.body.removeEventListener('touchmove', preventScroll)
}

// 阻止滚动事件
const preventScroll = (e) => {
    // 如果滚动发生在模态框内部，允许滚动
    const target = e.target
    const modalCard = document.querySelector('.collect-earnings-card')
    if (modalCard && modalCard.contains(target)) {
        return
    }
    // 否则阻止滚动
    e.preventDefault()
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        lockBodyScroll()
        // 重置选中状态为第一个选项
        selectedIndex.value = 0
    } else {
        unlockBodyScroll()
    }
}, { immediate: true })

// 组件卸载时恢复滚动
onUnmounted(() => {
    unlockBodyScroll()
})

const handleClose = () => {
    emit('update:modelValue', false)
    emit('close')
}

const handleConfirm = () => {
    const selectedOption = props.options[selectedIndex.value]
    emit('confirm', selectedOption, selectedIndex.value)
    handleClose()
}
</script>

<style scoped lang="scss">
.collect-earnings-overlay {
    position: fixed;
    inset: 0;
    z-index: 2100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    overflow: hidden;
    touch-action: none;
}

.collect-earnings-card {
    width: 100%;
    max-width: 480px;
    background-color: var(--bg-page-h5, #ffffff);
    border-radius: 16px 16px 0 0;
    padding: 16px 20px 24px;
    box-sizing: border-box;
    max-height: 90vh;
    overflow-y: auto;
}

.card-handle {
    width: 40px;
    height: 4px;
    border-radius: 999px;
    background-color: var(--border-color, #E0E0E0);
    margin: 4px auto 16px;
}

.card-title {
    margin: 0 0 20px;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color, #000000);
}

.options-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.option-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 15px 22px;
    border-radius: 12px;
    border: 1px solid #F3F3F3;
    cursor: pointer;
    transition: all 0.3s ease;

    .option-header {
        display: flex;
        align-items: center;
        gap: 8px;

        .option-name {
            color: var(--text-color, #1a1a1a);
            transition: color 0.3s ease;
        }

        .option-tag {
            display: inline-block;
            padding: 2px 8px;
            background: rgba(234, 171, 74, 0.2);
            color: #EAAB4A;
            border-radius: 6px;
            font-family: PingFang SC, PingFang SC;
            font-weight: 500;
            font-size: 12px;
            line-height: 1.2;
        }
    }

    .option-amount {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #2FBC87;
    }

    &.option-selected {
        padding: 15px 22px;
        border: 2px solid #000000;
    }
}

.tip-text {
    margin: 0 0 20px;
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 12px;
    color: var(--text-dark-gray, #999999);
    line-height: 1.5;
}

.confirm-btn {
    width: 100%;
    height: 44px;
    border-radius: 999px;
    background-color: #2B6C18;
    color: #FFFFFF;
    font-family: PingFang SC, PingFang SC;
    font-weight: 600;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
        opacity: 0.8;
    }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

// 暗色主题
.theme-dark {
    .collect-earnings-card {
        background-color: #000000 !important;
    }

    .card-handle {
        background-color: #333333 !important;
    }

    .card-title {
        color: #FFFFFF !important;
    }

    .option-item {
        border: 1px solid #23262F;

        &.option-selected {
            border: 1px solid #F3F3F3 !important;
        }
    }

    .tip-text {
        color: #999999 !important;
    }

    .confirm-btn {
        background-color: #FFFFFF;
        color: #000000;
    }
}
</style>
