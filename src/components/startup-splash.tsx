"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useData } from "@/lib/store";

export function StartupSplash() {
  const { ready } = useData();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startTimeRef = useRef<number>(0);
  const exitTriggeredRef = useRef<boolean>(false);

  const triggerExit = useCallback(() => {
    if (exitTriggeredRef.current) return;
    exitTriggeredRef.current = true;
    setIsExiting(true);
    document.body.style.overflow = "";

    try {
      sessionStorage.setItem("gg_splash_seen", "true");
    } catch {
      /* ignore if private browsing restricts storage */
    }

    // 250ms smooth fade transition before unmounting
    setTimeout(() => {
      setVisible(false);
    }, 280);
  }, []);

  useEffect(() => {
    setMounted(true);

    let hasSeen = false;
    try {
      hasSeen = sessionStorage.getItem("gg_splash_seen") === "true";
    } catch {
      hasSeen = false;
    }

    // Skip splash if already seen during this browser session
    if (hasSeen) {
      setVisible(false);
      return;
    }

    // First visit in session: show splash
    setVisible(true);
    startTimeRef.current = Date.now();
    document.body.style.overflow = "hidden";

    // Safety timeout: Never leave splash permanently visible if network/requests lag
    const safetyTimer = setTimeout(() => {
      triggerExit();
    }, 2200);

    return () => {
      clearTimeout(safetyTimer);
      document.body.style.overflow = "";
    };
  }, [triggerExit]);

  // When store becomes ready, dismiss splash smoothly
  useEffect(() => {
    if (!visible || isExiting || !ready) return;

    const elapsed = Date.now() - (startTimeRef.current || Date.now());
    // Micro-delay of 300ms so cold-open has a calm, perceptible luxury reveal rather than a 10ms jarring glitch
    const minDisplayTime = 300;
    const remaining = Math.max(0, minDisplayTime - elapsed);

    const timer = setTimeout(() => {
      triggerExit();
    }, remaining);

    return () => clearTimeout(timer);
  }, [ready, visible, isExiting, triggerExit]);

  if (!mounted || !visible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Glow & Glamour Hair Studio"
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#FAF8F4] text-[#302D2A] select-none transition-opacity duration-300 ease-out pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center text-center px-6 max-w-sm -translate-y-2">
        {/* Approved GG Monogram Luxury Emblem */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-[0_12px_28px_-6px_rgba(48,45,42,0.12)] border border-[#E8E2D8] bg-[#141411] animate-luxury-monogram">
          <img
            src="/pwa-192x192.png"
            alt="Glow & Glamour Monogram"
            width={96}
            height={96}
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        </div>

        {/* Minimalist Editorial Wordmark */}
        <div className="mt-5 space-y-1">
          <h1 className="font-heading text-lg sm:text-xl font-medium tracking-[0.2em] uppercase text-[#302D2A]">
            Glow &amp; Glamour
          </h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#8C827A] font-light">
            Hair Studio &amp; Spa · Koregaon
          </p>
        </div>

        {/* Thin Champagne-Gold Indicator Line */}
        <div className="mt-6 w-20 sm:w-24 h-[1.5px] bg-[#E8E2D8] rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-[#C6A166] to-transparent animate-luxury-line" />
        </div>
      </div>
    </div>
  );
}
