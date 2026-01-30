<template>
    <transition name="fade">
        <div v-if="showModal" class="collect-earnings-overlay" @click.self="handleClose">
            <div class="collect-earnings-card">
                <!-- 顶部固定区域 -->
                <div class="card-header">
                    <!-- 顶部小横条 -->
                    <div class="card-handle"></div>
                    <!-- 标题 -->
                    <h2 class="card-title">{{ $t('collectEarnings.title') }}</h2>
                </div>

                <!-- 可滚动内容区域 -->
                <div class="card-content">
                    <!-- 选项列表 -->
                    <div class="options-list">
                        <div v-if="isLoading" class="loading-text">{{ $t('common.loading') || '加载中...' }}</div>
                        <div v-else-if="options.length === 0" class="empty-text">{{ $t('common.noData') || '暂无数据' }}
                        </div>
                        <div v-else v-for="(option, index) in options" :key="index" class="option-item"
                            :class="{ 'option-selected': selectedIndex === index }" @click="selectOption(index)">
                            <div class="option-header">
                                <span class="option-name">{{ option.name }}</span>
                                <span v-if="option.tag" class="option-tag">{{ option.tag }}</span>
                            </div>
                            <div class="option-amount-row">
                                <span class="option-amount">{{ formatAmount(option.node_reward) }} CHO</span>
                                <span v-if="option.time" class="option-time">{{ option.status === 1 ?
                                    $t('computingPower.activating') : option.time
                                }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 说明文字 -->
                    <!-- <p class="tip-text">{{ $t('collectEarnings.tip') }}</p> -->

                    <!-- 确认按钮 -->
                    <button class="confirm-btn" @click="handleConfirm">
                        {{ $t('common.confirm') }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { watch, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccount, useChainId } from '@wagmi/vue'
import { switchChain } from '@wagmi/core'
import { config } from '@/wagmi'
import { ElLoading } from 'element-plus'
import Message from '@/utils/message'
import { getNodeStakingRecords, stakingclaimReward } from '@/api/API'
import { formatDateTime } from '@/utils/format_date.js'
import { writeContractOptimized } from '@/utils/requestWEB3.js'
import { formatChoAmount } from '@/utils/format_amount.js'
import stakingManagerABI from '@/assets/abi/stakingManagerABI.json'
import networks from '@/assets/json/networks.json'

const { t } = useI18n()
const { address } = useAccount()
const chainId = useChainId()

// 常量定义
const BSC_CHAIN_ID = 56
const CONTRACT_MESSAGES = {
    success: () => t('myNode.claimSuccess') || '领取成功',
    failed: () => t('myNode.claimFailed') || '领取失败',
    rejected: () => t('myNode.claimCancelled') || '用户取消'
}

// 节点类型映射
const nodeTypeMap = {
    'T1': { nodeTag: 'T1', nodeNameKey: 'purchaseNodeRecord.informationNode' },
    'T2': { nodeTag: 'T2', nodeNameKey: 'myIncome.nodeNames.dataNode' },
    'T3': { nodeTag: 'T3', nodeNameKey: 'myIncome.nodeNames.validationNode' },
    'T4': { nodeTag: 'T4', nodeNameKey: 'myIncome.nodeNames.consensusNode' },
    'T5': { nodeTag: 'T5', nodeNameKey: 'myIncome.superNode' },
    'T6': { nodeTag: 'T6', nodeNameKey: 'myIncome.nodeNames.genesisNode' },
}

// 事件定义
const emit = defineEmits(['ReceiveSuccess'])

// 响应式数据
const options = ref([])
const isLoading = ref(false)
const showModal = ref(false)
const selectedIndex = ref(0)

// CHO 金额（默认 6 精度）
const formatAmount = (value) => {
    return formatChoAmount(value, { maxFractionDigits: 4, useGrouping: true })
}

// 获取节点质押记录并构建选项列表
const fetchNodeStakingRecords = async () => {
    if (!address.value) {
        options.value = []
        return
    }

    isLoading.value = true
    try {
        const res = await getNodeStakingRecords({ address: address.value })
        const list = res?.data?.data?.list || []

        if (list.length === 0) {
            options.value = []
            return
        }
        let totalAmount = 0
        let allOrderIds = []
        list.forEach(item => {
            item.name = t(nodeTypeMap[item.type]?.nodeNameKey || '')
            item.tag = nodeTypeMap[item.type]?.nodeTag || ''
            item.time = item.created ? formatDateTime(item.created) : ''
            item.orderIds = item.id
            item.amount = item.amount
            item.node_reward = item.node_reward
            totalAmount += item.node_reward
            allOrderIds.push(item.id)
        })

        const optionList = [
            //     {
            //     name: t('myIncome.earningsOptions.allNodeRewards'),
            //     tag: '',
            //     amount: totalAmount,
            //     time: '',
            //     orderIds: allOrderIds.join(','),
            //     type: 'all'
            // }
        ]
        optionList.push(...list)
        options.value = optionList

    } catch (error) {
        console.error('获取节点质押记录失败：', error)
        options.value = []
    } finally {
        isLoading.value = false
    }
}

// 选择选项
const selectOption = (index) => {
    selectedIndex.value = index
}

// 打开弹窗
const open = async () => {
    showModal.value = true
    selectedIndex.value = 0
    await fetchNodeStakingRecords()
}

// 关闭弹窗
const handleClose = () => {
    showModal.value = false
}

// 暴露方法
defineExpose({ open })

// Body 滚动控制
let originalBodyOverflow = ''
let originalBodyPaddingRight = ''


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

const preventScroll = (e) => {
    const modalCard = document.querySelector('.collect-earnings-card')
    if (modalCard?.contains(e.target)) return
    e.preventDefault()
}

// 监听弹窗状态，控制 body 滚动
watch(showModal, (isOpen) => {
    if (isOpen) {
        lockBodyScroll()
        selectedIndex.value = 0
    } else {
        unlockBodyScroll()
    }
}, { immediate: true })

onUnmounted(() => {
    unlockBodyScroll()
})

// 验证选择的有效性
const validateSelection = (selectedOption) => {
    if (!address.value) {
        Message.error(t('myNode.connectWalletFirst') || '请先连接钱包')
        return false
    }
    if (!selectedOption || !selectedOption.orderIds || (selectedOption.type !== 'all' && !selectedOption.orderIds.trim())) {
        Message.error('没有可领取的收益')
        return false
    }
    return true
}

// 切换到 BSC 主网
const switchToBSC = async (loading) => {
    if (Number(chainId.value) !== BSC_CHAIN_ID) {
        loading.text = '切换网络中...'
        await switchChain(config, { chainId: BSC_CHAIN_ID })
        await new Promise(r => setTimeout(r, 1000))
    }
}

// 调用合约领取质押节点收益
const callClaimRewardContract = async (amount, loading) => {

    const bscNet = networks.find(n => Number(n.chainId) === BSC_CHAIN_ID)
    if (!bscNet?.proxyStakingManager) {
        throw new Error('未找到 StakingManager 合约地址')
    }

    loading.text = '调用合约中...'
    console.log(amount)
    const result = await writeContractOptimized({
        abi: stakingManagerABI,
        address: bscNet.proxyStakingManager,
        functionName: 'liquidityProviderClaimReward',
        args: [BigInt(amount)],
        userAddress: address.value,
        messages: CONTRACT_MESSAGES,
        showErrorToast: false
    })

    if (!result.success || !result.hash) {
        throw new Error('合约调用失败')
    }
    return result.hash
}

// 提交后端数据
const submitRewardData = async (txHash, selectedOption, loading) => {
    loading.text = '提交数据中...'
    const requestData = {
        user_address: address.value,
        request_tx_hash: txHash,
        round: String(selectedOption.round),
        raw_amount_token: String(selectedOption.node_reward)
    }
    const res = await stakingclaimReward(requestData)
    console.log(res)
}

// 处理错误
const handleError = (error) => {
    console.error('领取收益失败:', error)
    const isUserCancelled = error.message?.includes('用户取消') || error.message?.includes('User rejected')
    if (!isUserCancelled) {
        Message.error(error.message || CONTRACT_MESSAGES.failed())
    }
}

// 领取收益
const handleConfirm = async () => {

    const selectedOption = options.value[selectedIndex.value]

    if (selectedOption.round === -1) {
        Message.warning(t('myNode.nodeActivatingTryLater'))
        return
    }
    selectedOption.node_reward = Number(selectedOption.node_reward)
    if (selectedOption.node_reward && selectedOption.node_reward <= 0) {
        Message.warning(t('myNode.noIncome'))
        return
    }
    // 验证选择的有效性
    if (!validateSelection(selectedOption)) return

    const loading = ElLoading.service({
        lock: true,
        text: t('common.loading') || '处理中...',
        background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
        await switchToBSC(loading)
        const txHash = await callClaimRewardContract(selectedOption.node_reward || 0, loading)
        // const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        await submitRewardData(txHash, selectedOption, loading)

        Message.success(CONTRACT_MESSAGES.success())
        handleClose()
        emit('ReceiveSuccess')
    } catch (error) {
        handleError(error)
    } finally {
        loading.close()
    }
}
</script>

<style scoped lang="scss">
.collect-earnings-overlay {
    position: fixed;
    inset: 0;
    z-index: 2002;
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
    box-sizing: border-box;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.card-header {
    flex-shrink: 0;
    padding: 16px 20px 0;
    background-color: var(--bg-page-h5, #ffffff);
    border-radius: 16px 16px 0 0;
    z-index: 10;
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
    padding: 0 0 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color, #000000);
}

.card-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px 24px;
    box-sizing: border-box;
}

.options-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
    min-height: 100px;
}

.loading-text,
.empty-text {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-dark-gray, #999999);
    font-size: 14px;
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

    .option-amount-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .option-amount {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #2FBC87;
    }

    .option-time {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: var(--text-dark-gray, #999999);
        flex-shrink: 0;
    }

    &.option-selected {
        border: 1px solid #000000;
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

    .card-header {
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
