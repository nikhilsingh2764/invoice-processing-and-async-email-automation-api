import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { Icon } from './Icon.jsx'

/**
 * Ledger table. columns: [{key, header, render(row,i), num, primary, hideSm, label, sortKey, width, actions}]
 * Under 40rem of container width each row becomes a stacked card (see patterns.css).
 */
export function Ledger({ caption, columns, rows, rowKey = (r) => r.id, onRowClick, sort, onSort, gutter = false, enter = false, footer, selectedId }) {
  const ariaSort = (c) => (c.sortKey && sort?.key === c.sortKey ? (sort.order === 'asc' ? 'ascending' : 'descending') : c.sortKey ? 'none' : undefined)
  return (
    <div className="ledger-wrap">
      <div className="ledger-scroll">
        <table className="ledger">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {gutter && <th scope="col" className="gutter"><span className="sr-only">Row</span></th>}
              {columns.map((c) => (
                <th key={c.key} scope="col" className={c.num ? 'num' : undefined} aria-sort={ariaSort(c)} style={c.width ? { inlineSize: c.width } : undefined}>
                  {c.sortKey && onSort ? (
                    <button type="button" className="ledger-sort" onClick={() => onSort(c.sortKey)}>
                      {c.header}
                      <Icon as={sort?.key === c.sortKey ? (sort.order === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown} size={14} />
                    </button>
                  ) : c.actions ? (
                    <span className="sr-only">{c.header}</span>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={rowKey(r)} data-clickable={onRowClick ? 'true' : undefined} data-enter={enter ? 'true' : undefined} data-selected={selectedId && rowKey(r) === selectedId ? 'true' : undefined} style={{ '--i': Math.min(i, 12) }} onClick={onRowClick ? (e) => !e.target.closest('a,button,input,[role="menu"]') && onRowClick(r) : undefined}>
                {gutter && <td className="gutter">{i + 1}</td>}
                {columns.map((c) => (
                  <td key={c.key} className={c.num ? 'num' : undefined} data-label={c.label ?? c.header} data-primary={c.primary ? 'true' : undefined} data-hide-sm={c.hideSm ? 'true' : undefined} data-actions={c.actions ? 'true' : undefined}>
                    {c.render ? c.render(r, i) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
    </div>
  )
}
