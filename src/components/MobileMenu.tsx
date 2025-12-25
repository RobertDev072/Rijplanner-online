import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle, User, LogOut, Settings, Home, Calendar, Users, Car, BookOpen, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleWhatsAppSupport = () => {
    if (theme.whatsapp_number && user?.name) {
      // Clean the number (remove spaces, dashes, etc.)
      const cleanNumber = theme.whatsapp_number.replace(/[\s\-\(\)]/g, "");
      // Add country code if not present
      const formattedNumber = cleanNumber.startsWith("+")
        ? cleanNumber.replace("+", "")
        : cleanNumber.startsWith("0")
          ? "31" + cleanNumber.substring(1)
          : cleanNumber;

      const message = encodeURIComponent(`Hoi, ik ben ${user.name}. Ik heb een vraag.`);

      window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank");
    }
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard", roles: ["admin", "instructor", "student"] },
    { icon: Calendar, label: "Agenda", path: "/agenda", roles: ["admin", "instructor", "student"] },
    { icon: FileText, label: "Mijn Feedback", path: "/feedback", roles: ["student"] },
    { icon: BookOpen, label: "Lessen", path: "/lessons", roles: ["admin", "instructor"] },
    { icon: Users, label: "Gebruikers", path: "/users", roles: ["admin"] },
    { icon: Car, label: "Voertuigen", path: "/vehicles", roles: ["admin"] },
    { icon: User, label: "Profiel", path: "/profile", roles: ["admin", "instructor", "student"] },
    { icon: Settings, label: "Instellingen", path: "/settings", roles: ["admin"] },
  ];

  const filteredMenuItems = menuItems.filter((item) => user?.role && item.roles.includes(user.role));

  return (
    <>
      {/* Floating Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform duration-150 active:scale-95 hover:bg-primary/90"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-background backdrop-blur-xl z-[60] shadow-2xl"
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
                    whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--destructive) / 0.1)" }}
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
                      isActive(item.path) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
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

                {/* WhatsApp Support - Only visible for students */}
                {theme.whatsapp_number && user?.role === 'student' && (
                  <motion.button
                    onClick={handleWhatsAppSupport}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all mt-4"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">Support via WhatsApp</span>
                  </motion.button>
                )}
              </div>

              {/* Logout Section (nu alleen logout) */}
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border/50 bg-background/80 backdrop-blur-sm">
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
