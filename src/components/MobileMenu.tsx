import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  MessageCircle, 
  User, 
  LogOut, 
  Settings,
  Home,
  Calendar,
  Users,
  Car,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleWhatsAppSupport = () => {
    if (theme.whatsapp_number) {
      // Clean the number (remove spaces, dashes, etc.)
      const cleanNumber = theme.whatsapp_number.replace(/[\s\-\(\)]/g, '');
      // Add country code if not present
      const formattedNumber = cleanNumber.startsWith('+') 
        ? cleanNumber.replace('+', '') 
        : cleanNumber.startsWith('0') 
          ? '31' + cleanNumber.substring(1) 
          : cleanNumber;
      
      window.open(`https://wa.me/${formattedNumber}?text=Hallo, ik heb een vraag.`, '_blank');
    }
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'instructor', 'student'] },
    { icon: Calendar, label: 'Agenda', path: '/agenda', roles: ['admin', 'instructor', 'student'] },
    { icon: BookOpen, label: 'Lessen', path: '/lessons', roles: ['admin', 'instructor'] },
    { icon: Users, label: 'Gebruikers', path: '/users', roles: ['admin'] },
    { icon: Car, label: 'Voertuigen', path: '/vehicles', roles: ['admin'] },
    { icon: User, label: 'Profiel', path: '/profile', roles: ['admin', 'instructor', 'student'] },
    { icon: Settings, label: 'Instellingen', path: '/settings', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Floating Menu Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-background/95 backdrop-blur-xl z-50 shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                    whileHover={{ scale: 1.05, backgroundColor: 'hsl(var(--destructive) / 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-3 space-y-1">
                {filteredMenuItems.map((item, index) => (
                  <motion.button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(item.path) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Support & Logout Section */}
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border/50 bg-background/80 backdrop-blur-sm">
                {/* WhatsApp Support - Only show if whatsapp_number is set */}
                {theme.whatsapp_number && (
                  <motion.button
                    onClick={handleWhatsAppSupport}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all mb-2"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">Support via WhatsApp</span>
                  </motion.button>
                )}

                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Uitloggen</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
