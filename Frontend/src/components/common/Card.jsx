import { cn } from '../../lib/cn';

export function Card({ className, children, ...props }) {
  return (
    <section className={cn('rounded-xl border border-line bg-surface shadow-card', className)} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-fg">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const CardBody = ({ className, children }) => <div className={cn('p-4 sm:p-5', className)}>{children}</div>;
