import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-500/15 text-brand-300 ring-1 ring-inset ring-brand-500/30',
        neutral: 'bg-ink-900/10 text-ink-200 ring-1 ring-inset ring-ink-700',
        amber: 'bg-accent-500/15 text-accent-300 ring-1 ring-inset ring-accent-500/30',
        red: 'bg-red-600/15 text-red-300 ring-1 ring-inset ring-red-500/30',
        green: 'bg-green-600/15 text-green-300 ring-1 ring-inset ring-green-500/30',
        blue: 'bg-sky-600/15 text-sky-300 ring-1 ring-inset ring-sky-500/30',
        outline: 'border border-ink-600 text-ink-300',
      },
      dot: { true: 'before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-current' },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({ className, variant, dot, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant, dot }), className)} {...props} />
  )
}