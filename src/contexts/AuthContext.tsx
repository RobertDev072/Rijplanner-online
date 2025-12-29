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
    theory_passed: data.theory_passed as boolean | undefined,
    theory_passed_at: data.theory_passed_at as string | null | undefined,
    created_at: data.created_at as string,
  });

  useEffect(() => {
    const initAuth = async () => {
      // Check for existing Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // We have a valid session, try to get user data from localStorage
        const savedUser = localStorage.getItem('rijplanner_user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          } catch {
            // Invalid saved user, clear it
            localStorage.removeItem('rijplanner_user');
          }
        }
      }
      
      // No valid session or user data
      localStorage.removeItem('rijplanner_user');
      setState(prev => ({ ...prev, isLoading: false }));
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('rijplanner_user');
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
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
      // Use edge function to bypass RLS for login
      const response = await fetch(
        'https://mlbeciqslbemjrezgclq.supabase.co/functions/v1/secure-login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, pincode }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.user) {
        console.error('Login failed:', result.error);
        return false;
      }

      // Set the Supabase session if we got one
      if (result.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
        
        if (sessionError) {
          console.error('Failed to set session:', sessionError);
          return false;
        }
      }

      const user = mapUser(result.user);
      localStorage.setItem('rijplanner_user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
