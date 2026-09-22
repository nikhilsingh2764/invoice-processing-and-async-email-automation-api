import { forwardRef } from "react";

const Textarea = forwardRef(({ label, error, className = "", rows = 3, ...props }, ref) => {

    return (
        <div className="space-y-2">

            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}

            <textarea
                ref={ref}
                rows={rows}
                className={`
                    w-full rounded-xl border border-slate-300 bg-white px-4 py-3
                    text-slate-900 placeholder:text-slate-400 outline-none
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    ${className}
                `}
                {...props}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
});

Textarea.displayName = "Textarea";

export default Textarea;
