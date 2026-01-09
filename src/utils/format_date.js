import dayjs from 'dayjs'

export function formatMonthDay(date) {
  return dayjs(date).format("MM月DD日")
}

export function getDiffDays(startDate, endDate) {
  return dayjs(endDate).diff(startDate, "day")
}

// 格式化日期时间：YYYY-MM-DD HH:mm
export function formatDateTime(timestamp) {
  if (!timestamp || timestamp === 0) {
    return '-'
  }
  // 判断是秒级还是毫秒级时间戳
  const ts = timestamp < 10000000000 ? timestamp * 1000 : timestamp
  return dayjs(ts).format('YYYY-MM-DD HH:mm')
}