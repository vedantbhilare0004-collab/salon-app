"use client";

import { useMemo, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, Search, SlidersHorizontal, Calendar, X, Sparkles, Filter } from "lucide-react";
import { useData } from "@/lib/store";
import { type Appointment } from "@/lib/types";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { todayISO, formatDateLabel, addDaysISO } from "@/lib/format";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { CompactAppointmentCard } from "./components/compact-appointment-card";
import { AppointmentDetailPanel } from "./components/appointment-detail-panel";
import { ReceptionMode } from "@/components/shell/reception-mode";

type DateScope = "upcoming" | "today" | "all" | "custom";

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const isPM = timeStr.toLowerCase().includes("pm");
  const isAM = timeStr.toLowerCase().includes("am");
  const cleaned = timeStr.replace(/(am|pm)/gi, "").trim();
  const [hStr, mStr] = cleaned.split(":");
  let h = parseInt(hStr || "0", 10);
  const m = parseInt(mStr || "0", 10);
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + (isNaN(m) ? 0 : m);
}

function compareAppointments(a: Appointment, b: Appointment): number {
  if (a.date !== b.date) {
    return a.date.localeCompare(b.date);
  }
  return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
}

function OwnerAppointmentsContent() {
  const searchParams = useSearchParams();
  const { currentUser, activeBranchId, appointments, services } = useData();
  
  // Default tab to 'all' so both pending and completed are visible
  const [tab, setTab] = useState<string>("all");
  
  // Default date scope to "upcoming" (surfaces all future bookings on surface)
  const initialDate = searchParams.get("date");
  const [dateScope, setDateScope] = useState<DateScope>(initialDate ? "custom" : "upcoming");
  const [customDate, setCustomDate] = useState<string>(initialDate || todayISO());
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [isReception, setIsReception] = useState(false);

  const isSearching = searchQuery.trim().length > 0;

  // Search match function across booking ID / reference, customer name, phone, services, etc.
  const isMatch = useCallback(
    (a: Appointment, rawQuery: string) => {
      const q = rawQuery.trim().toLowerCase();
      if (!q) return true;

      const qClean = q.replace(/^#/, "");
      const qDigits = q.replace(/\D/g, "");

      // 1. Booking ID / Reference / Token
      if (a.reference && a.reference.toLowerCase().includes(qClean)) return true;
      if (a.id && a.id.toLowerCase().includes(qClean)) return true;
      if (a.token != null && a.token.toString() === qClean) return true;
      if (a.secureToken && a.secureToken.toLowerCase().includes(qClean)) return true;

      // 2. Customer Name & Details
      if (a.customerName && a.customerName.toLowerCase().includes(q)) return true;
      if (a.customerEmail && a.customerEmail.toLowerCase().includes(q)) return true;
      if (a.customerUid && a.customerUid.toLowerCase().includes(q)) return true;

      // 3. Customer Phone (both formatted string and clean digits)
      if (a.customerPhone) {
        if (a.customerPhone.toLowerCase().includes(q)) return true;
        if (qDigits.length >= 3) {
          const phoneDigits = a.customerPhone.replace(/\D/g, "");
          if (phoneDigits.includes(qDigits)) return true;
        }
      }

      // 4. Service names
      if (a.serviceIds && a.serviceIds.length > 0) {
        const hasService = a.serviceIds.some((sId) => {
          const s = services.find((x) => x.id === sId);
          return s && s.name.toLowerCase().includes(q);
        });
        if (hasService) return true;
      }

      return false;
    },
    [services]
  );

  // All salon branch appointments
  const branchAppointments = useMemo(() => {
    return appointments.filter((a) => a.branchId === activeBranchId);
  }, [appointments, activeBranchId]);

  // Base list of appointments depending on whether searching or date filter
  const baseList = useMemo(() => {
    // When searching, bypass date restriction completely to find ANY booking across all dates!
    if (isSearching) {
      return branchAppointments.filter((a) => isMatch(a, searchQuery));
    }

    // When not searching, apply the selected date scope
    const today = todayISO();
    if (dateScope === "upcoming") {
      // Surface all today and future bookings
      return branchAppointments.filter((a) => a.date >= today);
    }
    if (dateScope === "today") {
      return branchAppointments.filter((a) => a.date === today);
    }
    if (dateScope === "custom") {
      return branchAppointments.filter((a) => a.date === customDate);
    }
    // "all" dates
    return branchAppointments;
  }, [branchAppointments, isSearching, searchQuery, isMatch, dateScope, customDate]);

  // Tab counts based on baseList
  const counts = useMemo(() => {
    return {
      all: baseList.length,
      pending: baseList.filter((a) => !["completed", "cancelled", "rejected", "no_show"].includes(a.status)).length,
      completed: baseList.filter((a) => a.status === "completed").length,
      cancelled: baseList.filter((a) => ["cancelled", "rejected", "no_show"].includes(a.status)).length,
    };
  }, [baseList]);

  // Filtered by active tab and sorted chronologically
  const filteredList = useMemo(() => {
    return baseList
      .filter((a) => {
        if (tab === "all") return true;
        if (tab === "pending") return !["completed", "cancelled", "rejected", "no_show"].includes(a.status);
        if (tab === "completed") return a.status === "completed";
        if (tab === "cancelled") return ["cancelled", "rejected", "no_show"].includes(a.status);
        return true;
      })
      .sort(compareAppointments);
  }, [baseList, tab]);

  // Group by Date for display
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of filteredList) {
      const d = a.date || "No Date";
      const existing = map.get(d) || [];
      existing.push(a);
      map.set(d, existing);
    }
    return Array.from(map.entries()).map(([date, list]) => ({
      date,
      list,
    }));
  }, [filteredList]);

  const selectedAppt = appointments.find((a) => a.id === selectedApptId);

  // Subtitle generation based on current view
  const headerSubtitle = useMemo(() => {
    if (isSearching) {
      return `Search Results • ${filteredList.length} booking${filteredList.length === 1 ? "" : "s"} found matching "${searchQuery}"`;
    }
    if (dateScope === "upcoming") {
      return `All Upcoming Bookings • Today & Future`;
    }
    if (dateScope === "today") {
      return `Today's Schedule • ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}`;
    }
    if (dateScope === "all") {
      return `All Salon Bookings • Full History`;
    }
    const [y, m, d] = customDate.split("-").map(Number);
    const dateObj = !y || !m || !d ? new Date(customDate) : new Date(y, m - 1, d);
    return `Salon Schedule • ${dateObj.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}`;
  }, [isSearching, filteredList.length, searchQuery, dateScope, customDate]);

  if (!currentUser) return null;

  if (isReception) {
    return <ReceptionMode onExit={() => setIsReception(false)} />;
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col sm:h-[calc(100vh-theme(spacing.24))] lg:h-auto overflow-hidden lg:overflow-visible">
      {/* Header Area */}
      <div className="space-y-4 shrink-0 pb-4">
        <PageHeader
          title="Appointments &amp; Queue"
          subtitle={headerSubtitle}
          action={
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsReception(true)} className="gap-2 bg-[#A27C48] hover:bg-[#876438] text-[#FFFDFA] shadow-xs font-semibold h-10 px-4 rounded-md transition-colors">
                <SlidersHorizontal className="h-4 w-4" /> Live Reception
              </Button>
            </div>
          }
        />
        
        {/* Filters & Search Control Bar */}
        <div className="flex flex-col gap-3 bg-[#FFFDFA] p-3 rounded-md border border-[#E9E1D6] shadow-2xs">
          
          {/* Row 1: Status Tabs + Date Scope Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Tabs value={tab} onValueChange={setTab} className="overflow-x-auto no-scrollbar">
              <TabsList className="flex h-auto w-max min-w-full justify-start gap-1 p-1 bg-[#F0EBE3] rounded-md">
                <TabsTrigger 
                  value="all" 
                  className="rounded-md px-3.5 py-1.5 text-xs font-bold text-[#74695E] data-[state=active]:bg-[#302A24] data-[state=active]:text-[#FFFDFA] shadow-2xs transition-all"
                >
                  All ({counts.all})
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="rounded-md px-3.5 py-1.5 text-xs font-bold text-[#74695E] data-[state=active]:bg-[#A27C48] data-[state=active]:text-[#FFFDFA] shadow-2xs transition-all"
                >
                  Pending ({counts.pending})
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="rounded-md px-3.5 py-1.5 text-xs font-bold text-[#74695E] data-[state=active]:bg-[#355B3C] data-[state=active]:text-[#FFFDFA] shadow-2xs transition-all"
                >
                  Completed ({counts.completed})
                </TabsTrigger>
                <TabsTrigger 
                  value="cancelled" 
                  className="rounded-md px-3.5 py-1.5 text-xs font-bold text-[#74695E] data-[state=active]:bg-[#8C3930] data-[state=active]:text-[#FFFDFA] shadow-2xs transition-all"
                >
                  Cancelled ({counts.cancelled})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Quick Date Scope Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <Button
                type="button"
                size="sm"
                variant={dateScope === "upcoming" && !isSearching ? "default" : "outline"}
                onClick={() => setDateScope("upcoming")}
                className={cn(
                  "h-8 rounded-md text-xs font-semibold px-3 gap-1 shadow-2xs transition-colors",
                  dateScope === "upcoming" && !isSearching
                    ? "bg-[#302A24] text-[#FFFDFA] hover:bg-[#302A24]/90"
                    : "border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]"
                )}
              >
                <Sparkles className="h-3 w-3 text-[#A27C48]" /> All Upcoming
              </Button>
              <Button
                type="button"
                size="sm"
                variant={dateScope === "today" && !isSearching ? "default" : "outline"}
                onClick={() => setDateScope("today")}
                className={cn(
                  "h-8 rounded-md text-xs font-semibold px-3 transition-colors",
                  dateScope === "today" && !isSearching
                    ? "bg-[#302A24] text-[#FFFDFA] hover:bg-[#302A24]/90"
                    : "border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]"
                )}
              >
                Today
              </Button>
              <Button
                type="button"
                size="sm"
                variant={dateScope === "all" && !isSearching ? "default" : "outline"}
                onClick={() => setDateScope("all")}
                className={cn(
                  "h-8 rounded-md text-xs font-semibold px-3 transition-colors",
                  dateScope === "all" && !isSearching
                    ? "bg-[#302A24] text-[#FFFDFA] hover:bg-[#302A24]/90"
                    : "border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]"
                )}
              >
                All Dates
              </Button>
            </div>
          </div>

          {/* Row 2: Search by Booking ID & Customer + Date Picker */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-[#E9E1D6]">
            {/* Global Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#74695E]" />
              <Input
                placeholder="Search any booking by ID (e.g. #CKQPF4UY), name, phone, or service..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() && tab !== "all") {
                    setTab("all");
                  }
                }}
                className="pl-9 pr-8 h-9 rounded-md bg-[#FFFDFA] border-[#E9E1D6] text-sm font-medium text-[#302A24] placeholder:text-[#74695E] focus-visible:ring-[#A27C48]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-[#74695E] hover:text-[#302A24] p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Custom Date Picker & Reset */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <div className="relative flex-1 sm:w-auto">
                <Input
                  type="date"
                  value={dateScope === "custom" ? customDate : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setCustomDate(e.target.value);
                      setDateScope("custom");
                    } else {
                      setDateScope("upcoming");
                    }
                  }}
                  className="w-full sm:w-[150px] h-9 rounded-md bg-[#FFFDFA] border-[#E9E1D6] text-xs font-medium text-[#302A24] focus-visible:ring-[#A27C48]"
                  title="Select specific date"
                />
              </div>

              {(dateScope === "custom" || dateScope === "today" || dateScope === "all") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDateScope("upcoming")}
                  className="h-9 px-2.5 text-xs rounded-md gap-1 shrink-0 border-[#E9E1D6] bg-[#FFFDFA] text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3]"
                  title="Return to viewing all upcoming bookings"
                >
                  <X className="h-3.5 w-3.5" /> Upcoming
                </Button>
              )}
            </div>
          </div>

          {/* Active Search Notification Banner */}
          {isSearching && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-md bg-[#F0EBE3] border border-[#E9E1D6] text-xs text-[#302A24]">
              <span>
                Searching across <strong>all dates &amp; statuses</strong> for &ldquo;{searchQuery}&rdquo;
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="underline font-semibold text-[#A27C48] hover:text-[#876438] ml-2"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 gap-6">
        
        {/* Left Side: Master List */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#FFFDFA] rounded-md border border-[#E9E1D6] overflow-hidden">
          {/* Summary Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#E9E1D6] bg-[#F0EBE3]/60 shrink-0">
            <span className="text-sm font-semibold text-[#74695E]">
              {filteredList.length} {filteredList.length === 1 ? "Appointment" : "Appointments"} Found
            </span>
            {dateScope === "upcoming" && !isSearching && (
              <span className="text-xs text-[#74695E] font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#A27C48]" /> Showing Today &amp; All Future Bookings
              </span>
            )}
          </div>

          <ScrollArea className="flex-1 p-4">
            {filteredList.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <EmptyState
                  icon={CalendarCheck}
                  title="No appointments found"
                  description={
                    isSearching
                      ? `No bookings match "${searchQuery}". Check the booking ID or customer name.`
                      : dateScope === "today"
                      ? "No appointments scheduled for Today. Check All Upcoming to view future bookings."
                      : "No appointments match the current filter selection."
                  }
                  action={
                    isSearching ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="mt-3 rounded-md font-medium border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]"
                      >
                        Clear Search
                      </Button>
                    ) : dateScope !== "upcoming" ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setDateScope("upcoming");
                          setTab("all");
                        }}
                        className="mt-3 rounded-md font-medium gap-1.5 bg-[#A27C48] hover:bg-[#876438] text-[#FFFDFA]"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> View All Upcoming Bookings
                      </Button>
                    ) : tab !== "all" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTab("all")}
                        className="mt-3 rounded-md font-medium border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]"
                      >
                        View All Statuses
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <div className="space-y-6 pb-20 lg:pb-4">
                {groupedByDate.map(({ date, list }) => (
                  <div key={date} className="space-y-2.5">
                    {/* Sticky Date Group Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-[#FFFDFA]/95 backdrop-blur-md py-2 px-3 rounded-md border border-[#E9E1D6] shadow-2xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#A27C48]" />
                        <h3 className="font-bold text-sm text-[#302A24]">
                          {formatDateLabel(date)}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#F0EBE3] text-[#A27C48] border border-[#DDCFBA]">
                        {list.length} {list.length === 1 ? "booking" : "bookings"}
                      </span>
                    </div>

                    {/* Appointment Cards for this Date */}
                    <div className="grid gap-3 pt-1">
                      {list.map((a) => (
                        <CompactAppointmentCard
                          key={a.id}
                          appointment={a}
                          services={services}
                          isSelected={selectedApptId === a.id}
                          onClick={() => setSelectedApptId(a.id)}
                          onViewHistory={() => setSelectedApptId(a.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Side: Detail Panel (Desktop only) */}
        <div className="hidden lg:block w-[400px] xl:w-[450px] shrink-0 border border-[#E9E1D6] rounded-md overflow-hidden bg-[#FFFDFA] shadow-2xs">
          {selectedAppt ? (
            <AppointmentDetailPanel 
              appointment={selectedAppt}
              services={services}
              allAppointments={appointments}
              onClose={() => setSelectedApptId(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#74695E] bg-[#F0EBE3]/20 p-8 text-center">
              <CalendarCheck className="h-12 w-12 mb-4 text-[#A27C48]/40" />
              <p className="font-medium text-lg text-[#302A24]">Select an appointment</p>
              <p className="text-sm mt-1 text-[#74695E]">Choose an appointment from the queue to view its complete details and history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet for Detail Panel */}
      <Sheet open={!!selectedApptId && typeof window !== "undefined" && window.innerWidth < 1024} onOpenChange={(open) => !open && setSelectedApptId(null)}>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-xl sm:max-w-none">
          {selectedAppt && (
            <AppointmentDetailPanel 
              appointment={selectedAppt}
              services={services}
              allAppointments={appointments}
              onClose={() => setSelectedApptId(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function OwnerAppointments() {
  return (
    <Suspense fallback={null}>
      <OwnerAppointmentsContent />
    </Suspense>
  );
}
