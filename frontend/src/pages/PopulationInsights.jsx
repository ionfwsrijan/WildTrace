import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Area,
  AreaChart
} from 'recharts'
import { 
  PawPrint, 
  Activity, 
  TrendingUp, 
  Users, 
  TreePine, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { api } from '../api/client'
import { TopHeaderBar } from '../components/Navigation'
import { formatDate } from '../lib/format'

const PALETTE = ['#10b981', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#84cc16']

export default function PopulationInsights() {
  const [individuals, setIndividuals] = useState([])

  useEffect(() => {
    api.individuals(500).then(setIndividuals).catch(() => setIndividuals([]))
  }, [])

  const intervals = useMemo(
    () => individuals
      .filter((individual) => individual.avg_sighting_interval_days > 0)
      .sort((a, b) => b.total_sightings - a.total_sightings),
    [individuals],
  )

  const bySightings = useMemo(
    () => intervals.slice(0, 10).map((individual) => ({
      id: individual.id,
      sightings: individual.total_sightings,
      interval: Math.round(individual.avg_sighting_interval_days * 10) / 10,
    })),
    [intervals],
  )

  const activityByZone = useMemo(() => {
    const counts = {}
    individuals.forEach((individual) => (individual.sightings || []).forEach((sighting) => {
      const zone = sighting.zone_name || 'Unknown Zone'
      counts[zone] = (counts[zone] || 0) + 1
    }))
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [individuals])

  const avgInterval = useMemo(() => {
    const avg = intervals.reduce((sum, ind) => sum + (ind.avg_sighting_interval_days || 0), 0) / (intervals.length || 1)
    return avg > 0 ? `${avg.toFixed(1)} Days` : '—'
  }, [intervals])

  const avgSightingsPerTiger = useMemo(
    () => (individuals.length ? `${(individuals.reduce((sum, ind) => sum + (ind.total_sightings || 0), 0) / individuals.length).toFixed(1)}` : '—'),
    [individuals],
  )

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TopHeaderBar 
        title="Population & Species Insights" 
        subtitle="Longitudinal cohort trends, sighting frequencies, and habitat distributions" 
      />

      {/* Top Summary Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0f1511] border border-white/5 shadow-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Total Registered</p>
          <p className="mt-1 font-syne text-2xl font-bold text-emerald-400">{individuals.length} Tigers</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f1511] border border-white/5 shadow-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Avg. Re-ID Interval</p>
          <p className="mt-1 font-syne text-2xl font-bold text-cyan-400">{avgInterval}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f1511] border border-white/5 shadow-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Model Embedding</p>
          <p className="mt-1 font-syne text-2xl font-bold text-purple-400">512-d Triplet</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f1511] border border-white/5 shadow-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Avg. Sightings per Tiger</p>
          <p className="mt-1 font-syne text-2xl font-bold text-emerald-400">{avgSightingsPerTiger}</p>
        </div>
      </div>

      {/* Charts Grid: Left Sighting Distribution + Right Zone Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sighting Frequency per Individual (lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/5 bg-[#0f1511] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-syne text-base font-bold text-white">Capture Frequency per Individual</h3>
              <p className="text-xs text-white/50">Total validated sightings for top tracked tigers</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySightings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="id" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1410',
                    borderColor: 'rgba(16,185,129,0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="sightings" radius={[8, 8, 0, 0]}>
                  {bySightings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Activity Breakdown (lg:col-span-5) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/5 bg-[#0f1511] p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-syne text-base font-bold text-white">Zone Territorial Density</h3>
            <p className="text-xs text-white/50">Capture density across reserve sectors</p>
          </div>

          <div className="space-y-3 pt-2">
            {activityByZone.map((zone, idx) => (
              <div key={zone.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">{zone.name}</span>
                  <span className="text-emerald-400 font-bold">{zone.value} captures</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-500"
                    style={{ width: `${Math.min(100, (zone.value / (activityByZone[0]?.value || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tracked Individuals Directory Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-syne text-lg font-bold text-white">Tracked Individuals Directory</h3>
          <span className="text-xs text-emerald-400 font-semibold">{individuals.length} Profiles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {individuals.map((ind) => (
            <Link
              key={ind.id}
              to={`/individuals/${ind.id}`}
              className="group p-5 rounded-2xl bg-[#0f1511] border border-white/5 hover:border-emerald-500/40 hover:bg-[#121c16] transition-all transform hover:-translate-y-1 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-syne font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                  {ind.id}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {ind.species || 'Amur Tiger'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-white/50">
                <p>Sightings: <span className="text-white font-semibold">{ind.total_sightings} captures</span></p>
                <p>First seen: <span className="text-white font-semibold">{formatDate(ind.first_seen_at)}</span></p>
                <p>Last seen: <span className="text-white font-semibold">{formatDate(ind.last_seen_at)}</span></p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform pt-1">
                <span>View Longitudinal Profile</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}