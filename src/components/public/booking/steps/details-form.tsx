"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookingState } from "../booking-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ShieldCheck,
  QrCode,
  CreditCard,
  Sparkles,
  Mail,
  UserCheck,
  Check,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { appointmentService } from "@/lib/services/appointmentService";
import { generateRandomString } from "@/lib/booking-utils";
import { Appointment, User } from "@/lib/types";
import { formatPrice } from "@/lib/format";

interface Props {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  onBack: () => void;
  isSubmitting?: boolean;
  setIsSubmitting?: (val: boolean) => void;
  currentUser?: User | null;
  staffDisplayName?: string;
  totalPrice?: number;
}

export function DetailsForm({
  state,
  setState,
  onBack,
  isSubmitting,
  setIsSubmitting,
  currentUser,
  staffDisplayName,
  totalPrice = 0,
}: Props) {
  const router = useRouter();
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState("");

  const loading = isSubmitting !== undefined ? isSubmitting : internalLoading;

  // Auto-fill logged-in customer info if available
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
  }, [currentUser, setState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.customer.name.trim() || !state.customer.phone.trim()) {
      setError("Please provide your full name and phone number.");
      return;
    }

    if (!state.customer.email.trim() || !state.customer.email.includes("@")) {
      setError("Please enter a valid email address to receive your booking confirmation & PDF ticket.");
      return;
    }

    if (setIsSubmitting) {
      setIsSubmitting(true);
    } else {
      setInternalLoading(true);
    }
    setError("");

    try {
      // Call server booking endpoint with admin access & automated Brevo PDF dispatch
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: currentUser?.id || currentUser?.uid || "guest",
          customerName: state.customer.name.trim(),
          customerEmail: state.customer.email.trim(),
          customerPhone: state.customer.phone.trim(),
          customerUid: currentUser?.uid || undefined,
          customerRole: currentUser?.role || undefined,
          branchId: state.branchId,
          serviceIds: state.services.map((s) => s.id),
          services: state.services,
          staffId: state.staffId,
          staffName: staffDisplayName || "Any Available Specialist",
          date: state.date,
          time: state.time,
          priceAtBooking: totalPrice || state.services.reduce((acc, s) => acc + (s.price || 0), 0),
          notes: state.customer.notes || "",
          offerId: state.offerId,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to reserve appointment.");
      }

      // Redirect to confirmed booking success pass
      router.push(`/book/success/${result.reference}?token=${result.secureToken}`);
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to reserve appointment. Please verify details and try again.");
      if (setIsSubmitting) setIsSubmitting(false);
      setInternalLoading(false);
    }
  };

  const updateCustomer = (field: keyof BookingState["customer"], value: string) => {
    setState((prev) => ({
      ...prev,
      customer: { ...prev.customer, [field]: value },
    }));
  };

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="border-b border-[#E8E2D8] pb-3">
        <button
          type="button"
          onClick={onBack}
          className="lg:hidden inline-flex items-center gap-1 text-xs font-semibold text-[#8E6D38] hover:text-[#222220] py-1 px-2 -ml-2 rounded-sm mb-1 hover:bg-[#FAF8F5] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Change Date &amp; Time</span>
        </button>
        <h2 className="font-heading text-lg sm:text-2xl font-bold text-[#222220]">
          Guest Information &amp; Digital Ticket
        </h2>
        <p className="text-xs sm:text-sm text-[#5C5B56] mt-0.5">
          We will email your official Booking Confirmation and PDF Boarding Pass immediately.
        </p>
      </div>

      {/* Logged-In User Account Callout */}
      {currentUser && (
        <div className="p-2.5 rounded-sm bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[#8E6D38] shrink-0" />
            <div>
              <span className="font-semibold text-[#222220]">
                Logged in as {currentUser.fullName || "Guest"}
              </span>
              <span className="text-[#5C5B56] ml-2 hidden sm:inline">
                ({currentUser.email}) · Auto-filled
              </span>
            </div>
          </div>
        </div>
      )}

      <form id="booking-form" onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="rounded-sm bg-red-50 p-2.5 text-xs sm:text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* 2-Column Inputs for Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-[#222220]">
              Full Name *
            </Label>
            <Input
              id="name"
              value={state.customer.name}
              onChange={(e) => updateCustomer("name", e.target.value)}
              placeholder="e.g. Radhika Apte"
              required
              className="h-10 text-sm sm:text-base rounded-sm bg-[#FAF8F5] border-[#E8E2D8] text-[#222220] px-3 focus-visible:ring-[#8E6D38]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-[#222220]">
              Mobile / WhatsApp Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={state.customer.phone}
              onChange={(e) => updateCustomer("phone", e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="h-10 text-sm sm:text-base rounded-sm bg-[#FAF8F5] border-[#E8E2D8] text-[#222220] px-3 focus-visible:ring-[#8E6D38]"
            />
          </div>
        </div>

        {/* Email Address Input (Mandatory for Brevo PDF ticket dispatch) */}
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
            <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-[#222220] flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#8E6D38]" />
              Email Address *
            </Label>
            <span className="text-[11px] text-[#5C5B56]">
              PDF Ticket will be sent here
            </span>
          </div>
          <Input
            id="email"
            type="email"
            value={state.customer.email}
            onChange={(e) => updateCustomer("email", e.target.value)}
            placeholder="radhika@example.com"
            required
            className="h-10 text-sm sm:text-base rounded-sm bg-[#FAF8F5] border-[#E8E2D8] text-[#222220] px-3 focus-visible:ring-[#8E6D38]"
          />
        </div>

        {/* Special Requests */}
        <div className="space-y-1">
          <Label htmlFor="notes" className="text-xs sm:text-sm font-semibold text-[#222220]">
            Special Requests &amp; Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            value={state.customer.notes}
            onChange={(e) => updateCustomer("notes", e.target.value)}
            placeholder="Preferences, allergies, hair history, or specific requirements..."
            className="resize-none text-xs sm:text-sm rounded-sm bg-[#FAF8F5] border-[#E8E2D8] text-[#222220] p-2.5 focus-visible:ring-[#8E6D38]"
            rows={2}
          />
        </div>

        {/* Mobile Booking Summary Recap (lg:hidden) */}
        <div className="lg:hidden p-3 rounded-sm border border-[#E8E2D8] bg-[#FAF8F5] space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-[#8E6D38] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Reservation Summary
            </span>
            <span className="text-xs text-[#5C5B56] font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#8E6D38]" /> Koregaon
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[#5C5B56] shrink-0">Services ({state.services.length}):</span>
              <span className="font-semibold text-[#222220] text-right break-words">
                {state.services.map((s) => s.name).join(", ") || "No services selected"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#5C5B56] shrink-0">Specialist:</span>
              <span className="font-semibold text-[#222220] text-right truncate">
                {staffDisplayName || "Any Available Specialist"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#5C5B56] shrink-0">Schedule:</span>
              <span className="font-semibold text-[#222220] text-right">
                {state.date ? `${state.date} at ${state.time || "Pending"}` : "Pending"}
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-[#E8E2D8] pt-1.5">
            <div>
              <div className="text-xs uppercase font-bold text-[#5C5B56]">Total Amount</div>
              <div className="text-[10px] text-[#74695E]">Pay at salon upon completion</div>
            </div>
            <div className="font-heading text-lg font-bold text-[#222220]">
              {formatPrice(totalPrice)}
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E8E2D8] text-[11px] sm:text-xs text-[#5C5B56]">
          <div className="flex items-center gap-1.5 p-2 rounded-sm bg-white border border-[#E8E2D8]">
            <QrCode className="h-3.5 w-3.5 text-[#8E6D38] shrink-0" />
            <span className="truncate">Instant QR Pass</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-sm bg-white border border-[#E8E2D8]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#8E6D38] shrink-0" />
            <span className="truncate">Zero Fee Cancel</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-sm bg-white border border-[#E8E2D8]">
            <CreditCard className="h-3.5 w-3.5 text-[#8E6D38] shrink-0" />
            <span className="truncate">Pay at Salon</span>
          </div>
        </div>

        {/* Action Footer for Desktop only */}
        <div className="hidden lg:flex items-center justify-between gap-2.5 pt-3 border-t border-[#E8E2D8]">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="rounded-sm text-sm font-semibold h-11 px-5 border-[#D8C7B0] text-[#222220] cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span>Back to Date &amp; Time</span>
          </Button>
          <Button
            id="btn-form-submit"
            type="submit"
            disabled={
              loading ||
              !state.customer.name.trim() ||
              !state.customer.phone.trim() ||
              !state.customer.email.trim()
            }
            className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-sm font-semibold rounded-sm h-11 px-6 min-w-[170px] cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Confirming...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4 text-[#C5A880]" /> Confirm Appointment
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
