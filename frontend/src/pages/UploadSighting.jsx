import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Upload, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Database 
} from 'lucide-react'
import { api } from '../api/client'
import { TopHeaderBar } from '../components/Navigation'
import { formatDateTime, safeImageUrl } from '../lib/format'

function toLocalInputValue(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`
}

const initialForm = {
  file: null,
  latitude: '45.854',
  longitude: '136.215',
  zone_name: 'Sikhote-Alin North',
  captured_at: toLocalInputValue(),
}

export default function UploadSighting() {
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'file') {
      const file = files?.[0] || null
      setFormData((curr) => ({ ...curr, file }))
      if (file) {
        setPreviewUrl(URL.createObjectURL(file))
      }
      return
    }
    setFormData((curr) => ({ ...curr, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.file) {
      setError('Please select a camera-trap capture image.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const payload = new FormData()
      payload.append('file', formData.file)
      if (formData.latitude) payload.append('latitude', formData.latitude)
      if (formData.longitude) payload.append('longitude', formData.longitude)
      if (formData.zone_name) payload.append('zone_name', formData.zone_name)
      if (formData.captured_at) payload.append('captured_at', formData.captured_at)

      const res = await api.uploadSighting(payload)
      setResult(res)
    } catch (err) {
      setError(err?.message || 'Processing failed. Check image format.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TopHeaderBar 
        title="Field Capture Intake" 
        subtitle="Submit raw camera-trap captures through the automated YOLOv8 and DenseNet121 re-ID pipeline" 
      />

      {/* 4-Stage Pipeline Tracker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { step: '01', title: 'YOLOv8 Detection', desc: 'Isolate & crop subject', icon: Camera },
          { step: '02', title: '512-d Embedding', desc: 'DenseNet triplet features', icon: Cpu },
          { step: '03', title: 'FAISS Index Search', desc: 'Cosine similarity match', icon: Database },
          { step: '04', title: 'Anomaly Check', desc: 'Ranger alert generation', icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.step} className="p-4 rounded-2xl bg-[#0f1511] border border-white/5 shadow-md flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16251b] border border-emerald-500/30 text-emerald-400">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Step {item.step}</p>
                <p className="text-xs font-semibold text-white">{item.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Upload Form & Result Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Column (lg:col-span-7) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 rounded-3xl border border-white/5 bg-[#0f1511] p-6 shadow-xl space-y-5">
          <h3 className="font-syne text-base font-bold text-white">Upload Camera-Trap File</h3>

          {/* Drag & Drop File Zone */}
          <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl bg-[#141d17]/50 hover:bg-[#141d17] transition-all cursor-pointer group">
            <input 
              type="file" 
              name="file" 
              accept="image/*" 
              onChange={handleChange} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
            {previewUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img src={previewUrl} alt="Preview" className="h-32 w-auto rounded-xl object-cover border border-emerald-500/40 shadow-lg" />
                <p className="text-xs text-emerald-400 font-semibold">{formData.file?.name}</p>
                <span className="text-[10px] text-white/50">Click to change capture image</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3.5 rounded-2xl bg-[#1a2b20] text-emerald-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-white">Drop camera-trap image here or browse</p>
                <p className="text-[10px] text-white/40">PNG, JPG, WEBP up to 20MB</p>
              </div>
            )}
          </label>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/60 mb-1">
                Latitude (GPS)
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 45.854"
                className="w-full rounded-xl border border-white/10 bg-[#141e18] p-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/60 mb-1">
                Longitude (GPS)
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. 136.215"
                className="w-full rounded-xl border border-white/10 bg-[#141e18] p-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/60 mb-1">
                Reserve Sector / Zone
              </label>
              <input
                type="text"
                name="zone_name"
                value={formData.zone_name}
                onChange={handleChange}
                placeholder="e.g. Sikhote-Alin North"
                className="w-full rounded-xl border border-white/10 bg-[#141e18] p-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/60 mb-1">
                Capture Timestamp
              </label>
              <input
                type="datetime-local"
                name="captured_at"
                value={formData.captured_at}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#141e18] p-3 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'Processing through Neural Pipeline...' : 'Run Autonomous Re-ID Pipeline'}
          </button>
        </form>

        {/* Result & Pipeline Output Column (lg:col-span-5) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/5 bg-[#0f1511] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="font-syne text-base font-bold text-white">Pipeline Verification Result</h3>
            <span className="text-[10px] text-emerald-400 font-semibold">Live Model Output</span>
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141f18] border border-emerald-500/30">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Identified Individual</p>
                  <p className="font-syne text-2xl font-bold text-emerald-400 mt-0.5">{result.individual_id}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40">
                  {result.match_status}
                </span>
              </div>

              {result.image_url && (
                <img 
                  src={safeImageUrl(result.image_url)} 
                  alt="Processed Capture" 
                  className="w-full h-48 rounded-2xl object-cover border border-white/10" 
                />
              )}

              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-white/70">
                <div className="flex justify-between">
                  <span>Cosine Similarity:</span>
                  <span className="text-white font-bold">{result.similarity ? (result.similarity * 100).toFixed(1) + '%' : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence Score:</span>
                  <span className="text-white font-bold">{result.confidence_score != null ? `${(result.confidence_score * 100).toFixed(1)}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Individual:</span>
                  <span className="text-emerald-400 font-bold">{result.is_new_individual ? 'Yes (Registered)' : 'No (Matched)'}</span>
                </div>
              </div>

              <Link
                to={`/individuals/${result.individual_id}`}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>View Full Individual Profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mx-auto text-white/40">
                <Sparkles className="h-6 w-6 text-emerald-400/50" />
              </div>
              <p className="font-syne text-sm font-bold text-white">Awaiting Input Capture</p>
              <p className="text-xs text-white/40 max-w-xs mx-auto">
                Submit an image on the left to extract the 512-d biometric embedding and query the FAISS database.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}