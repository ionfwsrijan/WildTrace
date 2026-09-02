import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { formatDateTime } from '../lib/format'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

/** Reusable map for an individual's sighting trail. */
export default function MapView({ sightings, height = 420 }) {
  const geo = sightings.filter((s) => s.latitude != null && s.longitude != null)
  const sorted = [...geo].sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at))
  const center = sorted.length
    ? [sorted[0].latitude, sorted[0].longitude]
    : [46.0, 136.5]

  return (
    <MapContainer center={center} zoom={8} style={{ height, width: '100%', borderRadius: '1.25rem' }}>
      <TileLayer
        attribution='Powered by Esri'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />
      {sorted.map((s, i) => (
        <Marker key={s.id} position={[s.latitude, s.longitude]} icon={markerIcon}>
          <Popup>
            Sighting {i + 1} · {new Date(s.captured_at).toLocaleString()}
            <br />{s.zone_name || 'Unknown zone'}
            <br />{formatDateTime(s.captured_at)}
          </Popup>
        </Marker>
      ))}
      {sorted.length > 1 && (
        <Polyline positions={sorted.map((s) => [s.latitude, s.longitude])}
          pathOptions={{ color: '#d99a2b', weight: 3 }} />
      )}
    </MapContainer>
  )
}