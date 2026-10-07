import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Plus, X } from 'lucide-react';
import Sidebar from '../components/navigation/Sidebar';
import UserMenu from '../components/navigation/UserMenu';
import ThemeToggle from '../components/common/ThemeToggle';
import Alert from '../components/feedback/Alert';
import { buttonClasses } from '../components/common/button-styles';
import { dismissStaleNotice, useStaleNotice } from '../lib/staleNotice';
import { DASHBOARD_CACHE_MINUTES } from '../lib/constants';

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const staleNotice = useStaleNotice();

  // Close the mobile drawer on navigation (state adjusted during render, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setDrawerOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line lg:block">
        <Sidebar />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-[var(--overlay)]" onClick={() => setDrawerOpen(false)} aria-hidden />
          <div className="pop-in absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line shadow-modal">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-fg-subtle hover:bg-surface-2"
            >
              <X className="size-5" />
            </button>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-surface/90 px-3 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="grid size-10 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link to="/invoices/new" className={buttonClasses({ size: 'sm', className: 'hidden sm:inline-flex' })}>
              <Plus className="size-4" aria-hidden /> New invoice
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {staleNotice && (
            <Alert tone="info" className="mb-5" onDismiss={dismissStaleNotice}>
              Invoice lists and dashboard totals are cached by the server for up to {DASHBOARD_CACHE_MINUTES} minutes,
              so recent changes may take a while to show up there. Individual invoice pages are always current.
            </Alert>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
