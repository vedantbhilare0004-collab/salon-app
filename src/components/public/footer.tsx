import Link from "next/link";
import { Instagram, MapPin, Phone, Mail, Heart, Navigation, ExternalLink } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-[#F5EFEB] text-[#222220] border-t border-[#E8E2D8] pt-16 pb-10">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Introduction */}
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-[#8E6D38] block mb-1">
                HAIR STUDIO &amp; SPA
              </span>
              <h3 className="font-heading text-2xl font-bold text-[#222220]">
                Glow &amp; Glamour
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5B56] font-medium mt-0.5">
                Koregaon, Maharashtra
              </p>
            </div>
            <p className="text-[#5C5B56] text-sm leading-relaxed max-w-xs font-normal">
              Quality haircuts, hair treatments, and personal styling for everyone.
              Visit our hair studio in Koregaon or book an appointment online in minutes.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/glow_glamour_unisex_salone/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center text-[#5C5B56] hover:text-[#222220] hover:border-[#8E6D38] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-base font-semibold uppercase tracking-wider text-[#222220]">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm text-[#5C5B56]">
              <li>
                <Link href="/treatments" className="hover:text-[#8E6D38] transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/our-story" className="hover:text-[#8E6D38] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-[#8E6D38] transition-colors">
                  Special Offers
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-[#8E6D38] font-semibold text-[#222220] transition-colors">
                  Book an Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Salon Location */}
          <div className="space-y-4">
            <h4 className="font-heading text-base font-semibold uppercase tracking-wider text-[#222220]">
              Location
            </h4>
            <ul className="space-y-3 text-sm text-[#5C5B56]">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-[#8E6D38] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Near ZP School, Laxmi Nagar, Koregaon, Maharashtra 415501
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-[#8E6D38] shrink-0" />
                <a href="tel:+917058239061" className="hover:text-[#8E6D38] transition-colors font-medium">
                  +91 70582 39061
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={18} className="text-[#8E6D38] shrink-0" />
                <a
                  href="mailto:glowglamour03@gmail.com"
                  className="hover:text-[#8E6D38] transition-colors font-medium"
                >
                  glowglamour03@gmail.com
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Glow+and+Glamour+Koregaon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xs bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] border border-[#D8C7B0]/30 group"
                >
                  <Navigation className="h-3.5 w-3.5 text-[#E5C378] group-hover:rotate-45 transition-transform" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-3 w-3 text-[#E5C378]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Salon Hours */}
          <div className="space-y-4">
            <h4 className="font-heading text-base font-semibold uppercase tracking-wider text-[#222220]">
              Opening Hours
            </h4>
            <ul className="space-y-2 text-sm text-[#5C5B56]">
              <li className="flex items-center justify-between py-1 border-b border-[#E8E2D8]">
                <span>Monday – Friday</span>
                <span className="text-[#222220] font-semibold">9:30 AM – 9:00 PM</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-[#E8E2D8]">
                <span>Saturday</span>
                <span className="text-[#222220] font-semibold">9:00 AM – 10:00 PM</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span>Sunday</span>
                <span className="text-[#222220] font-semibold">9:00 AM – 8:00 PM</span>
              </li>
            </ul>
            <div className="p-3 bg-white rounded-sm border border-[#E8E2D8] text-xs sm:text-sm text-[#5C5B56]">
              Appointments recommended. Walk-ins welcomed based on stylist availability.
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="border-t border-[#E8E2D8] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#5C5B56]">
          <p>
            &copy; {new Date().getFullYear()} Glow &amp; Glamour Hair Studio &amp; Spa. All rights reserved.
          </p>
          <div className="flex items-center gap-2.5">
            <span className="text-[#5C5B56]">Message Developer:</span>
            <a
              href="https://wa.me/919022536817?text=Hi%20Prathmesh%2C%20I%20am%20reaching%20out%20from%20the%20Glow%20%26%20Glamour%20website."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#222220] hover:text-[#8E6D38] font-bold transition-colors"
              title="Message Prathmesh Bhilare on WhatsApp"
            >
              Prathmesh Bhilare
            </a>
            <a
              href="https://www.instagram.com/prathmeshbuilds/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white border border-[#E8E2D8] text-[#5C5B56] hover:text-[#E1306C] hover:border-[#E1306C]/40 hover:scale-105 transition-all shadow-2xs ml-0.5"
              title="Prathmesh Bhilare on Instagram (@prathmeshbuilds)"
              aria-label="Instagram @prathmeshbuilds"
            >
              <Instagram size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
