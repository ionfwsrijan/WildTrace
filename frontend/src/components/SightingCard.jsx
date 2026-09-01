import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Camera } from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'

export default function SightingCard({ sighting, compact = false }) {
  const url = sighting.image_url
  const img = url.includes('/uploads/') || url.startsWith('http')
    ? url
    : `/uploads/${encodeURIComponent(url.split(/[\\/]/).pop())}`

  const when = new Date(sighting.captured_at).toLocaleString()
  const hasLoc = sighting.latitude != null && sighting.longitude != null
  const isMatched = sighting.match_status === 'matched'

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-ink-700/40 bg-[#15181d] p-2.5 shadow-card transition-shadow hover:shadow-cardHover">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Link to={`/individuals/${sighting.individual_id}`} className="truncate text-sm font-semibold text-ink-100 hover:text-brand-300">
              {sighting.individual_id || 'Unidentified'}
            </Link>
            {isMatched && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
          </div>
          <div className="truncate text-xs text-ink-500">
            {when}
            {hasLoc && ` · ${sighting.latitude.toFixed(2)}, ${sighting.longitude.toFixed(2)}`}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-cardHover">
      <div className="relative h-44 overflow-hidden bg-ink-100">
        <img src={img} alt={sighting.individual_id || 'sighting'} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute right-2 top-2">
          <Badge variant={isMatched ? 'green' : 'amber'}>{sighting.match_status}</Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {sighting.individual_id ? (
            <Link to={`/individuals/${sighting.individual_id}`} className="font-semibold text-ink-900 hover:text-brand-300">
              {sighting.individual_id}
            </Link>
          ) : (
            <span className="font-semibold text-ink-400">Unidentified</span>
          )}
          <div className="flex items-center gap-1 text-xs text-ink-500">
            <Camera className="h-3.5 w-3.5" /> {when}
          </div>
        </div>

        {(sighting.zone_name || hasLoc || sighting.confidence_score != null) && (
          <div className="mt-2 space-y-1 border-t border-ink-700/50 pt-2 text-xs text-ink-400">
            {(sighting.zone_name || hasLoc) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-400" />
                <span>{sighting.zone_name || '—'}</span>
                {hasLoc && <span className="text-ink-500">({sighting.latitude.toFixed(3)}, {sighting.longitude.toFixed(3)})</span>}
              </div>
            )}
            {sighting.confidence_score != null && (
              <div className="flex items-center justify-between">
                <span>Match confidence</span>
                <span className="font-semibold text-ink-800">{(sighting.confidence_score * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}