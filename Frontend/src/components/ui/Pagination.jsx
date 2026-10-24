import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button.jsx'
import { PAGE_SIZES } from '../../config/enums.js'

export function Pagination({ page, pages, total, limit, onPage, onLimit, noun = 'items' }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(total, page * limit)
  return (
    <nav className="pagination" aria-label="Pagination">
      <p className="muted tabular" role="status">
        {from}–{to} of {total} {noun}
      </p>
      <div className="chips" style={{ alignItems: 'center' }}>
        {onLimit && (
          <label className="muted" style={{ fontSize: 'var(--text-sm)', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            Rows
            <select className="select" style={{ inlineSize: 'auto', blockSize: 'var(--control-sm)', paddingBlock: 0 }} value={limit} onChange={(e) => onLimit(Number(e.target.value))}>
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
        <Button size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <span className="tabular" aria-current="page">Page {page} of {Math.max(1, pages)}</span>
        <Button size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
          <ChevronRight width={16} height={16} aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
