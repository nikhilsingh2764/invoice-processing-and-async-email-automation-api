// All recharts usage lives here so the library ships as one lazy chunk.
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from '../../lib/format.js'

const STATUS_COLOR = {
  Paid: 'var(--st-paid)',
  Pending: 'var(--st-pending)',
  Overdue: 'var(--st-overdue)',
  'Partially Paid': 'var(--st-partial)',
  Draft: 'var(--st-draft)',
  Cancelled: 'var(--st-cancelled)',
}
const tick = { fill: 'var(--muted)', fontSize: 12 }

function MoneyTip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="card" style={{ padding: 'var(--space-3)', boxShadow: 'var(--elev-3)' }}>
      <strong>{label}</strong>
      <div className="tabular">{formatMoney(p.revenue, currency)}</div>
      <div className="muted">{p.invoices} invoice{p.invoices === 1 ? '' : 's'}</div>
    </div>
  )
}

/** type: 'area' | 'bar'. Motion is disabled by the caller when reduced motion is requested. */
export function RevenueChart({ data, type = 'area', currency = 'INR', animate = true }) {
  const common = { data, margin: { top: 8, right: 8, bottom: 0, left: 0 } }
  const axes = (
    <>
      <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
      <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: 'var(--hairline)' }} />
      <YAxis tick={tick} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => formatMoney(v, currency, { compact: true })} />
      <Tooltip content={<MoneyTip currency={currency} />} cursor={{ stroke: 'var(--border-strong)', strokeDasharray: '3 3' }} />
    </>
  )
  return (
    <ResponsiveContainer width="100%" height={260}>
      {type === 'bar' ? (
        <BarChart {...common}>
          {axes}
          <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} isAnimationActive={animate} />
        </BarChart>
      ) : (
        <AreaChart {...common}>
          <defs>
            <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {axes}
          <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#rev-fill)" isAnimationActive={animate} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  )
}

export function StatusDonut({ data, animate = true }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={58} outerRadius={86} paddingAngle={2} stroke="var(--surface)" strokeWidth={2} isAnimationActive={animate}>
          {data.map((d) => (
            <Cell key={d.status} fill={STATUS_COLOR[d.status] || 'var(--chart-2)'} />
          ))}
        </Pie>
        <Tooltip formatter={(v, n) => [`${v} (${total ? Math.round((v / total) * 100) : 0}%)`, n]} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
