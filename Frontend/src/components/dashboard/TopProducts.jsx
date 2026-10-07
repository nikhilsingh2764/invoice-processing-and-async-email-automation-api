import { Package } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../common/Card';
import EmptyState from '../feedback/EmptyState';
import { formatNumber } from '../../lib/format';

/** `data`: backend topProducts -> [{ _id, productName, totalQuantitySold, totalRevenue }]. Only quantity is shown. */
export default function TopProducts({ data = [] }) {
  const max = Math.max(1, ...data.map((p) => p.totalQuantitySold || 0));
  return (
    <Card className="h-full">
      <CardHeader title="Top products" description="By units sold on Paid invoices." />
      <CardBody>
        {data.length === 0 ? (
          <EmptyState icon={Package} title="No product sales yet" description="Top sellers show up once invoices are paid." />
        ) : (
          <ol className="space-y-4">
            {data.map((p, i) => (
              <li key={p._id ?? i}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-fg" title={p.productName}>{p.productName}</span>
                  <span className="shrink-0 tabular-nums text-fg-muted">{formatNumber(p.totalQuantitySold)} sold</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(4, ((p.totalQuantitySold || 0) / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
