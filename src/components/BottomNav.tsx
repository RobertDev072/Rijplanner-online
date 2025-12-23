import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, User, Plus, BookOpen, Building2, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: 'Home', path: '/dashboard', roles: ['admin', 'instructor', 'student', 'superadmin'] },
  { icon: Building2, label: 'Rijscholen', path: '/tenants', roles: ['superadmin'] },
  { icon: Calendar, label: 'Agenda', path: '/agenda', roles: ['instructor', 'student'] },
  { icon: Plus, label: 'Inplannen', path: '/schedule', roles: ['instructor'] },
  { icon: Users, label: 'Gebruikers', path: '/users', roles: ['admin'] },
  { icon: BookOpen, label: 'Lessen', path: '/lessons', roles: ['admin'] },
  { icon: Settings, label: 'Instellingen', path: '/settings', roles: ['admin'] },
  { icon: User, label: 'Profiel', path: '/profile', roles: ['admin', 'instructor', 'student', 'superadmin'] },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around py-2 px-2">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-300",
                isActive && "bg-primary/10"
              )}>
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive && "scale-110"
                  )}
                />
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse-soft" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
