import clsx from "clsx";

function StatCard({ icon: Icon, label, value, tone = "blue" }) {

    const tones = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
        slate: "bg-slate-100 text-slate-600",
    };

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <div className={clsx("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
                    <Icon size={18} />
                </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

export default StatCard;
