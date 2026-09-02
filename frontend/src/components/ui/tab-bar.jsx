import React from 'react'
import { cn } from '../../lib/utils'

export default function TabBar({ tabs, active, onChange, className }) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl', className)}>
      {tabs.map((tab) => {
        const value = typeof tab === 'string' ? tab : tab.value
        const label = typeof tab === 'string' ? tab : tab.label
        const count = typeof tab === 'string' ? null : tab.count
        const isActive = active === value
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all',
              isActive
                ? 'bg-earth-gold text-deep-forest shadow-lg shadow-earth-gold/20'
                : 'text-on-surface-variant hover:bg-white/8 hover:text-white',
            )}
          >
            {label}
            {count != null && (
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                isActive ? 'bg-white/25 text-deep-forest' : 'bg-white/10 text-on-surface-variant',
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}