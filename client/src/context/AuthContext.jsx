import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

/**
 * ============================================================================
 * AUTH CONTEXT & PROVIDER
 * ============================================================================
 * 
 * Beginner Guide for Trainees:
 * 1. What is React Context?
 *    - Allows sharing authentication state (user, token, role) with any component
 *      in the app without passing props manually through every level.
 * 
 * 2. Key Methods Provided:
 *    - `login(email, password)`: Sends credentials to API, stores JWT token in localStorage.
 *    - `register(userData)`: Creates new account and logs in automatically.
 *    - `logout()`: Clears localStorage and resets user state to null.
 *    - `quickLogin(role)`: 1-click helper for instant demo access.
 *    - `useAuth()`: Custom hook to easily consume auth state anywhere in the code.
 */

// 1. Create the Context object
const AuthContext = createContext(null);

// 2. Auth Provider Component wrapping the entire application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('visitor_pass_token') || null);
  const [loading, setLoading] = useState(true);

  // Check existing token when user loads or refreshes the page
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('visitor_pass_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Standard Login Action
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('visitor_pass_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  // Standard Register Action
  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('visitor_pass_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  // Logout Action
  const logout = () => {
    localStorage.removeItem('visitor_pass_token');
    setToken(null);
    setUser(null);
  };

  // 1-Click Demo Login Helper (Pre-configured demo users from seed.js)
  const quickLogin = async (role) => {
    const credentials = {
      admin: { email: 'admin@techcorp.com', password: 'admin123' },
      security: { email: 'security@techcorp.com', password: 'security123' },
      employee: { email: 'alex.morgan@techcorp.com', password: 'employee123' },
      visitor: { email: 'visitor@example.com', password: 'visitor123' },
    };

    const cred = credentials[role];
    if (cred) {
      return await login(cred.email, cred.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'guest',
        loading,
        login,
        register,
        logout,
        quickLogin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to consume AuthContext cleanly in any React component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
