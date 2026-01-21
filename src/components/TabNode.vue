<template>
    <!-- 弹窗模式 -->
    <transition name="fade" v-if="nodes && nodes.length > 0">
        <div v-if="modelValue" class="tab-node-overlay" @click.self="handleClose" key="modal">
            <div class="tab-node-card">
                <!-- 顶部小横条 -->
                <div class="card-handle"></div>

                <!-- 标题 -->
                <h2 class="card-title">{{ $t('myNodes.title') }}</h2>

                <!-- 节点列表 -->
                <div class="nodes-list">
                    <div
                        v-for="(node, index) in nodes"
                        :key="node.id || index"
                        class="tab-node-item"
                        @click="handleSelect(node)"
                    >
                        <div class="node-name-row">
                            <span class="node-name">{{ node.nodeName }}</span>
                            <span v-if="node.nodeTag" class="node-tag">{{ node.nodeTag }}</span>
                        </div>
                        <div class="node-purchase-time">
                            {{ $t('tabNode.purchaseTime') }}: {{ node.status === 1 ? $t('computingPower.activating') : node.purchaseTime }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>

</template>

<script setup>
import { defineProps, defineEmits, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    // 弹窗模式属性
    modelValue: {
        type: Boolean,
        default: false
    },
    nodes: {
        // 期望结构：{ id, nodeName, nodeTag, purchaseTime, status }
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue', 'close', 'select'])

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
    const modalCard = document.querySelector('.tab-node-card')
    if (modalCard && modalCard.contains(target)) {
        return
    }
    // 否则阻止滚动
    e.preventDefault()
}

// 监听 modelValue 变化（仅弹窗模式）
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        lockBodyScroll()
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

const handleSelect = (node) => {
    if (!node) return
    // 先向父组件传递节点 id，再关闭弹窗
    emit('select', node.id)
    handleClose()
}
</script>

<style scoped lang="scss">
// 弹窗模式样式
.tab-node-overlay {
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

.tab-node-card {
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    background-color: var(--bg-page-h5, #ffffff);
    border-radius: 16px 16px 0 0;
    padding: 16px 20px 24px;
    box-sizing: border-box;
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

.nodes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.tab-node-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 15px 22px;
    width: 100%;
    box-sizing: border-box;
    border-radius: 12px;
    transition: background-color 0.3s ease;
    border: 1px solid #F3F3F3;
}


.node-name-row {
    display: flex;
    align-items: center;
    gap: 8px;

    .node-name {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        color: var(--text-color, #1a1a1a);
        transition: color 0.3s ease;
    }

    .node-tag {
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

.node-purchase-time {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-dark-gray, #999999);
    transition: color 0.3s ease;
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
    .tab-node-card {
        background-color: #000000 !important;
    }

    .card-handle {
        background-color: #333333 !important;
    }

    .card-title {
        color: #FFFFFF !important;
    }

    .tab-node,
    .tab-node-item {
        border: 1px solid #23262F !important;

        .node-name-row {
            .node-name {
                color: #FFFFFF !important;
            }
        }

        .node-purchase-time {
            color: #999999 !important;
        }
    }
}
</style>
