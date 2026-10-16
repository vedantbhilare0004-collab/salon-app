import type { AppointmentStatus } from "./types";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";

export function generateUserId(): string {
  let out = "";
  const chars = UPPER + DIGITS;
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function generateReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `GG-${out}`;
}

export function initials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatDate(iso?: string | null): string {
  if (!iso || typeof iso !== "string" || !iso.trim()) return "Ongoing";
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso?: string | null): string {
  if (!iso || typeof iso !== "string" || !iso.trim()) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return "recently";
  const time = new Date(iso).getTime();
  if (isNaN(time)) return "recently";
  const diff = Date.now() - time;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return "";
  const today = todayISO();
  if (dateStr === today) return "Today";
  const tomorrow = addDaysISO(1);
  if (dateStr === tomorrow) return "Tomorrow";
  const yesterday = addDaysISO(-1);
  if (dateStr === yesterday) return "Yesterday";

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function formatDateLabel(dateStr?: string | null): string {
  if (!dateStr) return "Unknown Date";
  const today = todayISO();
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = !year || !month || !day ? new Date(dateStr) : new Date(year, month - 1, day);
  const formatted = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (dateStr === today) return `Today • ${formatted}`;
  const tomorrow = addDaysISO(1);
  if (dateStr === tomorrow) return `Tomorrow • ${formatted}`;
  const yesterday = addDaysISO(-1);
  if (dateStr === yesterday) return `Yesterday • ${formatted}`;
  return formatted;
}

export function statusColor(status: AppointmentStatus): string {
  switch (status) {
    case "pending":
      return "bg-[#FBF3E6] text-[#8C6527] border-[#EFE0CA]";
    case "confirmed":
      return "bg-[#F0EBE3] text-[#302A24] border-[#E9E1D6]";
    case "checked_in":
      return "bg-[#F0EBE3] text-[#A27C48] border-[#DDCFBA]";
    case "in_service":
      return "bg-[#F0EBE3] text-[#876438] border-[#DDCFBA] font-semibold";
    case "completed":
      return "bg-[#E0EBDD] text-[#355B3C] border-[#C7DCC2]";
    case "cancelled":
    case "rejected":
      return "bg-[#F7E7E3] text-[#8C3930] border-[#EAC8C1]";
    case "no_show":
      return "bg-[#F0EBE3] text-[#74695E] border-[#E9E1D6]";
    default:
      return "bg-[#F0EBE3] text-[#74695E] border-[#E9E1D6]";
  }
}

/**
 * Checks whether an appointment was booked by a signed-in / registered customer
 * or by an unauthenticated guest / walk-in without an account.
 */
export function isRegisteredCustomerBooking(
  appointment: {
    customerUid?: string | null;
    customerId?: string | null;
    customerPhone?: string | null;
  },
  users?: { id?: string; uid?: string; phone?: string; role?: string }[]
): boolean {
  // 1. Explicit customerUid from Firebase Auth
  if (appointment.customerUid && appointment.customerUid.trim() !== "") {
    return true;
  }
  // 2. Customer ID is not guest/walkin
  if (
    appointment.customerId &&
    appointment.customerId !== "guest" &&
    appointment.customerId !== "walkin" &&
    !appointment.customerId.startsWith("guest_")
  ) {
    if (!users || users.length === 0) return true;
    const match = users.find(
      (u) => (u.id && u.id === appointment.customerId) || (u.uid && u.uid === appointment.customerId)
    );
    if (match) return true;
  }
  // 3. Match by phone against registered customer database
  if (appointment.customerPhone && users && users.length > 0) {
    const cleanPhone = appointment.customerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 10) {
      const last10 = cleanPhone.slice(-10);
      const match = users.find((u) => {
        if (!u.phone) return false;
        const uClean = u.phone.replace(/\D/g, "");
        return uClean.endsWith(last10);
      });
      if (match) return true;
    }
  }
  return false;
}

/**
 * Converts a numeric amount to Indian Rupee words (e.g. 1398 -> Rupees One Thousand Three Hundred Ninety-Eight Only)
 */
export function numberToWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return "Rupees Zero Only";
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertBelowThousand(n: number): string {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  }

  let num = Math.floor(Math.abs(amount));
  let words = "";

  if (num >= 10000000) {
    words += convertBelowThousand(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  if (num >= 100000) {
    words += convertBelowThousand(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (num >= 1000) {
    words += convertBelowThousand(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  if (num > 0) {
    words += convertBelowThousand(num);
  }

  return `Rupees ${words.trim()} Only`;
}
