<template>
  <div class="link-wallet-page">
    <button class="close-btn" type="button" @click="handleClose">
      ✕
    </button>

    <div class="welcome-section">
      <div class="logo-box">
        <img :src="logoUrl" alt="CHOOSME Logo" class="logo-img" />
      </div>
      <h1 class="welcome-title">{{ $t('linkWallet.welcome') }}</h1>
      <div class="subtitle-row">
        <span class="subtitle-line"></span>
        <span class="welcome-subtitle">{{ $t('linkWallet.selectLoginMethod') }}</span>
        <span class="subtitle-line"></span>
      </div>
    </div>

    <div class="wallet-list">
      <div v-for="wallet in wallets" :key="wallet.id" class="wallet-card">
        <div class="wallet-info">
          <div class="wallet-icon-box">
            <img :src="wallet.icon" :alt="wallet.name" class="wallet-icon" />
          </div>
          <span class="wallet-name">{{ wallet.name }}</span>
        </div>
        <button class="connect-btn" type="button" @click.stop="handleConnect(wallet)">
          {{ $t('linkWallet.connect') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { wallets, useLinkWallet } from './linkWallet'

const { t } = useI18n()
const { logoUrl,  handleConnect, handleClose } = useLinkWallet()
</script>

<style scoped lang="scss">
.link-wallet-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24px 16px 24px;
  background-color: var(--bg-page-h5, #FFFFFF);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.close-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--bg-page-h5, rgba(0, 0, 0, 0.04));
  color: var(--text-color, #333333);
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.welcome-section {
  margin-top: 40px;
  margin-bottom: 24px;
  padding: 24px 16px 28px;
  background-color: var(--bg-page-h5, #ffffff);
  border-radius: 12px;
  box-sizing: border-box;
  text-align: center;
}

.logo-box {
  width: 100%;
  border-radius: 12px;
  padding: 24px 8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.logo-img {
  max-width: 122px;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.welcome-title {
  margin: 0 0 24px;
  font-family: Lantinghei SC, Lantinghei SC;
  font-weight: 800;
  font-size: 20px;
  color: var(--text-color, #000000);
  text-align: center;
}

.subtitle-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.subtitle-line {
  flex: 1;
  height: 1px;
  background-color: var(--border-color, #E0E0E0);
}

.welcome-subtitle {
  font-size: 12px;
  color: var(--text-dark-gray, #bbbbbb);
}

.wallet-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallet-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background-color: var(--bg-page-h5, #ffffff);
  border-radius: 16px;
  box-sizing: border-box;
  cursor: pointer;
  border: 1px solid var(--border-color, #E0E0E0);
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wallet-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wallet-icon {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.wallet-name {
  font-size: 15px;
  color: var(--text-color, #333333);
}

.connect-btn {
  min-width: 76px;
  height: 34px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background-color: var(--text-color, #fff);
  color: var(--bg-color, #ffffff);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
</style>
