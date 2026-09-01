import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { Users, Activity, TrendingUp, Hash } from 'lucide-react'
import { api } from '../api/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import StatCard from '../components/ui/stat-card'
import PageHeader from '../components/PageHeader'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'

const PALETTE = ['#2e8f51', '#f5a623', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#64748b']

function chartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink-700 bg-[#15181d] px-3 py-2 text-xs shadow-popover">
      <p className="font-semibold text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-ink-300">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-semibold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function PopulationInsights() {
  const [individuals, setIndividuals] = useState([])

  useEffect(() => {
    api.individuals(500).then(setIndividuals).catch(console.error)
  }, [])

  const intervals = useMemo(
    () => individuals
      .filter((i) => i.avg_sighting_interval_days > 0)
      .sort((a, b) => b.total_sightings - a.total_sightings),
    [individuals],
  )

  const bySightings = useMemo(
    () => intervals.slice(0, 12).map((i) => ({
      id: i.id,
      sightings: i.total_sightings,
      interval: Math.round(i.avg_sighting_interval_days * 10) / 10,
    })),
    [intervals],
  )

  const activityByZone = useMemo(() => {
    const map = {}
    individuals.forEach((i) => (i.sightings || []).forEach((s) => {
      const z = s.zone_name || 'Unknown'
      map[z] = (map[z] || 0) + 1
    }))
    const arr = Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    const top = arr.slice(0, 6)
    const rest = arr.slice(6).reduce((acc, x) => acc + x.value, 0)
    if (rest > 0) top.push({ name: 'Other', value: rest })
    return top
  }, [individuals])

  const bins = useMemo(() => {
    if (!intervals.length) return []
    const max = Math.max(...intervals.map((i) => i.total_sightings))
    const groups = Math.min(8, max)
    const counts = new Array(groups).fill(0)
    intervals.forEach((i) => {
      const idx = i.total_sightings === max ? groups - 1 : Math.floor((i.total_sightings / (max + 1)) * groups)
      counts[idx] += 1
    })
    return counts.map((count, idx) => {
      const lo = Math.round(((idx) / groups) * max)
      const hi = Math.round((((idx + 1) / groups) * max)) - 1
      return { name: idx === groups - 1 ? `${lo}+` : `${lo}–${hi}`, Individuals: count }
    })
  }, [intervals])

  const totalSightings = intervals.reduce((a, i) => a + (i.total_sightings || 0), 0)
  const avgInterval = intervals.length ? intervals.reduce((a, i) => a + i.avg_sighting_interval_days, 0) / intervals.length : 0

  if (!individuals.length) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-72" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Population Analytics"
        title="Population Insights"
        description="Aggregate patterns across all tracked individuals in the reserve."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-up">
        <StatCard icon={Users} label="Tracked Individuals" value={individuals.length} tone="green" />
        <StatCard icon={Activity} label="Total Sightings" value={totalSightings} tone="blue" />
        <StatCard icon={TrendingUp} label="Avg Interval (days)" value={avgInterval.toFixed(1)} tone="amber" />
        <StatCard icon={Hash} label="Zones Active" value={new Set((individuals.flatMap((i) => (i.sightings || []).map((s) => s.zone_name)))).size} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sightings per individual */}
        <Card>
          <CardHeader>
            <CardTitle>Sightings per Individual</CardTitle>
            <CardDescription>Top tracked tigers by capture count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bySightings} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" vertical={false} />
                <XAxis dataKey="id" tick={{ fontSize: 11, fill: '#8b94a1' }} interval={0} angle={-32} height={58} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8b94a1' }} axisLine={false} tickLine={false} />
                <Tooltip content={chartTooltip} cursor={{ fill: 'hsl(0 0% 12%)' }} />
                <Bar dataKey="sightings" name="Sightings" radius={[4, 4, 0, 0]}>
                  {bySightings.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity by zone */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by Zone</CardTitle>
            <CardDescription>Share of sightings across the reserve</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={activityByZone} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2} stroke="none">
                  {activityByZone.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={chartTooltip} />
                <Legend
                  layout="vertical" align="right" verticalAlign="middle"
                  iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#adb4bf' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sighting Frequency Distribution</CardTitle>
          <CardDescription>How individuals are distributed by capture volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bins} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b94a1' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8b94a1' }} axisLine={false} tickLine={false} />
              <Tooltip content={chartTooltip} cursor={{ fill: 'hsl(0 0% 12%)' }} />
              <Bar dataKey="Individuals" name="Individuals" fill="#2e8f51" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tracking summary table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Tracking Summary</CardTitle>
            <CardDescription>Per-individual monitoring statistics</CardDescription>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/map">Open movement map</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink-700/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th className="py-3 pr-4">ID</th>
                  <th className="py-3 pr-4">Sightings</th>
                  <th className="py-3 pr-4">Relative volume</th>
                  <th className="py-3 pr-4">Avg interval</th>
                  <th className="py-3">First seen</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {intervals.map((i) => {
                  const pct = Math.min(100, (i.total_sightings / (intervals[0]?.total_sightings || 1)) * 100)
                  const active = (Date.now() - new Date(i.last_seen_at)) < 60 * 24 * 3600 * 1000
                  return (
                    <tr key={i.id} className="border-b border-ink-800/40 transition-colors hover:bg-ink-900/10">
                      <td className="py-3 pr-4">
                        <Link to={`/individuals/${i.id}`} className="font-semibold text-brand-400 hover:underline">{i.id}</Link>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-white">{i.total_sightings}</td>
                      <td className="py-3 pr-4">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-ink-800/50">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-ink-300">{Math.round(i.avg_sighting_interval_days * 10) / 10} d</td>
                      <td className="py-3 pr-4 text-ink-300">{new Date(i.first_seen_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Badge variant={active ? 'green' : 'neutral'} dot={active}>{active ? 'Active' : 'Resting'}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}