"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { type Appointment, type Service, BRANCH_LABELS } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusChip } from "@/components/ui/status-chip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, User as UserIcon, FileText, CheckCircle2, XCircle, RotateCcw, UserCheck, User, Ticket } from "lucide-react";
import { useData } from "@/lib/store";
import { toast } from "sonner";
import { isRegisteredCustomerBooking } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AppointmentActionMenu } from "./appointment-action-menu";

interface AppointmentDetailPanelProps {
  appointment: Appointment;
  services: Service[];
  allAppointments: Appointment[];
  onClose?: () => void;
}

export function AppointmentDetailPanel({
  appointment,
  services,
  allAppointments,
  onClose
}: AppointmentDetailPanelProps) {
  const { users, completeAppointment, updateAppointmentStatus, cancelAppointment } = useData();
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

  // Safe local date object without timezone shifts
  const apptDateFormatted = useMemo(() => {
    if (!appointment.date) return "";
    const [y, m, d] = appointment.date.split("-").map(Number);
    const dateObj = (!y || !m || !d) ? new Date(appointment.date) : new Date(y, m - 1, d);
    return format(dateObj, "EEE, MMM dd, yyyy");
  }, [appointment.date]);

  // Customer History
  const history = useMemo(() => {
    if (!appointment.customerUid && appointment.customerId === "walkin") return [];
    
    return allAppointments
      .filter(a => 
        (a.customerUid === appointment.customerUid || a.customerId === appointment.customerId) 
        && a.status === "completed"
      )
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [allAppointments, appointment.customerUid, appointment.customerId]);

  const lifetimeSpending = history.reduce((sum, a) => {
    const sPrice = a.serviceIds.reduce((sSum, sId) => {
      const s = services.find((x) => x.id === sId);
      return sSum + (s?.price || 0);
    }, 0);
    return sum + sPrice;
  }, 0);

  // Timeline events
  const timeline = [
    { label: "Booked", time: appointment.createdAt },
    { label: "Confirmed", time: appointment.confirmedAt },
    { label: "Checked In", time: appointment.queuedAt },
    { label: "Service Started", time: appointment.serviceStartedAt },
    { label: "Completed", time: appointment.completedAt },
  ].filter(t => !!t.time).sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  return (
    <div className="flex h-full flex-col bg-[#FFFDFA]">
      {/* Header with distinct Customer / Guest styling */}
      <div
        className="flex items-start justify-between p-6 pb-5 border-b border-[#E9E1D6] bg-[#F0EBE3] transition-colors"
      >
        <div className="flex items-center gap-4">
          <Avatar
            className="h-14 w-14 border border-[#E9E1D6] shadow-2xs shrink-0 rounded-md bg-[#FFFDFA] text-[#A27C48]"
          >
            <AvatarFallback
              className="text-lg font-bold bg-[#FFFDFA] text-[#A27C48] rounded-md"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[#302A24] leading-tight">
                {appointment.customerName}
              </h2>
              {isRegistered ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FFFDFA] text-[#A27C48] border border-[#DDCFBA]">
                  <UserCheck className="h-3 w-3 text-[#A27C48]" /> Customer
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FFFDFA] text-[#74695E] border border-[#E9E1D6]">
                  <User className="h-3 w-3 text-[#74695E]" /> Guest
                </span>
              )}
            </div>
            <p className="text-xs text-[#74695E] font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#74695E]" />
              {appointment.customerPhone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AppointmentActionMenu appointment={appointment} />
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="sm:hidden text-[#74695E] hover:text-[#302A24]">
              <span className="sr-only">Close</span>
              &times;
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          
          {/* Main Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-[#74695E] flex items-center gap-1">
                <Ticket className="h-3.5 w-3.5 text-[#A27C48]" /> Booking ID
              </span>
              <p className="font-mono font-bold text-sm text-[#302A24] uppercase tracking-wide">
                #{appointment.reference || appointment.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-[#74695E] flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#A27C48]" /> Date
              </span>
              <p className="font-semibold text-sm text-[#302A24]">{apptDateFormatted}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-[#74695E] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#A27C48]" /> Time
              </span>
              <p className="font-semibold text-sm text-[#302A24]">{appointment.time}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-[#74695E] flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5 text-[#A27C48]" /> Client Type
              </span>
              <p className="font-semibold text-xs truncate">
                {isRegistered ? (
                  <span className="text-[#A27C48] font-bold flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-[#A27C48]" /> Customer Account
                  </span>
                ) : (
                  <span className="text-[#74695E] font-bold flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-[#74695E]" /> Guest (No Account)
                  </span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-[#74695E] flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#A27C48]" /> Salon Studio
              </span>
              <p className="font-medium text-xs text-[#302A24]">Glow &amp; Glamour (Koregaon)</p>
            </div>
          </div>

          <Separator className="bg-[#E9E1D6]" />

          {/* Service Details */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#302A24]">
              <FileText className="h-4 w-4 text-[#A27C48]" /> Booking Details
            </h3>
            <div className="rounded-md border border-[#E9E1D6] bg-[#FFFDFA] p-4 space-y-3">
              <div className="flex justify-between items-center text-[#302A24]">
                <span className="font-medium">{serviceNames || "Standard Service"}</span>
                <span className="font-bold text-base">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#74695E]">Current Status</span>
                <StatusChip status={appointment.status} />
              </div>
              {appointment.notes && (
                <div className="pt-2 mt-2 border-t border-[#E9E1D6]">
                  <span className="text-xs text-[#74695E] block mb-1">Notes</span>
                  <p className="text-sm text-[#302A24]">{appointment.notes}</p>
                </div>
              )}

              {/* Service Completion & Fast Action Controls */}
              <div className="pt-3 mt-3 border-t border-[#E9E1D6] space-y-2.5">
                {appointment.status !== "completed" && !["cancelled", "rejected", "no_show"].includes(appointment.status) ? (
                  <div className="space-y-2">
                    <Button
                      onClick={async () => {
                        try {
                          await completeAppointment(appointment.id);
                          toast.success("Service marked as completed!");
                        } catch (e) {
                          toast.error("Failed to complete appointment");
                        }
                      }}
                      className="w-full h-11 bg-[#355B3C] hover:bg-[#2A4930] text-[#FFFDFA] font-semibold text-sm shadow-2xs gap-2 rounded-md transition-colors"
                    >
                      <CheckCircle2 className="h-5 w-5" /> Mark Service as Completed
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            await cancelAppointment(appointment.id);
                            toast.success("Appointment cancelled");
                          } catch (e) {
                            toast.error("Failed to cancel appointment");
                          }
                        }}
                        className="flex-1 h-9 text-xs text-[#8C3930] hover:text-[#8C3930] hover:bg-[#F7E7E3] border-[#E9E1D6] rounded-md font-medium transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" /> Cancel Booking
                      </Button>
                      {appointment.customerPhone && (
                        <a href={`tel:${appointment.customerPhone}`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full h-9 text-xs gap-1.5 rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] transition-colors"
                          >
                            <Phone className="h-4 w-4 text-[#74695E]" /> Call Client
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ) : appointment.status === "completed" ? (
                  <div className="rounded-md bg-[#E0EBDD] border border-[#C7DCC2] p-3.5 flex items-center justify-between text-[#355B3C]">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#355B3C] text-[#FFFDFA] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-[#355B3C]">Service Completed</p>
                        <p className="text-[11px] text-[#355B3C]/80">
                          {appointment.completedAt ? format(new Date(appointment.completedAt), "MMM dd, h:mm a") : "Marked completed"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await updateAppointmentStatus(appointment.id, "pending");
                          toast.info("Appointment restored to Pending");
                        } catch (e) {
                          toast.error("Failed to restore status");
                        }
                      }}
                      className="h-8 text-xs text-[#355B3C] hover:bg-[#C7DCC2] font-medium gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reopen
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md bg-[#F7E7E3] border border-[#EAC8C1] p-3 text-[#8C3930] text-xs font-medium flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-[#8C3930] shrink-0" />
                    <span>This appointment was {appointment.status}.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-[#E9E1D6]" />

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#302A24]">
              <Clock className="h-4 w-4 text-[#A27C48]" /> Status Timeline
            </h3>
            <div className="space-y-4 pl-2">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex items-center gap-4">
                  <div className="absolute left-[7px] top-5 -bottom-5 w-px bg-[#E9E1D6] last:hidden" />
                  <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#F0EBE3] ring-4 ring-[#FFFDFA]">
                    <CheckCircle2 className="h-3 w-3 text-[#A27C48]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#302A24]">{item.label}</p>
                    <p className="text-xs text-[#74695E]">
                      {item.time ? format(new Date(item.time), "MMM dd, h:mm a") : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-[#E9E1D6]" />

          {/* Customer History */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#302A24]">
              <UserIcon className="h-4 w-4 text-[#A27C48]" /> Customer History
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4 rounded-md border border-[#E9E1D6] bg-[#F0EBE3]/30 p-4">
              <div>
                <p className="text-xs text-[#74695E]">Lifetime Visits</p>
                <p className="text-lg font-bold text-[#302A24]">{history.length}</p>
              </div>
              <div>
                <p className="text-xs text-[#74695E]">Total Spent</p>
                <p className="text-lg font-bold text-[#302A24]">₹{lifetimeSpending}</p>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 5).map(visit => {
                  const vPrice = visit.priceAtBooking || visit.serviceIds.reduce((sum, sId) => {
                    const s = services.find((x) => x.id === sId);
                    return sum + (s?.price || 0);
                  }, 0);
                  return (
                    <div key={visit.id} className="flex justify-between items-center text-sm border-b border-[#E9E1D6] pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-[#302A24]">
                          {visit.serviceIds.map(id => {
                            const s = services.find(x => x.id === id);
                            return s ? (s.variant ? `${s.name} (${s.variant})` : s.name) : "";
                          }).filter(Boolean).join(", ")}
                        </p>
                        <p className="text-xs text-[#74695E]">{format(new Date(visit.date), "MMM dd, yyyy")}</p>
                      </div>
                      <span className="font-semibold text-[#302A24]">₹{vPrice}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#74695E] text-center py-4">No previous visits found.</p>
            )}
          </div>
          
        </div>
      </ScrollArea>
    </div>
  );
}
