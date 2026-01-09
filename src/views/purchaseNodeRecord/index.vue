<template>
    <div class="purchase-node-record">
        <BackHeaderNav :title="$t('purchaseNodeRecord.title')" />

        <div class="record-list">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-state">
                <div class="loading-text">{{ $t('common.loading') || '加载中...' }}</div>
            </div>
            <!-- 空状态 -->
            <div v-else-if="recordList.length === 0" class="empty-state">
                <div class="empty-text">暂无记录</div>
            </div>
            <!-- 记录列表 -->
            <div v-else v-for="(item, index) in recordList" :key="index" class="record-item">
                <div class="record-left">
                    <div class="node-name-row">
                        <span class="node-name">{{ item.nodeName }}</span>
                        <span v-if="item.nodeTag" class="node-tag">{{ item.nodeTag }}</span>
                    </div>
                    <div class="node-price">
                        {{ $t('common.price') }}: {{ item.price }}
                    </div>
                </div>
                <div class="record-right">
                    <div class="record-reward">
                        + {{ item.reward }} CHO
                    </div>
                    <div class="record-time">
                        {{ item.dateTime }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { getNodeStakingRecords } from '@/api/API'
import { useAccount } from '@wagmi/vue'
import { formatDateTime } from '@/utils/format_date.js'

const router = useRouter()
const { t } = useI18n()
const { address } = useAccount()

// 节点类型映射：type -> { nodeTag, nodeNameKey }
const nodeTypeMap = {
    1: { nodeTag: 'T1', nodeNameKey: 'purchaseNodeRecord.informationNode' },
    2: { nodeTag: 'T2', nodeNameKey: 'myIncome.nodeNames.dataNode' },
    3: { nodeTag: 'T3', nodeNameKey: 'myIncome.nodeNames.validationNode' },
    4: { nodeTag: 'T4', nodeNameKey: 'myIncome.nodeNames.consensusNode' },
    5: { nodeTag: 'T5', nodeNameKey: 'lpVault.nodeTypes.T5' },
    6: { nodeTag: 'T6', nodeNameKey: 'lpVault.nodeTypes.T6' }
}


// 格式化数字（添加千分位）
const formatNumber = (num) => {
    if (!num && num !== 0) return '0'
    return Number(num).toLocaleString('en-US')
}

// 记录列表
const recordList = ref([])
const isLoading = ref(false)

// 获取节点质押记录数据
const getNodeStakingRecordsData = async () => {
    if (!address.value) {
        recordList.value = []
        return
    }

    isLoading.value = true
    try {
        const res = await getNodeStakingRecords({ address: address.value })
        console.log('质押节点记录接口返回：', res)

        // 处理接口返回数据
        const responseData = res?.data || res
        const list = responseData?.data?.list || responseData?.list || []

        if (!Array.isArray(list) || list.length === 0) {
            recordList.value = []
            return
        }

        // 将接口数据映射到组件需要的格式
        recordList.value = list.map((item) => {
            const nodeType = nodeTypeMap[item.type] || nodeTypeMap[1] // 默认使用 T1
            const nodeTag = nodeType.nodeTag
            const nodeName = t(nodeType.nodeNameKey)

            // 格式化金额：amount 是质押金额，income 是收益
            const price = formatNumber(item.amount || 0) + 'U'
            const reward = formatNumber(item.income || 0)
            const dateTime = formatDateTime(item.created || 0)

            return {
                nodeName,
                nodeTag,
                price,
                reward,
                dateTime
            }
        })
    } catch (err) {
        console.error('获取节点质押记录失败:', err)
        recordList.value = []
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    getNodeStakingRecordsData()
})
</script>

<style scoped lang="scss">
.purchase-node-record {
    padding: 50px 10px 0 10px;
    background-color: var(--bg-page-h5, #FFFFFF);
    color: var(--text-color, #1a1a1a);
    transition: background-color 0.3s ease, color 0.3s ease;
    position: relative;
    z-index: 999;
    min-height: 100vh;
    box-sizing: border-box;

    .record-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 20px;

        .loading-state,
        .empty-state {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 60px 20px;
            min-height: 200px;

            .loading-text,
            .empty-text {
                font-family: PingFang SC, PingFang SC;
                font-weight: 400;
                font-size: 14px;
                color: var(--text-dark-gray, #999999);
                transition: color 0.3s ease;
            }
        }

        .record-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 16px 0;
            border-radius: 12px;
            transition: background-color 0.3s ease;

            .record-left {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex: 1;

                .node-name-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .node-name {
                        font-family: PingFang SC, PingFang SC;
                        font-weight: 400;
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

                .node-price {
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 400;
                    font-size: 12px;
                    color: var(--text-dark-gray, #999999);
                    transition: color 0.3s ease;
                }
            }

            .record-right {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;

                .record-reward {
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 500;
                    font-size: 14px;
                    color: var(--text-color-y, #2EBE69);
                }

                .record-time {
                    font-family: PingFang SC, PingFang SC;
                    font-weight: 400;
                    font-size: 12px;
                    color: var(--text-dark-gray, #999999);
                    transition: color 0.3s ease;
                }
            }
        }
    }
}

.theme-dark {
    .purchase-node-record {
        background-color: #000000;

        .record-list {
            .record-item {

                .record-left {
                    .node-name-row {
                        .node-name {
                            color: #FFFFFF !important;
                        }
                    }

                    .node-price {
                        color: #999999 !important;
                    }
                }

                .record-right {
                    .record-time {
                        color: #999999 !important;
                    }
                }
            }
        }
    }
}
</style>
