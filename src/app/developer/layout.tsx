"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Code,
  Users,
  ShieldCheck,
  Eye,
  Home,
  LayoutDashboard,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useData } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui-kit";

const DEV_NAV_ITEMS = [
  { label: "Dev Console", href: "/developer", icon: Code, badge: "CORE" },
  { label: "Owner Management", href: "/developer/owners", icon: ShieldCheck, badge: "CRUCIAL" },
  { label: "Registered Users", href: "/developer/users", icon: Users },
  { label: "Visitor Traffic", href: "/developer/visitors", icon: Eye },
];

const TEST_VIEW_ITEMS = [
  { label: "Test Sanctuary View", href: "/customer", icon: Home, desc: "Customer experience & booking" },
  { label: "Test Owner Suite", href: "/owner", icon: LayoutDashboard, desc: "Appointments, CRM & billing" },
  { label: "Test Staff Floor", href: "/staff", icon: CalendarCheck, desc: "Stylist queue & clock-in" },
];

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useData();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#0C0B0A] text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Desktop Developer Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-white/10 bg-[#141210] p-5 shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Header Identity */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 text-emerald-400 shadow-md">
              <Code className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-base font-semibold tracking-wide text-white">Glow &amp; Glamour</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-400 font-semibold mt-0.5">
                Developer Suite
              </p>
            </div>
          </div>

          {/* Developer Badge */}
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                SUPER ADMIN
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="font-semibold text-white truncate">{currentUser.fullName || "Prathmesh Bhilare"}</p>
            <p className="text-[10px] text-neutral-400 font-mono truncate">{currentUser.email}</p>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 px-3 font-semibold mb-2">
              Management Suite
            </p>
            {DEV_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/developer" ? pathname === "/developer" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 font-semibold border-l-2 border-emerald-400 shadow-inner"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-emerald-400" : "text-neutral-500 group-hover:text-white")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      "text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold",
                      isActive ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/40" : "bg-white/5 text-neutral-500 border-white/10"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Test & Simulation Views */}
          <div className="space-y-1 pt-2 border-t border-white/10">
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 px-3 font-semibold mb-2 flex items-center justify-between">
              <span>Test Perspectives</span>
              <Sparkles className="h-3 w-3 text-emerald-400" />
            </p>
            {TEST_VIEW_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                    <div>
                      <p className="font-medium text-white/90">{item.label}</p>
                      <p className="text-[9px] text-neutral-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="text-neutral-500 font-mono text-[10px]">G&amp;G DEV v2.0</span>
            <span className="text-emerald-400 text-[10px] font-mono">ONLINE</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-2 rounded-lg border-white/10 bg-white/5 text-neutral-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Developer Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#141210]/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="text-white hover:bg-white/10 rounded-lg"
              aria-label="Open developer menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                <Code className="h-4 w-4" />
              </div>
              <span className="font-heading font-semibold text-sm text-white">Dev Suite</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/customer"
              className="text-[11px] font-semibold text-[#E5D3B3] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md"
            >
              Test Customer
            </Link>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[#141210] p-5 text-white shadow-2xl border-r border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Code className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Glow &amp; Glamour</p>
                    <p className="text-[9px] uppercase tracking-wider text-emerald-400">Developer Suite</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-2 py-4">
                <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-semibold mb-1">
                  Management
                </p>
                {DEV_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/developer" ? pathname === "/developer" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                        isActive ? "bg-emerald-500/20 text-emerald-300" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-semibold pt-4 mb-1">
                  Test Perspectives
                </p>
                {TEST_VIEW_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Icon className="h-4 w-4 text-emerald-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-white/10">
                <Button variant="outline" size="sm" onClick={logout} className="w-full justify-start gap-2 border-white/10 text-neutral-300">
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Developer Main Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
