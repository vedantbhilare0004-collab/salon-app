"use client";

import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-[#FAF8F5]">
      <div className="container px-4 md:px-8 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center mb-14 space-y-3">
          <div className="text-xs font-semibold tracking-[0.25em] uppercase text-[#8E6D38]">
            VISIT US
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#222220]">
            Location &amp; Opening Hours
          </h2>
          <p className="text-[#666660] text-sm max-w-xl font-light">
            Conveniently situated at Laxmi Nagar, Koregaon. Easily accessible with ample parking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Salon Location Card */}
          <div className="rounded-xs overflow-hidden bg-white border border-[#E8E2D8] p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8E6D38] block">
                SALON ADDRESS
              </span>
              <h3 className="font-heading text-2xl font-bold text-[#222220]">
                Glow &amp; Glamour Hair Studio &amp; Spa
              </h3>
              <p className="text-sm text-[#666660] leading-relaxed font-light">
                Near ZP School, Laxmi Nagar, Koregaon, Maharashtra 415501
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xs border border-[#E8E2D8] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#222220]">
                <Navigation className="h-4 w-4 text-[#8E6D38]" /> How to reach us
              </div>
              <p className="text-xs text-[#666660] font-light leading-relaxed">
                Located in Laxmi Nagar near ZP School and Kabara Hospital, Koregaon.
              </p>
            </div>

            <div className="pt-2">
              <Button asChild className="w-full sm:w-auto bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xs">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Glow+and+Glamour+Koregaon"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </div>

          {/* Details & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="h-full border border-[#E8E2D8] bg-white rounded-xs">
              <CardContent className="p-6 flex flex-col justify-between space-y-4">
                <div className="w-10 h-10 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-center text-[#8E6D38]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-[#222220]">Opening Hours</h4>
                  <p className="text-[#666660] text-xs font-light mt-1.5 leading-relaxed">
                    Mon – Fri: 9:30 AM – 9:00 PM<br />
                    Saturday: 9:00 AM – 10:00 PM<br />
                    Sunday: 9:00 AM – 8:00 PM
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border border-[#E8E2D8] bg-white rounded-xs">
              <CardContent className="p-6 flex flex-col justify-between space-y-4">
                <div className="w-10 h-10 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-center text-[#8E6D38]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-[#222220]">Phone</h4>
                  <p className="text-[#666660] text-xs font-light mt-1">
                    Call or WhatsApp for appointments:
                  </p>
                  <a
                    href="tel:+917058239061"
                    className="font-bold text-sm text-[#222220] hover:text-[#8E6D38] transition-colors block mt-1"
                  >
                    +91 70582 39061
                  </a>
                </div>
              </CardContent>
            </Card>

            <div className="sm:col-span-2">
              <Card className="border border-[#E8E2D8] bg-white rounded-xs">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-center text-[#8E6D38] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#666660] uppercase tracking-wider font-semibold">
                      Email Inquiries
                    </p>
                    <a
                      href="mailto:glowglamour03@gmail.com"
                      className="font-medium text-sm text-[#222220] hover:text-[#8E6D38] transition-colors"
                    >
                      glowglamour03@gmail.com
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
