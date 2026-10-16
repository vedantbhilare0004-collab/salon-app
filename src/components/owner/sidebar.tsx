"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  QrCode,
  Receipt,
  BarChart3,
  Scissors,
  Users,
  Tag,
  Settings,
  Code,
  ShieldCheck,
  MonitorDot,
  LogOut,
  Building2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useData } from "@/lib/store";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
  { label: "Live Queue", href: "/owner/appointments", icon: CalendarCheck },
  { label: "Fast Scanner", href: "/owner/scanner", icon: QrCode },
  { label: "Client CRM 360°", href: "/owner/customers", icon: Users },
  { label: "Billing & Invoices", href: "/owner/billing", icon: Receipt },
  { label: "Financial Reports", href: "/owner/reports", icon: BarChart3 },
  { label: "Services & Pricing", href: "/owner/services", icon: Scissors },
  { label: "Staff Operations", href: "/owner/staff", icon: Building2 },
  { label: "Promotions & Offers", href: "/owner/offers", icon: Tag },
  { label: "Studio Settings", href: "/owner/settings", icon: Settings },
  { label: "Developer Sandbox", href: "/owner/developer", icon: Code },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, activeBranchId } = useData();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);

  // Clear loading state when route transition completes
  useEffect(() => {
    setNavigatingHref(null);
  }, [pathname]);

  const handleNavClick = (href: string) => {
    if (href === pathname) {
      if (onClose) onClose();
      return;
    }
    setNavigatingHref(href);
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 bg-[#F6F3ED] text-[#302A24] border-r border-[#E9E1D6] p-4 flex flex-col justify-between shrink-0 h-full min-h-screen select-none">
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="px-2 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#A27C48] text-[#FFFDFA] font-bold text-sm shrink-0 shadow-xs">
              G&amp;G
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-[#302A24] tracking-tight leading-none truncate">
                Glow &amp; Glamour
              </h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A27C48] shrink-0" />
                <p className="text-[11px] text-[#74695E] font-medium truncate">
                  Salon Management CRM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reception Mode Button */}
        <div className="px-1">
          <Button
            variant="outline"
            size="sm"
            disabled={navigatingHref !== null}
            onClick={() => {
              setNavigatingHref("/owner-reception");
              if (onClose) onClose();
              router.push("/owner-reception");
            }}
            className={cn(
              "w-full justify-between h-8 text-xs bg-[#FFFDFA] hover:bg-[#F0EBE3] text-[#302A24] border-[#E9E1D6] font-medium rounded-md px-3 transition-colors shadow-2xs cursor-pointer",
              navigatingHref === "/owner-reception" && "bg-[#F0EBE3] border-[#A27C48]/50"
            )}
          >
            <span className="flex items-center gap-2">
              {navigatingHref === "/owner-reception" ? (
                <Loader2 className="h-3.5 w-3.5 text-[#A27C48] animate-spin" />
              ) : (
                <MonitorDot className="h-3.5 w-3.5 text-[#A27C48]" />
              )}
              <span>
                {navigatingHref === "/owner-reception" ? "Opening..." : "Reception Mode"}
              </span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#74695E]" />
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#74695E]">
            Navigation
          </p>
          <nav className="space-y-0.5 pt-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/owner" ? pathname === "/owner" : pathname.startsWith(item.href);
              const isThisNavigating = navigatingHref === item.href;
              const isOtherNavigating = navigatingHref !== null && !isThisNavigating;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all group relative",
                    isThisNavigating
                      ? "bg-[#EAE3D6] text-[#302A24] font-semibold border-l-2 border-[#A27C48] shadow-2xs"
                      : isActive
                      ? "bg-[#F0EBE3] text-[#302A24] font-semibold border-l-2 border-[#A27C48]"
                      : "text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3]/70",
                    isOtherNavigating && "pointer-events-none opacity-65 cursor-wait"
                  )}
                >
                  {isThisNavigating ? (
                    <Loader2 className="h-4 w-4 shrink-0 text-[#A27C48] animate-spin" />
                  ) : (
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-[#A27C48]" : "text-[#74695E] group-hover:text-[#302A24]"
                      )}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                  {isThisNavigating && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-semibold text-[#A27C48] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E9DFC8] animate-pulse">
                      Loading
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile & Security */}
      <div className="space-y-3 pt-4 border-t border-[#E9E1D6]">
        {currentUser && (
          <div className="flex items-center gap-3 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] p-2.5">
            <UserAvatar
              name={currentUser.fullName}
              color={currentUser.avatarColor || "#A27C48"}
              className="h-8 w-8 rounded-md shrink-0"
            />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-[#302A24]">
                {currentUser.fullName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono text-[#74695E] truncate">
                  #{currentUser.id.slice(0, 8)}
                </span>
                <span className="text-[9px] font-medium text-[#A27C48] bg-[#F0EBE3] border border-[#E9E1D6] px-1 py-0.5 rounded">
                  Owner
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md p-1.5 text-[#74695E] hover:text-[#8C3930] hover:bg-[#F7E7E3] transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-1 text-[10px] text-[#74695E]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-[#A27C48]" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <span className="font-mono text-[#74695E]">v2.4 Pro</span>
        </div>
      </div>
    </aside>
  );
}
