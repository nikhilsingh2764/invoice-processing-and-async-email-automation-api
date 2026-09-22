import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-slate-100 px-1 pt-4">

            <p className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-900">{currentPage}</span> of{" "}
                <span className="font-medium text-slate-900">{totalPages}</span>
            </p>

            <div className="flex gap-2">

                <button
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={16} /> Prev
                </button>

                <button
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next <ChevronRight size={16} />
                </button>

            </div>

        </div>
    );
}

export default Pagination;
