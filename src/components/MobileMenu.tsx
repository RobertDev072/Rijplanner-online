/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - Niet kopiëren of distribueren zonder toestemming.
 */

import React, { useState } from "react";
import { Menu, X, MessageCircle, User, LogOut, Settings, Home, Calendar, Users, Car, BookOpen, FileText, Coins, Bell, Bug, HelpCircle, RefreshCw, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { BugReportDialog } from "@/components/BugReportDialog";
import { HelpDialog } from "@/components/HelpDialog";
import { APP_VERSION } from "@/config/appVersion";
import { toast } from "sonner";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { lessons } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate pending lessons for notification badge
  const pendingLessonsCount = lessons.filter(lesson => {
    if (user?.role === 'instructor') {
      return lesson.instructor_id === user.id && lesson.status === 'pending';
    }
    if (user?.role === 'student') {
      return lesson.student_id === user.id && lesson.status === 'pending';
    }
    if (user?.role === 'admin') {
      return lesson.status === 'pending';
    }
    return false;
  }).length;

  const handleWhatsAppSupport = () => {
    if (theme.whatsapp_number && user?.name) {
      const cleanNumber = theme.whatsapp_number.replace(/[\s\-\(\)]/g, "");
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

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close menu if swiped right more than 100px
    if (info.offset.x > 100) {
      setIsOpen(false);
    }
  };

  const handleOpenBugReport = () => {
    setIsOpen(false);
    setTimeout(() => setShowBugReport(true), 200);
  };

  const handleOpenHelp = () => {
    setIsOpen(false);
    setTimeout(() => setShowHelp(true), 200);
  };

  const handleCheckForUpdates = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('Updates niet beschikbaar');
      return;
    }

    setIsCheckingUpdate(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (registration.waiting) {
        setUpdateAvailable(true);
        toast.success('Nieuwe versie beschikbaar!');
      } else {
        toast.success('Je hebt de nieuwste versie!');
      }
    } catch (error) {
      console.error('Update check failed:', error);
      toast.error('Kon niet controleren op updates');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleApplyUpdate = async () => {
    setIsCheckingUpdate(true);
    setIsOpen(false);
    
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Update failed:', error);
      window.location.reload();
    }
  };

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
      {/* Floating Menu Button with Notification Badge */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[9999] w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <Menu className="w-5 h-5" />
        {pendingLessonsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {pendingLessonsCount > 9 ? '9+' : pendingLessonsCount}
          </span>
        )}
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
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel - Swipeable */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.5 }}
              onDragEnd={handleDragEnd}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-background z-[9999] shadow-2xl touch-pan-y"
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
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Pending Lessons Notification */}
              {pendingLessonsCount > 0 && (
                <div 
                  onClick={() => handleNavigation('/agenda')}
                  className="mx-3 mt-3 p-3 bg-primary/10 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {pendingLessonsCount} {pendingLessonsCount === 1 ? 'les' : 'lessen'} wachtend
                    </p>
                    <p className="text-xs text-muted-foreground">Klik om te bekijken</p>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {filteredMenuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive(item.path) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}

                {/* Divider */}
                <div className="my-3 border-t border-border/50" />

                {/* Help Button */}
                <button
                  onClick={handleOpenHelp}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">Hulp & Uitleg</span>
                </button>

                {/* Bug Report Button */}
                <button
                  onClick={handleOpenBugReport}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  <Bug className="w-5 h-5" />
                  <span className="font-medium">Bug Melden</span>
                </button>

                {/* Update Check Button */}
                {updateAvailable ? (
                  <button
                    onClick={handleApplyUpdate}
                    disabled={isCheckingUpdate}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {isCheckingUpdate ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    <span className="font-medium">Nu bijwerken</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCheckForUpdates}
                    disabled={isCheckingUpdate}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    {isCheckingUpdate ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {isCheckingUpdate ? 'Controleren...' : 'Controleer updates'}
                    </span>
                  </button>
                )}

                {/* WhatsApp Support */}
                {theme.whatsapp_number && user?.role === 'student' && (
                  <button
                    onClick={handleWhatsAppSupport}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors mt-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">Support via WhatsApp</span>
                  </button>
                )}
              </div>

              {/* Swipe Hint */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-16 bg-muted-foreground/20 rounded-r-full" />

              {/* Logout Section */}
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border/50 bg-background">
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-xs text-muted-foreground">Versie</span>
                  <span className="text-xs font-mono text-muted-foreground">v{APP_VERSION}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Uitloggen</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <BugReportDialog open={showBugReport} onOpenChange={setShowBugReport} />
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </>
  );
}
