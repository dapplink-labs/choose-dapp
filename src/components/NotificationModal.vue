<template>
    <transition name="fade">
        <div v-if="visible" class="notification-overlay" @click.self="close">
            <div class="notification-modal">
                <!-- Decorative top element (handle) -->
                <div class="modal-handle"></div>

                <!-- Background decorative circle -->
                <div class="decorative-circle"></div>

                <div class="modal-content">
                    <h2 class="title">{{ title }}</h2>

                    <div class="message-body">
                        <div v-html="content"></div>
                    </div>

                    <button class="confirm-btn" @click="close">知道了</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { } from 'vue';

defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:visible', 'close']);

const close = () => {
    emit('update:visible', false);
    emit('close');
};
</script>

<style scoped lang="scss">
.notification-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(5px);
    padding: 0 10px;
    box-sizing: border-box;
}

.notification-modal {
    width: 90%;
    max-width: 360px;
    background-color: #0d0d0d;
    /* Very dark background */
    border-radius: 20px;
    padding: 30px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
    position: relative;
    overflow: hidden;
    border: 1px solid #222;
}

.modal-handle {
    width: 40px;
    height: 4px;
    background-color: #333;
    border-radius: 2px;
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
}

.decorative-circle {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
}

.modal-content {
    position: relative;
    width: 100%;
    z-index: 1;
    display: flex;
    flex-direction: column;
}

.title {
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 24px;
    line-height: 1.5;
    white-space: pre-wrap;
}

.message-body {
    color: #dddddd;
    font-size: 14px;
    line-height: 1.8;
    text-align: left;
    margin-bottom: 30px;
    //   white-space: pre-wrap;

    /* Deep selector for html content */
    :deep(.highlight) {
        color: #ccff00;
        /* Yellow/Green highlight */
        font-weight: bold;
    }

    :deep(p) {
        margin-bottom: 1em;
    }
}

.confirm-btn {
    width: 100%;
    height: 48px;
    background-color: #ffffff;
    color: #000000;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.2s;

    &:active {
        transform: scale(0.98);
    }

    &:hover {
        opacity: 0.9;
    }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
