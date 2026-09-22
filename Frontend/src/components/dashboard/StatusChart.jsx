import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { PieChart as PieIcon } from "lucide-react";

const COLORS = {
    Draft: "#94a3b8",
    Pending: "#f59e0b",
    Paid: "#10b981",
    "Partially Paid": "#0ea5e9",
    Overdue: "#ef4444",
    Cancelled: "#cbd5e1",
};

function StatusChart({ data = [] }) {

    const chartData = data.map((d) => ({
        name: d._id || "Unknown",
        value: d.totalInvoices,
    }));

    return (
        <Card title="Invoices by status" className="p-6">
            {chartData.length === 0 ? (
                <EmptyState
                    icon={PieIcon}
                    title="No invoices yet"
                    description="Create your first invoice to see a status breakdown here."
                />
            ) : (
                <div className="mt-4 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={2}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
}

export default StatusChart;
