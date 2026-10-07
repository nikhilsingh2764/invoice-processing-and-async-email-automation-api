import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * Accessible-enough action menu. `items`: [{ label, icon, onClick, danger, disabled, divider }]
 * `trigger(props)` must render a <button {...props}>.
 */
export default function Dropdown({ trigger, items, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); rootRef.current?.querySelector('button')?.focus(); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    menuRef.current?.querySelector('button:not(:disabled)')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onMenuKey = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const els = [...menuRef.current.querySelectorAll('button:not(:disabled)')];
    const i = els.indexOf(document.activeElement);
    els[(i + (e.key === 'ArrowDown' ? 1 : -1) + els.length) % els.length]?.focus();
  };

  return (
    <div ref={rootRef} className={cn('relative inline-block', className)}>
      {trigger({ onClick: () => setOpen((o) => !o), 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': open ? menuId : undefined })}
      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          onKeyDown={onMenuKey}
          className={cn(
            'pop-in absolute z-40 mt-1.5 min-w-48 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-pop',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, i) => item.divider ? (
            <div key={`d${i}`} role="separator" className="my-1 h-px bg-line" />
          ) : (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => { setOpen(false); item.onClick?.(); }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:opacity-50',
                item.danger ? 'text-danger hover:bg-danger-soft' : 'text-fg hover:bg-surface-2',
              )}
            >
              {item.icon && <item.icon className="size-4 shrink-0" aria-hidden />}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
