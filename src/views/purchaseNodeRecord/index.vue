<template>
    <div class="purchase-node-record">
        <BackHeaderNav :title="$t('purchaseNodeRecord.title')" />

        <div class="record-list">
            <div v-for="(item, index) in recordList" :key="index" class="record-item">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BackHeaderNav from '@/components/BackHeaderNav.vue'

const router = useRouter()
const { t } = useI18n()

// 示例数据
const recordList = ref([
    {
        nodeName: t('purchaseNodeRecord.informationNode'),
        nodeTag: 'T1',
        price: '200U',
        reward: '32,567',
        dateTime: '2025-09-01 10:23'
    },
    {
        nodeName: t('purchaseNodeRecord.informationNode'),
        nodeTag: 'T1',
        price: '200U',
        reward: '32,567',
        dateTime: '2025-09-01 10:23'
    },
    {
        nodeName: t('purchaseNodeRecord.informationNode'),
        nodeTag: 'T1',
        price: '200U',
        reward: '32,567',
        dateTime: '2025-09-01 10:23'
    },
    {
        nodeName: t('purchaseNodeRecord.informationNode'),
        nodeTag: 'T1',
        price: '200U',
        reward: '32,567',
        dateTime: '2025-09-01 10:23'
    },
    {
        nodeName: t('purchaseNodeRecord.informationNode'),
        nodeTag: 'T1',
        price: '200U',
        reward: '32,567',
        dateTime: '2025-09-01 10:23'
    }
])
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
