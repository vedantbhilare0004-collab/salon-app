"use client";

import { MoreHorizontal, Phone, CheckCircle, Clock, Play, CheckCircle2, XCircle, FileText, History, RotateCcw } from "lucide-react";
import { useData } from "@/lib/store";
import { type Appointment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppointmentActionMenuProps {
  appointment: Appointment;
  onViewDetails?: () => void;
  onViewHistory?: () => void;
}

export function AppointmentActionMenu({ appointment, onViewDetails, onViewHistory }: AppointmentActionMenuProps) {
  const {
    completeAppointment,
    updateAppointmentStatus,
    cancelAppointment,
  } = useData();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3]">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-[#FFFDFA] border-[#E9E1D6] text-[#302A24] shadow-md">
        {onViewDetails && (
          <DropdownMenuItem onClick={onViewDetails} className="hidden sm:flex text-[#302A24] hover:bg-[#F0EBE3] focus:bg-[#F0EBE3]">
            <FileText className="mr-2 h-4 w-4 text-[#A27C48]" />
            <span>View Details</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <a href={`tel:${appointment.customerPhone}`} className="text-[#302A24] hover:bg-[#F0EBE3] focus:bg-[#F0EBE3]">
            <Phone className="mr-2 h-4 w-4 text-[#74695E]" />
            <span>Call Customer</span>
          </a>
        </DropdownMenuItem>
        
        {onViewHistory && (
          <DropdownMenuItem onClick={onViewHistory} className="text-[#302A24] hover:bg-[#F0EBE3] focus:bg-[#F0EBE3]">
            <History className="mr-2 h-4 w-4 text-[#74695E]" />
            <span>Customer History</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-[#E9E1D6]" />

        {appointment.status !== "completed" && !["cancelled", "rejected", "no_show"].includes(appointment.status) && (
          <DropdownMenuItem 
            onClick={async () => {
              try {
                await completeAppointment(appointment.id);
                toast.success("Service marked as completed!");
              } catch (e) {
                toast.error("Failed to complete appointment");
              }
            }}
            className="text-[#355B3C] font-semibold focus:bg-[#E0EBDD] focus:text-[#355B3C]"
          >
            <CheckCircle2 className="mr-2 h-4 w-4 text-[#355B3C]" />
            <span>Mark as Completed</span>
          </DropdownMenuItem>
        )}

        {appointment.status === "completed" && (
          <DropdownMenuItem 
            onClick={async () => {
              try {
                await updateAppointmentStatus(appointment.id, "pending");
                toast.info("Appointment restored to Pending");
              } catch (e) {
                toast.error("Failed to update status");
              }
            }}
            className="text-[#A27C48] focus:bg-[#F0EBE3]"
          >
            <RotateCcw className="mr-2 h-4 w-4 text-[#A27C48]" />
            <span>Reopen as Pending</span>
          </DropdownMenuItem>
        )}
        
        {appointment.status !== "completed" && !["cancelled", "rejected"].includes(appointment.status) && (
          <>
            <DropdownMenuSeparator className="bg-[#E9E1D6]" />
            <DropdownMenuItem 
              onClick={async () => {
                try {
                  await cancelAppointment(appointment.id);
                  toast.success("Appointment cancelled");
                } catch (e) {
                  toast.error("Failed to cancel appointment");
                }
              }}
              className="text-[#8C3930] focus:bg-[#F7E7E3] focus:text-[#8C3930]"
            >
              <XCircle className="mr-2 h-4 w-4" />
              <span>Cancel Appointment</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
