import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell,
} from 'recharts'
import { Users, Camera, BellRing, Layers, ArrowRight, Clock, MapPin } from 'lucide-react'
import { api } from '../api/client'
import StatCard from '../components/ui/stat-card'
import PageHeader from '../components/PageHeader'
import SightingCard from '../components/SightingCard'
import AlertBanner from '../components/AlertBanner'
import { Skeleton } from '../components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

function chartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink-700 bg-[#15181d] px-3 py-2 text-xs shadow-popover">
      <p className="font-semibold text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-ink-300">
          {p.name}: <span className="font-semibold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [individuals, setIndividuals] = useState([])

  useEffect(() => {
    api.stats().then(setStats).catch(console.error)
    api.individuals(8).then(setIndividuals).catch(console.error)
  }, [])

  const trend = useMemo(() => {
    if (!stats?.recent_sightings?.length) return []
    const counts = {}
    stats.recent_sightings.forEach((s) => {
      const day = new Date(s.captured_at).toISOString().slice(0, 10)
      counts[day] = (counts[day] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({
        day: new Date(day + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Sightings: count,
      }))
  }, [stats])

  const leaderboard = useMemo(() => [...individuals].sort((a, b) => (b.total_sightings ?? 0) - (a.total_sightings ?? 0)).slice(0, 8), [individuals])
  const maxSightings = leaderboard[0]?.total_sightings || 1

  if (!stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-80" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conservation Intelligence"
        title="Dashboard"
        description="Live monitoring of tracked tigers, sightings and flagged alerts."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-up">
        <StatCard icon={Users} label="Known Individuals" value={stats.total_individuals} tone="green" hint="across all reserves" />
        <StatCard icon={Camera} label="Total Sightings" value={stats.total_sightings} tone="blue" hint="all-time captures" />
        <StatCard icon={BellRing} label="Open Alerts" value={stats.open_alerts} tone="red" hint="awaiting verification" />
        <StatCard icon={Layers} label="Species Tracked" value={Object.keys(stats.species_breakdown).length} tone="amber" hint="re-ID coverage" />
      </div>

      {stats.open_alerts > 0 && <AlertBanner count={stats.open_alerts} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sightings over time */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Sighting Activity</CardTitle>
              <p className="text-sm text-ink-500">Recent captures by day</p>
            </div>
            <Badge variant="neutral" dot>auto-refresh</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="sightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2e8f51" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#2e8f51" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b94a1' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8b94a1' }} axisLine={false} tickLine={false} />
                <Tooltip content={chartTooltip} cursor={{ stroke: 'hsl(0 0% 25%)' }} />
                <Area type="natural" dataKey="Sightings" stroke="#2e8f51" strokeWidth={2.5} fill="url(#sightFill)" dot={{ r: 3, fill: '#2e8f51', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
            {trend.length === 0 && (
              <p className="py-16 text-center text-sm text-ink-500">No recent sightings to chart.</p>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Top Individuals</CardTitle>
            <Link to="/insights" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <ul className="divide-y divide-ink-700/40">
              {leaderboard.map((ind, idx) => (
                <li key={ind.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink-800/40 text-xs font-bold text-ink-300">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/individuals/${ind.id}`} className="block truncate text-sm font-semibold text-ink-100 hover:text-brand-300">
                      {ind.id}
                    </Link>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-800/40">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(ind.total_sightings / maxSightings) * 100}%` }} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-white">{ind.total_sightings}</div>
                    <div className="text-[11px] text-ink-500">sightings</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-ink-500">Latest verified sightings across the reserve</p>
          </div>
          <span className="hidden items-center gap-1.5 text-xs text-ink-500 sm:inline-flex">
            <Clock className="h-3.5 w-3.5" /> last {stats.recent_sightings.length} events
          </span>
        </CardHeader>
        <CardContent>
          {stats.recent_sightings.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink-500">
              No sightings yet — upload one or run the seed script.
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {stats.recent_sightings.slice(0, 6).map((s) => (
                <SightingCard key={s.id} sighting={s} compact />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}