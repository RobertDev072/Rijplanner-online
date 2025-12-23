import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';

// Mock data voor development - later vervangen door Supabase
const MOCK_USERS: User[] = [
  {
    id: '1',
    tenant_id: 'tenant-1',
    username: 'admin',
    pincode: '1234',
    role: 'admin',
    name: 'Jan de Vries',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    tenant_id: 'tenant-1',
    username: 'instructeur1',
    pincode: '5678',
    role: 'instructor',
    name: 'Peter Jansen',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    tenant_id: 'tenant-1',
    username: 'leerling1',
    pincode: '9012',
    role: 'student',
    name: 'Lisa Bakker',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    tenant_id: 'tenant-1',
    username: 'leerling2',
    pincode: '3456',
    role: 'student',
    name: 'Mark Visser',
    created_at: new Date().toISOString(),
  },
];

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
    // Mock login - later vervangen door Supabase query
    const user = MOCK_USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.pincode === pincode
    );

    if (user) {
      localStorage.setItem('rijplanner_user', JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }

    return false;
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
