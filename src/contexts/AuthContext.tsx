import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType extends AuthState {
  login: (username: string, pincode: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check voor opgeslagen sessie
    const savedUser = localStorage.getItem('rijplanner_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem('rijplanner_user');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username: string, pincode: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username)
        .eq('pincode', pincode)
        .maybeSingle();

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data) {
        const user: User = {
          id: data.id,
          tenant_id: data.tenant_id,
          username: data.username,
          pincode: data.pincode,
          role: data.role as User['role'],
          name: data.name,
          created_at: data.created_at,
        };
        localStorage.setItem('rijplanner_user', JSON.stringify(user));
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('rijplanner_user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
