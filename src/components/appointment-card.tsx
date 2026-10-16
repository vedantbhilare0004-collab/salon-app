"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Scissors,
  Ticket,
  Phone,
  Mail,
  CalendarPlus,
  CheckCircle2,
  QrCode,
  Download,
  Sparkles,
  MapPin,
} from "lucide-react";
import { useData } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit";
import { BRANCH_LABELS } from "@/lib/types";
import { formatDate, formatPrice, formatTime, formatDateTime } from "@/lib/format";
import { generateBookingTicketPdf } from "@/lib/ticketService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AppointmentCard({
  appointment,
  action,
}: {
  appointment: import("@/lib/types").Appointment;
  action?: React.ReactNode;
}) {
  const { getBranch, services, users } = useData();
  const [downloading, setDownloading] = useState(false);

  const apptServices = (appointment.serviceIds || [])
    .map((id) => services.find((s) => s.id === id))
    .filter(Boolean);

  const names =
    apptServices
      .map((s) => (s ? (s.variant ? `${s.name} (${s.variant})` : s.name) : ""))
      .filter(Boolean)
      .join(", ") || "Hair & Beauty Service";
  const total =
    appointment.priceAtBooking ||
    apptServices.reduce((a, b) => a + (b?.price || 0), 0);

  const customerUser = users.find(
    (u) => u.uid === appointment.customerUid || u.id === appointment.customerId
  );
  const customerEmail = appointment.customerEmail || customerUser?.email;
  const staffMember = users.find(
    (u) => u.id === appointment.assignedStaffId || u.uid === appointment.assignedStaffId
  );

  const isActive = ["pending", "confirmed", "checked_in", "in_service", "Booked", "Confirmed", "In Progress"].includes(
    appointment.status
  );
  const isFailed = ["cancelled", "rejected", "no_show", "Cancelled", "No Show"].includes(appointment.status);

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setDownloading(true);
      const { doc } = await generateBookingTicketPdf({
        appointment,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        customerEmail: customerEmail,
        services: apptServices as any[],
        staffName: staffMember?.fullName,
      });
      doc.save(`Ticket-${appointment.reference || appointment.id}.pdf`);
      toast.success("Ticket downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate PDF ticket");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card
      className={cn(
        "rounded-none border border-[#E9E1D6] bg-[#FFFDFA] overflow-hidden shadow-none hover:border-[#A27C48]/50 transition-all",
        isFailed && "opacity-60"
      )}
    >
      {/* Top Banner Ribbon */}
      <div className="bg-[#F0EBE3] text-[#302A24] px-4 py-2.5 flex items-center justify-between border-b border-[#E9E1D6]">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-[#A27C48]" />
          <span className="text-xs uppercase tracking-wider text-[#5C5B56] font-semibold">
            Appointment Pass
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#5C5B56] font-medium">
            #{appointment.reference || appointment.id.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h3 className="font-heading font-bold text-lg sm:text-xl text-[#302A24] leading-snug">
              {names}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5C5B56] pt-0.5">
              <span className="font-semibold text-[#302A24]">{appointment.customerName}</span>
              {appointment.customerPhone && (
                <span className="flex items-center gap-1 truncate">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[#8E6D38]" />
                  <span className="truncate">{appointment.customerPhone}</span>
                </span>
              )}
              {customerEmail && (
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[#8E6D38]" />
                  <span className="truncate">{customerEmail}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge status={appointment.status} />
            {isActive && (
              <div className="flex items-center gap-1.5 rounded-none bg-[#E0EBDD] border border-[#E0EBDD] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#355B3C]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#355B3C]" />
                Active
              </div>
            )}
          </div>
        </div>

        {/* Details Box */}
        <div className="rounded-none bg-[#F0EBE3]/50 border border-[#E9E1D6] p-3.5 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-sm">
            <span className="flex items-center gap-1.5 text-[#5C5B56] font-medium">
              <CalendarDays className="h-4 w-4 text-[#A27C48]" /> {formatDate(appointment.date)}
            </span>
            <span className="flex items-center gap-1.5 text-[#5C5B56] font-medium">
              <Clock className="h-4 w-4 text-[#A27C48]" /> {formatTime(appointment.time)}
            </span>
            <span className="flex items-center gap-1.5 text-[#5C5B56] font-medium">
              <MapPin className="h-4 w-4 text-[#A27C48]" /> Glow &amp; Glamour Salon
            </span>
            {staffMember && (
              <span className="flex items-center gap-1.5 text-[#5C5B56] font-medium truncate">
                <Scissors className="h-4 w-4 text-[#A27C48]" /> {staffMember.fullName}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Booking Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#5C5B56] pt-1">
          {total > 0 ? (
            <p className="flex items-baseline gap-1.5">
              <span>Amount: </span>
              <span className="font-bold text-base text-[#302A24]">
                {formatPrice(total)}
              </span>
            </p>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-xs text-[#74695E] font-mono">
            <CalendarPlus className="h-3.5 w-3.5" /> Booked:{" "}
            {appointment.createdAt ? formatDateTime(appointment.createdAt) : "Recent"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#E9E1D6]">
          <div className="flex items-center gap-2">
            <Link href={`/customer/bookings/${appointment.id}`}>
              <Button
                variant="outline"
                className="gap-2 text-sm font-semibold h-10 px-4 rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]"
              >
                <QrCode className="h-4 w-4 text-[#A27C48]" /> View Boarding Pass
              </Button>
            </Link>

            <Button
              variant="outline"
              disabled={downloading}
              onClick={handleDownloadPdf}
              className="gap-2 text-sm font-semibold h-10 px-4 rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#5C5B56] hover:bg-[#F0EBE3] hover:text-[#302A24]"
            >
              <Download className="h-3.5 w-3.5 text-[#74695E]" />
              <span>{downloading ? "Preparing..." : "Download PDF"}</span>
            </Button>
          </div>

          {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
        </div>
      </div>
    </Card>
  );
}
