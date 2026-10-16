"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "@/lib/store";
import { FCMProvider } from "@/components/fcm-provider";
import { SalonFullScreenLoader } from "@/components/ui/salon-loader";

const AUTH_ROUTES = ["/login", "/register"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, currentUser } = useData();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtected =
    pathname.startsWith("/customer") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/developer");

  useEffect(() => {
    if (!ready) return;
    if (!currentUser && isProtected) {
      router.replace("/login");
    } else if (currentUser && pathname.startsWith("/developer") && currentUser.role !== "developer") {
      router.replace(`/${currentUser.role || "customer"}`);
    } else if (currentUser && isAuthRoute) {
      const targetRole = currentUser.role || "customer";
      router.replace(`/${targetRole}`);
    }
  }, [ready, currentUser, isProtected, isAuthRoute, pathname, router]);

  // Genuine initial loading state only when needed (e.g., verifying protected route session or auth route)
  if (!ready && (isProtected || isAuthRoute)) {
    return <SalonFullScreenLoader message="Checking your session..." />;
  }

  if (!currentUser && isProtected) {
    return <SalonFullScreenLoader message="Redirecting to sign in..." />;
  }

  if (currentUser && isAuthRoute) {
    return <SalonFullScreenLoader message="Signing you in..." />;
  }

  // Only apply internal portal themes (owner, staff, developer) when browsing internal routes.
  // Public pages and customer pages always use the signature warm ivory theme.
  const isInternalPortal =
    pathname.startsWith("/owner") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/developer");

  const themeClass =
    currentUser && isInternalPortal ? `theme-${currentUser.role}` : "theme-customer";

  return (
    <div className={themeClass}>
      <FCMProvider>{children}</FCMProvider>
    </div>
  );
}
