import { Link } from "react-router-dom";
import {
    FileStack,
    IndianRupee,
    PlusCircle,
    Receipt,
    Wallet,
    AlertTriangle,
} from "lucide-react";

import { useDashboard } from "../../hooks/useDashboard";
import { useBusiness } from "../../hooks/useBusiness";

import PageLoader from "../../components/common/PageLoader";
import StatCard from "../../components/dashboard/StatCard";
import RevenueChart from "../../components/dashboard/RevenueChart";
import StatusChart from "../../components/dashboard/StatusChart";
import TopList from "../../components/dashboard/TopList";
import InvoiceTable from "../../components/invoice/InvoiceTable";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

import { formatMoney } from "../../utils/format";

function Dashboard() {

    const { data: business } = useBusiness();
    const { data, isLoading, isError } = useDashboard();

    if (isLoading) return <PageLoader label="Loading your dashboard…" />;

    if (isError) {
        return (
            <Card className="p-8 text-center text-sm text-red-500">
                Could not load the dashboard. Please refresh the page.
            </Card>
        );
    }

    const currency = business?.currency || "INR";
    const stats = data?.stats || {};

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        An overview of your invoices, revenue, customers and products.
                    </p>
                </div>

                <Link to="/invoices/new">
                    <Button className="!w-auto gap-2 px-5">
                        <PlusCircle size={18} /> New invoice
                    </Button>
                </Link>
            </div>

            {!business && (
                <Card className="flex flex-col items-start gap-3 border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-amber-500" size={22} />
                        <p className="text-sm font-medium text-amber-800">
                            Set up your business profile to start creating invoices.
                        </p>
                    </div>
                    <Link to="/business">
                        <Button className="!w-auto bg-amber-600 px-4 hover:bg-amber-700">Set up business</Button>
                    </Link>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Receipt} label="Total invoices" value={stats.totalInvoices ?? 0} tone="blue" />
                <StatCard icon={Wallet} label="Paid invoices" value={stats.paidInvoices ?? 0} tone="emerald" />
                <StatCard icon={FileStack} label="Pending invoices" value={stats.pendingInvoices ?? 0} tone="amber" />
                <StatCard icon={AlertTriangle} label="Overdue invoices" value={stats.overdueInvoices ?? 0} tone="red" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <IndianRupee size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total revenue collected</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatMoney(stats.totalRevenue, currency)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <IndianRupee size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Amount due (pending)</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatMoney(stats.totalDueAmount, currency)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <RevenueChart data={data?.revenueChart} currency={currency} />
                <StatusChart data={data?.invoiceStatusChart} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TopList
                    title="Top customers"
                    subtitle="Ranked by revenue from paid invoices"
                    icon={Receipt}
                    items={data?.topCustomers}
                    nameKey="customerName"
                    currency={currency}
                />
                <TopList
                    title="Top products"
                    subtitle="Ranked by revenue from paid invoices"
                    icon={FileStack}
                    items={data?.topProducts}
                    nameKey="productName"
                    currency={currency}
                />
            </div>

            <Card title="Recent invoices" className="p-6">
                <div className="mt-4">
                    <InvoiceTable invoices={data?.recentInvoices} />
                </div>
                <div className="mt-4 text-right">
                    <Link to="/invoices" className="text-sm font-medium text-blue-600 hover:underline">
                        View all invoices →
                    </Link>
                </div>
            </Card>

        </div>
    );
}

export default Dashboard;
