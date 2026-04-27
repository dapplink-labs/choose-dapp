<template>
  <div class="overview-container">
    <section class="overview-hero">
      <div class="hero-top">
        <div class="hero-title-wrap">
          <h2 class="hero-label">{{ $t("assetManagement.totalAssets") || "总资产估值" }}</h2>
          <button type="button" class="hero-eye-btn" @click="toggleAssetsVisibility">
            <el-icon>
              <View v-if="showAssets" />
              <Hide v-else />
            </el-icon>
          </button>
        </div>

        <button type="button" class="hero-bill-btn" @click="handleBill">
          <el-icon><Document /></el-icon>
        </button>
      </div>

      <div class="hero-value-row">
        <span class="hero-value">{{ formatMaskedNumber(totalAssets, "number") }}</span>
        <button type="button" class="hero-unit-btn">
          <span>USDT</span>
          <el-icon><CaretBottom /></el-icon>
        </button>
      </div>

      <div class="action-buttons">
        <PrimaryActionButton
          class="action-btn action-btn--deposit"
          height="40px"
          radius="12px"
          font-size="16px"
          font-weight="700"
          text-color="#141414"
          gradient-from="#ffd94b"
          gradient-to="#ffcc1f"
          @click="handleDeposit"
        >
          <span class="action-icon action-icon--deposit">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3.5v10.2m0 0 4-4m-4 4-4-4M5 15.5v2.2c0 .7.6 1.3 1.3 1.3h11.4c.7 0 1.3-.6 1.3-1.3v-2.2"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.4"
              />
            </svg>
          </span>
          <span>{{ $t("assetManagement.deposit") || "充币" }}</span>
        </PrimaryActionButton>

        <button type="button" class="action-btn action-btn--withdraw" @click="handleWithdraw">
          <span class="action-icon action-icon--withdraw">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 20.5V10.3m0 0 4 4m-4-4-4 4M5 8.5V6.3C5 5.6 5.6 5 6.3 5h11.4c.7 0 1.3.6 1.3 1.3v2.2"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.4"
              />
            </svg>
          </span>
          <span>{{ $t("assetManagement.withdraw") || "提币" }}</span>
        </button>
      </div>

      <div v-if="recentRecords.length > 0" class="records-card">
        <button
          v-for="(record, index) in recentRecords"
          :key="index"
          type="button"
          class="record-item"
          @click="handleRecordDetail(record)"
        >
          <div class="record-left">
            <span class="record-badge" :class="`record-badge--${record.type}`">
              <svg v-if="record.type === 'deposit'" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 6.5v8m0 0 3.2-3.2M12 14.5l-3.2-3.2"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.2"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 17.5v-8m0 0 3.2 3.2M12 9.5l-3.2 3.2"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.2"
                />
              </svg>
            </span>

            <div class="record-copy">
              <div class="record-title-line">
                <span class="record-title">
                  {{ record.type === "deposit" ? $t("assetManagement.deposit") : $t("assetManagement.withdraw") }}
                </span>
                <span class="record-amount">{{ formatRecordAmount(record.amount, record.unit) }}</span>
              </div>
            </div>
          </div>

          <div class="record-right">
            <span class="record-status" :class="record.statusColor">{{ record.statusText }}</span>
            <el-icon class="record-arrow"><ArrowRight /></el-icon>
          </div>
        </button>
      </div>
    </section>

    <section class="distribution-section">
      <div class="distribution-tabs">
        <button
          type="button"
          :class="['distribution-tab', { active: distTab === 'coin' }]"
          @click="distTab = 'coin'"
        >
          {{ $t("assetManagement.coin") || "币种" }}
        </button>
        <button
          type="button"
          :class="['distribution-tab', { active: distTab === 'account' }]"
          @click="distTab = 'account'"
        >
          {{ $t("assetManagement.account") || "账户" }}
        </button>
      </div>

      <div v-if="distTab === 'coin'" class="coin-list">
        <div v-if="normalizedAssetList.length === 0" class="distribution-empty">
          {{ $t("common.noData") || "暂无数据" }}
        </div>

        <div v-for="asset in normalizedAssetList" :key="asset.key" class="coin-row">
          <div class="coin-left">
            <img :src="asset.icon" :alt="asset.name" class="coin-icon" />
            <div class="coin-copy">
              <div class="coin-name">{{ asset.name }}</div>
              <div class="coin-subtitle">{{ asset.subtitle }}</div>
            </div>
          </div>

          <div class="coin-right">
            <div class="coin-quantity">{{ formatMaskedNumber(asset.quantity, "smart") }}</div>
            <div class="coin-value">{{ formatMaskedNumber(asset.value, "currency") }}</div>
          </div>
        </div>
      </div>

      <div v-else class="account-list">
        <div v-for="item in accountItems" :key="item.key" class="account-row">
          <div class="account-name">{{ item.name }}</div>
          <div class="account-value">{{ formatMaskedNumber(item.value, "currency") }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAccount } from "@wagmi/vue";
import { useRouter } from "vue-router";
import { ArrowRight, CaretBottom, Document, Hide, View } from "@element-plus/icons-vue";
import PrimaryActionButton from "@/components/PrimaryActionButton.vue";
import { getMyIncome } from "@/api/API";
import {
  getExchangeRateCho,
  getFundsHistory,
  getUserAssets,
} from "@/api/APIEvent";
import choIcon from "@/assets/icon/TIcon.png";
import usdtIcon from "@/assets/images/coin/usdt.png";

const router = useRouter();
const { t } = useI18n();
const { address } = useAccount();

const showAssets = ref(true);
const distTab = ref("account");
const loadingAssets = ref(false);

const totalAssets = ref(0);
const fundsValue = ref(0);
const stakingValue = ref(0);

const assetList = ref([]);
const recentRecords = ref([]);

const assetMetaMap = {
  USDT: {
    icon: usdtIcon,
    subtitle: "TetherUS",
  },
  CHO: {
    icon: choIcon,
    subtitle: "ChooseMe",
  },
};

const normalizedAssetList = computed(() =>
  assetList.value.map((asset, index) => {
    const upperName = String(asset.name || "").toUpperCase();
    const assetMeta = assetMetaMap[upperName] || {};

    return {
      key: `${upperName}-${index}`,
      name: upperName || asset.name,
      subtitle: asset.subtitle || assetMeta.subtitle || asset.name,
      icon: asset.icon || assetMeta.icon || choIcon,
      quantity: asset.quantity,
      value: asset.value,
    };
  }),
);

const accountItems = computed(() => [
  { key: "funds", name: t("assetManagement.funds") || "资金", value: fundsValue.value },
  { key: "staking", name: t("assetManagement.staking") || "质押", value: stakingValue.value },
]);

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatNumber = (num) =>
  toNumber(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCurrency = (num) =>
  `$${toNumber(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatSmartNumber = (num) => {
  const value = toNumber(num);
  const isInteger = Math.abs(value - Math.round(value)) < 1e-8;

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: isInteger ? 0 : 4,
  });
};

const formatMaskedNumber = (num, type = "number") => {
  if (!showAssets.value) {
    return type === "currency" ? "$****" : "****";
  }

  if (type === "currency") return formatCurrency(num);
  if (type === "smart") return formatSmartNumber(num);
  return formatNumber(num);
};

const formatRecordAmount = (amount, unit) => {
  if (!showAssets.value) {
    return `**** ${unit || "USDT"}`;
  }

  return `${formatNumber(amount)} ${unit || "USDT"}`;
};

const toggleAssetsVisibility = () => {
  showAssets.value = !showAssets.value;
};

const handleDeposit = () => {
  router.push("/deposit");
};

const handleWithdraw = () => {
  router.push("/withdraw");
};

const handleBill = () => {
  router.push("/bill");
};

const handleRecordDetail = () => {
  router.push("/bill");
};

const fetchFundsHistory = async () => {
  if (!address.value) return;

  try {
    const res = await getFundsHistory({
      user_address: address.value,
      page: 1,
      page_size: 2,
      type: "all",
    });

    const list = res?.data?.data?.transactions || [];
    recentRecords.value = (Array.isArray(list) ? list : []).slice(0, 2).map((item) => {
      const isDeposit = item.type === "deposit" || String(item.type) === "1";
      const type = isDeposit ? "deposit" : "withdraw";
      const statusStr = String(item.status || "").toLowerCase();

      let statusText = t("commonManagement.processing") || "处理中";
      let statusColor = "color-green";

      if (statusStr === "confirmed") {
        statusText = t("commonManagement.confirmed") || "已完成";
        statusColor = "color-green";
      } else if (statusStr === "failed") {
        statusText = t("commonManagement.failed") || "已失败";
        statusColor = "color-red";
      }

      return {
        type,
        amount: toNumber(item.amount || item.value),
        unit: item.unit || item.symbol || item.coin || "USDT",
        statusText,
        statusColor,
      };
    });
  } catch (error) {
    console.error("获取充提记录失败:", error);
    recentRecords.value = [];
  }
};

const fetchAssets = async () => {
  if (!address.value) return;

  try {
    loadingAssets.value = true;

    const [assetsRes, incomeRes, priceRes] = await Promise.all([
      getUserAssets({ user_address: address.value }),
      getMyIncome({ address: address.value }),
      getExchangeRateCho(),
    ]);

    const assetsData = assetsRes?.data?.data || {};

    fundsValue.value = toNumber(assetsData.total_value_usdt);

    let choPrice = 0;
    if (priceRes?.data?.code === 2000 || priceRes?.data?.data) {
      choPrice = toNumber(priceRes?.data?.data?.price_usdt);
    }

    let stakingIncomeNum = 0;
    if (incomeRes?.data?.success) {
      const incomeData = incomeRes.data.data;

      try {
        if (incomeData.staking_income) {
          if (
            typeof incomeData.staking_income === "string" &&
            incomeData.staking_income.includes(".")
          ) {
            stakingIncomeNum = toNumber(incomeData.staking_income);
          } else {
            const { formatUnits } = await import("viem");
            stakingIncomeNum = toNumber(
              formatUnits(BigInt(incomeData.staking_income.toString()), 6),
            );
          }
        }
      } catch (error) {
        console.error("Failed to parse staking income", error);
      }
    }

    stakingValue.value = stakingIncomeNum * choPrice;
    totalAssets.value = fundsValue.value + stakingValue.value;

    const list = Array.isArray(assetsData.assets) ? assetsData.assets : [];
    assetList.value = list
      .map((item) => {
        const symbol = String(item.asset_symbol || item.asset_name || "").toUpperCase();
        const assetMeta = assetMetaMap[symbol] || {};

        return {
          name: symbol,
          subtitle: item.asset_name || assetMeta.subtitle || symbol,
          icon: item.icon || assetMeta.icon || choIcon,
          quantity: toNumber(item.balance),
          value: toNumber(item.value_usdt),
        };
      })
      .filter((item) => item.name);
  } catch (error) {
    console.error("获取资产数据失败:", error);
    totalAssets.value = 0;
    fundsValue.value = 0;
    stakingValue.value = 0;
    assetList.value = [];
  } finally {
    loadingAssets.value = false;
  }
};

onMounted(() => {
  fetchAssets();
  fetchFundsHistory();
});

watch(
  () => address.value,
  () => {
    fetchAssets();
    fetchFundsHistory();
  },
);
</script>

<style scoped lang="scss">
.overview-container {
  min-height: calc(100vh - 122px);
  padding: 14px 20px 32px;
  background: #232932;
  color: #ffffff;
}

.overview-hero {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.hero-title-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
}

.hero-label {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.3;
}

.hero-eye-btn,
.hero-bill-btn,
.distribution-tab,
.hero-unit-btn {
  border: none;
  background: transparent;
  padding: 0;
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
}

.hero-eye-btn,
.hero-bill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #8d94a1;
  cursor: pointer;
}

.hero-eye-btn {
  font-size: 14px;
}

.hero-bill-btn {
  width: 17px;
  height: 17px;
  font-size: 15px;
  color: #ffffff;
}

.hero-value-row {
  display: flex;
  align-items: flex-end;
  gap: 7px;
}

.hero-value {
  font-size: 32px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #ffffff;
}

.hero-unit-btn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 2px;
  font-size: 11px;
  color: #8d94a1;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.action-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 700;
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
}

.action-btn--withdraw {
  height: 38px;
  border-radius: 12px;
  background: #313843;
  color: #ffffff;
  border: 0 !important;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    opacity 0.12s ease;
}

.action-btn--withdraw:active {
  transform: scale(0.985);
}

.action-btn--withdraw:hover,
.action-btn--withdraw:focus,
.action-btn--withdraw:focus-visible {
  border: 0 !important;
  outline: none !important;
  box-shadow: none !important;
}

.action-icon {
  width: 15px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon svg {
  width: 15px;
  height: 15px;
}

.records-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  background: rgba(36, 43, 52, 0.78);
  overflow: hidden;
}

.record-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 16px;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  background: transparent;
  color: inherit;
  cursor: pointer;
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
}

.record-item:last-child {
  border-bottom: none;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.record-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  flex-shrink: 0;
}

.record-badge svg {
  width: 12px;
  height: 12px;
}

.record-copy {
  min-width: 0;
}

.record-title-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.record-title,
.record-amount {
  font-size: 11px;
  line-height: 1.3;
}

.record-title {
  color: #ffffff;
  font-weight: 400;
}

.record-amount {
  color: #ffffff;
  font-weight: 600;
}

.record-right {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}

.record-status {
  font-size: 11px;
  font-weight: 500;
}

.record-status.color-green {
  color: #17c964;
}

.record-status.color-red {
  color: #ff5b5b;
}

.record-arrow {
  font-size: 11px;
  color: #8d94a1;
}

.distribution-section {
  margin-top: 20px;
}

.distribution-tabs {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.distribution-tab {
  position: relative;
  font-size: 15px;
  line-height: 1.2;
  font-weight: 700;
  color: #8d94a1;
  cursor: pointer;
}

.distribution-tab.active {
  color: #ffffff;
}

.distribution-tab.active::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 16px;
  height: 3px;
  border-radius: 999px;
  background: #ffd33d;
  transform: translateX(-50%);
}

.coin-list,
.account-list {
  padding-top: 4px;
}

.distribution-empty {
  padding: 36px 0 22px;
  color: #8d94a1;
  font-size: 11px;
  text-align: center;
}

.coin-row,
.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.coin-row:last-child,
.account-row:last-child {
  border-bottom: none;
}

.coin-left {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.coin-icon {
  width: 27px;
  height: 27px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.coin-copy {
  min-width: 0;
}

.coin-name {
  font-size: 13px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
}

.coin-subtitle {
  margin-top: 3px;
  font-size: 8px;
  line-height: 1.2;
  color: #8d94a1;
}

.coin-right {
  text-align: right;
  flex-shrink: 0;
}

.coin-quantity,
.account-value {
  font-size: 13px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
}

.coin-value {
  margin-top: 3px;
  font-size: 8px;
  line-height: 1.2;
  color: #8d94a1;
}

.account-name {
  font-size: 13px;
  line-height: 1.2;
  font-weight: 600;
  color: #ffffff;
}


</style>
