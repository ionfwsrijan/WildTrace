import React from 'react'
import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-lg bg-ink-100/70', className)}
      {...props}
    />
  )
}