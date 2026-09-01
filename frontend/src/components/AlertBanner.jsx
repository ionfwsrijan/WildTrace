import React from 'react'
import { Link } from 'react-router-dom'

export default function AlertBanner({ count }) {
  return (
    <Link to="/alerts"
      className="block bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 hover:bg-red-100 transition">
      <span className="text-2xl">⚠️</span>
      <div>
        <div className="font-semibold text-red-800">
          {count} open alert{count === 1 ? '' : 's'} require ranger verification
        </div>
        <div className="text-sm text-red-700/80">
          Absence anomalies and new individuals flagged by the monitoring workflow.
        </div>
      </div>
      <span className="ml-auto text-sm font-medium text-red-700">View →</span>
    </Link>
  )
}