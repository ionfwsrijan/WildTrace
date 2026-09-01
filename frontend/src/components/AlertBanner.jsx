import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowRight } from 'lucide-react'

export default function AlertBanner({ count }) {
  return (
    <Link
      to="/alerts"
      className="group flex items-center gap-4 rounded-xl border border-red-900 bg-gradient-to-r from-red-950/70 via-red-900/40 to-transparent p-4 shadow-card transition-all hover:shadow-cardHover animate-fade-up"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600/15 text-red-400 ring-1 ring-inset ring-red-500/30">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-red-300">
          {count} open alert{count === 1 ? '' : 's'} require ranger verification
        </div>
        <div className="truncate text-sm text-red-200/60">
          Absence anomalies and new individuals flagged by the monitoring workflow.
        </div>
      </div>
      <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-red-300 transition-colors group-hover:text-red-200">
        Review <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  )
}