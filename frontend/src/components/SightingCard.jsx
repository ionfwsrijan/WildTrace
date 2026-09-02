import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Camera } from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { formatDateTime, formatCoordinatePair, safeImageUrl } from '../lib/format'

export default function SightingCard({ sighting, compact = false }) {
  const img = safeImageUrl(sighting.image_url)

  const when = formatDateTime(sighting.captured_at)
  const hasLoc = sighting.latitude != null && sighting.longitude != null
  const isMatched = sighting.match_status === 'matched'

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/5">
          <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Link to={`/individuals/${sighting.individual_id}`} className="truncate text-sm font-semibold text-white hover:text-earth-gold">
              {sighting.individual_id || 'Unidentified'}
            </Link>
            {isMatched && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
          </div>
          <div className="truncate text-xs text-on-surface-variant">
            {when}
            {hasLoc && ` · ${formatCoordinatePair(sighting.latitude, sighting.longitude, 2)}`}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-cardHover">
      <div className="relative h-44 overflow-hidden bg-white/5">
        <img src={img} alt={sighting.individual_id || 'sighting'} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute right-2 top-2">
          <Badge variant={isMatched ? 'green' : 'amber'}>{sighting.match_status}</Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {sighting.individual_id ? (
            <Link to={`/individuals/${sighting.individual_id}`} className="font-semibold text-white hover:text-earth-gold">
              {sighting.individual_id}
            </Link>
          ) : (
            <span className="font-semibold text-on-surface-variant">Unidentified</span>
          )}
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            <Camera className="h-3.5 w-3.5" /> {when}
          </div>
        </div>

        {(sighting.zone_name || hasLoc || sighting.confidence_score != null) && (
          <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-on-surface-variant">
            {(sighting.zone_name || hasLoc) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-earth-gold" />
                <span>{sighting.zone_name || '—'}</span>
                {hasLoc && <span className="text-on-surface-variant/70">({formatCoordinatePair(sighting.latitude, sighting.longitude)})</span>}
              </div>
            )}
            {sighting.confidence_score != null && (
              <div className="flex items-center justify-between">
                <span>Match confidence</span>
                <span className="font-semibold text-white">{(sighting.confidence_score * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}