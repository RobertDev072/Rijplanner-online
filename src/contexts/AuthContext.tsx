import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthState } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeUserForStorage, generateSecureToken } from '@/utils/securityTokens';

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
    pincode: '', // Never store pincode
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

  // Check for existing Supabase session on mount
  useEffect(() => {
    const initAuth = async () => {
      // First check for Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user data from our users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!error && userData) {
          const user = mapUser(userData);
          const safeUser = sanitizeUserForStorage(user);
          localStorage.setItem('rijplanner_user', JSON.stringify(safeUser));
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }

      // Fallback to localStorage (for backwards compatibility during migration)
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
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('rijplanner_user');
        localStorage.removeItem('rijplanner_session_token');
        localStorage.removeItem('impersonation_token');
        setState({ user: null, isAuthenticated: false, isLoading: false });
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Defer the data fetch to avoid deadlock
        setTimeout(async () => {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!error && userData) {
            const user = mapUser(userData);
            const safeUser = sanitizeUserForStorage(user);
            localStorage.setItem('rijplanner_user', JSON.stringify(safeUser));
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        }, 0);
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
      const safeUser = sanitizeUserForStorage(user);
      localStorage.setItem('rijplanner_user', JSON.stringify(safeUser));
      setState(prev => ({ ...prev, user }));
    }
  }, [state.user]);

  const login = async (username: string, pincode: string): Promise<boolean> => {
    try {
      // Call the secure-login edge function
      const { data, error } = await supabase.functions.invoke('secure-login', {
        body: { username, pincode },
      });

      if (error || !data?.success) {
        console.error('Login failed:', error || data?.error);
        return false;
      }

      // If we got a session, set it in Supabase Auth
      if (data.session?.access_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Create user object from response
      const user: User = {
        id: data.user.id,
        tenant_id: data.user.tenant_id,
        username: data.user.username,
        pincode: '', // Never store pincode
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        avatar_url: null,
        phone: null,
        address: null,
        created_at: new Date().toISOString(),
      };

      const safeUser = sanitizeUserForStorage(user);
      const sessionToken = generateSecureToken();
      localStorage.setItem('rijplanner_user', JSON.stringify(safeUser));
      localStorage.setItem('rijplanner_session_token', sessionToken);
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // Clear local storage
    localStorage.removeItem('rijplanner_user');
    localStorage.removeItem('rijplanner_session_token');
    localStorage.removeItem('impersonation_token');
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
