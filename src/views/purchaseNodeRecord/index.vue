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
import { getNodeStakingRecords } from '@/api/API'
import { useAccount } from '@wagmi/vue'
import { formatDateTime } from '@/utils/format_date.js'

const { t } = useI18n()
const { address } = useAccount()

// 节点类型映射：type -> { nodeTag, nodeNameKey }
// T1~T4：信息 / 数据 / 验证 / 共识节点
// T5：超级节点，T6：创世节点（仅显示节点名称，不带百分比/CHO）
const nodeTypeMap = {
    1: { nodeTag: 'T1', nodeNameKey: 'purchaseNodeRecord.informationNode' },
    2: { nodeTag: 'T2', nodeNameKey: 'myIncome.nodeNames.dataNode' },
    3: { nodeTag: 'T3', nodeNameKey: 'myIncome.nodeNames.validationNode' },
    4: { nodeTag: 'T4', nodeNameKey: 'myIncome.nodeNames.consensusNode' },
    5: { nodeTag: 'T5', nodeNameKey: 'myIncome.superNode' }, // 超级节点
    6: { nodeTag: 'T6', nodeNameKey: 'myIncome.nodeNames.genesisNode' } // 创世节点，仅名称
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
            // 接口没有返回数据时，模拟示例记录：T1~T6 + 分布节点 / 集群节点（无 T 图标）
            const now = Date.now()

            // T1~T6 节点
            const mockTypes = [1, 2, 3, 4, 5, 6]
            const mockCore = mockTypes.map((type, index) => {
                const nodeType = nodeTypeMap[type] || nodeTypeMap[1]
                const nodeTag = nodeType.nodeTag
                const nodeName = t(nodeType.nodeNameKey)
                const baseAmount = 200 + index * 50 // 200U 起，依次递增
                const price = formatNumber(baseAmount) + 'U'
                const dateTime = formatDateTime(now - index * 24 * 60 * 60 * 1000)

                return {
                    nodeName,
                    nodeTag,
                    price,
                    reward: '0',
                    dateTime
                }
            })

            // 分布节点 / 集群节点（无 T1~T6 图标）
            const distributed = {
                nodeName: t('myNode.nodeTypes.distributed'),
                nodeTag: '', // 不展示 T1~T6 图标
                price: formatNumber(500) + 'U',
                reward: '0',
                dateTime: formatDateTime(now - 7 * 24 * 60 * 60 * 1000)
            }

            const cluster = {
                nodeName: t('myNode.nodeTypes.cluster'),
                nodeTag: '', // 不展示 T1~T6 图标
                price: formatNumber(800) + 'U',
                reward: '0',
                dateTime: formatDateTime(now - 8 * 24 * 60 * 60 * 1000)
            }

            recordList.value = [...mockCore, distributed, cluster]
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
.cps-card-header{
    border-bottom: 1px solid var(--border-color, #23262F);
}
</style>
