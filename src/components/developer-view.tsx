"use client";

import { Instagram, Linkedin, Globe, Mail, Phone, Code, Sparkles, Heart, Terminal, ArrowRight, MessageCircle } from "lucide-react";
import { PageHeader, Section } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/store";
import Link from "next/link";

export function DeveloperView() {
  const { currentUser } = useData();
  const isDev = currentUser?.role === "developer";

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader 
        title="Developer Sandbox & System Craft" 
        subtitle="Meet the developer behind Glow & Glamour Hair Studio" 
      />

      <Card className="flex flex-col items-center gap-3 p-8 text-center shadow-xs relative overflow-hidden rounded-md border border-[#E9E1D6] bg-[#FFFDFA]">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#F0EBE3] to-transparent"></div>
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#F0EBE3] text-[#A27C48] border-2 border-[#E9E1D6] shadow-xs">
          <Code className="h-9 w-9" />
        </div>
        <div className="relative z-10 space-y-1 mt-1">
          <h2 className="text-2xl font-semibold text-[#302A24]">Prathmesh Bhilare</h2>
          <p className="text-xs font-medium text-[#A27C48] flex items-center justify-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Software Developer & AI Engineer
          </p>
        </div>
        <p className="relative z-10 mt-3 text-xs sm:text-sm text-[#74695E] max-w-lg leading-relaxed">
          Glow &amp; Glamour Hair Studio was developed by Prathmesh Bhilare with a focus on creating a modern digital experience for salon management. The application combines appointment scheduling, live queue management, multi-branch support, and role-based dashboards into a responsive platform that is fast, reliable, and easy to use. Every feature has been designed to improve operational efficiency while providing a smooth experience for customers, staff, and owners.
        </p>

        {isDev && (
          <div className="relative z-10 mt-4">
            <Button asChild className="gap-2 bg-[#A27C48] hover:bg-[#876438] text-white font-medium text-xs rounded-md shadow-xs transition-colors">
              <Link href="/developer">
                <Terminal className="h-4 w-4" /> Open Developer Command Center <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Contact & Socials">
          <Card className="divide-y divide-[#E9E1D6] overflow-hidden rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
            <ContactLink 
              icon={Instagram} 
              label="Instagram" 
              value="@prathmeshbuilds" 
              href="https://www.instagram.com/prathmeshbuilds/?hl=en" 
            />
            <ContactLink 
              icon={Linkedin} 
              label="LinkedIn" 
              value="Prathmesh Bhilare" 
              href="https://www.linkedin.com/in/prathmesh-bhilare-a81159253/" 
            />
            <ContactLink 
              icon={Globe} 
              label="Portfolio" 
              value="View Portfolio" 
              href="https://prathmesh-portfolio.prathmeshbhilare52.workers.dev/" 
            />
            <ContactLink 
              icon={Phone} 
              label="Phone" 
              value="+91 9022536817" 
              href="tel:+919022536817" 
            />
            <ContactLink 
              icon={Mail} 
              label="Email" 
              value="prathmeshbhilare52@gmail.com" 
              href="mailto:prathmeshbhilare52@gmail.com" 
            />
          </Card>
        </Section>

        <div className="space-y-6">
          <Section title="Need Help?">
            <Card className="p-5 shadow-xs bg-[#F0EBE3]/40 border border-[#E9E1D6] rounded-md">
              <h3 className="font-semibold text-sm text-[#302A24] mb-1">Having trouble with the application?</h3>
              <p className="text-xs text-[#74695E] mb-4">
                Contact the developer for technical support or feature requests.
              </p>
              <Button className="w-full gap-2 rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] text-xs h-9 cursor-pointer" variant="outline" asChild>
                <a 
                  href="https://wa.me/919022536817?text=Hi%20Prathmesh%2C%20I%20need%20support%20with%20the%20Glow%20%26%20Glamour%20Salon%20app." 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> Get Support
                </a>
              </Button>
            </Card>
          </Section>

          <Section title="App Information">
            <Card className="divide-y divide-[#E9E1D6] overflow-hidden rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs text-xs">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-[#74695E]">Version</span>
                <span className="font-medium text-[#302A24] font-mono">v2.4.0 Pro</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-[#74695E]">Last Updated</span>
                <span className="font-medium text-[#302A24]">Oct 2026</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-[#74695E]">Build Status</span>
                <span className="font-medium text-[10px] font-mono bg-[#E0EBDD] text-[#355B3C] border border-[#C7DCC2] px-2 py-0.5 rounded-md">
                  STABLE (LATEST)
                </span>
              </div>
            </Card>
          </Section>
        </div>
      </div>

      <div className="text-center pt-8 pb-4 text-xs text-[#74695E]">
        <p className="flex items-center justify-center gap-1.5">
          Thank you for using <Heart className="h-3.5 w-3.5 text-[#A27C48] fill-[#A27C48]" />
        </p>
        <p className="font-medium text-[#302A24] mt-0.5">Glow & Glamour Hair Studio</p>
      </div>
    </div>
  );
}

function ContactLink({ 
  icon: Icon, 
  label, 
  value, 
  href 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  href: string;
}) {
  return (
    <a 
      href={href} 
      target={href !== "#" ? "_blank" : undefined}
      rel={href !== "#" ? "noopener noreferrer" : undefined}
      className="flex items-center justify-between px-5 py-3 hover:bg-[#F0EBE3]/40 transition-colors"
      onClick={(e) => {
        if (href === "#") e.preventDefault();
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F0EBE3] text-[#A27C48] border border-[#E9E1D6]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-[#302A24]">{label}</span>
      </div>
      <span className="text-xs text-[#74695E] truncate max-w-[50%]">{value}</span>
    </a>
  );
}
