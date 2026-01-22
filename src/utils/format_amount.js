import { formatUnits } from 'viem'

/**
 * 通用金额格式化
 * - 兼容后端返回：wei(整数字符串/bigint/number) 或 已是小数字符串
 * - 支持指定精度 decimals
 * - 支持千分位
 * - 支持保留小数位并去尾 0
 */
export const formatTokenAmount = (
  value,
  {
    decimals = 6,
    maxFractionDigits = 4,
    useGrouping = true,
  } = {}
) => {
  if (value === null || value === undefined || value === '' || value === '0' || value === 0) return '0'

  try {
    // 已是小数形式（例如 "12.34"），直接裁剪
    if (typeof value === 'string' && value.includes('.')) {
      const [intPartRaw, fracRaw = ''] = value.split('.')
      const frac = fracRaw.slice(0, Math.max(0, maxFractionDigits)).replace(/0+$/, '')
      const intFormatted = useGrouping ? Number(intPartRaw || 0).toLocaleString('en-US') : (intPartRaw || '0')
      return frac ? `${intFormatted}.${frac}` : intFormatted
    }

    let num
    if (typeof value === 'bigint') {
      num = parseFloat(formatUnits(value, decimals))
    } else if (typeof value === 'number') {
      num = value / Math.pow(10, decimals)
    } else {
      num = parseFloat(formatUnits(BigInt(value.toString()), decimals))
    }

    if (!Number.isFinite(num)) return '0'

    const fixed = num.toFixed(Math.max(0, maxFractionDigits))
    const trimmed = fixed.replace(/\.?0+$/, '')
    const [intPart, decimalPart] = trimmed.split('.')
    const intFormatted = useGrouping ? Number(intPart || 0).toLocaleString('en-US') : (intPart || '0')
    return decimalPart ? `${intFormatted}.${decimalPart}` : intFormatted
  } catch (e) {
    console.error('formatTokenAmount failed:', e, value)
    return '0'
  }
}

// CHO：18 精度
export const formatChoAmount = (value, opts = {}) => {
  console.log(value)
  return formatTokenAmount(value, { decimals: 6, ...opts })
}


