import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../lib/cn';

const TONES = {
  error: { cls: 'border-danger/30 bg-danger-soft text-danger', icon: AlertCircle },
  success: { cls: 'border-success/30 bg-success-soft text-success', icon: CheckCircle2 },
  warning: { cls: 'border-warning/30 bg-warning-soft text-warning', icon: TriangleAlert },
  info: { cls: 'border-info/30 bg-info-soft text-info', icon: Info },
};

export default function Alert({ tone = 'info', title, children, action, onDismiss, className }) {
  const { cls, icon: Icon } = TONES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-xl border p-3.5 text-sm', cls, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 break-words">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'text-fg')}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="rounded p-0.5 opacity-70 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
