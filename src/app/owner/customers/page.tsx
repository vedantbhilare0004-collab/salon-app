"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  UserCog,
  Users,
  Sparkles,
  Phone,
  Mail,
  MessageCircle,
  CalendarCheck,
  Award,
  TrendingUp,
  Tag,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Plus,
  Edit3,
  Check,
  ExternalLink,
  DollarSign,
  Scissors,
  Filter,
  X,
} from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId, type User, type Appointment } from "@/lib/types";
import { PageHeader, EmptyState, UserAvatar } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConvertStaffDialog } from "@/components/owner/convert-staff-dialog";
import { formatPrice, formatDate, formatTime } from "@/lib/format";
import { userService } from "@/lib/services/userService";
import { toast } from "sonner";

export default function OwnerCustomers() {
  const { currentUser, activeBranchId, users, appointments, services, updateUser } = useData();
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "top" | "gold" | "frequent" | "new">("all");
  const [sortBy, setSortBy] = useState<"ltv" | "visits" | "newest" | "name">("ltv");
  
  // Selected client for 360 CRM Drawer
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Convert to staff dialog state
  const [convertFor, setConvertFor] = useState<string | null>(null);

  // New Client Registration Dialog State
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientGender, setNewClientGender] = useState("female");
  const [newClientNotes, setNewClientNotes] = useState("");
  const [newClientTag, setNewClientTag] = useState("Walk-in");
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  if (!currentUser) return null;

  // Compute metrics per customer
  const customerMetrics = useMemo(() => {
    const metricsMap = new Map<
      string,
      {
        totalSpend: number;
        completedCount: number;
        cancelledCount: number;
        totalCount: number;
        lastVisit: string | null;
        firstVisit: string | null;
        tier: "Platinum Member" | "Gold Member" | "Silver Member" | "New Client";
      }
    >();

    for (const u of users) {
      if (u.role !== "customer") continue;
      const userAppts = appointments.filter(
        (a) => a.customerId === u.id || a.customerUid === u.uid
      );

      const completed = userAppts.filter((a) =>
        ["completed", "Completed"].includes(a.status)
      );
      const cancelled = userAppts.filter((a) =>
        ["cancelled", "rejected", "no_show", "Cancelled", "No Show"].includes(a.status)
      );

      let totalSpend = 0;
      for (const a of completed) {
        if (a.priceAtBooking) {
          totalSpend += a.priceAtBooking;
        } else {
          const apptServices = (a.serviceIds || [])
            .map((id) => services.find((s) => s.id === id))
            .filter(Boolean);
          totalSpend += apptServices.reduce((sum, s) => sum + (s?.price || 0), 0);
        }
      }

      const sortedDates = userAppts
        .map((a) => a.date)
        .sort((a, b) => a.localeCompare(b));

      const firstVisit = sortedDates[0] || null;
      const lastVisit = sortedDates[sortedDates.length - 1] || null;

      // Tier Determination:
      // Platinum: Spend >= 3000 OR completed >= 3
      // Gold: Spend >= 1500 OR completed >= 2
      // Silver: completed >= 1
      // New: 0 completed
      let tier: "Platinum Member" | "Gold Member" | "Silver Member" | "New Client" = "New Client";
      if (totalSpend >= 3000 || completed.length >= 3) {
        tier = "Platinum Member";
      } else if (totalSpend >= 1500 || completed.length >= 2) {
        tier = "Gold Member";
      } else if (completed.length >= 1) {
        tier = "Silver Member";
      }

      metricsMap.set(u.id, {
        totalSpend,
        completedCount: completed.length,
        cancelledCount: cancelled.length,
        totalCount: userAppts.length,
        lastVisit,
        firstVisit,
        tier,
      });
    }

    return metricsMap;
  }, [users, appointments, services]);

  // Overall CRM KPIs
  const overallKpis = useMemo(() => {
    let totalLtv = 0;
    let platinumCount = 0;
    let totalCompleted = 0;
    const customerList = users.filter((u) => u.role === "customer");

    for (const u of customerList) {
      const m = customerMetrics.get(u.id);
      if (m) {
        totalLtv += m.totalSpend;
        totalCompleted += m.completedCount;
        if (m.tier === "Platinum Member") platinumCount++;
      }
    }

    const aov = totalCompleted > 0 ? Math.round(totalLtv / totalCompleted) : 0;
    return {
      totalCustomers: customerList.length,
      platinumCount,
      totalLtv,
      aov,
    };
  }, [users, customerMetrics]);

  // Filtered & Sorted Customer List
  const customers = useMemo(() => {
    return users
      .filter((u) => u.role === "customer")
      .filter((u) => {
        const m = customerMetrics.get(u.id);
        if (!m) return true;
        if (tierFilter === "top") return m.tier === "Platinum Member";
        if (tierFilter === "gold") return m.tier === "Gold Member" || m.tier === "Platinum Member";
        if (tierFilter === "frequent") return m.completedCount >= 2;
        if (tierFilter === "new") return m.completedCount === 0;
        return true;
      })
      .filter((u) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        const matchesBasic =
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.id.toLowerCase().includes(q);
        const matchesNotes = u.notes?.toLowerCase().includes(q);
        const matchesTags = u.tags?.some((t) => t.toLowerCase().includes(q));
        return matchesBasic || matchesNotes || matchesTags;
      })
      .sort((a, b) => {
        const mA = customerMetrics.get(a.id);
        const mB = customerMetrics.get(b.id);
        if (sortBy === "ltv") {
          return (mB?.totalSpend || 0) - (mA?.totalSpend || 0);
        }
        if (sortBy === "visits") {
          return (mB?.completedCount || 0) - (mA?.completedCount || 0);
        }
        if (sortBy === "newest") {
          return (b.createdAt || "").localeCompare(a.createdAt || "");
        }
        return a.fullName.localeCompare(b.fullName);
      });
  }, [users, query, tierFilter, sortBy, customerMetrics]);

  // Open 360 CRM Drawer
  const handleOpenClientDrawer = (u: User) => {
    setSelectedUser(u);
    setEditNotes(u.notes || "");
    setIsDrawerOpen(true);
  };

  // Save CRM notes
  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    try {
      setIsSavingNotes(true);
      await updateUser(selectedUser.id, { notes: editNotes });
      setSelectedUser({ ...selectedUser, notes: editNotes });
      toast.success("Client CRM notes saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update client notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Add tag to selected client
  const handleAddTag = async () => {
    if (!selectedUser || !newTagInput.trim()) return;
    const tag = newTagInput.trim();
    const currentTags = selectedUser.tags || [];
    if (currentTags.includes(tag)) {
      setNewTagInput("");
      return;
    }
    const updatedTags = [...currentTags, tag];
    try {
      await updateUser(selectedUser.id, { tags: updatedTags });
      setSelectedUser({ ...selectedUser, tags: updatedTags });
      setNewTagInput("");
      toast.success(`Tag "${tag}" added`);
    } catch {
      toast.error("Could not add tag");
    }
  };

  // Remove tag
  const handleRemoveTag = async (tagToRemove: string) => {
    if (!selectedUser) return;
    const updatedTags = (selectedUser.tags || []).filter((t) => t !== tagToRemove);
    try {
      await updateUser(selectedUser.id, { tags: updatedTags });
      setSelectedUser({ ...selectedUser, tags: updatedTags });
      toast.success(`Tag "${tagToRemove}" removed`);
    } catch {
      toast.error("Could not remove tag");
    }
  };

  // Register Walk-in client
  const handleCreateWalkInClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) {
      toast.error("Please enter client full name and contact number");
      return;
    }
    try {
      setIsCreatingClient(true);
      await userService.addWalkInClient({
        fullName: newClientName.trim(),
        phone: newClientPhone.trim(),
        email: newClientEmail.trim() || undefined,
        notes: newClientNotes.trim() || undefined,
        tags: [newClientTag],
        gender: newClientGender,
        preferredBranch: activeBranchId,
      });

      toast.success(`Client ${newClientName} registered into CRM`);
      setIsAddClientOpen(false);
      setNewClientName("");
      setNewClientPhone("");
      setNewClientEmail("");
      setNewClientNotes("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to register walk-in client");
    } finally {
      setIsCreatingClient(false);
    }
  };

  // Selected client's appointments
  const selectedUserAppointments = useMemo(() => {
    if (!selectedUser) return [];
    return appointments
      .filter(
        (a) => a.customerId === selectedUser.id || a.customerUid === selectedUser.uid
      )
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [selectedUser, appointments]);

  const selectedMetrics = selectedUser ? customerMetrics.get(selectedUser.id) : null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header */}
      <PageHeader
        title="Client CRM & Guest Relations"
        subtitle="Manage customer profiles, lifetime value, private consultation notes, and omnichannel outreach."
        action={
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              onClick={() => setIsAddClientOpen(true)}
              className="rounded-md bg-[#A27C48] hover:bg-[#876438] text-white font-medium text-xs shadow-xs h-9 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Register Client
            </Button>
          </div>
        }
      />

      {/* 2. Executive CRM KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
          <div className="flex items-center justify-between text-[#74695E] mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium">Total Client Base</span>
            <Users className="w-4 h-4 text-[#A27C48]" />
          </div>
          <p className="text-2xl font-semibold text-[#302A24]">
            {overallKpis.totalCustomers}
          </p>
          <p className="text-[11px] text-[#74695E] mt-0.5">Registered & Walk-in Patrons</p>
        </Card>

        <Card className="p-4 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
          <div className="flex items-center justify-between text-[#74695E] mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium">Platinum Members</span>
            <Award className="w-4 h-4 text-[#A27C48]" />
          </div>
          <p className="text-2xl font-semibold text-[#302A24]">
            {overallKpis.platinumCount}
          </p>
          <p className="text-[11px] text-[#A27C48] mt-0.5 font-medium">
            LTV &gt; ₹3,000 or 3+ sessions
          </p>
        </Card>

        <Card className="p-4 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
          <div className="flex items-center justify-between text-[#74695E] mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium">Lifetime Client Value</span>
            <TrendingUp className="w-4 h-4 text-[#355B3C]" />
          </div>
          <p className="text-2xl font-semibold text-[#302A24]">
            {formatPrice(overallKpis.totalLtv)}
          </p>
          <p className="text-[11px] text-[#74695E] mt-0.5">Completed gross revenue</p>
        </Card>

        <Card className="p-4 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
          <div className="flex items-center justify-between text-[#74695E] mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium">Average Order Value</span>
            <DollarSign className="w-4 h-4 text-[#A27C48]" />
          </div>
          <p className="text-2xl font-semibold text-[#302A24]">
            {formatPrice(overallKpis.aov)}
          </p>
          <p className="text-[11px] text-[#74695E] mt-0.5">Per completed visit</p>
        </Card>
      </div>

      {/* 3. Search & Segmentation Suite */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74695E]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, email, client ID or tags..."
              className="pl-9 h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[160px] h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
                <SelectItem value="ltv" className="text-xs">Highest Spend (LTV)</SelectItem>
                <SelectItem value="visits" className="text-xs">Most Visits</SelectItem>
                <SelectItem value="newest" className="text-xs">Newly Registered</SelectItem>
                <SelectItem value="name" className="text-xs">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tier Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            { id: "all", label: "All Patrons" },
            { id: "top", label: "Platinum (₹3k+)" },
            { id: "gold", label: "Gold & Up (₹1.5k+)" },
            { id: "frequent", label: "Frequent (2+ Visits)" },
            { id: "new", label: "New Patrons (0 Visits)" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setTierFilter(pill.id as any)}
              className={
                "rounded-md px-3 py-1 text-xs font-medium transition-colors border " +
                (tierFilter === pill.id
                  ? "bg-[#A27C48] text-white border-[#A27C48] font-semibold shadow-xs"
                  : "bg-[#FFFDFA] text-[#74695E] border-[#E9E1D6] hover:bg-[#F0EBE3] hover:text-[#302A24]")
              }
            >
              {pill.label}
            </button>
          ))}
          <span className="text-xs text-[#74695E] ml-auto">
            Showing {customers.length} patrons
          </span>
        </div>
      </div>

      {/* 4. CRM Client Table */}
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patrons match your query"
          description="Adjust your search keywords or segment filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F0EBE3] border-b border-[#E9E1D6]">
                <TableHead className="font-semibold text-xs text-[#302A24] py-3">Client Profile</TableHead>
                <TableHead className="font-semibold text-xs text-[#302A24]">Omnichannel Contact</TableHead>
                <TableHead className="font-semibold text-xs text-[#302A24]">Loyalty Status</TableHead>
                <TableHead className="font-semibold text-xs text-[#302A24] text-center">Visits</TableHead>
                <TableHead className="font-semibold text-xs text-[#302A24] text-right">Lifetime Spend</TableHead>
                <TableHead className="font-semibold text-xs text-[#302A24]">Tags & Notes</TableHead>
                <TableHead className="font-semibold text-xs text-[#302A24] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => {
                const metrics = customerMetrics.get(c.id);
                const phoneClean = (c.phone || "").replace(/[^0-9]/g, "");
                const waUrl = `https://wa.me/91${phoneClean}?text=${encodeURIComponent(
                  `Hello ${c.fullName}, greetings from Glow & Glamour Salon & Spa! We look forward to welcoming you for your next beauty ritual.`
                )}`;

                return (
                  <TableRow
                    key={c.id}
                    className="hover:bg-[#F0EBE3]/50 transition-colors border-b border-[#E9E1D6]"
                  >
                    {/* Client Profile */}
                    <TableCell className="py-3">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => handleOpenClientDrawer(c)}
                      >
                        <UserAvatar
                          name={c.fullName}
                          color={c.avatarColor}
                          className="h-9 w-9 rounded-full border border-[#E9E1D6] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-sm text-[#302A24] group-hover:text-[#A27C48]">
                            {c.fullName}
                          </p>
                          <p className="truncate font-mono text-[10px] text-[#74695E]">
                            ID: #{c.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Direct Contact Triggers */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {c.phone && (
                          <>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              className="h-7 w-7 rounded-md bg-[#E0EBDD] text-[#355B3C] hover:bg-[#d5e3d1] flex items-center justify-center transition-colors border border-[#E0EBDD]"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={`tel:${c.phone}`}
                              title="Direct Call"
                              className="h-7 w-7 rounded-md bg-[#F0EBE3] text-[#74695E] hover:text-[#302A24] hover:bg-[#E9E1D6] flex items-center justify-center transition-colors border border-[#E9E1D6]"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          </>
                        )}
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            title="Direct Email"
                            className="h-7 w-7 rounded-md bg-[#F0EBE3] text-[#74695E] hover:text-[#302A24] hover:bg-[#E9E1D6] flex items-center justify-center transition-colors border border-[#E9E1D6]"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </TableCell>

                    {/* Loyalty Tier */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          "rounded-md text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 " +
                          (metrics?.tier === "Platinum Member"
                            ? "bg-[#F0EBE3] text-[#A27C48] border-[#E9E1D6]"
                            : metrics?.tier === "Gold Member"
                            ? "bg-[#FBF3E6] text-[#8C6527] border-[#E9E1D6]"
                            : "bg-[#F0EBE3] text-[#74695E] border-[#E9E1D6]")
                        }
                      >
                        {metrics?.tier === "Platinum Member" && <Sparkles className="w-2.5 h-2.5 mr-1 text-[#A27C48]" />}
                        {metrics?.tier || "New Client"}
                      </Badge>
                    </TableCell>

                    {/* Completed Visits */}
                    <TableCell className="text-center font-medium text-sm text-[#302A24]">
                      {metrics?.completedCount || 0}
                    </TableCell>

                    {/* Lifetime Spend */}
                    <TableCell className="text-right">
                      <span className="font-semibold text-sm text-[#302A24]">
                        {formatPrice(metrics?.totalSpend || 0)}
                      </span>
                    </TableCell>

                    {/* Tags & Private Notes Indicator */}
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                        {(c.tags || []).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] uppercase tracking-wider bg-[#F0EBE3] text-[#74695E] px-1.5 py-0.5 rounded-md border border-[#E9E1D6]"
                          >
                            {tag}
                          </span>
                        ))}
                        {c.notes && (
                          <span
                            title={c.notes}
                            className="text-[10px] text-[#74695E] italic truncate block max-w-[150px]"
                          >
                            "{c.notes.slice(0, 20)}..."
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Action Triggers */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenClientDrawer(c)}
                          className="h-8 px-2.5 rounded-md text-xs border-[#E9E1D6] hover:bg-[#F0EBE3] text-[#302A24] gap-1"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-[#A27C48]" /> 360° Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Convert to staff"
                          onClick={() => setConvertFor(c.id)}
                          className="h-8 w-8 p-0 text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3] rounded-md"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 5. Client 360° Intelligence Sheet / Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto p-0 rounded-none border-l border-[#E9E1D6] bg-[#FFFDFA]">
          {selectedUser && (
            <div className="space-y-6 pb-12">
              {/* Premium Light Ivory / Champagne Header */}
              <div className="bg-[#F0EBE3] text-[#302A24] p-6 relative border-b border-[#E9E1D6]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={selectedUser.fullName}
                      color={selectedUser.avatarColor}
                      className="h-14 w-14 rounded-full border border-[#E9E1D6] text-lg shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-[#302A24]">
                          {selectedUser.fullName}
                        </h2>
                        <Badge className="bg-[#A27C48] text-white font-bold text-[9px] uppercase tracking-wider rounded-md">
                          {selectedMetrics?.tier || "Patron"}
                        </Badge>
                      </div>
                      <p className="font-mono text-xs text-[#74695E] mt-0.5">
                        ID: #{selectedUser.id}
                      </p>
                      <p className="text-[11px] text-[#74695E] mt-1">
                        Member since {formatDate(selectedUser.createdAt?.slice(0, 10) || "2026-01-01")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Omnichannel Triggers */}
                <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#E9E1D6]">
                  {selectedUser.phone ? (
                    <a
                      href={`https://wa.me/91${selectedUser.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${selectedUser.fullName}, greetings from Glow & Glamour Salon & Spa!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-[#355B3C] hover:bg-[#2c4c32] text-white text-xs font-medium transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  ) : (
                    <Button disabled size="sm" variant="outline" className="text-xs border-[#E9E1D6]">
                      No Phone
                    </Button>
                  )}

                  {selectedUser.phone ? (
                    <a
                      href={`tel:${selectedUser.phone}`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-[#FFFDFA] hover:bg-[#F6F3ED] text-[#302A24] text-xs font-medium transition-colors border border-[#E9E1D6]"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#A27C48]" /> Direct Call
                    </a>
                  ) : null}

                  {selectedUser.email ? (
                    <a
                      href={`mailto:${selectedUser.email}`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-[#FFFDFA] hover:bg-[#F6F3ED] text-[#302A24] text-xs font-medium transition-colors border border-[#E9E1D6]"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#A27C48]" /> Email Client
                    </a>
                  ) : null}
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="px-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#74695E] mb-3">
                  Financial Intelligence
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-md border border-[#E9E1D6] bg-[#FFFDFA]">
                    <span className="text-[10px] text-[#74695E] uppercase tracking-wider block">
                      Lifetime Spend
                    </span>
                    <span className="font-semibold text-base text-[#302A24] mt-0.5 block">
                      {formatPrice(selectedMetrics?.totalSpend || 0)}
                    </span>
                  </div>

                  <div className="p-3 rounded-md border border-[#E9E1D6] bg-[#FFFDFA]">
                    <span className="text-[10px] text-[#74695E] uppercase tracking-wider block">
                      Completed Visits
                    </span>
                    <span className="font-semibold text-base text-[#302A24] mt-0.5 block">
                      {selectedMetrics?.completedCount || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-md border border-[#E9E1D6] bg-[#FFFDFA]">
                    <span className="text-[10px] text-[#74695E] uppercase tracking-wider block">
                      Cancelled / No Show
                    </span>
                    <span className="font-semibold text-base text-[#8C3930] mt-0.5 block">
                      {selectedMetrics?.cancelledCount || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-md border border-[#E9E1D6] bg-[#FFFDFA]">
                    <span className="text-[10px] text-[#74695E] uppercase tracking-wider block">
                      Avg Ticket
                    </span>
                    <span className="font-semibold text-base text-[#302A24] mt-0.5 block">
                      {selectedMetrics?.completedCount && selectedMetrics.completedCount > 0
                        ? formatPrice(Math.round(selectedMetrics.totalSpend / selectedMetrics.completedCount))
                        : "₹0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="px-6 space-y-2.5">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#74695E]">
                  Contact & Demographic Profile
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA]">
                  <div>
                    <span className="text-[#74695E] block text-[10px] uppercase">Phone</span>
                    <span className="font-medium text-[#302A24]">{selectedUser.phone || "Not recorded"}</span>
                  </div>
                  <div>
                    <span className="text-[#74695E] block text-[10px] uppercase">Email</span>
                    <span className="font-medium text-[#302A24] truncate block">{selectedUser.email || "Not recorded"}</span>
                  </div>
                  <div>
                    <span className="text-[#74695E] block text-[10px] uppercase">Home Salon</span>
                    <span className="font-medium text-[#302A24]">Glow & Glamour (Koregaon)</span>
                  </div>
                  <div>
                    <span className="text-[#74695E] block text-[10px] uppercase">Last Visit</span>
                    <span className="font-medium text-[#302A24]">{selectedMetrics?.lastVisit ? formatDate(selectedMetrics.lastVisit) : "Never"}</span>
                  </div>
                </div>
              </div>

              {/* Tags Manager */}
              <div className="px-6 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#74695E]">
                    Patron Tags & Segments
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(selectedUser.tags || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F0EBE3] text-[#302A24] text-xs font-medium border border-[#E9E1D6]"
                    >
                      <Tag className="w-3 h-3 text-[#A27C48]" /> {t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-[#8C3930] ml-1"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="inline-flex items-center gap-1">
                    <Input
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="+ Add Tag"
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      className="h-7 w-28 text-xs rounded-md px-2 border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleAddTag}
                      className="h-7 px-2 text-xs rounded-md hover:bg-[#F0EBE3] text-[#302A24]"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Private CRM Consultation Notes */}
              <div className="px-6 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#74695E] flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-[#A27C48]" /> Private Consultation & Allergy Notes
                  </h3>
                  <Button
                    size="sm"
                    disabled={isSavingNotes}
                    onClick={handleSaveNotes}
                    className="h-7 px-3 text-[11px] rounded-md bg-[#A27C48] text-white hover:bg-[#876438] font-medium"
                  >
                    {isSavingNotes ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record hair preferences, scalp conditions, allergies (ammonia/bleach), preferred products, personal styling notes..."
                  className="min-h-[100px] text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] leading-relaxed focus-visible:ring-[#A27C48]"
                />
              </div>

              {/* Complete Appointment History Timeline */}
              <div className="px-6 space-y-3">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#74695E]">
                  Appointment History ({selectedUserAppointments.length})
                </h3>

                {selectedUserAppointments.length === 0 ? (
                  <p className="text-xs text-[#74695E] italic">No appointment history on record.</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedUserAppointments.map((a) => {
                      const apptServices = (a.serviceIds || [])
                        .map((id) => services.find((s) => s.id === id))
                        .filter(Boolean);
                      const sNames = apptServices.map((s) => s?.name).join(", ") || "Sanctuary Treatment";

                      return (
                        <div
                          key={a.id}
                          className="p-3 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] hover:border-[#A27C48]/60 transition-colors space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-xs text-[#302A24] leading-tight">
                                {sNames}
                              </p>
                              <p className="text-[10px] text-[#74695E] mt-0.5">
                                {formatDate(a.date)} at {formatTime(a.time)}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-[#F0EBE3] text-[#74695E] border border-[#E9E1D6]"
                            >
                              {a.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E9E1D6]/70">
                            <span className="font-mono text-[#74695E]">#{a.reference || a.id.slice(0, 8)}</span>
                            <span className="font-semibold text-[#302A24]">
                              {formatPrice(a.priceAtBooking || 0)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 6. Register Walk-in Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="rounded-md sm:max-w-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#302A24]">Register New Client into CRM</DialogTitle>
            <DialogDescription className="text-xs text-[#74695E]">
              Add walk-in patrons to track lifetime spend, preferences, and appointment records.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWalkInClient} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs text-[#302A24]">Full Name *</Label>
              <Input
                required
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="e.g. Priyanshu Sharma"
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#302A24]">Phone Number *</Label>
                <Input
                  required
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+91 98220..."
                  className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#302A24]">Email Address</Label>
                <Input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#302A24]">Gender</Label>
                <Select value={newClientGender} onValueChange={setNewClientGender}>
                  <SelectTrigger className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
                    <SelectItem value="female" className="text-xs">Female</SelectItem>
                    <SelectItem value="male" className="text-xs">Male</SelectItem>
                    <SelectItem value="other" className="text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#302A24]">Primary Segment</Label>
                <Select value={newClientTag} onValueChange={setNewClientTag}>
                  <SelectTrigger className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
                    <SelectItem value="Walk-in" className="text-xs">Walk-in Patron</SelectItem>
                    <SelectItem value="Bridal" className="text-xs">Bridal Inquiry</SelectItem>
                    <SelectItem value="Special" className="text-xs">Special Patron</SelectItem>
                    <SelectItem value="Ayurvedic Regular" className="text-xs">Ayurvedic Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[#302A24]">Consultation Notes / Preferences</Label>
              <Textarea
                value={newClientNotes}
                onChange={(e) => setNewClientNotes(e.target.value)}
                placeholder="Initial hair/skin assessment or notes..."
                className="text-xs rounded-md min-h-[70px] border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddClientOpen(false)}
                className="rounded-md text-xs border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreatingClient}
                className="rounded-md bg-[#A27C48] hover:bg-[#876438] text-white font-medium text-xs transition-colors"
              >
                {isCreatingClient ? "Registering..." : "Save into CRM"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Convert to Staff Dialog */}
      <ConvertStaffDialog userId={convertFor} onClose={() => setConvertFor(null)} />
    </div>
  );
}
