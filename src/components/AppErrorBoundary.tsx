import React from "react";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

async function hardRefreshWithCacheClear() {
  try {
    // Unregister service workers (prevents old PWA caches from breaking new deploys)
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }

    // Clear Cache Storage
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } finally {
    // Force reload
    window.location.reload();
  }
}

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Keep this minimal (no sensitive data); useful for diagnosing white-screen-after-deploy
    console.error("[AppErrorBoundary]", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md surface-card p-6 border border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground">Er ging iets mis</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Dit kan gebeuren na een nieuwe Vercel deploy (oude cache/service worker). Probeer herladen of
                reset de cache.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RotateCcw className="w-4 h-4" />
              Herladen
            </Button>
            <Button
              variant="secondary"
              onClick={() => void hardRefreshWithCacheClear()}
              className="w-full"
            >
              <Trash2 className="w-4 h-4" />
              Cache resetten
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
