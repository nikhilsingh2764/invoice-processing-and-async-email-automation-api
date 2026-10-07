import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardBody, CardHeader } from '../common/Card';
import EmptyState from '../feedback/EmptyState';
import { BarChart3 } from 'lucide-react';
import { formatCompactMoney, formatMoney, monthLabel } from '../../lib/format';

const tooltipStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  color: 'var(--fg)',
  boxShadow: 'var(--shadow-md)',
};

/** `data`: backend revenueChart -> [{ _id: { year, month }, totalRevenue, totalInvoices }] (Paid invoices, by creation month). */
export default function RevenueChart({ data = [], currency }) {
  const rows = data.map((d) => ({
    label: monthLabel(d._id?.year, d._id?.month),
    revenue: d.totalRevenue,
    invoices: d.totalInvoices,
  }));

  return (
    <Card>
      <CardHeader title="Paid revenue by month" description="Paid invoices grouped by the month they were created." />
      <CardBody>
        {rows.length === 0 ? (
          <EmptyState icon={BarChart3} title="No paid invoices yet" description="Revenue appears here once an invoice is marked as Paid." />
        ) : (
          <div className="h-72" role="img" aria-label="Bar chart of paid revenue per month">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--fg-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--fg-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCompactMoney(v, currency)} />
                <Tooltip
                  cursor={{ fill: 'var(--surface-2)' }}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'var(--fg-muted)' }}
                  formatter={(value, _name, item) => [`${formatMoney(value, currency)} · ${item.payload.invoices} invoice${item.payload.invoices === 1 ? '' : 's'}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--brand)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
