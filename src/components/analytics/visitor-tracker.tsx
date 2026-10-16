"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useData } from "@/lib/store";

export function VisitorTracker() {
  const pathname = usePathname();
  const { currentUser, ready } = useData();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Retrieve or initialize unique visitor ID in localStorage
    let visitorId = localStorage.getItem("gg_visitor_id");
    if (!visitorId) {
      const rand = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now().toString(36);
      visitorId = `v_${timestamp}_${rand}`;
      localStorage.setItem("gg_visitor_id", visitorId);
    }

    const trackingKey = `${visitorId}:${pathname}:${currentUser?.uid || "guest"}`;
    if (lastTracked.current === trackingKey) {
      return;
    }
    lastTracked.current = trackingKey;

    const payload = {
      visitorId,
      pathname,
      isRegistered: !!currentUser,
      uid: currentUser?.uid || null,
      email: currentUser?.email || null,
      role: currentUser?.role || null,
    };

    // Lightweight beacon / fetch tracking
    fetch("/api/analytics/track-visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Ignore background analytics errors silently
    });
  }, [pathname, currentUser, ready]);

  return null;
}
