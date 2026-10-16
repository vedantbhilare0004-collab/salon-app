"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/store";
import { OfferCard } from "@/components/public/offers/offer-card";
import { OfferCategory } from "@/lib/types";
import {
  Tag,
  Sparkles,
  MapPin,
  CalendarDays,
  ArrowRight,
  Clock,
  Scissors,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Offers",
  "Haircuts & Grooming": "Haircuts & Grooming",
  "Hair Spa & Treatments": "Hair Spa & Treatments",
  "Facial & Skin Care": "Facial & Skin Care",
  "Hair Colour": "Hair Colour",
  Packages: "Packages",
  "Festive & Seasonal": "Festive & Seasonal",
};

export default function OffersPage() {
  const { offers, campaigns, ready } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter only active, non-expired offers
  const activeOffers = useMemo(() => {
    const now = Date.now();
    return offers
      .filter((o) => {
        if (o.active === false) return false;
        if (o.endsAt) {
          const exp = new Date(`${o.endsAt}T23:59:59`).getTime();
          if (!isNaN(exp) && exp < now) return false;
        }
        return true;
      })
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
  }, [offers]);

  // Find active featured campaign if configured
  const featuredCampaign = useMemo(() => {
    return campaigns.find((c) => c.active !== false && (c.isFeatured || c.featureOnHome));
  }, [campaigns]);

  // Determine which categories actually have offers
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    activeOffers.forEach((o) => {
      if (o.category) set.add(o.category);
    });
    return ["all", ...Array.from(set)];
  }, [activeOffers]);

  // Filtered offers by chosen category
  const filteredOffers = useMemo(() => {
    if (selectedCategory === "all") return activeOffers;
    return activeOffers.filter((o) => o.category === selectedCategory);
  }, [activeOffers, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] theme-customer flex flex-col selection:bg-[#E8DFC8] selection:text-[#222220]">
      <PublicNavbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* SECTION A: OFFERS HERO */}
          <div className="py-8 sm:py-10 border-b border-[#E8E2D8]">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DFC8] text-[#8E6D38] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                <Sparkles className="h-3 w-3 text-[#A27C48]" />
                <span>Special Offers</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#222220] tracking-tight leading-[1.15]">
                Offers &amp; Seasonal Packages
              </h1>

              <p className="mt-3 text-sm sm:text-base text-[#5C5B56] leading-relaxed max-w-2xl font-normal">
                Explore curated promotions and luxury package experiences at Glow &amp; Glamour Hair Studio &amp; Spa. Book directly online at the guaranteed promotional rate.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#74695E] font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#8E6D38]" />
                  <span>Laxmi Nagar, Koregaon, Satara, Maharashtra</span>
                </span>
                {featuredCampaign && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5 text-[#8E6D38] font-semibold">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Active Campaign: {featuredCampaign.name}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SECTION B: FEATURED CAMPAIGN (Split Layout or Wide Banner) */}
          {featuredCampaign && (
            <div className="mt-8 mb-10">
              <div className="rounded-sm bg-[#222220] text-[#FAF8F5] overflow-hidden border border-[#3E3C38] shadow-md grid md:grid-cols-12 items-stretch">
                {featuredCampaign.bannerUrl && (
                  <div className="relative md:col-span-5 lg:col-span-5 h-56 md:h-auto min-h-[220px]">
                    <Image
                      src={featuredCampaign.bannerUrl}
                      alt={featuredCampaign.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 45vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                  </div>
                )}

                <div
                  className={`p-6 sm:p-8 lg:p-10 flex flex-col justify-between ${
                    featuredCampaign.bannerUrl
                      ? "md:col-span-7 lg:col-span-7"
                      : "md:col-span-12"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.25em] text-[#E8DFC8]">
                      <Sparkles className="h-3 w-3 text-[#C6A166]" />
                      <span>Featured Campaign</span>
                    </div>

                    <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                      {featuredCampaign.name}
                    </h2>

                    {featuredCampaign.description && (
                      <p className="text-xs sm:text-sm text-[#D8C7B0] leading-relaxed max-w-xl font-light">
                        {featuredCampaign.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-5 border-t border-[#3E3C38] flex flex-wrap items-center justify-between gap-4">
                    {featuredCampaign.endsAt && (
                      <div className="text-xs text-[#FAF8F5]/80 flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-[#C6A166]" />
                        <span>Valid through {formatDate(featuredCampaign.endsAt)}</span>
                      </div>
                    )}

                    <Link href="/treatments" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-[#8E6D38] hover:bg-[#785C2F] text-white text-xs font-semibold rounded-xs h-10 px-5 gap-2 cursor-pointer shadow-xs">
                        <span>Explore Salon Services</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION C: CATEGORY FILTERS */}
          <div className="mt-8 mb-8">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#E8E2D8]">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#74695E]">
                Browse by Category
              </div>
              <div className="text-xs text-[#74695E]">
                Showing {filteredOffers.length} {filteredOffers.length === 1 ? "offer" : "offers"}
              </div>
            </div>

            {/* Filter chips with responsive overflow wrapper */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
              {availableCategories.map((catKey) => {
                const label = CATEGORY_LABELS[catKey] || catKey;
                const isSelected = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                      isSelected
                        ? "bg-[#222220] text-[#FAF8F5] shadow-xs font-semibold"
                        : "bg-white text-[#5C5B56] border border-[#E8E2D8] hover:border-[#D8C7B0] hover:text-[#222220]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION D: OFFER CARDS GRID */}
          {!ready ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-96 rounded-sm border border-[#E8E2D8] bg-white p-6 space-y-4 animate-pulse"
                >
                  <div className="h-44 bg-[#FAF8F5] rounded-xs" />
                  <div className="h-4 bg-[#F2ECE4] w-1/3 rounded-xs" />
                  <div className="h-6 bg-[#F2ECE4] w-3/4 rounded-xs" />
                  <div className="h-10 bg-[#F2ECE4] w-full rounded-xs mt-6" />
                </div>
              ))}
            </div>
          ) : filteredOffers.length === 0 ? (
            /* Clean Empty State */
            <div className="text-center max-w-lg mx-auto py-16 px-6 bg-white border border-[#E8E2D8] rounded-sm shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF5EE] border border-[#E8DFC8] flex items-center justify-center mx-auto text-[#8E6D38]">
                <Tag className="w-5 h-5 text-[#8E6D38]" />
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#222220]">
                {selectedCategory === "all"
                  ? "No Active Offers Available"
                  : `No Offers in ${CATEGORY_LABELS[selectedCategory] || selectedCategory}`}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5B56] font-normal leading-relaxed max-w-sm mx-auto">
                Check back soon or explore our comprehensive menu of premium hair care, spa treatments, and skin therapy.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                {selectedCategory !== "all" && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory("all")}
                    className="text-xs font-semibold rounded-xs h-10 px-4 border-[#D8C7B0] text-[#222220] cursor-pointer"
                  >
                    View All Categories
                  </Button>
                )}
                <Link href="/treatments">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-xs font-semibold rounded-xs h-10 px-5 border-[#D8C7B0] text-[#222220] cursor-pointer"
                  >
                    Explore Services
                  </Button>
                </Link>
                <Link href="/book">
                  <Button className="w-full sm:w-auto bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold rounded-xs h-10 px-5 cursor-pointer">
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {filteredOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
