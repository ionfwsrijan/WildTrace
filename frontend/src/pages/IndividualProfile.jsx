import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowLeft, CalendarRange, Camera, MapPin, PawPrint, Repeat, ShieldCheck, Sparkles } from 'lucide-react'
import { api } from '../api/client'
import { TopHeaderBar } from '../components/Navigation'
import { formatDate, formatDateTime, safeImageUrl } from '../lib/format'

export default function IndividualProfile() {
  const { id } = useParams()
  const [ind, setInd] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.individual(id).then(setInd).catch((e) => setError(String(e.message || e)))
  }, [id])

  const activity = useMemo(() => {
    if (!ind?.sightings?.length) return []
    const counts = {}
    ind.sightings.forEach((sighting) => {
      const day = new Date(sighting.captured_at).toISOString().slice(0, 10)
      counts[day] = (counts[day] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({
        day: new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Sightings: count,
      }))
  }, [ind])

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-[#0f1511] border border-red-500/30 text-center space-y-3">
        <p className="font-syne text-lg font-bold text-white">Error loading profile</p>
        <p className="text-xs text-red-400">{error}</p>
        <Link to="/insights" className="inline-flex items-center gap-2 text-xs text-emerald-400 font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Species Directory
        </Link>
      </div>
    )
  }

  if (!ind) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-white/50">Fetching longitudinal profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TopHeaderBar 
        title={`Individual Profile · ${ind.id}`} 
        subtitle={`Longitudinal tracking history for ${ind.species || 'Amur Tiger'}`} 
      />

      {/* Back Link */}
      <div>
        <Link 
          to="/insights" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Population Directory
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Profile Info Card (lg:col-span-5) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0f1511] border border-white/5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-syne text-2xl font-bold text-white">{ind.id}</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
              {ind.species || 'Amur Tiger'}
            </span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-[#141c16] border border-white/5">
              <span className="text-white/50">Total Sightings</span>
              <span className="font-bold text-emerald-400">{ind.total_sightings} verified</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#141c16] border border-white/5">
              <span className="text-white/50">First Detected</span>
              <span className="font-bold text-white">{formatDate(ind.first_seen_at)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#141c16] border border-white/5">
              <span className="text-white/50">Last Captured</span>
              <span className="font-bold text-white">{formatDate(ind.last_seen_at)}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#141c16] border border-white/5">
              <span className="text-white/50">Mean Interval</span>
              <span className="font-bold text-cyan-400">
                {ind.avg_sighting_interval_days ? `${ind.avg_sighting_interval_days.toFixed(1)} days` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Activity Chart (lg:col-span-7) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0f1511] border border-white/5 shadow-xl space-y-4">
          <h3 className="font-syne text-base font-bold text-white">Temporal Sighting Distribution</h3>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="indFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1410',
                    borderColor: 'rgba(16,185,129,0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="Sightings" stroke="#10b981" strokeWidth={3} fill="url(#indFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Sighting Captures Gallery */}
      <div className="space-y-4 pt-2">
        <h3 className="font-syne text-lg font-bold text-white">Sighting History & Capture Gallery</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(ind.sightings || []).map((sighting) => (
            <div 
              key={sighting.id} 
              className="rounded-2xl bg-[#0f1511] border border-white/5 overflow-hidden shadow-lg space-y-3 p-4"
            >
              <img 
                src={safeImageUrl(sighting.image_url)} 
                alt={`Sighting ${sighting.id}`} 
                className="w-full h-40 object-cover rounded-xl border border-white/10"
              />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 font-bold">{sighting.zone_name || 'Zone N/A'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                    {sighting.match_status}
                  </span>
                </div>
                <p className="text-[11px] text-white/50">{formatDateTime(sighting.captured_at)}</p>
                {sighting.confidence_score != null && (
                  <p className="text-[11px] text-white/70">Confidence: {(sighting.confidence_score * 100).toFixed(1)}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}