import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for automatic logout events triggered by 401s in api.js
    const handleAutoLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:logout', handleAutoLogout);

    // Verify token validity on initial boot if token exists
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authService.getProfile();
          setUser(res.user);
        } catch {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
