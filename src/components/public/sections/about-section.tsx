"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalonImage } from "@/components/ui/salon-image";

export function AboutSection() {
  const highlights = [
    {
      title: "Quality Hair Care",
      desc: "Carefully selected conditioning treatments and botanical hair products designed for healthy hair texture.",
    },
    {
      title: "Experienced Stylists",
      desc: "Every cut, styling, and color consultation is tailored to match your personal preferences and hair type.",
    },
    {
      title: "Relaxing Atmosphere",
      desc: "A clean, comfortable, and welcoming salon environment where you can unwind while we take care of your hair.",
    },
    {
      title: "Simple Online Booking",
      desc: "Fast appointment booking with transparent pricing, instant confirmation, and zero waiting room guesswork.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-[#FAF8F5] relative overflow-hidden border-b border-[#E8E2D8]">
      <div className="container px-4 md:px-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Photography Composition */}
          <div className="relative">
            <div className="relative rounded-xs overflow-hidden shadow-sm border border-[#E8E2D8] bg-white p-2">
              <SalonImage
                src="/images/About-Us.png"
                alt="Glow & Glamour salon interior with modern styling stations and illuminated mirrors in Laxmi Nagar, Koregaon"
                aspectRatio="4/3"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover object-center rounded-xs"
              />
              <div className="p-4 bg-white border-t border-[#E8E2D8]">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8E6D38] block">
                  HAIR STUDIO &amp; SPA
                </span>
                <p className="font-heading text-lg font-bold text-[#222220] mt-0.5">
                  Glow &amp; Glamour Hair Studio
                </p>
                <p className="text-xs text-[#666660] mt-1 font-light">
                  Laxmi Nagar, Koregaon
                </p>
              </div>
            </div>
          </div>

          {/* Philosophy Text */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold tracking-[0.25em] uppercase text-[#8E6D38]">
                ABOUT US
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.15] text-[#222220]">
                Care, Quality &amp; Personal Attention
              </h2>
              <p className="text-[#666660] text-sm sm:text-base leading-relaxed font-light">
                At Glow &amp; Glamour Hair Studio, we believe great hair starts with listening to your needs.
                Located in Koregaon, our salon provides women, men, and children with attentive service,
                skilled styling, and trusted treatments at clear, fair prices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {highlights.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xs bg-white border border-[#E8E2D8] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#FAF8F5] text-[#8E6D38] border border-[#D8C7B0]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <h4 className="font-heading text-sm font-bold text-[#222220]">{item.title}</h4>
                  </div>
                  <p className="text-xs text-[#666660] font-light leading-relaxed pl-6">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link href="/our-story">
                <Button
                  variant="outline"
                  className="rounded-xs text-xs uppercase tracking-[0.2em] px-7 py-5 font-semibold gap-2 border-[#D8C7B0] hover:border-[#222220] text-[#222220]"
                >
                  Learn More About Us <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
