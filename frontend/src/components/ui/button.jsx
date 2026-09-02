import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-earth-gold text-deep-forest shadow-lg shadow-earth-gold/20 hover:bg-secondary-fixed',
        secondary: 'bg-white/6 text-white border border-white/10 shadow-sm hover:bg-white/10',
        outline: 'border border-white/15 bg-transparent text-white hover:bg-white/8 hover:text-white',
        ghost: 'text-on-surface-variant hover:bg-white/8 hover:text-white',
        destructive: 'bg-alert-red text-white shadow-sm hover:opacity-90',
        amber: 'bg-secondary text-deep-forest shadow-lg shadow-earth-gold/20 hover:bg-secondary-fixed',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6',
        icon: 'h-9 w-9 rounded-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className)

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        className: cn(children.props.className, classes),
        ref,
      })
    }

    return <button ref={ref} className={classes} {...props}>{children}</button>
  },
)
Button.displayName = 'Button'

export { buttonVariants }