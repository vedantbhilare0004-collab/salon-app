"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShieldCheck, Radio, Sparkles, Globe, ExternalLink, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/owner/sidebar";
import { BroadcastDialog } from "./broadcast-dialog";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/store";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isGoingHome, setIsGoingHome] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F6F3ED] text-[#302A24] font-sans antialiased theme-owner">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#302A24]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-[#F6F3ED] border-r border-[#E9E1D6] shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9E1D6]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#74695E]">
                CRM Menu
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Professional Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E9E1D6] bg-[#FFFDFA]/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden h-9 w-9 text-[#302A24] border-[#E9E1D6] bg-[#FFFDFA] hover:bg-[#F0EBE3]"
              aria-label="Open CRM Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Salon Identity Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F0EBE3] border border-[#E9E1D6] text-xs font-medium text-[#302A24]">
              <span className="h-2 w-2 rounded-full bg-[#A27C48] shrink-0" />
              <span className="font-semibold">Glow &amp; Glamour Hair Studio</span>
              <span className="text-[#74695E] font-normal hidden md:inline">· Laxmi Nagar, Koregaon</span>
            </div>
          </div>

          {/* Right Status & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Main Website / Public Page */}
            <Link
              href="/"
              onClick={() => setIsGoingHome(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D8C7B0] bg-[#FFFDFA] hover:bg-[#F0EBE3] text-xs font-semibold text-[#302A24] transition-colors shadow-2xs group cursor-pointer"
              title="View Public Website & Customer Experience"
            >
              {isGoingHome ? (
                <Loader2 className="h-3.5 w-3.5 text-[#A27C48] animate-spin" />
              ) : (
                <Globe className="h-3.5 w-3.5 text-[#A27C48] group-hover:scale-110 transition-transform" />
              )}
              <span className="hidden sm:inline">
                {isGoingHome ? "Opening Website..." : "Main Website"}
              </span>
              <span className="sm:hidden">
                {isGoingHome ? "Opening..." : "Website"}
              </span>
              {!isGoingHome && (
                <ExternalLink className="h-3 w-3 text-[#74695E] group-hover:text-[#302A24]" />
              )}
            </Link>

            {/* Live Cloud Security Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E0EBDD] border border-[#C7DCC2] text-[11px] font-semibold text-[#355B3C]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#355B3C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#355B3C]"></span>
              </span>
              <span>Encrypted CRM Live</span>
            </div>

            {/* Quick Broadcast Button */}
            <BroadcastDialog />
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
