import React from 'react'
import { cn } from '../../lib/utils'
import { Card } from './card'

const iconTone = {
  green: 'bg-primary-container text-primary ring-primary/25',
  amber: 'bg-secondary/15 text-secondary ring-secondary/25',
  red: 'bg-alert-red/15 text-red-200 ring-alert-red/25',
  blue: 'bg-sky-600/15 text-sky-200 ring-sky-500/30',
  violet: 'bg-violet-600/15 text-violet-200 ring-violet-500/30',
}

export default function StatCard({ icon: Icon, label, value, hint, tone = 'green', trend }) {
  return (
    <Card className="relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-earth-gold/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{label}</p>
          <p className="mt-2 font-syne text-3xl font-extrabold tracking-tight text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset shadow-lg', iconTone[tone])}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
      {trend != null && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-lg leading-none">{trend >= 0 ? '▲' : '▼'}</span>
          <span className={cn('text-sm font-semibold', trend >= 0 ? 'text-primary' : 'text-red-300')}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-xs text-on-surface-variant">vs last period</span>
        </div>
      )}
    </Card>
  )
}