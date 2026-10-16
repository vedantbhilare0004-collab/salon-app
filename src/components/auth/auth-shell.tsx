"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#121316] via-[#16181F] to-[#0D0E11] p-10 text-[#FAF8F5] lg:flex border-r border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1F2128] border border-[#C5A880]/40 font-heading text-xl font-bold text-[#E5D3B3]">
            G&amp;G
          </div>
          <div>
            <p className="font-heading text-xl font-semibold text-[#FAF8F5]">Glow &amp; Glamour</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C5A880]">Hair Studio</p>
          </div>
        </div>
        <div className="space-y-6">
          <Sparkles className="h-10 w-10 text-[#C5A880]" />
          <div className="space-y-3">
            <h2 className="font-heading text-4xl font-normal leading-tight text-[#FAF8F5]">
              Beauty, styled &amp; reserved beautifully.
            </h2>
            <p className="max-w-sm text-sm text-neutral-300 font-light">
              Experience seamless reservations, live queue management, and personalized styling care at our Koregaon salon studio.
            </p>
          </div>
        </div>
        <p className="text-xs text-neutral-400">Laxmi Nagar, Koregaon · Maharashtra - 415501</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-5 py-10 lg:w-1/2">
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-primary-foreground">
            G
          </div>
          <span className="font-display text-lg font-semibold">Glow &amp; Glamour</span>
        </Link>
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          <div className="text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
