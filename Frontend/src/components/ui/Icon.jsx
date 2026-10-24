// Decorative icon wrapper. Meaning must come from adjacent text or an aria-label on the control.
export function Icon({ as: Glyph, size = 18, className, ...rest }) {
  if (!Glyph) return null
  return <Glyph aria-hidden="true" focusable="false" width={size} height={size} strokeWidth={1.75} className={className} {...rest} />
}
