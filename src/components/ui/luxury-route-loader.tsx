"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LuxuryRouteLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navTargetTitle, setNavTargetTitle] = useState<string>("Loading...");
  const [progress, setProgress] = useState(0);

  // Clear loading state when pathname or search parameters change
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Global link click interceptor for instant 0ms feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag if clicked element is inside one
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, hash anchors, mailto, tel, downloads, or blank targets
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download")
      ) {
        return;
      }

      // If clicking the current exact URL, skip
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      // Determine friendly section label
      let label = "Opening...";
      if (href.startsWith("/owner/offers")) label = "Opening Offers & Campaigns...";
      else if (href.startsWith("/owner/customers")) label = "Opening Client CRM 360°...";
      else if (href.startsWith("/owner/appointments")) label = "Opening Live Queue...";
      else if (href.startsWith("/owner/scanner")) label = "Opening Fast Scanner...";
      else if (href.startsWith("/owner/billing")) label = "Opening Billing & Invoices...";
      else if (href.startsWith("/owner/reports")) label = "Opening Financial Reports...";
      else if (href.startsWith("/owner/services")) label = "Opening Services & Pricing...";
      else if (href.startsWith("/owner/staff")) label = "Opening Staff Operations...";
      else if (href.startsWith("/owner/settings")) label = "Opening Studio Settings...";
      else if (href.startsWith("/owner/developer")) label = "Opening Developer Sandbox...";
      else if (href.startsWith("/owner-reception")) label = "Opening Reception Desk...";
      else if (href.startsWith("/owner")) label = "Entering Owner Suite...";
      else if (href.startsWith("/book")) label = "Loading Appointment Booking...";
      else if (href.startsWith("/services")) label = "Loading Salon Services...";
      else if (href.startsWith("/offers")) label = "Loading Special Offers...";
      else if (href.startsWith("/login")) label = "Loading Sign In...";
      else if (href === "/") label = "Returning to Main Website...";

      setNavTargetTitle(label);
      setIsNavigating(true);
      setProgress(30);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  // Animate progress smoothly while navigating
  useEffect(() => {
    if (!isNavigating) return;

    const timer1 = setTimeout(() => {
      setProgress((prev) => (prev < 68 ? 68 : prev));
    }, 120);

    const timer2 = setTimeout(() => {
      setProgress((prev) => (prev < 90 ? 90 : prev));
    }, 380);

    // Safety timeout in case navigation is aborted or fails
    const safetyTimer = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(safetyTimer);
    };
  }, [isNavigating]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[999999]">
      {/* Champagne Gold Top Shimmer Progress Line */}
      <div className="relative h-[3px] w-full bg-black/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#A27C48] via-[#E2C392] to-[#A27C48] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(226,195,146,0.9),0_0_6px_rgba(162,124,72,0.8)]"
          style={{
            width: `${progress}%`,
            transitionProperty: "width",
          }}
        />
      </div>

      {/* Luxury Floating Status Pill */}
      <div className="fixed top-4 right-4 sm:right-6 flex items-center gap-2.5 rounded-full bg-[#FAF8F5]/95 px-3.5 py-1.5 shadow-[0_10px_30px_-5px_rgba(48,42,36,0.18)] border border-[#E8E0D2] backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-2">
        {/* Double Ring Gold Spinner */}
        <div className="relative flex h-4 w-4 items-center justify-center">
          <div className="absolute h-4 w-4 rounded-full border-2 border-[#A27C48]/20 border-t-[#A27C48] animate-spin" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#A27C48]" />
        </div>

        <span className="font-sans text-[11px] font-semibold tracking-wide text-[#302A24]">
          {navTargetTitle}
        </span>
      </div>
    </div>
  );
}

export function LuxuryRouteLoader() {
  return (
    <Suspense fallback={null}>
      <LuxuryRouteLoaderInner />
    </Suspense>
  );
}
