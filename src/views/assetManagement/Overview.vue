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
      </div>
      <div class="assets-value">
        <span v-if="showAssets" class="value-number">{{ formatNumber(totalAssets) }}</span>
        <span v-else class="value-number">****</span>
        <span class="value-unit">USDT</span>
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
        <span>{{ $t('assetManagement.deposit') }}</span>
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
        <span>{{ $t('assetManagement.withdraw') }}</span>
      </button>
      <button class="action-btn bill-btn" @click="handleBill">
        <svg t="1766051544470" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          width="20" height="20">
          <path
            d="M823.765 200.765l-79.529-79.529A192 192 0 0 0 608.471 65H304c-106.039 0-192 85.961-192 192v512c0 106.038 85.961 192 192 192h384c106.039 0 192-85.962 192-192V336.528a192 192 0 0 0-56.235-135.763z m-56.569 56.568c9.261 9.262 16.611 20.033 22.071 31.667H720c-35.347 0-64-28.654-64-64v-69.268c11.634 5.46 22.405 12.811 31.666 22.071l79.53 79.53zM688 881H304c-61.855 0-112-50.145-112-112V257c0-61.856 50.145-112 112-112h272v96c0 70.692 57.308 128 128 128h96v400c0 61.855-50.145 112-112 112z"
            fill="currentColor" p-id="6256"></path>
          <path
            d="M616 465H376c-22.092 0-40 17.908-40 40s17.908 40 40 40h240c22.092 0 40-17.908 40-40s-17.908-40-40-40zM536 641H376c-22.092 0-40 17.908-40 40s17.908 40 40 40h160c22.092 0 40-17.908 40-40s-17.908-40-40-40z"
            fill="currentColor" p-id="6257"></path>
        </svg>
        <span>{{ $t('assetManagement.bill') }}</span>
      </button>
    </div>

    <!-- 资产卡片 -->
    <div class="asset-cards">
      <div class="asset-card">
        <div class="card-content">
          <div class="card-title-row">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                <g transform="translate(-42.5 -39.3)">
                  <path fill="#2f2f2f" d="M52.5,49.3m-10,0a10,10,0,1,0,10-10A10,10,0,0,0,42.5,49.3Z" />
                  <path fill="#fff"
                    d="M3.738-10.178a3.587,3.587,0,0,0-2,.644,2.409,2.409,0,0,0-1.05,2.1A2.487,2.487,0,0,0,2.156-5.11l1.582.588v3.416a1.789,1.789,0,0,1-1.092-.462,2.454,2.454,0,0,1-.574-1.624H.56A3.744,3.744,0,0,0,1.554-.644,3.3,3.3,0,0,0,3.738.182V1.414h.868V.182a4.341,4.341,0,0,0,2.128-.63A2.552,2.552,0,0,0,7.84-2.688,2.554,2.554,0,0,0,6.384-5.012c-.14-.056-.742-.294-1.778-.686V-8.9a1.823,1.823,0,0,1,.924.336A1.819,1.819,0,0,1,6.188-7.28H7.672a3.224,3.224,0,0,0-1.064-2.2,3.464,3.464,0,0,0-2-.7v-1.148H3.738Zm.868,5.964c.084.028.168.07.252.1.98.336,1.47.84,1.47,1.484a1.343,1.343,0,0,1-.6,1.148,2.651,2.651,0,0,1-1.12.378ZM3.738-6.02c-.028,0-.042-.014-.056-.014-.98-.364-1.47-.826-1.47-1.4A1.288,1.288,0,0,1,2.786-8.61a1.871,1.871,0,0,1,.952-.308Z"
                    transform="translate(47.94 54.626)" />
                </g>
              </svg>
            </div>
            <div class="card-title">{{ $t('assetManagement.funds') }}</div>
          </div>
          <div v-if="showAssets" class="card-value primary">{{ formatCurrency(funds) }}</div>
          <div v-else class="card-value primary">****</div>
          <div class="card-approx">≈{{ formatCurrency(funds) }}</div>
        </div>
      </div>

      <div class="asset-card">
        <div class="card-content">
          <div class="card-title-row">
            <div class="card-icon earnings">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                <g transform="translate(-42.5 -39.3)">
                  <path fill="#2f2f2f" d="M52.5,49.3m-10,0a10,10,0,1,0,10-10A10,10,0,0,0,42.5,49.3Z" />
                  <path fill="#fff"
                    d="M273.031,343.233l1.417,1.139-3.51,4.323-2.572-2.152-2.5,3.076-1.417-1.14,3.67-4.515,2.577,2.153,2.336-2.885Z"
                    transform="translate(-217.309 -297.126)" />
                </g>
              </svg>
            </div>
            <div class="card-title">{{ $t('assetManagement.earnings') }}</div>
          </div>
          <div v-if="showAssets" class="card-value primary">{{ formatEarnings(earnings) }}</div>
          <div v-else class="card-value primary">****</div>
          <div class="card-approx">≈{{ formatCurrency(earningsValue) }}</div>
        </div>
      </div>

      <div class="asset-card">
        <div class="card-content">
          <div class="card-title-row">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                <g transform="translate(-42.5 -39.3)">
                  <path fill="#2f2f2f" d="M52.5,49.3m-10,0a10,10,0,1,0,10-10A10,10,0,0,0,42.5,49.3Z" />
                  <path fill="#fff"
                    d="M200.813,190.445c2.445,0,4.5-1.046,4.5-2.376s-2-2.37-4.5-2.37-4.5,1.071-4.5,2.37S198.342,190.445,200.813,190.445Zm.9,3.905a8.49,8.49,0,0,1-.9.047c-2.483,0-4.468-1.043-4.468-2.37v.948c0,1.245,1.776,2.253,4.06,2.357h.8a8.049,8.049,0,0,0,1.232-.148,2.48,2.48,0,0,1-.73-.837Zm-.9-2.291a7.728,7.728,0,0,0,1.012-.066,2.528,2.528,0,0,1,2.1-1.071,2.676,2.676,0,0,1,.632.088,1.757,1.757,0,0,0,.755-1.216v-1.077c-.035,1.33-2.019,2.373-4.5,2.376s-4.464-1.071-4.5-2.376v1.065C196.425,191.045,198.374,192.06,200.813,192.06Zm.632.67h-1.264c-2.183-.158-3.836-1.131-3.836-2.351v.948c0,1.245,1.754,2.243,4.022,2.36h1.109a1.754,1.754,0,0,1,.032-.926Zm3.829-2.351a1.384,1.384,0,0,1-.243.771,1.722,1.722,0,0,1,.24.123Zm-1.321,1.008a1.9,1.9,0,1,0,2,1.9,1.953,1.953,0,0,0-2-1.9Zm.717,2.041a.679.679,0,0,1-.088.774.742.742,0,0,1-.493.221v.316h-.275v-.316a.7.7,0,0,1-.66-.6l.42-.1a.351.351,0,0,0,.12.253.367.367,0,0,0,.269.095.316.316,0,0,0,.227-.079.237.237,0,0,0,.073-.174.205.205,0,0,0-.073-.164,1.5,1.5,0,0,0-.316-.142,2.124,2.124,0,0,1-.36-.142.581.581,0,0,1-.205-.205.607.607,0,0,1-.079-.316.686.686,0,0,1,.142-.427.632.632,0,0,1,.442-.224v-.246h.275v.246a.632.632,0,0,1,.591.5l-.376.148a.376.376,0,0,0-.341-.316.246.246,0,0,0-.183.07.2.2,0,0,0-.07.164.183.183,0,0,0,.066.155,1.071,1.071,0,0,0,.288.13,3.745,3.745,0,0,1,.382.161.61.61,0,0,1,.218.212Z"
                    transform="translate(-148.811 -141.399)" />
                </g>
              </svg>
            </div>
            <div class="card-title">{{ $t('assetManagement.fo') }}</div>
          </div>
          <div v-if="showAssets" class="card-value primary">{{ formatCurrency(fo) }}</div>
          <div v-else class="card-value primary">****</div>
          <div class="card-approx">≈{{ formatCurrency(fo) }}</div>
        </div>
      </div>
    </div>

    <!-- 资产分布 -->
    <div class="asset-distribution">
      <h3 class="distribution-title">{{ $t('assetManagement.assetDistribution') }}</h3>
      <div class="distribution-list">
        <!-- 表头 -->
        <div class="distribution-header">
          <div class="header-name">{{ $t('assetManagement.name') }}</div>
          <div class="header-quantity">{{ $t('assetManagement.quantity') }}</div>
          <div class="header-value">{{ $t('assetManagement.value') }}</div>
        </div>
        <!-- 数据行 -->
        <div v-for="asset in assetList" :key="asset.name" class="distribution-item">
          <div class="asset-info">
            <img :src="asset.icon" :alt="asset.name" class="asset-icon" />
            <span class="asset-name">{{ asset.name }}</span>
          </div>
          <div class="asset-quantity">{{ formatNumber(asset.quantity) }}</div>
          <div class="asset-value">{{ formatCurrency(asset.value) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccount } from '@wagmi/vue'
import { useThemeStore } from '@/stores/theme'
import { View, Hide } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useI18n()
const { address } = useAccount()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 显示/隐藏资产
const showAssets = ref(true)

// 资产数据
const totalAssets = ref(329263.23)
const funds = ref(140000.00)
const earnings = ref(140000) // CHO数量
const earningsValue = ref(140.00) // CHO对应的USD价值
const fo = ref(14000.00)

// 资产列表
const assetList = ref([
  {
    name: 'USDT',
    icon: 'https://effigy.im/a/USDT.svg',
    quantity: 100.00,
    value: 100.00
  },
  {
    name: 'CHO',
    icon: 'https://effigy.im/a/CHO.svg',
    quantity: 100.00,
    value: 100.00
  },
  {
    name: 'MEME',
    icon: 'https://effigy.im/a/MEME.svg',
    quantity: 100.00,
    value: 100.00
  }
])

// 切换资产显示/隐藏
const toggleAssetsVisibility = () => {
  showAssets.value = !showAssets.value
}

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
  console.log('充币')
  // TODO: 实现充币逻辑
}

const handleWithdraw = () => {
  console.log('提币')
  // TODO: 实现提币逻辑
}

const handleBill = () => {
  router.push('/bill')
}

// 获取资产数据
const fetchAssets = async () => {
  if (!address.value) return

  try {
    // TODO: 调用API获取实际资产数据
    // const response = await getAssetData(address.value)
    // totalAssets.value = response.totalAssets
    // funds.value = response.funds
    // earnings.value = response.earnings
    // fo.value = response.fo
    // assetList.value = response.assetList
  } catch (error) {
    console.error('获取资产数据失败:', error)
  }
}

onMounted(() => {
  fetchAssets()
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
      background: linear-gradient(90deg, #c8ff2d 0%, #b3ff1a 100%);
      color: #0a0a0a;
      box-shadow: 0 4px 12px rgba(200, 255, 45, 0.3);

      &:active {
        transform: scale(0.98);
      }
    }

    &.withdraw-btn {
      background: linear-gradient(90deg, #c8ff2d 0%, #b3ff1a 100%);
      color: #0a0a0a;
      box-shadow: 0 4px 12px rgba(200, 255, 45, 0.3);

      &:active {
        transform: scale(0.98);
      }
    }

    &.bill-btn {
      background: linear-gradient(90deg, #c8ff2d 0%, #b3ff1a 100%);
      color: #0a0a0a;
      box-shadow: 0 4px 12px rgba(200, 255, 45, 0.3);

      &:active {
        transform: scale(0.98);
      }
    }
  }
}

// 资产卡片
.asset-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;

  // 完全隐藏滚动条但保持滚动功能
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE 和 Edge

  &::-webkit-scrollbar {
    display: none; // Chrome, Safari, Opera
  }

  .asset-card {
    flex: 0 0 auto;
    width: calc((100% - 24px) / 3);
    background-color: var(--bg-card, #1e1e1e);
    border: 1px solid var(--border-color, #23262F);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-color-y, #2EBE69);

      .icon {
        width: 24px;
        height: 24px;
      }

      &.earnings {
        color: var(--text-color-y, #2EBE69);
      }
    }

    .card-content {
      display: flex;
      flex-direction: column;

      .card-title-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }

      .card-title {
        font-family: PingFang SC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        color: var(--text-color, rgba(255, 255, 255, 0.6));
      }

      .card-value {
        font-size: 18px;
        font-weight: 600;

        &.primary {
          color: #2FBC87;
        }
      }

      .card-approx {
        font-size: 12px;
        color: var(--text-gray, rgba(255, 255, 255, 0.5));
      }
    }
  }
}

// 资产分布
.asset-distribution {
  .distribution-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
    margin: 0 0 16px 0;
    font-family: PingFang SC, PingFang SC;
  }

  .distribution-list {
    overflow: hidden;

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
