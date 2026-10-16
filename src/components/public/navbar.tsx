"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, User, LogOut, Settings, CalendarCheck, ShieldCheck, ChevronRight, MonitorDot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpeningOwner, setIsOpeningOwner] = useState(false);
  const { currentUser, logout } = useData();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpeningOwner(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = currentUser?.role === "customer"
    ? [
        { name: "MY BOOKINGS", href: "/customer" },
        { name: "OUR SERVICES", href: "/treatments" },
        { name: "SPECIAL OFFERS", href: "/offers" },
        { name: "ABOUT US", href: "/our-story" },
      ]
    : [
        { name: "OUR SERVICES", href: "/treatments" },
        { name: "SPECIAL OFFERS", href: "/offers" },
        { name: "ABOUT US", href: "/our-story" },
      ];

  const isLinkActive = (href: string) => {
    if (href === "/customer") return pathname === "/customer" || pathname.startsWith("/customer/bookings");
    return pathname === href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8] shadow-xs py-3.5"
          : "bg-[#FAF8F5]/90 backdrop-blur-sm border-b border-[#E8E2D8]/60 py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Brand Wordmark - Always redirects to Home */}
        <Link href="/" className="flex items-center gap-2 group" title="Return to Home">
          <div className="flex flex-col">
            <span className="font-heading text-2xl md:text-3xl font-semibold text-[#222220] tracking-tight group-hover:text-[#8E6D38] transition-colors">
              Glow &amp; Glamour
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#666660] font-medium">
              Hair Studio &amp; Spa · Koregaon
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs font-semibold uppercase tracking-[0.2em] py-1 transition-all ${
                  active
                    ? "text-[#222220] border-b-2 border-[#8E6D38] font-bold"
                    : "text-[#5C5B56] hover:text-[#8E6D38] hover:border-b-2 hover:border-[#D8C7B0]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Action CTAs */}
          <div className="flex items-center gap-3.5 ml-6 border-l border-[#E8E2D8] pl-6">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="User Account & Profile Menu"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C7B0] bg-white hover:bg-[#F5EFEB] hover:border-[#8E6D38] text-[#8E6D38] transition-all shadow-xs focus:outline-none cursor-pointer group"
                    title={`Account: ${currentUser.fullName}`}
                  >
                    <User className="h-4 w-4 text-[#8E6D38] group-hover:scale-110 transition-transform" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-1.5 bg-white border border-[#E8E2D8] shadow-lg rounded-xs">
                  {/* User Profile Header */}
                  <div className="px-3 py-2.5 border-b border-border/60 bg-neutral-50/70 rounded-xs mb-1">
                    <p className="font-heading text-base font-semibold text-foreground truncate leading-tight">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate font-light mt-0.5">
                      {currentUser.phone || currentUser.email || "Registered Patron"}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold bg-[#FAF5EE] text-[#8E6D38] border border-[#E8DFC8]">
                      {currentUser.role === "customer" ? "Member Patron" : currentUser.role}
                    </span>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/customer/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-neutral-100 rounded-sm cursor-pointer"
                    >
                      <User className="h-4 w-4 text-[#8E6D38]" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">My Profile</span>
                        <span className="text-[10px] text-muted-foreground font-light">Edit name, address, number &amp; info</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/customer/settings"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-neutral-100 rounded-sm cursor-pointer"
                    >
                      <Settings className="h-4 w-4 text-[#8E6D38]" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">Settings</span>
                        <span className="text-[10px] text-muted-foreground font-light">Appearance &amp; preferences</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/customer"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-neutral-100 rounded-sm cursor-pointer"
                    >
                      <CalendarCheck className="h-4 w-4 text-[#8E6D38]" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">My Bookings</span>
                        <span className="text-[10px] text-muted-foreground font-light">Upcoming passes &amp; appointments</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  {(currentUser.role === "owner" || currentUser.role === "developer") && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/owner"
                          onClick={() => setIsOpeningOwner(true)}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-50 rounded-sm cursor-pointer",
                            isOpeningOwner && "pointer-events-none opacity-85"
                          )}
                        >
                          {isOpeningOwner ? (
                            <Loader2 className="h-4 w-4 text-amber-700 animate-spin shrink-0" />
                          ) : (
                            <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {isOpeningOwner ? "Opening Owner Suite..." : "Owner Suite"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-light">Salon CRM, Staff &amp; Reports</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link
                          href="/owner-reception"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-50 rounded-sm cursor-pointer"
                        >
                          <MonitorDot className="h-4 w-4 text-amber-700 shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">Reception Desk</span>
                            <span className="text-[10px] text-muted-foreground font-light">Queue &amp; walk-in check-in</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {currentUser.role === "developer" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/developer"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-900 hover:bg-emerald-50 rounded-sm cursor-pointer"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                        <span className="font-semibold">Developer Command Center</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-1 border-border/60" />

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-sm cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-rose-600" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs uppercase tracking-wider font-semibold h-9 rounded-sm text-foreground/85 hover:text-foreground hover:bg-neutral-100"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {(currentUser?.role === "owner" || currentUser?.role === "developer") ? (
              <Link
                href="/owner"
                onClick={() => setIsOpeningOwner(true)}
                className={isOpeningOwner ? "pointer-events-none" : undefined}
              >
                <Button
                  size="sm"
                  disabled={isOpeningOwner}
                  className="bg-[#A27C48] hover:bg-[#8A6737] text-[#FFFDFA] text-xs uppercase tracking-wider font-semibold rounded-xs px-4 h-9 shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-90 disabled:pointer-events-none"
                >
                  {isOpeningOwner ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FFFDFA]" />
                      <span>Opening Suite...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Owner Suite</span>
                    </>
                  )}
                </Button>
              </Link>
            ) : (
              <Link href="/book">
                <Button
                  size="sm"
                  className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xs px-5 h-9 shadow-xs transition-all"
                >
                  Book an Appointment
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden text-[#222220] p-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Animated Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden bg-[#FAF8F5] border-b border-[#E8E2D8] shadow-lg md:hidden"
          >
            <div className="max-h-[calc(100dvh-68px)] overflow-y-auto overscroll-contain px-5 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-4">
              {/* Section 1: Main Navigation Links */}
              <nav className="flex flex-col divide-y divide-[#E8E2D8]/60">
                {navLinks.map((link) => {
                  const active = isLinkActive(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`min-h-[46px] flex items-center justify-between py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                        active
                          ? "text-[#8E6D38] font-bold"
                          : "text-[#222220] hover:text-[#8E6D38]"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{link.name}</span>
                      <ChevronRight className={`h-3.5 w-3.5 ${active ? "text-[#8E6D38]" : "text-[#D8C7B0]"}`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Section 2: Account Section (if authenticated) */}
              {currentUser ? (
                <div className="flex flex-col gap-3 pt-3 border-t border-[#E8E2D8]">
                  {/* Account Header */}
                  <div className="flex items-center gap-3 py-1 px-0.5">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.fullName}
                        className="h-10 w-10 rounded-full object-cover border border-[#D8C7B0] shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full border border-[#D8C7B0] bg-white text-[#8E6D38] font-heading font-semibold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {(currentUser.fullName?.[0] || currentUser.email?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold text-[#222220] truncate leading-tight">
                        {currentUser.fullName || "Patron"}
                      </p>
                      <p className="text-xs text-[#666660] truncate mt-0.5">
                        {currentUser.phone || currentUser.email || "Registered Client"}
                      </p>
                    </div>
                  </div>

                  {/* Account Navigation Rows */}
                  <div className="flex flex-col divide-y divide-[#E8E2D8]/60 bg-white/70 border border-[#E8E2D8] rounded-xs overflow-hidden">
                    <Link
                      href="/customer/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[46px] flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-[#222220] hover:text-[#8E6D38] hover:bg-[#F5EFEB]/60 active:bg-[#F5EFEB] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-[#8E6D38] shrink-0" />
                        <span className="font-medium">My Profile</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-[#D8C7B0] group-hover:text-[#8E6D38] transition-colors shrink-0" />
                    </Link>

                    <Link
                      href="/customer/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[46px] flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-[#222220] hover:text-[#8E6D38] hover:bg-[#F5EFEB]/60 active:bg-[#F5EFEB] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-[#8E6D38] shrink-0" />
                        <span className="font-medium">Settings</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-[#D8C7B0] group-hover:text-[#8E6D38] transition-colors shrink-0" />
                    </Link>

                    <Link
                      href="/customer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[46px] flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-[#222220] hover:text-[#8E6D38] hover:bg-[#F5EFEB]/60 active:bg-[#F5EFEB] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarCheck className="h-4 w-4 text-[#8E6D38] shrink-0" />
                        <span className="font-medium">My Bookings</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-[#D8C7B0] group-hover:text-[#8E6D38] transition-colors shrink-0" />
                    </Link>

                    {currentUser.role === "owner" && (
                      <>
                        <Link
                          href="/owner"
                          onClick={() => setMobileMenuOpen(false)}
                          className="min-h-[46px] flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-amber-900 hover:bg-amber-50/60 active:bg-amber-100/60 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                            <span className="font-semibold">Owner Operations Suite</span>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </Link>

                        <Link
                          href="/owner-reception"
                          onClick={() => setMobileMenuOpen(false)}
                          className="min-h-[46px] flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-amber-900 hover:bg-amber-50/60 active:bg-amber-100/60 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <MonitorDot className="h-4 w-4 text-amber-700 shrink-0" />
                            <span className="font-semibold">Reception Desk</span>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </Link>
                      </>
                    )}

                    {currentUser.role === "developer" && (
                      <Link
                        href="/developer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="min-h-[46px] flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50/60 active:bg-emerald-100/60 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                          <span className="font-semibold">Developer Command Center</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </Link>
                    )}
                  </div>

                  {/* Sign Out Row */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="min-h-[44px] flex items-center gap-3 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50/60 active:bg-rose-100/60 rounded-xs transition-colors text-left w-full cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#E8E2D8]">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full text-xs uppercase tracking-wider font-semibold justify-center rounded-xs border-[#D8C7B0] text-[#222220] hover:bg-[#F5EFEB] h-10"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {/* Section 3: Primary Action */}
              <div className="pt-1">
                {(currentUser?.role === "owner" || currentUser?.role === "developer") ? (
                  <Link
                    href="/owner"
                    onClick={() => {
                      setIsOpeningOwner(true);
                      setMobileMenuOpen(false);
                    }}
                    className={cn("block w-full", isOpeningOwner && "pointer-events-none")}
                  >
                    <Button
                      disabled={isOpeningOwner}
                      className="w-full bg-[#A27C48] hover:bg-[#8A6737] text-[#FFFDFA] text-xs uppercase tracking-wider font-semibold rounded-xs h-11 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-90 disabled:pointer-events-none"
                    >
                      {isOpeningOwner ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-[#FFFDFA]" />
                          <span>Opening Suite...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Owner Operations Suite</span>
                        </>
                      )}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/book" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                    <Button className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xs h-11 shadow-xs transition-colors flex items-center justify-center cursor-pointer">
                      Book an Appointment
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
