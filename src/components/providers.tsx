"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { DataProvider } from "@/lib/store";
import { I18nProvider } from "@/lib/i18n";
import { AuthGate } from "@/components/auth-gate";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";
import { DeveloperHUD } from "@/components/developer/developer-hud";
import { StartupSplash } from "@/components/startup-splash";
import { LuxuryRouteLoader } from "@/components/ui/luxury-route-loader";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
      }
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider>
        <DataProvider>
          <StartupSplash />
          <LuxuryRouteLoader />
          <VisitorTracker />
          <AuthGate>{children}</AuthGate>
          <DeveloperHUD />
          <Toaster position="top-center" richColors closeButton />
        </DataProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
