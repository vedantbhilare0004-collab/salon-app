"use client";

import Link from "next/link";
import { ArrowRight, Leaf, Compass, CalendarCheck, Star } from "lucide-react";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Button } from "@/components/ui/button";
import { SalonImage } from "@/components/ui/salon-image";

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] theme-customer flex flex-col">
      <PublicNavbar />

      <main className="flex-1 pt-28 pb-20">
        {/* Story Hero */}
        <section className="container mx-auto px-4 md:px-8 max-w-5xl text-center space-y-4 mb-16">
          <div className="text-xs font-semibold tracking-[0.25em] uppercase text-[#8E6D38]">
            ABOUT US
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-normal text-[#222220] leading-[1.15]">
            Our Story &amp; Philosophy
          </h1>
          <p className="text-[#666660] text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Glow &amp; Glamour Hair Studio was founded with a straightforward goal: to provide high-quality hair styling, honest consultations, and attentive care in Koregaon.
          </p>
        </section>

        {/* Full-Size Studio Showcase Banner */}
        <section className="container mx-auto px-4 md:px-8 max-w-5xl mb-10">
          <div className="relative w-full min-h-[460px] sm:min-h-[520px] md:min-h-[560px] rounded-xs overflow-hidden border border-[#E8E2D8] shadow-md bg-[#161513] flex items-end">
            {/* Background Image */}
            <img
              src="/images/About-Us.png"
              alt="Glow and Glamour Hair Studio interior in Koregaon"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="eager"
            />

            {/* Premium Gradient Overlays for Depth and Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/60 sm:via-50% sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Cool Premium Text Overlaid on Image */}
            <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-2xl space-y-4 text-left">
              {/* Glowing Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-[#D4AF37]/40 text-xs font-semibold uppercase tracking-widest text-[#E5C378] shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378] animate-pulse" />
                <span>HAIR STUDIO &amp; SPA · KOREGAON</span>
              </div>

              {/* Headline */}
              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white leading-tight drop-shadow-md">
                A Welcoming Space <br className="hidden sm:inline" />
                <span className="italic font-light text-[#E5C378]">in Koregaon</span>
              </h2>

              {/* Lead Text */}
              <p className="text-sm sm:text-base text-[#F0EBE1] font-light leading-relaxed drop-shadow-sm max-w-xl">
                Step inside our salon near ZP School and Kabara Hospital, and you will find a calm, clean atmosphere designed for your comfort. We value your time, and our appointments are organized so you never feel rushed.
              </p>

              {/* Cool Feature Pills on Image */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs text-white/95 font-medium shadow-xs">
                  <span className="text-[#E5C378]">✦</span> Calm, Unrushed Ambiance
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs text-white/95 font-medium shadow-xs">
                  <span className="text-[#E5C378]">✦</span> Honest 1-on-1 Consultations
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs text-white/95 font-medium shadow-xs">
                  <span className="text-[#E5C378]">✦</span> Laxmi Nagar, Koregaon
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative & Stylist Philosophy Card */}
        <section className="container mx-auto px-4 md:px-8 max-w-5xl mb-20">
          <div className="bg-white border border-[#E8E2D8] rounded-xs p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8E6D38]">
                DEDICATED STYLING
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#222220]">
                Every Appointment Starts with Listening
              </h3>
              <p className="text-sm sm:text-base text-[#5C5B56] leading-relaxed font-light">
                Our stylists take the time to listen before starting any cut, color, or treatment. We discuss your hair texture, lifestyle, and preferences so you leave feeling completely confident with your look.
              </p>
            </div>
            <Link href="/book" className="shrink-0">
              <Button className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xs px-6 py-5 shadow-xs transition-all">
                Book an Appointment
              </Button>
            </Link>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="bg-white py-16 border-y border-[#E8E2D8] mb-16">
          <div className="container mx-auto px-4 md:px-8 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#8E6D38]">
                HOW WE WORK
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-normal text-[#222220]">
                What Guides Our Service
              </h2>
              <p className="text-sm sm:text-base text-[#5C5B56] font-normal leading-relaxed">
                Four simple commitments behind every haircut, treatment, and client interaction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-sm bg-[#FAF8F5] border border-[#E8E2D8] space-y-3">
                <Leaf className="h-6 w-6 text-[#8E6D38]" />
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#222220]">Natural Care</h3>
                <p className="text-sm text-[#5C5B56] font-normal leading-relaxed">
                  We use trusted hair products, nourishing oils, and gentle scalp formulas free from harsh chemicals.
                </p>
              </div>

              <div className="p-6 rounded-sm bg-[#FAF8F5] border border-[#E8E2D8] space-y-3">
                <Compass className="h-6 w-6 text-[#8E6D38]" />
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#222220]">Personal Styling</h3>
                <p className="text-sm text-[#5C5B56] font-normal leading-relaxed">
                  Every haircut and hair color is customized to match your face shape, natural hair flow, and personal routine.
                </p>
              </div>

              <div className="p-6 rounded-sm bg-[#FAF8F5] border border-[#E8E2D8] space-y-3">
                <CalendarCheck className="h-6 w-6 text-[#8E6D38]" />
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#222220]">Easy Booking</h3>
                <p className="text-sm text-[#5C5B56] font-normal leading-relaxed">
                  Book online with clear pricing, instant confirmation, and simple appointment management anytime.
                </p>
              </div>

              <div className="p-6 rounded-sm bg-[#FAF8F5] border border-[#E8E2D8] space-y-3">
                <Star className="h-6 w-6 text-[#8E6D38]" />
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#222220]">Dedicated Care</h3>
                <p className="text-sm text-[#5C5B56] font-normal leading-relaxed">
                  One-on-one attention from skilled stylists who focus on healthy hair and genuine client relationships.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 md:px-8 max-w-3xl text-center space-y-5">
          <h2 className="font-heading text-3xl sm:text-4xl font-normal text-[#222220]">
            Visit Us in Koregaon
          </h2>
          <p className="text-base text-[#5C5B56] max-w-xl mx-auto font-normal leading-relaxed">
            Whether you need a quick haircut, a refreshing hair spa, or a complete style change, we look forward to welcoming you.
          </p>
          <div className="pt-2">
            <Link href="/book">
              <Button size="lg" className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-sm sm:text-base px-8 py-5 rounded-sm font-semibold">
                Book an Appointment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
