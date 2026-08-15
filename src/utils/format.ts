import dayjs from 'dayjs'

const numberFormatter = new Intl.NumberFormat('zh-CN')

export function formatDateTime(value: string | null | undefined, fallback = '未公布') {
  if (!value) {
    return fallback
  }

  const parsed = dayjs(value)

  if (!parsed.isValid()) {
    return fallback
  }

  return parsed.format('YYYY.MM.DD HH:mm')
}

export function formatDateRange(start: string | null | undefined, end: string | null | undefined, fallback = '未公布') {
  const left = formatDateTime(start, '')
  const right = formatDateTime(end, '')

  if (left && right) {
    return `${left} - ${right}`
  }

  if (left) {
    return left
  }

  if (right) {
    return right
  }

  return fallback
}

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}
