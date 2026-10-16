"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/store";
import { offerService } from "@/lib/services/offerService";
import { Offer, Service } from "@/lib/types";
import { formatPrice, formatDate } from "@/lib/format";
import {
  Sparkles,
  MapPin,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  Tag,
  AlertCircle,
  FileText,
  Phone,
} from "lucide-react";

interface OfferDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OfferDetailPage({ params }: OfferDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { offers, services: catalogueServices, ready } = useData();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync from store or directly fetch
  useEffect(() => {
    if (offers.length > 0) {
      const found = offers.find((o) => o.id === id);
      if (found) {
        setOffer(found);
        setLoading(false);
        return;
      }
    }

    // Direct fetch fallback for direct links & refresh
    offerService.get(id).then((doc) => {
      setOffer(doc);
      setLoading(false);
    });
  }, [id, offers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] theme-customer flex flex-col">
        <PublicNavbar />
        <main className="flex-1 pt-28 pb-20 flex items-center justify-center">
          <div className="animate-pulse space-y-4 max-w-xl w-full px-4">
            <div className="h-64 bg-[#E8E2D8]/50 rounded-sm" />
            <div className="h-8 bg-[#E8E2D8]/50 w-3/4 rounded-xs" />
            <div className="h-4 bg-[#E8E2D8]/50 w-1/2 rounded-xs" />
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] theme-customer flex flex-col">
        <PublicNavbar />
        <main className="flex-1 pt-28 pb-20">
          <div className="container mx-auto px-4 max-w-xl text-center py-16 bg-white border border-[#E8E2D8] rounded-sm shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF5EE] border border-[#E8DFC8] flex items-center justify-center mx-auto text-[#8E6D38]">
              <AlertCircle className="w-6 h-6 text-[#8E6D38]" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-[#222220]">
              Offer Not Found
            </h1>
            <p className="text-sm text-[#5C5B56] leading-relaxed">
              This promotional offer may have concluded or has been updated by the salon. Please browse all current active offers.
            </p>
            <div className="pt-2">
              <Link href="/offers">
                <Button className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold rounded-xs h-10 px-5">
                  Browse Current Offers
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const finalPrice = offer.price;
  const originalPrice = offer.originalPrice;
  const hasSavings = originalPrice && finalPrice && originalPrice > finalPrice;
  const savingsAmount = hasSavings ? originalPrice - finalPrice : 0;
  const savingsPercent = hasSavings ? Math.round((savingsAmount / originalPrice) * 100) : 0;

  // Resolve matched catalog services for inclusions
  const matchedServices: Service[] = (offer.serviceIds || [])
    .map((sId) => catalogueServices.find((s) => s.id === sId))
    .filter((s): s is Service => !!s);

  const bookUrl = `/book?offerId=${offer.id}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] theme-customer flex flex-col selection:bg-[#E8DFC8] selection:text-[#222220]">
      <PublicNavbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-24 sm:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Breadcrumb Navigation */}
          <div className="py-3 flex items-center gap-2 text-xs text-[#74695E] font-medium">
            <Link href="/" className="hover:text-[#222220] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/offers" className="hover:text-[#222220] transition-colors">
              Special Offers
            </Link>
            <span>/</span>
            <span className="text-[#222220] truncate max-w-[200px] sm:max-w-xs">
              {offer.title}
            </span>
          </div>

          {/* Main Grid */}
          <div className="mt-4 grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Artwork & Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Optional Artwork */}
              {offer.imageUrl && (
                <div className="relative w-full h-72 sm:h-96 rounded-sm overflow-hidden bg-[#FAF8F5] border border-[#E8E2D8] shadow-xs">
                  <Image
                    src={offer.imageUrl}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {offer.category && (
                    <span className="absolute top-4 left-4 bg-[#222220]/90 backdrop-blur-xs text-[#FAF8F5] text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-xs">
                      {offer.category}
                    </span>
                  )}
                  {hasSavings && (
                    <span className="absolute bottom-4 right-4 bg-[#8E6D38] text-white text-xs font-semibold px-3 py-1 rounded-xs tracking-wider">
                      Save {formatPrice(savingsAmount)} ({savingsPercent}% OFF)
                    </span>
                  )}
                </div>
              )}

              {/* Title & Description Box */}
              <div className="bg-white border border-[#E8E2D8] rounded-sm p-6 sm:p-8 space-y-4 shadow-xs">
                {!offer.imageUrl && offer.category && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DFC8] text-[#8E6D38] text-[11px] font-bold uppercase tracking-[0.2em]">
                    <Sparkles className="h-3 w-3 text-[#A27C48]" />
                    <span>{offer.category}</span>
                  </div>
                )}

                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#222220] leading-tight">
                  {offer.title}
                </h1>

                {offer.campaignName && (
                  <div className="text-xs text-[#8E6D38] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Part of {offer.campaignName}</span>
                  </div>
                )}

                <p className="text-sm sm:text-base text-[#5C5B56] leading-relaxed font-normal whitespace-pre-line">
                  {offer.fullDescription || offer.description}
                </p>
              </div>

              {/* Package Inclusions Section */}
              <div className="bg-white border border-[#E8E2D8] rounded-sm p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#74695E] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8E6D38]" />
                  <span>Package Inclusions &amp; Services</span>
                </div>

                {matchedServices.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {matchedServices.map((svc) => (
                      <div
                        key={svc.id}
                        className="flex items-center justify-between p-3.5 rounded-sm bg-[#FAF8F5] border border-[#E8E2D8]"
                      >
                        <div>
                          <div className="font-semibold text-sm text-[#222220]">{svc.name}</div>
                          <div className="text-xs text-[#74695E] mt-0.5">
                            {svc.durationMin || svc.durationMinutes || 30} mins duration
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-[#8E6D38]">
                          Included in Package
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (offer.includedServices && offer.includedServices.length > 0) ||
                  (offer.features && offer.features.length > 0) ? (
                  <div className="space-y-2.5 pt-2">
                    {(offer.includedServices || offer.features || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-sm bg-[#FAF8F5] border border-[#E8E2D8] text-sm text-[#222220]"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#8E6D38] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#74695E]">
                    Standard treatment inclusions as detailed in description.
                  </p>
                )}

                {/* Complimentary Services Gift */}
                {offer.complimentaryServices && offer.complimentaryServices.length > 0 && (
                  <div className="mt-4 p-4 rounded-sm bg-[#FAF5EE] border border-[#E8DFC8] space-y-2">
                    <div className="text-xs uppercase font-bold tracking-wider text-[#8E6D38] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#A27C48]" />
                      <span>Complimentary Salon Add-ons (Free)</span>
                    </div>
                    <ul className="text-xs sm:text-sm text-[#5C5B56] space-y-1">
                      {offer.complimentaryServices.map((gift, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#8E6D38]" />
                          <span>{gift}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Terms, Conditions & Booking Restrictions */}
              <div className="bg-white border border-[#E8E2D8] rounded-sm p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#74695E] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#8E6D38]" />
                  <span>Terms, Conditions &amp; Policies</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[#222220]">Offer Validity</div>
                    <p className="text-xs text-[#5C5B56] leading-relaxed">
                      {offer.startsAt ? `Valid from ${formatDate(offer.startsAt)}` : "Available now"}
                      {offer.endsAt ? ` until ${formatDate(offer.endsAt)}` : " (Ongoing promo)"}. Appointments must be completed within this period.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[#222220]">Eligibility &amp; Stacking</div>
                    <p className="text-xs text-[#5C5B56] leading-relaxed">
                      {offer.eligibility || "Open to all clients. Cannot be combined with other ongoing salon discounts or membership vouchers."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[#222220]">Booking Restrictions</div>
                    <p className="text-xs text-[#5C5B56] leading-relaxed">
                      {offer.bookingRestrictions || "Advance appointment required. Subject to salon stylist availability at Koregaon branch."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[#222220]">Cancellation &amp; Rescheduling</div>
                    <p className="text-xs text-[#5C5B56] leading-relaxed">
                      {offer.cancellationPolicy || "Free rescheduling up to 4 hours before appointment. No cancellation fees apply when notified in advance."}
                    </p>
                  </div>
                </div>

                {offer.terms && (
                  <div className="pt-3 border-t border-[#F2ECE4] text-xs text-[#74695E] leading-relaxed">
                    <span className="font-semibold text-[#222220]">Additional Notes: </span>
                    {offer.terms}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Pricing & Sticky Booking Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
              <div className="bg-white border border-[#E8E2D8] rounded-sm p-6 sm:p-7 shadow-md space-y-5">
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-[#74695E]">
                    Promotional Package Price
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="font-heading text-3xl sm:text-4xl font-bold text-[#222220]">
                      {finalPrice !== undefined ? formatPrice(finalPrice) : (offer.badge || "Special Rate")}
                    </span>
                    {hasSavings && (
                      <span className="text-sm sm:text-base text-[#74695E] line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>

                  {hasSavings && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#FAF5EE] text-[#8E6D38] border border-[#E8DFC8] text-xs font-semibold">
                      <span>You save {formatPrice(savingsAmount)} ({savingsPercent}% discount)</span>
                    </div>
                  )}
                </div>

                {/* Booking Action */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
                  <Link href={bookUrl} className="block w-full">
                    <Button
                      id="btn-book-offer-detail"
                      className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-sm sm:text-base font-semibold rounded-xs h-12 shadow-xs cursor-pointer gap-2"
                    >
                      <span>Book This Offer</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <p className="text-[11px] text-center text-[#74695E]">
                    Guaranteed promotional price locked upon booking
                  </p>
                </div>

                {/* Key Salon Assurances */}
                <div className="pt-4 border-t border-[#E8E2D8] space-y-2.5 text-xs text-[#5C5B56]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#8E6D38] shrink-0" />
                    <span>Pay at the salon upon completion of service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-[#8E6D38] shrink-0" />
                    <span>Instant digital QR pass issued to your profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#8E6D38] shrink-0" />
                    <span>Flexible rescheduling if your schedule changes</span>
                  </div>
                </div>

                {/* Salon Location & Support */}
                <div className="pt-4 border-t border-[#E8E2D8] text-xs text-[#5C5B56] space-y-1.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#8E6D38] shrink-0 mt-0.5" />
                    <span>Glow &amp; Glamour, Laxmi Nagar, Koregaon, Satara</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#8E6D38] shrink-0" />
                    <span>Direct salon queries: +91 91722 09292</span>
                  </div>
                </div>
              </div>

              {/* Back to all offers */}
              <div className="text-center">
                <Link
                  href="/offers"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5B56] hover:text-[#222220] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>View all current offers</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Bar for Mobile Devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-[#E8E2D8] shadow-lg z-40 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-[#74695E] uppercase font-bold tracking-wider truncate">
            Offer Rate
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-lg font-bold text-[#222220]">
              {finalPrice !== undefined ? formatPrice(finalPrice) : (offer.badge || "Special")}
            </span>
            {hasSavings && (
              <span className="text-xs text-[#74695E] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        <Link href={bookUrl} className="shrink-0">
          <Button className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs sm:text-sm font-semibold rounded-xs h-11 px-5 cursor-pointer shadow-xs gap-1.5">
            <span>Book This Offer</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <PublicFooter />
    </div>
  );
}
