import { Component } from 'react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { LinkButton, Button } from '../ui/Button.jsx'
import { PaperIllustration } from '../ui/EmptyState.jsx'
import { Logo } from '../ui/Logo.jsx'
import { report } from '../../lib/report.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

function Screen({ title, children, actions, code }) {
  return (
    <main id="main" className="container-page" style={{ minBlockSize: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 16, maxInlineSize: '32rem' }}>
        <Link to="/" aria-label="InvoicePilot home"><Logo /></Link>
        <PaperIllustration />
        {code && <p className="muted tabular">{code}</p>}
        <h1 style={{ fontSize: 'var(--fluid-h1)' }} tabIndex={-1}>{title}</h1>
        <div className="muted">{children}</div>
        <div className="chips" style={{ justifyContent: 'center' }}>{actions}</div>
      </div>
    </main>
  )
}

export function NotFoundScreen() {
  useDocumentTitle('Page not found')
  return (
    <Screen code="404" title="This page is not on file" actions={<><LinkButton to="/" variant="primary">Go home</LinkButton><LinkButton to="/dashboard">Open dashboard</LinkButton></>}>
      <meta name="robots" content="noindex" />
      <p>The link may be old, or the address mistyped.</p>
    </Screen>
  )
}

export function MaintenanceScreen({ onRetry }) {
  useDocumentTitle('Service unavailable')
  return (
    <Screen title="We can’t reach the server" actions={<><Button variant="primary" onClick={onRetry}>Try again</Button><LinkButton to="/status">Check status</LinkButton></>}>
      <p>This is usually brief. Your data is safe. Try again in a minute.</p>
    </Screen>
  )
}

export function RouteError() {
  const error = useRouteError()
  useDocumentTitle('Something went wrong')
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundScreen />
  report(error, { where: 'route' })
  return (
    <Screen title="Something went wrong" actions={<><Button variant="primary" onClick={() => window.location.reload()}>Reload page</Button><LinkButton to="/">Go home</LinkButton></>}>
      <p>An unexpected error occurred. Reloading usually fixes it. Nothing you entered was sent anywhere.</p>
    </Screen>
  )
}

export class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error, info) {
    report(error, { where: 'boundary', componentStack: info?.componentStack })
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="container-page" style={{ minBlockSize: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
          <h1>Something went wrong</h1>
          <p className="muted">Reload the page to continue.</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}><span className="btn-label">Reload</span></button>
        </div>
      </main>
    )
  }
}
