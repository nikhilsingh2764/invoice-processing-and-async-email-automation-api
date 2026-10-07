import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../common/Button';
import { PAGE_SIZES } from '../../lib/constants';
import { formatNumber } from '../../lib/format';

export default function Pagination({ page, totalPages, total, limit, onPage, onLimit, noun = 'items' }) {
  if (!total) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm sm:flex-row sm:px-5">
      <p className="text-fg-muted">
        Showing <span className="font-medium text-fg">{formatNumber(from)}–{formatNumber(to)}</span> of{' '}
        <span className="font-medium text-fg">{formatNumber(total)}</span> {noun}
      </p>
      <div className="flex items-center gap-3">
        {onLimit && (
          <label className="flex items-center gap-2 text-fg-muted">
            <span className="hidden sm:inline">Rows</span>
            <select
              value={limit}
              onChange={(e) => onLimit(Number(e.target.value))}
              aria-label="Rows per page"
              className="h-8 rounded-lg border border-line-strong bg-surface px-2 text-sm text-fg"
            >
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        )}
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-20 text-center text-fg-muted">Page {page} / {Math.max(totalPages, 1)}</span>
          <Button variant="secondary" size="sm" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
