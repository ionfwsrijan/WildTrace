import React from 'react'
import { Link } from 'react-router-dom'

export default function IdentityMatchResult({ result }) {
  const isNew = result.is_new_individual

  return (
    <div className={`rounded-xl shadow-md overflow-hidden border ${
      isNew ? 'bg-amber-50 border-amber-300' : 'bg-green-50 border-green-300'}`}>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isNew ? '🆕' : '✅'}</span>
          <h2 className="font-display text-xl font-bold text-forest-900">
            {isNew ? 'New Individual Registered' : 'Known Individual Matched'}
          </h2>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500">Individual</div>
            <Link to={`/individuals/${result.individual_id}`}
              className="font-bold text-forest-800 text-lg hover:underline">
              {result.individual_id}
            </Link>
          </div>
          <div>
            <div className="text-gray-500">Match status</div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isNew ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
              {result.match_status}
            </span>
          </div>
          {!isNew && (
            <div>
              <div className="text-gray-500">Similarity (vs nearest)</div>
              <div className="font-semibold">
                {(result.similarity * 100).toFixed(1)}%
                <span className="text-xs text-gray-400 ml-2">
                  ≥ {result.matched_individual}
                </span>
              </div>
            </div>
          )}
          <div>
            <div className="text-gray-500">Sighting record</div>
            <div className="font-semibold">#{result.sighting_id}</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>Detection: {result.detection_meta?.fallback
            ? result.detection_meta.reason
            : `bbox ${result.detection_meta?.bbox ? result.detection_meta.bbox.join(', ') : 'n/a'} · score ${result.detection_meta?.score != null ? Number(result.detection_meta.score).toFixed(2) : 'n/a'}`}</p>
          {result.created_alert && (
            <p className="text-amber-700">⚑ Created alert #{result.created_alert}</p>
          )}
          <p>Pipeline stages: detect → embed → FAISS similarity search → match/register → store</p>
        </div>
      </div>
    </div>
  )
}