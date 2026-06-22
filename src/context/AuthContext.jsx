import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginUser, registerUser, authStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // On mount, validate that any stored session hasn't expired client-side.
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      authStorage.clearSession();
      setUser(null);
    }
    setAuthChecked(true);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      authStorage.setSession(data.token, data.user);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await registerUser({ name, email, password });
      authStorage.setSession(data.token, data.user);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.errors?.join(' ') ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authStorage.clearSession();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    authChecked,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
