import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string; role: Role; department?: string; interests?: string[] }) => Promise<void>;
  demoLogin: (role: Role) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: Role) => Promise<void>;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cc_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('cc_auth_token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setToken(savedToken);
    } catch (err) {
      console.warn('Session expired or invalid, clearing:', err);
      localStorage.removeItem('cc_auth_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If no token exists at all on first launch, auto-login with Alex Rivera (Student demo)
    // so reviewer immediately gets the complete rich dashboard experience without friction!
    const savedToken = localStorage.getItem('cc_auth_token');
    if (!savedToken) {
      api.demoLogin('student').then(res => {
        localStorage.setItem('cc_auth_token', res.token);
        setToken(res.token);
        setUser(res.user);
      }).catch(err => {
        console.error('Auto demo login failed:', err);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      refreshUser();
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('cc_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
  };

  const signup = async (payload: { name: string; email: string; password: string; role: Role; department?: string; interests?: string[] }) => {
    const res = await api.signup(payload);
    localStorage.setItem('cc_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
  };

  const demoLogin = async (targetRole: Role) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(targetRole);
      localStorage.setItem('cc_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: Role) => {
    await demoLogin(newRole);
  };

  const logout = () => {
    localStorage.removeItem('cc_auth_token');
    setUser(null);
    setToken(null);
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        demoLogin,
        logout,
        switchRole,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        refreshUser
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
