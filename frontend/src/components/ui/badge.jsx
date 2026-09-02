import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-container/80 text-primary ring-1 ring-inset ring-primary/25',
        neutral: 'bg-white/6 text-on-surface-variant ring-1 ring-inset ring-white/10',
        amber: 'bg-secondary/15 text-secondary-fixed ring-1 ring-inset ring-secondary/25',
        red: 'bg-alert-red/15 text-red-200 ring-1 ring-inset ring-alert-red/25',
        green: 'bg-primary/15 text-primary-fixed ring-1 ring-inset ring-primary/25',
        blue: 'bg-sky-600/15 text-sky-200 ring-1 ring-inset ring-sky-500/30',
        outline: 'border border-white/15 text-on-surface-variant',
        gold: 'bg-earth-gold/15 text-earth-gold ring-1 ring-inset ring-earth-gold/25',
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