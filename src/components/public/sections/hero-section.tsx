"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Phone, Scissors, ShieldCheck, MonitorDot, LayoutDashboard } from "lucide-react";
import { useCurrentUser } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const currentUser = useCurrentUser();
  const [showOwnerDialog, setShowOwnerDialog] = useState(false);
  const isOwner = currentUser?.role === "owner";

  return (
    <section className="relative w-full min-h-[640px] md:min-h-[720px] lg:min-h-[820px] flex items-center pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-[#2C2824] overflow-hidden bg-[#161513]">
      {/* Full-Size Hero Background Image with Responsive Luxury Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/new_Hero.png"
          alt="Glow & Glamour Hair Studio & Spa luxury salon interior in Koregaon"
          className="w-full h-full object-cover object-center scale-100 transform transition-transform duration-1000 ease-out"
          loading="eager"
          fetchPriority="high"
        />
        {/* Horizontal readability gradient: dark on left for text, transparent on right to showcase salon stations */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 via-40% to-black/40 lg:from-black/90 lg:via-black/65 lg:via-45% lg:to-black/20" />
        {/* Vertical atmospheric vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
      </div>

      {/* Hero Foreground Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl">
        <div className="max-w-2xl lg:max-w-3xl space-y-6 text-left">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-[#D4AF37]/40 text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#E5C378] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378] animate-pulse" />
            <span>Koregaon · Hair Studio &amp; Spa</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08] drop-shadow-md">
            Beautiful Hair. <br />
            <span className="italic font-light text-[#E5C378]">Expert Care.</span>
          </h1>

          {/* Supporting description */}
          <p className="text-base sm:text-lg text-[#F0EBE1] max-w-xl leading-relaxed font-normal drop-shadow-sm">
            Precision haircuts, natural hair styling, and restorative hair care for everyone.
            Experience dedicated salon styling by experienced professionals in Koregaon.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            {isOwner ? (
              <button
                type="button"
                onClick={() => setShowOwnerDialog(true)}
                className="inline-flex items-center justify-center gap-2.5 bg-[#8E6D38] hover:bg-[#A37E42] text-white font-semibold px-8 py-4 text-sm sm:text-base rounded-xs shadow-lg shadow-[#8E6D38]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left"
              >
                <Scissors className="h-4 w-4" />
                <span>Book an Appointment</span>
              </button>
            ) : (
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2.5 bg-[#8E6D38] hover:bg-[#A37E42] text-white font-semibold px-8 py-4 text-sm sm:text-base rounded-xs shadow-lg shadow-[#8E6D38]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Scissors className="h-4 w-4" />
                <span>Book an Appointment</span>
              </Link>
            )}

            <Link
              href="/treatments"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md px-8 py-4 text-sm sm:text-base font-semibold rounded-xs transition-all hover:border-white/40"
            >
              <span>Explore Services</span>
              <ArrowRight className="h-4 w-4 text-[#E5C378]" />
            </Link>
          </div>

          {/* Floating Luxury Information Bar */}
          <div className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-5 rounded-xs bg-black/60 backdrop-blur-md border border-white/15 text-sm text-[#F0EBE1] max-w-3xl shadow-2xl">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#E5C378] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Location</span>
                  <span className="text-[#D6D3CD]">Laxmi Nagar, Koregaon</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#E5C378] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Hours</span>
                  <span className="text-[#D6D3CD]">9:30 AM – 9:00 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-[#E5C378] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Phone</span>
                  <a
                    href="tel:+917058239061"
                    className="text-[#D6D3CD] hover:text-[#E5C378] transition-colors"
                  >
                    +91 70582 39061
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Booking Restriction Dialog */}
      <Dialog open={showOwnerDialog} onOpenChange={setShowOwnerDialog}>
        <DialogContent className="sm:max-w-md bg-[#FAF8F5] border-[#E8E2D8] text-[#222220] p-6 sm:p-7">
          <DialogHeader className="text-center sm:text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF5EE] border border-[#E8DFC8]">
              <ShieldCheck className="h-7 w-7 text-[#A27C48]" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#FAF5EE] text-[#8E6D38] border border-[#E8DFC8] mb-2">
                Salon Owner Mode Active
              </span>
              <DialogTitle className="font-heading text-xl sm:text-2xl font-bold text-[#222220]">
                Client Booking Is Restricted for Owners
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm text-[#5C5B56] leading-relaxed">
              You are currently viewing the customer website as Salon Owner ({currentUser?.fullName}). Salon owners cannot book customer appointments. To schedule client appointments, manage walk-ins, and view today&apos;s queues, please use Reception Mode or the Owner Operations Suite.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5 pt-3">
            <Link href="/owner-reception" onClick={() => setShowOwnerDialog(false)}>
              <Button className="w-full bg-[#8E6D38] hover:bg-[#785C2F] text-[#FAF8F5] text-xs font-semibold rounded-xs h-10 gap-2 cursor-pointer shadow-xs">
                <MonitorDot className="h-4 w-4" />
                <span>Open Reception Mode</span>
              </Button>
            </Link>

            <Link href="/owner" onClick={() => setShowOwnerDialog(false)}>
              <Button variant="outline" className="w-full border-[#D8C7B0] hover:bg-[#F5EFEB] text-[#222220] text-xs font-semibold rounded-xs h-10 gap-2 cursor-pointer">
                <LayoutDashboard className="h-4 w-4 text-[#8E6D38]" />
                <span>Owner Operations Suite</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              onClick={() => setShowOwnerDialog(false)}
              className="w-full text-[#5C5B56] hover:text-[#222220] hover:bg-[#F0EBE3] text-xs font-medium rounded-xs h-9 cursor-pointer"
            >
              Continue Browsing Website
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
