"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  QrCode,
  Download,
  Scissors,
  Phone,
  MessageCircle,
  Plus,
  ArrowRight,
  User,
  Search,
  X,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatTime, formatPrice } from "@/lib/format";
import { STATUS_LABELS, type Appointment, type Service } from "@/lib/types";
import { generateBookingTicketPdf } from "@/lib/ticketService";
import { toast } from "sonner";

type TabType = "upcoming" | "completed" | "cancelled";

const PAGE_SIZE = 8;

// Parse date safely without timezone offset shift
function parseAppointmentDate(dateStr?: string) {
  if (!dateStr || typeof dateStr !== "string") {
    return { month: "—", day: "—", weekday: "—", year: "—", formatted: "—" };
  }
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, monthIdx, day, 12, 0, 0);
    if (!isNaN(d.getTime())) {
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return {
        month: monthNames[monthIdx] || "—",
        day: day.toString(),
        weekday: dayNames[d.getDay()] || "—",
        year: year.toString(),
        formatted: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      };
    }
  }

  const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`);
  if (!isNaN(d.getTime())) {
    return {
      month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
      day: d.getDate().toString(),
      weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
      year: d.getFullYear().toString(),
      formatted: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
  }

  return { month: "—", day: "—", weekday: "—", year: "—", formatted: dateStr };
}

function getStatusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (["confirmed", "booked"].includes(s)) {
    return {
      label: "Confirmed",
      className: "bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-medium",
      dot: "bg-emerald-500",
    };
  }
  if (["checked_in", "in_service", "in progress"].includes(s)) {
    return {
      label: s === "in_service" || s === "in progress" ? "In Service" : "Checked In",
      className: "bg-sky-50 text-sky-800 border border-sky-200/90 font-medium",
      dot: "bg-sky-500",
    };
  }
  if (["pending"].includes(s)) {
    return {
      label: "Pending",
      className: "bg-amber-50 text-amber-800 border border-amber-200/90 font-medium",
      dot: "bg-amber-500",
    };
  }
  if (["completed"].includes(s)) {
    return {
      label: "Completed",
      className: "bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium",
      dot: "bg-neutral-400",
    };
  }
  if (["cancelled", "rejected", "no_show"].includes(s)) {
    return {
      label: s === "no_show" ? "No Show" : s === "rejected" ? "Declined" : "Cancelled",
      className: "bg-rose-50 text-rose-800 border border-rose-200/90 font-medium",
      dot: "bg-rose-500",
    };
  }
  return {
    label: (STATUS_LABELS as Record<string, string>)[status] || status,
    className: "bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium",
    dot: "bg-neutral-400",
  };
}

export default function CustomerBookingsPage() {
  const {
    currentUser,
    appointments,
    activeBranchId,
    getServicesFor,
    users,
    cancelAppointment,
  } = useData();

  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedQrAppt, setSelectedQrAppt] = useState<Appointment | null>(null);
  const [toCancelId, setToCancelId] = useState<string | null>(null);

  if (!currentUser) return null;

  const services = getServicesFor(activeBranchId);
  const firstName = (currentUser.fullName || "Guest").split(" ")[0];

  // 1. Filter user's bookings from real Firestore data
  const userAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.customerId === currentUser.id || a.customerUid === currentUser.uid
    );
  }, [appointments, currentUser]);

  // 2. Classify appointments by status & date rules
  const upcomingList = useMemo(() => {
    return userAppointments
      .filter((a) =>
        ["pending", "confirmed", "checked_in", "in_service", "Booked", "Confirmed", "In Progress", "Rescheduled"].includes(
          a.status
        )
      )
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)); // Nearest upcoming first
  }, [userAppointments]);

  const completedList = useMemo(() => {
    return userAppointments
      .filter((a) => ["completed", "Completed"].includes(a.status))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)); // Most recent first
  }, [userAppointments]);

  const cancelledList = useMemo(() => {
    return userAppointments
      .filter((a) => ["cancelled", "rejected", "no_show", "Cancelled", "No Show"].includes(a.status))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)); // Most recent first
  }, [userAppointments]);

  const counts = {
    upcoming: upcomingList.length,
    completed: completedList.length,
    cancelled: cancelledList.length,
  };

  // 3. Current active list filtered by search query
  const searchedList = useMemo(() => {
    let list = activeTab === "upcoming" ? upcomingList : activeTab === "completed" ? completedList : cancelledList;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) => {
        const apptServices = (a.serviceIds || [])
          .map((id) => services.find((s) => s.id === id)?.name || "")
          .join(" ")
          .toLowerCase();
        const ref = (a.reference || a.id || "").toLowerCase();
        const staff = (
          users.find((u) => u.id === a.assignedStaffId || u.uid === a.assignedStaffId)?.fullName || ""
        ).toLowerCase();
        const date = (a.date || "").toLowerCase();
        return apptServices.includes(q) || ref.includes(q) || staff.includes(q) || date.includes(q);
      });
    }
    return list;
  }, [activeTab, upcomingList, completedList, cancelledList, searchQuery, services, users]);

  // 4. Paginated slice for efficient rendering of large histories
  const visibleAppointments = searchedList.slice(0, visibleCount);

  // Tab switch handler
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setVisibleCount(PAGE_SIZE);
  };

  // PDF Download Handler
  const handleDownloadTicket = async (appt: Appointment, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setDownloadingId(appt.id);
      const apptServices = (appt.serviceIds || [])
        .map((id) => services.find((s) => s.id === id))
        .filter(Boolean) as Service[];

      const staff = users.find(
        (u) => u.id === appt.assignedStaffId || u.uid === appt.assignedStaffId
      );

      const { doc } = await generateBookingTicketPdf({
        appointment: appt,
        customerName: appt.customerName || currentUser.fullName,
        customerPhone: appt.customerPhone || currentUser.phone,
        services: apptServices,
        staffName: staff?.fullName,
      });

      doc.save(`Ticket-${appt.reference || appt.id}.pdf`);
      toast.success("Boarding pass downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Could not generate PDF ticket");
    } finally {
      setDownloadingId(null);
    }
  };

  // Cancellation Execution
  const confirmCancelAppointment = async () => {
    if (!toCancelId) return;
    try {
      await cancelAppointment(toCancelId);
      toast.success("Appointment cancelled successfully");
    } catch (err) {
      console.error("Cancellation error:", err);
      toast.error("Could not cancel appointment");
    } finally {
      setToCancelId(null);
    }
  };

  const apptToCancel = appointments.find((a) => a.id === toCancelId);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Bar: Title, Welcome Greeting & Book Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8E6D38]">
            Customer Portal · Koregaon
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-[#222220] tracking-tight mt-0.5">
            My Bookings
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5B56] mt-1 font-light">
            Welcome back, <strong className="font-medium text-[#222220]">{firstName}</strong>. View your appointments and digital check-in passes.
          </p>
        </div>

        <Link href="/book" className="shrink-0 w-full sm:w-auto">
          <Button className="w-full sm:w-auto min-h-[44px] px-6 rounded-xs bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Plus className="h-4 w-4 text-[#E5C378]" />
            <span>Book Appointment</span>
          </Button>
        </Link>
      </div>

      {/* 2. Controls: Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs with Dynamic Real-Data Counts */}
        <div className="inline-flex p-1 bg-[#F5EFE6] border border-[#E8DFC8] rounded-xs gap-1 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handleTabChange("upcoming")}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              activeTab === "upcoming"
                ? "bg-[#222220] text-[#FAF8F5] shadow-xs"
                : "text-[#5C5B56] hover:text-[#222220] hover:bg-[#EFE7D8]/60"
            }`}
          >
            <span>Upcoming</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "upcoming" ? "bg-[#8E6D38] text-white" : "bg-[#E5DCCB] text-[#5C5B56]"
              }`}
            >
              {counts.upcoming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("completed")}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              activeTab === "completed"
                ? "bg-[#222220] text-[#FAF8F5] shadow-xs"
                : "text-[#5C5B56] hover:text-[#222220] hover:bg-[#EFE7D8]/60"
            }`}
          >
            <span>Completed</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "completed" ? "bg-[#8E6D38] text-white" : "bg-[#E5DCCB] text-[#5C5B56]"
              }`}
            >
              {counts.completed}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("cancelled")}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              activeTab === "cancelled"
                ? "bg-[#222220] text-[#FAF8F5] shadow-xs"
                : "text-[#5C5B56] hover:text-[#222220] hover:bg-[#EFE7D8]/60"
            }`}
          >
            <span>Cancelled</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "cancelled" ? "bg-[#8E6D38] text-white" : "bg-[#E5DCCB] text-[#5C5B56]"
              }`}
            >
              {counts.cancelled}
            </span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E6D38]" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search service, stylist, or #ref..."
            className="pl-9 pr-8 h-10 text-xs bg-white border-[#E8E2D8] rounded-xs focus-visible:ring-1 focus-visible:ring-[#8E6D38] text-[#222220] placeholder:text-[#9C9488]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setVisibleCount(PAGE_SIZE);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Appointment List: Compact, Elegant Cards Grid */}
      {visibleAppointments.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-xs bg-white border border-[#E8E2D8] shadow-xs space-y-4 max-w-xl mx-auto my-6">
          <div className="h-14 w-14 rounded-full bg-[#FAF5EE] border border-[#E8DFC8] flex items-center justify-center mx-auto text-[#8E6D38]">
            <CalendarCheck className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#222220]">
              {searchQuery
                ? `No appointments found matching "${searchQuery}"`
                : activeTab === "upcoming"
                ? "No upcoming appointments scheduled"
                : activeTab === "completed"
                ? "No completed visits on record"
                : "No cancelled appointments"}
            </h3>
            <p className="text-[#5C5B56] text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto">
              {searchQuery
                ? "Check your spelling or search by treatment name, date, or booking reference code."
                : activeTab === "upcoming"
                ? "You don't have any appointments booked right now. Ready for your next haircut, hair spa, or facial in Koregaon?"
                : activeTab === "completed"
                ? "When you visit our studio in Koregaon, your completed treatment passes will appear here."
                : "All your appointments are in good standing without any cancellations."}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {searchQuery ? (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="text-xs uppercase tracking-wider font-semibold h-10 px-5 rounded-xs border-[#E8E2D8] text-[#222220]"
              >
                Clear Search Filter
              </Button>
            ) : (
              <>
                <Link href="/treatments">
                  <Button
                    variant="outline"
                    className="text-xs uppercase tracking-wider font-semibold h-10 px-5 rounded-xs border-[#E8E2D8] text-[#222220] hover:bg-[#FAF8F5]"
                  >
                    Our Services
                  </Button>
                </Link>
                <Link href="/book">
                  <Button className="bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold h-10 px-6 rounded-xs shadow-xs flex items-center gap-1.5">
                    <span>Book Appointment</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#E5C378]" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visibleAppointments.map((appt) => {
              const apptServices = (appt.serviceIds || [])
                .map((id) => services.find((s) => s.id === id))
                .filter(Boolean) as Service[];

              const serviceNames =
                apptServices.map((s) => s.name).join(", ") || "Salon Treatment";

              const totalDuration = apptServices.reduce(
                (acc, s) => acc + (s.durationMin || s.durationMinutes || 30),
                0
              );

              const staff = users.find(
                (u) => u.id === appt.assignedStaffId || u.uid === appt.assignedStaffId
              );

              const dateParts = parseAppointmentDate(appt.date);
              const badge = getStatusBadge(appt.status);
              const isCancellable =
                ["pending", "Booked"].includes(appt.status) && activeTab === "upcoming";

              return (
                <div
                  key={appt.id}
                  className="bg-white border border-[#E8E2D8] hover:border-[#C5A880]/70 rounded-xs p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between gap-4 group"
                >
                  {/* Card Main: Date Block + Service Info */}
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    {/* Visual Compact Date Block */}
                    <div className="shrink-0 flex flex-col items-center justify-center w-14 sm:w-16 h-16 sm:h-[68px] rounded-xs bg-[#FAF5EE] border border-[#E8DFC8] text-center overflow-hidden">
                      <span className="w-full bg-[#EFE7D8] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8E6D38] py-0.5 border-b border-[#E8DFC8]/60">
                        {dateParts.month}
                      </span>
                      <span className="font-heading text-lg sm:text-xl font-bold text-[#222220] leading-none py-1">
                        {dateParts.day}
                      </span>
                      <span className="text-[9px] uppercase font-medium text-[#78716A]">
                        {dateParts.weekday}
                      </span>
                    </div>

                    {/* Service & Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                        <span className="font-mono text-[11px] font-semibold text-[#8E6D38] tracking-wider">
                          #{appt.reference || appt.id.slice(0, 8)}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}
                        >
                          <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${badge.dot}`} />
                          {badge.label}
                        </Badge>
                      </div>

                      <h3
                        className="font-heading text-base sm:text-lg font-bold text-[#222220] truncate group-hover:text-[#8E6D38] transition-colors"
                        title={serviceNames}
                      >
                        {serviceNames}
                      </h3>

                      <div className="mt-1.5 space-y-1 text-xs text-[#5C5B56]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#8E6D38] shrink-0" />
                          <span className="font-medium text-[#222220]">{formatTime(appt.time)}</span>
                          {totalDuration > 0 && (
                            <span className="text-[#78716A]">· Approx. {totalDuration} mins</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="h-3.5 w-3.5 text-[#8E6D38] shrink-0" />
                          <span className="truncate">Glow &amp; Glamour · Laxmi Nagar, Koregaon</span>
                        </div>

                        {staff && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#78716A]">
                            <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span>
                              Stylist: <strong className="font-medium text-[#222220]">{staff.fullName}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Primary QR Pass Action & Compact Secondary Area */}
                  <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      onClick={() => setSelectedQrAppt(appt)}
                      className="flex-1 min-h-[42px] sm:min-h-[38px] px-3.5 rounded-xs bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5 text-[#E5C378]" />
                      <span>View QR Pass</span>
                    </Button>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={downloadingId === appt.id}
                        onClick={(e) => handleDownloadTicket(appt, e)}
                        className="min-h-[42px] sm:min-h-[38px] px-3 rounded-xs border-[#E8E2D8] text-[#5C5B56] hover:text-[#222220] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                        title="Download PDF Boarding Pass"
                      >
                        <Download className="h-3.5 w-3.5 text-[#8E6D38]" />
                        <span className="hidden sm:inline">
                          {downloadingId === appt.id ? "Saving..." : "PDF"}
                        </span>
                      </Button>

                      {/* Dropdown Menu for Secondary Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="min-h-[42px] sm:min-h-[38px] w-9 p-0 rounded-xs text-[#78716A] hover:text-[#222220] hover:bg-[#FAF8F5] cursor-pointer"
                            title="More Options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-52 bg-white border border-[#E8E2D8] rounded-xs shadow-md p-1.5"
                        >
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/customer/bookings/${appt.id}`}
                              className="cursor-pointer text-xs flex items-center gap-2.5 py-2 px-2.5 rounded-xs hover:bg-[#FAF8F5] text-[#222220]"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-[#8E6D38]" />
                              <span>Full Ticket Page</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDownloadTicket(appt)}
                            className="cursor-pointer text-xs flex items-center gap-2.5 py-2 px-2.5 rounded-xs hover:bg-[#FAF8F5] text-[#222220]"
                          >
                            <Download className="h-3.5 w-3.5 text-[#8E6D38]" />
                            <span>Download PDF Pass</span>
                          </DropdownMenuItem>

                          {isCancellable && (
                            <DropdownMenuItem
                              onClick={() => setToCancelId(appt.id)}
                              className="cursor-pointer text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50 flex items-center gap-2.5 py-2 px-2.5 rounded-xs"
                            >
                              <X className="h-3.5 w-3.5 text-rose-500" />
                              <span>Cancel Appointment</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem asChild>
                            <a
                              href="tel:+917058239061"
                              className="cursor-pointer text-xs flex items-center gap-2.5 py-2 px-2.5 rounded-xs hover:bg-[#FAF8F5] text-[#5C5B56]"
                            >
                              <Phone className="h-3.5 w-3.5 text-neutral-400" />
                              <span>Call Salon Reception</span>
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Pagination / Load More Controls for Large Histories */}
          {searchedList.length > visibleCount && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#78716A]">
              <span>
                Showing {visibleAppointments.length} of {searchedList.length} appointments
              </span>
              <Button
                variant="outline"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="w-full sm:w-auto h-10 px-6 rounded-xs border-[#E8E2D8] text-[#222220] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer"
              >
                Load More Appointments ({searchedList.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 5. Quick Support Contact Strip */}
      <div className="rounded-xs p-5 sm:p-6 bg-white border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8E6D38] font-semibold">
            Koregaon Salon Desk Support
          </p>
          <p className="text-sm font-medium text-[#222220]">
            Laxmi Nagar, Koregaon · Open Daily: 9:30 AM – 9:00 PM
          </p>
          <p className="text-xs text-[#78716A] font-light">
            Need to reschedule your session or have queries about treatments?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="https://wa.me/917058239061"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center min-h-[42px] gap-2 px-4 rounded-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>

          <a
            href="tel:+917058239061"
            className="inline-flex items-center justify-center min-h-[42px] gap-2 px-4 rounded-xs bg-[#FAF5EE] hover:bg-[#EFE7D8] text-[#222220] font-semibold text-xs uppercase tracking-wider transition-colors border border-[#E8DFC8]"
          >
            <Phone className="h-4 w-4 text-[#8E6D38]" /> Call Studio
          </a>
        </div>
      </div>

      {/* 6. Instant Digital QR Pass Dialog Modal */}
      {selectedQrAppt && (
        <Dialog open={!!selectedQrAppt} onOpenChange={(open) => !open && setSelectedQrAppt(null)}>
          <DialogContent className="max-w-md bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs p-6 sm:p-8 text-[#222220] shadow-xl">
            <DialogHeader className="space-y-1.5 border-b border-[#E8E2D8] pb-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8E6D38]">
                  Digital Check-in Pass
                </span>
                <span className="font-mono text-xs font-bold text-[#8E6D38]">
                  #{selectedQrAppt.reference || selectedQrAppt.id.slice(0, 8)}
                </span>
              </div>
              <DialogTitle className="font-heading text-xl sm:text-2xl font-bold text-[#222220]">
                {selectedQrAppt.customerName || currentUser.fullName}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716A]">
                Present this digital QR code to the salon receptionist upon arrival for instant check-in.
              </DialogDescription>
            </DialogHeader>

            {/* QR Code Presentation Box */}
            <div className="py-4 space-y-4">
              <div className="flex flex-col items-center justify-center p-5 bg-white rounded-xs border border-[#E8DFC8] shadow-xs">
                <QRCodeSVG
                  value={selectedQrAppt.id || selectedQrAppt.reference}
                  size={155}
                  level="M"
                  includeMargin={false}
                />
                <span className="text-[9px] font-mono tracking-widest text-[#78716A] mt-2.5 uppercase font-medium">
                  Scan to Verify at Reception
                </span>
              </div>

              {/* Booking Snapshot */}
              <div className="p-3.5 bg-white rounded-xs border border-[#E8E2D8] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#78716A]">Treatment:</span>
                  <span className="font-semibold text-[#222220] text-right truncate max-w-[200px]">
                    {(selectedQrAppt.serviceIds || [])
                      .map((id) => services.find((s) => s.id === id)?.name)
                      .filter(Boolean)
                      .join(", ") || "Salon Service"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716A]">Date &amp; Time:</span>
                  <span className="font-semibold text-[#222220]">
                    {formatDate(selectedQrAppt.date)} at {formatTime(selectedQrAppt.time)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716A]">Location:</span>
                  <span className="font-medium text-[#222220]">Near ZP School, Laxmi Nagar, Koregaon</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#E8E2D8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedQrAppt(null)}
                className="text-xs uppercase tracking-wider text-[#78716A] hover:text-[#222220] border-[#E8E2D8]"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDownloadTicket(selectedQrAppt)}
                  className="flex-1 sm:flex-none text-xs uppercase tracking-wider border-[#E8DFC8] text-[#8E6D38] hover:bg-[#FAF5EE] gap-1.5 min-h-[40px]"
                >
                  <Download className="h-3.5 w-3.5" /> PDF Ticket
                </Button>

                <Link
                  href={`/customer/bookings/${selectedQrAppt.id}`}
                  className="flex-1 sm:flex-none"
                  onClick={() => setSelectedQrAppt(null)}
                >
                  <Button className="w-full text-xs uppercase tracking-wider bg-[#222220] hover:bg-black text-[#FAF8F5] gap-1.5 min-h-[40px]">
                    <ExternalLink className="h-3.5 w-3.5 text-[#E5C378]" /> Full Ticket
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 7. Appointment Cancellation Confirmation Dialog */}
      <Dialog open={!!toCancelId} onOpenChange={(open) => !open && setToCancelId(null)}>
        <DialogContent className="max-w-md bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs p-6 text-[#222220]">
          <DialogHeader className="space-y-2">
            <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <DialogTitle className="font-heading text-xl font-bold text-[#222220]">
              Cancel Appointment?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5C5B56] leading-relaxed">
              Are you sure you want to cancel booking reference{" "}
              <strong className="text-[#222220]">#{apptToCancel?.reference || apptToCancel?.id}</strong>? Your reserved salon chair slot will be released back to other clients.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setToCancelId(null)}
              className="text-xs uppercase tracking-wider border-[#E8E2D8]"
            >
              Keep My Slot
            </Button>
            <Button
              type="button"
              onClick={confirmCancelAppointment}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase tracking-wider font-semibold"
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
