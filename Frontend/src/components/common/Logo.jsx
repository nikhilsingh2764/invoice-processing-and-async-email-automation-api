import { FileText } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Logo({ className, showText = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-fg">
        <FileText className="size-[18px]" aria-hidden />
      </span>
      {showText && <span className="text-lg font-semibold tracking-tight text-fg">InvoicePilot</span>}
    </span>
  );
}
