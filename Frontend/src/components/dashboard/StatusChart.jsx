import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../common/Card';
import EmptyState from '../feedback/EmptyState';
import { STATUS_COLOR } from '../common/status';
import { INVOICE_STATUSES } from '../../lib/constants';
import { formatNumber } from '../../lib/format';

/** `data`: backend invoiceStatusChart -> [{ _id: status, totalInvoices }] */
export default function StatusChart({ data = [] }) {
  const rows = [...data]
    .filter((d) => d.totalInvoices > 0)
    .sort((a, b) => INVOICE_STATUSES.indexOf(a._id) - INVOICE_STATUSES.indexOf(b._id))
    .map((d) => ({ name: d._id, value: d.totalInvoices }));
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <Card className="h-full">
      <CardHeader title="Invoices by status" />
      <CardBody>
        {rows.length === 0 ? (
          <EmptyState icon={PieIcon} title="No invoices yet" description="Status breakdown appears after you create invoices." />
        ) : (
          <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
            <div className="relative size-44 shrink-0" role="img" aria-label="Donut chart of invoices by status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rows} dataKey="value" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="var(--surface)" strokeWidth={2}>
                    {rows.map((r) => <Cell key={r.name} fill={STATUS_COLOR[r.name] ?? 'var(--neutral)'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--fg)' }} itemStyle={{ color: 'var(--fg)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-2xl font-semibold tabular-nums text-fg">{formatNumber(total)}</p>
                  <p className="text-xs text-fg-muted">total</p>
                </div>
              </div>
            </div>
            <ul className="w-full min-w-0 flex-1 space-y-2">
              {rows.map((r) => (
                <li key={r.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-fg-muted">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: STATUS_COLOR[r.name] ?? 'var(--neutral)' }} aria-hidden />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span className="font-medium tabular-nums text-fg">{formatNumber(r.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
