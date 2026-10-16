"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SalonImage } from "@/components/ui/salon-image";

const FEATURED_SERVICES = [
  {
    id: "haircuts-styling",
    name: "Precision Haircut & Styling",
    category: "Haircuts & Styling",
    description: "Expert texturing, precision scissor cuts, and personalized blow-dry styling tailored to your face shape.",
    duration: "40–45 mins",
    price: "From ₹250",
    image: "/images/haircut-grooming.webp",
    alt: "Precision hair cutting with scissors and comb at Glow & Glamour salon in Koregaon",
    bookUrl: "/book?category=Female%20Haircut",
  },
  {
    id: "hair-spa-treatment",
    name: "Botanical Hair Spa & Scalp Therapy",
    category: "Hair Spa",
    description: "Deep conditioning with concentrated oils, scalp massage, and steam compression to nourish roots and restore shine.",
    duration: "45–60 mins",
    price: "From ₹499",
    image: "/images/hair-spa.webp",
    alt: "Restorative botanical hair spa and deep conditioning wash at salon basin",
    bookUrl: "/book?category=Hair%20Spa",
  },
  {
    id: "hydra-glow-facial",
    name: "Hydra Facial & Skin Care",
    category: "Skin Care",
    description: "Gentle vacuum pore extraction, deep hydration, and radiance serum infusion for refreshed, glowing skin.",
    duration: "60–75 mins",
    price: "From ₹450",
    image: "/images/facial-skincare.webp",
    alt: "Gentle facial treatment and nourishing skin mask application",
    bookUrl: "/book?category=Skin%20Care",
  },
  {
    id: "hair-colour-highlights",
    name: "Hair Colour & Highlights",
    category: "Hair Colour",
    description: "L'Oréal permanent global color, root regrowth touchups, and sun-kissed streak balayage with brilliant shine.",
    duration: "45–90 mins",
    price: "From ₹399",
    image: "/images/hair-colour.webp",
    alt: "Professional hair color and dimensional highlights application with tint brush",
    bookUrl: "/book?category=Hair%20Colour",
  },
  {
    id: "manicure-nailcare",
    name: "Spa Manicure & Pedicure",
    category: "Hand & Feet",
    description: "Soothing botanical foot soaks, callous buffing, nail shaping, and relaxing hand and foot massages.",
    duration: "40–60 mins",
    price: "From ₹200",
    image: "/images/manicure-nailcare.webp",
    alt: "Deluxe manicure and hand care treatment with salon tools and soft towel",
    bookUrl: "/book?category=Hand%20%26%20Feet",
  },
  {
    id: "mens-grooming",
    name: "Men's Grooming & Beard Care",
    category: "Men's Grooming",
    description: "Precision haircuts, beard trims, razor lining, and revitalizing washes in a comfortable atmosphere.",
    duration: "20–40 mins",
    price: "From ₹70",
    image: "/images/mens-grooming.webp",
    alt: "Men's precision haircut, neck taper, and beard grooming in styling chair",
    bookUrl: "/book?category=Male%20Haircut%20%26%20Grooming",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white relative border-b border-[#E8E2D8]">
      <div className="container px-4 md:px-8 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-14 space-y-3">
          <div className="text-xs font-semibold tracking-[0.25em] uppercase text-[#8E6D38]">
            OUR SERVICES
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#222220]">
            Haircuts, Styling &amp; Treatments
          </h2>
          <p className="text-[#666660] text-sm sm:text-base max-w-2xl font-light leading-relaxed">
            From modern haircuts and dimensional color to deeply restorative hair spa and skin treatments,
            our experienced stylists help you look and feel your best at our Koregaon studio.
          </p>
        </div>

        {/* Featured Showcase Cards (2-row 3-col grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_SERVICES.map((service) => (
            <Card
              key={service.id}
              className="group h-full flex flex-col justify-between overflow-hidden border border-[#E8E2D8] bg-[#FAF8F5] rounded-sm shadow-xs hover:border-[#D8C7B0] transition-colors"
            >
              <div className="relative overflow-hidden bg-[#ECEAE4]">
                <SalonImage
                  src={service.image}
                  alt={service.alt}
                  aspectRatio="16/10"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-[#222220] border border-[#E8E2D8] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-sm shadow-xs">
                  {service.category}
                </div>
                <div className="absolute bottom-3 right-3 bg-[#222220] text-[#FAF8F5] text-sm sm:text-base font-bold px-3.5 py-1 rounded-sm shadow-xs">
                  {service.price}
                </div>
              </div>

              <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#222220]">
                    {service.name}
                  </h3>
                  <p className="text-sm text-[#5C5B56] line-clamp-3 leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-between">
                  <span className="text-sm text-[#5C5B56] font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#8E6D38]" />
                    {service.duration}
                  </span>
                  <Link
                    href={service.bookUrl}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#222220] hover:text-[#8E6D38] transition-colors"
                  >
                    Book Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All CTAs */}
        <div className="mt-14 text-center">
          <Link href="/treatments">
            <Button
              variant="outline"
              size="lg"
              className="rounded-sm border-[#D8C7B0] hover:border-[#222220] text-sm sm:text-base font-semibold px-8 py-5 text-[#222220]"
            >
              Explore All Services <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
