import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './auth-context';
import { getProfile } from '../../api/profile.api';
import { logout } from '../../api/auth.api';
import { setAuthFailureListener } from '../../api/client';
import { keys } from '../../lib/queryKeys';

/**
 * Session state lives in ONE query: ['profile'].
 *  - data = user object  -> authenticated
 *  - data = null         -> signed out
 *  - error               -> backend unreachable (not the same as signed out)
 * The profile is fetched once on startup; afterwards it is only updated by explicit actions.
 * Tokens are HttpOnly cookies managed by the browser + backend; this code never touches them.
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: keys.profile,
    queryFn: async () => {
      try {
        return await getProfile();
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const clearSession = useCallback(() => {
    queryClient.setQueryData(keys.profile, null);
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== keys.profile[0] });
  }, [queryClient]);

  // When /refresh-token is rejected the session is unrecoverable: sign out locally (idempotent).
  useEffect(() => {
    setAuthFailureListener(clearSession);
    return () => setAuthFailureListener(() => {});
  }, [clearSession]);

  /** Call after login / Google login: confirms the browser really kept the session cookies. */
  const establishSession = useCallback(async () => {
    const user = await getProfile();
    queryClient.setQueryData(keys.profile, user);
    return user;
  }, [queryClient]);

  const setUser = useCallback((user) => queryClient.setQueryData(keys.profile, user), [queryClient]);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      // The local session is always cleared, even if the server could not be reached.
    }
    clearSession();
  }, [clearSession]);

  const status = profile.isPending ? 'loading' : profile.isError ? 'error' : profile.data ? 'authenticated' : 'unauthenticated';

  const value = useMemo(() => ({
    status,
    user: profile.data ?? null,
    error: profile.error,
    retry: profile.refetch,
    establishSession,
    setUser,
    signOut,
    clearSession,
  }), [status, profile.data, profile.error, profile.refetch, establishSession, setUser, signOut, clearSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
