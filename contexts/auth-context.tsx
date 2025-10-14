"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  type AuthState,
  authenticate,
  getStoredUser,
  storeUser,
  clearStoredUser,
} from "@/lib/auth";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  canAccessReports: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const user = getStoredUser();
    setAuthState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const user = await authenticate(username, password);
      if (user) {
        storeUser(user);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    clearStoredUser();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const canAccessReports = (): boolean => {
    return ["premium", "basic"].includes(authState.user?.role ?? "");
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    canAccessReports,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
