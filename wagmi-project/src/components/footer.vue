<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- 左侧：版权信息和导航链接 -->
      <div class="footer-left">
        <span class="copyright">Adventure One QSS Inc. © 2025</span>
        <span class="divider">•</span>
        <a href="#" class="footer-link">Privacy</a>
        <span class="divider">•</span>
        <a href="#" class="footer-link">Terms of Use</a>
        <span class="divider">•</span>
        <a href="#" class="footer-link">Learn</a>
        <span class="divider">•</span>
        <a href="#" class="footer-link">Careers</a>
        <span class="divider">•</span>
        <a href="#" class="footer-link">Press</a>
      </div>

      <!-- 右侧：社交媒体图标 -->
      <div class="footer-right">
        <a href="#" class="social-icon" aria-label="Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
        <a href="#" class="social-icon" aria-label="Instagram">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
        <a href="#" class="social-icon" aria-label="LinkedIn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
            <rect x="2" y="9" width="4" height="12"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
        </a>
        <a href="#" class="social-icon" aria-label="TikTok">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.89 2.89 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </a>
        <a href="#" class="social-icon" aria-label="Twitter">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
          </svg>
        </a>
        <a href="#" class="social-icon" aria-label="YouTube">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/>
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer component
</script>

<style scoped lang="scss">
.app-footer {
  background-color: var(--bg-card, #fff);
  padding: 0;
  margin-top: auto;
  transition: background-color 0.3s ease;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  .footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.3s ease;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .copyright {
      font-size: 13px;
      color: var(--text-gray, #666);
      font-weight: 400;
      transition: color 0.3s ease;
    }

    .divider {
      font-size: 13px;
      color: var(--text-dark-gray, #999);
      margin: 0 4px;
      transition: color 0.3s ease;
    }

    .footer-link {
      font-size: 13px;
      color: var(--text-gray, #666);
      text-decoration: none;
      transition: color 0.2s;
      font-weight: 400;

      &:hover {
        color: var(--text-color, #000);
      }
    }
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .social-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: var(--text-dark-gray, #888);
      transition: color 0.2s;
      text-decoration: none;

      svg {
        width: 100%;
        height: 100%;
      }

      &:hover {
        color: var(--text-color, #000);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-footer {
    .footer-container {
      flex-direction: column;
      gap: 16px;
      padding: 20px 24px;
      text-align: center;
      box-sizing: border-box;

      .footer-left {
        justify-content: center;
        flex-wrap: wrap;
      }

      .footer-right {
        justify-content: center;
      }
    }
  }
}
</style>
