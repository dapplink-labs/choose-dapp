<template>
    <transition name="fade">
        <div v-if="modelValue" class="trade-overlay" @click.self="handleClose">
            <transition name="slide-up" appear>
                <div class="trade-modal cashout-modal">
                    <!-- 顶部拉条 -->
                    <div class="grabber" />

                    <div class="trade-body">
                        <div class="target-info">
                            <h3 class="target-title">{{ t('payment.sell') }} {{ outcomeLabel }}</h3>
                            <div class="target-row">
                                <span class="date-text">{{ dateText }}</span>
                            </div>
                        </div>

                        <div class="cashout-summary">
                            <div class="receive-row">
                                <span class="label">{{ t('payment.receive') }}</span>
                                <span class="value receive-value">{{ positionValue }}</span>
                            </div>
                            <div class="shares-row">
                                <span class="label">{{ t('payment.sellingShares', { shares, avgPrice }) }}</span>
                            </div>
                        </div>

                        <div class="action-buttons">
                            <button class="edit-btn" @click="handleClose">{{ t('payment.cancel') }}</button>
                            <button class="cashing-btn" :disabled="submitting" @click="handleConfirm">
                                <span v-if="submitting" class="loading-icon"></span>
                                {{ submitting ? t('payment.cashing') : t('payment.cashout') }}
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccount } from '@wagmi/vue'
import { makeOrder } from '@/api/APIEvent'
import { ElMessage } from 'element-plus'

const props = defineProps({
    modelValue: Boolean,
    position: {
        type: Object,
        default: () => ({})
    },
    eventGuid: { type: String, default: '' },
    subEventGuid: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'order-success'])

const { t } = useI18n()
const { address } = useAccount()

const submitting = ref(false)

const outcomeLabel = computed(() => {
    const outcome = props.position?.outcome
    return outcome || ''
})

const dateText = computed(() => {
    const d = new Date()
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    return `${t('detail.months.' + monthKeys[d.getMonth()])} ${d.getDate()}`
})

const positionValue = computed(() => {
    return props.position?.positionValue || '$0.00'
})

const shares = computed(() => {
    const item = props.position?.raw || {}
    return Number(item?.shares ?? 0)
})

const avgPrice = computed(() => {
    return props.position?.avgPrice || '0¢'
})

const handleClose = () => {
    if (submitting.value) return
    emit('update:modelValue', false)
}

const handleConfirm = async () => {
    if (submitting.value) return

    if (!props.eventGuid) {
        ElMessage.error(t('payment.missingIds') || 'Missing event id')
        return
    }
    const item = props.position?.raw || {}
    submitting.value = true
    try {
        const orderParams = {
            event_guid: props.eventGuid,
            sub_event_guid: props.subEventGuid || props.position?.raw?.sub_event_guid,
            outcome: item?.outcome || '',
            side: 'sell',
            order_type: 'market',
            user_address: address.value,
            shares: String(shares.value)
        }

        const res = await makeOrder(orderParams)
        if (!res || !res.data) {
            ElMessage.error(t('payment.tradeFailed') || 'Trade failed')
            return
        }

        const code = res.data.code
        const msg = String(res.data.message || '').toLowerCase()
        const isSuccess = code === 2000 || msg.includes('order created successfully') || msg === 'success'

        if (isSuccess) {
            emit('order-success', res.data.data)
            ElMessage.success(t('payment.tradeSuccess') || 'Trade successful')
            handleClose()
        } else {
            ElMessage.error(res.data.message || t('payment.tradeFailed') || 'Trade failed')
        }
    } catch (err) {
        console.error('Cashout failed', err)
        ElMessage.error(t('payment.tradeFailed') || 'Trade failed')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.trade-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.trade-modal.cashout-modal {
    background: var(--card-bg, #1a1b1e);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 16px 24px 32px;
    color: #fff;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
}

.grabber {
    width: 40px;
    height: 4px;
    background: #333;
    border-radius: 2px;
    margin: 0 auto 24px;
}

.target-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
}

.date-text {
    font-size: 14px;
    color: #888;
}

.cashout-summary {
    margin: 24px 0;
}

.receive-row {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
}

.receive-row .label {
    margin-right: 8px;
}

.receive-value {
    color: #2e8b57;
    /* or match the image green */
}

.shares-row {
    font-size: 14px;
    color: #888;
}

.action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 32px;
}

.edit-btn {
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    background: #2a2f34;
    border: none;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
}

.cashing-btn {
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    background: #1a73e8;
    /* matches button blue */
    border: none;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.cashing-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loading-icon {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Slide Up Transition */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
