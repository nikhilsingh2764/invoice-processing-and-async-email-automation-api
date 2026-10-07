import axios from 'axios';

const GENERIC = {
  network: "Can't reach the server. Check your connection and try again.",
  timeout: 'The request took too long. Please try again.',
  server: 'Something went wrong on our side. Please try again in a moment.',
  unknown: 'Something unexpected happened. Please try again.',
};

/**
 * Convert any thrown value into a predictable, user-safe shape.
 * Backend error body: { success: false, message }  (+ optionally `errors: [{ path, msg }]`).
 * Messages for 5xx responses are never shown verbatim.
 */
export function normalizeError(error) {
  if (axios.isCancel(error)) return { kind: 'cancelled', status: 0, message: '', fieldErrors: {} };

  if (error?.response) {
    const { status, data } = error.response;
    const serverMessage = typeof data?.message === 'string' && data.message.trim() ? data.message : '';
    const fieldErrors = {};
    if (Array.isArray(data?.errors)) {
      for (const e of data.errors) {
        const key = e?.path ?? e?.param;
        if (key && !fieldErrors[key]) fieldErrors[key] = e.msg ?? e.message ?? 'Invalid value';
      }
    }
    if (status >= 500) return { kind: 'server', status, message: GENERIC.server, fieldErrors };
    const fallback = {
      400: 'The request was invalid. Please check your input.',
      401: 'Your session has expired. Please sign in again.',
      403: "You don't have permission to do that.",
      404: 'We could not find what you were looking for.',
      409: 'This conflicts with existing data.',
      422: 'Some fields are invalid. Please review and try again.',
      429: 'Too many requests. Please wait a minute and try again.',
    }[status] ?? GENERIC.unknown;
    const kinds = { 400: 'badRequest', 401: 'auth', 403: 'forbidden', 404: 'notFound', 409: 'conflict', 422: 'validation', 429: 'rateLimit' };
    return { kind: kinds[status] ?? 'client', status, message: serverMessage || fallback, fieldErrors };
  }

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return { kind: 'timeout', status: 0, message: GENERIC.timeout, fieldErrors: {} };
  }
  if (axios.isAxiosError(error)) return { kind: 'network', status: 0, message: GENERIC.network, fieldErrors: {} };
  if (error instanceof Error && error.message) return { kind: 'unknown', status: 0, message: error.message, fieldErrors: {} };
  return { kind: 'unknown', status: 0, message: GENERIC.unknown, fieldErrors: {} };
}

export const getErrorMessage = (error) => normalizeError(error).message;

/** Map server-side field errors (when present) onto react-hook-form; returns true if any were applied. */
export function applyFieldErrors(error, setError, knownFields) {
  const { fieldErrors } = normalizeError(error);
  let applied = false;
  for (const [path, message] of Object.entries(fieldErrors)) {
    if (!knownFields || knownFields.includes(path)) {
      setError(path, { type: 'server', message });
      applied = true;
    }
  }
  return applied;
}

/** TanStack Query retry policy: retry transient failures once, never 4xx (incl. 429). */
export function shouldRetry(failureCount, error) {
  if (failureCount >= 1) return false;
  return ['network', 'timeout', 'server'].includes(normalizeError(error).kind);
}
