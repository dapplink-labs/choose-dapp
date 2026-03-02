import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";

import bridge from "../views/bridge/index.vue"
import home from "../views/home/index.vue"
import earnings from "../views/earnings/index.vue"
import myEarnings from "../views/myEarnings/index.vue"
import leaderboard from "../views/leaderboard/index.vue"
import leaderboardH5 from "../views/leaderboardH5/index.vue"
import detail from "../views/detail/index.vue"
import breaking from "../views/breaking/index.vue"
import accuracy from "../views/accuracy/index.vue"
import settings from "../views/settings/index.vue"
import personalCenter from "../views/personalCenter/index.vue"
import linkWallet from "../views/linkWallet/index.vue"
import computingPowerServices from "../views/computingPowerServices/index.vue"
import myNode from "../views/myNode/index.vue"
import myIncome from "../views/myIncome/index.vue"
import LPVault from "../views/LPVault/index.vue"
import dashboard from "../views/dashboard/index.vue"
import detailH5 from "../views/detailH5/index.vue"
import predictionDetailH5 from "../views/predictionDetailH5/index.vue"
import purchaseNodeRecord from "../views/purchaseNodeRecord/index.vue"
import assetManagement from "../views/assetManagement/index.vue"
import deposit from "../views/deposit/index.vue"
import withdraw from "../views/withdraw/index.vue"
import transactionSuccess from "../views/transactionSuccess/index.vue"
import claimRecord from "../views/claimRecord/index.vue"
import searchPage from "../views/searchPage/index.vue"
import userInfo from "../views/userInfo/index.vue"
import eventPool from "../views/eventPool/index.vue"
import bill from "../views/bill/index.vue"
import helpCenter from "../views/helpCenter/index.vue"
import sportsEventsH5 from "../views/sportsEventsH5/index.vue"
import sportsDetailH5 from "../views/sportsDetailH5/index.vue"
import bitcoinUpDown from "../views/bitcoinUpDown/index.vue"
import messages from "../views/messages/index.vue"
import feedback from "../views/feedback/index.vue"


import claimEarnings from "../views/myIncome/claimEarnings.vue"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "linkWallet",
      component: linkWallet,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/event-pool",
      name: "eventPool",
      component: eventPool,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/home",
      name: "home",
      component: home,
      meta: {
        // hideHeader: true,
        // hideFooterNav: true,
      },
    },
    {
      path: "/bridge",
      name: "bridge",
      component: bridge,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/earnings",
      name: "earnings",
      component: earnings,
    },
    {
      path: "/my-earnings",
      name: "myEarnings",
      component: myEarnings,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/leaderboard",
      name: "leaderboard",
      component: leaderboardH5,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/leaderboard-pc",
      name: "leaderboardPC",
      component: leaderboard,
    },
    {
      path: "/detail",
      name: "detail",
      component: detail,
    },
    {
      path: "/detail-h5",
      name: "detailH5",
      component: detailH5,
      meta: {
        hideFooterNav: true
      }
    },
    {
      path: "/prediction-detail-h5",
      name: "predictionDetailH5",
      component: predictionDetailH5,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: '/bitcoin-up-down',
      name: 'bitcoinUpDown',
      component: bitcoinUpDown,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/bitcoin-up-down',
      name: 'bitcoinUpDown',
      component: bitcoinUpDown,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: "/breaking",
      name: "breaking",
      component: breaking,
    },
    {
      path: "/messages",
      name: "messages",
      component: messages,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/accuracy",
      name: "accuracy",
      component: accuracy,
    },
    {
      path: "/settings",
      name: "settings",
      component: settings,
    },
    {
      path: "/userInfo",
      name: "userInfo",
      component: userInfo,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/leaderboardH5",
      name: "leaderboardH5",
      component: leaderboardH5,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/computing-power-services",
      name: "computingPowerServices",
      component: computingPowerServices,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/personal-center",
      name: "personalCenter",
      component: personalCenter,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/myNode",
      name: "myNode",
      component: myNode,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/myIncome",
      name: "myIncome",
      component: myIncome,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/myIncome/claim",
      name: "claimEarnings",
      component: claimEarnings,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/LPVault",
      name: "LPVault",
      component: LPVault,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/purchase-node-record",
      name: "purchaseNodeRecord",
      component: purchaseNodeRecord,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: dashboard,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/asset-management",
      name: "assetManagement",
      component: assetManagement,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: '/deposit',
      name: 'deposit',
      component: deposit,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/withdraw',
      name: 'withdraw',
      component: withdraw,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/transaction-success',
      name: 'transactionSuccess',
      component: transactionSuccess,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/withdraw-success',
      redirect: (to) => ({ path: '/transaction-success', query: to.query })
    },
    {
      path: '/claim-record',
      name: 'claimRecord',
      component: claimRecord,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/bill',
      name: 'bill',
      component: bill,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/searchPage',
      name: 'searchPage',
      component: searchPage,
      meta: {
        hideHeader: true,
        hideFooterNav: false,
      },
    },
    {
      path: "/help-center",
      name: "helpCenter",
      component: helpCenter,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/sports-events-h5",
      name: "sportsEventsH5",
      component: sportsEventsH5,
      meta: {
        hideFooterNav: true,
      },
    },
    {
      path: "/sports-detail-h5",
      name: "sportsDetailH5",
      component: sportsDetailH5,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/feedback-list",
      name: "feedbackList",
      component: () => import("../views/feedback/list.vue"),
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
    {
      path: "/feedback",
      name: "feedback",
      component: feedback,
      meta: {
        hideHeader: true,
        hideFooterNav: true,
      },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

/* ================== 路由守卫 ================== */

// 钱包是否已连接（先用 localStorage，后面可换 wagmi / pinia）
function isWalletConnected() {
  return !!localStorage.getItem("address");
}

router.beforeEach((to) => {
  const connected = isWalletConnected();
  // console.log(to)
  // 未连接钱包
  if (!connected) {
    // 只允许进入连接钱包页
    if (to.name === "linkWallet") {
      return true;
    }
    return "/" || `/?inviteCode=${to?.fullPath}`;
  }

  return true;
});

export default router;
