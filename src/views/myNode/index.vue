<template>
  <div class="myNode">
    <BackHeaderNav :show-open-btn="true" />

    <div class="banner1">
      <h1 class="page-title">
        {{
          nodeType === 0
            ? $t("myNode.distributedNode")
            : $t("myNode.clusterNode")
        }}
      </h1>
      <p class="page-desc">
        {{
          nodeType === 0
            ? $t("myNode.distributedDesc")
            : $t("myNode.clusterDesc")
        }}
      </p>
      <div class="banner-info">
        <p class="status-text">
          {{ $t("myNode.networkFeeDividend") }}:
          <span :class="{ 'activated': isActivated }">{{
            isActivated ? $t("myNode.activated") : $t("myNode.notActivated")
          }}</span>
        </p>
        <p class="time-text">
          {{ $t("myIncome.purchaseTime") }}:
          {{ formatDateTime(purchaseTime || 0) }}
        </p>
      </div>
    </div>
    <div class="cps-bg"></div>

    <div class="income">
      <div class="box">
        <div class="item">
          <b>{{ $t("myNode.choIncome") }}</b>
          <p>{{ formatAmount(choIncome) }}</p>
          <span class="currey">≈{{ formatAmount(choIncome * cho2usdt_rate) }} USDT</span>
        </div>
        <div class="item">
          <b>{{ $t("myNode.projectedReturns") }}</b>
          <p>{{ formatAmount(projectedReturns) }}</p>
          <span class="currey">≈{{ formatAmount(projectedReturns * cho2usdt_rate) }} USDT</span>
        </div>
      </div>

      <!-- <ActivationMarquee :type="3" /> -->
      <div class="processDiv">
        <div class="progress-bar-container">
          <div class="progress-bar" ref="progressBarRef">
            <div class="progress-fill" :style="{
              width:
                (progressPercent || 0) < 4 ? 4 + '%' : progressPercent + '%',
            }"></div>
            <div class="progress-indicator" ref="progressIndicatorRef" :style="{ left: progressIndicatorLeft }" :class="{
              'progress-indicator-left': (progressPercent || 0) < 20,
              'progress-indicator-right': (progressPercent || 0) >= 90,
            }">
              {{ $t("myIncome.remainingClaimable") }}：
              <span class="indicator-text">{{
                formatUsdtAmount(
                  parseInt(forecast_income) - parseInt(total_reward_usdt),
                )
              }}U</span>
            </div>
          </div>
        </div>
        <div class="text">
          <span>
            {{ formatUsdtAmount(parseInt(total_reward_usdt)) }} USDT
          </span>
          <span> {{ formatUsdtAmount(parseInt(forecast_income)) }} USDT </span>
        </div>
      </div>
      <div class="pending-income-header">
        <h3 class="pending-title">
          <span>{{ $t("myNode.pendingIncome") }}</span>

          <el-icon size="16" style="margin-top: 5px" @click="showInfo" :color="'var(--text-color)'">
            <QuestionFilled />
          </el-icon>
        </h3>
        <button class="record-link" type="button" @click="goToClaimRecord">
          <span class="record-text">{{ $t("myNode.claimRecord") }}</span>
          <el-icon class="record-arrow">
            <ArrowRightBold />
          </el-icon>
        </button>
      </div>

      <div class="pending-income-grid">
        <div class="income-item">
          <div class="income-label">{{ $t("myNode.nodeIncome") }}</div>
          <div class="income-value">{{ formatAmount(nodeIncome) }}</div>
          <span class="currey">≈{{ formatAmount(nodeIncome * cho2usdt_rate) }} USDT</span>
        </div>
        <div class="income-item">
          <div class="income-label">{{ $t("myNode.networkFeeIncome") }}</div>
          <div class="income-value">{{ formatAmount(networkFeeIncome) }}</div>
          <span class="currey">≈{{ formatAmount(networkFeeIncome * cho2usdt_rate) }} USDT</span>
        </div>
        <div class="income-item">
          <div class="income-label">{{ $t("myNode.subCoinFeeIncome") }}</div>
          <div class="income-value">{{ formatAmount(subCoinFeeIncome) }}</div>
          <span class="currey">≈{{ formatAmount(subCoinFeeIncome * cho2usdt_rate) }} USDT</span>
        </div>
        <div class="income-item">
          <div class="income-label">
            {{ $t("myNode.secondaryMarketIncome") }}
          </div>
          <div class="income-value">
            {{ formatAmount(secondaryMarketIncome) }}
          </div>
          <span class="currey">≈{{ formatAmount(secondaryMarketIncome * cho2usdt_rate) }} USDT</span>
        </div>
        <div class="income-item">
          <div class="income-label">
            {{ $t("myNode.directReferralIncome") }}
          </div>
          <div class="income-value">
            {{ formatAmount(directReferralIncome) }}
          </div>
          <span class="currey">≈{{ formatAmount(directReferralIncome * cho2usdt_rate) }} USDT</span>
        </div>
        <div class="income-item">
          <div class="income-label">{{ $t("myNode.networkIncome") }}</div>
          <div class="income-value">{{ formatAmount(teamIncome) }}</div>
          <span class="currey">≈{{ formatAmount(teamIncome * cho2usdt_rate) }} USDT</span>
        </div>
      </div>

      <!-- 一键领取按钮：凌晨 2-3 点禁止领取，显示“收益计算中” -->
      <button class="claim-all-btn" :disabled="isClaimDisabledByTime" @click="openClaimPopup">
        {{ isClaimDisabledByTime ? $t("myIncome.calculating") : $t("myNode.claimAll") }}
      </button>
    </div>

    <!-- 我的团队模块 -->
    <div class="my-team">
      <div class="team-content">
        <div class="team-tabs">
          <div :class="['tab-btn', { active: activeTab === 'direct' }]" @click="activeTab = 'direct'">
            {{ $t("myNode.directAddress") }}
          </div>
          <div :class="['tab-btn', { active: activeTab === 'team' }]" @click="activeTab = 'team'">
            {{ $t("myNode.teamAddress") }}
          </div>
        </div>

        <div class="team-header">
          <template v-if="activeTab === 'direct'">
            <span class="invite-count">
              <span>{{
                $t("myNode.effectiveNodeDirectCount")
              }}</span>
              {{ effectiveNodeDirectCount }}
            </span>
            <span class="invite-count">
              <span>{{
                $t("myNode.effectiveStakingDirectCount")
              }}</span>
              {{ effectiveStakingDirectCount }}
            </span>
            <span class="invite-count">
              <span>{{
                $t("myNode.directIneffectiveCount")
              }}</span>
              {{ ineffectiveCount }}
            </span>
          </template>
          <template v-else>
            <span class="invite-count">
              <span>{{
                $t("myNode.effectiveNodeTeamCount")
              }}</span>
              {{ effectiveNodeTeamCount }}
            </span>
            <span class="invite-count">
              <span>{{
                $t("myNode.effectiveStakingTeamCount")
              }}</span>
              {{ effectiveStakingTeamCount }}
            </span>
            <span class="invite-count">
              <span>{{
                $t("myNode.teamIneffectiveCount")
              }}</span>
              {{ ineffectiveCount }}
            </span>
          </template>

        </div>

        <!-- 层级树状图占位 -->
        <div class="team-tree-placeholder">
          <TeamTree :type="activeTab === 'direct' ? 1 : 2" :node_type="2" :team_network_list="teamNetworkList"
            :direct_network_list="directNetworkList" />
        </div>

        <div class="team-list" v-if="currentList.length > 0">
          <div v-for="item in currentList" :key="item.address" class="team-item">
            <div class="team-avatar">
              <div class="avatar-content">
                <img :src="item.avatar || avatarImg" alt="avatar" class="avatar-img"
                  @error="handleInviterAvatarError" />
              </div>
            </div>
            <div class="team-info-content">
              <div class="team-info-row">
                <div class="team-left-info">
                  <div class="team-address-row">
                    <span class="team-address">{{ item.address }}</span>
                    <span v-if="item.nodeTag" class="team-node-tag">{{
                      item.nodeTag
                    }}</span>
                  </div>
                  <!-- 直推地址列表：时间在地址下面 -->
                  <div v-if="activeTab === 'direct'" class="team-time-direct">
                    <span class="team-time">{{ item.activationTime }}</span>
                  </div>
                </div>
                <div class="team-right-info">
                  <span class="team-reward">+ {{ item.reward || "0" }} CHO</span>
                </div>
              </div>
              <!-- 团队地址列表：显示Upline和时间 -->
              <div v-if="activeTab === 'team'" class="team-upline-row">
                <div class="team-upline-left">
                  <span class="team-upline-label">{{ $t("myIncome.upline") }}:</span>
                  <span class="team-upline-address">{{
                    item.upline || item.address
                  }}</span>
                </div>
                <span class="team-time">{{ item.activationTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <detailsinfo ref="detailsRef" />

    <div v-if="showClaimPopup" class="claim-modal-mask" @click="showClaimPopup = false">
      <div class="claim-modal-content" @click.stop>
        <div class="modal-header">
          <span class="node-name-label"> {{
            nodeType === 0
              ? $t("myNode.distributedNode")
              : $t("myNode.clusterNode")
          }}</span>
          <el-icon class="close-icon" @click="showClaimPopup = false">
            <Close />
          </el-icon>
        </div>

        <div class="modal-body">
          <div class="input-wrapper">
            <input v-model="claimInputAmount" type="number" :placeholder="$t('myNode.enterClaimAmount')"
              class="claim-input" />
            <span class="max-btn" @click="handleMaxAmount">{{ $t('myNode.maxLabel') }}</span>
            <span class="unit">CHO</span>
          </div>
          <p class="available-tip">
            {{ $t('myNode.pendingIncome') }}: <span>{{ formatAmount(totalAvailableAmount) }} CHO</span>
          </p>

          <!-- 新增信息汇总区域 -->
          <div class="claim-summary-info">
            <div class="summary-row">
              <span class="label">{{ $t('collectEarnings.youWillReceive') }}</span>
              <span class="value highlighted">{{ formatAmount(receive80Amount) }} CHO</span>
            </div>
            <div class="summary-row">
              <span class="label dashed-underline">{{ $t('collectEarnings.predictedAmount') }}</span>
              <span class="value">{{ formatAmount(projected20Amount) }} CHO</span>
            </div>
          </div>
        </div>

        <button class="confirm-claim-btn" :disabled="claimLoading" @click="confirmClaim">
          {{ claimLoading ? t("common.loading") : $t('myNode.confirmClaimBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUpdated, ref, computed, watch, nextTick, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useThemeStore } from "@/stores/theme";
import { useI18n } from "vue-i18n";
import Message from "@/utils/message";
import { useAccount, useChainId } from "@wagmi/vue";
import { switchChain } from "@wagmi/core";
import { config } from "../../wagmi.ts";
import nodeManagerABI from "@/assets/abi/nodeManagerABI.json";
import networks from "@/assets/json/networks.js";
import { writeContractOptimized, computedGas } from "@/utils/requestWEB3.js";
import avatarImg from "@/assets/icon/avatar.png";
import lp1Img from "@/assets/icon/LP1.png";
import TeamTree from "@/components/TeamTree.vue";
import detailsinfo from "./detailsinfo.vue";
import BackHeaderNav from "@/components/BackHeaderNav.vue";
import ActivationMarquee from "@/components/ActivationMarquee.vue";
import { ArrowRightBold } from "@element-plus/icons-vue";
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

const progressIndicatorRef = ref(null);
const progressBarRef = ref(null);


const indicatorWidth = ref(0);
const barWidth = ref(0);

const updateWidths = () => {
  indicatorWidth.value = progressIndicatorRef.value?.offsetWidth || 0;
  barWidth.value = progressBarRef.value?.offsetWidth || 0;
};

onMounted(() => {
  nextTick(updateWidths);
});

onUpdated(updateWidths);

const progressIndicatorLeft = computed(() => {
  const p = Number(progressPercent.value) || 0;
  // Use reactive widths
  const width = indicatorWidth.value;
  const progressBarWidth = barWidth.value;

  if (p <= 20) return `${p}%`;
  if (!progressBarWidth) return `${p}%`;
  if (p >= 90) return `${p - ((width / progressBarWidth) * 100).toFixed(0)}%`;
  return `${p - Math.max(0, (width / progressBarWidth) * 100 / 2).toFixed(0)}%`;
});

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
      total_reward_usdt.value = data.produced_income > data.forecast_income ? data.forecast_income : data.produced_income ?? "0"; // 节点总收益（USDT）
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
    background-color: #2b6c18 !important;
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
    height: 50px;
    border: none;
    border-radius: 25px;
    background: var(--text-color-y);
    font-size: 16px;
    font-weight: bold;
    color: #000;

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
