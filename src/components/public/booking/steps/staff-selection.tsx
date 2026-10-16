"use client";

import { useEffect, useState } from "react";
import { BookingState } from "../booking-flow";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, Scissors, UserCheck, ChevronRight, ArrowLeft } from "lucide-react";
import { userService } from "@/lib/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  onNext: () => void;
  onBack: () => void;
}

export function StaffSelection({ state, setState, onNext, onBack }: Props) {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = userService.onUsers((users) => {
        // Only show staff if an owner exists in the system
        const hasOwner = users.some((u) => u.role === "owner");
        if (!hasOwner) {
          setStaff([]);
          setLoading(false);
          return;
        }

        // Only display real staff added by the owner
        const activeStaff = users.filter(
          (u) =>
            u.role === "staff" &&
            u.active !== false &&
            (!state.branchId || !u.staffBranch || u.staffBranch === state.branchId)
        );

        setStaff(activeStaff);
        setLoading(false);
      });
    } catch (err) {
      console.error("Error loading staff:", err);
      setStaff([]);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, [state.branchId]);

  const selectStaff = (staffId: string | null) => {
    setState((prev) => ({ ...prev, staffId }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

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
          <span>Change Services</span>
        </button>
        <h2 className="font-heading text-lg sm:text-2xl font-bold text-[#222220]">
          Select Your Specialist
        </h2>
        <p className="text-xs sm:text-sm text-[#5C5B56] mt-0.5">
          {staff.length > 0
            ? "Choose a preferred artist, or select \"Any Available Specialist\" for optimal scheduling."
            : "Select \"Any Available Specialist\" to proceed with your booking."}
        </p>
      </div>

      {/* Specialist Selection Grid */}
      <div className="max-h-[440px] sm:max-h-[520px] overflow-y-auto pr-1 grid gap-2.5 sm:grid-cols-2 border border-[#E8E2D8] rounded-sm p-2 sm:p-2.5 bg-[#FAF9F8]">
        {/* Any Available Option */}
        <button
          type="button"
          onClick={() => selectStaff("any")}
          className={`p-2.5 sm:p-3.5 rounded-sm border text-left transition-all flex items-center justify-between gap-3 sm:col-span-2 w-full min-h-[54px] sm:min-h-[60px] cursor-pointer ${
            state.staffId === "any" || !state.staffId
              ? "border-[#222220] bg-white shadow-xs ring-1 ring-[#222220]"
              : "border-[#E8E2D8] bg-white hover:border-[#8E6D38]/60 hover:bg-white"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#E5D3B3]/40 flex items-center justify-center text-[#8E6D38] shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-heading text-sm sm:text-base font-bold text-[#222220] break-words">
                Any Available Specialist
              </div>
              <div className="text-xs text-[#5C5B56] break-words mt-0.5">
                Recommended · First available on-duty salon stylist
              </div>
            </div>
          </div>

          <div
            className={`h-5 w-5 rounded-xs border flex items-center justify-center shrink-0 ${
              state.staffId === "any" || !state.staffId
                ? "bg-[#222220] border-[#222220] text-white"
                : "border-[#C5BCB0] text-transparent"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </div>
        </button>

        {/* If no staff have been added by an owner */}
        {staff.length === 0 && (
          <div className="sm:col-span-2 p-4 text-center text-xs sm:text-sm text-[#5C5B56] border border-dashed border-[#E8E2D8] rounded-sm bg-white">
            No specific specialists currently assigned. Your reservation will be automatically assigned to the on-duty salon team.
          </div>
        )}

        {/* Real Staff Members added by Owner */}
        {staff.map((member) => {
          const isSelected = state.staffId === member.id;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => selectStaff(member.id)}
              className={`p-2.5 sm:p-3.5 rounded-sm border text-left transition-all flex items-center justify-between gap-3 w-full min-h-[54px] sm:min-h-[60px] cursor-pointer ${
                isSelected
                  ? "border-[#222220] bg-white shadow-xs ring-1 ring-[#222220]"
                  : "border-[#E8E2D8] bg-white hover:border-[#8E6D38]/60 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-[#E8E2D8] shrink-0">
                  <AvatarImage src={member.photoURL} />
                  <AvatarFallback className="bg-[#E5D3B3]/40 text-[#8E6D38] text-xs font-bold">
                    {member.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-heading text-sm sm:text-base font-bold text-[#222220] break-words">
                    {member.fullName}
                  </div>
                  <div className="text-xs text-[#5C5B56] flex items-center gap-1.5 break-words mt-0.5">
                    <Scissors className="h-3 w-3 text-[#8E6D38] shrink-0" />
                    <span>{member.staffPosition || "Salon Stylist"}</span>
                  </div>
                </div>
              </div>

              <div
                className={`h-5 w-5 rounded-xs border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-[#222220] border-[#222220] text-white"
                    : "border-[#C5BCB0] text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Footer for Desktop only */}
      <div className="hidden lg:flex items-center justify-between gap-2.5 pt-3 border-t border-[#E8E2D8]">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-sm text-sm font-semibold h-11 px-5 border-[#D8C7B0] text-[#222220] cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          <span>Back to Services</span>
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-sm font-semibold rounded-sm h-11 px-6 cursor-pointer"
        >
          <span>Continue to Date &amp; Time</span>
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
