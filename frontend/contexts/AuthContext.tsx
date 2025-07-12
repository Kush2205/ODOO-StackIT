"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, setAuthToken, getAuthToken, removeAuthToken } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const savedUser = localStorage.getItem('stackit-user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('stackit-user');
        removeAuthToken();
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authApi.login({ email, password });
      
      if (result.success && result.data) {
        const { access_token } = result.data;
        setAuthToken(access_token);
        
        // Create user object - in a real app, you'd decode the JWT or make another API call
        const mockUser: User = {
          id: "1",
          name: email.split('@')[0], // Use email prefix as name for now
          email: email,
          avatar: email.split('@')[0].substring(0, 2).toUpperCase(),
          role: "user"
        };
        
        setUser(mockUser);
        localStorage.setItem('stackit-user', JSON.stringify(mockUser));
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authApi.register({ 
        username, 
        email, 
        password, 
        is_admin: false 
      });
      
      if (result.success) {
        // After successful registration, automatically log the user in
        await login(email, password);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('stackit-user');
    removeAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
