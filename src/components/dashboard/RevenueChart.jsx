import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { BarChart3 } from "lucide-react";
import { formatMoney } from "../../utils/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function RevenueChart({ data = [], currency = "INR" }) {

    const chartData = data.map((d) => ({
        label: `${MONTHS[d._id.month - 1]} ${d._id.year}`,
        revenue: d.totalRevenue,
        invoices: d.totalInvoices,
    }));

    return (
        <Card title="Revenue" subtitle="Monthly revenue from paid invoices" className="p-6">
            {chartData.length === 0 ? (
                <EmptyState
                    icon={BarChart3}
                    title="No revenue yet"
                    description="Paid invoices will appear here once you start getting paid."
                />
            ) : (
                <div className="mt-4 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={70} />
                            <Tooltip
                                formatter={(value) => formatMoney(value, currency)}
                                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                            />
                            <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
}

export default RevenueChart;
