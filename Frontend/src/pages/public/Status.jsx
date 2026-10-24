import { RefreshCw } from 'lucide-react'
import { PageShell } from '../../components/public/PageShell.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Sheet } from '../../components/sheet/index.jsx'
import { useHealth } from '../../hooks/queries.js'
import { formatDate } from '../../lib/format.js'

const ROWS = [['api', 'API'], ['mongodb', 'Database'], ['redis', 'Queue and cache']]

export default function Status() {
  const q = useHealth()
  const h = q.data
  return (
    <PageShell title="Status" description="Live status of the InvoicePilot API, database and queue." path="/status" intro="Checked live and refreshed every 30 seconds.">
      <div aria-live="polite">
        {q.isLoading ? <p role="status">Checking…</p> : q.isError ? <Alert tone="danger" title="Status unavailable">We could not reach the status endpoint. The API may be down.</Alert>
          : <Alert tone={h.ok ? 'success' : 'warning'} title={h.ok ? 'All systems operational' : 'Some systems are degraded'}>{h.timestamp && <>Checked {formatDate(h.timestamp, { withTime: true })}</>}</Alert>}
      </div>
      <Sheet>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
          {ROWS.map(([k, label]) => {
            const state = h ? (h.services[k] ? 'up' : 'down') : undefined
            return (
              <li key={k} className="status-row"><span className="status-dot" data-state={state} aria-hidden="true" /><span>{label}</span><span className="muted" style={{ marginInlineStart: 'auto' }}>{state === 'up' ? 'Operational' : state === 'down' ? 'Down' : 'Unknown'}</span></li>
            )
          })}
        </ul>
      </Sheet>
      <div><Button icon={RefreshCw} onClick={() => q.refetch()} loading={q.isFetching}>Check now</Button></div>
    </PageShell>
  )
}
