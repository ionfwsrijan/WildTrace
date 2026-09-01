import React from 'react'
import { cn } from '../../lib/utils'
import { Card } from './card'

const iconTone = {
  green: 'bg-brand-500/15 text-brand-300 ring-brand-500/30',
  amber: 'bg-accent-500/15 text-accent-300 ring-accent-500/30',
  red: 'bg-red-600/15 text-red-400 ring-red-500/30',
  blue: 'bg-sky-600/15 text-sky-300 ring-sky-500/30',
  violet: 'bg-violet-600/15 text-violet-300 ring-violet-500/30',
}

export default function StatCard({ icon: Icon, label, value, hint, tone = 'green', trend }) {
  return (
    <Card className="relative overflow-hidden p-5 transition-shadow hover:shadow-cardHover">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-300">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset', iconTone[tone])}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
      {trend != null && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-lg leading-none">{trend >= 0 ? '▲' : '▼'}</span>
          <span className={cn('text-sm font-semibold', trend >= 0 ? 'text-brand-400' : 'text-red-400')}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-xs text-ink-500">vs last period</span>
        </div>
      )}
    </Card>
  )
}