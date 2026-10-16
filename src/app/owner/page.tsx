"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  QrCode,
  Users,
  DollarSign,
  TrendingUp,
  Receipt,
  Scissors,
  ArrowRight,
  Sparkles,
  Clock,
  Phone,
  Mail,
  BarChart3,
  CheckCircle2,
  Calendar as CalendarIcon,
  Check,
  Play,
  UserCheck,
  UserX,
  User,
  X,
  ChevronRight,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { isRegisteredCustomerBooking } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type Appointment, type AppointmentStatus } from "@/lib/types";
import { PageHeader, Section, EmptyState, UserAvatar } from "@/components/ui-kit";
import { relativeTime, todayISO, formatPrice, formatTime, formatDate } from "@/lib/format";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";

export default function OwnerDashboard() {
  const router = useRouter();
  const {
    currentUser,
    activeBranchId,
    appointments,
    notifications,
    users,
    services,
    confirmAppointment,
    checkInAppointment,
    startService,
    completeAppointment,
    markNoShow,
    rejectAppointment,
    cancelAppointment,
  } = useData();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  if (!currentUser) return null;

  const today = todayISO();
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const branchAppointments = appointments.filter((a) => a.branchId === activeBranchId);

  // Today's appointments
  const todayAppointments = branchAppointments.filter((a) => a.date === today);

  // Today's gross estimated revenue
  const todayRevenue = useMemo(() => {
    return todayAppointments
      .filter((a) => !["cancelled", "rejected", "no_show"].includes(a.status))
      .reduce((sum, a) => {
        if (a.priceAtBooking) return sum + a.priceAtBooking;
        const apptServices = (a.serviceIds || [])
          .map((id) => services.find((s) => s.id === id))
          .filter(Boolean);
        return sum + apptServices.reduce((sub, s) => sub + (s?.price || 0), 0);
      }, 0);
  }, [todayAppointments, services]);

  const activeStaffCount = users.filter((u) => u.role === "staff" && u.active).length;
  const totalCustomersCount = users.filter((u) => u.role === "customer").length;

  const selectedDateAppointments = branchAppointments.filter((a) => a.date === selectedDateStr);
  const recent = [...selectedDateAppointments].sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const bookedDates = branchAppointments.map((a) => new Date(`${a.date}T00:00:00`));

  const activity = notifications
    .filter((n) => n.audience === "owner" || (n.branchId ?? activeBranchId) === activeBranchId)
    .slice(0, 6);

  const awaitingCount = todayAppointments.filter((a) =>
    ["pending", "confirmed"].includes(a.status)
  ).length;

  const act = (fn: () => Promise<void>, msg: string) => () => {
    fn()
      .then(() => toast.success(msg))
      .catch((err: any) => {
        console.error("Action Error:", err);
        toast.error(err?.message || "Action failed. Please try again.");
      });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E9E1D6] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#302A24]">
            Salon Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#74695E] mt-1">
            Glow &amp; Glamour Salon ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · Live Queue &amp; Business Intel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/owner/appointments">
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 bg-[#A27C48] hover:bg-[#876438] text-[#FFFDFA] shadow-xs text-xs font-semibold h-9 rounded-md transition-colors cursor-pointer"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Full Queue View</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Core CRM KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Today's Appointments */}
        <Card className="p-4 sm:p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-2xs hover:border-[#A27C48]/50 transition-all">
          <div className="flex items-center justify-between text-[#74695E] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#74695E]">
              Today's Appointments
            </span>
            <div className="h-8 w-8 rounded-md bg-[#F0EBE3] text-[#A27C48] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#302A24]">
            {todayAppointments.length}
          </p>
          <p className="text-xs text-[#74695E] mt-1.5">
            <span className="font-semibold text-[#A27C48]">{awaitingCount}</span> awaiting service
          </p>
        </Card>

        {/* KPI 2: Today's Revenue */}
        <Card className="p-4 sm:p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-2xs hover:border-[#A27C48]/50 transition-all">
          <div className="flex items-center justify-between text-[#74695E] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#74695E]">
              Today's Revenue
            </span>
            <div className="h-8 w-8 rounded-md bg-[#E0EBDD] text-[#355B3C] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#302A24]">
            {formatPrice(todayRevenue)}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] font-semibold text-[#355B3C] bg-[#E0EBDD] px-1.5 py-0.5 rounded border border-[#C7DCC2]">
              Locked
            </span>
            <span className="text-xs text-[#74695E]">Active billable bookings</span>
          </div>
        </Card>

        {/* KPI 3: Staff on Duty */}
        <Card className="p-4 sm:p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-2xs hover:border-[#A27C48]/50 transition-all">
          <div className="flex items-center justify-between text-[#74695E] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#74695E]">
              Staff on Duty
            </span>
            <div className="h-8 w-8 rounded-md bg-[#F0EBE3] text-[#A27C48] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#302A24]">
            {activeStaffCount}
          </p>
          <p className="text-xs text-[#74695E] mt-1.5">Staff stylists on shift</p>
        </Card>

        {/* KPI 4: Total Clients */}
        <Card className="p-4 sm:p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-2xs hover:border-[#A27C48]/50 transition-all">
          <div className="flex items-center justify-between text-[#74695E] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#74695E]">
              Total Clients
            </span>
            <div className="h-8 w-8 rounded-md bg-[#F0EBE3] text-[#A27C48] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#302A24]">
            {totalCustomersCount}
          </p>
          <Link
            href="/owner/customers"
            className="inline-flex items-center gap-1 text-xs text-[#A27C48] hover:text-[#876438] font-semibold mt-1.5 group"
          >
            <span>View Client CRM</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Card>
      </div>

      {/* 3. Fast SaaS Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/owner/scanner">
          <Card className="p-3.5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] hover:border-[#A27C48] hover:shadow-2xs transition-all flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-md bg-[#F0EBE3] text-[#A27C48] flex items-center justify-center shrink-0 group-hover:bg-[#A27C48] group-hover:text-[#FFFDFA] transition-colors">
              <QrCode className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#302A24] group-hover:text-[#A27C48] transition-colors">
                Fast Scanner
              </p>
              <p className="text-[11px] text-[#74695E] truncate">Instant QR check-in</p>
            </div>
          </Card>
        </Link>

        <Link href="/owner/customers">
          <Card className="p-3.5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] hover:border-[#A27C48] hover:shadow-2xs transition-all flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-md bg-[#F0EBE3] text-[#A27C48] flex items-center justify-center shrink-0 group-hover:bg-[#A27C48] group-hover:text-[#FFFDFA] transition-colors">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#302A24] group-hover:text-[#A27C48] transition-colors">
                Client CRM 360°
              </p>
              <p className="text-[11px] text-[#74695E] truncate">Profiles &amp; WhatsApp</p>
            </div>
          </Card>
        </Link>

        <Link href="/owner/billing">
          <Card className="p-3.5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] hover:border-[#A27C48] hover:shadow-2xs transition-all flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-md bg-[#F0EBE3] text-[#A27C48] flex items-center justify-center shrink-0 group-hover:bg-[#A27C48] group-hover:text-[#FFFDFA] transition-colors">
              <Receipt className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#302A24] group-hover:text-[#A27C48] transition-colors">
                Billing &amp; Tax
              </p>
              <p className="text-[11px] text-[#74695E] truncate">PDF Invoices &amp; GST</p>
            </div>
          </Card>
        </Link>

        <Link href="/owner/reports">
          <Card className="p-3.5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] hover:border-[#A27C48] hover:shadow-2xs transition-all flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-md bg-[#F0EBE3] text-[#A27C48] flex items-center justify-center shrink-0 group-hover:bg-[#A27C48] group-hover:text-[#FFFDFA] transition-colors">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#302A24] group-hover:text-[#A27C48] transition-colors">
                Financial Reports
              </p>
              <p className="text-[11px] text-[#74695E] truncate">Profit &amp; analytics</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* 4. Main Two-Column CRM Layout: Queue & Calendar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Column: Appointment Queue */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold tracking-tight text-[#302A24]">
                {selectedDateStr === today
                  ? "Today's Appointment Queue"
                  : `${format(selectedDate, "MMMM d, yyyy")} Queue`}
              </h2>
              <p className="text-xs text-[#74695E]">
                {recent.length} {recent.length === 1 ? "booking" : "bookings"} on schedule
              </p>
            </div>
            <Link
              href={`/owner/appointments?date=${selectedDateStr}`}
              className="text-xs font-semibold text-[#A27C48] hover:text-[#876438] flex items-center gap-1"
            >
              <span>Manage All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <Card className="p-8 border border-[#E9E1D6] bg-[#FFFDFA] rounded-md text-center">
              <EmptyState
                icon={CalendarIcon}
                title="No appointments scheduled for this date"
                description="Use the calendar on the right or view the full appointments schedule."
              />
            </Card>
          ) : (
            <div className="relative">
              <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent>
                  {recent.map((appt) => {
                    const apptServices = (appt.serviceIds || [])
                      .map((id) => services.find((s) => s.id === id))
                      .filter(Boolean);
                    const serviceNames =
                      apptServices.map((s) => s?.name).join(", ") || "Salon Treatment";
                    const total =
                      appt.priceAtBooking ||
                      apptServices.reduce((a, b) => a + (b?.price || 0), 0);
                    const staffMember = users.find(
                      (u) => u.id === appt.assignedStaffId || u.uid === appt.assignedStaffId
                    );

                    const isRegistered = isRegisteredCustomerBooking(appt, users);

                    return (
                      <CarouselItem
                        key={appt.id}
                        className="basis-full sm:basis-[360px] md:basis-[380px]"
                      >
                        <Card
                          className={cn(
                            "p-4 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-2xs transition-all flex flex-col justify-between h-full space-y-4 hover:border-[#A27C48]/50",
                            isRegistered
                              ? "border-l-4 border-l-[#A27C48]"
                              : "border-l-4 border-l-[#D1B58C]"
                          )}
                        >
                          {/* Card Top Header */}
                          <div className="flex items-start justify-between gap-3 border-b border-[#E9E1D6] pb-3">
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-[#74695E]">
                                  #{appt.reference || appt.id.slice(0, 8)}
                                </span>
                                <span className="text-[10px] text-[#74695E]/60">·</span>
                                {isRegistered ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#F0EBE3] text-[#A27C48] border border-[#DDCFBA]">
                                    <UserCheck className="h-2.5 w-2.5 text-[#A27C48]" /> Customer
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#F0EBE3] text-[#74695E] border border-[#E9E1D6]">
                                    <User className="h-2.5 w-2.5 text-[#74695E]" /> Guest
                                  </span>
                                )}
                                <span className="text-[10px] text-[#74695E]/60">·</span>
                                <span className="text-xs font-bold text-[#302A24] flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-[#74695E]" />
                                  {formatTime(appt.time)}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-[#302A24] truncate">
                                {appt.customerName}
                              </h3>
                              {appt.customerPhone && (
                                <p className="text-xs text-[#74695E] font-medium flex items-center gap-1 truncate">
                                  <Phone className="h-3 w-3 text-[#74695E]/80" />
                                  <span>{appt.customerPhone}</span>
                                </p>
                              )}
                            </div>
                            <StatusChip status={appt.status} />
                          </div>

                          {/* Card Body Details */}
                          <div className="space-y-2 text-xs">
                            <div className="rounded-md bg-[#F0EBE3]/50 border border-[#E9E1D6] p-2.5 space-y-1">
                              <p className="font-semibold text-[#302A24] line-clamp-2">
                                {serviceNames}
                              </p>
                              <div className="flex items-center justify-between text-[#74695E] text-[11px] pt-1">
                                <span>
                                  Stylist:{" "}
                                  <strong className="text-[#302A24]">
                                    {staffMember?.fullName || "Any Available"}
                                  </strong>
                                </span>
                                <span className="font-bold text-[#302A24] text-sm">
                                  {formatPrice(total)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Fast Action Buttons */}
                          <div className="pt-2 border-t border-[#E9E1D6] flex flex-wrap items-center gap-1.5">
                            {appt.status !== "completed" && !["cancelled", "rejected", "no_show"].includes(appt.status) && (
                              <Button
                                size="sm"
                                onClick={act(() => completeAppointment(appt.id), "Service Completed")}
                                className="h-8 text-xs bg-[#355B3C] hover:bg-[#2A4930] text-[#FFFDFA] font-semibold rounded-md gap-1 transition-colors"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Complete Service
                              </Button>
                            )}

                            {appt.status === "pending" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={act(() => rejectAppointment(appt.id), "Appointment Rejected")}
                                className="h-8 text-xs text-[#8C3930] hover:bg-[#F7E7E3] rounded-md transition-colors"
                              >
                                <X className="h-3.5 w-3.5" /> Reject
                              </Button>
                            )}

                            {appt.status === "completed" && (
                              <span className="text-xs font-semibold text-[#355B3C] bg-[#E0EBDD] border border-[#C7DCC2] px-2.5 py-1 rounded-md flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#355B3C]" /> Completed
                              </span>
                            )}

                            <div className="flex-1" />

                            {appt.customerPhone && (
                              <a href={`tel:${appt.customerPhone}`} className="shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3] gap-1 px-2.5 transition-colors"
                                  title="Call customer"
                                >
                                  <Phone className="h-3.5 w-3.5 text-[#74695E]" />
                                  <span>Call</span>
                                </Button>
                              </a>
                            )}
                          </div>
                        </Card>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <div className="hidden sm:flex justify-end gap-2 mt-3">
                  <CarouselPrevious className="static translate-y-0 h-8 w-8 border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]" />
                  <CarouselNext className="static translate-y-0 h-8 w-8 border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]" />
                </div>
              </Carousel>
            </div>
          )}
        </div>

        {/* Right Column: Calendar Widget & Live Activity Feed */}
        <div className="space-y-6 min-w-0">
          {/* Calendar Card */}
          <Card className="p-4 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E1D6]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-[#A27C48]" />
                <h3 className="text-sm font-bold text-[#302A24]">Salon Schedule</h3>
              </div>
              <span className="text-[11px] font-medium text-[#74695E]">
                {format(selectedDate, "MMM yyyy")}
              </span>
            </div>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  setSelectedDate(date);
                  const dateStr = format(date, "yyyy-MM-dd");
                  const hasAppointments = branchAppointments.some((a) => a.date === dateStr);
                  if (hasAppointments) {
                    router.push(`/owner/appointments?date=${dateStr}`);
                  }
                }}
                modifiers={{ booked: bookedDates }}
                modifiersClassNames={{
                  booked:
                    "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-[#A27C48] after:content-['']",
                }}
              />
            </div>
          </Card>

          {/* Activity Feed Card */}
          <Card className="p-4 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E1D6]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#A27C48]" />
                <h3 className="text-sm font-bold text-[#302A24]">Audit &amp; Activity Log</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#A27C48] font-bold">
                Live
              </span>
            </div>

            {activity.length === 0 ? (
              <p className="text-xs text-[#74695E] py-3 text-center">No recent activity logged</p>
            ) : (
              <div className="space-y-2">
                {activity.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-md border border-[#E9E1D6] bg-[#F0EBE3]/40 hover:bg-[#F0EBE3] transition-colors space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-[#302A24]">{n.title}</p>
                      <span className="text-[10px] text-[#74695E] shrink-0 font-mono">
                        {relativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#74695E] line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
