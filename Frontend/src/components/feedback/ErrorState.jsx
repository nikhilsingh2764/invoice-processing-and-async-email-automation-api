import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import { normalizeError } from '../../lib/errors';

export default function ErrorState({ error, title = 'Something went wrong', onRetry, retrying = false }) {
  const { message } = normalizeError(error);
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      <p className="mt-1 max-w-md break-words text-sm text-fg-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry} loading={retrying}>
          {!retrying && <RefreshCw className="size-4" aria-hidden />}
          Try again
        </Button>
      )}
    </div>
  );
}
