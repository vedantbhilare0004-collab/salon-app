"use client";

import { useEffect, useState, useMemo } from "react";
import { BookingState } from "../booking-flow";
import { Appointment, Branch } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  Sun,
  Sunrise,
  Sunset,
  Sparkles,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { branchService } from "@/lib/services/branchService";
import { appointmentService } from "@/lib/services/appointmentService";
import { calculateTotalDuration, getAvailableSlots } from "@/lib/booking-utils";

interface Props {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_BRANCH: Branch = {
  id: "koregaon",
  name: "Koregaon",
  tagline: "Full-service beauty & unisex salon.",
  address: "Glow & Glamour Unisex Salon, Laxmi Nagar, Koregaon, Maharashtra - 415501",
  city: "Koregaon",
  phone: "+91 70582 39061",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Glow+and+Glamour+Koregaon",
  lat: 18.5362,
  lng: 73.8923,
  isOpen: true,
  availableChairs: 4,
  totalChairs: 6,
  openingTime: "09:30",
  closingTime: "21:00",
  averageServiceTime: 20,
  activeStaff: 4,
  workingHours: [
    { day: "Mon", open: "09:30", close: "21:00" },
    { day: "Tue", open: "09:30", close: "21:00" },
    { day: "Wed", open: "09:30", close: "21:00" },
    { day: "Thu", open: "09:30", close: "21:00" },
    { day: "Fri", open: "09:30", close: "21:00" },
    { day: "Sat", open: "09:00", close: "22:00" },
    { day: "Sun", open: "09:00", close: "20:00" },
  ],
};

const DEFAULT_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export function DateTimeSelection({ state, setState, onNext, onBack }: Props) {
  const [branch, setBranch] = useState<Branch>(DEFAULT_BRANCH);
  const [loading, setLoading] = useState(false);

  // Default to today or existing state
  const [selectedDate, setSelectedDate] = useState<string>(
    state.date ||
      (() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      })()
  );

  // On mobile: toggle between "date" and "time" views. Defaults to "date" unless user already has a time selected.
  const [mobileSubView, setMobileSubView] = useState<"date" | "time">(
    state.time ? "time" : "date"
  );

  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Fetch branch details
  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = branchService.onBranches((branches) => {
        const found = branches.find((b) => b.id === state.branchId);
        if (found) setBranch(found);
      });
    } catch {
      // Keep DEFAULT_BRANCH
    }
    return () => unsub?.();
  }, [state.branchId]);

  // Fetch appointments for the selected date
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setFetchingSlots(true);
      try {
        const apps = await appointmentService.getByDate(state.branchId, selectedDate);

        const durationMin = calculateTotalDuration(
          state.services.map((s) => s.id),
          state.services
        );

        const slots = getAvailableSlots(selectedDate, branch, apps, durationMin || 30);
        if (slots && slots.length > 0) {
          setAvailableSlots(slots);
        } else {
          setAvailableSlots(DEFAULT_SLOTS);
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
        setAvailableSlots(DEFAULT_SLOTS);
      } finally {
        setFetchingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, branch, state.branchId, state.services]);

  // Generate next 14 days
  const upcomingDates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      return {
        dateString: `${year}-${monthStr}-${dayStr}`,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" }),
        isToday: i === 0,
      };
    });
  }, []);

  // When a user selects a date on mobile: automatically transition to time selection!
  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
    if (state.time) {
      setState((prev) => ({ ...prev, date: dateString, time: "" }));
    } else {
      setState((prev) => ({ ...prev, date: dateString }));
    }
    // Automatically switch to Time Screen on mobile!
    setMobileSubView("time");
  };

  const selectTime = (time: string) => {
    setState((prev) => ({ ...prev, date: selectedDate, time }));
  };

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    // Filter out invalid, empty, or malformed slot strings
    const cleanSlots = availableSlots
      .filter((slot) => typeof slot === "string" && slot.trim().length >= 4 && slot.includes(":"))
      .map((slot) => slot.trim())
      .sort((a, b) => a.localeCompare(b));

    cleanSlots.forEach((slot) => {
      const hour = parseInt(slot.split(":")[0], 10);
      if (isNaN(hour)) return;
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [availableSlots]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  const hasAnySlots =
    groupedSlots.morning.length > 0 ||
    groupedSlots.afternoon.length > 0 ||
    groupedSlots.evening.length > 0;

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0 overflow-hidden">
      {/* Step Header */}
      <div className="border-b border-[#E8E2D8] pb-2.5 sm:pb-3.5">
        <h2 className="font-heading text-lg sm:text-2xl font-bold text-[#222220]">
          {mobileSubView === "date" ? "Select Appointment Date" : "Select Time Slot"}
        </h2>
        <p className="text-xs sm:text-base text-[#5C5B56] mt-0.5">
          {mobileSubView === "date"
            ? "Tap any date to automatically view available appointment slots."
            : `Choose your preferred time for ${new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}.`}
        </p>
      </div>

      {/* VIEW A: Date Selection Area (Shown on Mobile when mobileSubView === 'date', Always visible on Desktop lg:) */}
      <div className={mobileSubView === "time" ? "hidden lg:block space-y-2.5 w-full max-w-full min-w-0" : "space-y-2.5 w-full max-w-full min-w-0"}>
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#222220]">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-[#8E6D38]" />
            <span>Select Date</span>
          </div>
          <span className="text-xs font-medium text-[#5C5B56]">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Compact Date Grid on Mobile (4 cols) & Horizontal Ribbon on Desktop */}
        <div className="grid grid-cols-4 sm:grid-cols-7 lg:flex lg:overflow-x-auto lg:gap-2 gap-1.5 sm:gap-2 lg:pb-1.5 lg:no-scrollbar lg:-mx-1 lg:px-1 w-full max-w-full min-w-0">
          {upcomingDates.map((d) => {
            const isSelected = selectedDate === d.dateString;
            return (
              <button
                key={d.dateString}
                type="button"
                onClick={() => handleDateSelect(d.dateString)}
                className={`flex flex-col items-center justify-center rounded-sm border py-2 px-1 sm:px-2 transition-all min-h-[54px] sm:min-h-[64px] lg:min-w-[68px] lg:shrink-0 cursor-pointer active:scale-95 ${
                  isSelected
                    ? "border-[#222220] bg-[#222220] text-white shadow-xs"
                    : "border-[#E8E2D8] bg-white hover:border-[#8E6D38]/60 hover:bg-[#FAF8F5] text-neutral-800"
                }`}
              >
                <span
                  className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center w-full truncate ${
                    isSelected ? "text-[#E5D3B3]" : "text-[#5C5B56]"
                  }`}
                >
                  {d.isToday ? "Today" : d.dayName}
                </span>
                <span className="text-base sm:text-lg font-bold leading-tight my-0.5">
                  {d.dayNumber}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] uppercase font-medium text-center w-full truncate ${
                    isSelected ? "text-neutral-300" : "text-[#5C5B56]"
                  }`}
                >
                  {d.month}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Date Screen: Back navigation */}
        <div className="lg:hidden flex items-center justify-between gap-3 pt-3 border-t border-[#E8E2D8]">
          <Button
            variant="outline"
            onClick={onBack}
            className="rounded-sm text-xs font-semibold h-10 px-4 border-[#D8C7B0] text-[#222220]"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span>Specialist</span>
          </Button>
          <Button
            onClick={() => setMobileSubView("time")}
            className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold rounded-sm h-10 px-4 cursor-pointer"
          >
            <span>View Times</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* VIEW B: Time Slots Area (Shown on Mobile when mobileSubView === 'time', Always visible on Desktop lg:) */}
      <div className={mobileSubView === "date" ? "hidden lg:block space-y-3 w-full max-w-full min-w-0" : "space-y-3 w-full max-w-full min-w-0"}>
        {/* Mobile Sub-Header: Back to Dates & Active Date Context */}
        <div className="lg:hidden flex items-center justify-between pb-2 border-b border-[#E8E2D8]">
          <button
            type="button"
            onClick={() => setMobileSubView("date")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8E6D38] hover:text-[#222220] py-1 px-2 -ml-1 rounded-sm hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Change Date</span>
          </button>
          <span className="text-xs font-bold text-[#222220] flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 rounded-sm border border-[#E8E2D8]">
            <CalendarIcon className="h-3.5 w-3.5 text-[#8E6D38]" />
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Desktop Header for Time Slots */}
        <div className="hidden lg:flex items-center justify-between text-sm font-semibold text-[#222220]">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#8E6D38]" />
            <span>Available Appointments</span>
          </div>
          {state.time && (
            <span className="text-xs font-semibold text-[#8E6D38] flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Selected: {state.time}
            </span>
          )}
        </div>

        {/* Time Slots Area - Seamless on Mobile, Framed on Desktop */}
        <div className="max-h-[340px] sm:max-h-[380px] overflow-y-auto overflow-x-hidden border-0 sm:border sm:border-[#E8E2D8] rounded-sm p-0 sm:p-3 bg-transparent sm:bg-[#FAF8F5] space-y-3.5 w-full max-w-full min-w-0">
          {fetchingSlots ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#8E6D38]" />
            </div>
          ) : !hasAnySlots ? (
            <div className="py-8 text-center text-xs sm:text-sm text-[#5C5B56]">
              No available appointment slots for this date. Please choose another date above.
            </div>
          ) : (
            <>
              {/* Morning */}
              {groupedSlots.morning.length > 0 && (
                <div className="space-y-1.5 w-full">
                  <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#5C5B56] flex items-center gap-1.5">
                    <Sunrise className="h-3.5 w-3.5 text-amber-600" /> Morning
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 w-full max-w-full">
                    {groupedSlots.morning.map((slot) => {
                      const isSelected = state.time === slot && state.date === selectedDate;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => selectTime(slot)}
                          className={`w-full rounded-sm border py-2.5 px-1 min-h-[40px] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                            isSelected
                              ? "bg-[#222220] text-white border-[#222220] shadow-xs font-bold"
                              : "bg-white border-[#E8E2D8] hover:border-[#8E6D38] hover:bg-[#FAF8F5] text-[#222220]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Afternoon */}
              {groupedSlots.afternoon.length > 0 && (
                <div className="space-y-1.5 w-full">
                  <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#5C5B56] flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-600" /> Afternoon
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 w-full max-w-full">
                    {groupedSlots.afternoon.map((slot) => {
                      const isSelected = state.time === slot && state.date === selectedDate;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => selectTime(slot)}
                          className={`w-full rounded-sm border py-2.5 px-1 min-h-[40px] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                            isSelected
                              ? "bg-[#222220] text-white border-[#222220] shadow-xs font-bold"
                              : "bg-white border-[#E8E2D8] hover:border-[#8E6D38] hover:bg-[#FAF8F5] text-[#222220]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Evening */}
              {groupedSlots.evening.length > 0 && (
                <div className="space-y-1.5 w-full">
                  <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#5C5B56] flex items-center gap-1.5">
                    <Sunset className="h-3.5 w-3.5 text-indigo-600" /> Evening
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 w-full max-w-full">
                    {groupedSlots.evening.map((slot) => {
                      const isSelected = state.time === slot && state.date === selectedDate;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => selectTime(slot)}
                          className={`w-full rounded-sm border py-2.5 px-1 min-h-[40px] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                            isSelected
                              ? "bg-[#222220] text-white border-[#222220] shadow-xs font-bold"
                              : "bg-white border-[#E8E2D8] hover:border-[#8E6D38] hover:bg-[#FAF8F5] text-[#222220]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>


        {/* Action Footer for Desktop (Hidden on mobile where unified sticky bottom bar is used) */}
        <div className="hidden lg:flex items-center justify-between gap-2.5 pt-3 border-t border-[#E8E2D8]">
          <Button
            variant="outline"
            onClick={onBack}
            className="rounded-sm text-xs sm:text-sm font-semibold h-10 px-4 border-[#D8C7B0] text-[#222220]"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span>Specialist</span>
          </Button>
          <Button
            onClick={onNext}
            disabled={!state.date || !state.time}
            className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs sm:text-sm font-semibold rounded-sm h-10 px-5 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Continue to Details</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
