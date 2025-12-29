import React, { useState } from 'react';
import { Car, Menu, X, MessageCircle, User, LogOut, Settings, Home, Calendar, Users, BookOpen, FileText, Coins, HelpCircle, Bug } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { BugReportDialog } from '@/components/BugReportDialog';
import { HelpDialog } from '@/components/HelpDialog';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function Header({ title, showLogo = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Beheerder';
      case 'instructor':
        return 'Instructeur';
      case 'student':
        return 'Leerling';
      default:
        return '';
    }
  };

  const handleWhatsAppSupport = () => {
    if (theme?.whatsapp_number && user?.name) {
      const cleanNumber = theme.whatsapp_number.replace(/[\s\-\(\)]/g, "");
      const formattedNumber = cleanNumber.startsWith("+")
        ? cleanNumber.replace("+", "")
        : cleanNumber.startsWith("0")
          ? "31" + cleanNumber.substring(1)
          : cleanNumber;

      const message = encodeURIComponent(`Hoi, ik ben ${user.name}. Ik heb een vraag.`);
      window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank");
    }
    setIsMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleOpenBugReport = () => {
    setIsMenuOpen(false);
    setTimeout(() => setShowBugReport(true), 150);
  };

  const handleOpenHelp = () => {
    setIsMenuOpen(false);
    setTimeout(() => setShowHelp(true), 150);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard", roles: ["admin", "instructor", "student"] },
    { icon: Calendar, label: "Agenda", path: "/agenda", roles: ["admin", "instructor", "student"] },
    { icon: FileText, label: "Mijn Feedback", path: "/feedback", roles: ["student"] },
    { icon: BookOpen, label: "Lessen", path: "/lessons", roles: ["admin", "instructor"] },
    { icon: Coins, label: "Credits", path: "/credits", roles: ["admin", "instructor"] },
    { icon: Users, label: "Gebruikers", path: "/users", roles: ["admin"] },
    { icon: Car, label: "Voertuigen", path: "/vehicles", roles: ["admin"] },
    { icon: User, label: "Profiel", path: "/profile", roles: ["admin", "instructor", "student"] },
    { icon: Settings, label: "Instellingen", path: "/settings", roles: ["admin"] },
  ];

  const filteredMenuItems = menuItems.filter((item) => user?.role && item.roles.includes(user.role));

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo or Title */}
          <div className="flex items-center gap-3">
            {showLogo ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                  <Car className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground leading-tight">RijPlanner</h1>
                  <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                </div>
              </>
            ) : title ? (
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
            ) : null}
          </div>

          {/* Right: Burger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="w-11 h-11 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[9998] animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-background z-[9999] shadow-2xl animate-slide-in-right">
            {/* Header */}
            <div className="p-5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{getRoleLabel()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-colors hover:bg-muted/80"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                    isActive(item.path) 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-foreground hover:bg-muted active:scale-[0.98]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}

              {/* Divider */}
              <div className="my-3 border-t border-border/50" />

              {/* Help */}
              <button
                onClick={handleOpenHelp}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted transition-colors active:scale-[0.98]"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Hulp & Handleiding</span>
              </button>

              {/* Bug report */}
              <button
                onClick={handleOpenBugReport}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted transition-colors active:scale-[0.98]"
              >
                <Bug className="w-5 h-5" />
                <span className="font-medium">Bug Melden</span>
              </button>

              {/* WhatsApp Support - voor leerlingen en instructeurs */}
              {(user?.role === 'student' || user?.role === 'instructor') && (
                theme?.whatsapp_number ? (
                  <button
                    onClick={handleWhatsAppSupport}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors mt-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">Contact Rijschool</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 text-muted-foreground mt-2">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">Rijschool heeft geen WhatsApp ingesteld</span>
                  </div>
                )
              )}
            </div>

            {/* Logout Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-background safe-area-bottom">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.98]"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Uitloggen</span>
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Dialogs */}
      <BugReportDialog open={showBugReport} onOpenChange={setShowBugReport} />
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </>
  );
}
