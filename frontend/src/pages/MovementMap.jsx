import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../api/client'

const tigerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function MovementMap() {
  const [selected, setSelected] = useState('all')
  const [individuals, setIndividuals] = useState([])
  const [sightings, setSightings] = useState([])

  useEffect(() => {
    api.individuals(200).then(setIndividuals).catch(console.error)
  }, [])

  useEffect(() => {
    api.sightings({ limit: 500 }).then(setSightings).catch(console.error)
  }, [])

  const visible = selected === 'all'
    ? sightings.filter((s) => s.latitude != null && s.longitude != null)
    : sightings.filter((s) => s.individual_id === selected && s.latitude != null && s.longitude != null)

  const series = selected !== 'all'
    ? [...visible].sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at))
    : []

  const center = visible.length
    ? [visible[0].latitude, visible[0].longitude]
    : [46.0, 136.5]

  const colorFor = (iid) => {
    const hue = (iid.split('-')[1] || '1') * 37 % 360
    return `hsl(${hue}, 65%, 42%)`
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-900">Movement Map</h1>
          <p className="text-sm text-gray-600">Plot an individual's sightings across the reserve.</p>
        </div>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="all">All individuals</option>
          {individuals.map((i) => <option key={i.id} value={i.id}>{i.id}</option>)}
        </select>
      </header>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <MapContainer center={center} zoom={9} style={{ height: 520, width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {selected === 'all' ? (
            visible.map((s) => (
              <Marker key={`${s.id}-${s.captured_at}`} position={[s.latitude, s.longitude]} icon={tigerIcon}>
                <Popup>
                  <b>{s.individual_id}</b><br />
                  {s.zone_name || 'Unknown zone'}<br />
                  {new Date(s.captured_at).toLocaleString()}<br />
                  {s.confidence_score != null ? `conf ${(s.confidence_score * 100).toFixed(0)}%` : 'new'}
                </Popup>
              </Marker>
            ))
          ) : (
            <>
              {series.map((s, i) => (
                <Circle key={s.id} center={[s.latitude, s.longitude]} radius={900}
                  pathOptions={{ color: colorFor(s.individual_id), fillOpacity: 0.25 }}>
                  <Popup>
                    <b>{s.individual_id}</b> · sighting {i + 1}<br />
                    {new Date(s.captured_at).toLocaleString()}
                  </Popup>
                </Circle>
              ))}
              {series.length > 1 && (
                <Polyline positions={series.map((s) => [s.latitude, s.longitude])}
                  pathOptions={{ color: '#d99a2b', weight: 3 }} />
              )}
            </>
          )}
        </MapContainer>
      </div>
      {selected === 'all' && (
        <p className="text-xs text-gray-500">
          Shown: {visible.length} geolocated sightings. Coordinates are demo-jittered.
        </p>
      )}
    </div>
  )
}