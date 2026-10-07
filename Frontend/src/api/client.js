import axios from 'axios';
import { API_BASE_URL } from '../config/env';

// Endpoints where a 401 means "bad credentials / not signed in", never "access token expired".
const NO_REFRESH_PATHS = new Set([
  '/login', '/signup', '/verify-otp', '/refresh-token', '/google', '/forgot-password', '/reset-password',
]);

const pathOf = (url = '') => url.split('?')[0];

/**
 * Builds an axios instance that talks to the backend using its HttpOnly cookies
 * (accessToken + refreshToken). Tokens are never read or stored by JavaScript.
 *
 * 401 handling (single-flight, loop-free):
 *  1. A request fails with 401 -> one shared POST /refresh-token is issued (all concurrent 401s wait on it).
 *  2. Refresh OK  -> the original request is retried exactly once.
 *  3. Refresh 401/403 -> `onAuthFailure()` is called (the app signs the user out) and the original error is rejected.
 *  4. Refresh network/429/5xx -> that error is surfaced; the user stays signed in.
 *  A request is never retried twice, and /refresh-token itself is never refreshed.
 */
export function createApiClient(baseURL, onAuthFailure = () => {}) {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30_000,
    headers: { Accept: 'application/json' },
  });

  let refreshPromise = null;
  const refreshSession = () => {
    if (!refreshPromise) {
      refreshPromise = instance
        .post('/refresh-token')
        .finally(() => { refreshPromise = null; });
    }
    return refreshPromise;
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;
      if (
        error.response?.status !== 401 ||
        !config ||
        config._retried ||
        NO_REFRESH_PATHS.has(pathOf(config.url))
      ) {
        return Promise.reject(error);
      }
      config._retried = true;
      try {
        await refreshSession();
      } catch (refreshError) {
        const status = refreshError.response?.status;
        if (status === 401 || status === 403) {
          onAuthFailure();
          return Promise.reject(error);
        }
        return Promise.reject(refreshError);
      }
      return instance(config);
    },
  );

  return instance;
}

let authFailureListener = () => {};
/** The auth provider registers how the app reacts when the session cannot be recovered. */
export const setAuthFailureListener = (fn) => { authFailureListener = fn; };

export const client = createApiClient(API_BASE_URL, () => authFailureListener());

/** Backend success envelope: { success, statuscode, message, data } -> data */
export const unwrap = (response) => response.data?.data;

/** Drop empty values so optional query params are omitted rather than sent blank. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}
