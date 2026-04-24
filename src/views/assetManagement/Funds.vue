<template>
  <div class="funds-container">
    <section class="funds-hero">
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
        <span class="hero-value">{{ formatMaskedNumber(fundsTotal, "number") }}</span>
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
    </section>

    <section class="funds-list-section">
      <div class="section-title">{{ $t("assetManagement.coin") || "币种" }}</div>

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
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { CaretBottom, Document, Hide, View } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useAccount } from "@wagmi/vue";
import PrimaryActionButton from "@/components/PrimaryActionButton.vue";
import { getUserAssets } from "@/api/APIEvent";
import choIcon from "@/assets/icon/TIcon.png";
import usdtIcon from "@/assets/images/coin/usdt.png";

const { t } = useI18n();
const router = useRouter();
const { address } = useAccount();

const showAssets = ref(true);
const fundsTotal = ref(0);
const loadingAssets = ref(false);
const assetList = ref([]);

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

const normalizedAssetList = computed(() =>
  assetList.value.map((asset, index) => {
    const upperName = String(asset.name || "").toUpperCase();
    const assetMeta = assetMetaMap[upperName] || {};

    return {
      key: `${upperName}-${index}`,
      name: upperName || asset.name,
      subtitle: asset.subtitle || assetMeta.subtitle || upperName,
      icon: asset.icon || assetMeta.icon || choIcon,
      quantity: asset.quantity,
      value: asset.value,
    };
  }),
);

const toggleAssetsVisibility = () => {
  showAssets.value = !showAssets.value;
};

const fetchAssets = async () => {
  if (!address.value) return;

  try {
    loadingAssets.value = true;
    const res = await getUserAssets({ user_address: address.value });
    const data = res?.data?.data || {};

    fundsTotal.value = toNumber(data.total_value_usdt);

    const list = Array.isArray(data.assets) ? data.assets : [];
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
    console.error("获取资金数据失败:", error);
    fundsTotal.value = 0;
    assetList.value = [];
  } finally {
    loadingAssets.value = false;
  }
};

onMounted(() => {
  fetchAssets();
});

watch(
  () => address.value,
  () => {
    fetchAssets();
  },
);

const handleDeposit = () => {
  router.push("/deposit");
};

const handleWithdraw = () => {
  router.push("/withdraw");
};

const handleBill = () => {
  router.push("/bill");
};
</script>

<style scoped lang="scss">
.funds-container {
  min-height: calc(100vh - 122px);
  padding: 14px 20px 32px;
  background: #232932;
  color: #ffffff;
}

.funds-hero {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 32px;
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
  line-height: 1.3;
  font-weight: 500;
  color: #ffffff;
}

.hero-eye-btn,
.hero-bill-btn,
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
  cursor: pointer;
}

.hero-eye-btn {
  font-size: 14px;
  color: #8d94a1;
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
  height: 40px;
  border-radius: 12px;
  border: 0 !important;
  background: #313843;
  color: #ffffff;
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

.funds-list-section {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 26px;
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  line-height: 1.25;
  font-weight: 700;
  color: #ffffff;
}

.distribution-empty {
  padding: 28px 0;
  font-size: 14px;
  text-align: center;
  color: #8d94a1;
}

.coin-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.coin-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.coin-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.coin-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.coin-name {
  font-size: 17px;
  line-height: 1.15;
  font-weight: 700;
  color: #ffffff;
}

.coin-subtitle {
  font-size: 12px;
  line-height: 1.2;
  color: #8d94a1;
}

.coin-right {
  display: flex;
  min-width: 96px;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
}

.coin-quantity {
  font-size: 17px;
  line-height: 1.15;
  font-weight: 700;
  color: #ffffff;
}

.coin-value {
  font-size: 12px;
  line-height: 1.2;
  color: #8d94a1;
}
</style>
