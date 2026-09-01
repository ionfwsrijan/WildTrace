import React, { useState } from 'react'
import { api } from '../api/client'
import IdentityMatchResult from '../components/IdentityMatchResult'

export default function UploadSighting() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [zone, setZone] = useState('')
  const [capturedAt, setCapturedAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function onFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError(null)
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const res = await api.upload({
        file,
        lat: lat ? parseFloat(lat) : null,
        lon: lon ? parseFloat(lon) : null,
        zone: zone || null,
        captured_at: capturedAt || null,
      })
      setResult(res)
    } catch (err) {
      setError(String(err.message || err))
    } finally {
      setBusy(false)
    }
  }

  const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/40'
  const labelCls = 'block text-sm font-medium text-gray-600 mb-1'

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest-900">Upload a Sighting</h1>
        <p className="text-sm text-gray-600 mt-1">
          Camera-trap photo → detect → embed → similarity search → match or register.
        </p>
      </header>

      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className={labelCls}>Camera-trap image *</label>
          <input type="file" accept="image/*" onChange={onFile} className="text-sm" required />
          {preview && (
            <img src={preview} alt="preview" className="mt-3 rounded-lg border h-48 object-cover" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Latitude</label>
            <input className={inputCls} value={lat} onChange={(e) => setLat(e.target.value)}
              placeholder="45.1000" />
          </div>
          <div>
            <label className={labelCls}>Longitude</label>
            <input className={inputCls} value={lon} onChange={(e) => setLon(e.target.value)}
              placeholder="136.2000" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Zone name</label>
          <input className={inputCls} value={zone} onChange={(e) => setZone(e.target.value)}
            placeholder="Sikhote-Alin Central" />
        </div>

        <div>
          <label className={labelCls}>Captured at (optional, ISO)</label>
          <input className={inputCls} value={capturedAt} onChange={(e) => setCapturedAt(e.target.value)}
            placeholder="2026-08-14T09:30:00" />
        </div>

        <button type="submit" disabled={busy}
          className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition">
          {busy ? 'Running pipeline…' : 'Run WildTrace pipeline'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {result && (
        <div className="mt-6">
          <IdentityMatchResult result={result} />
        </div>
      )}
    </div>
  )
}