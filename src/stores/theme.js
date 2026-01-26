import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 读取主题设置，默认为 dark（关灯）
  const theme = localStorage.getItem('theme')
  const isDark = ref(theme === null || theme === 'dark')

  // 应用主题到 document
  const applyTheme = () => {
    if (typeof document === 'undefined') return
    
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('theme-dark')
      html.classList.remove('theme-light')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.add('theme-light')
      html.classList.remove('theme-dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  // 设置主题
  const setTheme = (dark) => {
    isDark.value = dark
    applyTheme()
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
    applyTheme
  }
})
