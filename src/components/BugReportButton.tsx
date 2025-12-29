import React, { useState } from 'react';
import { Bug, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Store recent console errors
const recentErrors: string[] = [];
const MAX_ERRORS = 10;

// Override console.error to capture errors
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const errorMessage = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  recentErrors.push(`[${new Date().toISOString()}] ${errorMessage}`);
  if (recentErrors.length > MAX_ERRORS) {
    recentErrors.shift();
  }
  
  originalConsoleError.apply(console, args);
};

// Also capture unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    recentErrors.push(`[${new Date().toISOString()}] Uncaught: ${event.message} at ${event.filename}:${event.lineno}`);
    if (recentErrors.length > MAX_ERRORS) {
      recentErrors.shift();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    recentErrors.push(`[${new Date().toISOString()}] Unhandled Promise: ${event.reason}`);
    if (recentErrors.length > MAX_ERRORS) {
      recentErrors.shift();
    }
  });
}

function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    online: navigator.onLine,
    cookiesEnabled: navigator.cookieEnabled,
    timestamp: new Date().toISOString(),
  };
}

export function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const deviceInfo = getDeviceInfo();
      
      const bugReport = {
        description: description.trim() || 'Geen beschrijving gegeven',
        route: location.pathname + location.search,
        device: deviceInfo,
        recentErrors: [...recentErrors],
        localStorage: {
          hasAuthToken: !!localStorage.getItem('sb-mlbeciqslbemjrezgclq-auth-token'),
          hasCachedUser: !!localStorage.getItem('cached_user'),
        },
      };

      const { error } = await supabase.from('audit_logs').insert({
        actor_id: user.id,
        actor_name: user.name,
        action: 'bug_report',
        target_type: 'system',
        target_name: `Bug Report - ${location.pathname}`,
        details: bugReport,
        tenant_id: user.tenant_id,
      });

      if (error) throw error;

      toast.success('Bug rapport verzonden!');
      setDescription('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to submit bug report:', error);
      toast.error('Kon bug rapport niet verzenden');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-[9997] w-10 h-10 rounded-full bg-muted text-muted-foreground shadow-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
        aria-label="Bug rapporteren"
      >
        <Bug className="w-4 h-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-destructive" />
              Bug Rapporteren
            </DialogTitle>
            <DialogDescription>
              Beschrijf het probleem. Device info en errors worden automatisch toegevoegd.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Wat ging er mis? (optioneel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p>📍 Route: {location.pathname}</p>
              <p>📱 {navigator.userAgent.includes('Mobile') ? 'Mobiel' : 'Desktop'} • {window.innerWidth}x{window.innerHeight}</p>
              <p>⚠️ {recentErrors.length} recente errors gevonden</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Annuleren
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Verzenden...' : 'Verzenden'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
