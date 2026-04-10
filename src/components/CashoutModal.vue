<template>
    <Teleport to="body">
        <transition name="fade">
            <div v-if="modelValue" class="cashout-overlay" @click.self="handleClose">
                <transition name="modal-scale" appear>
                    <div class="trade-modal cashout-modal" @click.stop>
                        <div class="modal-header">
                            <h3 class="target-title">{{ t('payment.redeem') }} {{ shortOutcomeLabel }}</h3>
                            <button
                                type="button"
                                class="close-btn"
                                :disabled="submitting"
                                :aria-label="t('payment.cancel')"
                                @click="handleClose"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p v-if="eventSubtitle" class="event-subtitle">{{ eventSubtitle }}</p>

                        <div class="cashout-summary" :class="{ 'cashout-summary--no-sub': !eventSubtitle }">
                            <div class="receive-row">
                                <span class="label">{{ t('payment.receive') }}</span>
                                <span class="value receive-value">{{ positionValue }}</span>
                            </div>
                            <div class="shares-row">
                                {{ t('payment.sellingShares', { shares, avgPrice }) }}
                            </div>
                        </div>

                        <button class="cashing-btn cashing-btn--full" type="button" :disabled="submitting" @click="handleConfirm">
                            <span v-if="submitting" class="loading-icon"></span>
                            <template v-if="submitting">{{ t('payment.cashing') }}</template>
                            <template v-else>{{ t('payment.cashout') }} {{ positionValue }}</template>
                        </button>
                    </div>
                </transition>
            </div>
        </transition>
    </Teleport>
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
    subEventGuid: { type: String, default: '' },
    /** 主事件标题，与子事件名组合为图二风格的灰色副标题 */
    eventTitle: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'order-success'])

const { t } = useI18n()
const { address } = useAccount()

const submitting = ref(false)

/** 标题仅展示方向/结果（与 tagLabel 中「|」前一致），份额放在下方说明行 */
const shortOutcomeLabel = computed(() => {
    const tag = props.position?.tagLabel || ''
    if (!tag) return ''
    const head = tag.split('|')[0]?.trim()
    return head || tag
})

const eventSubtitle = computed(() => {
    const main = (props.eventTitle || '').trim()
    const sub = (props.position?.title || '').trim()
    if (main && sub) return `${main} - ${sub}`
    return sub || main || ''
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

const closeModal = () => {
    emit('update:modelValue', false)
}

const handleClose = () => {
    if (submitting.value) return
    closeModal()
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
        const rawOutcome = item?.outcome || '';
        // const mappedOutcome = ['up', 'yes'].includes(String(rawOutcome).toLowerCase()) 
        //     ? 'YES' 
        //     : ['down', 'no'].includes(String(rawOutcome).toLowerCase()) 
        //         ? 'NO' 
        //         : rawOutcome;

        const orderParams = {
            event_guid: props.eventGuid,
            sub_event_guid: props.subEventGuid || props.position?.raw?.sub_event_guid,
            outcome: rawOutcome,
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
            closeModal()
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
/* 挂到 body，避免页面内 transform/滚动层导致 fixed 贴在容器底部 */
.cashout-overlay {
    position: fixed;
    inset: 0;
    z-index: 2100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 20px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.55);
}

.trade-modal.cashout-modal {
    width: 100%;
    max-width: 400px;
    background: var(--bg-page);
    border-radius: 16px;
    padding: 20px 20px 24px;
    color: #fff;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
}

.modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
}

.target-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
    flex: 1;
    min-width: 0;
}

.close-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin: -6px -6px 0 0;
    padding: 0;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: #9ca3af;
    cursor: pointer;
}

.close-btn:hover:not(:disabled) {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.06);
}

.close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.event-subtitle {
    margin: 0 0 20px 0;
    font-size: 14px;
    line-height: 1.45;
    color: #9ca3af;
    font-weight: 400;
}

.cashout-summary {
    margin-bottom: 24px;
}

.cashout-summary--no-sub {
    margin-top: 8px;
}

.receive-row {
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 8px 10px;
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 10px;
}

.receive-row .label {
    color: #fff;
}

.receive-value {
    color: #34d399;
    font-size: 20px;
    font-weight: 700;
}

.shares-row {
    font-size: 14px;
    line-height: 1.4;
    color: #9ca3af;
}

.cashing-btn {
    width: 100%;
    padding: 15px 16px;
    border-radius: 12px;
    background: var(--text-color-y);
    border: none;
    color: #000;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.cashing-btn--full {
    margin-top: 0;
}

.cashing-btn:disabled {
    opacity: 0.75;
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

.modal-scale-enter-active,
.modal-scale-leave-active {
    transition: opacity 0.22s ease, transform 0.22s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
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
