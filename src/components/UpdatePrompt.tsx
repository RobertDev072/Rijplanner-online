import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const checkForUpdates = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowPrompt(true);
        }
      } catch (error) {
        console.error('[UpdatePrompt] Error checking for updates:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    const setupServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Check if there's already a waiting worker
        if (registration.waiting) {
          console.log('[UpdatePrompt] Found waiting worker');
          setWaitingWorker(registration.waiting);
          setShowPrompt(true);
        }

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          console.log('[UpdatePrompt] Update found');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('[UpdatePrompt] Worker state:', newWorker.state);
              
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[UpdatePrompt] New version ready');
                setWaitingWorker(newWorker);
                setShowPrompt(true);
              }
            });
          }
        });

        // Handle controller change (when new SW takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[UpdatePrompt] Controller changed');
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        // Listen for activation message from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SW_ACTIVATED') {
            console.log('[UpdatePrompt] SW activated, version:', event.data.version);
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          }
        });

      } catch (error) {
        console.error('[UpdatePrompt] Setup error:', error);
      }
    };

    setupServiceWorker();

    // Check for updates when app becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[UpdatePrompt] App visible, checking for updates');
        checkForUpdates();
      }
    };

    // Check for updates when coming back online
    const handleOnline = () => {
      console.log('[UpdatePrompt] Back online, checking for updates');
      checkForUpdates();
    };

    // Check for updates on window focus
    const handleFocus = () => {
      console.log('[UpdatePrompt] Window focused, checking for updates');
      checkForUpdates();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);

    // Check for updates periodically (every 2 minutes)
    const interval = setInterval(checkForUpdates, 2 * 60 * 1000);

    // Initial check
    checkForUpdates();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [checkForUpdates]);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      // Clear all caches first
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('[UpdatePrompt] Clearing caches:', cacheNames);
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Clear localStorage update dismissed flag
      localStorage.removeItem('updateDismissed');

      // Tell the waiting worker to skip waiting and activate
      if (waitingWorker) {
        console.log('[UpdatePrompt] Sending SKIP_WAITING to worker');
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      }

      // Wait a moment for the SW to activate, then force reload
      setTimeout(() => {
        console.log('[UpdatePrompt] Force reloading...');
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error('[UpdatePrompt] Update failed:', error);
      // Force reload as fallback
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal with timestamp (show again after 30 minutes)
    localStorage.setItem('updateDismissed', Date.now().toString());
  };

  // Check if recently dismissed (30 minutes)
  useEffect(() => {
    const dismissed = localStorage.getItem('updateDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      if (dismissedTime > thirtyMinutesAgo) {
        setShowPrompt(false);
      } else {
        localStorage.removeItem('updateDismissed');
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-lg rounded-2xl p-4 flex items-start gap-3 border border-primary/30 shadow-xl shadow-primary/10">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                Nieuwe versie beschikbaar
                <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update nu voor verbeteringen en bugfixes.
              </p>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="h-8 text-xs px-4 gap-2"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Bijwerken...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Nu bijwerken
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-8 text-xs px-3"
                >
                  Later
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-background/50 transition-colors"
              aria-label="Sluiten"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
