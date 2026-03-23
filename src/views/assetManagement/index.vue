<template>
    <div class="asset-management">
        <BackHeaderNav :title="$t('userInfo.fundManagement')" />

        <div class="main-content">
            <div class="tab-nav">
                <div :class="['tab-item', { active: activeTab === 0 }]" @click="handleTabClick(0)">
                    {{ $t('assetManagement.overview') || '资产总览' }}
                </div>
                <div :class="['tab-item', { active: activeTab === 1 }]" @click="handleTabClick(1)">
                    {{ $t('assetManagement.funds') || '资金' }}
                </div>
                <div :class="['tab-item', { active: activeTab === 2 }]" @click="handleTabClick(2)">
                    {{ $t('assetManagement.staking') || '质押' }}
                </div>
                <div :class="['tab-item', { active: activeTab === 3 }]" @click="handleTabClick(3)">
                    {{ $t('assetManagement.prediction') || '预测' }}
                </div>
            </div>

            <!-- 内容区域 -->
            <div class="tab-content">
                <Overview v-if="activeTab === 0" />
                <Funds v-else-if="activeTab === 1" />
                <Staking v-else-if="activeTab === 2" />
                <Prediction v-else-if="activeTab === 3" />
            </div>
        </div>
    </div>
</template>
<script setup>
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import Overview from './Overview.vue'
import Funds from './Funds.vue'
import Staking from './Staking.vue'
import Prediction from './Prediction.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const activeTab = ref(0)

const handleTabClick = (index) => {
    activeTab.value = index
}

</script>
<style scoped lang="scss">
.asset-management {
    width: 100%;
    min-height: 100vh;
    background-color: var(--bg-page-h5);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
    padding-top: 60px;
}

.tab-nav {
    display: flex;
    gap: 20px;
    border-bottom: 1px solid var(--border-color, #E0E0E0);
    padding: 0 16px 10px;

    .tab-item {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        color: #909090;
        cursor: pointer;
        padding-bottom: 8px;
        position: relative;

        &.active {
            color: var(--text-color, #000000);
            font-weight: 600;
        }
    }
}

.tab-content {
    flex: 1;
}

.prediction-placeholder {
    padding: 40px 16px;
    text-align: center;
    color: var(--text-gray, rgba(255, 255, 255, 0.5));
    font-size: 14px;
}
</style>