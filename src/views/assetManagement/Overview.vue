<template>
  <div class="overview-container">
    <!-- 总资产估值 -->
    <div class="total-assets-section">
      <div class="assets-header">
        <div class="assets-title-wrapper">
          <h2 class="assets-title">{{ $t('assetManagement.totalAssets') }}</h2>
          <el-icon class="eye-icon" @click="toggleAssetsVisibility">
            <View v-if="showAssets" />
            <Hide v-else />
          </el-icon>
        </div>
        <el-icon class="bill-icon" @click="handleBill">
          <Document />
        </el-icon>
      </div>
      <div class="assets-value">
        <span v-if="showAssets" class="value-number">{{ formatNumber(totalAssets) }}</span>
        <span v-else class="value-number">****</span>
        <span class="value-unit">USDT</span>
        <!-- <el-icon class="dropdown-icon">
          <CaretBottom />
        </el-icon> -->
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="action-btn deposit-btn" @click="handleDeposit">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <path
            d="M839.8574 434.3808a41.216 41.216 0 0 0-10.9056-28.9792l-0.5632-0.5632a40.0896 40.0896 0 0 0-27.9552-11.1616 42.496 42.496 0 0 0-30.6176 13.1072l-216.1664 216.2176V41.6768a41.6768 41.6768 0 0 0-83.3024 0v581.12L254.3854 406.784a43.1104 43.1104 0 0 0-29.5424-12.9024h-1.024c-10.5984 0-20.48 3.9936-27.9552 10.9056l-0.6144 0.5632a41.472 41.472 0 0 0 1.9968 58.5728l282.0096 281.9584c3.7376 4.8128 8.448 8.704 13.824 11.4688l2.1504 1.024 0.768 0.3072c4.9152 2.0992 10.24 3.1744 15.5136 3.1744H512.6382a39.2704 39.2704 0 0 0 23.552-7.7312 42.0352 42.0352 0 0 0 7.8336-7.2704l282.9312-282.9312a43.0592 43.0592 0 0 0 12.9024-29.5936z"
            fill="currentColor"></path>
          <path
            d="M940.619 785.92v71.424c0 46.0288-37.376 83.3024-83.3536 83.3024H166.731a83.3536 83.3536 0 0 1-83.3024-83.3024v-71.4752a41.6768 41.6768 0 0 0-83.3536 0v71.4752A166.656 166.656 0 0 0 166.731 1024h690.5344a166.656 166.656 0 0 0 166.656-166.656v-71.4752a41.6768 41.6768 0 0 0-83.3536 0z"
            fill="currentColor"></path>
        </svg>
        <span>{{ $t('assetManagement.deposit') || '充币' }}</span>
      </button>
      <button class="action-btn withdraw-btn" @click="handleWithdraw">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <path
            d="M782.72512 327.9104l-242.54464-242.54464a35.84512 35.84512 0 0 0-13.76256-10.7008c-0.22016-0.09728-0.44032-0.2048-0.67072-0.30208a33.97632 33.97632 0 0 0-13.34272-2.73408l-0.08704 0.00512-0.32256-0.01536c-0.09216 0-0.1792 0.01536-0.27136 0.01536-0.09728 0-0.18944-0.01536-0.2816-0.01536a33.7664 33.7664 0 0 0-20.21376 6.66624 35.96288 35.96288 0 0 0-6.79936 6.27712l-243.3536 243.36384c-6.97856 6.97856-10.85952 15.97952-11.0848 25.4208a35.4304 35.4304 0 0 0 9.3696 24.9344l0.512 0.512a34.49344 34.49344 0 0 0 24.01792 9.57952 36.5568 36.5568 0 0 0 26.33728-11.29472L476.16 191.14496v499.99872a35.84 35.84 0 1 0 71.68 0v-499.8144l185.73312 185.73312c6.97856 6.97856 15.97952 10.85952 25.41568 11.0848l0.86016 0.01024c9.1136 0 17.60768-3.43552 24.07936-9.37984l0.512-0.512c13.30176-13.83424 12.76928-36.38272-1.7152-50.3552z"
            fill="currentColor"></path>
          <path
            d="M880.64 747.57632v61.44c0 39.58784-32.09216 71.68-71.68 71.68H215.04c-39.58784 0-71.68-32.09216-71.68-71.68v-61.44a35.84 35.84 0 1 0-71.68 0v61.44c0 79.17568 64.18432 143.36 143.36 143.36h593.92c79.17568 0 143.36-64.18432 143.36-143.36v-61.44a35.84 35.84 0 1 0-71.68 0z"
            fill="currentColor"></path>
        </svg>

        <span>{{ $t('assetManagement.withdraw') || '提币' }}</span>
      </button>
    </div>

    <!-- 最近记录 -->
    <div class="recent-records" v-if="recentRecords.length > 0">
      <div class="record-item" v-for="(record, index) in recentRecords" :key="index"
        @click="handleRecordDetail(record)">
        <div class="record-left">

          <img class="record-icon" v-if="record.type === 'deposit'" src="@/assets/icon/deposit.png" alt="">
          <img class="record-icon" v-else src="@/assets/icon/withdraw.png" alt="">

          <span class="record-title">{{ record.type === 'deposit' ? $t('assetManagement.deposit') :
            $t('assetManagement.withdraw') }}</span>
          <span class="record-amount">{{ formatNumber(record.amount) }}</span>
          <span class="record-unit">{{ record.unit }}</span>
        </div>
        <div class="record-right">
          <span class="record-status" :class="record.statusColor">{{ record.statusText }}</span>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 资产分布 Tab & List -->
    <div class="asset-distribution">
      <div class="distribution-tabs">
        <div :class="['tab-item', { active: distTab === 'coin' }]" @click="distTab = 'coin'">
          {{ $t('assetManagement.coin') || '币种' }}
        </div>
        <div :class="['tab-item', { active: distTab === 'account' }]" @click="distTab = 'account'">
          {{ $t('assetManagement.account') || '账户' }}
        </div>
      </div>

      <div class="distribution-list" v-if="distTab === 'coin'">
        <!-- 表头 -->
        <div class="distribution-header">
          <div class="header-name">{{ $t('assetManagement.name') || '名称' }}</div>
          <div class="header-quantity">{{ $t('assetManagement.quantity') || '数量' }}</div>
          <div class="header-value">{{ $t('assetManagement.value') || '价值' }}</div>
        </div>
        <!-- 数据行 -->
        <div v-if="!assetList.length" class="distribution-empty">
          {{ $t('common.noData') || '暂无数据' }}
        </div>
        <div v-for="asset in assetList" :key="asset.name" class="distribution-item">
          <div class="asset-info">
            <img :src="asset.icon" :alt="asset.name" class="asset-icon" />
            <span class="asset-name">{{ asset.name }}</span>
          </div>
          <div class="asset-quantity">{{ formatNumber(asset.quantity) }}</div>
          <div class="asset-value">{{ formatCurrency(asset.value) }}</div>
        </div>
      </div>

      <div class="account-list" v-else>
        <!-- 账户列表 -->
        <div v-for="acc in accountList" :key="acc.name" class="account-item">
          <div class="account-name">{{ acc.name }}</div>
          <div class="account-value">{{ formatCurrency(acc.value) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccount } from '@wagmi/vue'
import { useThemeStore } from '@/stores/theme'
import { View, Hide, ArrowRight, Document, CaretBottom } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getUserBalances, getFundsHistory, getUserAssets, getExchangeRateCho, getUserPositionsSummary } from '@/api/APIEvent'
import { getMyIncome } from "@/api/API"

const router = useRouter()
const { t } = useI18n()
const { address } = useAccount()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 显示/隐藏资产
const showAssets = ref(true)

// 资产数据
const loadingAssets = ref(false)
const totalAssets = ref(0)
const funds = ref(0)
const earnings = ref(0) // CHO数量（接口若不返回则为 0）
const earningsValue = ref(0) // CHO对应的USD价值（接口若不返回则为 0）
const fo = ref(0)

// 资产列表
const assetList = ref([])

// 切换资产显示/隐藏
const toggleAssetsVisibility = () => {
  showAssets.value = !showAssets.value
}

// Tabs
const distTab = ref('coin')

// 最近记录
const recentRecords = ref([])

// 获取最近充提记录
const fetchFundsHistory = async () => {
  if (!address.value) return

  try {
    const res = await getFundsHistory({ user_address: address.value, page: 1, page_size: 2, type: 'all' })
    const list = res?.data?.data?.transactions || []
    console.log(res)
    // 只取最新的两条记录
    const records = (Array.isArray(list) ? list : []).slice(0, 2)

    recentRecords.value = records.map(item => {
      const isDeposit = item.type === 'deposit' || String(item.type) === '1'
      const typeStr = isDeposit ? 'deposit' : 'withdraw'

      let statusText = '处理中'
      let statusColor = 'color-green'

      const statusStr = String(item.status).toLowerCase()
      console.log(statusStr)
      if (statusStr === 'confirmed') {
        statusText = '已完成'
        statusColor = 'color-green'
      } else if (statusStr === 'failed') {
        statusText = '已失败'
        statusColor = 'color-red'
      }

      return {
        type: typeStr,
        amount: Number(item.amount || item.value || 0),
        unit: item.unit || item.symbol || item.coin || 'USDT',
        statusText: statusText,
        statusColor: statusColor,
        raw: item
      }
    })
  } catch (error) {
    console.error('获取充提记录失败:', error)
    recentRecords.value = []
  }
}

const handleRecordDetail = (record) => {
   router.push('/bill')
}

// 账户列表
const accountList = ref([
  { name: '资金', value: 0 },
  { name: '质押', value: 0 },
  { name: '预测', value: 0 },
  // { name: '预测金额', value: 0 }
])

// 格式化数字（添加千分位）
const formatNumber = (num) => {
  if (typeof num !== 'number') return '0'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化货币
const formatCurrency = (num) => {
  if (typeof num !== 'number') return '$0.00'
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 格式化收益（CHO）
const formatEarnings = (num) => {
  if (typeof num !== 'number') return '0CHO'
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}CHO`
}

// 操作按钮处理
const handleDeposit = () => {
  router.push('/deposit')
}

const handleWithdraw = () => {
  router.push('/withdraw')
}

const handleBill = () => {
  router.push('/bill')
}

// 获取资产数据
const fetchAssets = async () => {
  if (!address.value) return

  try {
    loadingAssets.value = true
    const [res, assetsRes, incomeRes, priceRes, summaryRes] = await Promise.all([
      getUserBalances({ user_address: address.value }),
      getUserAssets({ user_address: address.value }),
      getMyIncome({ address: address.value }),
      getExchangeRateCho(),
      getUserPositionsSummary({ user_address: address.value })
    ])

    const data = res?.data?.data || {}
    const assetsData = assetsRes?.data?.data || {}
    const summaryData = summaryRes?.data?.data || {}

    const toNum = (v) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }

    // 预测账户值取total_position_value字段
    const portfolio = toNum(summaryData.total_position_value)
    // 资金为所有币种价值之和 (getUserAssets 接口的 total_value_usdt)
    const fundsValue = toNum(assetsData.total_value_usdt)

    // 计算质押总估值：质押收益 * CHO价格
    let choPrice = 0
    if (priceRes?.data?.code === 2000 || priceRes?.data?.data) {
      choPrice = Number(priceRes.data.data.price_usdt || 0)
    }

    let stakingIncomeNum = 0
    if (incomeRes?.data?.success) {
      const incomeData = incomeRes.data.data
      try {
        if (incomeData.staking_income) {
          if (typeof incomeData.staking_income === 'string' && incomeData.staking_income.includes('.')) {
            stakingIncomeNum = Number(incomeData.staking_income)
          } else {
            const { formatUnits } = await import('viem')
            stakingIncomeNum = Number(formatUnits(BigInt(incomeData.staking_income.toString()), 6))
          }
        }
      } catch (e) {
        console.error('Failed to parse staking income', e)
      }
    }
    const stakingValue = stakingIncomeNum * choPrice

    funds.value = toNum(0)

    // 更新账户列表
    accountList.value = [
      { name: t('assetManagement.funds') || '资金', value: fundsValue },
      { name: t('assetManagement.staking') || '质押', value: stakingValue },
      { name: t('assetManagement.prediction') || '预测', value: portfolio },
      // { name: t('assetManagement.predictionAmount') || '预测金额', value: funds.value }
    ]

    // 顶部总资产为资金、质押、预测之和
    totalAssets.value = fundsValue + stakingValue + portfolio + funds.value


    // 可选字段（后端不一定返回）
    earnings.value = toNum(data.earnings ?? data.cho)
    earningsValue.value = toNum(data.earnings_value ?? data.cho_value)
    fo.value = toNum(data.fo)

    // 资产列表
    const list = Array.isArray(assetsData.assets) ? assetsData.assets : []
    assetList.value = list.map((a) => {
      const symbol = a.asset_symbol || a.asset_name || ''
      return {
        name: symbol,
        icon: a.icon || (symbol ? `https://effigy.im/a/${symbol.toLowerCase()}.svg` : ''),
        quantity: toNum(a.balance),
        value: toNum(a.value_usdt),
      }
    }).filter(v => v.name)
  } catch (error) {
    console.error('获取资产数据失败:', error)
    totalAssets.value = 0
    funds.value = 0
    earnings.value = 0
    earningsValue.value = 0
    fo.value = 0
    assetList.value = []
    accountList.value = [
      { name: t('assetManagement.funds') || '资金', value: 0 },
      { name: t('assetManagement.staking') || '质押', value: 0 },
      { name: t('assetManagement.prediction') || '预测', value: 0 },
      // { name: t('assetManagement.predictionAmount') || '预测金额', value: 0 }
    ]
  } finally {
    loadingAssets.value = false
  }
}

onMounted(() => {
  fetchAssets()
  fetchFundsHistory()
})

watch(() => address.value, () => {
  fetchAssets()
  fetchFundsHistory()
})
</script>

<style scoped lang="scss">
.overview-container {
  padding: 16px;
  padding-bottom: 32px;
  background-color: var(--bg-page-h5);
  color: var(--text-color);
  min-height: calc(100vh - 60px);
}

// 总资产估值
.total-assets-section {
  margin-bottom: 24px;

  .assets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .assets-title-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .assets-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
      margin: 0;
    }

    .eye-icon {
      cursor: pointer;
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
      font-size: 20px;
      transition: color 0.2s;

      &:hover {
        color: var(--text-color);
      }
    }

    .bill-icon {
      cursor: pointer;
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
      font-size: 20px;
    }
  }

  .assets-value {
    display: flex;
    align-items: baseline;
    gap: 8px;

    .value-number {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-color);
      line-height: 1.2;
    }

    .value-unit {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
    }

    .dropdown-icon {
      font-size: 12px;
      color: var(--text-gray, rgba(255, 255, 255, 0.7));
      margin-left: 4px;
    }
  }
}

// 操作按钮
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;

  .action-btn {
    flex: 1;
    height: 48px;
    border-radius: 999px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;

    .icon {
      width: 20px;
      height: 20px;
    }

    &.deposit-btn {
      background: var(--text-color-y, #BBFF2E);
      color: var(--bg-color-010101, #010101);
      box-shadow: 0 4px 12px var(--button-bg-y, rgba(47, 188, 135, 0.2));

      &:active {
        transform: scale(0.98);
      }
    }

    &.withdraw-btn {
      background: var(--bg-opposite, #FFFFFF);
      color: var(--bg-color-010101, #444444);

      &:active {
        transform: scale(0.98);
      }
    }

    &.bill-btn {
      background: var(--text-color-y, #BBFF2E);
      color: #0a0a0a;
      box-shadow: 0 4px 12px var(--button-bg-y, rgba(47, 188, 135, 0.2));

      &:active {
        transform: scale(0.98);
      }
    }
  }
}

// 最近记录
.recent-records {
  background: var(--bg-card, #1E1E1E);
  border-radius: 12px;
  padding: 8px 16px;
  margin-bottom: 24px;

  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    .record-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .record-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-color);


      }

      .record-title {
        font-size: 14px;
        color: var(--text-color);
      }

      .record-amount {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-color);
      }

      .record-unit {
        font-size: 12px;
        color: var(--text-gray, rgba(255, 255, 255, 0.5));
      }
    }

    .record-right {
      display: flex;
      align-items: center;
      gap: 4px;

      .record-status {
        font-size: 14px;

        &.color-green {
          color: var(--text-color-y, #BBFF2E);
        }

        &.color-yellow {
          color: #FFB020;
          /* 待处理颜色 */
        }

        &.color-red {
          color: #FF3B30;
          /* 失败颜色 */
        }
      }

      .arrow-icon {
        font-size: 14px;
        color: var(--text-gray, rgba(255, 255, 255, 0.5));
      }
    }
  }
}

// 资产分布
.asset-distribution {
  .distribution-tabs {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;

    .tab-item {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-gray, rgba(255, 255, 255, 0.5));
      cursor: pointer;
      position: relative;
      padding-bottom: 4px;

      &.active {
        color: var(--text-color);
        font-weight: 600;
      }
    }
  }

  .distribution-list {
    overflow: hidden;

    .distribution-empty {
      padding: 18px 0;
      text-align: center;
      color: var(--text-gray, rgba(255, 255, 255, 0.5));
      font-size: 14px;
    }

    .distribution-header {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color, #23262F);
      background-color: transparent;

      .header-name,
      .header-quantity,
      .header-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-gray);
      }

      .header-name {
        flex: 1;
      }

      .header-quantity {
        flex: 1;
        text-align: center;
      }

      .header-value {
        flex: 1;
        text-align: right;
      }
    }

    .distribution-item {
      display: flex;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color, #23262F);

      &:last-child {
        border-bottom: none;
      }

      .asset-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;

        .asset-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .asset-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-color);
        }
      }

      .asset-quantity {
        flex: 1;
        text-align: center;
        font-size: 15px;
        color: var(--text-color);
      }

      .asset-value {
        flex: 1;
        text-align: right;
        font-size: 15px;
        font-weight: 500;
        color: var(--text-color);
      }
    }
  }

  .account-list {
    .account-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));

      &:last-child {
        border-bottom: none;
      }

      .account-name {
        font-size: 15px;
        font-weight: 500;
        color: var(--text-color);
      }

      .account-value {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-color);
      }
    }
  }
}

// 浅色主题适配
:deep(.theme-light) {
  .overview-container {
    background-color: var(--bg-page-h5, #FCFCFC);
  }

  .asset-card {
    background-color: var(--bg-card, #ffffff);
    border-color: var(--border-color, #E0E0E0);
  }

  .distribution-item {
    border-bottom-color: var(--border-color, #E0E0E0);
  }
}
</style>
