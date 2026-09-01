import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-brand-500 text-white shadow-sm hover:bg-brand-400',
        secondary: 'bg-[#1a1d23] text-ink-100 border border-ink-700 shadow-sm hover:bg-ink-800/40',
        outline: 'border border-ink-600 bg-transparent text-ink-100 hover:bg-ink-900/10 hover:text-white',
        ghost: 'text-ink-200 hover:bg-ink-900/10 hover:text-white',
        destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
        amber: 'bg-accent-500 text-white shadow-sm hover:bg-accent-600',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'

export { buttonVariants }