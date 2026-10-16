"use client";

import { useMemo } from "react";
import { type Appointment, type Service } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { CheckCircle2, UserCheck, User } from "lucide-react";
import { useData } from "@/lib/store";
import { toast } from "sonner";
import { isRegisteredCustomerBooking, formatDateShort } from "@/lib/format";
import { AppointmentActionMenu } from "./appointment-action-menu";
import { cn } from "@/lib/utils";

interface CompactAppointmentCardProps {
  appointment: Appointment;
  services: Service[];
  isSelected?: boolean;
  onClick?: () => void;
  onViewHistory?: () => void;
}

export function CompactAppointmentCard({
  appointment,
  services,
  isSelected,
  onClick,
  onViewHistory,
}: CompactAppointmentCardProps) {
  const { users, completeAppointment } = useData();

  // Get matching services
  const matchedServices = useMemo(() => {
    return appointment.serviceIds
      .map((id) => services.find((s) => s.id === id))
      .filter(Boolean) as Service[];
  }, [appointment.serviceIds, services]);

  const serviceNames = matchedServices
    .map((s) => (s.variant ? `${s.name} (${s.variant})` : s.name))
    .join(", ");
  const totalPrice =
    appointment.priceAtBooking ||
    matchedServices.reduce((sum, s) => sum + s.price, 0);

  const initials = appointment.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Detect whether booked by signed-in customer or unauthenticated guest
  const isRegistered = useMemo(() => {
    return isRegisteredCustomerBooking(appointment, users);
  }, [appointment, users]);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] p-3.5 shadow-2xs transition-all cursor-pointer hover:border-[#A27C48]/60",
        isRegistered
          ? "border-l-4 border-l-[#A27C48]"
          : "border-l-4 border-l-[#D1B58C]",
        isSelected && "ring-1 ring-[#A27C48] border-[#A27C48] bg-[#F0EBE3]/30"
      )}
    >
      <Avatar
        className="h-11 w-11 border border-[#E9E1D6] shadow-2xs shrink-0 rounded-md bg-[#F0EBE3] text-[#A27C48]"
      >
        <AvatarFallback
          className="text-xs font-bold bg-[#F0EBE3] text-[#A27C48] rounded-md"
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {/* Top Row: Name + Badges (Customer/Guest & Booking Ref) + Date/Time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <h3 className="truncate font-bold text-[#302A24] leading-none text-sm">
              {appointment.customerName}
            </h3>
            {isRegistered ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F0EBE3] text-[#A27C48] border border-[#DDCFBA] shrink-0">
                <UserCheck className="h-3 w-3 text-[#A27C48]" /> Customer
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F0EBE3] text-[#74695E] border border-[#E9E1D6] shrink-0">
                <User className="h-3 w-3 text-[#74695E]" /> Guest
              </span>
            )}
            <span className="font-mono text-[10px] font-bold text-[#74695E] bg-[#F0EBE3]/60 px-1.5 py-0.5 rounded border border-[#E9E1D6] shrink-0" title="Booking ID">
              #{appointment.reference || appointment.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-[#302A24] block">
              {appointment.time}
            </span>
            <span className="text-[10px] font-medium text-[#74695E] block">
              {formatDateShort(appointment.date)}
            </span>
          </div>
        </div>

        {/* Middle Row: Service Name & Price */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-[#74695E] font-medium">
            {serviceNames || "Standard Service"}
          </p>
          <span className="text-xs font-bold text-[#302A24] shrink-0">
            ₹{totalPrice}
          </span>
        </div>

        {/* Bottom Row: Status Chip + Complete Button + Action Menu */}
        <div className="mt-2 flex items-center justify-between">
          <StatusChip status={appointment.status} />

          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
            {appointment.status !== "completed" && !["cancelled", "rejected", "no_show"].includes(appointment.status) && (
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await completeAppointment(appointment.id);
                    toast.success("Service completed!");
                  } catch (e) {
                    toast.error("Failed to complete appointment");
                  }
                }}
                className="h-7 px-2.5 text-[11px] bg-[#355B3C] hover:bg-[#2A4930] text-[#FFFDFA] font-medium rounded-md gap-1 shadow-2xs transition-colors"
                title="Mark service as completed"
              >
                <CheckCircle2 className="h-3 w-3" /> Complete
              </Button>
            )}
            <AppointmentActionMenu
              appointment={appointment}
              onViewDetails={onClick}
              onViewHistory={onViewHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
