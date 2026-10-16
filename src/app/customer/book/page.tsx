"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BookingFlow } from "@/components/public/booking/booking-flow";

export default function CustomerBookPage() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/customer"
              className="text-xs uppercase tracking-wider text-[#666660] hover:text-[#222220] inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span className="text-[#E8E2D8]">/</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8E6D38]">
              Book an Appointment
            </span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[#222220] mt-1">
            Book an Appointment
          </h1>
          <p className="text-xs text-[#666660]">
            Your details are pre-linked. Choose your services, preferred stylist, and schedule.
          </p>
        </div>
      </div>

      <BookingFlow />
    </div>
  );
}
