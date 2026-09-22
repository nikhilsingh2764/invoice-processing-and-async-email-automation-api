import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(({ label, error, className = "", children, ...props }, ref) => {

    return (
        <div className="space-y-2">

            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}

            <div className="relative">
                <select
                    ref={ref}
                    className={`
                        w-full appearance-none rounded-xl border border-slate-300
                        bg-white px-4 py-3 pr-10 text-slate-900 outline-none
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                        ${className}
                    `}
                    {...props}
                >
                    {children}
                </select>

                <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
});

Select.displayName = "Select";

export default Select;
