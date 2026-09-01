import React from 'react'
import { cn } from '../../lib/utils'

export default function TabBar({ tabs, active, onChange, className }) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-xl border border-ink-700 bg-[#15181d] p-1 shadow-sm', className)}>
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
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-ink-300 hover:bg-ink-800/20 hover:text-white',
            )}
          >
            {label}
            {count != null && (
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                isActive ? 'bg-white/25 text-white' : 'bg-ink-800/40 text-ink-300',
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