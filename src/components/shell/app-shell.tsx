"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, MonitorDot, X, Scissors, Sparkles, User } from "lucide-react";
import { useData } from "@/lib/store";
import { NAV, ROLE_TAGLINE } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n";
import { BranchSwitcher } from "./branch-switcher";
import { useIsMobile } from "@/hooks/use-mobile";

import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, unreadCount } = useData();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;
  const role = currentUser.role;
  const items = NAV[role];
  const unread = unreadCount(currentUser);

  function isActive(href: string) {
    if (href === `/${role}`) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  // -------------------------------------------------------------
  // 1. CUSTOMER PORTAL — UNIFIED WITH THE LUXURY PUBLIC DESIGN
  // Uses the identical PublicNavbar and PublicFooter so the site is 100% cohesive,
  // the top-left logo always takes users to the Home page, and there is no jarring jump.
  // -------------------------------------------------------------
  const isTestingCustomer = role === "developer" && (pathname.startsWith("/customer") || pathname.startsWith("/book") || pathname.startsWith("/treatments"));
  if (role === "customer" || isTestingCustomer) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#221F1C] flex flex-col font-sans">
        <PublicNavbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          {children}
        </main>
        <PublicFooter />
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. OWNER & STAFF PORTAL — EXECUTIVE OPERATIONS SUITE
  // (Obsidian bronze sidebar with warm champagne gold accents)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-800 bg-[#0F172A] lg:flex text-slate-100">
          <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-sm text-white shadow-sm">
              G&amp;G
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-white">Glow &amp; Glamour</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Studio Operations</p>
            </div>
          </div>

          <div className="px-5 py-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
              {role === "owner" ? "Owner Portal" : role === "developer" ? "Developer Suite" : "Staff Operations"}
            </p>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-1">
            {items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-all duration-150",
                    active
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-3 space-y-2">
            {(role === "staff" || role === "owner") && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-md border-slate-700 bg-slate-800/80 text-xs text-slate-200 hover:bg-slate-800 hover:text-white"
                onClick={() => router.push(`/${role}-reception`)}
              >
                <MonitorDot className="h-3.5 w-3.5 text-blue-400" /> Reception Mode
              </Button>
            )}
            <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900/60 p-2.5">
              <UserAvatar name={currentUser.fullName} color={currentUser.avatarColor} className="h-8 w-8 rounded-md" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-xs font-semibold text-white">{currentUser.fullName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono text-slate-400 truncate">
                    #{currentUser.id.slice(0, 8)}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded">
                    {role === "owner" ? "Owner" : role === "developer" ? "Developer" : "Staff"}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                aria-label="Logout"
                title="Sign out"
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <Button variant="ghost" size="icon" className="shrink-0 rounded-[0.15rem]" onClick={() => setMobileOpen(true)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.15rem] bg-[#161514] border border-[#E5D3B3]/40 font-heading text-sm font-bold text-[#E5D3B3]">
            G
          </div>
          <span className="truncate font-heading text-sm font-semibold tracking-wide">Glow &amp; Glamour</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {/* Notification bell removed */}
        </div>
      </header>

      {/* Mobile drawer */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[#1A1816] text-white shadow-2xl border-r border-white/10">
            <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white">
                  G&amp;G
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold tracking-tight text-white">Glow &amp; Glamour</p>
                  <p className="text-[9px] text-slate-400">Operations Suite</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close" className="text-white hover:bg-slate-800 rounded-md">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
              {items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-medium transition-colors",
                      active
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-400")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-800 p-3">
              {(role === "staff" || role === "owner") && (
                <Button
                  variant="outline"
                  className="mb-2 w-full justify-start gap-2 rounded-md border-slate-700 bg-slate-800 text-xs text-slate-200"
                  onClick={() => {
                    setMobileOpen(false);
                    router.push(`/${role}-reception`);
                  }}
                >
                  <MonitorDot className="h-3.5 w-3.5 text-blue-400" /> Reception Mode
                </Button>
              )}
              <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900/60 p-2.5">
                <UserAvatar name={currentUser.fullName} color={currentUser.avatarColor} className="h-8 w-8 rounded-md" />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-semibold text-white">{currentUser.fullName}</p>
                  <p className="truncate text-[10px] text-slate-400">#{currentUser.id.slice(0, 8)}</p>
                </div>
                <button
                  onClick={logout}
                  aria-label="Logout"
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Executive Content */}
      <main
        className={cn(
          "mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:pl-72 lg:pr-6",
          isMobile && "pb-24"
        )}
      >
        {children}
      </main>
    </div>
  );
}
