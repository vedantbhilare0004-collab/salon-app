import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { HeroSection } from "@/components/public/sections/hero-section";
import { OffersSection } from "@/components/public/sections/offers-section";
import { ServicesSection } from "@/components/public/sections/services-section";
import { AboutSection } from "@/components/public/sections/about-section";
import { ContactSection } from "@/components/public/sections/contact-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background theme-customer flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
        <HeroSection />
        <OffersSection />
        <ServicesSection />
        <AboutSection />
        <ContactSection />
      </main>

      <PublicFooter />
    </div>
  );
}
