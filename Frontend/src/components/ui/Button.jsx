import { forwardRef } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn.js'
import { Icon } from './Icon.jsx'

const cls = (variant, className) => cn('btn', `btn-${variant}`, className)

/** Loading keeps the label (no layout shift), sets aria-busy and blocks repeat clicks. */
export const Button = forwardRef(function Button({ variant = 'secondary', size, icon, iconOnly, loading, children, className, onClick, type = 'button', 'aria-label': ariaLabel, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cls(variant, className)}
      data-size={size}
      data-icon-only={iconOnly ? 'true' : undefined}
      data-loading={loading ? 'true' : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || rest.disabled || undefined}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (loading) {
          e.preventDefault()
          return
        }
        onClick?.(e)
      }}
      {...rest}
    >
      {icon && <Icon as={icon} />}
      {!iconOnly && <span className="btn-label">{children}</span>}
      {iconOnly && <span className="sr-only">{children}</span>}
      {loading && <span className="btn-spinner spinner" aria-hidden="true" />}
    </button>
  )
})

export function LinkButton({ to, variant = 'secondary', size, icon, children, className, ...rest }) {
  return (
    <Link to={to} className={cls(variant, className)} data-size={size} {...rest}>
      {icon && <Icon as={icon} />}
      <span className="btn-label">{children}</span>
    </Link>
  )
}
