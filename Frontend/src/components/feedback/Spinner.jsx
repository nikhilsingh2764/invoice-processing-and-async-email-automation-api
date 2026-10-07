import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Spinner({ className, label = 'Loading' }) {
  return <Loader2 role="status" aria-label={label} className={cn('size-5 animate-spin text-brand', className)} />;
}

export function PageSpinner({ label = 'Loading…' }) {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-fg-muted">
        <Loader2 className="size-7 animate-spin text-brand" aria-hidden />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
