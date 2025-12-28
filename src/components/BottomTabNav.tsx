import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, User, LogOut, Users, Plus, Settings, Building2, BookOpen, Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { hapticImpact, hapticSelection } from '@/utils/capacitor';

interface TabItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: string[];
}

const TAB_ITEMS: TabItem[] = [
  { icon: Home, label: 'Home', path: '/dashboard', roles: ['admin', 'instructor', 'student', 'superadmin'] },
  { icon: Building2, label: 'Rijscholen', path: '/tenants', roles: ['superadmin'] },
  { icon: Calendar, label: 'Agenda', path: '/agenda', roles: ['admin', 'instructor', 'student'] },
  { icon: Plus, label: 'Inplannen', path: '/schedule', roles: ['admin', 'instructor'] },
  { icon: Users, label: 'Leerlingen', path: '/students', roles: ['admin', 'instructor'] },
  { icon: Users, label: 'Gebruikers', path: '/users', roles: ['superadmin'] },
  { icon: BookOpen, label: 'Lessen', path: '/lessons', roles: ['admin'] },
  { icon: Car, label: 'Voertuigen', path: '/vehicles', roles: ['admin'] },
  { icon: Settings, label: 'Instellingen', path: '/settings', roles: ['admin'] },
  { icon: User, label: 'Profiel', path: '/profile', roles: ['admin', 'instructor', 'student', 'superadmin'] },
];

export function BottomTabNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const visibleTabs = TAB_ITEMS.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    hapticImpact('heavy');
    logout();
    navigate('/login');
  };

  const handleTabClick = (path: string) => {
    hapticSelection();
    navigate(path);
  };

  return (
    <nav className="bottom-tab-nav">
      <div className="tab-container">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                "tab-button",
                isActive && "tab-active"
              )}
            >
              <motion.div
                className="tab-icon-container"
                animate={isActive ? { scale: 1 } : { scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="tab-indicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={cn(
                  "tab-icon",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
              </motion.div>
              <span className={cn(
                "tab-label",
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="tab-button tab-logout"
        >
          <motion.div
            className="tab-icon-container"
            whileTap={{ scale: 0.9 }}
          >
            <LogOut className="tab-icon text-destructive" />
          </motion.div>
          <span className="tab-label text-destructive">
            Uitloggen
          </span>
        </button>
      </div>
    </nav>
  );
}
