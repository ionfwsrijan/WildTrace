import React, { useEffect, useMemo, useState } from 'react'
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { 
  Compass, 
  MapPin, 
  Layers, 
  Activity, 
  Eye, 
  Navigation2, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react'
import { api } from '../api/client'
import { TopHeaderBar } from '../components/Navigation'
import { formatDateTime, safeImageUrl } from '../lib/format'

const createCustomPin = (color = '#10b981') => L.divIcon({
  className: 'custom-pin',
  html: `<div style="
    background: ${color};
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 12px ${color}, 0 0 4px #000;
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
})

export default function MovementMap() {
  const [selected, setSelected] = useState('all')
  const [individuals, setIndividuals] = useState([])
  const [sightings, setSightings] = useState([])

  useEffect(() => {
    api.individuals(200).then(setIndividuals).catch(() => setIndividuals([]))
    api.sightings({ limit: 500 }).then(setSightings).catch(() => setSightings([]))
  }, [])

  const visible = useMemo(
    () => (selected === 'all'
      ? sightings.filter((sighting) => sighting.latitude != null && sighting.longitude != null)
      : sightings.filter((sighting) => sighting.individual_id === selected && sighting.latitude != null && sighting.longitude != null)),
    [sightings, selected],
  )

  const series = useMemo(
    () => (selected !== 'all' ? [...visible].sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at)) : []),
    [visible, selected],
  )

  const center = visible.length ? [visible[0].latitude, visible[0].longitude] : [45.5, 136.0]
  const visibleIndividuals = useMemo(() => new Set(visible.map((sighting) => sighting.individual_id)).size, [visible])
  const zones = useMemo(() => new Set(visible.map((sighting) => sighting.zone_name || 'Unknown')).size, [visible])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TopHeaderBar 
        title="Reserve Movement Map" 
        subtitle="Geolocated camera-trap sightings and longitudinal individual travel trails" 
      />

      {/* Control Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f1511] border border-white/5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-xs font-semibold text-white">Live Tracking Grid</span>
          <span className="text-xs text-white/40">({visible.length} points active)</span>
        </div>

        {/* Individual Selector Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60">Filter Individual:</span>
          <div className="relative">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="appearance-none rounded-xl border border-emerald-500/40 bg-[#141f18] px-4 py-2 pr-9 text-xs font-semibold text-emerald-400 outline-none shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <option value="all">All Tracked Tigers (Survey View)</option>
              {individuals.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.id} ({ind.species || 'Amur Tiger'})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Stat Metric Pills (4 Columns) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0f1511] border border-white/5 shadow-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Visible Markers</p>
          <p className="mt-1 font-syne text-2xl font-bold text-emerald-400">{visible.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f1511] border border-white/5 shadow-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Unique Tigers</p>
          <p className="mt-1 font-syne text-2xl font-bold text-white">{visibleIndividuals}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f1511] border border-white/5 shadow-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Active Zones</p>
          <p className="mt-1 font-syne text-2xl font-bold text-cyan-400">{zones}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f1511] border border-white/5 shadow-md">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">View Mode</p>
          <p className="mt-1 font-syne text-2xl font-bold text-purple-400">
            {selected === 'all' ? 'All Grid' : 'Trail Path'}
          </p>
        </div>
      </div>

      {/* Map Layout: Left Map + Right Sighting Trail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Leaflet Map Frame (lg:col-span-8) */}
        <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1410] relative">
          <MapContainer 
            center={center} 
            zoom={selected === 'all' ? 8 : 9} 
            style={{ height: '580px', width: '100%' }}
          >
            <TileLayer
              attribution="Powered by Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

            {/* Sighting Points */}
            {visible.map((sighting) => (
              <Marker
                key={`point-${sighting.id}`}
                position={[sighting.latitude, sighting.longitude]}
                icon={createCustomPin(sighting.match_status === 'matched' ? '#10b981' : '#f59e0b')}
              >
                <Popup className="dark-popup">
                  <div className="p-2 text-black space-y-1">
                    <p className="font-bold text-sm text-emerald-800">{sighting.individual_id || 'Unidentified'}</p>
                    <p className="text-xs text-gray-600">{sighting.zone_name}</p>
                    <p className="text-[10px] text-gray-500">{formatDateTime(sighting.captured_at)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Polyline connecting trail for single individual */}
            {series.length > 1 && (
              <Polyline
                positions={series.map((s) => [s.latitude, s.longitude])}
                pathOptions={{ color: '#10b981', weight: 4, opacity: 0.85, dashArray: '6, 6' }}
              />
            )}
          </MapContainer>
        </div>

        {/* Right Sighting History Feed (lg:col-span-4) */}
        <div className="lg:col-span-4 rounded-3xl border border-white/5 bg-[#0f1511] p-5 shadow-xl space-y-4 max-h-[580px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="font-syne text-sm font-bold text-white">Sighting Timeline</h3>
            <span className="text-[10px] text-emerald-400 font-semibold">{visible.length} records</span>
          </div>

          <div className="space-y-3">
            {visible.slice(0, 10).map((sighting) => (
              <div 
                key={sighting.id} 
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#141c16] border border-white/5 hover:border-emerald-500/30 transition-all"
              >
                <img 
                  src={safeImageUrl(sighting.image_url)} 
                  alt={sighting.individual_id} 
                  className="h-14 w-14 rounded-xl object-cover border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-syne font-bold text-xs text-white truncate">
                      {sighting.individual_id || 'WT-Anomaly'}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {sighting.match_status}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 mt-0.5">{sighting.zone_name}</p>
                  <p className="text-[9px] text-white/40">{formatDateTime(sighting.captured_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}