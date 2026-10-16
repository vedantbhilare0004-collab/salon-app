export type Role = "customer" | "staff" | "owner" | "developer";

export type BranchId = "koregaon";

export interface Branch {
  id: BranchId;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  mapsUrl: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  averageServiceTime: number; // in minutes
  activeStaff: number;
  availableChairs: number;
  totalChairs: number;
  workingHours: WorkingHour[];
  updatedAt?: string;
}

export interface WorkingHour {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface User {
  id: string;
  uid: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  password?: string;
  preferredBranch: BranchId;
  role: Role;
  avatarColor: string;
  photoURL?: string;
  fcmToken?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  // staff extras
  staffBranch?: BranchId;
  staffPosition?: string;
  staffServices?: string[];
  active?: boolean;
  // owner extras
  ownerBranch?: BranchId;
  // rate limiting
  cancelStrikes?: number;
  blockedUntil?: string;
  // CRM fields
  notes?: string;
  tags?: string[];
  gender?: string;
  birthday?: string;
  location?: string;
}

export interface Customer {
  id: string; // Firestore document ID
  name: string;
  phone: string;
  email?: string;
  authUid: string | null; // null for guests, string for registered
  hasAccount: boolean;
  totalVisits: number;
  totalSpending: number;
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  serviceId: string;
  name: string;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  branchId: BranchId;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "draft" | "paid" | "void";
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "cash" | "upi" | "card" | "other";
  status: "completed" | "failed" | "refunded";
  createdAt: string;
}

export interface Service {
  id: string;
  branchId: BranchId;
  category: string;
  name: string;
  price: number;
  durationMin: number;
  durationMinutes?: number;
  active: boolean;
  isActive?: boolean;
  gender?: "male" | "female" | "unisex";
  variant?: string;
  archived?: boolean;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OfferPreset =
  | "editorial"
  | "festive"
  | "package"
  | "minimal"
  | "seasonal";

export type OfferCategory =
  | "Haircuts & Grooming"
  | "Hair Spa & Treatments"
  | "Facial & Skin Care"
  | "Hair Colour"
  | "Packages"
  | "Festive & Seasonal"
  | string;

export interface Campaign {
  id: string;
  branchId?: BranchId | "all";
  name: string;
  subtitle?: string;
  description: string;
  bannerUrl?: string;
  theme?: "festive-gold" | "editorial-charcoal" | "warm-ivory" | "festive-ruby" | "emerald-glow";
  startsAt: string;
  endsAt: string;
  active: boolean;
  isFeatured?: boolean;
  featureOnHome?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferDesignSettings {
  headingFont?: string;
  bodyFont?: string;
  headingSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  bodySize?: "xs" | "sm" | "md";
  priceSize?: "md" | "lg" | "xl" | "2xl" | "3xl";
  headingWeight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: "left" | "center";
  cardBg?: string;
  headingColor?: string;
  bodyColor?: string;
  priceColor?: string;
  badgeBg?: string;
  badgeColor?: string;
  borderColor?: string;
  borderWidth?: "none" | "1px" | "2px" | "3px";
  borderRadius?: "none" | "xs" | "sm" | "md" | "lg";
  shadow?: "none" | "xs" | "sm" | "md" | "lg" | "gold";
  buttonBg?: string;
  buttonColor?: string;
  iconName?: string;
  iconColor?: string;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "3:4" | "auto";
  padding?: "compact" | "normal" | "spacious";
  festiveGlow?: boolean;
}

export interface Offer {
  id: string;
  branchId: BranchId | "all";
  title: string;
  description: string;
  fullDescription?: string;
  badge: string;
  active: boolean;
  isActive?: boolean;
  startsAt: string;
  endsAt: string;
  category?: OfferCategory;
  campaignId?: string;
  campaignName?: string;
  preset?: OfferPreset;
  colorTheme?: "charcoal" | "champagne" | "rose" | "emerald" | "warm-ivory";
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  discountAmount?: number;
  features?: string[];
  serviceIds?: string[];
  includedServices?: string[];
  complimentaryServices?: string[];
  validUntil?: string;
  type?: "festive" | "newest" | "standard";
  imageUrl?: string;
  imageCrop?: "center" | "top" | "bottom";
  code?: string;
  isFeatured?: boolean;
  showOnHome?: boolean;
  displayOrder?: number;
  terms?: string[] | string;
  eligibility?: string;
  bookingRestrictions?: string;
  cancellationPolicy?: string;
  design?: OfferDesignSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceShift {
  id: string;
  staffId: string;
  staffName?: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  status: "Active" | "Completed";
  createdAt?: string;
  updatedAt?: string;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "in_service"
  | "completed"
  | "cancelled"
  | "rejected"
  | "no_show"
  | "Booked"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "No Show"
  | "Rescheduled";

export type QueueStatus =
  | "confirmed"
  | "waiting"
  | "in_service"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  branchId: BranchId;
  serviceIds: string[];
  serviceId?: string;
  date: string;
  time: string;
  startTime?: string;
  durationMinutes?: number;
  status: AppointmentStatus;
  isWalkIn: boolean;
  token: number | null;
  secureToken?: string; // For unauthenticated guest access
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  assignedStaffId?: string;
  staffId?: string;
  customerUid?: string;
  customerRole?: string;
  priceAtBooking?: number;
  offerId?: string;
  offerTitle?: string;
  offerPrice?: number;
  originalPrice?: number;
  discountAmount?: number;
  source?: "website" | "owner" | "phone" | "walk_in" | "whatsapp" | "instagram" | "staff" | "other";
  queuedAt?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  serviceStartedAt?: string;
  completedAt?: string;
  queueStatus?: QueueStatus;
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface QueueEntry {
  token: number | null;
  appointmentId: string | null;
  customerName: string;
  customerUid?: string;
  branchId: BranchId;
  isWalkIn: boolean;
  joinedAt: string;
}

export interface LiveQueueEntry {
  id: string; // Document ID
  customerId: string;
  appointmentId: string | null;
  branchId: BranchId;
  serviceIds: string[];
  staffId: string | null;
  customerName: string;
  phone: string;
  arrivalTime: string;
  status: QueueStatus;
  checkInTime: string;
  serviceStartTime: string | null;
  completedTime: string | null;
  isWalkIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  recipientId?: string;
  recipientUid?: string;
  audience?: Role;
  branchId?: BranchId;
  title: string;
  message: string;
  kind: "booking" | "cancel" | "reminder" | "announcement" | "system" | "queue";
  read: boolean;
  createdAt: string;
}

export interface ShopStatus {
  isOpen: boolean;
  nowServingToken: number | null;
  waitingCount: number;
  checkedInCount: number;
  inServiceCount: number;
  inShopCount: number;
  estimatedWaitMin: number;
  availableChairs: number;
  totalChairs: number;
}

export const BRANCHES: BranchId[] = ["koregaon"];

export const BRANCH_LABELS: Record<BranchId, string> = {
  koregaon: "Koregaon",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  in_service: "In Service",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  no_show: "No Show",
  Booked: "Booked",
  Confirmed: "Confirmed",
  "In Progress": "In Progress",
  Completed: "Completed",
  Cancelled: "Cancelled",
  "No Show": "No Show",
  Rescheduled: "Rescheduled",
};

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  staff: "Staff",
  owner: "Owner",
  developer: "Developer",
};
