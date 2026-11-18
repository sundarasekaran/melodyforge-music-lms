import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  savedUsername: string;
  login: (usernameOrEmail: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, username: string, displayName: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  awardLocalXp: (xp: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous recovery from localStorage for instant, flicker-free rendering
  const getInitialUser = (): User | null => {
    try {
      const stored = localStorage.getItem('music_lms_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem('music_lms_token'));
  const [savedUsername, setSavedUsername] = useState<string>(
    localStorage.getItem('music_lms_saved_username') || ''
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Background verification of token with backend
  const verifyAndRefreshUser = async () => {
    const storedToken = localStorage.getItem('music_lms_token');
    if (storedToken) {
      api.setToken(storedToken);
      try {
        const data = await api.getCurrentUser();
        const refreshedUser: User = {
          id: data.id,
          username: data.username,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          totalXp: data.totalXp,
          currentLevel: data.currentLevel,
          currentStreakDays: data.currentStreakDays,
        };
        setUser(refreshedUser);
        localStorage.setItem('music_lms_user', JSON.stringify(refreshedUser));
      } catch (e: any) {
        // If explicitly unauthorized (e.g. invalid or expired JWT token), clear session
        const msg = String(e?.message || '');
        if (msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized')) {
          console.warn('Session expired, clearing credentials', e);
          logout();
        } else {
          // Network delay or cold start; retain cached user so user is not kicked out
          console.warn('Backend verification pending (possible server wake-up). Keeping cached user.', e);
        }
      }
    }
  };

  useEffect(() => {
    verifyAndRefreshUser();
  }, []);

  const login = async (usernameOrEmail: string, password: string, rememberMe: boolean = true) => {
    setIsLoading(true);
    try {
      const data = await api.login(usernameOrEmail, password);
      const authenticatedUser: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        totalXp: data.totalXp,
        currentLevel: data.currentLevel,
        currentStreakDays: data.currentStreakDays,
      };

      setToken(data.token);
      setUser(authenticatedUser);

      // Persist signed credentials for later
      localStorage.setItem('music_lms_token', data.token);
      localStorage.setItem('music_lms_user', JSON.stringify(authenticatedUser));
      
      if (rememberMe) {
        localStorage.setItem('music_lms_saved_username', usernameOrEmail);
        localStorage.setItem('music_lms_remember_me', 'true');
        setSavedUsername(usernameOrEmail);
      } else {
        localStorage.removeItem('music_lms_saved_username');
        localStorage.removeItem('music_lms_remember_me');
        setSavedUsername('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    displayName: string,
    password: string,
    rememberMe: boolean = true
  ) => {
    setIsLoading(true);
    try {
      const data = await api.register(email, username, displayName, password);
      const newUser: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        totalXp: data.totalXp,
        currentLevel: data.currentLevel,
        currentStreakDays: data.currentStreakDays,
      };

      setToken(data.token);
      setUser(newUser);

      // Persist signed credentials for later
      localStorage.setItem('music_lms_token', data.token);
      localStorage.setItem('music_lms_user', JSON.stringify(newUser));

      if (rememberMe) {
        localStorage.setItem('music_lms_saved_username', username);
        localStorage.setItem('music_lms_remember_me', 'true');
        setSavedUsername(username);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('music_lms_token');
    localStorage.removeItem('music_lms_user');
    // Note: savedUsername is retained in localStorage so the user can easily re-login
  };

  const refreshUser = async () => {
    await verifyAndRefreshUser();
  };

  const awardLocalXp = (xp: number) => {
    if (user) {
      const newXp = user.totalXp + xp;
      const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);
      const updatedUser: User = {
        ...user,
        totalXp: newXp,
        currentLevel: newLevel,
      };
      setUser(updatedUser);
      localStorage.setItem('music_lms_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        savedUsername,
        login,
        register,
        logout,
        refreshUser,
        awardLocalXp,
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
