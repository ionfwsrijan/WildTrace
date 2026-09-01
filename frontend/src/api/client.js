const API = '' // vite proxy handles /api and /uploads -> :8000

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  stats: () => request('/api/dashboard/stats'),

  individuals: (limit = 50, offset = 0) =>
    request(`/api/individuals?limit=${limit}&offset=${offset}`),

  individual: (id) => request(`/api/individuals/${encodeURIComponent(id)}`),

  sightings: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null))
    return request(`/api/sightings?${qs}`)
  },

  alerts: (status) =>
    request(`/api/alerts${status ? `?status=${status}` : ''}`),

  resolveAlert: (id, reviewedBy, status = 'resolved') =>
    request(`/api/alerts/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewed_by: reviewedBy, status }),
    }),

  upload: async ({ file, lat, lon, zone, captured_at }) => {
    const fd = new FormData()
    fd.append('file', file)
    if (lat != null) fd.append('latitude', lat)
    if (lon != null) fd.append('longitude', lon)
    if (zone) fd.append('zone_name', zone)
    if (captured_at) fd.append('captured_at', captured_at)
    return request('/api/sightings/upload', { method: 'POST', body: fd })
  },
}