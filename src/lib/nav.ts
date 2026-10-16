import type { Role } from "@/lib/types";
import {
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  LayoutDashboard,
  Scissors,
  Settings,
  Tag,
  UserCog,
  UserRound,
  Users,
  Home,
  Code,
  QrCode,
  Receipt,
  BarChart3,
  Sparkles,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
}

export const NAV: Record<Role, NavItem[]> = {
  customer: [
    { label: "My Bookings", href: "/customer", icon: CalendarCheck },
    { label: "Treatments", href: "/treatments", icon: Scissors },
    { label: "Offers", href: "/offers", icon: Tag },
    { label: "Book Appointment", href: "/book", icon: CalendarPlus },
    { label: "My Profile", href: "/customer/profile", icon: UserRound },
  ],
  staff: [
    { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
    { label: "My Appointments", href: "/staff/appointments", icon: CalendarCheck },
    { label: "Schedule", href: "/staff/schedule", icon: CalendarDays },
    { label: "Settings", href: "/staff/settings", icon: Settings },
    { label: "Profile", href: "/staff/profile", icon: UserRound },
    { label: "Crafted By", href: "/staff/developer", icon: Code },
  ],
  owner: [
    { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { label: "Appointments", href: "/owner/appointments", icon: CalendarCheck },
    { label: "Scanner", href: "/owner/scanner", icon: QrCode },
    { label: "Billing", href: "/owner/billing", icon: Receipt },
    { label: "Reports", href: "/owner/reports", icon: BarChart3 },
    { label: "Client CRM", href: "/owner/customers", icon: Users },
    { label: "Staff", href: "/owner/staff", icon: UserCog },
    { label: "Services", href: "/owner/services", icon: Scissors },
    { label: "Offers", href: "/owner/offers", icon: Tag },
    { label: "Settings", href: "/owner/settings", icon: Settings },
    { label: "Profile", href: "/owner/profile", icon: UserRound },
    { label: "Crafted By", href: "/owner/developer", icon: Code },
  ],
  developer: [
    { label: "Dev Console", href: "/developer", icon: Code },
    { label: "Owner Management", href: "/developer/owners", icon: UserCog },
    { label: "Registered Users", href: "/developer/users", icon: Users },
    { label: "Visitor Traffic", href: "/developer/visitors", icon: BarChart3 },
    { label: "Test Sanctuary", href: "/customer", icon: Home },
    { label: "Test Owner Suite", href: "/owner", icon: LayoutDashboard },
    { label: "Test Staff Floor", href: "/staff", icon: CalendarCheck },
  ],
};

export const ROLE_TAGLINE: Record<Role, string> = {
  customer: "Your salon, beautifully booked",
  staff: "Run the floor with confidence",
  owner: "Manage every branch, effortlessly",
  developer: "Super Admin & Developer Control Suite",
};
