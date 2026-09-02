import React from 'react'
import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-2xl bg-gradient-to-r from-white/6 via-white/12 to-white/6', className)}
      {...props}
    />
  )
}