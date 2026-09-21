import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = ({ showText = true }) => {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 select-none"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
        <FileText size={22} strokeWidth={2.5} />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            InvoicePilot
          </span>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Smart Invoice Management
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;