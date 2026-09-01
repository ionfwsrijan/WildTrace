import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from 'recharts'
import { api } from '../api/client'

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
    () => intervals.slice(0, 15).map((i) => ({
      id: i.id,
      sightings: i.total_sightings,
      interval: Math.round(i.avg_sighting_interval_days * 10) / 10,
    })),
    [intervals],
  )

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
      return { name: idx === groups - 1 ? `${lo}+` : `${lo}-${hi}`, Individuals: count }
    })
  }, [intervals])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-forest-900">Population Insights</h1>
        <p className="text-sm text-gray-600">Aggregate patterns across tracked individuals.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-forest-800 mb-4">Sightings per Individual</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={bySightings} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="id" tick={{ fontSize: 11 }} interval={0} angle={-35} height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="sightings" radius={[4, 4, 0, 0]}>
                {bySightings.map((_, i) => <Cell key={i} fill={i % 2 ? '#d99a2b' : '#2f7d4f'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-forest-800 mb-4">Sighting Frequency Distribution</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={bins} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Individuals" fill="#2f7d4f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-forest-800 mb-3">Tracking Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">ID</th><th className="py-2">Sightings</th>
                <th className="py-2">Avg interval (days)</th><th className="py-2">First seen</th>
              </tr>
            </thead>
            <tbody>
              {intervals.map((i) => (
                <tr key={i.id} className="border-b border-gray-50">
                  <td className="py-2"><Link to={`/individuals/${i.id}`} className="text-forest-600 hover:underline font-medium">{i.id}</Link></td>
                  <td className="py-2">{i.total_sightings}</td>
                  <td className="py-2">{Math.round(i.avg_sighting_interval_days * 10) / 10}</td>
                  <td className="py-2">{new Date(i.first_seen_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}