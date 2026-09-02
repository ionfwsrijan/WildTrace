import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  TreePine, 
  Trees, 
  PawPrint, 
  FileText, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Activity
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { api } from '../api/client'
import { TopHeaderBar } from '../components/Navigation'
import { formatDateTime, safeImageUrl } from '../lib/format'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function buildMonthlyCounts(sightings) {
  const counts = MONTHS.map(() => 0)
  sightings.forEach((s) => {
    const m = new Date(s.captured_at).getMonth()
    if (m >= 0 && m <= 11) counts[m] += 1
  })
  return MONTHS.map((month, i) => ({ month, count: counts[i] }))
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(MONTHS.map((month) => ({ month, count: 0 })))

  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null))
    api.sightings({ limit: 1000 }).then((rows) => setChartData(buildMonthlyCounts(rows))).catch(() => {})
  }, [])

  const recentSightings = stats?.recent_sightings || []
  const totalIndividuals = stats?.total_individuals ?? 0
  const totalSightings = stats?.total_sightings ?? 0
  const openAlerts = stats?.open_alerts ?? 0

  // Left Quick Action Cards
  const quickActions = [
    { label: 'Species Census', icon: TreePine, to: '/insights', count: `${totalIndividuals} Ind.` },
    { label: 'Forest Habitats', icon: Trees, to: '/map', count: `${recentSightings.length} Recent` },
    { label: 'Wildlife Radar', icon: PawPrint, to: '/insights', count: `${totalSightings} Logs` },
    { label: 'Field Intake', icon: FileText, to: '/upload', count: 'Active' },
    { label: 'Ranger Alerts', icon: Users, to: '/alerts', count: `${openAlerts} Open` },
    { label: 'ATRW Re-ID', icon: ShieldCheck, to: '/insights', count: 'Live' },
  ]

  // Reserve Cards
  const reserveCards = [
    {
      title: 'Sikhote-Alin Core',
      region: 'Amur Tiger · Russia',
      bg: '/images/card_crooked_forest.jpg',
      badge: 'Protected Zone',
      to: '/map'
    },
    {
      title: 'Bikin Valley Reserve',
      region: 'Amur Leopard · Russia',
      bg: '/images/card_jiuzhaigou_purple.jpg',
      badge: 'Corridor',
      to: '/map'
    },
    {
      title: 'Sikhote-Alin Boreal',
      region: 'Amur Tiger · Russia',
      bg: '/images/card_redwood_forest.jpg',
      badge: 'Core Habitat',
      to: '/map'
    },
    {
      title: 'Coastal Ridge Grid',
      region: 'Amur Tiger · Russia',
      bg: '/images/card_daintree_blue.jpg',
      badge: 'Survey Grid',
      to: '/map'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TopHeaderBar title="Operational Overview" subtitle="Real-time biological monitoring & longitudinal individual tracking" />

      {/* Main Grid: Left 2x4 Icon Grid + Right Hero Banner & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 2x4 Quick Action Tiles (lg:col-span-4) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
          {quickActions.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                to={item.to}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0f1511] border border-white/5 hover:border-emerald-500/40 hover:bg-[#121c16] transition-all transform hover:-translate-y-1 shadow-lg text-center"
              >
                {/* Glowing neon green icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16251b] border border-emerald-500/30 text-emerald-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all mb-3">
                  <Icon className="h-6 w-6 stroke-[1.75]" />
                </div>
                <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {item.label}
                </p>
                <span className="text-[10px] text-white/40 mt-0.5">{item.count}</span>
              </Link>
            )
          })}
        </div>

        {/* Right Section: Hero Banner + 4 Reserve Cards (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hero Banner with Silhouette Wolf & Moon */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1410] p-6 sm:p-8 min-h-[200px] flex flex-col justify-between shadow-2xl">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-right sm:bg-center opacity-85 pointer-events-none"
              style={{ backgroundImage: "url('/images/hero_night_wildlife.jpg')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            </div>

            {/* Banner Copy & Glowing Green CTA */}
            <div className="relative z-10 max-w-md space-y-3">
              <h2 className="font-syne text-xl sm:text-2xl font-bold leading-snug text-white">
                We are making wildlife tracking <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]">autonomous</span>, one individual at a time.
              </h2>
              <p className="text-xs text-white/70 leading-relaxed">
                YOLOv8 animal localization paired with triplet-loss re-identification vectors.
              </p>
            </div>

            <div className="relative z-10 pt-4">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5"
              >
                Log New Sighting <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 4 Destination / Reserve Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {reserveCards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="group relative overflow-hidden rounded-2xl border border-white/10 aspect-[3/4] flex flex-col justify-end p-4 shadow-xl transition-all transform hover:-translate-y-1.5 hover:border-emerald-500/40"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${card.bg}')` }}
                />
                {/* Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* Content */}
                <div className="relative z-10 space-y-1">
                  <h4 className="font-syne text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                    {card.title}
                  </h4>
                  <p className="text-[10px] text-white/60 leading-tight">
                    {card.region}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom Section: Multi-Color Glowing Spline Analytics Chart */}
      <div className="rounded-3xl border border-white/5 bg-[#0e1410] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h3 className="font-syne text-base md:text-lg font-bold text-white">
                Annual Sighting Detections & Encounter Activity
              </h3>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Aggregated camera-trap sightings and verified re-identification throughput
            </p>
          </div>
        </div>

        {/* Glowing Spline Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="neonSpline" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="25%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="75%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="neonSplineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1410',
                  borderColor: 'rgba(16,185,129,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                }}
                formatter={(value) => [`${value} Sightings`, 'Detections']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#neonSpline)"
                strokeWidth={3}
                fill="url(#neonSplineFill)"
                dot={{ fill: '#10b981', r: 3, strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}