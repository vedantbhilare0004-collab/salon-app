"use client";

import { useState, useMemo } from "react";
import {
  Eye,
  UserCog,
  UserMinus,
  UserPlus,
  Trash2,
  Scissors,
  MapPin,
  Phone,
  Mail,
  Search,
  Check,
  AlertTriangle,
  UserCheck,
  Building2,
  Sparkles,
  X,
} from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId, type User } from "@/lib/types";
import { PageHeader, Section, EmptyState, UserAvatar } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COMMON_POSITIONS = [
  "Master Stylist & Colorist",
  "Senior Barber & Hair Stylist",
  "Ayurvedic Trichologist",
  "Dermal Aesthetician & Facialist",
  "Nail & Lash Artist",
  "Junior Stylist",
  "Salon Apprentice",
];

export default function OwnerStaffPage() {
  const {
    currentUser,
    users,
    services,
    getServicesFor,
    toggleStaffActive,
    createStaffMember,
    removeStaff,
    convertToStaff,
  } = useData();

  // Dialog states
  const [viewStaffId, setViewStaffId] = useState<string | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAssignCustomerOpen, setIsAssignCustomerOpen] = useState(false);
  const [removeTargetUser, setRemoveTargetUser] = useState<User | null>(null);

  // Form states: Direct staff creation
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPosition, setNewPosition] = useState(COMMON_POSITIONS[0]);
  const [newBranch, setNewBranch] = useState<BranchId>("koregaon");
  const [newServices, setNewServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states: Assign customer to staff
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [assignPosition, setAssignPosition] = useState(COMMON_POSITIONS[0]);
  const [assignBranch, setAssignBranch] = useState<BranchId>("koregaon");
  const [assignServices, setAssignServices] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  if (!currentUser) return null;

  const staff = users.filter((u) => u.role === "staff");
  const customers = users.filter((u) => u.role === "customer");

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const viewDetail = staff.find((s) => s.id === viewStaffId || s.uid === viewStaffId);
  const branchServices = getServicesFor(newBranch);
  const assignBranchServices = getServicesFor(assignBranch);

  const toggleNewService = (id: string) => {
    setNewServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAssignService = (id: string) => {
    setAssignServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Handle direct staff creation
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      toast.error("Please provide both name and phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStaffMember({
        fullName: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
        branch: newBranch,
        position: newPosition,
        services: newServices,
      });

      if (res.ok) {
        toast.success(`Staff member "${newName}" added successfully!`);
        setIsAddStaffOpen(false);
        setNewName("");
        setNewPhone("");
        setNewEmail("");
        setNewServices([]);
      } else {
        toast.error(res.error || "Failed to create staff member.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error creating staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle assigning registered customer as staff
  const handleAssignCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a registered customer.");
      return;
    }

    setIsAssigning(true);
    try {
      const res = await convertToStaff(selectedCustomerId, {
        branch: assignBranch,
        position: assignPosition,
        services: assignServices,
      });

      if (res.ok) {
        const cust = customers.find((c) => c.id === selectedCustomerId);
        toast.success(`Customer "${cust?.fullName || selectedCustomerId}" is now activated as staff!`);
        setIsAssignCustomerOpen(false);
        setSelectedCustomerId(null);
        setCustomerSearch("");
        setAssignServices([]);
      } else {
        toast.error(res.error || "Failed to convert customer to staff.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error converting customer.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle removing staff member
  const handleConfirmRemove = async (deletePermanently: boolean) => {
    if (!removeTargetUser) return;
    try {
      await removeStaff(removeTargetUser.id, deletePermanently);
      if (deletePermanently) {
        toast.success(`Staff record "${removeTargetUser.fullName}" deleted permanently.`);
      } else {
        toast.success(`"${removeTargetUser.fullName}" removed from staff (reverted to customer).`);
      }
      setRemoveTargetUser(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to remove staff member.");
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header with Direct Add & Assign Customer CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E9E1D6] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#302A24]">
            Staff Operations & Roster
          </h1>
          <p className="text-xs sm:text-sm text-[#74695E] mt-1">
            {staff.filter((s) => s.active).length} active stylists on duty · {staff.length} registered staff members
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Assign from Customers */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssignCustomerOpen(true)}
            className="h-9 gap-1.5 border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] font-medium text-xs rounded-md shadow-2xs"
          >
            <UserCheck className="h-4 w-4 text-[#A27C48]" />
            <span>Assign from Customers</span>
          </Button>

          {/* Add New Staff Directly */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddStaffOpen(true)}
            className="h-9 gap-1.5 bg-[#A27C48] hover:bg-[#876438] text-white font-medium text-xs rounded-md shadow-xs transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Staff</span>
          </Button>
        </div>
      </div>

      {/* 2. Staff Cards Grid */}
      {staff.length === 0 ? (
        <Card className="p-8 border border-[#E9E1D6] bg-[#FFFDFA] rounded-md text-center">
          <EmptyState
            icon={UserCog}
            title="No staff members registered yet"
            description="Add your first staff stylist or convert a registered customer into a staff member using the buttons above."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => {
            const stylistServices = s.staffBranch ? getServicesFor(s.staffBranch) : [];
            const isGuestOrMock = s.id.startsWith("staff_") || s.fullName.toLowerCase() === "guest";

            return (
              <Card
                key={s.id}
                className="p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs hover:border-[#A27C48]/60 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header: Avatar, Name & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      name={s.fullName}
                      color={s.avatarColor}
                      className="h-11 w-11 rounded-full shrink-0 border border-[#E9E1D6]"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#302A24] truncate">
                        {s.fullName}
                      </p>
                      <p className="text-xs text-[#74695E] flex items-center gap-1 mt-0.5 truncate">
                        <Scissors className="h-3 w-3 text-[#A27C48] shrink-0" />
                        <span>{s.staffPosition || "Salon Stylist"}</span>
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0",
                      s.active
                        ? "bg-[#E0EBDD] text-[#355B3C] border-[#E0EBDD]"
                        : "bg-[#F0EBE3] text-[#74695E] border-[#E9E1D6]"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full mr-1",
                        s.active ? "bg-[#355B3C]" : "bg-[#74695E]"
                      )}
                    />
                    {s.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Details Box: Phone, ID */}
                <div className="rounded-md bg-[#F0EBE3]/40 border border-[#E9E1D6] p-2.5 space-y-1.5 text-xs text-[#74695E]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[#74695E]">
                      <MapPin className="h-3 w-3 text-[#A27C48]" />
                      <span>Glow & Glamour Salon</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#74695E]">
                      #{s.id.slice(0, 10)}
                    </span>
                  </div>

                  {s.phone && (
                    <div className="flex items-center gap-1 text-[#302A24]">
                      <Phone className="h-3 w-3 text-[#74695E]" />
                      <a href={`tel:${s.phone}`} className="hover:underline hover:text-[#A27C48] truncate">
                        {s.phone}
                      </a>
                    </div>
                  )}

                  {s.email && (
                    <div className="flex items-center gap-1 text-[#74695E] truncate">
                      <Mail className="h-3 w-3 text-[#74695E]" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}

                  <div className="pt-1 text-[11px] text-[#74695E] flex items-center justify-between border-t border-[#E9E1D6]">
                    <span>Assigned Services:</span>
                    <strong className="text-[#302A24] font-medium">
                      {(s.staffServices || []).length > 0
                        ? `${(s.staffServices || []).length} treatments`
                        : "All catalog services"}
                    </strong>
                  </div>
                </div>

                {/* Actions: View, Toggle Active, and Remove */}
                <div className="pt-2 border-t border-[#E9E1D6] flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-[#302A24] border-[#E9E1D6] hover:bg-[#F0EBE3] rounded-md gap-1 flex-1"
                    onClick={() => setViewStaffId(s.id)}
                  >
                    <Eye className="h-3.5 w-3.5 text-[#74695E]" />
                    <span>View</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-8 text-xs rounded-md gap-1 flex-1 font-medium transition-colors",
                      s.active
                        ? "text-[#74695E] hover:bg-[#F0EBE3] border-[#E9E1D6]"
                        : "text-[#355B3C] bg-[#E0EBDD] border-[#E0EBDD] hover:bg-[#d5e3d1]"
                    )}
                    onClick={() => {
                      toggleStaffActive(s.id);
                      toast.success(s.active ? `Deactivated ${s.fullName}` : `Activated ${s.fullName}`);
                    }}
                  >
                    {s.active ? (
                      <>
                        <UserMinus className="h-3.5 w-3.5 text-[#74695E]" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5 text-[#355B3C]" />
                        <span>Activate</span>
                      </>
                    )}
                  </Button>

                  {/* Remove Staff Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRemoveTargetUser(s)}
                    className="h-8 px-2 text-[#8C3930] hover:bg-[#F7E7E3] hover:text-[#702d26] rounded-md"
                    title="Remove staff member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 3. MODAL: Add New Staff Directly */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="theme-owner font-sans sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-[#302A24]">
              <UserPlus className="h-5 w-5 text-[#A27C48]" />
              <span>Add New Staff Member</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#74695E]">
              Create a new stylist profile for your salon floor. They will immediately appear on the roster.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStaff} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#302A24]">Full Name *</Label>
              <Input
                required
                placeholder="e.g. Ramesh Kulkarni"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#302A24]">Phone Number *</Label>
                <Input
                  required
                  placeholder="+91 98000 00000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#302A24]">Email Address (Optional)</Label>
                <Input
                  type="email"
                  placeholder="stylist@salon.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#302A24]">Staff Position / Role</Label>
              <div className="space-y-2">
                <select
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-xs text-[#302A24] focus:outline-none focus:ring-1 focus:ring-[#A27C48]"
                >
                  {COMMON_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Or enter custom position..."
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="h-8 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#302A24]">
                Assigned Treatments ({newServices.length} selected)
              </Label>
              <div className="max-h-36 overflow-y-auto border border-[#E9E1D6] rounded-md p-2 space-y-1 bg-[#F0EBE3]/30">
                {branchServices.map((svc) => {
                  const isChecked = newServices.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleNewService(svc.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-1.5 text-xs rounded-md border transition-colors text-left",
                        isChecked
                          ? "bg-[#FFFDFA] border-[#A27C48] text-[#302A24] font-medium"
                          : "border-transparent hover:bg-[#FFFDFA] text-[#74695E]"
                      )}
                    >
                      <span className="truncate">{svc.name}</span>
                      <span className="text-[10px] text-[#74695E]">₹{svc.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddStaffOpen(false)}
                className="h-9 text-xs rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 text-xs rounded-md bg-[#A27C48] hover:bg-[#876438] text-white font-medium transition-colors"
              >
                {isSubmitting ? "Creating..." : "Save Staff Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. MODAL: Assign Staff from Registered Customers */}
      <Dialog open={isAssignCustomerOpen} onOpenChange={setIsAssignCustomerOpen}>
        <DialogContent className="theme-owner font-sans sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-[#302A24]">
              <UserCheck className="h-5 w-5 text-[#A27C48]" />
              <span>Assign Staff from Registered Customers</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#74695E]">
              Select any registered customer profile and elevate their role to staff without creating duplicate accounts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignCustomer} className="space-y-4 py-2">
            {/* Customer Search & Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-[#302A24]">
                  Select Customer ({customers.length} registered)
                </Label>
                <span className="text-[11px] text-[#74695E]">
                  {filteredCustomers.length} displayed
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#74695E]" />
                <Input
                  placeholder="Search by name, phone (+91...), email, or customer ID..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-8 pr-8 h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
                />
                {customerSearch && (
                  <button
                    type="button"
                    onClick={() => setCustomerSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#74695E] hover:text-[#302A24] p-0.5"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Customer List */}
              <div className="max-h-64 sm:max-h-72 overflow-y-auto border border-[#E9E1D6] rounded-md divide-y divide-[#E9E1D6] bg-[#FFFDFA] shadow-2xs">
                {filteredCustomers.length === 0 ? (
                  <p className="p-4 text-xs text-[#74695E] text-center">
                    No matching customer accounts found for "{customerSearch}".
                  </p>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomerId === cust.id;
                    return (
                      <div
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className={cn(
                          "p-2.5 flex items-center justify-between cursor-pointer transition-colors text-xs",
                          isSelected
                            ? "bg-[#F0EBE3] text-[#302A24] border-l-4 border-[#A27C48]"
                            : "hover:bg-[#F0EBE3]/40 text-[#302A24]"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar
                            name={cust.fullName}
                            color={cust.avatarColor}
                            className="h-8 w-8 text-xs shrink-0 rounded-full border border-[#E9E1D6]"
                          />
                          <div className="min-w-0 leading-tight">
                            <p className="font-semibold truncate">{cust.fullName}</p>
                            <p className="text-[11px] text-[#74695E] truncate">
                              {cust.phone || cust.email || `#${cust.id.slice(0, 8)}`}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-[#A27C48] text-white flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {selectedCustomerId && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#302A24]">Staff Position</Label>
                  <select
                    value={assignPosition}
                    onChange={(e) => setAssignPosition(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-xs text-[#302A24] focus:outline-none focus:ring-1 focus:ring-[#A27C48]"
                  >
                    {COMMON_POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#302A24]">
                    Qualified Treatments ({assignServices.length} selected)
                  </Label>
                  <div className="max-h-36 overflow-y-auto border border-[#E9E1D6] rounded-md p-2 space-y-1 bg-[#F0EBE3]/30">
                    {assignBranchServices.map((svc) => {
                      const isChecked = assignServices.includes(svc.id);
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => toggleAssignService(svc.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-1.5 text-xs rounded-md border transition-colors text-left",
                            isChecked
                              ? "bg-[#FFFDFA] border-[#A27C48] text-[#302A24] font-medium"
                              : "border-transparent hover:bg-[#FFFDFA] text-[#74695E]"
                          )}
                        >
                          <span className="truncate">{svc.name}</span>
                          <span className="text-[10px] text-[#74695E]">₹{svc.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAssignCustomerOpen(false)}
                className="h-9 text-xs rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isAssigning || !selectedCustomerId}
                className="h-9 text-xs rounded-md bg-[#A27C48] hover:bg-[#876438] text-white font-medium transition-colors"
              >
                {isAssigning ? "Assigning..." : "Assign as Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. MODAL: Remove Staff Confirmation */}
      <Dialog open={!!removeTargetUser} onOpenChange={(o) => !o && setRemoveTargetUser(null)}>
        <DialogContent className="theme-owner font-sans sm:max-w-[440px] rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#8C3930] text-base font-semibold">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>Remove Staff Member</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#74695E] leading-relaxed pt-1">
              You are removing <strong>{removeTargetUser?.fullName}</strong> from the staff roster. Choose how you would like to handle their account:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-3">
            <div className="p-3 rounded-md border border-[#E9E1D6] bg-[#F0EBE3]/40 text-xs space-y-1">
              <p className="font-semibold text-[#302A24]">
                Option A: Revoke Staff Role
              </p>
              <p className="text-[#74695E]">
                Removes them from the staff floor and booking roster, converting their profile back into a normal customer account.
              </p>
            </div>

            <div className="p-3 rounded-md border border-[#F7E7E3] bg-[#F7E7E3]/60 text-xs space-y-1">
              <p className="font-semibold text-[#8C3930]">
                Option B: Delete Record Permanently
              </p>
              <p className="text-[#8C3930]">
                Completely deletes this record from the salon database (recommended for test/guest entries like staff_1 or duplicate accounts).
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRemoveTargetUser(null)}
              className="text-xs h-9 rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConfirmRemove(false)}
              className="text-xs h-9 rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]"
            >
              Revoke Staff Role
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleConfirmRemove(true)}
              className="text-xs h-9 rounded-md bg-[#8C3930] hover:bg-[#702d26] text-white font-medium"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. MODAL: View Staff Details */}
      <Dialog open={!!viewStaffId} onOpenChange={(o) => !o && setViewStaffId(null)}>
        <DialogContent className="theme-owner font-sans sm:max-w-[480px] rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
          {viewDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold text-[#302A24]">Staff Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={viewDetail.fullName}
                    color={viewDetail.avatarColor}
                    className="h-14 w-14 rounded-full text-lg border border-[#E9E1D6]"
                  />
                  <div>
                    <h3 className="font-semibold text-base text-[#302A24]">
                      {viewDetail.fullName}
                    </h3>
                    <p className="text-xs text-[#74695E]">
                      {viewDetail.staffPosition || "Salon Stylist"}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-1 text-[9px] font-medium uppercase tracking-wider px-2 py-0.2 rounded-md",
                        viewDetail.active
                          ? "bg-[#E0EBDD] text-[#355B3C] border-[#E0EBDD]"
                          : "bg-[#F0EBE3] text-[#74695E] border-[#E9E1D6]"
                      )}
                    >
                      {viewDetail.active ? "Active on duty" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-md bg-[#F0EBE3]/40 p-3 text-xs border border-[#E9E1D6]">
                  <span className="text-[#74695E]">Staff ID</span>
                  <span className="text-right font-mono text-[#302A24]">#{viewDetail.id}</span>
                  <span className="text-[#74695E]">Salon</span>
                  <span className="text-right text-[#302A24] font-medium">
                    Glow & Glamour Hair Studio
                  </span>
                  <span className="text-[#74695E]">Phone</span>
                  <span className="text-right text-[#302A24]">{viewDetail.phone || "—"}</span>
                  <span className="text-[#74695E]">Email</span>
                  <span className="text-right text-[#302A24] truncate">{viewDetail.email || "—"}</span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#302A24]">
                    Qualified Treatments
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {viewDetail.staffServices && viewDetail.staffServices.length > 0 ? (
                      viewDetail.staffServices.map((id) => {
                        const svc = services.find((x) => x.id === id);
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="bg-[#F0EBE3] text-[#302A24] border border-[#E9E1D6] text-xs rounded-md"
                          >
                            {svc?.name || id}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-xs text-[#74695E]">
                        Qualified for all salon treatments
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewStaffId(null)}
                  className="text-xs h-9 rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
