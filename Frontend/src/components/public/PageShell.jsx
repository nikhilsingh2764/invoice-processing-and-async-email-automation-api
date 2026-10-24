import { useSeo } from '../../hooks/useSeo.js'

/** Standard marketing page: title, intro and a reading-width body. */
export function PageShell({ title, description, path, intro, children, wide = false }) {
  useSeo({ title, description, path })
  return (
    <div className="container-page" style={{ paddingBlock: 'var(--space-12)' }}>
      <div className="stack-lg" style={{ maxInlineSize: wide ? undefined : 'var(--reading-max)' }}>
        <header className="stack">
          <h1 id="page-title" tabIndex={-1}>{title}</h1>
          {intro && <p className="muted" style={{ fontSize: 'var(--text-lg)' }}>{intro}</p>}
        </header>
        {children}
      </div>
    </div>
  )
}
