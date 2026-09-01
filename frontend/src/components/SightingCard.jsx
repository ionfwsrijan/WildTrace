import React from 'react'
import { Link } from 'react-router-dom'

export default function SightingCard({ sighting, compact = false }) {
  const url = sighting.image_url
  const img = url.includes('/uploads/') || url.startsWith('http')
    ? url
    : `/uploads/${encodeURIComponent(url.split(/[\\/]/).pop())}`

  const when = new Date(sighting.captured_at).toLocaleString()
  const hasLoc = sighting.latitude != null && sighting.longitude != null

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <img src={img} alt="" className="w-12 h-12 rounded-lg object-cover" />
        <div className="min-w-0">
          <div className="text-sm font-medium text-forest-800 truncate">
            {sighting.individual_id || 'Unidentified'}
          </div>
          <div className="text-xs text-gray-500">
            {when}
            {hasLoc && ` · ${sighting.latitude.toFixed(2)}, ${sighting.longitude.toFixed(2)}`}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <img src={img} alt={sighting.individual_id || 'sighting'}
        className="w-full h-40 object-cover rounded-lg mb-3" />
      <div className="flex items-center justify-between">
        {sighting.individual_id ? (
          <Link to={`/individuals/${sighting.individual_id}`}
            className="font-semibold text-forest-700 hover:underline">
            {sighting.individual_id}
          </Link>
        ) : (
          <span className="font-semibold text-gray-500">Unidentified</span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          sighting.match_status === 'matched'
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'}`}>
          {sighting.match_status}
        </span>
      </div>
      <div className="mt-1 text-xs text-gray-500">{when}</div>
      {(sighting.zone_name || hasLoc) && (
        <div className="mt-1 text-xs text-gray-400">
          {sighting.zone_name || '—'}
          {hasLoc && ` (${sighting.latitude.toFixed(3)}, ${sighting.longitude.toFixed(3)})`}
        </div>
      )}
      {sighting.confidence_score != null && (
        <div className="mt-2 text-xs text-gray-600">
          Confidence: {(sighting.confidence_score * 100).toFixed(1)}%
        </div>
      )}
    </div>
  )
}