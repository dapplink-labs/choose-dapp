import dayjs from 'dayjs'

export function formatMonthDay(date) {
  return dayjs(date).format("MM月DD日")
}

export function getDiffDays(startDate, endDate) {
  return dayjs(endDate).diff(startDate, "day")
}

/**
 * 格式化日期时间（按用户设备的本地时区/本地语言显示）
 *
 * - 默认：使用浏览器的 locale + 本地时区（适配全球用户）
 * - 可选：传入 locale/timeZone 覆盖默认行为（例如后端要求统一某个时区展示）
 */
export function formatDateTime(
  timestamp,
  options = {}
) {
  if (!timestamp || timestamp === 0) {
    return '-'
  }
  // 判断是秒级还是毫秒级时间戳
  const ts = timestamp < 10000000000 ? timestamp * 1000 : timestamp

  // 兼容传入 string/bigint 等情况
  const date = new Date(Number(ts))
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  const {
    locale,
    timeZone,
    // 默认显示：日期 + 时间（24小时制会由不同地区自动选择/可覆盖）
    year = 'numeric',
    month = '2-digit',
    day = '2-digit',
    hour = '2-digit',
    minute = '2-digit',
    hour12
  } = options || {}

  // Intl 会自动按用户所在地区格式化（例如 en-US: 01/20/2026, 8:59 AM；zh-CN: 2026/01/20 20:59）
  return new Intl.DateTimeFormat(locale || undefined, {
    timeZone: timeZone || undefined,
    year,
    month,
    day,
    hour,
    minute,
    ...(hour12 === undefined ? {} : { hour12 })
  }).format(date)
}