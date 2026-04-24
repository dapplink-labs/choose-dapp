import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAccount, useChainId } from "@wagmi/vue";
import { readContract, switchChain } from "@wagmi/core";
import { ElLoading } from "element-plus";
import Message from "@/utils/message";
import nodeManagerABI from "@/assets/abi/nodeManagerABI.json";
import networks from "@/assets/json/networks.js";
import nodeIllustration from "@/assets/new_icon/LPVault/lpvault-node-illustration.png";
import {
  checkAllowance,
  approveToken,
  writeContractOptimized,
  getUserTokenBalance,
} from "@/utils/requestWEB3.js";
import { config } from "../../wagmi.ts";
import { getNodeServiceProviders, purchaseNode } from "@/api/API";
import { eventBus } from "@/utils/eventBus";

export function useComputingPowerServices() {
  const router = useRouter();
  const { t } = useI18n();
  const { address } = useAccount();
  const chainId = useChainId();
  // BSC 主网chainId
  const BSC_CHAIN_ID = 56;

  // 节点 TAB 状态（用于弹窗标题）
  // 0: 分布节点, 1: 集群节点（与接口 node_type 对齐）
  const activeNodeTab = ref(0);

  // 节点金额，单位为 wei
  const nodePriceObj = ref({
    DistributedNode: BigInt("0"), // 分布式节点金额
    ClusterNode: BigInt("0"), // 集群节点金额
  });

  // 节点卡片数据
  const nodeProducts = ref([]);
  // 防止重复请求的标志
  const isFetchingNodeProducts = ref(false);

  // 直接使用接口数据，不再使用硬编码的 fallback
  const displayNodes = computed(() => nodeProducts.value);

  const handleOpenMore = () => {
    // 预留「了解更多」跳转逻辑
  };

  const handleMyNodes = () => {
    // 查找 is_active 为 3 的节点（已购买/已激活）
    const activeNode = nodeProducts.value.find((node) => node.is_active === 3);

    if (!activeNode) {
      // 如果没有已激活的节点，则不跳转并提示
      Message.warning(t("common.noData"));
      return;
    }

    // 跳转到 myNode 页面，并传递已激活节点的 id
    router.push({
      path: "/myNode",
      query: {
        id: activeNode.id ?? "",
      },
    });
  };

  const showPurchaseNode = ref(false);
  const showPurchaseSuccess = ref(false);

  const purchaseTitle = computed(() =>
    activeNodeTab.value === 0
      ? t("computingPower.tabs.distributed")
      : t("computingPower.tabs.cluster"),
  );

  const purchasePrice = computed(() => {
    return (
      nodeProducts.value.find((node) => node.type === activeNodeTab.value)
        ?.price || "0"
    );
  });

  // 打开购买节点弹窗
  const handleBuy = (type) => {
    activeNodeTab.value = type;
    showPurchaseNode.value = true;
  };

  const handleClosePurchaseSuccess = () => {
    showPurchaseSuccess.value = false;
  };

  // 获取节点价格
  const getNodePrice = async () => {
    const obj = {
      DistributedNode: 0, // 分布式 500 USDT (18 decimals)
      ClusterNode: 0, // 集群 10000 USDT (18 decimals)
    };

    const bscNet = networks.find((n) => Number(n.chainId) === BSC_CHAIN_ID);
    if (!bscNet?.proxyNodeManager) return obj;
    obj.DistributedNode = await readContract(config, {
      address: bscNet.proxyNodeManager,
      abi: nodeManagerABI,
      functionName: "buyDistributedNode",
    });
    obj.ClusterNode = await readContract(config, {
      address: bscNet.proxyNodeManager,
      abi: nodeManagerABI,
      functionName: "buyClusterNode",
    });
    return obj;
  };

  // 确认购买节点
  const handleConfirmBuy = async () => {
    if (!address.value) {
      Message.error(t("computingPower.connectWalletFirst"));
      return;
    }

    let loading;
    try {
      loading = ElLoading.service({
        lock: true,
        text: t("computingPower.activatingNode"),
        background: "rgba(0, 0, 0, 0.7)",
      });

      // 1. 网络环境检查 (BSC 56)
      if (Number(chainId.value) !== BSC_CHAIN_ID) {
        await switchChain(config, { chainId: BSC_CHAIN_ID });
        await new Promise((r) => setTimeout(r, 1000));
      }

      const bscNet = networks.find((n) => Number(n.chainId) === BSC_CHAIN_ID);
      const { proxyNodeManager, usdtTokenAddress } = bscNet;

      // 检查当前用户是否绑定邀请码
      const inviter = await readContract(config, {
        address: bscNet.proxyNodeManager,
        abi: nodeManagerABI,
        functionName: "inviters",
        args: [address.value],
      });
      if (inviter == "0x0000000000000000000000000000000000000000") {
        Message.error(t("invite.codeRequired"));
        eventBus.emit("showInvite", true);
        return;
      }

      // 2. 确定本次交易需要的金额
      const latest = await getNodePrice();
      let amountBigInt =
        activeNodeTab.value === 0 ? latest.DistributedNode : latest.ClusterNode;
      let nodeId = nodeProducts.value.find(
        (node) => node.type == activeNodeTab.value,
      )?.id;

      // ============ 余额检查 ============
      const userBalance = await getUserTokenBalance(
        usdtTokenAddress,
        address.value,
        "balanceOf",
      );
      console.log("amountBigInt", amountBigInt);
      if (userBalance < amountBigInt) {
        // 如果余额不足，直接报错并停止执行
        Message.error(t("computingPower.insufficientBalance"), {
          duration: 5000,
          showClose: true,
        });
        return;
      }

      // 3. 检查授权 余额充足
      const allowance = await checkAllowance(
        usdtTokenAddress,
        address.value,
        proxyNodeManager,
      );
      if (allowance === BigInt(0) || allowance < amountBigInt) {
        loading.text = t("computingPower.requestingAuth");
        await approveToken({
          tokenAddress: usdtTokenAddress,
          spenderAddress: proxyNodeManager,
          amount: amountBigInt,
          userAddress: address.value,
          BRIDGE_MESSAGES: {
            approvalSuccess: t("bridge.approvalSuccess"),
            userCancelledAuth: t("bridge.userCancelledAuth"),
            approveTokenFailed: t("bridge.approveTokenFailed"),
          },
        });
      }

      // 4. 执行购买
      loading.text = t("computingPower.payingAndActivating");
      const result = await writeContractOptimized({
        abi: nodeManagerABI,
        address: proxyNodeManager,
        functionName: "purchaseNode",
        args: [amountBigInt],
        userAddress: address.value,
        messages: {
          success: t("computingPower.nodeActivationSuccess"),
          failed: t("computingPower.paymentFailed"),
          rejected: t("computingPower.paymentCancelled"),
        },
      });
      console.log("result", result);
      console.log("购买节点参数：", {
        address: address.value,
        node_id: nodeId,
        hash: result.hash,
      });

      // 调用接口记录购买节点
      const res = await purchaseNode({
        address: address.value,
        node_id: nodeId,
        hash: result.hash,
      });

      showPurchaseNode.value = false;
      showPurchaseSuccess.value = true;
      await fetchNodeProducts();
    } catch (error) {
      // 可选：根据错误类型提示
      if (
        error?.code === "ACTION_REJECTED" ||
        error?.message?.includes("user rejected")
      ) {
        Message.info(t("computingPower.paymentCancelled"));
      }
    } finally {
      if (loading) {
        loading.close();
      }
    }
  };

  // 拉取节点数据
  const fetchNodeProducts = async () => {
    // 如果正在请求中，直接返回，避免重复请求
    if (isFetchingNodeProducts.value) {
      return;
    }

    isFetchingNodeProducts.value = true;
    try {
      const res = await getNodeServiceProviders({ address: address.value });

      const responseData = res?.data || res;
      const list = responseData?.data?.list || responseData?.list || [];

      if (!Array.isArray(list) || list.length === 0) {
        nodeProducts.value = [];
        return;
      }
      // 接口返回字段: id, name, fee_reward, sub_coin_reward, market_reward, status 等
      nodeProducts.value = list.map((item) => {
        // node_type: 0: 分布节点, 1: 集群节点（兼容历史 2 也视为集群）
        const rawNodeType = Number(item.node_type);
        const isDistributed = rawNodeType === 0;

        return {
          id: item.id,
          type: rawNodeType, // 0: 分布节点, 1: 集群节点
          icon: nodeIllustration,
          title:
            item.name ||
            (isDistributed
              ? t("computingPower.tabs.distributed")
              : t("computingPower.tabs.cluster")),
          price: item.price || (isDistributed ? "500" : "10000"),
          fee: item.fee_reward || 0,
          subFee: item.sub_coin_reward || 0,
          marketShare: item.market_reward || 0,
          is_active: item.is_active || 1,
          descText: isDistributed
            ? t("computingPower.products.distributedDescTemplate")
            : t("computingPower.products.clusterDescTemplate"),
        };
      });
    } catch (err) {
      Message.error(t("computingPower.fetchNodeDataFailed"));
      nodeProducts.value = [];
    } finally {
      isFetchingNodeProducts.value = false;
    }
    console.log("list：", nodeProducts.value);
  };

  onMounted(async () => {
    fetchNodeProducts();
  });

  // 保留当前选中节点图（弹窗可能复用）
  const currentNodeImg = computed(() => nodeIllustration);

  // 判断单个节点的按钮是否可点击
  // 规则：
  // - is_active === 1：可购买（前提是两条数据都为 1）
  // - is_active === 2/3：置灰不可点
  // - 两条数据任意一条为 2 或 3，则两颗按钮都置灰不可点
  const isNodeButtonEnabled = (nodeType) => {
    const currentNode = nodeProducts.value.find(
      (node) => node.type === nodeType,
    );
    if (!currentNode) return false;

    // 任意节点处于激活中/已购买，则全部按钮都不可点击
    const hasInProgressOrPurchased = nodeProducts.value.some(
      (node) => node.is_active === 2 || node.is_active === 3,
    );
    if (hasInProgressOrPurchased) return false;

    // 两条数据都为 1 且当前节点为 1 才可点击
    if (nodeProducts.value.length >= 2) {
      return (
        currentNode.is_active === 1 &&
        nodeProducts.value.every((node) => node.is_active === 1)
      );
    }

    // 数据不足两条时，保守起见不可点击（避免状态不一致）
    return false;
  };

  // 获取按钮文字
  const getButtonText = (nodeType) => {
    const node = nodeProducts.value.find((n) => n.type === nodeType);
    if (!node) {
      return t("computingPower.buyButton");
    }

    const isActive = node.is_active;
    if (isActive === 1) {
      return t("computingPower.buyNow");
    } else if (isActive === 2) {
      return t("computingPower.activating");
    } else if (isActive === 3) {
      return t("computingPower.purchased");
    }

    return t("computingPower.sellEnd");
  };

  return {
    // 响应式数据
    activeNodeTab,
    nodeProducts,
    displayNodes,
    showPurchaseNode,
    showPurchaseSuccess,
    purchaseTitle,
    purchasePrice,
    currentNodeImg,
    isNodeButtonEnabled,
    getButtonText,
    handleOpenMore,
    handleMyNodes,
    handleBuy,
    handleConfirmBuy,
    handleClosePurchaseSuccess,
  };
}
