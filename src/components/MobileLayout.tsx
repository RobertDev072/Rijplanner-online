/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - Niet kopiëren of distribueren zonder toestemming.
 */

import React, { ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BottomTabNav } from '@/components/BottomTabNav';
import { Header } from '@/components/Header';
import { PullToRefresh } from '@/components/PullToRefresh';
import { AIChatDialog } from '@/components/AIChatDialog';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showLogo?: boolean;
}

export function MobileLayout({ children, title, showLogo }: MobileLayoutProps) {
  const { user, refreshUser } = useAuth();
  const { refreshData } = useData();

  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshData(), refreshUser()]);
  }, [refreshData, refreshUser]);

  if (!user) return null;

  return (
    <div className="mobile-app-container">
      {/* Header with integrated menu */}
      <Header title={title} showLogo={showLogo} />

      {/* Main Content with Pull-to-Refresh */}
      <main className="mobile-page-content">
        <PullToRefresh onRefresh={handleRefresh} className="h-full">
          <div className="page-inner touch-pan-y animate-fade-in">
            {children}
          </div>
        </PullToRefresh>
      </main>

      {/* Bottom Tab Navigation */}
      <BottomTabNav />
      
      {/* AI Chat Button */}
      <AIChatDialog />
    </div>
  );
}
