import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';
import { PageSpinner } from '../feedback/Spinner';
import ErrorState from '../feedback/ErrorState';
import Logo from '../common/Logo';

function Fullscreen({ children }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas p-6">
      <div className="w-full max-w-md text-center">
        <Logo className="mb-6" />
        {children}
      </div>
    </div>
  );
}

/** Blocks private routes until the session is known. Redirects to /login when signed out. */
export function RequireAuth() {
  const { status, error, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Fullscreen><PageSpinner label="Checking your session…" /></Fullscreen>;
  if (status === 'error') return <Fullscreen><ErrorState title="Can't reach the server" error={error} onRetry={retry} /></Fullscreen>;
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

/** Login / signup pages: send already-signed-in users to the app. */
export function PublicOnly() {
  const { status, error, retry } = useAuth();
  if (status === 'loading') return <Fullscreen><PageSpinner label="Loading…" /></Fullscreen>;
  if (status === 'error') return <Fullscreen><ErrorState title="Can't reach the server" error={error} onRetry={retry} /></Fullscreen>;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}
