import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { BarChart3, LineChart, Mail, Plus } from 'lucide-react'
import { Sheet, Letterhead, MetaStrip, MetaCell } from '../../components/sheet/index.jsx'
import { Button, LinkButton } from '../../components/ui/Button.jsx'
import { Tabs } from '../../components/ui/Tabs.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { StatusBadge } from '../../components/ui/Badge.jsx'
import { CardSkeleton, LedgerSkeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx'
import { Ledger } from '../../components/ui/Ledger.jsx'
import { CountMoney, Gauge, InvoiceFlow, SetupSteps } from '../../components/dashboard/widgets.jsx'
import { CacheNotice } from '../../components/layout/Banners.jsx'
import { useAttention, useBusiness, useCustomers, useDashboard, useProducts } from '../../hooks/queries.js'
import { useEmailInvoice } from '../../hooks/useInvoiceActions.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js'
import { formatDate, formatMoney, formatNumber, isPastDue } from '../../lib/format.js'
import { storage } from '../../lib/storage.js'
import { normalizeError } from '../../api/errors.js'

const RevenueChart = lazy(() => import('../../components/charts/Charts.jsx').then((m) => ({ default: m.RevenueChart })))
const StatusDonut = lazy(() => import('../../components/charts/Charts.jsx').then((m) => ({ default: m.StatusDonut })))

const RANGES = [
  { id: '3', label: '3 months', n: 3 },
  { id: '6', label: '6 months', n: 6 },
  { id: '12', label: '12 months', n: 12 },
  { id: 'all', label: 'All', n: Infinity },
]
const PARAMS = { page: 1, limit: 10 }
const PENDING_PARAMS = { status: 'Pending', sort: 'dueDate', order: 'asc', limit: 50 }

function ChartFallback() {
  return <div className="skeleton" style={{ blockSize: 260 }} role="status"><span className="sr-only">Loading chart</span></div>
}

export default function Dashboard() {
  useDocumentTitle('Dashboard')
  const dash = useDashboard(PARAMS)
  const business = useBusiness()
  const customers = useCustomers()
  const products = useProducts()
  const overdue = useAttention()
  const pending = useDashboard(PENDING_PARAMS)
  const email = useEmailInvoice()
  const reduced = usePrefersReducedMotion()
  const [range, setRange] = useState('6')
  const [chartType, setChartType] = useState('area')
  const [checklistHidden, setChecklistHidden] = useState(() => storage.get('ip.notice.checklist') === 'hidden')

  const currency = business.data?.currency || 'INR'
  const d = dash.data
  const months = useMemo(() => {
    const n = RANGES.find((r) => r.id === range)?.n ?? 6
    return d ? d.revenueChart.slice(-n) : []
  }, [d, range])

  const attention = useMemo(() => {
    const rows = [...(overdue.data?.invoices || []), ...(pending.data?.invoices || []).filter((i) => isPastDue(i))]
    const seen = new Set()
    return rows.filter((i) => !seen.has(i.id) && seen.add(i.id)).slice(0, 6)
  }, [overdue.data, pending.data])

  if (dash.isLoading || business.isLoading) {
    return (
      <div className="stack-lg">
        <Letterhead title="Dashboard" />
        <div className="grid-cards"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        <CardSkeleton height={260} />
      </div>
    )
  }
  if (dash.isError && !d) {
    const n = normalizeError(dash.error)
    return (
      <div className="stack-lg">
        <Letterhead title="Dashboard" />
        <ErrorState message={n.message} onRetry={() => dash.refetch()} />
      </div>
    )
  }

  const s = d.stats
  const isNew = !business.data || s.totalInvoices === 0
  const total = s.totalRevenue + s.totalDueAmount

  return (
    <div className="stack-lg">
      <Letterhead
        title="Dashboard"
        description={business.data ? business.data.businessName : 'Set up your business to start invoicing.'}
        actions={<LinkButton to="/invoices/new" variant="primary" icon={Plus}>New invoice</LinkButton>}
      />
      <CacheNotice />

      {isNew && (
        <Sheet aria-labelledby="setup-h">
          <h2 id="setup-h" style={{ fontSize: 'var(--text-lg)', marginBlockEnd: 12 }}>Get set up in four steps</h2>
          <SetupSteps hasBusiness={Boolean(business.data)} hasCustomers={(customers.data?.length || 0) > 0} hasProducts={(products.data?.length || 0) > 0} hasInvoices={s.totalInvoices > 0} />
          {!checklistHidden && (
            <p style={{ marginBlockStart: 12 }}>
              <Button size="sm" variant="ghost" onClick={() => { storage.set('ip.notice.checklist', 'hidden'); setChecklistHidden(true) }}>Hide this checklist</Button>
            </p>
          )}
        </Sheet>
      )}

      <Sheet fold aria-label="Summary">
        <MetaStrip label="Summary">
          <MetaCell label="Revenue collected" hint="Paid invoices plus part-payments"><CountMoney value={s.totalRevenue} currency={currency} /></MetaCell>
          <MetaCell label="Outstanding" hint="Still to be collected"><CountMoney value={s.totalDueAmount} currency={currency} /></MetaCell>
          <MetaCell label="Overdue" hint="Marked overdue or past due date" value={formatNumber(s.overdueInvoices)} />
          <MetaCell label="Invoices" value={formatNumber(s.totalInvoices)} hint={`${formatNumber(s.totalCustomers)} customers · ${formatNumber(s.totalProducts)} products`} />
        </MetaStrip>
      </Sheet>

      {!isNew && (
        <div className="dash-grid" data-wide="true">
          <section className="card dash-wide" aria-labelledby="rev-h">
            <div className="card-header card-header-wrap">
              <div>
                <h2 className="card-title" id="rev-h">Revenue by month</h2>
                <p className="card-desc">Collected amount by the month each invoice was created. The range changes this chart only.</p>
              </div>
              <div className="chart-controls">
                <Tabs label="Date range" tabs={RANGES.map(({ id, label }) => ({ id, label }))} value={range} onChange={setRange} idPrefix="range" controls={false} />
                <Button size="sm" iconOnly icon={chartType === 'area' ? BarChart3 : LineChart} aria-pressed={chartType === 'bar'} onClick={() => setChartType((t) => (t === 'area' ? 'bar' : 'area'))}>
                  {chartType === 'area' ? 'Show as bars' : 'Show as area'}
                </Button>
              </div>
            </div>
            {months.length === 0 ? (
              <EmptyState title="No revenue yet">Paid and part-paid invoices appear here by month.</EmptyState>
            ) : (
              <>
                <Suspense fallback={<ChartFallback />}>
                  <div role="img" aria-label={`Revenue per month, ${months.length} months. Highest: ${formatMoney(Math.max(...months.map((m) => m.revenue)), currency)}.`}>
                    <RevenueChart data={months} type={chartType} currency={currency} animate={!reduced} />
                  </div>
                </Suspense>
                <details className="details"><summary>View as table</summary>
                  <Ledger caption="Revenue by month" rows={months} rowKey={(m) => m.label} columns={[
                    { key: 'label', header: 'Month', primary: true },
                    { key: 'invoices', header: 'Invoices', num: true },
                    { key: 'revenue', header: 'Revenue', num: true, render: (m) => formatMoney(m.revenue, currency) },
                  ]} />
                </details>
              </>
            )}
          </section>

          <section className="card" aria-labelledby="gauge-h">
            <h2 className="card-title" id="gauge-h">Collected vs. outstanding</h2>
            <p className="card-desc">Share of billed money you have already received.</p>
            <Gauge paid={s.totalRevenue} pending={s.totalDueAmount} currency={currency} />
            <span className="sr-only">Total billed {formatMoney(total, currency)}</span>
          </section>
        </div>
      )}

      {!isNew && (
        <section aria-labelledby="flow-h" className="stack">
          <h2 id="flow-h" style={{ fontSize: 'var(--text-lg)' }}>Invoice flow</h2>
          <InvoiceFlow counts={d.statusChart} paidAmount={s.totalRevenue} pendingAmount={s.totalDueAmount} currency={currency} />
        </section>
      )}

      {!isNew && (
        <div className="dash-grid">
          <section className="card" aria-labelledby="donut-h">
            <h2 className="card-title" id="donut-h">Status mix</h2>
            {d.statusChart.length ? (
              <>
                <Suspense fallback={<ChartFallback />}>
                  <div role="img" aria-label={`Invoices by status: ${d.statusChart.map((x) => `${x.status} ${x.count}`).join(', ')}`}>
                    <StatusDonut data={d.statusChart} animate={!reduced} />
                  </div>
                </Suspense>
                <ul className="chips status-legend">
                  {d.statusChart.map((x) => <li key={x.status}><span className="badge" data-status={x.status}><span className="badge-dot" aria-hidden="true" />{x.status} {x.count}</span></li>)}
                </ul>
              </>
            ) : <p className="muted">No invoices yet.</p>}
          </section>

          <section className="card" aria-labelledby="att-h">
            <h2 className="card-title" id="att-h">Needs attention</h2>
            <p className="card-desc">Overdue invoices, and Pending invoices past their due date.</p>
            {overdue.isLoading || pending.isLoading ? <LedgerSkeleton rows={3} /> : attention.length === 0 ? (
              <p className="muted">Nothing is overdue. Nice.</p>
            ) : (
              <ul className="attention-list">
                {attention.map((i) => (
                  <li key={i.id} className="attention-item">
                    <span className="attention-text">
                      <Link to={`/invoices/${i.id}`} style={{ fontWeight: 600 }}>{i.invoiceNumber}</Link>{' '}
                      <span className="muted">{i.customer.customerName} · due {formatDate(i.dueDate)}</span>
                      {i.status === 'Pending' && <span className="badge" data-tone="warning" title="Status is still Pending" style={{ marginInlineStart: 8 }}>Past due</span>}
                    </span>
                    <Button size="sm" icon={Mail} onClick={() => email(i)}>Email invoice again</Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card" aria-labelledby="tc-h">
            <h2 className="card-title" id="tc-h">Top customers</h2>
            {d.topCustomers.length ? (
              <Ledger caption="Top customers" rows={d.topCustomers} columns={[
                { key: 'name', header: 'Customer', primary: true },
                { key: 'invoices', header: 'Invoices', num: true },
                { key: 'revenue', header: 'Revenue', num: true, render: (c) => formatMoney(c.revenue, currency) },
              ]} />
            ) : d.topCustomersCollapsed ? (
              <Alert tone="info">Top customers appear for invoices created or edited recently. Older invoices were saved without a customer link, so they are not counted here. Nothing is wrong with your data.</Alert>
            ) : <p className="muted">No paid invoices yet.</p>}
          </section>

          <section className="card" aria-labelledby="tp-h">
            <h2 className="card-title" id="tp-h">Top products</h2>
            {d.topProducts.length ? (
              <Ledger caption="Top products by quantity sold" rows={d.topProducts} rowKey={(p) => p.id || p.name} columns={[
                { key: 'name', header: 'Product', primary: true },
                { key: 'quantity', header: 'Sold', num: true },
                { key: 'revenue', header: 'Revenue', num: true, render: (p) => formatMoney(p.revenue, currency) },
              ]} />
            ) : <p className="muted">No product sales yet.</p>}
          </section>
        </div>
      )}

      <section className="card" aria-labelledby="recent-h">
        <div className="card-header">
          <h2 className="card-title" id="recent-h">Recent invoices</h2>
          <Link to="/invoices">View all</Link>
        </div>
        {d.recentInvoices.length === 0 ? (
          <EmptyState title="No invoices yet" action={<LinkButton to="/invoices/new" variant="primary" icon={Plus}>Create your first invoice</LinkButton>}>
            Create one in a minute, then email it or download the PDF.
          </EmptyState>
        ) : (
          <Ledger caption="Recent invoices" rows={d.recentInvoices} gutter columns={[
            { key: 'invoiceNumber', header: 'Invoice', primary: true, render: (i) => <Link to={`/invoices/${i.id}`} className="cell-primary">{i.invoiceNumber}</Link> },
            { key: 'customer', header: 'Customer', hideSm: true, render: (i) => i.customer.customerName },
            { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
            { key: 'grandTotal', header: 'Total', num: true, render: (i) => formatMoney(i.grandTotal, currency) },
          ]} />
        )}
      </section>
    </div>
  )
}
