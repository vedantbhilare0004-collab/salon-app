import { AppointmentStatus, STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium border";

  const colorStyles: Record<AppointmentStatus, string> = {
    pending: "bg-[#FBF3E6] text-[#8C6527] border-[#EFE0CA]",
    confirmed: "bg-[#F0EBE3] text-[#302A24] border-[#E9E1D6]",
    checked_in: "bg-[#F0EBE3] text-[#A27C48] border-[#DDCFBA]",
    in_service: "bg-[#F0EBE3] text-[#876438] border-[#DDCFBA] font-semibold",
    completed: "bg-[#E0EBDD] text-[#355B3C] border-[#C7DCC2]",
    cancelled: "bg-[#F7E7E3] text-[#8C3930] border-[#EAC8C1]",
    rejected: "bg-[#F7E7E3] text-[#8C3930] border-[#EAC8C1]",
    no_show: "bg-[#F0EBE3] text-[#74695E] border-[#E9E1D6]",
    Booked: "bg-[#FBF3E6] text-[#8C6527] border-[#EFE0CA]",
    Confirmed: "bg-[#F0EBE3] text-[#302A24] border-[#E9E1D6]",
    "In Progress": "bg-[#F0EBE3] text-[#876438] border-[#DDCFBA] font-semibold",
    Completed: "bg-[#E0EBDD] text-[#355B3C] border-[#C7DCC2]",
    Cancelled: "bg-[#F7E7E3] text-[#8C3930] border-[#EAC8C1]",
    "No Show": "bg-[#F0EBE3] text-[#74695E] border-[#E9E1D6]",
    Rescheduled: "bg-[#F0EBE3] text-[#74695E] border-[#E9E1D6]",
  };

  return (
    <span className={cn(baseStyles, colorStyles[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
