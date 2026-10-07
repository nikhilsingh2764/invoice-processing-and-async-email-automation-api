import { Card } from '../common/Card';
import Skeleton from '../feedback/Skeleton';
import { cn } from '../../lib/cn';

const TONES = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-neutral-soft text-neutral',
};

export default function StatCard({ label, value, hint, icon: Icon, tone = 'brand' }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg-muted">{label}</p>
          <p className="mt-1.5 truncate text-2xl font-semibold tabular-nums tracking-tight text-fg" title={String(value)}>{value}</p>
          {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
        </div>
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg', TONES[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-4 sm:p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-3 h-3 w-20" />
    </Card>
  );
}
