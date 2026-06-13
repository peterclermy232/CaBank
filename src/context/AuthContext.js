import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {authApi} from '../api/services';
import {tokenStorage} from '../api/client';
import {clearBiometricCredential} from '../utils/biometrics';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on app launch ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStorage.getAccess();
        if (!token) return;
        const me = await authApi.getMe();
        await tokenStorage.setUser(me);
        setUser(me);
      } catch {
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
  await clearBiometricCredential();
  setUser(null);
}, []);

  // ── Refresh profile ─────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const me = await authApi.getMe();
    await tokenStorage.setUser(me);
    setUser(me);
    return me;
  }, []);

  // ── Sign In With Tokens (biometric flow) ────────────────────────────────────
  const signInWithTokens = useCallback(async ({accessToken, refreshToken, user: me}) => {
    await tokenStorage.setTokens(accessToken, refreshToken);
    await tokenStorage.setUser(me);
    setUser(me);
    return me;
  }, []);

  // ── Get stored refresh token (for BiometricScreen) ──────────────────────────
  const getRefreshToken = useCallback(async () => {
    return tokenStorage.getRefresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        signInWithTokens,
        getRefreshToken,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}