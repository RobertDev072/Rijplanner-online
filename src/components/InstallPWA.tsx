import { useState, useEffect } from 'react';
import { Download, Share, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  useEffect(() => {
    // Check if already installed
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setDismissed(true);
  };

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed) return null;

  // Show for Android/Desktop with install prompt
  if (deferredPrompt) {
    return (
      <div className="glass-card p-4 animate-slide-up bg-gradient-to-br from-primary/5 to-accent/5 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Installeer RijPlanner</h3>
            <p className="text-xs text-muted-foreground">Voeg toe aan je startscherm voor snelle toegang</p>
          </div>
        </div>
        <Button onClick={handleInstall} className="w-full mt-4" size="sm">
          <Plus className="w-4 h-4" />
          Installeren
        </Button>
      </div>
    );
  }

  // Show for iOS
  if (isIOS && !isStandalone) {
    return (
      <div className="glass-card p-4 animate-slide-up bg-gradient-to-br from-primary/5 to-accent/5 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Installeer RijPlanner</h3>
            <p className="text-xs text-muted-foreground">Voeg toe aan je startscherm</p>
          </div>
        </div>
        
        {showIOSInstructions ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <p className="text-foreground">
                Tik op <Share className="w-4 h-4 inline text-primary" /> onderaan het scherm
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <p className="text-foreground">
                Scroll en tik op <strong>"Zet op beginscherm"</strong>
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <p className="text-foreground">
                Tik op <strong>"Voeg toe"</strong>
              </p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={() => setShowIOSInstructions(false)}
            >
              Sluiten
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => setShowIOSInstructions(true)} 
            className="w-full mt-4" 
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Hoe installeer ik?
          </Button>
        )}
      </div>
    );
  }

  return null;
}
