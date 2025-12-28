import React, { ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BottomTabNav } from '@/components/BottomTabNav';
import { Header } from '@/components/Header';
import { PullToRefresh } from '@/components/PullToRefresh';

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
      {/* Header */}
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
    </div>
  );
}
