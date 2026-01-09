<template>
  <div class="ChooseMe-header">

    <!-- PC端 -->
    <div class="header-container">

      <div class="logo-section">
        <div class="logo" @click="handleLogoClick">
          <img src="@/assets/logo-Dark.png" alt="ChooseMe" class="logo-img" />
        </div>
      </div>


      <div class="search-section">
        <div class="search-input-wrapper">
          <el-icon class="search-icon">
            <Search />
          </el-icon>
          <input type="text" class="search-input" :placeholder="$t('header.searchPlaceholder') || '搜索ChooseMe'"
            v-model="searchValue" @keyup.enter="handleSearch" />
        </div>
      </div>


      <div class="right-section">
        <!-- 语言切换下拉菜单 -->
        <el-dropdown class="language-dropdown" @command="handleLanguageChange" trigger="click">
          <button class="language-toggle-btn" :title="$t('navbar.language.en') || 'Language'">
            <img src="@/assets/language.png" alt="language" class="language-icon" />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh-cn">
                {{ $t('navbar.language.cn') || '中文' }}
              </el-dropdown-item>
              <el-dropdown-item command="en-us">
                {{ $t('navbar.language.en') || 'English' }}
              </el-dropdown-item>
              <el-dropdown-item command="ko-kr">
                {{ $t('navbar.language.Korean') || '한국어' }}
              </el-dropdown-item>
              <el-dropdown-item command="ja-jp">
                {{ $t('navbar.language.Japanese') || '日本語' }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 关灯按钮 -->
        <button class="theme-toggle-btn" @click="toggleTheme" :title="isDark ? '开灯' : '关灯'">
          <el-icon class="theme-icon">
            <Sunny v-if="isDark" />
            <Moon v-else />
          </el-icon>
        </button>

        <div class="finance-info">
          <span class="finance-label">{{ $t('header.portfolio') || '投资组合' }}: </span>
          <span class="finance-amount">${{ portfolioAmount }}</span>
          <span class="finance-label" style="margin-left: 16px;">{{ $t('header.cash') || '现金' }}: </span>
          <span class="finance-amount">${{ cashAmount }}</span>
        </div>

        <button class="deposit-btn" @click="handleDeposit">
          {{ $t('header.deposit') || '存入' }}
        </button>

        <!-- 未连接钱包时显示"连接钱包"按钮 -->
        <button v-if="!isConnected" class="connect-wallet-btn" @click="showConnet = true">
          连接钱包
        </button>

        <!-- 已连接钱包显示头像与下拉 -->
        <div v-else class="user-section" @click="toggleUserMenu">
          <img :src="userAvatar" alt="User Avatar" class="user-avatar" />
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 移动端 -->
    <div class="header-h5">
      <div class="h5-logo-section">
        <div class="logo" @click="handleLogoClick">
          <img :src="logoUrl" alt="ChooseMe" class="logo-img" />
        </div>
      </div>

      <div class="h5-user-section">
        <!-- 主题切换按钮 -->
        <div class="h5-theme-toggle-btn" @click="toggleTheme" :title="isDark ? '开灯' : '关灯'">
          <el-icon class="theme-icon" :class="{ 'icon-light': !isDark, 'icon-dark': isDark }">
            <Sunny v-if="!isDark" />
            <Moon v-else />
          </el-icon>
        </div>

        <!-- 未连接钱包时显示"连接钱包"按钮（跳转到 LinkWallet 页面） -->
        <button v-if="statusReady && !isConnected" class="h5-connect-wallet-btn" @click="goLinkWallet">
          {{ $t('link.titel') || '链接钱包' }}
        </button>

        <!-- 已连接钱包显示头像 -->
        <div v-else-if="statusReady" class="h5-user-avatar" @click="handleUserInfo">
          <img :src="userAvatar" alt="User Avatar" />
        </div>
      </div>
    </div>

    <!-- 连接钱包弹窗 -->
    <transition name="fade">
      <div class="popup" v-if="showConnet">
        <div class="content1">
          <el-icon @click="closeLogin">
            <CloseBold />
          </el-icon>
          <div class="headerlogo">
            <img :src="logoUrl" alt="logo">
              <h4>{{ $t('link.titel') || '链接钱包' }}</h4>
          </div>
          <ul class="scroll-area">
            <li v-for="connector in wallets" :key="connector.id" @click="wallconnects(connector.id, chainId)">
              <span>{{ connector.name }}</span>
              <img v-if="connector.icon" :src="connector.name == 'WalletConnect' ? img : connector.icon" alt="" />
            </li>
          </ul>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div class="user-menu" v-if="showUserMenu" ref="userMenuRef">
        <!-- <div class="menu-item" @click="handleProfile">
          {{ $t('header.profile') || '个人资料' }}
        </div> -->
        <div class="menu-item" @click="handleSettings">
          {{ $t('header.settingsTitle') || '个人设置' }}
        </div>
        <div class="menu-item" @click="handleLogout">
          {{ $t('header.logout') || '退出登录' }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject, watch } from 'vue'
import { Search, ArrowDown, Sunny, Moon, CloseBold } from '@element-plus/icons-vue'
import { injected, useAccount, useChainId, useConnect, useDisconnect } from '@wagmi/vue'
import { copyText } from 'vue3-clipboard'
import { useThemeStore } from '@/stores/theme'
import { useCounterStore } from '@/stores/counter'
import { useI18n } from 'vue-i18n'
import img from "../assets/wallconnect.svg";
import router from "@/router";
import logoLight from "@/assets/logo.png";
import logoDark from "@/assets/logo-Dark.png";


const { disconnect } = useDisconnect();
const counterStore = useCounterStore()
const chainId = useChainId();
const { locale, t } = useI18n();

const props = defineProps({
  portfolioAmount: {
    type: [String, Number],
    default: '4.17'
  },
  cashAmount: {
    type: [String, Number],
    default: '3.88'
  },
  userAvatar: {
    type: String,
    default: 'https://effigy.im/a/default.svg'
  }
})

const searchValue = ref('')
const showUserMenu = ref(false)
const userMenuRef = ref(null)

// wagmi 连接状态
const { address, status } = useAccount()
const { connect, connectors } = useConnect()

const isConnected = computed(() => status.value === 'connected')
// 在 wagmi 状态未完成（connecting）时不展示按钮/头像，避免闪烁
const statusReady = computed(() => status.value !== 'connecting')

// 弹窗控制
const showConnet = ref(false)

// 主题管理
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 根据主题返回对应的logo
const logoUrl = computed(() => {
  return isDark.value ? logoDark : logoLight
})

const wallets = [

  {
    name: "MetaMask",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAzNSAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyLjcwNzcgMzIuNzUyMkwyNS4xNjg4IDMwLjUxNzRMMTkuNDgzMyAzMy45MDA4TDE1LjUxNjcgMzMuODk5MUw5LjgyNzkzIDMwLjUxNzRMMi4yOTIyNSAzMi43NTIyTDAgMjUuMDQ4OUwyLjI5MjI1IDE2LjQ5OTNMMCA5LjI3MDk0TDIuMjkyMjUgMC4zMTIyNTZMMTQuMDY3NCA3LjMxNTU0SDIwLjkzMjZMMzIuNzA3NyAwLjMxMjI1NkwzNSA5LjI3MDk0TDMyLjcwNzcgMTYuNDk5M0wzNSAyNS4wNDg5TDMyLjcwNzcgMzIuNzUyMloiIGZpbGw9IiNGRjVDMTYiLz4KPHBhdGggZD0iTTIuMjkzOTUgMC4zMTIyNTZMMTQuMDY5MSA3LjMyMDQ3TDEzLjYwMDggMTIuMTMwMUwyLjI5Mzk1IDAuMzEyMjU2WiIgZmlsbD0iI0ZGNUMxNiIvPgo8cGF0aCBkPSJNOS44Mjk1OSAyNS4wNTIyTDE1LjAxMDYgMjguOTgxMUw5LjgyOTU5IDMwLjUxNzVWMjUuMDUyMloiIGZpbGw9IiNGRjVDMTYiLz4KPHBhdGggZD0iTTE0LjU5NjYgMTguNTU2NUwxMy42MDA5IDEyLjEzMzNMNy4yMjY5MiAxNi41MDA5TDcuMjIzNjMgMTYuNDk5M1YxNi41MDI1TDcuMjQzMzUgMjAuOTk4M0w5LjgyODA5IDE4LjU1NjVIOS44Mjk3NEgxNC41OTY2WiIgZmlsbD0iI0ZGNUMxNiIvPgo8cGF0aCBkPSJNMzIuNzA3NyAwLjMxMjI1NkwyMC45MzI2IDcuMzIwNDdMMjEuMzk5MyAxMi4xMzAxTDMyLjcwNzcgMC4zMTIyNTZaIiBmaWxsPSIjRkY1QzE2Ii8+CjxwYXRoIGQ9Ik0yNS4xNzIyIDI1LjA1MjJMMTkuOTkxMiAyOC45ODExTDI1LjE3MjIgMzAuNTE3NVYyNS4wNTIyWiIgZmlsbD0iI0ZGNUMxNiIvPgo8cGF0aCBkPSJNMjcuNzc2NiAxNi41MDI1SDI3Ljc3ODNIMjcuNzc2NlYxNi40OTkzTDI3Ljc3NSAxNi41MDA5TDIxLjQwMSAxMi4xMzMzTDIwLjQwNTMgMTguNTU2NUgyNS4xNzIyTDI3Ljc1ODYgMjAuOTk4M0wyNy43NzY2IDE2LjUwMjVaIiBmaWxsPSIjRkY1QzE2Ii8+CjxwYXRoIGQ9Ik05LjgyNzkzIDMwLjUxNzVMMi4yOTIyNSAzMi43NTIyTDAgMjUuMDUyMkg5LjgyNzkzVjMwLjUxNzVaIiBmaWxsPSIjRTM0ODA3Ii8+CjxwYXRoIGQ9Ik0xNC41OTQ3IDE4LjU1NDlMMTYuMDM0MSAyNy44NDA2TDE0LjAzOTMgMjIuNjc3N0w3LjIzOTc1IDIwLjk5ODRMOS44MjYxMyAxOC41NTQ5SDE0LjU5M0gxNC41OTQ3WiIgZmlsbD0iI0UzNDgwNyIvPgo8cGF0aCBkPSJNMjUuMTcyMSAzMC41MTc1TDMyLjcwNzggMzIuNzUyMkwzNS4wMDAxIDI1LjA1MjJIMjUuMTcyMVYzMC41MTc1WiIgZmlsbD0iI0UzNDgwNyIvPgo8cGF0aCBkPSJNMjAuNDA1MyAxOC41NTQ5TDE4Ljk2NTggMjcuODQwNkwyMC45NjA3IDIyLjY3NzdMMjcuNzYwMiAyMC45OTg0TDI1LjE3MjIgMTguNTU0OUgyMC40MDUzWiIgZmlsbD0iI0UzNDgwNyIvPgo8cGF0aCBkPSJNMCAyNS4wNDg4TDIuMjkyMjUgMTYuNDk5M0g3LjIyMTgzTDcuMjM5OTEgMjAuOTk2N0wxNC4wMzk0IDIyLjY3NkwxNi4wMzQzIDI3LjgzODlMMTUuMDA4OSAyOC45NzZMOS44Mjc5MyAyNS4wNDcySDBWMjUuMDQ4OFoiIGZpbGw9IiNGRjhENUQiLz4KPHBhdGggZD0iTTM1LjAwMDEgMjUuMDQ4OEwzMi43MDc4IDE2LjQ5OTNIMjcuNzc4M0wyNy43NjAyIDIwLjk5NjdMMjAuOTYwNyAyMi42NzZMMTguOTY1OCAyNy44Mzg5TDE5Ljk5MTIgMjguOTc2TDI1LjE3MjIgMjUuMDQ3MkgzNS4wMDAxVjI1LjA0ODhaIiBmaWxsPSIjRkY4RDVEIi8+CjxwYXRoIGQ9Ik0yMC45MzI1IDcuMzE1NDNIMTcuNDk5OUgxNC4wNjczTDEzLjYwMDYgMTIuMTI1MUwxNi4wMzQyIDI3LjgzNEgxOC45NjU2TDIxLjQwMDggMTIuMTI1MUwyMC45MzI1IDcuMzE1NDNaIiBmaWxsPSIjRkY4RDVEIi8+CjxwYXRoIGQ9Ik0yLjI5MjI1IDAuMzEyMjU2TDAgOS4yNzA5NEwyLjI5MjI1IDE2LjQ5OTNINy4yMjE4M0wxMy41OTkxIDEyLjEzMDFMMi4yOTIyNSAwLjMxMjI1NloiIGZpbGw9IiM2NjE4MDAiLz4KPHBhdGggZD0iTTEzLjE3IDIwLjQxOTlIMTAuOTM2OUw5LjcyMDk1IDIxLjYwNjJMMTQuMDQwOSAyMi42NzI3TDEzLjE3IDIwLjQxODJWMjAuNDE5OVoiIGZpbGw9IiM2NjE4MDAiLz4KPHBhdGggZD0iTTMyLjcwNzcgMC4zMTIyNTZMMzQuOTk5OSA5LjI3MDk0TDMyLjcwNzcgMTYuNDk5M0gyNy43NzgxTDIxLjQwMDkgMTIuMTMwMUwzMi43MDc3IDAuMzEyMjU2WiIgZmlsbD0iIzY2MTgwMCIvPgo8cGF0aCBkPSJNMjEuODMzIDIwLjQxOTlIMjQuMDY5NEwyNS4yODUzIDIxLjYwNzlMMjAuOTYwNCAyMi42NzZMMjEuODMzIDIwLjQxODJWMjAuNDE5OVoiIGZpbGw9IiM2NjE4MDAiLz4KPHBhdGggZD0iTTE5LjQ4MTcgMzAuODM2MkwxOS45OTExIDI4Ljk3OTRMMTguOTY1OCAyNy44NDIzSDE2LjAzMjdMMTUuMDA3MyAyOC45Nzk0TDE1LjUxNjcgMzAuODM2MiIgZmlsbD0iIzY2MTgwMCIvPgo8cGF0aCBkPSJNMTkuNDgxNiAzMC44MzU5VjMzLjkwMjFIMTUuNTE2NlYzMC44MzU5SDE5LjQ4MTZaIiBmaWxsPSIjQzBDNENEIi8+CjxwYXRoIGQ9Ik05LjgyOTU5IDMwLjUxNDJMMTUuNTIgMzMuOTAwOFYzMC44MzQ2TDE1LjAxMDYgMjguOTc3OEw5LjgyOTU5IDMwLjUxNDJaIiBmaWxsPSIjRTdFQkY2Ii8+CjxwYXRoIGQ9Ik0yNS4xNzIxIDMwLjUxNDJMMTkuNDgxNyAzMy45MDA4VjMwLjgzNDZMMTkuOTkxMSAyOC45Nzc4TDI1LjE3MjEgMzAuNTE0MloiIGZpbGw9IiNFN0VCRjYiLz4KPC9zdmc+Cg==",
    id: "io.metamask",
  },
  {

    name: "TokenPocket",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzY4IiBoZWlnaHQ9Ijc2OCIgdmlld0JveD0iMCAwIDc2OCA3NjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI3NjgiIGhlaWdodD0iNzY4IiBmaWxsPSIjMjk4MEZFIi8+CjxwYXRoIGQ9Ik0zMjUuNDc5IDIxMi42NzZIMzIxLjk2MUgxMzQuMzI0QzEyNS4zODQgMjEyLjY3NiAxMTguMTU2IDIxOS45MDQgMTE4LjE1NiAyMjguODQzVjI5NC40NjRDMTE4LjE1NiAzMDMuNDAzIDEyNS4zODQgMzEwLjYzMSAxMzQuMzI0IDMxMC42MzFIMTc4LjM1NkgxOTUuODU1VjMzMC4wMzJWNTM3LjczNkMxOTUuODU1IDU0Ni42NzUgMjAzLjA4MyA1NTMuOTAzIDIxMi4wMjIgNTUzLjkwM0gyODAuODc2QzI4OS44MTYgNTUzLjkwMyAyOTcuMDQ0IDU0Ni42NzUgMjk3LjA0NCA1MzcuNzM2VjMzMC4wMzJWMzI4LjIyNVYzMTAuNjMxSDMxNC41NDNIMzIxLjY3NUgzMjUuMTk0QzM1Mi4yMDMgMzEwLjYzMSAzNzQuMTcyIDI4OC42NjMgMzc0LjE3MiAyNjEuNjU0QzM3NC40NTcgMjM0LjY0NCAzNTIuNDg5IDIxMi42NzYgMzI1LjQ3OSAyMTIuNjc2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTUxMS40OTggMjEyLjY3NkM0MzYuNzQ4IDIxMi42NzYgMzc2LjA3MiAyNzMuMzUxIDM3Ni4wNzIgMzQ4LjEwMlY1MzcuMjZDMzc2LjA3MiA1NDYuMiAzODMuMyA1NTMuNDI4IDM5Mi4yNCA1NTMuNDI4SDQ2NC43MDhDNDczLjY0NyA1NTMuNDI4IDQ4MC44NzUgNTQ2LjIgNDgwLjg3NSA1MzcuMjZWNDgwLjA4Mkw0ODAuOTcgNDgwLjEwNFYzNDguMTAyQzQ4MC45NyAzMzEuMjY4IDQ5NC42NjUgMzE3LjU3NCA1MTEuNDk4IDMxNy41NzRDNTI4LjMzMSAzMTcuNTc0IDU0Mi4wMjYgMzMxLjI2OCA1NDIuMDI2IDM0OC4xMDJDNTQyLjAyNiAzNjIuMjcyIDUzMi40MjEgMzc0LjE2IDUxOS4yOTYgMzc3LjU4M0M1MTYuODI0IDM3OC4yNDkgNTE0LjE2MSAzNzguNjI5IDUxMS40OTggMzc4LjYyOUM1MTAuNzcxIDM3OC42MjkgNTEwLjEzIDM3OC42MyA1MDkuNDEgMzc4LjU0N1YzNzguNTM0QzQ5My41MjggMzc3LjQ4OCA0ODAuOTc1IDM2NC4yNjkgNDgwLjk3NSAzNDguMTAyVjQ4MC4xMDRDNDg0LjU4OSA0ODAuOTYgNDg4LjI5OCA0ODEuNjI1IDQ5Mi4xMDIgNDgyLjE5NkM0OTcuNDI3IDQ4Mi45NTcgNTAyLjk0MyA0ODMuNDMyIDUwOC40NTkgNDgzLjUyN0w1MTEuNSA0ODMuNTI4QzUxNC4xNjIgNDgzLjUyOCA1MTYuNzI5IDQ4My40MzIgNTE5LjI5NiA0ODMuMzM3QzU5MC40MzMgNDc5LjI0OCA2NDYuOTI0IDQyMC4yODQgNjQ2LjkyNCAzNDguMTAyQzY0Ny4wMTkgMjczLjM1MSA1ODYuMzQ0IDIxMi42NzYgNTExLjQ5OCAyMTIuNjc2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==",
    id: "https://www.tokenpocket.pro/en/download/app"
  },
  {

    name: "OKX Wallet",
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII=",
    id: "com.okex.wallet"
  },
  {
    name: "Trust Wallet",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTgiIGhlaWdodD0iNjUiIHZpZXdCb3g9IjAgMCA1OCA2NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgOS4zODk0OUwyOC44OTA3IDBWNjUuMDA0MkM4LjI1NDUgNTYuMzM2OSAwIDM5LjcyNDggMCAzMC4zMzUzVjkuMzg5NDlaIiBmaWxsPSIjMDUwMEZGIi8+CjxwYXRoIGQ9Ik01Ny43ODIyIDkuMzg5NDlMMjguODkxNSAwVjY1LjAwNDJDNDkuNTI3NyA1Ni4zMzY5IDU3Ljc4MjIgMzkuNzI0OCA1Ny43ODIyIDMwLjMzNTNWOS4zODk0OVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8yMjAxXzY5NDIpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMjIwMV82OTQyIiB4MT0iNTEuMzYxNSIgeTE9Ii00LjE1MjkzIiB4Mj0iMjkuNTM4NCIgeTI9IjY0LjUxNDciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjAyMTEyIiBzdG9wLWNvbG9yPSIjMDAwMEZGIi8+CjxzdG9wIG9mZnNldD0iMC4wNzYyNDIzIiBzdG9wLWNvbG9yPSIjMDA5NEZGIi8+CjxzdG9wIG9mZnNldD0iMC4xNjMwODkiIHN0b3AtY29sb3I9IiM0OEZGOTEiLz4KPHN0b3Agb2Zmc2V0PSIwLjQyMDA0OSIgc3RvcC1jb2xvcj0iIzAwOTRGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuNjgyODg2IiBzdG9wLWNvbG9yPSIjMDAzOEZGIi8+CjxzdG9wIG9mZnNldD0iMC45MDI0NjUiIHN0b3AtY29sb3I9IiMwNTAwRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    id: "com.trustwallet.app",
  },

  {
    name: "Bitget Wallet",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjMDAxRjI5Ii8+CjxwYXRoIGQ9Ik0yMTkuOTQ4IDk1LjcwMjJDMjAxLjYyMyA5NS42OTI5IDE4My4zMyA5NS42ODM1IDE2NC45NDEgOTUuNzExNkMxNTMuODIyIDk1LjcxMTYgMTQ5LjY1MSAxMDkuNjcxIDE1Ny45MjEgMTE3LjkzOUwyODMuMDk4IDI0My4xMTdDMjg3LjAwNCAyNDYuNjkgMjg5LjQ0MSAyNTAuNTc0IDI4OS41MyAyNTUuNjkzQzI4OS40NDEgMjYwLjgxMiAyODcuMDA0IDI2NC42OTYgMjgzLjA5OCAyNjguMjY5TDE1Ny45MjEgMzkzLjQ0NkMxNDkuNjUxIDQwMS43MTUgMTUzLjgyMiA0MTUuNjc0IDE2NC45NDEgNDE1LjY3NEMxODMuMzMgNDE1LjcwMiAyMDEuNjIzIDQxNS42OTMgMjE5Ljk0OCA0MTUuNjgzQzIyOS4xMjIgNDE1LjY3OSAyMzguMzA1IDQxNS42NzQgMjQ3LjUxMSA0MTUuNjc0QzI1OS41NTUgNDE1LjY3NCAyNjYuNzIgNDA5LjI0IDI3My4xNTQgNDAyLjgwNUwzODYuMDQ3IDI4OS45MTJDMzk1LjA1NyAyODAuOTAyIDQwMy4xMTkgMjY4LjkzOSA0MDMuMDA5IDI1NS42OTNDNDAzLjExOSAyNDIuNDQ3IDM5NS4wNTcgMjMwLjQ4NCAzODYuMDQ3IDIyMS40NzRMMjczLjE1NCAxMDguNThDMjY2LjcyIDEwMi4xNDYgMjU5LjU1NSA5NS43MTE2IDI0Ny41MTEgOTUuNzExNkMyMzguMzA1IDk1LjcxMTYgMjI5LjEyMiA5NS43MDY5IDIxOS45NDggOTUuNzAyMloiIGZpbGw9IiMwMEYwRkYiLz4KPC9zdmc+Cg==",
    id: "com.bitget.web3",
  },
  {

    name: "Rabby Wallet",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzc0MV8yNzUxKSI+CjxtYXNrIGlkPSJtYXNrMF83NDFfMjc1MSIgc3R5bGU9Im1hc2stdHlwZTpsdW1pbmFuY2UiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+CjxwYXRoIGQ9Ik0zMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMkMyNC44MzY2IDMyIDMyIDI0LjgzNjYgMzIgMTZaIiBmaWxsPSJ3aGl0ZSIvPgo8L21hc2s+CjxnIG1hc2s9InVybCgjbWFzazBfNzQxXzI3NTEpIj4KPHBhdGggZD0iTTMyIDE2QzMyIDcuMTYzNDQgMjQuODM2NiAwIDE2IDBDNy4xNjM0NCAwIDAgNy4xNjM0NCAwIDE2QzAgMjQuODM2NiA3LjE2MzQ0IDMyIDE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNloiIGZpbGw9IiM3MDg0RkYiLz4KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZF83NDFfMjc1MSkiPgo8cGF0aCBkPSJNMjcuNjAxOSAxNy4zODc2QzI4LjUyMTYgMTUuMzI2MSAyMy45NzQ4IDkuNTY2MzIgMTkuNjMxIDcuMTY2NzZDMTYuODkyOSA1LjMwNzc5IDE0LjAzOTkgNS41NjMxOCAxMy40NjIgNi4zNzkzOEMxMi4xOTQgOC4xNzA2OSAxNy42NjExIDkuNjg4NTEgMjEuMzE3NCAxMS40NTk3QzIwLjUzMTQgMTEuODAyMiAxOS43OTA4IDEyLjQxNjkgMTkuMzU1MiAxMy4yMDI5QzE3Ljk5MjEgMTEuNzA5OCAxNS4wMDAzIDEwLjQyMzkgMTEuNDg5NyAxMS40NTk3QzkuMTIzOTcgMTIuMTU3NyA3LjE1NzkxIDEzLjgwMzIgNi4zOTgwNCAxNi4yODg1QzYuMjEzMzcgMTYuMjA2MiA2LjAwODk0IDE2LjE2MDQgNS43OTM4NyAxNi4xNjA0QzQuOTcxNDIgMTYuMTYwNCA0LjMwNDY5IDE2LjgyOTQgNC4zMDQ2OSAxNy42NTQ2QzQuMzA0NjkgMTguNDc5OSA0Ljk3MTQyIDE5LjE0ODggNS43OTM4NyAxOS4xNDg4QzUuOTQ2MzIgMTkuMTQ4OCA2LjQyMjk4IDE5LjA0NjMgNi40MjI5OCAxOS4wNDYzTDE0LjAzOTkgMTkuMTAxNkMxMC45OTM3IDIzLjk1MDQgOC41ODYzNSAyNC42NTkxIDguNTg2MzUgMjUuNDk5MkM4LjU4NjM1IDI2LjMzOTIgMTAuODg5OCAyNi4xMTE2IDExLjc1NDcgMjUuNzk4NEMxNS44OTQ5IDI0LjI5OTUgMjAuMzQxNyAxOS42MjggMjEuMTA0OCAxOC4yODMzQzI0LjMwOTIgMTguNjg0NCAyNy4wMDIyIDE4LjczMTggMjcuNjAxOSAxNy4zODc2WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzc0MV8yNzUxKSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIxLjMwMjkgMTEuNDUzOEMyMS4zMDY3IDExLjQ1NTUgMjEuMzEwNiAxMS40NTcxIDIxLjMxNDQgMTEuNDU4OEMyMS40ODM5IDExLjM5MTggMjEuNDU2NSAxMS4xNDA3IDIxLjQwOTkgMTAuOTQzNUMyMS4zMDMgMTAuNDkwMSAxOS40NTc1IDguNjYxNjUgMTcuNzI0NSA3Ljg0MjY1QzE1LjM2MjkgNi43MjY2NSAxMy42MjQgNi43ODQyMSAxMy4zNjcyIDcuMjk4NjVDMTMuODQ3MiA4LjI4ODIxIDE2LjA3NzkgOS4yMTcyNyAxOC40MDc3IDEwLjE4NzZDMTkuMzk3MSAxMC41OTk2IDIwLjQwNDMgMTEuMDE5MSAyMS4zMDI5IDExLjQ1MzhaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXJfNzQxXzI3NTEpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTguMzIyOCAyMS40MTY3QzE3Ljg0NTMgMjEuMjMzNyAxNy4zMDYgMjEuMDY1OCAxNi42OTI5IDIwLjkxMzNDMTcuMzQ2OSAxOS43MzkzIDE3LjQ4NDEgMTguMDAxMSAxNi44NjY1IDE2LjkwMjJDMTUuOTk5OCAxNS4zNTk5IDE0LjkxMTcgMTQuNTM5MSAxMi4zODM0IDE0LjUzOTFDMTAuOTkyOCAxNC41MzkxIDcuMjQ4NzcgMTUuMDA5IDcuMTgyMjcgMTguMTQ1QzcuMTc1MzQgMTguNDczOCA3LjE4MjA5IDE4Ljc3NTEgNy4yMDU3NyAxOS4wNTIxTDE0LjA0MyAxOS4xMDE5QzEzLjEyMSAyMC41Njk0IDEyLjI1NzUgMjEuNjU3NyAxMS41MDE2IDIyLjQ4NTJDMTIuNDA5MiAyMi43MTg2IDEzLjE1ODEgMjIuOTE0NCAxMy44NDU3IDIzLjA5NDNDMTQuNDk3OCAyMy4yNjQ4IDE1LjA5NDYgMjMuNDIwOSAxNS43MTkzIDIzLjU4MDlDMTYuNjYyIDIyLjg5MTggMTcuNTQ4MyAyMi4xNDA0IDE4LjMyMjggMjEuNDE2N1oiIGZpbGw9InVybCgjcGFpbnQyX2xpbmVhcl83NDFfMjc1MSkiLz4KPHBhdGggZD0iTTYuMzA4NzQgMTguNzI4M0M2LjU4ODA1IDIxLjExMDUgNy45MzczNiAyMi4wNDQxIDEwLjY5NDYgMjIuMzIwNUMxMy40NTE5IDIyLjU5NjggMTUuMDMzNSAyMi40MTE0IDE3LjEzOTEgMjIuNjAzNkMxOC44OTc3IDIyLjc2NDEgMjAuNDY4IDIzLjY2MzMgMjEuMDUwNSAyMy4zNTI2QzIxLjU3NDcgMjMuMDczIDIxLjI4MTQgMjIuMDYyNiAyMC41Nzk5IDIxLjQxNDRDMTkuNjcwNiAyMC41NzQxIDE4LjQxMjEgMTkuOTkgMTYuMTk3NyAxOS43ODI2QzE2LjYzOSAxOC41NzAyIDE2LjUxNTQgMTYuODcwMyAxNS44Mjk5IDE1Ljk0NTVDMTQuODM4OSAxNC42MDgyIDEzLjAwOTcgMTQuMDAzNiAxMC42OTQ2IDE0LjI2NzhDOC4yNzU4NiAxNC41NDM4IDUuOTU4MjEgMTUuNzM4NiA2LjMwODc0IDE4LjcyODNaIiBmaWxsPSJ1cmwoI3BhaW50M19saW5lYXJfNzQxXzI3NTEpIi8+CjwvZz4KPC9nPgo8L2c+CjxkZWZzPgo8ZmlsdGVyIGlkPSJmaWx0ZXIwX2RfNzQxXzI3NTEiIHg9Ii03Ny42MTUzIiB5PSItNzYuMTYwMiIgd2lkdGg9IjE4Ny4yNTQiIGhlaWdodD0iMTg0LjE2MiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIgcmVzdWx0PSJoYXJkQWxwaGEiLz4KPGZlT2Zmc2V0Lz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNDAuOTYiLz4KPGZlQ29tcG9zaXRlIGluMj0iaGFyZEFscGhhIiBvcGVyYXRvcj0ib3V0Ii8+CjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAuMTUxOTMzIDAgMCAwIDAgMC4yMzkyMzggMCAwIDAgMCAwLjQ5MDI0MSAwIDAgMCAwLjU0IDAiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJlZmZlY3QxX2Ryb3BTaGFkb3dfNzQxXzI3NTEiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJlZmZlY3QxX2Ryb3BTaGFkb3dfNzQxXzI3NTEiIHJlc3VsdD0ic2hhcGUiLz4KPC9maWx0ZXI+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl83NDFfMjc1MSIgeDE9IjExLjIxNDIiIHkxPSIxNS41NjIiIHgyPSIyNy40MTE5IiB5Mj0iMjAuMTM5OSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSJ3aGl0ZSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IndoaXRlIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl83NDFfMjc1MSIgeDE9IjI0LjY3NDUiIHkxPSIxNS4yNTE4IiB4Mj0iMTIuOTUzNiIgeTI9IjMuNTQxNjMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzg2OTdGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM4Njk3RkYiIHN0b3Atb3BhY2l0eT0iMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50Ml9saW5lYXJfNzQxXzI3NTEiIHgxPSIxOC42NDc4IiB5MT0iMjEuODI2MSIgeDI9IjcuNDA4MDIiIHkyPSIxNS4zODU5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM4Njk3RkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjODY5N0ZGIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDNfbGluZWFyXzc0MV8yNzUxIiB4MT0iMTIuMTgyNyIgeTE9IjE1LjQzOTQiIHgyPSIxOS43OTkxIiB5Mj0iMjUuMDg0MyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSJ3aGl0ZSIvPgo8c3RvcCBvZmZzZXQ9IjAuOTgzODk1IiBzdG9wLWNvbG9yPSIjRDFEOEZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfNzQxXzI3NTEiPgo8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==",
    id: "io.rabby"
  },

  {

    name: "Coinbase Wallet",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI4IDU2YzE1LjQ2NCAwIDI4LTEyLjUzNiAyOC0yOFM0My40NjQgMCAyOCAwIDAgMTIuNTM2IDAgMjhzMTIuNTM2IDI4IDI4IDI4WiIgZmlsbD0iIzFCNTNFNCIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNyAyOGMwIDExLjU5OCA5LjQwMiAyMSAyMSAyMXMyMS05LjQwMiAyMS0yMVMzOS41OTggNyAyOCA3IDcgMTYuNDAyIDcgMjhabTE3LjIzNC02Ljc2NmEzIDMgMCAwIDAtMyAzdjcuNTMzYTMgMyAwIDAgMCAzIDNoNy41MzNhMyAzIDAgMCAwIDMtM3YtNy41MzNhMyAzIDAgMCAwLTMtM2gtNy41MzNaIiBmaWxsPSIjZmZmIi8+PC9zdmc+",
    id: "com.coinbase.wallet"
  },


  {

    name: "Coin98 Wallet",
    icon: "data:image/png;base64,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",
    id: "coin98.com"
  },


  {

    name: "SafePal",
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAP1BMVEUAAABKIe9MIO9LIO9KIe5KIO9KIe9KIO5JIO1KIu1KIO1KIe////+kkPfo4/1hPfFgPfGZgvaOdPWDZvRVL/CpQHckAAAAC3RSTlMA7yC/oDDfgJCQkAOmnXUAAADnSURBVEjHlZbtjoJAEAR7BwTvmvUO9f2f1USNk81MRrp+VxFY9gsvbJ0aC9r0Y3Bs5gHmT3JqPMRy0nyyPQtbeJhmAGYKzIBRwvBLiRUTJSY0SjQw4X7tI//8kAV/l22k04HoE6JPiD4h+oToE8HfWYLwfNZg9EOQvpL7Mag+et+SoBrWWxaUP64nQT01ehLUk6/nwXYLgRdpsIfAiyy4VAuoc8B9D0rcPxbs7sfAB8oJPiH6hOgTok+IPiH4YQH1keudCfJmrG/3KyXO8pGlH4ow4bMX0w/2Z7EIvnY5cez87fqzvvUH/qNgaUlN588AAAAASUVORK5CYII=",
    id: "https://www.safepal.com/download"
  },

  {

    name: "WalletConnect",
    icon: img,
    id: "walletConnect"
  },

]

const toggleTheme = () => {
  themeStore.toggleTheme()
}

// 语言切换处理
const handleLanguageChange = (command) => {
  locale.value = command
  document.documentElement.setAttribute("data-lang", locale.value)
  // 保存语言选择到 localStorage
  localStorage.setItem('app-locale', command)
}

// 短地址显示
const shortAddress = (addr) => {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// 连接钱包
const wallconnects = async (id, chainId) => {
  const connectMetaMask = async () => {
    try {
      // 如果已经连接了钱包，先断开连接
      if (status.value === 'connected') {
        try {
          await disconnect()
          // 等待断开完成
          await new Promise((resolve) => setTimeout(resolve, 300))
        } catch (error) {
          console.error('断开连接失败:', error)
          // 即使断开失败也继续尝试连接新钱包
        }
      }

      const connector = connectors.find(c => c.id === id)
      if (connect) {
        await connect({ connector, chainId })
      } else {
        const connector = injected();
        await connect({ connector, chainId })
      }

    } catch (error) {
      console.error('connect error', error)
    }
  }
  connectMetaMask()
  closeLogin()
}

const closeLogin = () => {
  showConnet.value = false
}

const userAvatar = computed(() => {
  if (props.userAvatar !== 'https://effigy.im/a/default.svg') {
    return props.userAvatar
  }
  return address.value
    ? `https://effigy.im/a/${address.value}.svg`
    : 'https://effigy.im/a/default.svg'
})

const handleLogoClick = () => { }
const handleSearch = () => { }
const handleDeposit = () => { }

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleUserInfo = () => {
  router.push('/personal-center')
  closeUserMenu()
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const handleProfile = () => { closeUserMenu() }
const handleSettings = () => {
  router.push('/settings')
  closeUserMenu()
}
const goLinkWallet = async () => {
  // 移动端点击链接钱包按钮时，先断开钱包连接
  if (status.value === 'connected') {
    try {
      await disconnect()
      // 等待断开完成
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) {
      console.error('断开连接失败:', error)
      // 即使断开失败也继续跳转
    }
  }
  router.push('/link-wallet')
}
const handleLogout = () => {
  disconnect();
  closeUserMenu()
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (showUserMenu.value && userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    const userSection = event.target.closest('.user-section')
    if (!userSection) {
      closeUserMenu()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.ChooseMe-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: #000000;
  padding: 0 5%;
  height: 80px;
  display: flex;
  align-items: center;
  z-index: 1000;
  box-sizing: border-box;

  .header-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    box-sizing: border-box;
  }

  // 移动端头部
  .header-h5 {
    width: 100%;
    display: none; // 默认隐藏，移动端显示
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-sizing: border-box;

    .h5-logo-section {
      display: flex;
      align-items: center;
      flex-shrink: 0;

      .logo {
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: opacity 0.2s;

        &:hover {
          opacity: 0.8;
        }

        .logo-img {
          height: 28px;
          width: auto;
          object-fit: contain;
          display: block;
        }
      }
    }

    .h5-user-section {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-shrink: 0;

      .h5-theme-toggle-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #3a3a3a;
        color: #ffffff;
        transition: all 0.2s;
        flex-shrink: 0;

        &:active {
          transform: scale(0.95);
        }

        .theme-icon {
          font-size: 16px;
          transition: color 0.3s ease;

          // 亮色模式：太阳图标使用橙色/黄色
          &.icon-light {
            color: #000;
          }

          // 暗色模式：月亮图标使用白色/浅色
          &.icon-dark {
            color: #FFFFFF;
          }
        }
      }

      .h5-user-avatar {
        cursor: pointer;
        padding: 2px;
        border-radius: 50%;
        transition: background-color 0.2s;


        img {
          width: 32px;
          height: 32px;
          display: block;
          border-radius: 50%;
          object-fit: cover;
        }
      }
    }
  }

  // Logo 区域
  .logo-section {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.8;
      }

      .logo-img {
        height: 32px;
        width: auto;
        object-fit: contain;
        display: block;
      }
    }
  }

  // 搜索栏
  .search-section {
    flex: 1;
    max-width: 500px;
    margin: 0 auto;

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 12px;
        color: #8e8e92;
        font-size: 18px;
        z-index: 1;
      }

      .search-input {
        width: 100%;
        height: 40px;
        padding: 0 12px 0 40px;
        background-color: transparent;
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        color: #ffffff;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;

        &::placeholder {
          color: #8e8e92;
        }

        &:focus {
          border-color: #3b82f6;
        }
      }
    }
  }

  // 右侧区域
  .right-section {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  // 语言切换按钮
  .language-dropdown {
    .language-toggle-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 1px solid #3a3a3a;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: #5a5a5a;
      }

      .language-icon {
        width: 18px;
        height: 18px;
        object-fit: contain;
      }
    }
  }

  // 主题切换按钮
  .theme-toggle-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: #5a5a5a;
    }

    .theme-icon {
      font-size: 18px;
    }
  }

  // 财务信息
  .finance-info {
    display: flex;
    align-items: center;
    font-size: 14px;
    white-space: nowrap;

    .finance-label {
      color: #ffffff;
    }

    .finance-amount {
      color: #10b981; // 绿色
      font-weight: 500;
      margin-left: 4px;
    }
  }

  // 存入按钮
  .deposit-btn {
    height: 36px;
    padding: 0 20px;
    background-color: #ffffff;
    color: #000000;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      background-color: #f0f0f0;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  // 连接钱包按钮
  .connect-wallet-btn {
    height: 36px;
    padding: 0 18px;
    border: 1px solid #ffffff;
    background: transparent;
    color: #ffffff;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    line-height: 1;
    opacity: 1;
    visibility: visible;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  // 用户区域
  .user-section {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #3a3a3a;
    }

    .dropdown-icon {
      color: #ffffff;
      font-size: 14px;
      transition: transform 0.2s;
    }

    &:hover .dropdown-icon {
      transform: translateY(2px);
    }
  }

  // 用户下拉菜单
  .user-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 24px;
    background-color: #1e1e1e;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    padding: 8px 0;
    min-width: 160px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1001;

    .menu-item {
      padding: 12px 16px;
      color: #ffffff;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      &:first-child {
        border-radius: 8px 8px 0 0;
      }

      &:last-child {
        border-radius: 0 0 8px 8px;
      }
    }
  }
}

// popup 弹窗样式（仅连接弹窗）
.popup {
  font-size: 14px;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 2000;
  width: 100%;
  height: 100vh;
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;

  .content1 {
    width: 90%;
    max-width: 360px;
    border-radius: 16px;
    background: #151517;
    padding: 24px;
    position: absolute;
    cursor: pointer;
    animation: fadeIn 0.4s ease forwards;
    box-sizing: border-box;

    h4 {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 500;
      text-align: center;
      color: #fff;
      width: 100%;
    }

    :deep(.el-icon) {
      position: absolute;
      right: 20px;
      top: 20px;
      cursor: pointer;
    }

    .headerlogo {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;

      img {
        max-width: 200px;
        margin-bottom: 16px;
      }
    }

    .scroll-area {
      list-style: none;
      cursor: pointer;
      padding: 0 16px;
      max-height: 360px;
      overflow-y: auto;

      /* 美化滚动条 */
      &::-webkit-scrollbar {
        width: 6px;
        background: transparent;
      }

      &::-webkit-scrollbar-track {
        background: transparent !important;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(111, 105, 105, 0.5);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-button {
        display: none;
        height: 0;
        width: 0;
      }

      li {
        display: flex;
        height: 64px;
        padding: 0 16px;
        justify-content: space-between;
        align-items: center;
        border-radius: 16px;
        background: #1e1e1e;
        margin-bottom: 10px;
        color: #fff;

        img {
          width: 32px;
          border-radius: 8px;
          object-fit: cover;
        }

        span {
          font-size: 16px;
          font-weight: 500;
        }
      }

      li:last-child {
        margin: 0;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}



// 响应式设计
@media (max-width: 1280px) {
  .ChooseMe-header {
    padding: 0 4%;

    .header-container {
      gap: 16px;
    }

    .search-section {
      max-width: 400px;
    }
  }
}

@media (max-width: 1024px) {
  .ChooseMe-header {
    padding: 0 3%;

    .header-container {
      gap: 12px;
    }

    .search-section {
      max-width: 300px;

      .search-input-wrapper {
        .search-input {
          height: 38px;
          font-size: 13px;
        }
      }
    }

    .finance-info {
      display: none;
    }

    .language-dropdown {
      .language-toggle-btn {
        width: 34px;
        height: 34px;

        .language-icon {
          width: 16px;
          height: 16px;
        }
      }
    }

    .theme-toggle-btn {
      width: 34px;
      height: 34px;

      .theme-icon {
        font-size: 16px;
      }
    }

    .deposit-btn {
      height: 34px;
      padding: 0 16px;
      font-size: 13px;
    }

    .connect-wallet-btn {
      height: 34px;
      padding: 0 14px;
      font-size: 13px;
    }

    .user-section {
      .user-avatar {
        width: 32px;
        height: 32px;
      }
    }
  }
}

// 480px 及以下屏幕的样式（合并了 768px 的样式）
@media (max-width: 480px) {
  .ChooseMe-header {
    padding: 0 10px;
    height: 52px;
    background-color: var(--bg-page-h5, #fff);

    // PC端头部在移动端隐藏
    .header-container {
      display: none;
    }

    // 移动端头部显示
    .header-h5 {
      display: flex;
      gap: 6px;

      .h5-logo-section {
        .logo {
          .logo-img {
            height: 22px;
          }
        }
      }

      .h5-user-section {
        gap: 15px;

        .h5-theme-toggle-btn {
          width: 20px;
          height: 20px;
          border: none;
          min-width: 20px;

          .theme-icon {
            font-size: 20px;
          }
        }

        .h5-connect-wallet-btn {
          height: 30px;
          padding: 0 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 8px;
          background: var(--bg-opposite, #000000);
          color: var(--bg-page-h5, #ffffff);
          font-size: 11px;
          min-width: 55px;
          opacity: 1;
          visibility: visible;
        }

        .h5-user-avatar {
          img {
            width: 26px;
            height: 26px;
          }
        }
      }
    }

    .user-menu {
      right: 10px;
      min-width: 120px;

      .menu-item {
        padding: 8px 12px;
        font-size: 12px;
      }
    }
  }

  // 弹窗样式
  .popup {
    .content1 {
      width: 90%;
      padding: 16px;
      border-radius: 12px;

      h4 {
        font-size: 16px;
        margin-bottom: 16px;
      }

      :deep(.el-icon) {
        right: 12px;
        top: 12px;
        font-size: 16px;
      }

      .headerlogo {
        img {
          max-width: 140px;
          margin-bottom: 10px;
        }
      }

      .scroll-area {
        padding: 0 8px;
        max-height: 280px;

        li {
          height: 52px;
          padding: 0 10px;
          margin-bottom: 6px;
          border-radius: 12px;

          img {
            width: 24px;
          }

          span {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
