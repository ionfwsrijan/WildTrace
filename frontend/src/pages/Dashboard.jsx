import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import SightingCard from '../components/SightingCard'
import AlertBanner from '../components/AlertBanner'

function StatCard({ label, value, accent }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 p-5 ${accent}`}>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      <div className="text-3xl font-bold text-forest-800 mt-1">{value}</div>
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

  if (!stats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/50 rounded w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/50 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-forest-900">
          Conservation Intelligence Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Every Animal Has a Story. WildTrace Helps Remember It.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Known Individuals" value={stats.total_individuals} accent="border-forest-500" />
        <StatCard label="Total Sightings" value={stats.total_sightings} accent="border-amber-500" />
        <StatCard label="Open Alerts" value={stats.open_alerts} accent="border-red-500" />
        <StatCard label="Species Tracked" value={Object.keys(stats.species_breakdown).length} accent="border-blue-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-forest-800">Recently Tracked Individuals</h2>
            <Link to="/insights" className="text-sm text-forest-600 hover:underline">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {individuals.map((ind) => (
              <li key={ind.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link to={`/individuals/${ind.id}`} className="font-medium text-forest-800 hover:underline">
                    {ind.id}
                  </Link>
                  <span className="text-xs text-gray-400">({ind.species})</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{ind.total_sightings} sightings</span>
                  <span className="hidden sm:inline">{new Date(ind.last_seen_at).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-forest-800">Recent Activity</h2>
            <span className="text-xs text-gray-400">latest 10</span>
          </div>
          <div className="space-y-3">
            {stats.recent_sightings.length === 0 && (
              <p className="text-sm text-gray-400">No sightings yet. Upload one or run the seed script.</p>
            )}
            {stats.recent_sightings.slice(0, 5).map((s) => (
              <SightingCard key={s.id} sighting={s} compact />
            ))}
          </div>
        </section>
      </div>

      {stats.open_alerts > 0 && <AlertBanner count={stats.open_alerts} />}
    </div>
  )
}