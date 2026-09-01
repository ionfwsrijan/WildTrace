import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import { Map, Waypoints, MapPin } from 'lucide-react'
import { api } from '../api/client'
import PageHeader from '../components/PageHeader'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'

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

  const visible = useMemo(
    () => (selected === 'all'
      ? sightings.filter((s) => s.latitude != null && s.longitude != null)
      : sightings.filter((s) => s.individual_id === selected && s.latitude != null && s.longitude != null)),
    [sightings, selected],
  )

  const series = useMemo(
    () => (selected !== 'all' ? [...visible].sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at)) : []),
    [visible, selected],
  )

  const center = visible.length ? [visible[0].latitude, visible[0].longitude] : [46.0, 136.5]

  const colorFor = (iid) => `hsl(${(iid.split('-')[1] || '1') * 37 % 360}, 65%, 42%)`

  const loading = sightings.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Spatial Analysis"
        title="Movement Map"
        description="Plot each individual's detections across the Sikhote-Alin reserve."
        icon={Map}
        actions={
          <div className="relative">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="appearance-none rounded-lg border border-ink-700 bg-[#15181d] py-2 pl-3 pr-9 text-sm font-medium text-white shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              <option value="all">All individuals</option>
              {individuals.map((i) => <option key={i.id} value={i.id}>{i.id}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
            </span>
          </div>
        }
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4"><Skeleton className="h-[520px] w-full rounded-xl" /></div>
          ) : (
            <MapContainer center={center} zoom={9} style={{ height: 520, width: '100%' }}>
              <TileLayer
                attribution='Powered by Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />
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
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-ink-700/40 bg-[#15181d] p-3.5 text-sm text-ink-400 shadow-card">
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-400" />
          Showing <b className="text-white">{visible.length}</b> geolocated sightings
        </span>
        {selected === 'all' && (
          <>
            <span className="inline-block h-3 w-px bg-ink-700" />
            <span className="inline-flex items-center gap-1.5"><Waypoints className="h-4 w-4 text-ink-500" />
              Select one individual to view its movement trail
            </span>
          </>
        )}
        <Badge variant="neutral" className="ml-auto">Coordinates demo-jittered</Badge>
      </div>
    </div>
  )
}