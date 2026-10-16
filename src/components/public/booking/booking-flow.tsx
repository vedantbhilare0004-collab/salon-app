"use client";

import { useState, useEffect } from "react";
import { ServiceSelection } from "./steps/service-selection";
import { StaffSelection } from "./steps/staff-selection";
import { DateTimeSelection } from "./steps/date-time-selection";
import { DetailsForm } from "./steps/details-form";
import { BranchId, Service, User } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/format";
import { userService } from "@/lib/services/userService";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  ShieldCheck,
  QrCode,
  X,
  ChevronRight,
  ArrowLeft,
  Check,
  Loader2,
  LayoutDashboard,
  MonitorDot,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser, useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { BookingConfirmationLoader } from "./booking-confirmation-loader";

export type BookingState = {
  branchId: BranchId;
  services: Service[];
  staffId: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customer: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  offerId?: string;
  offerTitle?: string;
  offerPrice?: number;
  offerOriginalPrice?: number;
  originalPrice?: number;
  complimentaryServices?: string[];
};

const STEPS = [
  { id: "services", title: "Services", subtitle: "Select services" },
  { id: "staff", title: "Stylist", subtitle: "Choose stylist" },
  { id: "slot", title: "Date & Time", subtitle: "Pick schedule" },
  { id: "details", title: "Your Details", subtitle: "Contact info" },
];

export function BookingFlow() {
  const searchParams = useSearchParams();
  const offerParamId = searchParams?.get("offerId");
  const { offers, services: catalogueServices } = useData();

  const [currentStep, setCurrentStep] = useState(0);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = useCurrentUser();

  const [state, setState] = useState<BookingState>({
    branchId: "koregaon",
    services: [],
    staffId: "any",
    date: "",
    time: "",
    customer: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  // Automatically apply offer when offerId query param is present
  useEffect(() => {
    if (!offerParamId || offers.length === 0) return;
    const matched = offers.find((o) => o.id === offerParamId && o.active !== false);
    if (!matched) return;

    // Check expiry
    if (matched.endsAt) {
      const exp = new Date(`${matched.endsAt}T23:59:59`).getTime();
      if (!isNaN(exp) && Date.now() > exp) return;
    }

    // Resolve included services if defined
    let matchedServices: Service[] = [];
    if (matched.serviceIds && matched.serviceIds.length > 0 && catalogueServices.length > 0) {
      matchedServices = catalogueServices.filter((s) => matched.serviceIds?.includes(s.id));
    }

    // If no matching catalogue services found, create an inclusion package service item
    if (matchedServices.length === 0) {
      matchedServices = [
        {
          id: `pkg-${matched.id}`,
          name: matched.title,
          category: matched.category || "Packages",
          price: matched.price || 0,
          durationMin: 60,
          description: matched.description,
          branchId: "koregaon",
          active: true,
        },
      ];
    }

    setState((prev) => ({
      ...prev,
      services: matchedServices,
      offerId: matched.id,
      offerTitle: matched.title,
      offerPrice: matched.price,
      offerOriginalPrice: matched.originalPrice,
      originalPrice: matched.originalPrice,
      complimentaryServices: matched.complimentaryServices,
    }));
  }, [offerParamId, offers, catalogueServices]);

  // Automatically prefill customer details when a user is logged in
  useEffect(() => {
    if (currentUser) {
      setState((prev) => ({
        ...prev,
        customer: {
          ...prev.customer,
          name: prev.customer.name || currentUser.fullName || "",
          email: prev.customer.email || currentUser.email || "",
          phone: prev.customer.phone || currentUser.phone || "",
        },
      }));
    }
  }, [currentUser]);

  // Fetch staff for summary resolution (only real staff added by owner)
  useEffect(() => {
    const unsub = userService.onUsers((users) => {
      const hasOwner = users.some((u) => u.role === "owner");
      if (!hasOwner) {
        setStaffList([]);
        return;
      }
      const activeStaff = users.filter(
        (u) => u.role === "staff" && u.active !== false
      );
      setStaffList(activeStaff);
    });
    return () => unsub();
  }, []);

  const canGoToStep = (targetIdx: number) => {
    if (targetIdx <= currentStep) return true;
    if (targetIdx === 1 && state.services.length > 0) return true;
    if (targetIdx === 2 && state.services.length > 0) return true;
    if (targetIdx === 3 && state.services.length > 0 && state.date && state.time) return true;
    return false;
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const removeService = (serviceId: string) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== serviceId),
    }));
  };

  const regularTotal = state.services.reduce((acc, s) => acc + (s.price || 0), 0);
  const totalPrice =
    state.offerPrice !== undefined && state.offerPrice !== null ? state.offerPrice : regularTotal;
  const totalMins = state.services.reduce(
    (acc, s) => acc + (s.durationMin || s.durationMinutes || 30),
    0
  );

  const selectedStaffMember = staffList.find((s) => s.id === state.staffId);
  const staffDisplayName =
    state.staffId === "any" || !state.staffId
      ? "Any Available Specialist (Fastest)"
      : selectedStaffMember?.fullName || "Selected Specialist";

  const formattedDate = state.date
    ? new Date(state.date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  // Owners cannot self-book client appointments — they manage salon operations from Reception & Owner Suite
  if (currentUser?.role === "owner") {
    return (
      <div className="max-w-xl mx-auto py-6 sm:py-10 px-2 sm:px-4 text-center">
        <div className="bg-white border border-[#E8E2D8] rounded-md p-6 sm:p-8 shadow-xs">
          <div className="h-14 w-14 rounded-full bg-[#FAF5EE] border border-[#E8DFC8] text-[#8E6D38] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-7 w-7 text-[#A27C48]" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#FAF5EE] text-[#8E6D38] border border-[#E8DFC8] mb-3">
            Salon Owner Mode Active
          </span>

          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#222220] tracking-tight mb-2">
            Client Booking Is Restricted for Owners
          </h2>

          <p className="text-xs sm:text-sm text-[#5C5B56] leading-relaxed max-w-md mx-auto mb-6">
            You are currently signed in as the Salon Owner (<span className="font-semibold text-[#222220]">{currentUser.fullName}</span>). Owners cannot book appointments as customers. Please use Reception Mode or the Owner Operations Suite to schedule client appointments, manage walk-ins, and view today&apos;s queues.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link href="/owner-reception" className="w-full sm:w-auto">
              <Button className="w-full bg-[#8E6D38] hover:bg-[#785C2F] text-[#FAF8F5] text-xs font-semibold rounded-sm h-10 px-5 gap-2 cursor-pointer shadow-xs">
                <MonitorDot className="h-4 w-4" />
                <span>Open Reception Mode</span>
              </Button>
            </Link>

            <Link href="/owner" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-[#D8C7B0] hover:bg-[#F5EFEB] text-[#222220] text-xs font-semibold rounded-sm h-10 px-5 gap-2 cursor-pointer">
                <LayoutDashboard className="h-4 w-4 text-[#8E6D38]" />
                <span>Owner Dashboard</span>
              </Button>
            </Link>

            <Link href="/" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full text-[#5C5B56] hover:text-[#222220] hover:bg-[#F0EBE3] text-xs font-medium rounded-sm h-10 px-4 cursor-pointer">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-32 lg:pb-0 w-full max-w-full min-w-0">
      {/* 2-Column Split Console Grid */}
      <div className="grid lg:grid-cols-12 gap-5 items-start w-full max-w-full min-w-0">
        {/* Left Column: Stepper & Active Step Viewport (Col 7 / 12) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-3 w-full max-w-full min-w-0">
          {/* Active Promotional Offer Banner */}
          {state.offerId && (
            <div className="bg-[#FAF5EE] border border-[#E8DFC8] rounded-sm p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-4 w-4 text-[#8E6D38] shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-[#222220] block sm:inline truncate">
                    Package: {state.offerTitle}
                  </span>
                  <span className="text-[#8E6D38] font-bold sm:ml-2">
                    {formatPrice(totalPrice)}
                  </span>
                  {state.offerOriginalPrice && state.offerOriginalPrice > totalPrice && (
                    <span className="text-[#74695E] line-through ml-2">
                      {formatPrice(state.offerOriginalPrice)}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setState((prev) => ({
                    ...prev,
                    offerId: undefined,
                    offerTitle: undefined,
                    offerPrice: undefined,
                    offerOriginalPrice: undefined,
                    complimentaryServices: undefined,
                  }));
                }}
                className="text-[#8E6D38] hover:text-[#222220] underline text-[11px] font-medium shrink-0 cursor-pointer"
              >
                Remove Offer
              </button>
            </div>
          )}

          {/* Mobile Dedicated Compact Stepper Header (lg:hidden) */}
          <div className="lg:hidden bg-white border border-[#E8E2D8] rounded-sm p-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="h-6 px-2.5 rounded-full bg-[#E5D3B3] text-[#222220] text-xs font-bold flex items-center justify-center">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
                <span className="font-heading text-sm font-bold text-[#222220]">
                  {STEPS[currentStep].title}
                </span>
              </div>
              <span className="text-xs text-[#5C5B56] font-medium">
                {STEPS[currentStep].subtitle}
              </span>
            </div>
            {/* 4-segment progress bar */}
            <div className="grid grid-cols-4 gap-1.5">
              {STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                const isEligible = canGoToStep(idx);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (isEligible) setCurrentStep(idx);
                    }}
                    disabled={!isEligible}
                    aria-label={`Go to ${step.title}`}
                    className={`h-1.5 rounded-full transition-all ${
                      isActive
                        ? "bg-[#222220]"
                        : isCompleted
                        ? "bg-[#8E6D38]"
                        : "bg-[#E8E2D8]"
                    } ${isEligible ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Desktop Stepper Header (hidden lg:block) */}
          <div className="hidden lg:block bg-white border border-[#E8E2D8] rounded-sm p-2.5 sm:p-3.5 shadow-2xs">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                const isEligible = canGoToStep(idx);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (isEligible) setCurrentStep(idx);
                    }}
                    className={`text-left p-2 rounded-sm transition-all relative ${
                      isActive
                        ? "bg-[#222220] text-white shadow-2xs cursor-default"
                        : isEligible
                        ? "hover:bg-neutral-100 text-neutral-800 cursor-pointer"
                        : "text-muted-foreground/40 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className={`h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                          isActive
                            ? "bg-[#E5D3B3] text-[#222220]"
                            : isCompleted
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                      </div>
                      <span className="font-heading text-xs sm:text-sm font-semibold truncate block">
                        {step.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Panel */}
          <div className="bg-white border border-[#E8E2D8] rounded-sm p-3 sm:p-6 shadow-xs relative min-h-[380px] sm:min-h-[480px] flex flex-col justify-between w-full max-w-full min-w-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full max-w-full min-w-0"
              >
                {currentStep === 0 && (
                  <ServiceSelection
                    state={state}
                    setState={setState}
                    onNext={nextStep}
                  />
                )}
                {currentStep === 1 && (
                  <StaffSelection
                    state={state}
                    setState={setState}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                {currentStep === 2 && (
                  <DateTimeSelection
                    state={state}
                    setState={setState}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                {currentStep === 3 && (
                  <DetailsForm
                    state={state}
                    setState={setState}
                    onBack={prevStep}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    currentUser={currentUser}
                    staffDisplayName={staffDisplayName}
                    totalPrice={totalPrice}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Sticky Appointment Summary on Desktop (hidden lg:block Col 5 / 12) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 space-y-3">
          <div className="bg-white border border-[#E8E2D8] rounded-sm p-5 sm:p-6 shadow-xs space-y-4">
            {/* Docket Header */}
            <div className="border-b border-[#E8E2D8] pb-3.5 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1 text-xs uppercase font-bold tracking-wider text-[#8E6D38]">
                  <span>Appointment Summary</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-[#222220] leading-tight mt-1">
                  Glow &amp; Glamour Hair Studio
                </h3>
                <p className="text-sm text-[#5C5B56] flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-[#8E6D38] shrink-0" />
                  <span>Laxmi Nagar, Koregaon, Maharashtra</span>
                </p>
              </div>
            </div>

            {/* Selected Services Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm sm:text-base font-semibold text-[#222220]">
                <span>Selected Services ({state.services.length})</span>
                {state.services.length > 0 && (
                  <span className="text-xs sm:text-sm font-medium text-[#5C5B56]">
                    {totalMins} mins total
                  </span>
                )}
              </div>

              {state.services.length === 0 ? (
                <div className="rounded-sm border border-dashed border-[#E8E2D8] p-4 text-center text-sm text-[#5C5B56] bg-[#FAF8F5]">
                  Select one or more services from the list to begin.
                </div>
              ) : (
                <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {state.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-sm bg-[#FAF8F5] border border-[#E8E2D8]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm sm:text-base text-[#222220] truncate">
                          {service.name}
                        </div>
                        <div className="text-xs sm:text-sm text-[#5C5B56] flex items-center gap-2 mt-0.5">
                          <span>{service.durationMin || service.durationMinutes || 30} mins</span>
                          <span>•</span>
                          <span className={state.offerId ? "line-through text-[#74695E]" : "font-bold text-[#222220]"}>
                            {formatPrice(service.price)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeService(service.id)}
                        className="h-6 w-6 rounded-xs flex items-center justify-center text-[#5C5B56] hover:bg-red-50 hover:text-red-700 transition-colors shrink-0"
                        title="Remove service"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Complimentary Services from Offer */}
              {state.complimentaryServices && state.complimentaryServices.length > 0 && (
                <div className="p-2.5 rounded-sm bg-[#FAF5EE] border border-[#E8DFC8] space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-[#8E6D38] flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-[#A27C48]" /> Complimentary Add-ons (Free)
                  </div>
                  <ul className="text-xs text-[#5C5B56] space-y-0.5">
                    {state.complimentaryServices.map((comp, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-[#8E6D38]" />
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Schedule & Stylist Details */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E8E2D8]">
              <div className="bg-[#FAF8F5] p-3 rounded-sm border border-[#E8E2D8]">
                <div className="text-xs uppercase tracking-wider font-semibold text-[#5C5B56] flex items-center gap-1.5">
                  <UserIcon className="h-3 w-3 text-[#8E6D38]" /> Stylist
                </div>
                <div className="font-heading text-sm sm:text-base font-bold text-[#222220] truncate mt-1">
                  {staffDisplayName}
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-sm border border-[#E8E2D8]">
                <div className="text-xs uppercase tracking-wider font-semibold text-[#5C5B56] flex items-center gap-1.5">
                  <CalendarIcon className="h-3 w-3 text-[#8E6D38]" /> Date &amp; Time
                </div>
                <div className="font-heading text-sm sm:text-base font-bold text-[#222220] truncate mt-1">
                  {formattedDate && state.time
                    ? `${formattedDate} · ${state.time}`
                    : "Not chosen yet"}
                </div>
              </div>
            </div>

            {/* Price Total Breakdown */}
            <div className="pt-2 border-t border-[#E8E2D8]">
              {state.offerPrice !== undefined && state.originalPrice && state.originalPrice > state.offerPrice && (
                <div className="flex items-center justify-between text-xs text-[#5C5B56] mb-1">
                  <span>Regular Standard Price</span>
                  <span className="line-through">{formatPrice(state.originalPrice)}</span>
                </div>
              )}
              {state.offerPrice !== undefined && state.originalPrice && state.originalPrice > state.offerPrice && (
                <div className="flex items-center justify-between text-xs font-semibold text-[#8E6D38] mb-2">
                  <span>Special Promotional Savings</span>
                  <span>- {formatPrice(state.originalPrice - state.offerPrice)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs sm:text-sm uppercase font-bold tracking-wider text-[#5C5B56]">
                    Total Amount
                  </div>
                  <div className="text-xs text-[#74695E] mt-0.5">
                    {state.offerId ? "Promotional package rate" : "Inclusive of all taxes & services"}
                  </div>
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-bold text-[#222220]">
                  {formatPrice(totalPrice)}
                </div>
              </div>
            </div>

            {/* Primary Action Button (Synchronized across all steps) */}
            <div className="space-y-2 pt-1">
              {currentStep === 0 && (
                <Button
                  id="btn-continue-specialist"
                  onClick={nextStep}
                  disabled={state.services.length === 0}
                  className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-sm sm:text-base font-semibold rounded-sm h-11 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Continue to Stylist</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}

              {currentStep === 1 && (
                <Button
                  id="btn-continue-datetime"
                  onClick={nextStep}
                  className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-sm sm:text-base font-semibold rounded-sm h-11 shadow-xs cursor-pointer"
                >
                  <span>Select Date &amp; Time</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  id="btn-continue-details"
                  onClick={nextStep}
                  disabled={!state.date || !state.time}
                  className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-sm sm:text-base font-semibold rounded-sm h-11 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Proceed to Your Details</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}

              {currentStep === 3 && (
                <Button
                  id="btn-confirm-booking"
                  type="button"
                  onClick={() => {
                    const form = document.getElementById("booking-form") as HTMLFormElement | null;
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                  disabled={
                    isSubmitting ||
                    !state.customer.name.trim() ||
                    !state.customer.phone.trim() ||
                    !state.customer.email.trim()
                  }
                  className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-sm sm:text-base font-semibold rounded-sm h-11 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#C5A880]" />
                      <span>Confirming Appointment...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4 text-[#C5A880]" />
                      <span>Confirm Appointment</span>
                    </span>
                  )}
                </Button>
              )}

              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="w-full py-2 text-center text-sm font-medium text-[#5C5B56] hover:text-[#222220] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Previous Step</span>
                </button>
              )}
            </div>

            {/* Reassurance Footer */}
            <div className="pt-2 border-t border-[#E8E2D8] flex items-center justify-around text-xs text-[#5C5B56] font-medium">
              <span className="flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-[#8E6D38]" /> Instant QR Pass
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#8E6D38]" /> Pay at Salon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar for Mobile Devices (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-[#E8E2D8] shadow-lg z-40 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-[#5C5B56] truncate">
            {currentStep === 0 && (
              <span>{state.services.length} {state.services.length === 1 ? "Service" : "Services"} Selected</span>
            )}
            {currentStep === 1 && (
              <span>{state.staffId === "any" || !state.staffId ? "Any Specialist" : (selectedStaffMember?.fullName || "Specialist")}</span>
            )}
            {currentStep === 2 && (
              <span>{formattedDate && state.time ? `${formattedDate} · ${state.time}` : "Pick Date & Time"}</span>
            )}
            {currentStep === 3 && (
              <span>Total Payable at Salon</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-base sm:text-lg font-bold text-[#222220]">
              {formatPrice(totalPrice)}
            </span>
            {state.offerPrice !== undefined && state.originalPrice && state.originalPrice > state.offerPrice && (
              <span className="text-xs text-[#74695E] line-through">
                {formatPrice(state.originalPrice)}
              </span>
            )}
            {state.offerId && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-[#FAF5EE] text-[#8E6D38] border border-[#E8DFC8]">
                Offer
              </span>
            )}
          </div>
        </div>

        {currentStep === 0 && (
          <Button
            onClick={nextStep}
            disabled={state.services.length === 0}
            className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs sm:text-sm font-semibold rounded-sm h-10 sm:h-11 px-4 sm:px-5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Stylist</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
        {currentStep === 1 && (
          <Button
            onClick={nextStep}
            className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs sm:text-sm font-semibold rounded-sm h-10 sm:h-11 px-4 sm:px-5 shrink-0 cursor-pointer"
          >
            <span>Date &amp; Time</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
        {currentStep === 2 && (
          <Button
            onClick={nextStep}
            disabled={!state.date || !state.time}
            className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs sm:text-sm font-semibold rounded-sm h-10 sm:h-11 px-4 sm:px-5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Details</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
        {currentStep === 3 && (
          <Button
            type="button"
            onClick={() => {
              const form = document.getElementById("booking-form") as HTMLFormElement | null;
              if (form) {
                form.requestSubmit();
              }
            }}
            disabled={
              isSubmitting ||
              !state.customer.name.trim() ||
              !state.customer.phone.trim() ||
              !state.customer.email.trim()
            }
            className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs sm:text-sm font-semibold rounded-sm h-10 sm:h-11 px-4 sm:px-5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C5A880]" />
                <span>Confirming...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span>Confirm</span>
                <Check className="h-3.5 w-3.5 text-[#C5A880]" />
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Cool & Premium Confirmation Loading Overlay */}
      <BookingConfirmationLoader
        isOpen={isSubmitting}
        customerName={state.customer.name}
      />
    </div>
  );
}
