import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { formatMoney } from "../../utils/format";

function TopList({ title, subtitle, icon: Icon, items = [], nameKey, currency = "INR" }) {

    return (
        <Card title={title} subtitle={subtitle} className="p-6">
            {items.length === 0 ? (
                <EmptyState icon={Icon} title="Nothing here yet" description="Data will show up once you have paid invoices." />
            ) : (
                <ul className="mt-4 divide-y divide-slate-50">
                    {items.map((item, index) => (
                        <li key={item._id || index} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{item[nameKey] || "—"}</p>
                                    {item.totalQuantitySold != null && (
                                        <p className="text-xs text-slate-400">{item.totalQuantitySold} sold</p>
                                    )}
                                    {item.totalInvoices != null && item.customerEmail && (
                                        <p className="text-xs text-slate-400">{item.customerEmail}</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                                {formatMoney(item.totalRevenue, currency)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

export default TopList;
