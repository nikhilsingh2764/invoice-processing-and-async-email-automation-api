export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <path d="M9 7h10l5 5v13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" fill="var(--on-brand)" opacity="0.14" />
      <path d="M9.5 6.5h9.5l5.5 5.5v13a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1v-17.5a1 1 0 0 1 1-1Z" fill="none" stroke="var(--on-brand)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 16h8M12 20h5" stroke="var(--on-brand)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ size = 28, text = true }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      {text && <span style={{ fontFamily: 'var(--ff-heading)', fontWeight: 700, fontSize: size * 0.72, letterSpacing: '-0.01em' }}>InvoicePilot</span>}
    </span>
  )
}
