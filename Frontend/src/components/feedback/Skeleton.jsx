import { cn } from '../../lib/cn';

export default function Skeleton({ className }) {
  return <div aria-hidden className={cn('skeleton h-4 w-full', className)} />;
}

export function SkeletonRows({ rows = 5, className }) {
  return (
    <div className={cn('space-y-3 p-4 sm:p-5', className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-10" />)}
    </div>
  );
}
