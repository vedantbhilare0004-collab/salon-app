import { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/public/booking/booking-flow";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book an Appointment — Glow & Glamour Hair Studio & Spa",
  description: "Book your appointment for haircuts, hair care, facials, and styling at Glow & Glamour Koregaon.",
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] theme-customer flex flex-col w-full max-w-full overflow-x-hidden">
      <PublicNavbar />

      <main className="flex-1 pt-20 sm:pt-32 pb-12 w-full max-w-full overflow-x-hidden">
        <div className="container max-w-6xl mx-auto px-3 sm:px-6 w-full max-w-full min-w-0">
          {/* Header */}
          <div className="text-center space-y-1 sm:space-y-2 max-w-2xl mx-auto mb-3 sm:mb-8">
            <div className="text-[11px] sm:text-sm font-bold tracking-wider uppercase text-[#8E6D38]">
              BOOK AN APPOINTMENT
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#222220] tracking-tight">
              Book Your Visit
            </h1>
            <p className="text-xs sm:text-base text-[#5C5B56] font-medium flex items-center justify-center gap-1.5 pt-0.5">
              <MapPin className="h-3.5 w-3.5 text-[#8E6D38] inline shrink-0" />
              Laxmi Nagar, Koregaon · Fast Online Confirmation
            </p>
          </div>

          {/* Booking Console */}
          <Suspense
            fallback={
              <div className="w-full min-h-[400px] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#8E6D38] border-t-transparent animate-spin" />
              </div>
            }
          >
            <BookingFlow />
          </Suspense>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
