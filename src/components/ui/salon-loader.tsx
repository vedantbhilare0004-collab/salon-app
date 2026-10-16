"use client";

import React from "react";

interface SalonFullScreenLoaderProps {
  message?: string;
  className?: string;
}

export function SalonFullScreenLoader({
  message,
  className = "",
}: SalonFullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Glow & Glamour Hair Studio"
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#FAF8F4] text-[#302D2A] select-none transition-opacity duration-300 ease-out pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] ${className}`}
    >
      <div className="flex flex-col items-center text-center px-6 max-w-sm -translate-y-2">
        {/* Approved GG Monogram Luxury Emblem */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-[0_12px_28px_-6px_rgba(48,45,42,0.12)] border border-[#E8E2D8] bg-[#141411] animate-luxury-monogram">
          <img
            src="/pwa-192x192.png"
            alt="Glow & Glamour Monogram"
            width={96}
            height={96}
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        </div>

        {/* Editorial Wordmark */}
        <div className="mt-5 space-y-1">
          <h2 className="font-heading text-lg sm:text-xl font-medium tracking-[0.2em] uppercase text-[#302D2A]">
            Glow &amp; Glamour
          </h2>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#8C827A] font-light">
            Hair Studio &amp; Spa · Koregaon
          </p>
        </div>

        {/* Minimalist Champagne-Gold Indicator Line */}
        <div className="mt-6 w-20 sm:w-24 h-[1.5px] bg-[#E8E2D8] rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-[#C6A166] to-transparent animate-luxury-line" />
        </div>

        {/* Optional discrete session status */}
        {message && (
          <p className="mt-4 text-[11px] text-[#8C827A] font-normal tracking-wide">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

interface SalonSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function SalonSpinner({
  size = "md",
  className = "",
  label = "Loading",
}: SalonSpinnerProps) {
  const sizeClass = {
    sm: "w-4 h-4 border-[1.5px]",
    md: "w-5 h-5 border-2",
    lg: "w-8 h-8 border-[2.5px]",
  }[size];

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <div
        className={`${sizeClass} rounded-full border-[#E8E2D8] border-t-[#C5A880] animate-spin motion-reduce:animate-none`}
        style={{ animationDuration: "0.8s" }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

interface SalonSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SalonSkeleton({ className = "", ...props }: SalonSkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#F0EFEB] rounded-xs ${className}`}
      {...props}
    />
  );
}
