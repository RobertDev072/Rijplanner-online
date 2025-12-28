import React, { useState, useEffect } from 'react';
import { Car, Menu, X, MessageCircle, User, LogOut, Settings, Home, Calendar, Users, BookOpen, FileText, Coins, Shield, Building2, FileSearch, UserCheck, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  getImpersonationToken, 
  clearImpersonationToken, 
  isImpersonationTokenValid,
  type ImpersonationToken 
} from '@/utils/securityTokens';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function Header({ title, showLogo = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [impersonationToken, setImpersonationToken] = useState<ImpersonationToken | null>(null);
  const [isExitingImpersonation, setIsExitingImpersonation] = useState(false);
  const { user, logout, login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for valid impersonation token on mount
  useEffect(() => {
    const token = getImpersonationToken();
    if (token && isImpersonationTokenValid(token)) {
      setImpersonationToken(token);
    } else {
      clearImpersonationToken();
      setImpersonationToken(null);
    }
  }, [user]);

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Beheerder';
      case 'instructor':
        return 'Instructeur';
      case 'student':
        return 'Leerling';
      case 'superadmin':
        return 'Superadmin';
      default:
        return '';
    }
  };

  const handleExitImpersonation = async () => {
    if (!impersonationToken || !isImpersonationTokenValid(impersonationToken)) {
      clearImpersonationToken();
      setImpersonationToken(null);
      toast.error('Impersonatie sessie verlopen');
      return;
    }
    
    setIsExitingImpersonation(true);
    try {
      // Log the end of impersonation
      await supabase.from('audit_logs').insert({
        actor_id: impersonationToken.originalUserId,
        actor_name: impersonationToken.originalName,
        action: 'end_impersonation',
        target_type: 'user',
        target_id: user?.id,
        target_name: user?.name,
      });

      // End the impersonation session in database
      await supabase
        .from('impersonation_sessions')
        .update({ 
          is_active: false, 
          ended_at: new Date().toISOString() 
        })
        .eq('superadmin_id', impersonationToken.originalUserId)
        .eq('is_active', true);

      // Re-authenticate as superadmin using stored credentials
      // Fetch fresh superadmin data from database to validate
      const { data: superadminData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', impersonationToken.originalUserId)
        .eq('role', 'superadmin')
        .single();
      
      if (error || !superadminData) {
        throw new Error('Could not verify superadmin identity');
      }

      // Login back as superadmin
      const success = await login(superadminData.username, superadminData.pincode);
      
      if (success) {
        clearImpersonationToken();
        setImpersonationToken(null);
        toast.success('Terug als superadmin');
        navigate('/admin/platform');
      } else {
        toast.error('Kon niet terug naar superadmin');
      }
    } catch (error) {
      console.error('Error exiting impersonation:', error);
      toast.error('Fout bij beëindigen impersonatie');
    } finally {
      setIsExitingImpersonation(false);
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

  const handleLogout = () => {
    // Clear all session data including impersonation
    clearImpersonationToken();
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard", roles: ["admin", "instructor", "student"] },
    { icon: Calendar, label: "Agenda", path: "/agenda", roles: ["admin", "instructor", "student"] },
    { icon: Plus, label: "Les Inplannen", path: "/schedule", roles: ["admin", "instructor"] },
    { icon: Users, label: "Mijn Leerlingen", path: "/students", roles: ["admin", "instructor"] },
    { icon: FileText, label: "Mijn Feedback", path: "/feedback", roles: ["student"] },
    { icon: BookOpen, label: "Lessen", path: "/lessons", roles: ["admin", "instructor"] },
    { icon: Coins, label: "Credits", path: "/credits", roles: ["admin", "instructor"] },
    { icon: Users, label: "Gebruikers", path: "/users", roles: ["admin"] },
    { icon: Car, label: "Voertuigen", path: "/vehicles", roles: ["admin"] },
    { icon: User, label: "Profiel", path: "/profile", roles: ["admin", "instructor", "student"] },
    { icon: Settings, label: "Instellingen", path: "/settings", roles: ["admin"] },
  ];

  const superadminMenuItems = [
    { icon: Shield, label: "Platform Dashboard", path: "/admin/platform" },
    { icon: Building2, label: "Rijscholen", path: "/tenants" },
    { icon: Settings, label: "Tenant Beheer", path: "/admin/tenants" },
    { icon: FileSearch, label: "Audit Logs", path: "/admin/audit-logs" },
    { icon: UserCheck, label: "Impersonatie", path: "/admin/impersonate" },
  ];

  const filteredMenuItems = user?.role === 'superadmin' 
    ? superadminMenuItems 
    : menuItems.filter((item) => user?.role && item.roles.includes(user.role));

  return (
    <>
      {/* Impersonation Banner */}
      {impersonationToken && (
        <div className="sticky top-0 z-50 bg-warning/90 text-warning-foreground px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-medium">
                Impersonatie actief als {user?.name}
              </span>
            </div>
            <button
              onClick={handleExitImpersonation}
              disabled={isExitingImpersonation}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                "bg-background text-foreground hover:bg-background/90",
                isExitingImpersonation && "opacity-50 cursor-not-allowed"
              )}
            >
              <LogOut className="w-3.5 h-3.5" />
              {isExitingImpersonation ? 'Laden...' : 'Terug naar Superadmin'}
            </button>
          </div>
        </div>
      )}

      <header className={cn(
        "sticky z-40 bg-background/95 backdrop-blur-lg border-b border-border/40",
        impersonationToken ? "top-[44px]" : "top-0"
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo or Title */}
          <div className="flex items-center gap-3">
            {showLogo ? (
              <>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                  user?.role === 'superadmin' ? "bg-gradient-to-br from-primary to-accent" : "bg-primary"
                )}>
                  {user?.role === 'superadmin' ? (
                    <Shield className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Car className="w-5 h-5 text-primary-foreground" />
                  )}
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
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center",
                    user?.role === 'superadmin' ? "bg-gradient-to-br from-primary/20 to-accent/20" : "bg-primary/10"
                  )}>
                    {user?.role === 'superadmin' ? (
                      <Shield className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
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

              {/* WhatsApp Support */}
              {theme?.whatsapp_number && user?.role === 'student' && (
                <button
                  onClick={handleWhatsAppSupport}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors mt-4"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Support via WhatsApp</span>
                </button>
              )}
            </div>

            {/* Logout Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-background safe-area-bottom">
              {impersonationToken && (
                <button
                  onClick={handleExitImpersonation}
                  disabled={isExitingImpersonation}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-warning bg-warning/10 hover:bg-warning/20 transition-colors active:scale-[0.98] mb-2"
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">
                    {isExitingImpersonation ? 'Laden...' : 'Terug naar Superadmin'}
                  </span>
                </button>
              )}
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
    </>
  );
}
