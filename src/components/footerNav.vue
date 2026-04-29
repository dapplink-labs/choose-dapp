<template>
  <nav class="footer-nav" aria-label="Primary">
    <div class="nav-container">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeNav === item.key }"
        type="button"
        @click="handleNavClick(item)"
      >
        <svg v-if="item.key === 'home'" class="nav-icon home-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5H15v-6.2H9V21H3.5a.5.5 0 0 1-.5-.5v-9.7Z" fill="currentColor" />
          <circle cx="12" cy="17" r="2.2" fill="#ffd42e" />
        </svg>

        <svg v-else-if="item.key === 'node-sale'" class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <circle cx="5" cy="15" r="2" fill="currentColor" />
          <circle cx="19" cy="15" r="2" fill="currentColor" />
          <path d="M12 6.8v3.4M7 14l3.2-2.1M17 14l-3.2-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M18.8 5.2v5M16.3 7.7h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M5 17.5v2.3h14v-2.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <svg v-else-if="item.key === 'node-staking'" class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 9.5h11l2.5 10H4l2.5-10Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <path d="M8 9.5c0-3 1.6-5 4-5s4 2 4 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M12 12.2v4.6M9.7 14.5h4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>

        <svg v-else class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="6" width="16" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M7 6V4.8C7 3.8 7.8 3 8.8 3H18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M15 12h5v4h-5a2 2 0 1 1 0-4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <circle cx="16" cy="14" r=".8" fill="currentColor" />
        </svg>

        <span class="nav-text">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const navItems = computed(() => [
  { key: "home", label: "首页", path: "/home" },
  { key: "node-sale", label: "节点售卖", path: "/computing-power-services" },
  { key: "node-staking", label: "节点质押", path: "/LPVault" },
  { key: "account", label: "账户", path: "/asset-management" },
]);

const activeNav = ref("home");

const routeToNavKey = {
  "/home": "home",
  "/computing-power-services": "node-sale",
  "/myNode": "node-sale",
  "/LPVault": "node-staking",
  "/myIncome": "node-staking",
  "/asset-management": "account",
  "/personal-center": "account",
  "/settings": "account",
  "/bill": "account",
  "/deposit": "account",
  "/withdraw": "account",
};

const updateActiveNavFromRoute = () => {
  activeNav.value = routeToNavKey[route.path] || "home";
};

watch(() => route.path, updateActiveNavFromRoute);

onMounted(updateActiveNavFromRoute);

const handleNavClick = (item) => {
  if (!item.path || item.path === route.path) return;
  router.push(item.path).then(updateActiveNavFromRoute);
};
</script>

<style scoped lang="scss">
.footer-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background: #202833;
  border-top: 1px solid rgba(255, 255, 255, .08);
  padding: 0;
}

.nav-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  height: 58px;
}

.nav-item {
  appearance: none;
  border: 0;
  background: transparent;
  color: #9da6b2;
  min-width: 0;
  height: 58px;
  padding: 6px 4px 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
}

.nav-item:active {
  opacity: .76;
}

.nav-icon {
  width: 25px;
  height: 25px;
  color: currentColor;
  flex: 0 0 25px;
}

.home-icon {
  width: 27px;
  height: 27px;
  flex-basis: 27px;
}

.nav-text {
  color: currentColor;
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0;
  white-space: nowrap;
}

.nav-item.active {
  color: #ffffff;
}

@media (min-width: 430px) {
  .footer-nav {
    right: calc((100vw - 430px) / 2);
    left: calc((100vw - 430px) / 2);
  }
}
</style>
