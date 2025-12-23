import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, User, Plus, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: 'Home', path: '/dashboard', roles: ['admin', 'instructor', 'student'] },
  { icon: Calendar, label: 'Agenda', path: '/agenda', roles: ['instructor', 'student'] },
  { icon: Plus, label: 'Inplannen', path: '/schedule', roles: ['instructor'] },
  { icon: Users, label: 'Gebruikers', path: '/users', roles: ['admin'] },
  { icon: BookOpen, label: 'Lessen', path: '/lessons', roles: ['admin'] },
  { icon: User, label: 'Profiel', path: '/profile', roles: ['admin', 'instructor', 'student'] },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around py-2">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
