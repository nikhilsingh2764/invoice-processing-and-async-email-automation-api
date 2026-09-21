function EmptyState({ icon: Icon, title, description, action }) {

    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

            {Icon && (
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Icon size={26} />
                </div>
            )}

            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

            {description && (
                <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
            )}

            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export default EmptyState;
