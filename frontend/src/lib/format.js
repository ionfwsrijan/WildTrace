export function safeImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/')) {
    return url
  }

  const fileName = String(url).split(/[\\/]/).pop()
  return `/uploads/${encodeURIComponent(fileName)}`
}

export function formatDateTime(value, options = {}) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatCoordinatePair(latitude, longitude, digits = 3) {
  if (latitude == null || longitude == null) return 'No coordinates'
  return `${Number(latitude).toFixed(digits)}, ${Number(longitude).toFixed(digits)}`
}

export function formatPercent(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${(Number(value) * 100).toFixed(digits)}%`
}