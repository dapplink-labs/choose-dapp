import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en_US'
import koKR from './locales/ko_KR'
import jaJP from './locales/ja_JP'

// 从 localStorage 读取保存的语言，如果没有则使用默认值
const getSavedLocale = () => {

  const savedLocale = localStorage.getItem('app-locale')
  // 验证保存的语言是否有效
  if (savedLocale === 'zh-cn' || savedLocale === 'en-us' || savedLocale === 'ko-kr' || savedLocale === 'ja-jp') {
    return savedLocale
  }
  return 'en-us' // 默认语言
}

const savedLocale = getSavedLocale()

const i18n = createI18n({
  legacy: false,
  locale: 'en-us', // 使用保存的语言或默认语言
  messages: {
    'zh-cn': zhCN,
    'en-us': enUS,
    'ko-kr': koKR,
    'ja-jp': jaJP
  }
})

// document.documentElement.setAttribute('data-lang', savedLocale)
export default i18n;
