import React from 'react'

export default function Timeline({ sightings }) {
  const sorted = [...sightings].sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at))

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-400">No sightings recorded yet.</p>
  }

  return (
    <ol className="relative border-l-2 border-forest-200 ml-2">
      {sorted.map((s) => (
        <li key={s.id} className="mb-5 ml-6">
          <span className="absolute -left-[11px] mt-1 w-5 h-5 rounded-full bg-forest-500 border-2 border-white shadow" />
          <div className="bg-forest-50 rounded-lg px-3 py-2">
            <div className="text-sm font-medium text-forest-800">
              {new Date(s.captured_at).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {s.zone_name || 'Unknown zone'}
              {s.latitude != null && ` · ${s.latitude.toFixed(3)}, ${s.longitude.toFixed(3)}`}
              {s.confidence_score != null && ` · conf ${(s.confidence_score * 100).toFixed(0)}%`}
              {s.verified_by_human && ' · human-verified'}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}