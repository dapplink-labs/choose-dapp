<template>
  <div class="asset-management">
    <BackHeaderNav class="asset-header" :title="$t('userInfo.fundManagement')" />

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
      </div>

      <div class="tab-content">
        <Overview v-if="activeTab === 0" />
        <Funds v-else-if="activeTab === 1" />
        <Staking v-else-if="activeTab === 2" />
      </div>
    </div>
  </div>
</template>
<script setup>
import BackHeaderNav from '@/components/BackHeaderNav.vue'
import Overview from './Overview.vue'
import Funds from './Funds.vue'
import Staking from './Staking.vue'
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
  background: #232932;
  color: #ffffff;
  padding-top: 60px;
}

.asset-header:deep(.cps-card-header) {
  padding: 14px 20px 10px;
  background: #232932 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.asset-header:deep(.back-btn) {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.asset-header:deep(.page-title) {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}

.main-content {
  min-height: calc(100vh - 60px);
}

.tab-nav {
  display: flex;
  gap: 22px;
  padding: 7px 20px 11px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    flex-shrink: 0;
    position: relative;
    padding-bottom: 2px;
    font-size: 15px;
    font-weight: 700;
    color: #8d94a1;
    line-height: 1.2;
    cursor: pointer;

    &.active {
      color: #ffffff;
    }
  }
}

.tab-content {
  flex: 1;
}
</style>
