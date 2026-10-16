"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Copy,
  Check,
  Calendar,
  Mail,
  Phone,
  User,
  Heart,
  KeyRound,
  LogOut,
  Clock,
  ArrowRight,
  FileCheck,
  Settings,
  CalendarCheck,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useData } from "@/lib/store";
import { userService } from "@/lib/services/userService";
import { PasswordDialog } from "@/components/password-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const { currentUser, appointments, logout } = useData();
  const [pwOpen, setPwOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [notes, setNotes] = useState(currentUser?.notes || "");
  const [gender, setGender] = useState(currentUser?.gender || "");
  const [birthday, setBirthday] = useState(currentUser?.birthday || "");

  if (!currentUser) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground font-sans text-sm">Please sign in to view your profile.</p>
        <Link href="/login">
          <Button className="min-h-[44px] px-6 rounded-xs bg-[#161514] text-[#FAF8F5] hover:bg-[#252321] text-xs uppercase tracking-wider font-semibold">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate statistics
  const userAppointments = appointments.filter(
    (a) => a.customerId === currentUser.id || a.customerUid === currentUser.uid
  );
  const completedCount = userAppointments.filter((a) =>
    ["completed", "Completed"].includes(a.status)
  ).length;
  const activeCount = userAppointments.filter((a) =>
    ["pending", "confirmed", "checked_in", "in_service", "Booked", "Confirmed", "In Progress"].includes(a.status)
  ).length;

  const joinDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "October 2026";

  const memberIdDisplay = currentUser.userId || currentUser.id || "GG-CUSTOMER";

  const handleCopyId = () => {
    navigator.clipboard?.writeText(memberIdDisplay);
    setCopiedId(true);
    toast.success("Member ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your contact phone number.");
      return;
    }

    setSaving(true);
    try {
      await userService.updateUserByUid(currentUser.uid, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
        gender: gender.trim(),
        birthday: birthday.trim(),
      });
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      toast.error(err.message || "Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setFullName(currentUser.fullName || "");
    setPhone(currentUser.phone || "");
    setAddress(currentUser.address || "");
    setNotes(currentUser.notes || "");
    setGender(currentUser.gender || "");
    setBirthday(currentUser.birthday || "");
    toast.info("Profile changes reset to current saved values.");
  };

  return (
    <div className="w-full max-w-full space-y-8 sm:space-y-10 pb-16 animate-in fade-in duration-300">
      {/* 1 & 2 & 3. Header: Eyebrow + Title & Description + Responsive Action Buttons */}
      <div className="border-b border-[#EAE1D2] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="space-y-1 min-w-0">
          {/* 1. Account Details Eyebrow */}
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E6D38]">
            <User className="w-3.5 h-3.5" />
            <span>Account Details</span>
          </div>

          {/* 2. Heading and Short Description */}
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[#1E1B18] break-words">
            My Profile &amp; Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#78716A] max-w-xl font-sans leading-relaxed">
            Manage your personal contact details, styling preferences, and appointment history.
          </p>
        </div>

        {/* 3. Settings, My Bookings, and Book Appointment actions — Fully responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto shrink-0">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <Link href="/customer/settings" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto min-h-[44px] px-3.5 sm:px-4 rounded-xs border-[#D8C7B0] hover:border-[#8E6D38] text-xs uppercase tracking-wider text-[#221F1C] hover:bg-[#F5EFEB] gap-1.5 font-medium transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                <span className="truncate">Settings</span>
              </Button>
            </Link>

            <Link href="/customer" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto min-h-[44px] px-3.5 sm:px-4 rounded-xs border-[#D8C7B0] hover:border-[#8E6D38] text-xs uppercase tracking-wider text-[#221F1C] hover:bg-[#F5EFEB] gap-1.5 font-medium transition-colors"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                <span className="truncate">My Bookings</span>
              </Button>
            </Link>
          </div>

          <Link href="/book" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-h-[44px] px-5 rounded-xs bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors">
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* 4. Customer Membership Card — Elegant Light Ivory & Champagne Aesthetic */}
      <div className="relative overflow-hidden rounded-xs bg-[#FAF7F2] border border-[#E2D6C5] p-5 sm:p-7 text-[#221F1C] shadow-[0_2px_15px_-4px_rgba(40,30,20,0.05)]">
        {/* Subtle decorative gold accent corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E2D6C5]/30 to-transparent pointer-events-none rounded-tr-xs" />

        <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
          {/* Top Row: Brand Monogram & Verified Customer Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xs bg-white border border-[#D8C7B0] font-heading text-lg sm:text-xl font-serif font-bold text-[#8E6D38] shadow-2xs shrink-0">
                G
              </div>
              <div className="min-w-0">
                <p className="font-heading text-base sm:text-lg font-semibold tracking-tight text-[#222220] truncate">
                  Glow &amp; Glamour
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8E6D38] font-medium truncate">
                  Hair Studio &amp; Spa · Koregaon
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D8C7B0] text-[#222220] text-[10px] uppercase font-bold tracking-wider shadow-2xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Customer</span>
            </div>
          </div>

          {/* Center: Registered Client Name & Active Status */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#8E6D38] font-semibold block">
              Registered Client
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1E1B18] tracking-tight break-words">
              {currentUser.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Account
              </span>
              <span className="text-[#D8C7B0] hidden xs:inline">•</span>
              <span className="text-[#78716A]">Member since {joinDate}</span>
            </div>
          </div>

          {/* Bottom Strip: Metadata Grid with Working Copy Button */}
          <div className="pt-4 border-t border-[#E8DFC8] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
            {/* Member ID */}
            <div className="bg-white/80 border border-[#E8DFC8] rounded-xs p-3 min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#78716A] font-semibold">Member ID</p>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-[#222220] truncate">
                  #{memberIdDisplay}
                </span>
                <button
                  onClick={handleCopyId}
                  type="button"
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-xs text-[#8E6D38] hover:text-[#222220] hover:bg-[#FAF7F2] transition-colors border border-transparent hover:border-[#D8C7B0] shrink-0"
                  title="Copy Member ID"
                  aria-label="Copy Member ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white/80 border border-[#E8DFC8] rounded-xs p-3 min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#78716A] font-semibold">Account Status</p>
              <p className="font-heading text-sm font-medium text-[#222220] mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Active Client</span>
              </p>
            </div>

            {/* Salon Location */}
            <div className="bg-white/80 border border-[#E8DFC8] rounded-xs p-3 min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#78716A] font-semibold">Salon Location</p>
              <p className="text-xs font-medium text-[#222220] mt-1 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                <span className="truncate">Laxmi Nagar, Koregaon</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Summary Cards: Completed Visits, Upcoming Bookings, Account Type */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completed Visits */}
        <div className="bg-white border border-[#EAE1D2] rounded-xs p-5 shadow-[0_2px_10px_-4px_rgba(40,30,20,0.03)] flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8E6D38] truncate">
              Completed Visits
            </p>
            <h3 className="font-heading text-2xl font-bold text-[#1E1B18] mt-1">
              {completedCount}
            </h3>
            <p className="text-[11px] text-[#78716A] mt-0.5 truncate">Finished salon sessions</p>
          </div>
          <div className="h-11 w-11 rounded-xs bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#8E6D38] shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white border border-[#EAE1D2] rounded-xs p-5 shadow-[0_2px_10px_-4px_rgba(40,30,20,0.03)] flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8E6D38] truncate">
              Upcoming Bookings
            </p>
            <h3 className="font-heading text-2xl font-bold text-[#1E1B18] mt-1">
              {activeCount}
            </h3>
            <Link
              href="/customer"
              className="inline-flex items-center gap-1 text-[11px] text-[#8E6D38] hover:text-[#222220] font-semibold mt-0.5 group"
            >
              <span>View My Bookings</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="h-11 w-11 rounded-xs bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#8E6D38] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Account Type */}
        <div className="bg-white border border-[#EAE1D2] rounded-xs p-5 shadow-[0_2px_10px_-4px_rgba(40,30,20,0.03)] flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8E6D38] truncate">
              Account Type
            </p>
            <h3 className="font-heading text-xl font-bold text-[#1E1B18] mt-1 truncate">
              Direct Client
            </h3>
            <p className="text-[11px] text-[#78716A] mt-0.5 truncate">Online booking enabled</p>
          </div>
          <div className="h-11 w-11 rounded-xs bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#8E6D38] shrink-0">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 6 & 7. Desktop Two-Column Layout (Personal Information Form + Account Security Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 6. Personal Information Form (Takes 8 columns on Desktop for balanced, readable width) */}
        <div className="lg:col-span-8 bg-white border border-[#EAE1D2] rounded-xs p-5 sm:p-7 md:p-8 shadow-[0_4px_20px_-4px_rgba(40,30,20,0.03)] min-w-0">
          <div className="border-b border-[#EAE1D2] pb-4 mb-6">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8E6D38]">
              Personal Information
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[#1E1B18] mt-0.5">
              Contact &amp; Styling Details
            </h2>
            <p className="text-xs text-[#78716A] mt-1">
              Keep your contact phone and styling notes updated so our stylists can best prepare for your appointment.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Full Name */}
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#221F1C] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                  <span>Full Name</span>
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full legal name"
                  className="min-h-[44px] rounded-xs border-[#EAE1D2] bg-[#FAF8F5]/60 focus-visible:border-[#8E6D38] focus-visible:ring-[#8E6D38]/20 text-xs sm:text-sm font-sans"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#221F1C] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                  <span>Contact Phone (WhatsApp)</span>
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98220 00000"
                  className="min-h-[44px] rounded-xs border-[#EAE1D2] bg-[#FAF8F5]/60 focus-visible:border-[#8E6D38] focus-visible:ring-[#8E6D38]/20 text-xs sm:text-sm font-sans"
                />
              </div>

              {/* Email (Readonly authentication email) */}
              <div className="space-y-1.5 min-w-0 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#221F1C] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                  <span>Email Address</span>
                </label>
                <div className="relative">
                  <Input
                    value={currentUser.email || "No email linked"}
                    disabled
                    className="min-h-[44px] rounded-xs border-[#EAE1D2] bg-[#F5F2ED] text-[#78716A] text-xs sm:text-sm font-sans cursor-not-allowed pr-24 truncate"
                  />
                  <span className="absolute right-2 top-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-[0.1rem] bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-[10px] text-[#A69C8E]">
                  Booking confirmation receipts and invoices are sent to this address.
                </p>
              </div>

              {/* Address / Location */}
              <div className="space-y-1.5 min-w-0 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#221F1C] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                  <span>Your Address / Area</span>
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Laxmi Nagar, Koregaon, Maharashtra - 415501"
                  className="min-h-[44px] rounded-xs border-[#EAE1D2] bg-[#FAF8F5]/60 focus-visible:border-[#8E6D38] focus-visible:ring-[#8E6D38]/20 text-xs sm:text-sm font-sans"
                />
              </div>

              {/* Birthday */}
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#221F1C] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                  <span>Date of Birth (Optional)</span>
                </label>
                <Input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="min-h-[44px] rounded-xs border-[#EAE1D2] bg-[#FAF8F5]/60 focus-visible:border-[#8E6D38] focus-visible:ring-[#8E6D38]/20 text-xs sm:text-sm font-sans"
                />
                <p className="text-[10px] text-[#A69C8E]">Receive special birthday offers from the salon.</p>
              </div>

              {/* Gender / Salutation */}
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#221F1C] flex items-center gap-1.5">
                  <span>Preferred Title / Salutation</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  aria-label="Preferred Title or Salutation"
                  className="min-h-[44px] w-full rounded-xs border border-[#EAE1D2] bg-[#FAF8F5]/60 px-3 text-xs sm:text-sm text-[#221F1C] focus-visible:border-[#8E6D38] focus-visible:ring-[#8E6D38]/20 font-sans outline-none"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mx.">Mx.</option>
                </select>
              </div>
            </div>

            {/* Bespoke Styling & Salon Preferences */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#221F1C] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                <span>Styling Notes &amp; Preferences</span>
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sensitive skin, prefer specific hair treatments, prefer organic products, previous hair dye history..."
                rows={3}
                className="rounded-xs border-[#EAE1D2] bg-[#FAF8F5]/60 focus-visible:border-[#8E6D38] focus-visible:ring-[#8E6D38]/20 text-xs sm:text-sm font-sans"
              />
              <p className="text-[10px] text-[#A69C8E]">
                These preferences will be visible to your stylist during your appointments.
              </p>
            </div>

            {/* Form Actions with min 44px buttons */}
            <div className="pt-4 border-t border-[#EAE1D2] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetForm}
                disabled={saving}
                className="min-h-[44px] text-xs text-[#78716A] hover:text-[#1E1B18] rounded-xs justify-center"
              >
                Reset to Saved
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="min-h-[44px] px-6 rounded-xs bg-[#222220] text-[#FAF8F5] hover:bg-black border border-[#D8C7B0] text-xs font-medium uppercase tracking-wider shadow-sm justify-center transition-colors"
              >
                {saving ? (
                  <>
                    <Clock className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-2" /> Save Profile Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* 7. Account Security & Support Sidebar (Takes 4 columns on Desktop) */}
        <div className="lg:col-span-4 space-y-6 w-full min-w-0">
          {/* Security & Password Card */}
          <div className="bg-white border border-[#EAE1D2] rounded-xs p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(40,30,20,0.03)] space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8E6D38]">
                Account Security
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-semibold text-[#1E1B18] mt-0.5">
                Password &amp; Authentication
              </h3>
              <p className="text-xs text-[#78716A] mt-1">
                Update your account password or sign out of your current device session.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPwOpen(true)}
                className="min-h-[44px] w-full rounded-xs border-[#D8C7B0] hover:border-[#8E6D38] text-xs uppercase tracking-wider text-[#1E1B18] hover:bg-[#FAF7F2] font-medium justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-[#8E6D38]" />
                <span>Change Password</span>
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={logout}
                className="min-h-[44px] w-full rounded-xs bg-rose-700 hover:bg-rose-800 text-white text-xs uppercase tracking-wider font-semibold justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Salon Patron Assistance Card */}
          <div className="bg-[#FAF7F2] border border-[#E2D6C5] rounded-xs p-5 sm:p-6 text-xs text-[#5C5B56] space-y-3">
            <div className="flex items-center gap-2 text-[#8E6D38] font-semibold uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Koregaon Studio Desk</span>
            </div>
            <p className="text-[#222220] font-heading text-base font-semibold">
              Need assistance with an appointment?
            </p>
            <p className="leading-relaxed text-[#78716A]">
              Our concierge desk at Laxmi Nagar is available daily from 9:30 AM to 9:00 PM for custom bookings and bridal scheduling.
            </p>
            <div className="pt-2 border-t border-[#E8DFC8] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-[#222220]">
                <MapPin className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                <span>Laxmi Nagar, Koregaon</span>
              </div>
              <div className="flex items-center gap-2 text-[#222220]">
                <Phone className="w-3.5 h-3.5 text-[#8E6D38] shrink-0" />
                <a href="tel:+917058239061" className="hover:text-[#8E6D38] transition-colors font-semibold">
                  +91 70582 39061
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
}
