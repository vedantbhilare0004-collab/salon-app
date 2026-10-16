"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useData } from "@/lib/store";
import {
  Code,
  Sparkles,
  Home,
  LayoutDashboard,
  CalendarCheck,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Users,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DeveloperHUD() {
  const { currentUser } = useData();
  const pathname = usePathname();
  const [minimized, setMinimized] = useState(false);

  if (!currentUser || currentUser.role !== "developer") {
    return null;
  }

  // Determine current test context
  let currentContext = "Developer Suite";
  let contextColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (pathname.startsWith("/customer") || pathname.startsWith("/book") || pathname.startsWith("/treatments")) {
    currentContext = "Customer Sanctuary Mode";
    contextColor = "bg-[#E5D3B3]/20 text-[#8E6D38] dark:text-[#E5D3B3] border-[#8E6D38]/30";
  } else if (pathname.startsWith("/owner")) {
    currentContext = "Owner Executive Mode";
    contextColor = "bg-amber-500/15 text-amber-500 border-amber-500/30";
  } else if (pathname.startsWith("/staff")) {
    currentContext = "Staff Floor Mode";
    contextColor = "bg-blue-500/15 text-blue-400 border-blue-500/30";
  }

  return (
    <aside 
      aria-label="Developer HUD" 
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-auto font-sans"
    >
      {/* Minimized Pill */}
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-[#161514]/95 px-3.5 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:border-emerald-400"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Code className="h-3 w-3" />
          </div>
          <span className="text-[11px] font-mono tracking-wider text-emerald-300">DEV HUD</span>
          <span className={cn("text-[9px] px-1.5 py-0.5 rounded border uppercase font-medium", contextColor)}>
            {currentContext.split(" ")[0]}
          </span>
          <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
        </button>
      ) : (
        /* Full Controller Panel */
        <div className="w-[340px] sm:w-[380px] rounded-2xl border border-white/10 bg-[#181614]/95 p-3.5 text-white shadow-2xl backdrop-blur-xl transition-all">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30">
                <Code className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold tracking-wide text-white font-mono">Dev Controller</p>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 rounded font-mono font-medium">
                    SUPER-ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate max-w-[180px]">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMinimized(true)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Minimize HUD"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Current Active Testing View Indicator */}
          <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] text-neutral-300">Active Test Mode:</span>
            </div>
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider", contextColor)}>
              {currentContext}
            </span>
          </div>

          {/* Quick Perspective Switching Links */}
          <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
            <Link
              href="/customer"
              className={cn(
                "flex items-center gap-2 rounded-xl px-2.5 py-2 transition-all border",
                pathname.startsWith("/customer")
                  ? "bg-[#22211F] text-[#E5D3B3] border-[#8E6D38]/50 shadow-sm"
                  : "bg-white/5 text-neutral-300 border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              <Home className="h-3.5 w-3.5 text-[#E5D3B3]" />
              <div className="truncate">
                <div className="font-semibold text-[11px]">Sanctuary</div>
                <div className="text-[9px] text-neutral-400">Customer View</div>
              </div>
            </Link>

            <Link
              href="/owner"
              className={cn(
                "flex items-center gap-2 rounded-xl px-2.5 py-2 transition-all border",
                pathname.startsWith("/owner")
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                  : "bg-white/5 text-neutral-300 border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-amber-400" />
              <div className="truncate">
                <div className="font-semibold text-[11px]">Owner Suite</div>
                <div className="text-[9px] text-neutral-400">Executive View</div>
              </div>
            </Link>

            <Link
              href="/staff"
              className={cn(
                "flex items-center gap-2 rounded-xl px-2.5 py-2 transition-all border",
                pathname.startsWith("/staff")
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm"
                  : "bg-white/5 text-neutral-300 border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              <CalendarCheck className="h-3.5 w-3.5 text-blue-400" />
              <div className="truncate">
                <div className="font-semibold text-[11px]">Staff Floor</div>
                <div className="text-[9px] text-neutral-400">Stylist View</div>
              </div>
            </Link>

            <Link
              href="/developer"
              className={cn(
                "flex items-center gap-2 rounded-xl px-2.5 py-2 transition-all border",
                pathname === "/developer"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                  : "bg-white/5 text-neutral-300 border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              <Code className="h-3.5 w-3.5 text-emerald-400" />
              <div className="truncate">
                <div className="font-semibold text-[11px]">Dev Console</div>
                <div className="text-[9px] text-neutral-400">Command Center</div>
              </div>
            </Link>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/10 text-[10px] text-neutral-400 px-1">
            <Link href="/developer/owners" className="flex items-center gap-1 hover:text-emerald-300 transition-colors">
              <ShieldCheck className="h-3 w-3 text-emerald-400" /> Owners
            </Link>
            <Link href="/developer/users" className="flex items-center gap-1 hover:text-emerald-300 transition-colors">
              <Users className="h-3 w-3 text-emerald-400" /> All Users
            </Link>
            <Link href="/developer/visitors" className="flex items-center gap-1 hover:text-emerald-300 transition-colors">
              <Eye className="h-3 w-3 text-emerald-400" /> Traffic
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
