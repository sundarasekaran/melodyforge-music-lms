import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (email: string, username: string, displayName: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoAccount: (role: 'STUDENT' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
  awardLocalXp: (xp: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('music_lms_token'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      if (api.getToken()) {
        const data = await api.getCurrentUser();
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          totalXp: data.totalXp,
          currentLevel: data.currentLevel,
          currentStreakDays: data.currentStreakDays,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch current user, clearing session', e);
      api.setToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(usernameOrEmail, password);
      setToken(data.token);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        totalXp: data.totalXp,
        currentLevel: data.currentLevel,
        currentStreakDays: data.currentStreakDays,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, displayName: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.register(email, username, displayName, password);
      setToken(data.token);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        totalXp: data.totalXp,
        currentLevel: data.currentLevel,
        currentStreakDays: data.currentStreakDays,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
  };

  const switchDemoAccount = async (role: 'STUDENT' | 'ADMIN') => {
    if (role === 'STUDENT') {
      await login('student', 'student123');
    } else {
      await login('admin', 'admin123');
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const awardLocalXp = (xp: number) => {
    if (user) {
      const newXp = user.totalXp + xp;
      const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);
      setUser({
        ...user,
        totalXp: newXp,
        currentLevel: newLevel,
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      switchDemoAccount,
      refreshUser,
      awardLocalXp,
    }}>
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
