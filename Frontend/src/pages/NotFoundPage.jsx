import { Link } from 'react-router-dom';
import { buttonClasses } from '../components/common/button-styles';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <p className="text-6xl font-semibold tracking-tight text-brand">404</p>
        <h1 className="mt-3 text-xl font-semibold text-fg">Page not found</h1>
        <p className="mt-1 text-sm text-fg-muted">The page you’re looking for doesn’t exist or was moved.</p>
        <Link to="/" className={buttonClasses({ className: 'mt-6' })}>Back to dashboard</Link>
      </div>
    </div>
  );
}
