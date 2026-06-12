/**
 * AuthContext
 *
 * Provides:
 *   - user       : current UserResponse | null
 *   - loading    : true while restoring session on startup
 *   - signIn(email, password) → throws ApiError on failure
 *   - signUp(name, email, password, phone) → throws ApiError on failure
 *   - signOut()
 *   - refreshUser() → re-fetches /auth/me and updates stored user
 *
 * Usage in any screen:
 *   const { user, signIn, signOut } = useAuth();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {authApi} from '../api/services';
import {tokenStorage} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // restoring session

  // ── Restore session on app launch ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStorage.getAccess();
        if (!token) return;
        // Validate token by fetching current profile
        const me = await authApi.getMe();
        await tokenStorage.setUser(me);
        setUser(me);
      } catch {
        // Token invalid or expired — clear storage silently
        await tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Sign In ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    const {accessToken, refreshToken, user: me} = await authApi.signIn({
      email,
      password,
    });
    await tokenStorage.setTokens(accessToken, refreshToken);
    await tokenStorage.setUser(me);
    setUser(me);
    return me;
  }, []);

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (name, email, password, phone) => {
    const {accessToken, refreshToken, user: me} = await authApi.signUp({
      name,
      email,
      password,
      phone: phone || undefined,
    });
    await tokenStorage.setTokens(accessToken, refreshToken);
    await tokenStorage.setUser(me);
    setUser(me);
    return me;
  }, []);

  // ── Sign Out ────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
  }, []);

  // ── Refresh profile ─────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const me = await authApi.getMe();
    await tokenStorage.setUser(me);
    setUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider value={{user, loading, signIn, signUp, signOut, refreshUser}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}