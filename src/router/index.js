import { createRouter, createWebHistory } from 'vue-router'
import bridge from "../views/bridge/index.vue"
import home from "../views/home/index.vue"
import earnings from "../views/earnings/index.vue"
import leaderboard from "../views/leaderboard/index.vue"
import detail from "../views/detail/index.vue"
import breaking from "../views/breaking/index.vue"
import accuracy from "../views/accuracy/index.vue"
import settings from "../views/settings/index.vue"
import myNode from "../views/myNode/index.vue"
import myIncome from "../views/myIncome/index.vue"
import LPVault from "../views/LPVault/index.vue"
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
      path: '/myNode',
      name: 'myNode',
      component: myNode,
    },
    // myIncome

    {
      path: '/myIncome',
      name: 'myIncome',
      component: myIncome,
    },
    {
      path: '/LPVault',
      name: 'LPVault',
      component: LPVault,
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // 处理滚动行为：如果有保存的滚动位置，则恢复到该位置，否则滚动到顶部

    return { top: 0 }; // 跳转时滚动到顶部

  },
});
export default router
