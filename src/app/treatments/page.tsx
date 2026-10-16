"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  Scissors,
  Sparkles,
  MapPin,
} from "lucide-react";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Button } from "@/components/ui/button";
import { serviceService } from "@/lib/services/serviceService";
import { NEW_CATALOGUE } from "@/lib/catalogue-data";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/lib/types";

interface FeaturedServiceConfig {
  lookupName: string;
  lookupCategory: string;
  fallbackGender: "male" | "female" | "unisex";
  fallbackPrice: number;
  fallbackDuration: number;
  highlightNote: string;
  image?: string;
  imageAlt?: string;
  startingFrom?: boolean;
}

interface CategorySectionConfig {
  id: string;
  title: string;
  subtitle: string;
  viewAllHref: string;
  actualDbCategories: string[];
  featured: FeaturedServiceConfig[];
}

const CURATED_CATEGORIES: CategorySectionConfig[] = [
  {
    id: "haircuts-grooming",
    title: "Haircuts & Grooming",
    subtitle: "Precision cuts, bespoke texturing, and complete men's grooming in Koregaon.",
    viewAllHref: "/book?category=Haircuts%20%26%20Grooming",
    actualDbCategories: ["Female Haircut", "Male Haircut & Grooming"],
    featured: [
      {
        lookupName: "Layer Cut",
        lookupCategory: "Female Haircut",
        fallbackGender: "female",
        fallbackPrice: 450,
        fallbackDuration: 45,
        highlightNote: "Dimensional precision layering tailored to lighten dense hair and enhance natural facial contours.",
        image: "/images/haircut-grooming.webp",
        imageAlt: "Precision women's layer cut and texturing with scissors and comb at Glow & Glamour Koregaon",
      },
      {
        lookupName: "Haircut + Hairwash + Styling",
        lookupCategory: "Male Haircut & Grooming",
        fallbackGender: "male",
        fallbackPrice: 200,
        fallbackDuration: 40,
        highlightNote: "Complete men's precision scissor cut, invigorating shampoo wash, and blow-dry styling.",
        image: "/images/mens-grooming.webp",
        imageAlt: "Men's precision haircut, neck taper, and styling in salon chair",
      },
      {
        lookupName: "Butterfly Cut",
        lookupCategory: "Female Haircut",
        fallbackGender: "female",
        fallbackPrice: 450,
        fallbackDuration: 45,
        highlightNote: "Cascading feathered face-framing layers that create voluminous, buoyant movement.",
        image: "/images/haircut-grooming.webp",
        imageAlt: "Feathered cascading butterfly cut styling with scissors and comb",
      },
    ],
  },
  {
    id: "hair-spa-treatments",
    title: "Hair Spa & Treatments",
    subtitle: "Deep scalp hydration, restorative bond builders, and long-lasting frizz smoothing.",
    viewAllHref: "/book?category=Hair%20Spa%20%26%20Treatments",
    actualDbCategories: ["Hair Spa", "Treatment", "Other Hair & Skin Treatments"],
    featured: [
      {
        lookupName: "Botox",
        lookupCategory: "Treatment",
        fallbackGender: "unisex",
        fallbackPrice: 999,
        fallbackDuration: 60,
        startingFrom: true,
        highlightNote: "Intensive anti-aging hair filler rich in collagen and amino acids that reconstructs porous cuticles.",
        image: "/images/hair-spa.webp",
        imageAlt: "Deep restorative hair spa conditioning treatment at salon wash basin",
      },
      {
        lookupName: "Loreal (Amp)",
        lookupCategory: "Hair Spa",
        fallbackGender: "unisex",
        fallbackPrice: 499,
        fallbackDuration: 45,
        startingFrom: true,
        highlightNote: "Professional L'Oréal deep nourishing scalp massage and concentrated strand hydration.",
        image: "/images/hair-spa.webp",
        imageAlt: "L'Oréal botanical hair spa ritual and scalp hydration treatment",
      },
      {
        lookupName: "Keratin",
        lookupCategory: "Treatment",
        fallbackGender: "unisex",
        fallbackPrice: 999,
        fallbackDuration: 60,
        startingFrom: true,
        highlightNote: "Ultimate humidity-resistant keratin smoothing therapy for smooth, ultra-glossy manageability.",
        image: "/images/hair-spa.webp",
        imageAlt: "Intensive keratin smoothing treatment application for frizz-free hair",
      },
    ],
  },
  {
    id: "hair-colour",
    title: "Hair Colour",
    subtitle: "Rich multidimensional tones, complete grey coverage, and sun-kissed streak highlights.",
    viewAllHref: "/book?category=Hair%20Colour",
    actualDbCategories: ["Hair Colour"],
    featured: [
      {
        lookupName: "Loreal Glowbal",
        lookupCategory: "Hair Colour",
        fallbackGender: "unisex",
        fallbackPrice: 399,
        fallbackDuration: 60,
        startingFrom: true,
        highlightNote: "Radiant, high-shine all-over permanent hair color with complete grey coverage.",
        image: "/images/hair-colour.webp",
        imageAlt: "L'Oréal permanent global hair colour application with professional tint brush",
      },
      {
        lookupName: "High Light's 10/12 Stp",
        lookupCategory: "Hair Colour",
        fallbackGender: "female",
        fallbackPrice: 2160,
        fallbackDuration: 90,
        highlightNote: "Dimensional 10 to 12 streak foils creating luminous, sun-kissed reflection and movement.",
        image: "/images/hair-colour.webp",
        imageAlt: "Dimensional hair highlights and streak foil application",
      },
      {
        lookupName: "Root Touchup",
        lookupCategory: "Hair Colour",
        fallbackGender: "female",
        fallbackPrice: 1000,
        fallbackDuration: 45,
        highlightNote: "Seamless hairline and parting regrowth coverage matched precisely to your existing shade.",
        image: "/images/hair-colour.webp",
        imageAlt: "Precise hairline and parting root touchup with salon color brush",
      },
    ],
  },
  {
    id: "skin-care",
    title: "Skin Care",
    subtitle: "Advanced machine vortex facials, organic brightening, and pore-purifying clean ups.",
    viewAllHref: "/book?category=Skin%20Care",
    actualDbCategories: ["Facial", "Clean Up", "D-Tan", "Machine Treatment"],
    featured: [
      {
        lookupName: "Hydra Facial",
        lookupCategory: "Machine Treatment",
        fallbackGender: "unisex",
        fallbackPrice: 1499,
        fallbackDuration: 60,
        highlightNote: "Multi-stage vortex vacuum extraction, gentle exfoliation, and intense hyaluronic serum infusion.",
        image: "/images/facial-skincare.webp",
        imageAlt: "Hydra facial treatment and deep pore antioxidant serum infusion",
      },
      {
        lookupName: "03+ Bridal Facial Kit",
        lookupCategory: "Facial",
        fallbackGender: "unisex",
        fallbackPrice: 2199,
        fallbackDuration: 75,
        highlightNote: "High-performance whitening & oxygenating facial delivering instant luminous radiance.",
        image: "/images/facial-skincare.webp",
        imageAlt: "High-performance bridal facial and illuminating skin mask application",
      },
      {
        lookupName: "Advance Gold Clean Up",
        lookupCategory: "Clean Up",
        fallbackGender: "unisex",
        fallbackPrice: 450,
        fallbackDuration: 45,
        highlightNote: "Gentle dead-cell exfoliation, pore extraction, and a calming golden glow masque.",
        image: "/images/facial-skincare.webp",
        imageAlt: "Exfoliating gold cleanup facial mask with gentle brush application",
      },
    ],
  },
  {
    id: "waxing",
    title: "Waxing",
    subtitle: "Gentle Italian Rica lipo-soluble waxing and full-body rejuvenating polishing.",
    viewAllHref: "/book?category=Wax",
    actualDbCategories: ["Wax"],
    featured: [
      {
        lookupName: "Full Body Rica",
        lookupCategory: "Wax",
        fallbackGender: "unisex",
        fallbackPrice: 2000,
        fallbackDuration: 90,
        highlightNote: "Premium, virtually painless Italian Rica wax specifically formulated for delicate and sensitive skin.",
      },
      {
        lookupName: "Rica - Hand - Full Hand",
        lookupCategory: "Wax",
        fallbackGender: "unisex",
        fallbackPrice: 500,
        fallbackDuration: 30,
        highlightNote: "Smooth full-arm depilation finished with a calming botanical moisturizing lotion.",
      },
      {
        lookupName: "Full Body Polishing",
        lookupCategory: "Wax",
        fallbackGender: "unisex",
        fallbackPrice: 4000,
        fallbackDuration: 75,
        highlightNote: "Full-body walnut and botanical scrub buffing away dead surface cells for velvety soft skin.",
      },
    ],
  },
  {
    id: "hand-feet",
    title: "Hand and Feet",
    subtitle: "Therapeutic mineral foot soaks, callous buffing, and classic spa manicures.",
    viewAllHref: "/book?category=Hand%20%26%20Feet",
    actualDbCategories: ["Hand & Feet"],
    featured: [
      {
        lookupName: "Full Pedicure",
        lookupCategory: "Hand & Feet",
        fallbackGender: "unisex",
        fallbackPrice: 1500,
        fallbackDuration: 60,
        highlightNote: "Therapeutic warm herbal foot soak, intensive callous removal, salt scrub, and relaxing massage.",
        image: "/images/manicure-nailcare.webp",
        imageAlt: "Therapeutic pedicure foot soak, scrub, and foot care",
      },
      {
        lookupName: "Manicure",
        lookupCategory: "Hand & Feet",
        fallbackGender: "unisex",
        fallbackPrice: 500,
        fallbackDuration: 40,
        highlightNote: "Complete nail shaping, gentle cuticle detailing, dead-skin buffing, and hand cream massage.",
        image: "/images/manicure-nailcare.webp",
        imageAlt: "Deluxe manicure, nail shaping, and hand massage on soft towel",
      },
      {
        lookupName: "Foot Scrub",
        lookupCategory: "Hand & Feet",
        fallbackGender: "unisex",
        fallbackPrice: 200,
        fallbackDuration: 20,
        highlightNote: "Invigorating exfoliating scrub eliminating rough patches and restoring foot softness.",
        image: "/images/manicure-nailcare.webp",
        imageAlt: "Exfoliating botanical foot scrub and softening treatment",
      },
    ],
  },
];

export default function TreatmentsPage() {
  const [liveServices, setLiveServices] = useState<Service[]>([]);

  useEffect(() => {
    const unsub = serviceService.onServices((data) => {
      const active = data.filter((s) => (s.active || s.isActive) && !s.archived);
      if (active.length > 0) {
        setLiveServices(active);
      }
    });

    return () => unsub();
  }, []);

  // Compute live category service counts
  const categoryCounts = useMemo(() => {
    const source: { category: string }[] =
      liveServices.length > 0 ? liveServices : (NEW_CATALOGUE as { category: string }[]);
    const map: Record<string, number> = {};

    CURATED_CATEGORIES.forEach((cat) => {
      const count = source.filter((item) =>
        cat.actualDbCategories.some(
          (dbCat) => dbCat.toLowerCase() === (item.category || "").toLowerCase()
        )
      ).length;
      map[cat.id] = count;
    });

    return map;
  }, [liveServices]);

  // Lookup actual service item from live Firestore or fallback catalogue
  const resolveService = (cfg: FeaturedServiceConfig) => {
    const queryName = cfg.lookupName.toLowerCase().trim();
    const queryCat = cfg.lookupCategory.toLowerCase().trim();

    // Check live services first
    const foundLive = liveServices.find(
      (s) =>
        s.category?.toLowerCase().trim() === queryCat &&
        s.name.toLowerCase().trim().includes(queryName)
    );

    if (foundLive) {
      return {
        name: foundLive.name,
        category: foundLive.category,
        price: foundLive.price || cfg.fallbackPrice,
        durationMin: foundLive.durationMin || foundLive.durationMinutes || cfg.fallbackDuration,
        gender: (foundLive.gender || cfg.fallbackGender) as "male" | "female" | "unisex",
        highlightNote: cfg.highlightNote,
        image: cfg.image,
        imageAlt: cfg.imageAlt,
        startingFrom: cfg.startingFrom,
      };
    }

    // Fallback to NEW_CATALOGUE
    const foundCatalogue = NEW_CATALOGUE.find(
      (c) =>
        c.category.toLowerCase().trim() === queryCat &&
        c.name.toLowerCase().trim().includes(queryName)
    );

    return {
      name: foundCatalogue ? foundCatalogue.name : cfg.lookupName,
      category: foundCatalogue ? foundCatalogue.category : cfg.lookupCategory,
      price: foundCatalogue ? foundCatalogue.price : cfg.fallbackPrice,
      durationMin: foundCatalogue ? foundCatalogue.durationMin : cfg.fallbackDuration,
      gender: (foundCatalogue?.gender || cfg.fallbackGender) as "male" | "female" | "unisex",
      highlightNote: cfg.highlightNote,
      image: cfg.image,
      imageAlt: cfg.imageAlt,
      startingFrom: cfg.startingFrom,
    };
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] theme-customer flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          {/* 1. Concise Header: Reduced Vertical Padding */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DFC8] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#8E6D38]">
              <Sparkles className="w-3 h-3" />
              <span>HAIRCUTS, STYLING &amp; TREATMENTS</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#222220] tracking-tight">
              Our Services
            </h1>

            <p className="text-[#666660] text-xs sm:text-sm font-light leading-relaxed max-w-2xl mx-auto">
              Curated hair artistry, restorative scalp rituals, and premium skin therapies. Discover our featured signature treatments below, or browse the complete salon catalogue to book your appointment.
            </p>

            <div className="pt-1 flex items-center justify-center gap-2 text-xs text-[#8E6D38] font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Near ZP School, Laxmi Nagar, Koregaon · Open Daily: 9:30 AM – 9:00 PM</span>
            </div>
          </div>

          {/* 2. Fast Navigation Anchor Pills */}
          <div className="mb-10 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CURATED_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="px-3 py-1.5 rounded-xs bg-white border border-[#E8E2D8] hover:border-[#8E6D38] text-xs font-medium text-[#5C5B56] hover:text-[#222220] whitespace-nowrap transition-colors shadow-2xs"
              >
                {cat.title}
              </a>
            ))}
          </div>

          {/* 3. Category Sections: Curated 3 Featured Services per Category with Treatment Images */}
          <div className="space-y-12 sm:space-y-14">
            {CURATED_CATEGORIES.map((section) => {
              const totalCount = categoryCounts[section.id] || 0;

              return (
                <section key={section.id} id={section.id} className="scroll-mt-28 space-y-4">
                  {/* Category Header with Functional 'View all' link */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 pb-2.5 border-b border-[#E8E2D8]">
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#222220]">
                        {section.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#78716A] font-light mt-0.5">
                        {section.subtitle}
                      </p>
                    </div>

                    <Link
                      href={section.viewAllHref}
                      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#8E6D38] hover:text-[#222220] transition-colors shrink-0 py-1"
                    >
                      <span>View All ({totalCount})</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* 3 Featured Cards Grid (Desktop: 3 per row; Mobile: clean 1-col) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {section.featured.map((feat, idx) => {
                      const service = resolveService(feat);
                      const genderLabel =
                        service.gender === "female"
                          ? "Women"
                          : service.gender === "male"
                          ? "Men"
                          : "Unisex";

                      return (
                        <div
                          key={idx}
                          className="bg-white border border-[#E8E2D8] hover:border-[#C5A880]/70 rounded-xs overflow-hidden shadow-xs transition-all flex flex-col justify-between h-full group"
                        >
                          <div>
                            {/* Card Image Banner (when image available) */}
                            {service.image ? (
                              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF5EE]">
                                <img
                                  src={service.image}
                                  alt={service.imageAlt || service.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                                />
                                <div className="absolute top-2.5 left-2.5">
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-white/95 text-[#8E6D38] border border-[#E8DFC8] shadow-xs">
                                    {genderLabel}
                                  </span>
                                </div>
                              </div>
                            ) : null}

                            <div className="p-4 sm:p-5">
                              {/* Audience & Duration Top Tag when no image */}
                              {!service.image && (
                                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-[#FAF5EE] border border-[#E8DFC8] text-[#8E6D38]">
                                    {genderLabel}
                                  </span>

                                  <div className="flex items-center gap-1 text-[#78716A]">
                                    <Clock className="h-3 w-3 text-[#8E6D38]" />
                                    <span>{service.durationMin} mins</span>
                                  </div>
                                </div>
                              )}

                              {service.image && (
                                <div className="flex items-center gap-1 text-[#78716A] text-xs mb-1.5">
                                  <Clock className="h-3 w-3 text-[#8E6D38]" />
                                  <span>Approx. {service.durationMin} mins</span>
                                </div>
                              )}

                              {/* Service Title */}
                              <h3 className="font-heading text-base sm:text-lg font-bold text-[#222220] group-hover:text-[#8E6D38] transition-colors leading-snug line-clamp-1">
                                {service.name}
                              </h3>

                              {/* Service Summary Note */}
                              <p className="text-xs text-[#5C5B56] line-clamp-2 mt-1.5 leading-relaxed font-light">
                                {service.highlightNote}
                              </p>
                            </div>
                          </div>

                          {/* Price & Clear Booking Action */}
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 border-t border-[#F0EBE1] flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-[#78716A] block leading-tight">
                                {service.startingFrom ? "Starting at" : "Price"}
                              </span>
                              <span className="font-heading text-lg sm:text-xl font-bold text-[#222220] leading-none">
                                {formatPrice(service.price)}
                              </span>
                            </div>

                            <Link
                              href={`/book?category=${encodeURIComponent(service.category)}&service=${encodeURIComponent(service.name)}`}
                              className="shrink-0"
                            >
                              <Button
                                size="sm"
                                className="min-h-[38px] px-3.5 rounded-xs bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Scissors className="h-3.5 w-3.5 text-[#E5C378]" />
                                <span>Book</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {/* 4. Compact Bottom Call-To-Action Banner: Explore All 100+ Services */}
          <div className="mt-14 bg-white border border-[#E8E2D8] rounded-xs p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E6D38] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#8E6D38]" />
                COMPLETE SALON &amp; SPA MENU
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#222220]">
                Explore Our Complete Service Catalogue
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5B56] leading-relaxed font-light">
                Looking for specific beard trims, customized waxing zones, hair wash rituals, or bridal packages? Browse our complete 100+ treatment catalogue with live pricing and slot selection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <Link href="/book" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto min-h-[44px] px-7 rounded-xs bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold shadow-xs flex items-center justify-center gap-2">
                  <span>Explore All Services &amp; Prices</span>
                  <ArrowRight className="h-4 w-4 text-[#E5C378]" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
