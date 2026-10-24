import { LogoMark } from '../ui/Logo.jsx'

export function Splash({ label = 'Loading InvoicePilot' }) {
  return (
    <div role="status" aria-live="polite" style={{ display: 'grid', placeItems: 'center', minBlockSize: '100dvh', background: 'var(--desk)' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 16 }}>
        <LogoMark size={48} />
        <span className="spinner" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}
