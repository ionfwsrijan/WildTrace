import React from 'react'
import { cn } from '../lib/utils'

export default function PageHeader({ title, description, icon: Icon, actions, eyebrow }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-card">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          {eyebrow && (
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-brand-400">{eyebrow}</p>
          )}
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-[1.65rem]">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}