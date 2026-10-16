"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";

interface Props {
  isOpen: boolean;
  customerName?: string;
}

const STATUS_STEPS = [
  "Securing your appointment slot...",
  "Generating your official PDF boarding pass...",
  "Sending confirmation to your email...",
  "Almost ready, redirecting to your ticket...",
];

export function BookingConfirmationLoader({ isOpen, customerName }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < STATUS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="booking-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-[#FAF8F5]/95 backdrop-blur-md select-none"
      >
        <div className="relative flex flex-col items-center max-w-sm w-full mx-auto text-center px-4">
          {/* Ambient Gold Glow Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C5A880]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Premium Multi-Layered Spinner Graphic */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
            {/* Outer Static Subtle Track */}
            <div className="absolute inset-0 rounded-full border-2 border-[#E8E2D8]" />

            {/* Main Outer Champagne Orbiting Spinner */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#8E6D38] border-r-[#C5A880] animate-spin"
              style={{ animationDuration: "1.4s" }}
            />

            {/* Inner Counter-Rotating Golden Ring */}
            <div
              className="absolute inset-2.5 rounded-full border-2 border-transparent border-b-[#8E6D38] border-l-[#D4B996] animate-spin"
              style={{ animationDuration: "2.1s", animationDirection: "reverse" }}
            />

            {/* Soft Central Badge Container */}
            <div className="relative w-12 h-12 rounded-full bg-white shadow-xs border border-[#E8E2D8] flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[#8E6D38] animate-pulse" />
            </div>
          </div>

          {/* Salon Wordmark */}
          <div className="space-y-1 mb-2">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#8E6D38] block">
              GLOW &amp; GLAMOUR HAIR STUDIO
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#222220]">
              Confirming Your Visit
            </h3>
            {customerName && (
              <p className="text-xs text-[#5C5B56] font-medium">
                For {customerName}
              </p>
            )}
          </div>

          {/* Animated Status Step Pill */}
          <div className="min-h-[44px] flex items-center justify-center my-2">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-xs sm:text-sm text-[#5C5B56] font-medium"
            >
              {STATUS_STEPS[stepIndex]}
            </motion.p>
          </div>

          {/* Luxury Progress Bar */}
          <div className="w-48 sm:w-56 h-1.5 bg-[#E8E2D8] rounded-full overflow-hidden mt-1 mb-4 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-[#8E6D38] via-[#C5A880] to-[#222220] rounded-full"
              initial={{ width: "15%" }}
              animate={{
                width:
                  stepIndex === 0
                    ? "35%"
                    : stepIndex === 1
                    ? "65%"
                    : stepIndex === 2
                    ? "88%"
                    : "98%",
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          {/* Reassurance Footer */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#8E8D88] mt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#8E6D38]" />
            <span>Secured reservation · Please do not refresh</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
