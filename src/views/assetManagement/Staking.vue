<template>
  <div class="staking-container">
    <section class="staking-hero">
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
      </div>

      <div class="hero-value-row">
        <span class="hero-value">{{ formatMaskedNumber(stakingTotal, "number") }}</span>
        <button type="button" class="hero-unit-btn">
          <span>USDT</span>
          <el-icon><CaretBottom /></el-icon>
        </button>
      </div>

      <div class="hero-today-row">
        <span class="today-label">今日：</span>
        <span class="today-value">{{ formatTodayDelta() }}</span>
      </div>
    </section>

    <section class="earnings-cards">
      <button
        v-for="card in earningsCards"
        :key="card.id"
        type="button"
        :class="['earning-card', { 'is-clickable': card.hasArrow }]"
        @click="handleCardClick(card)"
      >
        <div class="card-left">
          <div class="card-title">{{ card.title }}</div>
          <div class="card-desc">{{ card.desc }}</div>
        </div>

        <div class="card-right">
          <span class="card-value">{{ formatCardValue(card) }}</span>
          <el-icon v-if="card.hasArrow" class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </div>
      </button>
    </section>

    <p class="footer-note">
      * 预测平台盈利金额的*10%，分给当天质押6000U/14000U用户
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowRight, CaretBottom, Hide, View } from "@element-plus/icons-vue";
import { useAccount } from "@wagmi/vue";
import { getMyIncome } from "@/api/API";
import { getExchangeRateCho } from "@/api/APIEvent";
import { formatChoAmount, formatTokenAmount } from "@/utils/format_amount";

const { t } = useI18n();
const router = useRouter();
const { address } = useAccount();

const showAssets = ref(true);
const stakingTotal = ref(0);
const choPrice = ref(0);

const myIncomeData = ref({
  active_node_id: "",
  node_income: "0",
  staking_income: "0",
  forecast_income: "0",
  sub_coin_income: "0",
  fomo_pool_income: "0",
});

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

const formatMaskedNumber = (num, type = "number") => {
  if (!showAssets.value) {
    return type === "currency" ? "$****" : "****";
  }

  return type === "currency" ? formatCurrency(num) : formatNumber(num);
};

const parseChoIncome = async (value) => {
  if (!value) return 0;

  try {
    if (typeof value === "string" && value.includes(".")) {
      return toNumber(value);
    }

    const { formatUnits } = await import("viem");
    return toNumber(formatUnits(BigInt(value.toString()), 6));
  } catch (error) {
    console.error("Failed to parse CHO income", error);
    return 0;
  }
};

const earningsCards = computed(() => {
  const cards = [];

  if (myIncomeData.value.active_node_id) {
    cards.push({
      id: "node",
      title: t("myEarnings.nodeEarnings") || "节点收益",
      desc: t("myEarnings.nodeEarningsDesc") || "母币交易手续费收益",
      value: myIncomeData.value.node_income,
      formatter: "cho",
      hasArrow: true,
    });
  }

  cards.push(
    {
      id: "staking",
      title: t("myEarnings.stakingEarnings") || "质押收益",
      desc: t("myEarnings.stakingEarningsDesc") || "预测平台母币质押收益",
      value: myIncomeData.value.staking_income,
      formatter: "cho",
      hasArrow: true,
    },
    {
      id: "flow",
      title: t("myEarnings.flowEarnings") || "流水收益",
      desc: t("myEarnings.flowEarningsDesc") || "预测平台交易流水收益",
      value: myIncomeData.value.forecast_income,
      formatter: "usdt18",
      hasArrow: true,
    },
    {
      id: "subCoin",
      title: t("myEarnings.subCoinEarnings") || "子币收益",
      desc: t("myEarnings.subCoinEarningsDesc") || "事件预言机收益",
      value: myIncomeData.value.sub_coin_income,
      formatter: "cho",
      hasArrow: false,
    },
    {
      id: "fomoPool",
      title: t("myEarnings.fomoPoolEarnings") || "预测平台FOMO池金额",
      desc: "",
      value: myIncomeData.value.fomo_pool_income,
      formatter: "cho",
      hasArrow: false,
    },
  );

  return cards;
});

const toggleAssetsVisibility = () => {
  showAssets.value = !showAssets.value;
};

const fetchMyIncomeData = async () => {
  if (!address.value) return;

  try {
    const [incomeRes, priceRes] = await Promise.all([
      getMyIncome({ address: address.value }),
      getExchangeRateCho(),
    ]);

    if (priceRes?.data?.code === 2000 || priceRes?.data?.data) {
      choPrice.value = toNumber(priceRes?.data?.data?.price_usdt);
    }

    if (incomeRes?.data?.success) {
      const incomeData = incomeRes.data.data || {};
      myIncomeData.value = {
        active_node_id: incomeData.active_node_id || "",
        node_income: incomeData.node_income || "0",
        staking_income: incomeData.staking_income || "0",
        forecast_income: incomeData.forecast_income || "0",
        sub_coin_income: incomeData.sub_coin_income || "0",
        fomo_pool_income: incomeData.fomo_pool_income || "0",
      };

      const stakingIncomeNum = await parseChoIncome(myIncomeData.value.staking_income);
      stakingTotal.value = stakingIncomeNum * choPrice.value;
    }
  } catch (error) {
    console.error("Failed to fetch my income or cho price:", error);
    stakingTotal.value = 0;
  }
};

onMounted(() => {
  if (address.value) {
    fetchMyIncomeData();
  }
});

watch(
  () => address.value,
  (newVal) => {
    if (newVal) {
      fetchMyIncomeData();
    }
  },
);

const formatCardValue = (card) => {
  if (!showAssets.value) return "****";

  if (card.formatter === "usdt18") {
    return formatTokenAmount(card.value, { decimals: 18, maxFractionDigits: 2, useGrouping: true });
  }

  return formatChoAmount(card.value, { maxFractionDigits: 4, useGrouping: true });
};

const formatTodayDelta = () => {
  if (!showAssets.value) {
    return "****";
  }

  const forecastIncome = toNumber(
    formatTokenAmount(myIncomeData.value.forecast_income, {
      decimals: 18,
      maxFractionDigits: 2,
      useGrouping: false,
    }),
  );

  return `+${formatCurrency(forecastIncome)} (+0%)`;
};

const handleCardClick = (card) => {
  if (!card.hasArrow) return;

  if (card.id === "node") {
    router.push({
      path: "/myNode",
      query: {
        id: myIncomeData.value.active_node_id || "093ba260586549c087ef43b6a1326265",
      },
    });
    return;
  }

  if (card.id === "staking") {
    router.push("/myIncome");
    return;
  }

  if (card.id === "flow") {
    router.push("/my-earnings");
  }
};
</script>

<style scoped lang="scss">
.staking-container {
  min-height: calc(100vh - 122px);
  padding: 14px 20px 32px;
  background: #232932;
  color: #ffffff;
}

.staking-hero {
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
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
.hero-unit-btn {
  border: none;
  background: transparent;
  padding: 0;
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
}

.hero-eye-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #8d94a1;
  cursor: pointer;
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

.hero-today-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 1.3;
}

.today-label {
  color: #ffffff;
}

.today-value {
  color: #32d296;
}

.earnings-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 30px;
}

.earning-card {
  width: 100%;
  padding: 22px 20px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(36, 43, 52, 0.88);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;
  color: inherit;
  box-shadow: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.earning-card.is-clickable {
  cursor: pointer;
}

.card-left {
  min-width: 0;
  flex: 1;
}

.card-title {
  font-size: 17px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
}

.card-desc {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.35;
  color: #8d94a1;
}

.card-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.card-value {
  font-size: 17px;
  line-height: 1.15;
  font-weight: 700;
  color: #32d296;
}

.arrow-icon {
  font-size: 18px;
  color: #8d94a1;
}

.footer-note {
  margin: 22px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #8d94a1;
}
</style>
