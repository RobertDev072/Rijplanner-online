import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for updates on mount
      navigator.serviceWorker.ready.then((registration) => {
        // Check if there's already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowPrompt(true);
        }

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowPrompt(true);
              }
            });
          }
        });
      });

      // Handle controller change (when new SW takes over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      // Check for updates periodically (every 5 minutes)
      const interval = setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleUpdate = async () => {
    if (!waitingWorker) return;

    setIsUpdating(true);

    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Tell the waiting worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      // Force reload as fallback
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal with timestamp (show again after 1 hour)
    localStorage.setItem('updateDismissed', Date.now().toString());
  };

  // Check if recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('updateDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const hourAgo = Date.now() - 60 * 60 * 1000;
      if (dismissedTime > hourAgo) {
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
          <div className="surface-card p-4 flex items-start gap-3 border border-primary/20">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">
                Nieuwe versie beschikbaar
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update nu voor de beste ervaring.
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="h-8 text-xs px-3"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                      Bezig...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1.5" />
                      Update nu
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
              className="flex-shrink-0 p-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
