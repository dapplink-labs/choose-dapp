<template>
    <div class="purchase-node-record">
        <BackHeaderNav :title="$t('purchaseNodeRecord.title')" />

        <div class="record-container">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-state">
                <div class="loading-text">{{ $t('common.loading') || '加载中...' }}</div>
            </div>
            <!-- 空状态 -->
            <div v-else-if="recordList.length === 0" class="empty-state">
                <div class="empty-text">{{ $t('purchaseNodeRecord.empty') || '暂无记录' }}</div>
            </div>
            <!-- 有数据时的表头 + 列表 -->
            <template v-else>
                <div class="record-header">
                    <span class="col col-type">{{ $t('purchaseNodeRecord.nodeType') }}</span>
                    <span class="col col-price">{{ $t('purchaseNodeRecord.nodePrice') }}</span>
                    <span class="col col-time">{{ $t('purchaseNodeRecord.purchaseTime') }}</span>
                </div>
                <div class="record-list">
                    <div v-for="(item, index) in recordList" :key="index" class="record-row">
                        <div class="col col-type">
                            <span class="node-name">{{ item.nodeName }}</span>
                            <span v-if="item.nodeTag" class="node-tag">{{ item.nodeTag }}</span>
                        </div>
                        <div class="col col-price">
                            <span class="node-price">{{ item.price }}</span>
                        </div>
                        <div class="col col-time">
                            <span class="record-time">{{ item.dateTime }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import { getNodeStakingRecords, getNodeServiceProviderRecords } from '@/api/API'
import { useAccount } from '@wagmi/vue'
import { formatDateTime } from '@/utils/format_date.js'
import { formatUnits } from 'viem'

const { t } = useI18n()
const { address } = useAccount()


const nodeTypeMap = {
    'T1': { nodeTag: 'T1', nodeNameKey: 'purchaseNodeRecord.informationNode' },
    'T2': { nodeTag: 'T2', nodeNameKey: 'myIncome.nodeNames.dataNode' },
    'T3': { nodeTag: 'T3', nodeNameKey: 'myIncome.nodeNames.validationNode' },
    'T4': { nodeTag: 'T4', nodeNameKey: 'myIncome.nodeNames.consensusNode' },
    'T5': { nodeTag: 'T5', nodeNameKey: 'myIncome.superNode' },
    'T6': { nodeTag: 'T6', nodeNameKey: 'myIncome.nodeNames.genesisNode' },
    '0': { nodeTag: '', nodeNameKey: 'myNode.nodeTypes.distributed' }, // 分布节点
    '1': { nodeTag: '', nodeNameKey: 'myNode.nodeTypes.cluster' },     // 集群节点
}


// 格式化数字（添加千分位）
const formatNumber = (num) => {
    if (!num && num !== 0) return '0'
    return Number(num).toLocaleString('en-US')
}

// 格式化金额（将18精度转换为正常金额）
const formatAmount = (value) => {
    if (!value || value === '0' || value === 0) return '0'
        // 将18精度的数值转换为正常数量
        let num = typeof value === 'bigint' || typeof value === 'string' 
            ? parseFloat(formatUnits(BigInt(value.toString()), 18))
            : Number(value) / 1e18
        return num.toFixed(2)
}

// 记录列表
const recordList = ref([])
const isLoading = ref(false)

// 获取节点购买记录数据
const getNodeStakingRecordsData = async () => {
    if (!address.value) {
        recordList.value = []
        return
    }

    isLoading.value = true
    // 获取质押节点记录数据
    const NodeStakingRecords = (await getNodeStakingRecords({ address: address.value }))?.data?.data?.list || []
    recordList.value = NodeStakingRecords.map(item => {
        return {
            nodeName: t(nodeTypeMap[item.type]?.nodeNameKey || ''),
            nodeTag: nodeTypeMap[item.type]?.nodeTag || '',
            price: formatAmount(item.amount),
            dateTime: formatDateTime(item.created),
        }
    })
    const nodeServiceProviderRecords = (await getNodeServiceProviderRecords({ address: address.value }))?.data?.data?.list || []
    nodeServiceProviderRecords.forEach(item => {
        recordList.value.push({
            nodeName: t(nodeTypeMap[item.type]?.nodeNameKey || ''),
            price: formatAmount(item.amount),
            dateTime: formatDateTime(item.created),
        })
    })
    isLoading.value = false
}

onMounted(() => {
    getNodeStakingRecordsData()
})
</script>

<style scoped lang="scss">
.purchase-node-record {
    padding: 50px 16px 0 16px;
    background-color: var(--bg-page-h5, #FFFFFF);
    color: var(--text-color, #1a1a1a);
    transition: background-color 0.3s ease, color 0.3s ease;
    position: relative;
    z-index: 999;
    min-height: 100vh;
    box-sizing: border-box;

    .record-container {
        margin-top: 12px;
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

        .record-header {
            display: flex;
            align-items: center;
            padding: 12px 0;
            font-family: PingFang SC, PingFang SC;
            font-weight: 400;
            font-size: 12px;
            color: var(--text-dark-gray, #999999);

            .col {
                &.col-type {
                    flex: 1.4;
                }

                &.col-price {
                    flex: 1;
                    text-align: center;
                }

                &.col-time {
                    flex: 1.4;
                    text-align: right;
                }
            }
        }

        .record-list {
            .record-row {
                display: flex;
                align-items: center;
                padding: 14px 0;
                font-family: PingFang SC, PingFang SC;
                font-size: 14px;

                .col-type {
                    flex: 1.4;
                    display: flex;
                    align-items: center;
                    gap: 6px;

                    .node-name {
                        color: var(--text-color, #1a1a1a);
                        transition: color 0.3s ease;
                        font-family: PingFang SC, PingFang SC;
                        font-weight: 500;
                        font-size: 14px;
                    }

                    .node-tag {
                        display: inline-block;
                        padding: 2px 8px;
                        background: rgba(234, 171, 74, 0.16);
                        color: #EAAB4A;
                        border-radius: 4px;
                        font-weight: 500;
                        font-size: 12px;
                        line-height: 1.2;
                    }
                }

                .col-price {
                    flex: 1;
                    text-align: center;

                    .node-price {
                        font-weight: 400;
                    }
                }

                .col-time {
                    flex: 1.4;
                    text-align: right;

                    .record-time {
                        font-family: PingFang SC, PingFang SC;
                        font-weight: 400;
                        font-size: 14px;
                        color: var(--text-color, #999999);
                        transition: color 0.3s ease;
                    }
                }
            }
        }
    }
}

.cps-card-header {
    border-bottom: 1px solid var(--border-color, #23262F);
}
</style>
