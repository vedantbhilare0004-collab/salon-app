"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Code,
  ShieldCheck,
  Users,
  Eye,
  UserPlus,
  UserMinus,
  Sparkles,
  Home,
  LayoutDashboard,
  CalendarCheck,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatTime, relativeTime } from "@/lib/format";

export default function DeveloperDashboard() {
  const { currentUser, assignOwner, removeOwner, createOwner } = useData();

  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignIdentifier, setAssignIdentifier] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  async function fetchMetrics() {
    try {
      setRefreshing(true);
      const res = await fetch("/api/developer/metrics");
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      }
    } catch (e) {
      console.error("Failed to load developer metrics", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function handleAssignOwner(e: React.FormEvent) {
    e.preventDefault();
    if (!assignIdentifier.trim()) {
      toast.error("Please enter an email or UID to assign owner role.");
      return;
    }
    setAssignLoading(true);
    const res = await assignOwner(assignIdentifier.trim());
    setAssignLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Failed to assign owner.");
      return;
    }
    toast.success(res.message || "Assigned owner role successfully!");
    setAssignIdentifier("");
    setAssignDialogOpen(false);
    fetchMetrics();
  }

  async function handleCreateOwner(e: React.FormEvent) {
    e.preventDefault();
    if (!createEmail.trim() || !createName.trim()) {
      toast.error("Please provide both full name and email.");
      return;
    }
    setCreateLoading(true);
    const res = await createOwner({
      fullName: createName.trim(),
      email: createEmail.trim(),
      phone: createPhone.trim(),
      password: createPassword.trim() || undefined,
    });
    setCreateLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Failed to create owner account.");
      return;
    }
    toast.success(res.message || "Owner account created and assigned successfully!");
    setCreateName("");
    setCreateEmail("");
    setCreatePhone("");
    setCreatePassword("");
    setCreateDialogOpen(false);
    fetchMetrics();
  }

  async function handleRemoveOwner() {
    if (!removeTarget) return;
    setRemoveLoading(true);
    const res = await removeOwner(removeTarget.uid || removeTarget.email);
    setRemoveLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Failed to remove owner role.");
      return;
    }
    toast.success(res.message || "Owner removed successfully. Returned to customer role.");
    setRemoveTarget(null);
    fetchMetrics();
  }

  const ownersList = metrics?.registeredUsers?.filter((u: any) => u.role === "owner") || [];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-[#171513] via-[#1A1816] to-[#12110F] p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 h-full w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                DEVELOPER COMMAND CENTER
              </span>
              <span className="text-xs text-neutral-500 font-mono">prathmeshbhilare52@gmail.com</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              System Administration &amp; Testing Suite
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Full control to Add, Remove, and Assign Owners. Monitor all registered users and real-time visitor traffic (registered + unregistered). Test and interact with the platform from any user perspective.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={refreshing}
              className="gap-2 border-white/10 bg-white/5 text-xs text-neutral-200 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Metrics
            </Button>
          </div>
        </div>
      </div>

      {/* Simulator Quick Perspective Strip */}
      <div className="rounded-xl border border-white/10 bg-[#161412] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Test Website Perspectives</h3>
          </div>
          <span className="text-[11px] text-neutral-500">Instant Role Simulation</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/customer"
            className="flex items-center justify-between rounded-xl border border-[#8E6D38]/30 bg-[#24211D]/60 p-3.5 transition-all hover:border-[#8E6D38] hover:bg-[#24211D] group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D2924] text-[#E5D3B3] border border-[#E5D3B3]/20">
                <Home className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-[#E5D3B3] transition-colors">
                  Customer Sanctuary
                </p>
                <p className="text-[10px] text-neutral-400">Book, rituals, offers &amp; profile</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-[#E5D3B3] group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/owner"
            className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 transition-all hover:border-amber-500 hover:bg-amber-950/40 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-900/30 text-amber-400 border border-amber-500/30">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Owner Executive Suite
                </p>
                <p className="text-[10px] text-neutral-400">Dashboard, appointments, billing</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/staff"
            className="flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5 transition-all hover:border-blue-500 hover:bg-blue-950/40 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900/30 text-blue-400 border border-blue-500/30">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Staff Floor Suite
                </p>
                <p className="text-[10px] text-neutral-400">Stylist roster, appointments, queue</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Registered Users */}
        <Card className="rounded-xl border border-white/10 bg-[#151311] p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Registered Users</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading text-3xl font-bold text-white tracking-tight">
              {loading ? "..." : metrics?.totalRegisteredUsers ?? 0}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
              <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neutral-300">
                Customers: <strong>{metrics?.roleCounts?.customer ?? 0}</strong>
              </span>
              <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-300">
                Owners: <strong>{metrics?.roleCounts?.owner ?? 0}</strong>
              </span>
              <span className="bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-blue-300">
                Staff: <strong>{metrics?.roleCounts?.staff ?? 0}</strong>
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
            <Link href="/developer/users" className="text-emerald-400 hover:underline flex items-center gap-1 font-medium">
              View Directory <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 2: Total Visitors (Registered + Unregistered) */}
        <Card className="rounded-xl border border-white/10 bg-[#151311] p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Total Visitors</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading text-3xl font-bold text-white tracking-tight">
              {loading ? "..." : metrics?.visitors?.totalUniqueVisitors ?? 0}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
              <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                Registered: <strong>{metrics?.visitors?.registeredVisitors ?? 0}</strong>
              </span>
              <span className="bg-neutral-500/10 border border-neutral-500/20 px-2 py-0.5 rounded text-neutral-300">
                Guests/Unreg: <strong>{metrics?.visitors?.unregisteredVisitors ?? 0}</strong>
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">Hits: {metrics?.visitors?.totalVisits ?? 0}</span>
            <Link href="/developer/visitors" className="text-purple-400 hover:underline flex items-center gap-1 font-medium">
              Traffic Details <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 3: Active Owners */}
        <Card className="rounded-xl border border-white/10 bg-[#151311] p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Designated Owners</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading text-3xl font-bold text-white tracking-tight">
              {loading ? "..." : ownersList.length}
            </p>
            <p className="mt-2 text-xs text-neutral-400">
              Owners have full branch salon administration access.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
            <Link href="/developer/owners" className="text-amber-400 hover:underline flex items-center gap-1 font-medium">
              Manage Owners <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 4: Platform Engine Status */}
        <Card className="rounded-xl border border-white/10 bg-[#151311] p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">System State</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Code className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-semibold text-white">Full Operational</p>
            </div>
            <p className="text-xs text-neutral-400">Next.js 15 · Firebase Auth &amp; Cloud Firestore</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500 font-mono">Branch: Koregaon</span>
            <span className="text-emerald-400 font-mono">LIVE</span>
          </div>
        </Card>
      </div>

      {/* Crucial Owner Management Suite */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-400" /> Owner Management &amp; Assignment
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Assign existing users to Owner, create new owner credentials, or remove owner privileges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Assign Existing User as Owner Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-amber-500 text-black hover:bg-amber-400 font-semibold text-xs rounded-lg">
                  <UserPlus className="h-3.5 w-3.5" /> Assign Owner
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#181614] border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-400" /> Assign Owner Role
                  </DialogTitle>
                  <DialogDescription className="text-neutral-400 text-xs">
                    Promote an existing registered user to Owner. They will receive executive salon access immediately.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssignOwner} className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">User Email or User ID / UID</label>
                    <Input
                      value={assignIdentifier}
                      onChange={(e) => setAssignIdentifier(e.target.value)}
                      placeholder="e.g. shantanukashid8@gmail.com or UID"
                      className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500"
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAssignDialogOpen(false)}
                      className="text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={assignLoading}
                      className="gap-2 bg-amber-500 text-black hover:bg-amber-400 font-semibold"
                    >
                      {assignLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Confirm Owner Assignment
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add / Create New Owner Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2 border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10 hover:text-white text-xs rounded-lg">
                  <UserPlus className="h-3.5 w-3.5 text-emerald-400" /> Create Owner Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#181614] border-white/10 text-white sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-400" /> Create New Owner Account
                  </DialogTitle>
                  <DialogDescription className="text-neutral-400 text-xs">
                    Register a brand new owner account directly in Firebase Auth and Firestore.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOwner} className="space-y-3.5 py-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-300">Full Name</label>
                    <Input
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-300">Email Address</label>
                    <Input
                      type="email"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="e.g. owner@glowandglamour.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-300">Phone (Optional)</label>
                    <Input
                      value={createPhone}
                      onChange={(e) => setCreatePhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-300">Initial Password (Optional, default random)</label>
                    <Input
                      type="password"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Leave blank for auto-generated password"
                      className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-xs"
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCreateDialogOpen(false)}
                      className="text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={createLoading}
                      className="gap-2 bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
                    >
                      {createLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Create &amp; Assign Owner
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Current Owners Table / Cards */}
        <div className="rounded-xl border border-white/10 bg-[#151311] overflow-hidden shadow-lg">
          {ownersList.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-xs">
              No designated owners found. Click &quot;Assign Owner&quot; or &quot;Create Owner Account&quot; above to add one.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {ownersList.map((owner: any) => (
                <div
                  key={owner.uid || owner.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold text-sm">
                      👑
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">{owner.fullName || "Owner"}</p>
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-300 border-amber-500/30">
                          OWNER
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                        <span className="font-mono text-neutral-300">{owner.email}</span>
                        {owner.phone && <span>· {owner.phone}</span>}
                        <span>· Branch: {owner.ownerBranch || "koregaon"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRemoveTarget(owner)}
                      className="gap-1.5 border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 text-xs rounded-lg"
                    >
                      <UserMinus className="h-3.5 w-3.5" /> Remove Owner
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      {removeTarget && (
        <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
          <DialogContent className="bg-[#181614] border-white/10 text-white sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="h-5 w-5" /> Remove Owner Role
              </DialogTitle>
              <DialogDescription className="text-neutral-400 text-xs">
                Are you sure you want to remove the Owner role from{" "}
                <strong className="text-white">{removeTarget.fullName || removeTarget.email}</strong>? They will be demoted to standard Customer privileges.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRemoveTarget(null)}
                className="text-neutral-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={removeLoading}
                onClick={handleRemoveOwner}
                className="gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                {removeLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Removal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dual Column: Real-time Visitor Stream & Registered Users Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Visitors Stream */}
        <div className="rounded-xl border border-white/10 bg-[#151311] p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-400" />
              <h3 className="font-heading text-base font-semibold text-white">Live Visitor Stream</h3>
            </div>
            <Link href="/developer/visitors" className="text-xs text-purple-400 hover:underline">
              View All Traffic →
            </Link>
          </div>

          <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto pr-1">
            {metrics?.recentVisitors?.length === 0 ? (
              <p className="p-4 text-center text-xs text-neutral-500">No visitor sessions recorded yet.</p>
            ) : (
              metrics?.recentVisitors?.slice(0, 8).map((v: any) => (
                <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-300 truncate max-w-[140px] sm:max-w-[180px]">
                        {v.email || v.visitorId}
                      </span>
                      {v.isRegistered ? (
                        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[9px]">
                          REGISTERED
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-white/5 text-neutral-400 border-white/10 text-[9px]">
                          UNREGISTERED GUEST
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      Path: {v.lastPath || "/"} · Hits: {v.pageViews || 1}
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-500 whitespace-nowrap pl-2">
                    {v.lastSeenAt ? relativeTime(v.lastSeenAt) : "Just now"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Registered Users Directory Preview */}
        <div className="rounded-xl border border-white/10 bg-[#151311] p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <h3 className="font-heading text-base font-semibold text-white">Registered Users Directory</h3>
            </div>
            <Link href="/developer/users" className="text-xs text-emerald-400 hover:underline">
              Full Directory ({metrics?.totalRegisteredUsers ?? 0}) →
            </Link>
          </div>

          <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto pr-1">
            {metrics?.registeredUsers?.length === 0 ? (
              <p className="p-4 text-center text-xs text-neutral-500">No registered users found.</p>
            ) : (
              metrics?.registeredUsers?.slice(0, 8).map((u: any) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate max-w-[150px]">{u.fullName}</span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-semibold ${
                        u.role === "developer"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : u.role === "owner"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : u.role === "staff"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                          : "bg-white/5 text-neutral-400 border-white/10"
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate max-w-[200px]">
                      {u.email} {u.phone ? `· ${u.phone}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono whitespace-nowrap pl-2">
                    {u.userId || `#${u.id.slice(0, 6)}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
