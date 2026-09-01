import React from 'react'
import { Camera, MapPin, ShieldCheck } from 'lucide-react'

export default function Timeline({ sightings }) {
  const sorted = [...sightings].sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at))

  if (sorted.length === 0) {
    return <p className="py-6 text-sm text-ink-500">No sightings recorded yet.</p>
  }

  return (
    <ol className="relative ml-1.5 space-y-0">
      <span className="absolute bottom-2 left-[11px] top-2 w-0.5 rounded-full bg-ink-100" aria-hidden />
      {sorted.map((s) => (
        <li key={s.id} className="relative ml-7 pb-5 last:pb-1">
          <span className="absolute -left-[22px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#121418] bg-brand-500 shadow-sm ring-1 ring-ink-700">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          <div className="rounded-lg border border-ink-700/40 bg-[#15181d] p-3 shadow-card transition-shadow hover:shadow-cardHover">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink-100">
                {new Date(s.captured_at).toLocaleString()}
              </span>
              {s.verified_by_human && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> human-verified
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              {(s.zone_name || s.latitude != null) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brand-400" />
                  {s.zone_name || 'Unknown zone'}
                  {s.latitude != null && ` · ${s.latitude.toFixed(3)}, ${s.longitude.toFixed(3)}`}
                </span>
              )}
              {s.confidence_score != null && (
                <span className="inline-flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5 text-ink-500" />
                  conf {(s.confidence_score * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}