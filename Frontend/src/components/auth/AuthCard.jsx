import { Card } from '../common/Card';

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <>
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-fg-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </Card>
      {footer && <p className="mt-5 text-center text-sm text-fg-muted">{footer}</p>}
    </>
  );
}
