import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

export const AuthContext = createContext();

// Decode JWT payload without a library
const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);
  const warnTimerRef = useRef(null);

  const clearTimers = () => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
  };

  const logout = useCallback(() => {
    clearTimers();
    setUser(null);
    authService.logout();
  }, []);

  const scheduleAutoLogout = useCallback((token) => {
    clearTimers();
    const payload = decodeJwt(token);
    if (!payload?.exp) return;

    const expiresAt = payload.exp * 1000; // ms
    const now = Date.now();
    const msUntilExpiry = expiresAt - now;
    const msUntilWarn = msUntilExpiry - 60_000; // warn 1 min before

    if (msUntilExpiry <= 0) {
      // Token already expired
      logout();
      return;
    }

    if (msUntilWarn > 0) {
      warnTimerRef.current = setTimeout(() => {
        toast.warn('⚠️ Your session expires in 1 minute. Please save your work!', {
          autoClose: 15000,
          toastId: 'session-warn',
        });
      }, msUntilWarn);
    }

    logoutTimerRef.current = setTimeout(() => {
      toast.error('🔒 Session expired. You have been logged out.', { autoClose: 4000 });
      logout();
    }, msUntilExpiry);
  }, [logout]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const token = localStorage.getItem('authToken');
    if (currentUser && token) {
      setUser(currentUser);
      scheduleAutoLogout(token);
    }
    setLoading(false);

    return () => clearTimers();
  }, [scheduleAutoLogout]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    const token = localStorage.getItem('authToken');
    if (token) scheduleAutoLogout(token);
  };

  const isAdmin = () => user?.role === 'Admin';
  const isStudent = () => user?.role === 'Student';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};
