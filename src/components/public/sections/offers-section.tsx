"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useData } from "@/lib/store";
import { OfferCard } from "@/components/public/offers/offer-card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Tag } from "lucide-react";

export function OffersSection() {
  const { offers, campaigns, ready } = useData();

  // Filter only eligible, active, unexpired offers
  const eligibleOffers = useMemo(() => {
    const now = Date.now();
    return offers.filter((o) => {
      if (o.active === false) return false;
      if (o.endsAt) {
        const exp = new Date(`${o.endsAt}T23:59:59`).getTime();
        if (!isNaN(exp) && exp < now) return false;
      }
      return true;
    });
  }, [offers]);

  // Find curated offers for home page (prioritize showOnHome or isFeatured)
  const homeOffers = useMemo(() => {
    const prioritized = eligibleOffers.filter((o) => o.showOnHome || o.isFeatured);
    const pool = prioritized.length > 0 ? prioritized : eligibleOffers;
    return pool.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99)).slice(0, 3);
  }, [eligibleOffers]);

  // Active campaign featured on home
  const featuredCampaign = useMemo(() => {
    return campaigns.find((c) => c.active !== false && (c.featureOnHome || c.isFeatured));
  }, [campaigns]);

  // If data is still loading or no eligible offers exist, omit section cleanly
  if (!ready || eligibleOffers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-[#F8F5EF] border-y border-[#E8E2D8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section Heading & View All Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DFC8] text-[#8E6D38] text-[11px] font-bold uppercase tracking-[0.2em]">
              <Sparkles className="h-3 w-3 text-[#A27C48]" />
              <span>Special Promotions</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#222220] tracking-tight">
              Curated Offers &amp; Packages
            </h2>

            <p className="text-sm sm:text-base text-[#5C5B56] font-normal leading-relaxed">
              Experience signature salon grooming, nourishing hair spa rituals, and festive packages at exclusive promotional rates in Koregaon.
            </p>
          </div>

          <Link href="/offers" className="shrink-0">
            <Button
              variant="outline"
              className="text-xs font-semibold uppercase tracking-wider rounded-xs h-11 px-5 border-[#D8C7B0] text-[#222220] hover:bg-white cursor-pointer gap-2"
            >
              <span>View All Offers</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Optional Active Campaign Mini Banner */}
        {featuredCampaign && featuredCampaign.bannerUrl && (
          <div className="mb-8 rounded-sm overflow-hidden bg-[#222220] text-[#FAF8F5] border border-[#3E3C38] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xs overflow-hidden shrink-0">
                <Image
                  src={featuredCampaign.bannerUrl}
                  alt={featuredCampaign.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C6A166] block">
                  Active Seasonal Campaign
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-white truncate">
                  {featuredCampaign.name}
                </h3>
                {featuredCampaign.description && (
                  <p className="text-xs text-[#D8C7B0] truncate max-w-md">
                    {featuredCampaign.description}
                  </p>
                )}
              </div>
            </div>

            <Link href="/offers" className="w-full sm:w-auto shrink-0">
              <Button
                size="sm"
                className="w-full sm:w-auto bg-[#8E6D38] hover:bg-[#785C2F] text-white text-xs font-semibold rounded-xs h-9 px-4 cursor-pointer"
              >
                Explore Campaign
              </Button>
            </Link>
          </div>
        )}

        {/* Featured Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {homeOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}
