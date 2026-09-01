import React, { useState } from 'react'
import { ImagePlus, Camera, Loader2, MapPin, LandPlot, CalendarDays } from 'lucide-react'
import { api } from '../api/client'
import IdentityMatchResult from '../components/IdentityMatchResult'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'

const inputCls = [
  'w-full rounded-lg border border-ink-700 bg-[#15181d] px-3 py-2 text-sm text-white',
  'placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
  'transition',
].join(' ')
const labelCls = 'block text-sm font-medium text-ink-600 mb-1.5'

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <label className={`${labelCls} inline-flex items-center gap-1.5`}>
        <Icon className="h-4 w-4 text-brand-400" /> {label}
      </label>
      {children}
    </div>
  )
}

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
          <Camera className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Upload a Sighting</h1>
          <p className="text-sm text-ink-500">Camera trap → detect → embed → similarity search → match or register.</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>New observation</CardTitle>
          <CardDescription>Provide a photo and optional capture metadata.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <Field icon={ImagePlus} label="Camera-trap image *">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-700 bg-[#0c0e11] px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-500/10">
                <ImagePlus className="h-8 w-8 text-ink-500" />
                <span className="mt-2 text-sm font-medium text-ink-200">
                  {file ? file.name : 'Click to choose an image'}
                </span>
                <span className="text-xs text-ink-500">JPG or PNG · single camera-trap frame</span>
                <input type="file" accept="image/*" onChange={onFile} className="sr-only" required />
              </label>
              {preview && (
                <img src={preview} alt="preview" className="mt-3 h-48 w-full rounded-lg border border-ink-700 object-cover shadow-card" />
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field icon={MapPin} label="Latitude">
                <input className={inputCls} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="46.1000" />
              </Field>
              <Field icon={MapPin} label="Longitude">
                <input className={inputCls} value={lon} onChange={(e) => setLon(e.target.value)} placeholder="136.2000" />
              </Field>
            </div>

            <Field icon={LandPlot} label="Zone name">
              <input className={inputCls} value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Sikhote-Alin Central" />
            </Field>

            <Field icon={CalendarDays} label="Captured at (optional)">
              <input className={inputCls} value={capturedAt} onChange={(e) => setCapturedAt(e.target.value)} placeholder="2026-08-14T09:30:00" />
            </Field>

            <Button type="submit" disabled={busy} className="w-full" size="lg">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Running pipeline…</> : 'Run WildTrace pipeline'}
            </Button>

            {error && <p className="rounded-lg bg-red-600/15 px-3 py-2 text-sm text-red-300">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {result && <IdentityMatchResult result={result} />}
    </div>
  )
}