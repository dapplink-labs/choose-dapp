<template>
  <div class="funds-container">
    <!-- 资金估值 -->
    <div class="total-assets-section">
      <div class="assets-header">
        <div class="assets-title-wrapper">
          <h2 class="assets-title">
            {{ $t("assetManagement.totalAssets") || "总资产估值" }}
          </h2>
          <el-icon class="eye-icon" @click="toggleAssetsVisibility">
            <View v-if="showAssets" />
            <Hide v-else />
          </el-icon>
        </div>
        <el-icon class="bill-icon" @click="handleBill"><Document /></el-icon>
      </div>
      <div class="assets-value">
        <span v-if="showAssets" class="value-number">{{
          formatNumber(fundsTotal)
        }}</span>
        <span v-else class="value-number">****</span>
        <span class="value-unit">USDT</span>
        <!-- <el-icon class="dropdown-icon"><CaretBottom /></el-icon> -->
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="action-btn deposit-btn" @click="handleDeposit">
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
        >
          <path
            d="M839.8574 434.3808a41.216 41.216 0 0 0-10.9056-28.9792l-0.5632-0.5632a40.0896 40.0896 0 0 0-27.9552-11.1616 42.496 42.496 0 0 0-30.6176 13.1072l-216.1664 216.2176V41.6768a41.6768 41.6768 0 0 0-83.3024 0v581.12L254.3854 406.784a43.1104 43.1104 0 0 0-29.5424-12.9024h-1.024c-10.5984 0-20.48 3.9936-27.9552 10.9056l-0.6144 0.5632a41.472 41.472 0 0 0 1.9968 58.5728l282.0096 281.9584c3.7376 4.8128 8.448 8.704 13.824 11.4688l2.1504 1.024 0.768 0.3072c4.9152 2.0992 10.24 3.1744 15.5136 3.1744H512.6382a39.2704 39.2704 0 0 0 23.552-7.7312 42.0352 42.0352 0 0 0 7.8336-7.2704l282.9312-282.9312a43.0592 43.0592 0 0 0 12.9024-29.5936z"
            fill="currentColor"
          ></path>
          <path
            d="M940.619 785.92v71.424c0 46.0288-37.376 83.3024-83.3536 83.3024H166.731a83.3536 83.3536 0 0 1-83.3024-83.3024v-71.4752a41.6768 41.6768 0 0 0-83.3536 0v71.4752A166.656 166.656 0 0 0 166.731 1024h690.5344a166.656 166.656 0 0 0 166.656-166.656v-71.4752a41.6768 41.6768 0 0 0-83.3536 0z"
            fill="currentColor"
          ></path>
        </svg>
        <span>{{ $t("assetManagement.deposit") || "充币" }}</span>
      </button>
      <button class="action-btn withdraw-btn" @click="handleWithdraw">
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
        >
          <path
            d="M782.72512 327.9104l-242.54464-242.54464a35.84512 35.84512 0 0 0-13.76256-10.7008c-0.22016-0.09728-0.44032-0.2048-0.67072-0.30208a33.97632 33.97632 0 0 0-13.34272-2.73408l-0.08704 0.00512-0.32256-0.01536c-0.09216 0-0.1792 0.01536-0.27136 0.01536-0.09728 0-0.18944-0.01536-0.2816-0.01536a33.7664 33.7664 0 0 0-20.21376 6.66624 35.96288 35.96288 0 0 0-6.79936 6.27712l-243.3536 243.36384c-6.97856 6.97856-10.85952 15.97952-11.0848 25.4208a35.4304 35.4304 0 0 0 9.3696 24.9344l0.512 0.512a34.49344 34.49344 0 0 0 24.01792 9.57952 36.5568 36.5568 0 0 0 26.33728-11.29472L476.16 191.14496v499.99872a35.84 35.84 0 1 0 71.68 0v-499.8144l185.73312 185.73312c6.97856 6.97856 15.97952 10.85952 25.41568 11.0848l0.86016 0.01024c9.1136 0 17.60768-3.43552 24.07936-9.37984l0.512-0.512c13.30176-13.83424 12.76928-36.38272-1.7152-50.3552z"
            fill="currentColor"
          ></path>
          <path
            d="M880.64 747.57632v61.44c0 39.58784-32.09216 71.68-71.68 71.68H215.04c-39.58784 0-71.68-32.09216-71.68-71.68v-61.44a35.84 35.84 0 1 0-71.68 0v61.44c0 79.17568 64.18432 143.36 143.36 143.36h593.92c79.17568 0 143.36-64.18432 143.36-143.36v-61.44a35.84 35.84 0 1 0-71.68 0z"
            fill="currentColor"
          ></path>
        </svg>
        <span>{{ $t("assetManagement.withdraw") || "提币" }}</span>
      </button>
    </div>

    <!-- 币种列表 -->
    <div class="asset-distribution">
      <div class="distribution-title-bar">
        <span class="title-text">{{
          $t("assetManagement.coin") || "币种"
        }}</span>
      </div>

      <div class="distribution-list">
        <!-- 表头 -->
        <div class="distribution-header">
          <div class="header-name">
            {{ $t("assetManagement.name") || "名称" }}
          </div>
          <div class="header-quantity">
            {{ $t("assetManagement.quantity") || "数量" }}
          </div>
          <div class="header-value">
            {{ $t("assetManagement.value") || "价值" }}
          </div>
        </div>
        <!-- 数据行 -->
        <div v-if="!assetList.length" class="distribution-empty">
          {{ $t("common.noData") || "暂无数据" }}
        </div>
        <div
          v-for="asset in assetList"
          :key="asset.name"
          class="distribution-item"
        >
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
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { View, Hide, CaretBottom, Document } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useAccount } from "@wagmi/vue";
import { getUserAssets } from "@/api/APIEvent";
import TIcon from "@/assets/icon/TIcon.png";

const { t } = useI18n();
const router = useRouter();
const { address } = useAccount();

const showAssets = ref(true);
const fundsTotal = ref(0);
const loadingAssets = ref(false);

const assetList = ref([]);

const toggleAssetsVisibility = () => {
  showAssets.value = !showAssets.value;
};

const formatNumber = (num) => {
  if (typeof num !== "number") return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCurrency = (num) => {
  if (typeof num !== "number") return "$0.00";
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fetchAssets = async () => {
  if (!address.value) return;

  try {
    loadingAssets.value = true;
    const res = await getUserAssets({ user_address: address.value });
    const data = res?.data?.data || {};

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    // 资金估值使用总资产估值
    fundsTotal.value = toNum(data.total_value_usdt);

    // 资产分布
    const list = Array.isArray(data.assets) ? data.assets : [];
    assetList.value = list
      .map((a) => {
        const symbol = a.asset_symbol || a.asset_name || "";
        return {
          name: symbol,
          icon: a.icon || TIcon,
          quantity: toNum(a.balance),
          value: toNum(a.value_usdt),
        };
      })
      .filter((v) => v.name);
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
  padding: 16px;
  padding-bottom: 32px;
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
  margin-bottom: 32px;

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

    .icon {
      width: 20px;
      height: 20px;
    }

    &.deposit-btn {
      background: var(--text-color-y, #bbff2e);
      color: var(--bg-color-010101, #010101);
    }

    &.withdraw-btn {
      background: var(--bg-opposite, #ffffff);
      color: var(--bg-color-010101, #010101);
    }
  }
}

// 币种列表
.asset-distribution {
  .distribution-title-bar {
    margin-bottom: 16px;
    .title-text {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-color);
    }
  }

  .distribution-list {
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
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));

      .header-name,
      .header-quantity,
      .header-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-gray, rgba(255, 255, 255, 0.5));
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
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));

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
</style>
