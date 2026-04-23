import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  const applyTheme = () => {
    if (typeof document === 'undefined') return

    const html = document.documentElement
    isDark.value = true
    html.classList.add('theme-dark')
    html.classList.remove('theme-light')
    localStorage.setItem('theme', 'dark')
  }

  const toggleTheme = () => {
    applyTheme()
  }

  const setTheme = (dark) => {
    isDark.value = Boolean(dark)
    applyTheme()
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
    applyTheme
  }
})
