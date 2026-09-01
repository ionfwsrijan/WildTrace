import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ChevronLeft, PawPrint, Camera, CalendarRange, Repeat } from 'lucide-react'
import { api } from '../api/client'
import Timeline from '../components/Timeline'
import SightingCard from '../components/SightingCard'
import MapView from '../components/MapView'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import StatCard from '../components/ui/stat-card'

function tooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink-700 bg-[#15181d] px-3 py-2 text-xs shadow-popover">
      <p className="font-semibold text-white">{label}</p>
      <p className="text-ink-300">Sightings: <span className="font-semibold text-white">{payload[0].value}</span></p>
    </div>
  )
}

export default function IndividualProfile() {
  const { id } = useParams()
  const [ind, setInd] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.individual(id).then(setInd).catch((e) => setError(String(e.message || e)))
  }, [id])

  const activity = useMemo(() => {
    if (!ind?.sightings?.length) return []
    const counts = {}
    ind.sightings.forEach((s) => {
      const day = new Date(s.captured_at).toISOString().slice(0, 10)
      counts[day] = (counts[day] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, c]) => ({
        day: new Date(day + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Sightings: c,
      }))
  }, [ind])

  if (error) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }
  if (!ind) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="flex items-center gap-5"><Skeleton className="h-28 w-28 rounded-xl" /><Skeleton className="h-20 w-64" /></div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    )
  }

  const imageUrl = ind.representative_image_url || ''
  const displayImage = imageUrl.includes('/uploads/') || imageUrl.startsWith('http')
    ? imageUrl
    : `/uploads/${encodeURIComponent(imageUrl.split(/[\\/]/).pop())}`

  const geoloc = (ind.sightings || []).filter((s) => s.latitude != null).length
  const rangeDays = ind.first_seen_at && ind.last_seen_at
    ? Math.max(1, Math.round((new Date(ind.last_seen_at) - new Date(ind.first_seen_at)) / 86400000))
    : 1

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 transition-colors hover:text-brand-300">
        <ChevronLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      {/* Profile hero */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500" />
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            {displayImage ? (
              <img src={displayImage} alt={ind.id} className="h-28 w-28 rounded-2xl object-cover ring-2 ring-brand-500/30 shadow-card" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-ink-800/40 text-5xl text-ink-500">
                <PawPrint />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">{ind.id}</h1>
              <Badge variant="green" dot>Tracked</Badge>
            </div>
            <p className="mt-0.5 text-sm text-ink-500">{ind.species}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-300">
              <span className="inline-flex items-center gap-1.5"><Camera className="h-4 w-4 text-brand-400" /><b className="text-white">{ind.total_sightings}</b> sightings</span>
              <span className="inline-flex items-center gap-1.5"><CalendarRange className="h-4 w-4 text-brand-400" />Since {new Date(ind.first_seen_at).toLocaleDateString()}</span>
              <span className="inline-flex items-center gap-1.5"><Repeat className="h-4 w-4 text-brand-400" />Avg {Math.round(ind.avg_sighting_interval_days * 10) / 10} d</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat chips */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-up">
        <StatCard icon={Camera} label="Total Sightings" value={ind.total_sightings} tone="green" />
        <StatCard icon={CalendarRange} label="Tracking Span" value={`${rangeDays} d`} tone="blue" />
        <StatCard icon={Repeat} label="Avg Interval" value={`${Math.round(ind.avg_sighting_interval_days * 10) / 10} d`} tone="amber" />
        <StatCard icon={PawPrint} label="Geolocated" value={geoloc} tone="violet" />
      </div>

      {activity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Observation Activity</CardTitle>
            <CardDescription>Sightings per day for {ind.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activity} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="profFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2e8f51" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2e8f51" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b94a1' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8b94a1' }} axisLine={false} tickLine={false} />
                <Tooltip content={tooltip} cursor={{ stroke: 'hsl(0 0% 25%)' }} />
                <Area type="monotone" dataKey="Sightings" stroke="#2e8f51" strokeWidth={2} fill="url(#profFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sighting Timeline</CardTitle>
            <CardDescription>Chronological record of detections</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline sightings={ind.sightings} />
          </CardContent>
        </Card>

        {geoloc > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Movement Range</CardTitle>
              <CardDescription>Geolocated sightings on the reserve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-ink-700/40">
                <MapView sightings={ind.sightings} height={320} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">All Sightings</h2>
          <Badge variant="neutral">{ind.sightings.length} records</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ind.sightings.map((s) => <SightingCard key={s.id} sighting={s} />)}
        </div>
      </div>
    </div>
  )
}