import { Link } from 'react-router-dom';
import { AlertTriangle, Check, CheckCircle2, Clock, DollarSign, FileText, Hourglass, Package, Plus, Users, Wallet } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { buttonClasses } from '../../components/common/button-styles';
import StatCard, { StatCardSkeleton } from '../../components/dashboard/StatCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import StatusChart from '../../components/dashboard/StatusChart';
import TopProducts from '../../components/dashboard/TopProducts';
import InvoiceTable from '../../components/invoice/InvoiceTable';
import ErrorState from '../../components/feedback/ErrorState';
import EmptyState from '../../components/feedback/EmptyState';
import Skeleton, { SkeletonRows } from '../../components/feedback/Skeleton';
import Alert from '../../components/feedback/Alert';
import { useBusiness, useDashboard } from '../../hooks/queries';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatMoney, formatNumber } from '../../lib/format';
import { cn } from '../../lib/cn';

function SetupChecklist({ hasBusiness, stats }) {
  const steps = [
    { done: hasBusiness, label: 'Create your business profile', to: '/business' },
    { done: stats.totalCustomers > 0, label: 'Add a customer', to: '/customers' },
    { done: stats.totalProducts > 0, label: 'Add a product or service', to: '/products' },
    { done: stats.totalInvoices > 0, label: 'Create your first invoice', to: '/invoices/new' },
  ];
  return (
    <Card>
      <CardHeader title="Get set up" description="Complete these steps to send your first invoice." />
      <ul className="divide-y divide-line">
        {steps.map((s) => (
          <li key={s.label}>
            <Link to={s.to} className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-surface-2/60">
              <span className={cn('grid size-6 place-items-center rounded-full border', s.done ? 'border-success bg-success-soft text-success' : 'border-line-strong text-transparent')}>
                <Check className="size-3.5" aria-hidden />
              </span>
              <span className={cn('font-medium', s.done ? 'text-fg-muted line-through' : 'text-fg')}>{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { data, error, isPending, isFetching, refetch } = useDashboard({});
  const business = useBusiness();
  const currency = business.data?.currency;

  const actions = (
    <Link to="/invoices/new" className={buttonClasses()}>
      <Plus className="size-4" aria-hidden /> New invoice
    </Link>
  );

  if (isPending) {
    return (
      <>
        <PageHeader title="Dashboard" description="A snapshot of your invoicing activity." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <StatCardSkeleton key={i} />)}</div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2"><Skeleton className="h-72" /></Card>
          <Card className="p-5"><Skeleton className="h-72" /></Card>
        </div>
        <Card className="mt-6"><SkeletonRows rows={5} /></Card>
      </>
    );
  }

  if (error && !data) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <Card><ErrorState title="We couldn’t load your dashboard" error={error} onRetry={refetch} retrying={isFetching} /></Card>
      </>
    );
  }

  const { stats, revenueChart, invoiceStatusChart, topProducts, recentInvoices } = data;
  const noBusiness = business.isSuccess && !business.data;

  return (
    <>
      <PageHeader title="Dashboard" description="A snapshot of your invoicing activity." actions={actions} />

      {noBusiness && (
        <Alert tone="warning" className="mb-6" title="Business profile required" action={<Link to="/business" className="font-semibold underline">Set up your business profile</Link>}>
          Invoices cannot be created until your business profile exists — it provides your invoice numbering and currency.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (paid)" value={formatMoney(stats.totalRevenue, currency)} hint="Sum of Paid invoices" icon={Wallet} tone="success" />
        <StatCard label="Outstanding" value={formatMoney(stats.totalDueAmount, currency)} hint="Sum of Pending invoices" icon={DollarSign} tone="warning" />
        <StatCard label="Total invoices" value={formatNumber(stats.totalInvoices)} icon={FileText} tone="brand" />
        <StatCard label="Paid" value={formatNumber(stats.paidInvoices)} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={formatNumber(stats.pendingInvoices)} icon={Hourglass} tone="info" />
        <StatCard label="Overdue" value={formatNumber(stats.overdueInvoices)} hint="Pending and past due date" icon={AlertTriangle} tone="danger" />
        <StatCard label="Customers" value={formatNumber(stats.totalCustomers)} icon={Users} tone="neutral" />
        <StatCard label="Products" value={formatNumber(stats.totalProducts)} icon={Package} tone="neutral" />
      </div>

      {stats.totalInvoices === 0 ? (
        <div className="mt-6"><SetupChecklist hasBusiness={Boolean(business.data)} stats={stats} /></div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><RevenueChart data={revenueChart} currency={currency} /></div>
            <StatusChart data={invoiceStatusChart} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader
                  title="Recent invoices"
                  action={<Link to="/invoices" className="text-sm font-medium text-brand hover:underline">View all</Link>}
                />
                {recentInvoices.length === 0 ? (
                  <EmptyState icon={Clock} title="No recent invoices" />
                ) : (
                  <InvoiceTable invoices={recentInvoices} currency={currency} compact />
                )}
              </Card>
            </div>
            <TopProducts data={topProducts} />
          </div>
        </>
      )}
    </>
  );
}
