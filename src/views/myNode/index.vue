<template>
  <div class="myNode">
    <BackHeaderNav
      :show-open-btn="true"
      action-mode="icon"
      :open-icon-src="shareIcon"
      :action-icon-size="22"
    />

    <section class="earnings-hero">
      <div class="hero-copy">
        <h1 class="hero-title">
          {{ t("myEarnings.nodeEarnings") || t("myNodes.title") || "节点收益" }}
        </h1>
        <div class="hero-badges">
          <span class="hero-badge">{{ nodeTypeBadgeText }}</span>
        </div>
        <p class="hero-meta">
          {{ t("myIncome.purchaseTime") }}: {{ formatDateTime(purchaseTime || 0) }}
        </p>
      </div>
      <img class="hero-illustration" :src="heroIllustration" alt="" />
    </section>

    <section class="earnings-section">
      <div class="section-header">
        <h2 class="section-title">{{ t("claimSuccess.congratulations").replace("恭喜获得", "已领取收益") || "已领取收益" }}</h2>
        <button class="record-link" type="button" @click="goToClaimRecord">
          <span class="record-text">{{ t("myNode.claimRecord") }}</span>
          <img class="record-arrow-icon" :src="arrowRightIcon" alt="" />
        </button>
      </div>

      <div class="earnings-card">
        <div class="summary-grid summary-grid--two">
          <div v-for="item in claimedSummaryItems" :key="item.label" class="summary-item">
            <div class="summary-label">{{ item.label }}</div>
            <div class="summary-value">{{ item.value }}</div>
            <div class="summary-approx">{{ item.approx }}</div>
          </div>
        </div>

        <div class="progress-block">
          <div class="progress-head">
            <span class="progress-title">{{ t("collectEarnings.title").replace("领取收益", "领取进度") || "领取进度" }}</span>
            <span class="progress-remaining">
              {{ t("myIncome.remainingClaimable") }}:<span>{{ remainingClaimableText }}</span>
            </span>
          </div>

          <div class="progress-bar" ref="progressBarRef">
            <div
              class="progress-fill"
              :style="{ width: (progressPercent || 0) < 4 ? '4%' : `${progressPercent}%` }"
            ></div>
          </div>

          <div class="progress-scale">
            <span>0 U</span>
            <span>{{ progressEndText }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="earnings-section">
      <div class="section-header">
        <h2 class="section-title">{{ t("myNode.pendingIncome") }}</h2>
      </div>

      <div class="earnings-card earnings-card--spacious">
        <div class="pending-grid">
          <div v-for="item in pendingSummaryItems" :key="item.label" class="pending-item">
            <div class="pending-label">{{ item.label }}</div>
            <div :class="['pending-value', { 'pending-value--muted': item.muted }]">
              {{ item.value }}
            </div>
            <div v-if="item.approx" class="pending-approx">{{ item.approx }}</div>
          </div>
        </div>

        <PrimaryActionButton
          class="claim-all-btn"
          :disabled="isClaimDisabledByTime"
          height="48px"
          radius="14px"
          font-size="17px"
          font-weight="700"
          text-color="#161616"
          gradient-from="var(--text-color-y)"
          gradient-to="var(--text-color-y)"
          disabled-bg="#5d5d5d"
          disabled-text-color="#d0d0d0"
          @click="openClaimPopup"
        >
          {{ isClaimDisabledByTime ? t("myIncome.calculating") : t("myNode.claimAll") }}
        </PrimaryActionButton>
      </div>

      <p class="earnings-footnote">
        * {{ earningsFootnote }}
      </p>
    </section>

    <section class="team-section">
      <div class="team-tabs">
        <button
          type="button"
          :class="['team-tab', { active: activeTab === 'direct' }]"
          @click="activeTab = 'direct'"
        >
          {{ t("myNode.directAddress") }}
        </button>
        <button
          type="button"
          :class="['team-tab', { active: activeTab === 'team' }]"
          @click="activeTab = 'team'"
        >
          {{ t("myNode.teamAddress") }}
        </button>
      </div>

      <div class="team-stats">
        <div v-for="item in teamStats" :key="item.label" class="team-stat">
          <div class="team-stat-label">{{ item.label }}</div>
          <div class="team-stat-value">{{ item.value }}</div>
        </div>
      </div>

      <div v-if="currentList.length > 0" class="team-list-card">
        <div v-for="item in currentList" :key="item.address" class="team-row">
          <div class="team-avatar">
            <div class="avatar-content">
              <img :src="item.avatar || avatarImg" alt="avatar" class="avatar-img" @error="handleInviterAvatarError" />
            </div>
          </div>

          <div class="team-main">
            <div class="team-main-top">
              <div class="team-identity">
                <div class="team-address">{{ item.address }}</div>
                <span v-if="getTeamBadgeText(item)" class="team-badge">{{ getTeamBadgeText(item) }}</span>
              </div>
              <div class="team-reward">+ {{ item.reward || "0" }} CHO</div>
            </div>

            <div class="team-main-bottom">
              <div v-if="activeTab === 'team'" class="team-upline">
                <span>{{ t("myIncome.upline") }}:</span>
                <span>{{ item.upline || item.address }}</span>
              </div>
              <span class="team-time">{{ item.activationTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <detailsinfo ref="detailsRef" />

    <div v-if="showClaimPopup" class="claim-modal-mask" @click="showClaimPopup = false">
      <div class="claim-modal-content" @click.stop>
        <div class="modal-header">
          <span class="node-name-label"> {{
            nodeType === 0
              ? t("myNode.distributedNode")
              : t("myNode.clusterNode")
          }}</span>
          <el-icon class="close-icon" @click="showClaimPopup = false">
            <Close />
          </el-icon>
        </div>

        <div class="modal-body">
          <div class="input-wrapper">
            <input v-model="claimInputAmount" type="number" :placeholder="t('myNode.enterClaimAmount')"
              class="claim-input" />
            <span class="max-btn" @click="handleMaxAmount">{{ t('myNode.maxLabel') }}</span>
            <span class="unit">CHO</span>
          </div>
          <p class="available-tip">
            {{ t('myNode.pendingIncome') }}: <span>{{ formatAmount(totalAvailableAmount) }} CHO</span>
          </p>

          <!-- 新增信息汇总区域 -->
          <div class="claim-summary-info">
            <div class="summary-row">
              <span class="label">{{ t('collectEarnings.youWillReceive') }}</span>
              <span class="value highlighted">{{ formatAmount(receive80Amount) }} CHO</span>
            </div>
            <div class="summary-row">
              <span class="label dashed-underline">{{ t('collectEarnings.predictedAmount') }}</span>
              <span class="value">{{ formatAmount(projected20Amount) }} CHO</span>
            </div>
          </div>
        </div>

        <PrimaryActionButton
          class="confirm-claim-btn"
          :disabled="claimLoading"
          height="48px"
          radius="14px"
          font-size="16px"
          font-weight="700"
          text-color="#000000"
          gradient-from="var(--text-color-y)"
          gradient-to="var(--text-color-y)"
          disabled-bg="#6b6b6b"
          disabled-text-color="#d0d0d0"
          @click="confirmClaim"
        >
          {{ claimLoading ? t("common.loading") : t('myNode.confirmClaimBtn') }}
        </PrimaryActionButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useThemeStore } from "@/stores/theme";
import { useI18n } from "vue-i18n";
import Message from "@/utils/message";
import { useAccount, useChainId } from "@wagmi/vue";
import { switchChain } from "@wagmi/core";
import { config } from "../../wagmi.ts";
import nodeManagerABI from "@/assets/abi/nodeManagerABI.json";
import networks from "@/assets/json/networks.js";
import { writeContractOptimized } from "@/utils/requestWEB3.js";
import avatarImg from "@/assets/icon/avatar.png";
import lp1Img from "@/assets/icon/LP1.png";
import arrowRightIcon from "@/assets/new_icon/LPVault/lpvault-arrow-right.png";
import heroIllustration from "@/assets/new_icon/LPVault/lpvault-node-illustration.png";
import shareIcon from "@/assets/new_icon/LPVault/lpvault-share.png";
import detailsinfo from "./detailsinfo.vue";
import BackHeaderNav from "@/components/BackHeaderNav.vue";
import PrimaryActionButton from "@/components/PrimaryActionButton.vue";
import { Close } from "@element-plus/icons-vue";
import {
  getNodeServiceProvidersInfo,
  getMyTeamInfo,
  nodeclaimReward,
} from "@/api/API";
import { formatDateTime } from "@/utils/format_date.js";
import { formatChoAmount, formatTokenAmount } from "@/utils/format_amount";
import avatarImg1 from "@/assets/icon/avatarImg1.png";
import avatarImg2 from "@/assets/icon/avatarImg2.png";
import avatarImg3 from "@/assets/icon/avatarImg3.png";
import avatarImg4 from "@/assets/icon/avatarImg4.png";
import avatarImg5 from "@/assets/icon/avatarImg5.png";

const detailsRef = ref(null);

const themeStore = useThemeStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { address } = useAccount();
const chainId = useChainId();
const BSC_CHAIN_ID = 56;
const claimLoading = ref(false);

// 是否处于每日 02:00-03:00 收益计算时间段内
const isClaimDisabledByTime = computed(() => {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const start = 2 * 60; // 02:00
  const end = 3 * 60; // 03:00
  return totalMinutes >= start && totalMinutes < end;
});

// 顶部收益数据
const choIncome = ref("0");
const subCoinIncome = ref("0"); // 子币收益暂无数据，写死 0
const cho2usdt_rate = ref(0); // CHO 到 USDT 的汇率
const forecast_income = ref("0"); // 预测收益
const progressPercent = ref(0); // 进度百分比
const total_reward_usdt = ref("0"); // 节点总收益（USDT）

// 待领取收益数据
const nodeIncome = ref(0);
const networkFeeIncome = ref(0);
const subCoinFeeIncome = ref(0);
const secondaryMarketIncome = ref(0);
const directReferralIncome = ref(0);
const teamIncome = ref(0);
const nodeType = ref(0);
const projectedReturns = ref(0); // 个人预测收益
const purchaseTime = ref(0); // 购买时间
const directed_number = ref(0);
const target_direct_number = ref(0);

const showClaimPopup = ref(false); // 控制弹窗显示
const claimInputAmount = ref("");  // 输入框绑定的金额
const inputNum = ref(0); // 解析后的输入金额（数字类型）

// 你将收到 (80%) - 返回链上原始单位
const receive80Amount = computed(() => {
  inputNum.value = parseFloat(String(claimInputAmount.value).replace(/,/g, '')) || 0;
  // 计算结果乘以 1e6，转为整数（BigInt）供 formatAmount 使用
  return BigInt(Math.floor(inputNum.value * 0.8 * 1e6));
});

// 我的预测金额 (20%) - 返回链上原始单位
const projected20Amount = computed(() => {
  inputNum.value = parseFloat(String(claimInputAmount.value).replace(/,/g, '')) || 0;
  // 计算结果乘以 1e6
  return BigInt(Math.floor(inputNum.value * 0.2 * 1e6));
});


// 计算总共可领取的金额 (所有收益之和)
const totalAvailableAmount = computed(() => {
  return (
    Number(nodeIncome.value) +
    Number(networkFeeIncome.value) +
    Number(subCoinFeeIncome.value) +
    Number(secondaryMarketIncome.value) +
    Number(directReferralIncome.value) +
    Number(teamIncome.value) +
    Number(subCoinIncome.value)
  );
});


// --- 监听器：限制输入金额 ---
watch(claimInputAmount, (newVal) => {
  const maxDisplay = Number(totalAvailableAmount.value) / 1e6; // 转回可显示的金额
  if (Number(newVal) > maxDisplay) {
    claimInputAmount.value = String(maxDisplay)
    Message.warning(t('collectEarnings.exceedMax') || '输入金额不能超过可领取收益')
  }
  // newVal为空或者小于0时，重置为0
  if (newVal === '' || Number(newVal) < 0) {
    claimInputAmount.value = 0;
  }
})

// 监听弹窗显示，禁止页面滚动
watch(showClaimPopup, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
})

onUnmounted(() => {
  document.body.style.overflow = '';
})



// 处理最大值点击
const handleMaxAmount = () => claimInputAmount.value = formatChoAmount(totalAvailableAmount.value).replace(/,/g, '');

// 打开弹窗的函数
const openClaimPopup = () => {
  // if (isClaimDisabledByTime.value) return;
  // if (totalAvailableAmount.value <= 0) {
  //   Message.warning(t("myNode.noIncome"));
  //   return;
  // }
  // 默认填入最大可领取金额，或者清空让用户手动输
  claimInputAmount.value = formatChoAmount(totalAvailableAmount.value).replace(/,/g, '');
  showClaimPopup.value = true;
};

const isActivated = computed(() => {
  return Number(directed_number.value) >= Number(target_direct_number.value);
});

const nodeTypeBadgeText = computed(() =>
  nodeType.value === 0 ? t("myNode.distributedNode") : t("myNode.clusterNode"),
);

const formatApproxUsdt = (value) => `≈ ${formatAmount(value)} U`;

const claimedSummaryItems = computed(() => [
  {
    label: t("myNode.choIncome"),
    value: formatAmount(choIncome.value),
    approx: formatApproxUsdt(Number(choIncome.value) * Number(cho2usdt_rate.value || 0)),
  },
  {
    label: t("myNode.subCoinIncome"),
    value: formatAmount(subCoinIncome.value),
    approx: formatApproxUsdt(Number(subCoinIncome.value) * Number(cho2usdt_rate.value || 0)),
  },
]);

const pendingSummaryItems = computed(() => [
  {
    label: t("myNode.nodeIncome"),
    value: formatAmount(nodeIncome.value),
    approx: formatApproxUsdt(Number(nodeIncome.value) * Number(cho2usdt_rate.value || 0)),
  },
  {
    label: t("myNode.networkFeeIncome"),
    value: isActivated.value ? formatAmount(networkFeeIncome.value) : t("myNode.notActivated"),
    approx: isActivated.value
      ? formatApproxUsdt(Number(networkFeeIncome.value) * Number(cho2usdt_rate.value || 0))
      : "",
    muted: !isActivated.value,
  },
  {
    label: t("myNode.subCoinFeeIncome"),
    value: formatAmount(subCoinFeeIncome.value),
    approx: formatApproxUsdt(Number(subCoinFeeIncome.value) * Number(cho2usdt_rate.value || 0)),
  },
  {
    label: t("myNode.secondaryMarketIncome"),
    value: formatAmount(secondaryMarketIncome.value),
    approx: formatApproxUsdt(Number(secondaryMarketIncome.value) * Number(cho2usdt_rate.value || 0)),
  },
  {
    label: t("myNode.directReferralIncome"),
    value: formatAmount(directReferralIncome.value),
    approx: formatApproxUsdt(Number(directReferralIncome.value) * Number(cho2usdt_rate.value || 0)),
  },
  {
    label: t("myNode.networkIncome"),
    value: formatAmount(teamIncome.value),
    approx: formatApproxUsdt(Number(teamIncome.value) * Number(cho2usdt_rate.value || 0)),
  },
]);

const remainingClaimableText = computed(() =>
  `${formatUsdtAmount(parseInt(forecast_income.value) - parseInt(total_reward_usdt.value))}U`,
);

const progressEndText = computed(() => `${formatUsdtAmount(parseInt(forecast_income.value))} U`);

const earningsFootnote = computed(() =>
  nodeType.value === 0 ? t("myNode.distributedDesc") : t("myNode.clusterDesc"),
);

const teamStats = computed(() => {
  if (activeTab.value === "direct") {
    return [
      { label: t("myNode.effectiveNodeDirectCount"), value: effectiveNodeDirectCount.value },
      { label: t("myNode.effectiveStakingDirectCount"), value: effectiveStakingDirectCount.value },
      { label: t("myNode.directIneffectiveCount"), value: ineffectiveCount.value },
    ];
  }

  return [
    { label: t("myNode.effectiveNodeTeamCount"), value: effectiveNodeTeamCount.value },
    { label: t("myNode.effectiveStakingTeamCount"), value: effectiveStakingTeamCount.value },
    { label: t("myNode.teamIneffectiveCount"), value: ineffectiveCount.value },
  ];
});

const getTeamBadgeText = (item) => {
  if (item?.nodeTag) return item.nodeTag;
  return activeTab.value === "direct" ? nodeTypeMap.T1.nodeTag : t("myNode.teamAddress");
};

function showInfo() {
  detailsRef.value?.refresh();
}

// 领取收益
const confirmClaim = async () => {
  // 1. 输入校验
  const inputVal = String(claimInputAmount.value).replace(/,/g, '');
  const numValue = parseFloat(inputVal);

  if (isNaN(numValue) || numValue <= 0) {
    Message.warning(t("common.enterValidAmount"));
    return;
  }
  if (numValue > totalAvailableAmount.value) {
    Message.warning(t("myNode.inputExceed"));
    return;
  }

  if (claimLoading.value) return;
  if (!address.value) {
    Message.error(t("myNode.connectWalletFirst"));
    return;
  }

  claimLoading.value = true;
  try {
    // 2. 检查并切换网络
    if (Number(chainId.value) !== BSC_CHAIN_ID) {
      await switchChain(config, { chainId: BSC_CHAIN_ID });
      await new Promise((r) => setTimeout(r, 500));
    }

    const bscNet = networks.find((n) => Number(n.chainId) === BSC_CHAIN_ID);

    // 3. 精度转换 (使用 Math.floor 配合 Number 确保整数，最后转 BigInt)
    const finalRawAmount = BigInt(Math.floor(numValue * 1e6));

    // 4. 调用合约
    const result = await writeContractOptimized({
      abi: nodeManagerABI,
      address: bscNet.proxyNodeManager,
      functionName: 'claimReward',
      args: [finalRawAmount],
      userAddress: address.value,
      showErrorToast: false, // 设为 false，由我们在下面统一拦截处理提示
    });

    // 5. 成功处理
    if (result && result.success && typeof result.hash === 'string') {
      // 通知后端
      await nodeclaimReward({
        raw_amount_token: String(finalRawAmount),
        request_tx_hash: result.hash,
        user_address: address.value,
      });

      Message.success(t("myNode.claimSuccess"));
      showClaimPopup.value = false; // 只有成功才关闭弹窗
      await init(); // 只有成功才刷新数据
    } else {
      // 处理 writeContractOptimized 返回 success: false 的情况
      handleClaimError(result?.message || result?.error || "");
    }

  } catch (error) {
    // 6. 核心：捕获并拦截合约抛出的业务异常
    console.error("领取过程发生异常:", error);
    handleClaimError(error);
  } finally {
    claimLoading.value = false;
    // 注意：不要在 finally 里关闭弹窗和执行 init，除非你希望无论成败都强制重置页面
  }
};

/**
 * 提取并显示友好的错误信息
 */
const handleClaimError = (err) => {
  const errStr = String(err?.message || err?.details || err || "").toLowerCase();

  if (errStr.includes("price is too low")) {
    Message.error(t('myNode.priceTooLow'));
  } else if (errStr.includes("user rejected")) {
    Message.warning(t("myNode.claimCancelled"));
  } else if (errStr.includes("insufficient funds")) {
    Message.error(t('myNode.insufficientBnb'));
  } else {
    Message.error(t("myNode.claimFailed"));
  }
};

// 我的团队相关数据（直推=direct，团队=team）
const activeTab = ref("direct");

// 团队网络列表（给 TeamTree 初次渲染使用）
const teamNetworkList = ref([]);
// 直推网络列表（给 TeamTree 初次渲染使用）
const directNetworkList = ref([]);

// 有效直推数
const effectiveCount = ref(0);
// 有效节点直推人数
const effectiveNodeDirectCount = ref(0);
// 有效质押直推人数
const effectiveStakingDirectCount = ref(0);
// 有效节点团队人数
const effectiveNodeTeamCount = ref(0);
// 有效质押团队人数
const effectiveStakingTeamCount = ref(0);

// 无效直推数
const ineffectiveCount = ref(0);
// 邀请列表
const inviteList = ref([]);

// 地址截取：前6位 + ... + 后4位
const shortAddress = (addr) => {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// 随机头像数组
const avatarImages = [
  avatarImg1,
  avatarImg2,
  avatarImg3,
  avatarImg4,
  avatarImg5,
];

// 随机选择头像（基于地址的稳定随机）
const getRandomAvatar = (addr) => {
  if (!addr) return avatarImg;
  let hash = 0;
  for (let i = 0; i < addr.length; i++) {
    hash = (hash << 5) - hash + addr.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % avatarImages.length;
  return avatarImages[index];
};

// 邀请人列表头像加载失败兜底
const handleInviterAvatarError = (e) => {
  const imgEl = e?.target;
  if (!imgEl) return;
  imgEl.onerror = null;
  imgEl.src = lp1Img;
};

// 格式化金额（CHO为6精度，需要先转换）
const formatAmount = (value) => {
  return String(formatChoAmount(value, { maxFractionDigits: 4, useGrouping: true }))
};
// USDT 金额（18 精度）
const formatUsdtAmount = (value) => {
  return formatTokenAmount(value, {
    decimals: 18,
    maxFractionDigits: 2,
    useGrouping: true,
  });
};

// 获取邀请列表：直推为 type=1，团队为 type=2
const getMyTeamInfoList = async () => {
  const type = activeTab.value === "direct" ? 1 : 2;
  const res = await getMyTeamInfo({
    address: address.value,
    type,
    nodeType: 2,
  });
  const data = res?.data?.data;
  // 给 TeamTree 使用的网络列表（接口原始字段）
  teamNetworkList.value = data?.team_network_list || [];
  directNetworkList.value = data?.direct_network_list || [];
  // data.direct_effective_count为直推有效数，data.direct_ineffective_count为直推无效数
  // data.team_effective_count为团队有效数，data.team_ineffective_count为团队无效数
  effectiveCount.value =
    (activeTab.value === "direct"
      ? data.direct_effective_count
      : data.team_effective_count) ?? 0;
  ineffectiveCount.value =
    (activeTab.value === "direct"
      ? data.direct_ineffective_count
      : data.team_ineffective_count) ?? 0;
  effectiveNodeDirectCount.value = data.direct_effective_node_count ?? 0;
  effectiveStakingDirectCount.value = data.direct_effective_staking_count ?? 0;
  effectiveNodeTeamCount.value = data.team_effective_node_count ?? 0;
  effectiveStakingTeamCount.value = data.team_effective_staking_count ?? 0;
  const rawList =
    activeTab.value === "direct" ? data.direct_team_list : data.team_list;
  // 映射接口数据到模板需要的格式：
  // address(截取), created(时间戳) -> activationTime, total_reward -> reward, parent_address -> 上级地址
  inviteList.value = (rawList || []).map((item) => ({
    address: shortAddress(item.address),
    activationTime: formatDateTime(item.created),
    reward: formatAmount(item.total_reward),
    avatar: getRandomAvatar(item.address), // 使用基于地址的稳定随机头像
    // 接口字段 parent_address 为上级地址
    upline: shortAddress(item.parent_address || item.address),
  }));
};

// 根据当前tab显示对应的列表
const currentList = computed(() => inviteList.value || []);

// 监听 tab 切换，重新请求对应的邀请列表（直推/团队）
watch(activeTab, () => {
  getMyTeamInfoList();
});

// 处理中按钮文案国际化：如果没有配置 common.loading，则回退为中文"处理中..."
const loadingText = computed(() => {
  const v = t("common.loading");
  return v === "common.loading" ? "领取中..." : v;
});

const goToClaimRecord = () => {
  router.push({
    path: "/claim-record",
    query: {
      type: 2,
    },
  });
};
// 进度百分比：保留两位小数（截断，不四舍五入）
const formatProgressPercent = (value) => {
  const num = Number(value) || 0;
  // 先放大 100 倍取整，再缩小，达到“截断两位小数”的效果
  const truncated = Math.trunc(num * 100) / 100;
  return String(truncated);
};

const progressBarRef = ref(null);

async function init() {
  await getNodeServiceProvidersInfo({
    id: String(route.query.id || ""),
    address: address.value,
  })
    .then((res) => {
      const data = res?.data?.data?.provider_info || {};
      choIncome.value = data.total_reward ?? "0";
      subCoinIncome.value = data.son_coin_reward ?? "0";
      projectedReturns.value = data.total_prediction_reward ?? "0"; // 个人预测收益
      cho2usdt_rate.value = data.cho2usdt_rate ?? 0;
      nodeIncome.value = data.node_reward ?? "0";
      networkFeeIncome.value = data.fee_reward ?? "0";
      subCoinFeeIncome.value = data.sub_coin_service_reward ?? "0";
      secondaryMarketIncome.value = data.market_reward ?? "0";
      directReferralIncome.value = data.direct_reward ?? "0";
      teamIncome.value = data.team_reward ?? "0";
      nodeType.value = Number(data.node_type ?? 0);
      purchaseTime.value = data.created ?? 0;
      directed_number.value = data.directed_number ?? 0;
      target_direct_number.value = data.target_direct_number ?? 0;
      forecast_income.value = data.forecast_income ?? "0"; // 预测收益
      total_reward_usdt.value = Number(data.produced_income) > Number(data.forecast_income) ? data.forecast_income : data.produced_income ?? "0"; // 节点总收益（USDT）
      progressPercent.value = formatProgressPercent(
        (1 -
          (Number(data.produced_income) / Number(data.forecast_income))) *
        100,
      );

    })
    .catch((err) => {
      console.error("获取节点收益详情失败：", err);
    });

  // 获取邀请列表
  if (address.value) {
    getMyTeamInfoList();
  }
}
// 初始化主题
onMounted(async () => {
  themeStore.applyTheme();
  // CHO收益：total_reward
  // 子币收益：son_coin_reward
  // 全网手续费买卖收益：fee_reward
  // 子币手续费收益：sub_coin_service_reward
  // 二级市场盈利收益：market_reward
  // 直推收益：direct_reward
  // 团队收益：team_reward
  // 节点收益：node_reward
  // node_type: 0 = 分布节点, 1 = 集群节点
  init();
});
</script>

<style scoped lang="scss">
.theme-light {
  .claim-all-btn {
    transition:
      opacity 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .claim-all-btn:disabled {
    opacity: 0.9;
    background-color: #6b6b6b !important;
    color: #d0d0d0 !important;
    cursor: not-allowed;
  }

  .avatar-content {
    border: 2px solid #2b6c18 !important;
  }
}

/* 暗色主题下使用深色背景图 */
.theme-dark .cps-bg {
  background-image: url("@/assets/icon/cpsBgDark.png") !important;
}

.theme-dark {
  .claim-all-btn {
    transition:
      opacity 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .claim-all-btn:disabled {
    opacity: 0.9;
    background-color: #6b6b6b !important;
    color: #d0d0d0 !important;
    cursor: not-allowed;
  }
}

.myNode {
  min-height: 100vh;
  padding: 20px 10px 0 10px;
  color: var(--text-color, #1a1a1a);
  background-color: var(--bg-page-h5, #ffffff);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;

  .cps-bg {
    position: absolute;
    top: 0;
    left: 0;
    background: url("@/assets/icon/cpsBg.png") no-repeat;
    background-size: 100% 100%;
    pointer-events: none;
    width: 100%;
    min-height: 230px;
    z-index: 1;
  }

  .banner1 {
    background: transparent;
    flex-direction: column;
    display: flex;
    height: auto;
    justify-content: space-between;
    padding-top: 60px; // 为 fixed 的 BackHeaderNav 预留空间
    margin-bottom: 22px;

    .banner-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;

      .status-text,
      .time-text {
        font-family:
          PingFang SC,
          PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: var(--bg-opposite, #ffffff);
        opacity: 0.8;
        margin: 0;
      }

      .status-text {
        span.activated {
          color: var(--text-color-y, #bbff2e);
          opacity: 1;
        }
      }
    }

    .page-desc {
      font-size: 14px;
      color: var(--bg-opposite, #ffffff);
      line-height: 24px;
      margin: 10px 0;
    }
  }

  .currey {
    font-size: 12px;
    color: var(--text-color-secondary, #999);
  }

  .page-title {
    font-family:
      Noto Sans SC,
      Noto Sans SC;
    font-weight: bold;
    font-size: 28px;
    color: var(--bg-opposite, #1a1a1a);

    transition: color 0.3s ease;
    z-index: 999;
  }

  .income {
    margin-bottom: 38px;
    position: relative;
    z-index: 999;

    .box {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 46px;

      .item {
        flex: 1;
        display: flex;
        flex-direction: column;
        transition:
          background-color 0.3s ease,
          transform 0.2s ease;

        b {
          font-family:
            PingFang SC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: var(--text-color-tabBtn, #999999);
          margin-bottom: 8px;
        }

        p {
          font-family: DIN, DIN;
          font-weight: bold;
          font-size: 24px;
          color: var(--text-color, #1a1a1a);
          transition: color 0.3s ease;
        }


      }
    }



    .earn-prompt {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-light, #f5f5f5);
      border-radius: 999px;
      margin-bottom: 32px;
      transition: all 0.3s ease;

      .earn-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--text-color-y, #bbff2e);
        border-radius: 4px;
        color: #000000;
        flex-shrink: 0;
      }

      .earn-text {
        font-size: 14px;
        color: var(--text-color, #1a1a1a);
        flex: 1;
        transition: color 0.3s ease;

        .earn-amount {
          color: var(--text-color-y, #bbff2e);
          font-weight: 600;
        }
      }
    }

    .processDiv {
      margin-bottom: 24px;
      margin-top: 30px;

      .progress-bar-container {
        position: relative;
        width: 100%;
      }

      .progress-bar {
        position: relative;
        width: 100%;
        height: 12px;
        background-color: #e0e0e0;
        border-radius: 10px;
        overflow: visible;
      }

      .progress-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: linear-gradient(270deg,
            #bbff2e 0%,
            #31d908 100%) !important;
        border-radius: 10px;
        transition: width 0.3s ease;
      }

      .progress-indicator {
        position: absolute;
        top: -25px;
        width: max-content;

        // left: 40%;
        padding: 2px 8px 7px;
        background: url("@/assets/icon/process-price-bg.png") no-repeat;
        background-size: 100% 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        font-family:
          PingFang SC,
          PingFang SC;
        font-weight: 500;
        font-size: 10px;
        color: #ffffff;

        .indicator-text {
          font-family:
            PingFang SC,
            PingFang SC;
          font-weight: 500;
          font-size: 10px;
          color: #bbff2e;
          // line-height: 20px;
        }
      }

      .progress-indicator-left {
        background: url("@/assets/icon/process-price-bg-left.png") no-repeat !important;
        background-size: 100% 100% !important;
      }

      .progress-indicator-right {
        background: url("@/assets/icon/process-price-bg-right.png") no-repeat !important;
        background-size: 100% 100% !important;
      }

      .text {
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
        align-content: center;
        font-weight: 600;
        font-size: 12px;
        color: var(--text-dark-gray, #999999);
        transition: color 0.3s ease;
      }
    }

    .pending-income-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 16px 0 8px;

      .pending-title {
        font-family:
          PingFang SC,
          PingFang SC;
        font-weight: 600;
        font-size: 20px;
        display: flex;
        align-items: center;
        gap: 5px;
        color: var(--text-color, #1a1a1a);
        transition: color 0.3s ease;
      }

      .record-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: none;
        background: transparent;
        padding: 0;
        font-family:
          PingFang SC,
          PingFang SC;
        font-size: 14px;
        color: var(--text-color, #1a1a1a);
        cursor: pointer;
      }

      .record-arrow {
        font-size: 14px;
        color: inherit; // 继承文字颜色，适配明暗主题
      }
    }

    .pending-income-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 13px;

      .income-item {
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;

        .income-label {
          font-family:
            PingFang SC,
            PingFang SC;
          font-weight: 400;
          font-size: 11px;
          color: #999999;
          margin-bottom: 6px;
        }

        .income-value {
          font-family: DIN, DIN;
          font-weight: bold;
          font-size: 18px;
          color: var(--text-color, #ffffff);
        }
      }
    }

    .claim-all-btn {
      width: 100%;
      height: 56px;
      background: var(--text-color-y, #bbff2e);
      border-radius: 999px;
      border: none;
      outline: none;
      font-weight: 600;
      font-size: 16px;
      color: var(--bg-page-h5, #ffffff);
      margin-top: 20px;
      transition: all 0.3s ease;
    }
  }

  .my-team {
    margin-top: 40px;
    margin-bottom: 38px;
    position: relative;
    z-index: 999;

    .team-header {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 16px;

      .invite-count {
        font-family:
          PingFang SC,
          PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: var(--text-color, #1a1a1a);
        transition: color 0.3s ease;
        margin-right: 15px;

        span {
          font-family:
            PingFang SC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: var(--text-color-tabBtn, #999999);
        }
      }

      .search-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #999999;
        transition: all 0.3s ease;

        &:hover {
          opacity: 0.7;
        }

        svg {
          width: 100%;
          height: 100%;
        }
      }
    }

    .team-tree-placeholder {
      width: 100%;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-color-tabBtn, #999999);
      font-size: 12px;
    }

    .team-content {
      width: 100%;
    }

    .team-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      .tab-btn {
        height: 36px;
        font-family:
          PingFang SC,
          PingFang SC;
        font-weight: 600;
        font-size: 20px;
        color: #909090;

        &.active {
          color: #000000;
        }
      }
    }

    .team-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.3s ease;
      border-radius: 12px;
      border: 1px solid #f3f3f3;

      .team-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;

        .team-avatar {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;

          .avatar-content {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid var(--text-color-y, #bbff2e);

            .avatar-img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border: 1px solid var(--bg-page-h5, #ffffff);
              image-rendering: pixelated;
              box-sizing: border-box;
            }
          }
        }

        .team-info-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;

          .team-info-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            .team-left-info {
              display: flex;
              flex-direction: column;
              gap: 4px;
              flex: 1;

              .team-address-row {
                display: flex;
                align-items: center;
                gap: 8px;

                .team-address {
                  font-family:
                    PingFang SC,
                    PingFang SC;
                  font-weight: 400;
                  font-size: 14px;
                  color: var(--text-color, #1a1a1a);
                  transition: color 0.3s ease;
                }

                .team-node-tag {
                  display: inline-block;
                  padding: 2px 8px;
                  background: rgba(234, 171, 74, 0.1);
                  color: #eaab4a;
                  border-radius: 4px;
                  font-family:
                    PingFang SC,
                    PingFang SC;
                  font-weight: 500;
                  font-size: 12px;
                  line-height: 1.2;
                }
              }

              .team-time-direct {
                .team-time {
                  font-family:
                    PingFang SC,
                    PingFang SC;
                  font-weight: 400;
                  font-size: 12px;
                  color: #999999;
                }
              }
            }

            .team-right-info {
              display: flex;
              align-items: center;

              .team-reward {
                font-family:
                  PingFang SC,
                  PingFang SC;
                font-weight: 500;
                font-size: 14px;
                color: #2ebe69;
              }
            }
          }

          .team-upline-row {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .team-upline-left {
              display: flex;
              align-items: center;
              gap: 4px;

              .team-upline-label {
                font-family:
                  PingFang SC,
                  PingFang SC;
                font-weight: 400;
                font-size: 12px;
                color: #999999;
              }

              .team-upline-address {
                font-family:
                  PingFang SC,
                  PingFang SC;
                font-weight: 400;
                font-size: 12px;
                color: #999999;
              }
            }

            .team-time {
              font-family:
                PingFang SC,
                PingFang SC;
              font-weight: 400;
              font-size: 12px;
              color: #999999;
            }
          }
        }
      }
    }
  }
}

/* 暗色主题特定样式 */
.theme-dark .myNode {
  .earn-prompt {
    .earn-text {
      color: #f4f4f4 !important;
    }
  }

  .pending-income-grid {
    .income-item {
      .income-label {
        color: #999999 !important;
      }

      .income-value {
        color: #ffffff !important;
      }
    }
  }

  .my-team {
    .team-header {
      .invite-count {
        color: #ffffff !important;
      }

      .search-icon {
        color: #999999 !important;
      }
    }

    .team-tabs .tab-btn {
      color: #999999 !important;

      &.active {
        color: #ffffff !important;
      }
    }

    .team-tree-placeholder {
      background: rgba(255, 255, 255, 0.05) !important;
      color: #999999 !important;
    }

    .team-list {
      background: #121212 !important;
      border: none;
      padding: 23px 0;
    }

    .team-item {
      .team-info-content {
        .team-info-row {
          .team-left-info {
            .team-address-row {
              .team-address {
                color: #ffffff !important;
              }
            }

            .team-time-direct {
              .team-time {
                color: #999999 !important;
              }
            }
          }

          .team-right-info {
            .team-reward {
              color: #2ebe69 !important;
            }
          }
        }

        .team-upline-row {
          .team-upline-left {

            .team-upline-label,
            .team-upline-address {
              color: #999999 !important;
            }
          }

          .team-time {
            color: #999999 !important;
          }
        }
      }
    }
  }
}

.myNode {
  min-height: 100vh;
  padding: 88px 20px 40px;
  background: #232932;
  color: #ffffff;
  box-sizing: border-box;
}

.myNode :deep(.cps-card-header) {
  padding: 14px 20px 10px;
  background: #232932 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.myNode :deep(.back-btn),
.myNode :deep(.action-btn--icon-only) {
  color: #ffffff !important;
}

.myNode :deep(.action-btn--icon-only) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.earnings-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}

.hero-copy {
  min-width: 0;
  flex: 1;
}

.hero-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.12;
  color: #ffffff;
}

.hero-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  background: rgba(255, 205, 31, 0.14);
  color: #f4c94c;
  font-size: 13px;
  font-weight: 600;
}

.hero-meta {
  margin: 16px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: #9097a4;
}

.hero-illustration {
  width: 104px;
  max-width: 30vw;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.earnings-section + .earnings-section,
.earnings-section + .team-section {
  margin-top: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.section-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.12;
  color: #ffffff;
}

.record-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: #ffffff;
}

.record-text {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.record-arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.earnings-card,
.team-list-card {
  border-radius: 24px;
  background: #303845;
  padding: 20px 18px;
  box-sizing: border-box;
}

.earnings-card--spacious {
  padding-bottom: 16px;
}

.summary-grid,
.pending-grid {
  display: grid;
  gap: 22px 16px;
}

.summary-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pending-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-item,
.pending-item {
  min-width: 0;
}

.summary-label,
.pending-label {
  font-size: 11px;
  line-height: 1.3;
  color: #9097a4;
}

.summary-value,
.pending-value {
  margin-top: 7px;
  font-size: 20px;
  line-height: 1.1;
  font-weight: 700;
  color: #ffffff;
  word-break: break-word;
}

.pending-value--muted {
  color: #d8dbe1;
}

.summary-approx,
.pending-approx {
  margin-top: 5px;
  font-size: 11px;
  line-height: 1.35;
  color: #9097a4;
}

.progress-block {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.progress-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.progress-remaining {
  font-size: 12px;
  color: #ffffff;
}

.progress-remaining span {
  color: #ffd33d;
}

.progress-bar {
  position: relative;
  height: 14px;
  margin-top: 16px;
  border-radius: 999px;
  background: #7d8593;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: linear-gradient(90deg, #ffd33d 0%, #ffcc1f 100%);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
}

.progress-scale {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: #9097a4;
}

.claim-all-btn {
  width: 100%;
  margin-top: 20px;
}

.earnings-footnote {
  margin: 12px 4px 0;
  font-size: 11px;
  line-height: 1.55;
  color: #9097a4;
}

.team-section {
  margin-top: 28px;
}

.team-tabs {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.team-tab {
  position: relative;
  padding: 0 0 8px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 700;
  color: #808793;
}

.team-tab.active {
  color: #ffffff;
}

.team-tab.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -11px;
  width: 28px;
  height: 4px;
  border-radius: 999px;
  background: #ffd33d;
}

.team-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 14px 0 16px;
}

.team-stat-label {
  font-size: 11px;
  line-height: 1.4;
  color: #9097a4;
}

.team-stat-value {
  margin-top: 8px;
  font-size: 18px;
  line-height: 1.1;
  font-weight: 700;
  color: #ffffff;
}

.team-list-card {
  padding-top: 14px;
  padding-bottom: 14px;
}

.team-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.team-row + .team-row {
  margin-top: 18px;
}

.team-avatar {
  flex-shrink: 0;
}

.avatar-content {
  width: 44px;
  height: 44px;
  overflow: hidden;
  border-radius: 50%;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.team-main {
  min-width: 0;
  flex: 1;
}

.team-main-top,
.team-main-bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.team-main-bottom {
  margin-top: 8px;
}

.team-identity {
  min-width: 0;
  flex: 1;
}

.team-address {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;
  word-break: break-all;
}

.team-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  margin-top: 8px;
  padding: 0 9px;
  border-radius: 8px;
  background: rgba(255, 205, 31, 0.14);
  color: #f4c94c;
  font-size: 13px;
  font-weight: 600;
}

.team-reward {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  color: #29c98a;
  text-align: right;
}

.team-time,
.team-upline {
  font-size: 11px;
  line-height: 1.4;
  color: #9097a4;
}

.team-upline {
  display: flex;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

@media (max-width: 375px) {
  .myNode {
    padding-left: 16px;
    padding-right: 16px;
  }

  .hero-title,
  .section-title {
    font-size: 21px;
  }

  .summary-value,
  .pending-value,
  .team-stat-value {
    font-size: 18px;
  }

  .team-address,
  .team-reward {
    font-size: 15px;
  }
}

/* 弹窗遮罩 */
.claim-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  /* 底部对齐 */
}

/* 弹窗内容 */
.claim-modal-content {
  width: 100%;
  background: var(--bg-page-h5, #fff);
  border-radius: 20px 20px 0 0;
  padding: 24px 20px;
  animation: slideUp 0.3s ease-out;
  box-sizing: border-box;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .node-name-label {
      font-size: 18px;
      font-weight: bold;
      color: var(--text-color);
    }

    .close-icon {
      font-size: 20px;
      color: #999;
      cursor: pointer;
    }
  }

  .input-wrapper {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 54px;
    background: var(--bg-light, #f5f5f5);
    border-radius: 12px;
    margin-bottom: 8px;
    width: 100%;

    .claim-input {
      border: none;
      outline: none;
      background: transparent;
      font-size: 20px;
      font-weight: bold;
      color: var(--text-color);
      width: 100%;
    }

    .max-btn {
      font-size: 12px;
      font-weight: bold;
      color: var(--text-color-y);
      background: rgba(187, 255, 46, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      margin-right: 8px;
      box-sizing: border-box;

    }

    .unit {
      font-weight: bold;
    }
  }

  .available-tip {
    font-size: 13px;
    color: #999;
    margin-bottom: 16px;

    span {
      color: var(--text-color);
      font-weight: 500;
    }
  }

  .claim-summary-info {
    margin: 20px 0 30px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 16px;

      .label {
        color: #999;

        &.dashed-underline {
          border-bottom: 1px dashed #666;
          padding-bottom: 2px;
        }
      }

      .value {
        font-weight: bold;
        color: var(--text-color);

        &.highlighted {
          color: #bbff2e !important;
          font-size: 20px;
        }
      }
    }
  }

  .confirm-claim-btn {
    width: 100%;

    &:disabled {
      opacity: 0.6;
    }
  }
}


@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}


/* 暗色模式适配 */
.theme-dark {
  .max-btn {
    background: rgba(187, 255, 46, 0.15);
    color: var(--text-color-y, #bbff2e);
  }

  .claim-summary-info .value {
    color: #ffffff;
  }

  .claim-modal-content {
    background: #1a1a1a;

    .input-wrapper {
      background: #2a2a2a;
    }

    .confirm-claim-btn {
      color: #000;
      /* 确认按钮在暗色模式下通常保持亮色背景，黑字比较清晰 */
    }
  }
}

.theme-light {
  .claim-summary-info .value {
    color: #1a1a1a;
  }
}
</style>
