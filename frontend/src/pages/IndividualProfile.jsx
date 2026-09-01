import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import Timeline from '../components/Timeline'
import SightingCard from '../components/SightingCard'
import MapView from '../components/MapView'

export default function IndividualProfile() {
  const { id } = useParams()
  const [ind, setInd] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.individual(id).then(setInd).catch((e) => setError(String(e.message || e)))
  }, [id])

  if (error) return <p className="text-red-600">{error}</p>
  if (!ind) return <div className="animate-pulse h-40 bg-white/50 rounded-xl" />

  const imageUrl = ind.representative_image_url || ''
  const displayImage = imageUrl.includes('/uploads/') || imageUrl.startsWith('http')
    ? imageUrl
    : `/uploads/${encodeURIComponent(imageUrl.split(/[\\/]/).pop())}`

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-5">
        {imageUrl ? (
          <img src={displayImage} alt={ind.id}
            className="w-28 h-28 rounded-xl object-cover border-2 border-forest-500 shadow" />
        ) : (
          <div className="w-28 h-28 rounded-xl bg-gray-200 flex items-center justify-center text-4xl">🐯</div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-900">{ind.id}</h1>
          <p className="text-sm text-gray-600">{ind.species}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
            <span><b className="text-forest-800">{ind.total_sightings}</b> sightings</span>
            <span>First: {new Date(ind.first_seen_at).toLocaleDateString()}</span>
            <span>Last: {new Date(ind.last_seen_at).toLocaleDateString()}</span>
            <span>Avg interval: {Math.round(ind.avg_sighting_interval_days * 10) / 10} days</span>
          </div>
        </div>
      </header>

      <section className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-forest-800 mb-4">Sighting Timeline</h2>
        <Timeline sightings={ind.sightings} />
      </section>

      {ind.sightings.some((s) => s.latitude != null) && (
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-forest-800 mb-4">Movement</h2>
          <MapView sightings={ind.sightings} height={360} />
        </section>
      )}

      <section>
        <h2 className="font-semibold text-forest-800 mb-3">All Sightings</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ind.sightings.map((s) => <SightingCard key={s.id} sighting={s} />)}
        </div>
      </section>
    </div>
  )
}