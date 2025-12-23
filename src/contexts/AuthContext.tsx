import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthState } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType extends AuthState {
  login: (username: string, pincode: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const mapUser = (data: Record<string, unknown>): User => ({
    id: data.id as string,
    tenant_id: data.tenant_id as string | null,
    username: data.username as string,
    pincode: data.pincode as string,
    role: data.role as User['role'],
    name: data.name as string,
    avatar_url: data.avatar_url as string | null,
    email: data.email as string | null,
    phone: data.phone as string | null,
    address: data.address as string | null,
    created_at: data.created_at as string,
  });

  useEffect(() => {
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

  const refreshUser = useCallback(async () => {
    if (!state.user) return;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', state.user.id)
      .single();

    if (!error && data) {
      const user = mapUser(data);
      localStorage.setItem('rijplanner_user', JSON.stringify(user));
      setState(prev => ({ ...prev, user }));
    }
  }, [state.user]);

  const login = async (username: string, pincode: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username)
        .eq('pincode', pincode)
        .maybeSingle();

      if (error || !data) return false;

      const user = mapUser(data);
      localStorage.setItem('rijplanner_user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('rijplanner_user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
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
