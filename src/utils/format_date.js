import dayjs from 'dayjs'
import i18n from '@/languages'

export function formatMonthDay(date) {
  return dayjs(date).format("MM月DD日")
}

export function getDiffDays(startDate, endDate) {
  return dayjs(endDate).diff(startDate, "day")
}

/**
 * 将应用的 locale（如 'zh-cn'）转换为标准格式（如 'zh-CN'）
 */
function normalizeLocale(locale) {
  if (!locale) return undefined
  const localeMap = {
    'zh-cn': 'zh-CN',
    'en-us': 'en-US',
    'ko-kr': 'ko-KR',
    'ja-jp': 'ja-JP'
  }
  return localeMap[locale.toLowerCase()] || locale
}

/**
 * 格式化日期时间（按应用当前语言显示）
 * 
 * @param {number|string|bigint} timestamp - UTC 时间戳（秒或毫秒）
 * @param {string} locale - 可选，指定语言，默认使用应用当前 i18n locale
 * @returns {string} 格式化后的本地时间字符串
 */
export function formatDateTime(timestamp, locale) {
  if (!timestamp || timestamp === 0) {
    return '-'
  }
  
  // 如果是秒级时间戳，需要 *1000 转成毫秒
  const ts = timestamp < 10000000000 ? timestamp * 1000 : timestamp
  
  // 创建 Date 对象
  const date = new Date(Number(ts))
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  
  // 转成本地字符串，使用应用当前语言
  const finalLocale = locale || normalizeLocale(i18n.global.locale.value)
  return date.toLocaleString(finalLocale)
}