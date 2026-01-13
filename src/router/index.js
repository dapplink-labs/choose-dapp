import { createRouter, createWebHistory } from 'vue-router'
import bridge from "../views/bridge/index.vue"
import home from "../views/home/index.vue"
import earnings from "../views/earnings/index.vue"
import leaderboard from "../views/leaderboard/index.vue"
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
import purchaseNodeRecord from "../views/purchaseNodeRecord/index.vue"
import assetManagement from "../views/assetManagement/index.vue"
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: home,
    },
    {
      path: '/bridge',
      name: 'bridge',
      component: bridge,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/earnings',
      name: 'earnings',
      component: earnings,
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: leaderboard,
    },
    {
      path: '/detail',
      name: 'detail',
      component: detail,
    },
    {
      path: '/detail-h5',
      name: 'detailH5',
      component: detailH5,
    },
    {
      path: '/breaking',
      name: 'breaking',
      component: breaking,
    },
    {
      path: '/accuracy',
      name: 'accuracy',
      component: accuracy,
    },
    {
      path: '/settings',
      name: 'settings',
      component: settings,
    },
    {
      path: '/computing-power-services',
      name: 'computingPowerServices',
      component: computingPowerServices,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/link-wallet',
      name: 'linkWallet',
      component: linkWallet,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/personal-center',
      name: 'personalCenter',
      component: personalCenter,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/myNode',
      name: 'myNode',
      component: myNode,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    // myIncome
    {
      path: '/myIncome',
      name: 'myIncome',
      component: myIncome,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/LPVault',
      name: 'LPVault',
      component: LPVault,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/purchase-node-record',
      name: 'purchaseNodeRecord',
      component: purchaseNodeRecord,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: dashboard,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    },
    {
      path: '/asset-management',
      name: 'assetManagement',
      component: assetManagement,
      meta: {
        hideHeader: true,
        hideFooterNav: true
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // 处理滚动行为：如果有保存的滚动位置，则恢复到该位置，否则滚动到顶部

    return { top: 0 }; // 跳转时滚动到顶部

  },
});
export default router
