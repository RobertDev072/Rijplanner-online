/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * Alle rechten voorbehouden. All rights reserved.
 *
 * PROPRIETARY SOFTWARE - Niet kopiëren of distribueren zonder toestemming.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

function initDeployRecovery() {
  if (typeof window === "undefined") return;

  let reloaded = false;

  const maybeRecover = async (reason: unknown) => {
    if (reloaded) return;

    const msg = String(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (reason as any)?.message ?? reason ?? ""
    );

    const isChunkError =
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("ChunkLoadError") ||
      msg.includes("Loading chunk");

    if (!isChunkError) return;

    reloaded = true;

    try {
      // Clear SW + cache (common cause of white screen after new deploy)
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // ignore
    }

    // Bust caches at the URL level too
    const url = new URL(window.location.href);
    url.searchParams.set("v", Date.now().toString());
    window.location.replace(url.toString());
  };

  window.addEventListener("unhandledrejection", (event) => {
    void maybeRecover(event.reason);
  });

  window.addEventListener("error", (event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void maybeRecover((event as any).error ?? event.message);
  });
}

initDeployRecovery();

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);

