"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get current user info
        const response = await apiClient.auth.getCurrentUser();
        setAuthState({
          user: response.data,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        // Token might be expired or invalid
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback((userData: User) => {
    setAuthState({
      user: userData,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend logout to clear refresh token cookie
      await apiClient.auth.logout();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }, []);

  const updateUser = useCallback((userData: User) => {
    setAuthState(prev => ({
      ...prev,
      user: userData,
    }));
  }, []);

  return {
    ...authState,
    login,
    logout,
    updateUser,
  };
};
