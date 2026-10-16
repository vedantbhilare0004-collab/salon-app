"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserPlus,
  UserMinus,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
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

export default function DeveloperOwnersPage() {
  const { assignOwner, removeOwner, createOwner } = useData();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Assign existing user dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [assignInput, setAssignInput] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Create new owner dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Remove dialog
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/developer/metrics");
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.registeredUsers || []);
      }
    } catch (e) {
      console.error("Error loading owners", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const owners = users.filter((u) => u.role === "owner");
  const nonOwners = users.filter((u) => u.role !== "owner" && u.role !== "developer");

  const filteredOwners = owners.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      (o.fullName || "").toLowerCase().includes(q) ||
      (o.email || "").toLowerCase().includes(q) ||
      (o.phone || "").toLowerCase().includes(q) ||
      (o.userId || "").toLowerCase().includes(q)
    );
  });

  async function handleAssign(identifier: string) {
    if (!identifier) return;
    setAssignLoading(true);
    const res = await assignOwner(identifier);
    setAssignLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Failed to assign owner.");
      return;
    }
    toast.success(res.message || "Assigned owner role successfully!");
    setAssignDialogOpen(false);
    setSelectedUser(null);
    setAssignInput("");
    loadData();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim()) {
      toast.error("Name and Email are required.");
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
      toast.error(res.error || "Failed to create owner.");
      return;
    }
    toast.success(res.message || "Owner created and assigned successfully!");
    setCreateDialogOpen(false);
    setCreateName("");
    setCreateEmail("");
    setCreatePhone("");
    setCreatePassword("");
    loadData();
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setRemoveLoading(true);
    const res = await removeOwner(removeTarget.uid || removeTarget.email);
    setRemoveLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Failed to remove owner role.");
      return;
    }
    toast.success(res.message || "Owner role removed successfully.");
    setRemoveTarget(null);
    loadData();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/developer" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dev Console
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-amber-400" /> Owner Administration
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Add new owners, assign existing registered users as owners, and remove owner access.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Assign Dialog */}
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-amber-500 text-black hover:bg-amber-400 font-semibold text-xs">
                <UserPlus className="h-4 w-4" /> Assign Owner
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#181614] border-white/10 text-white sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-400" /> Assign Existing User as Owner
                </DialogTitle>
                <DialogDescription className="text-neutral-400 text-xs">
                  Pick from registered users below or enter their email directly.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Enter Email or UID</label>
                  <div className="flex gap-2">
                    <Input
                      value={assignInput}
                      onChange={(e) => setAssignInput(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="bg-white/5 border-white/10 text-white text-xs"
                    />
                    <Button
                      size="sm"
                      disabled={assignLoading || !assignInput.trim()}
                      onClick={() => handleAssign(assignInput.trim())}
                      className="bg-amber-500 text-black hover:bg-amber-400 text-xs font-semibold"
                    >
                      {assignLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Assign"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-400">Or select from registered users ({nonOwners.length}):</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-white/10 bg-black/40 p-2">
                    {nonOwners.length === 0 ? (
                      <p className="text-xs text-neutral-500 p-2 text-center">No eligible non-owner users found.</p>
                    ) : (
                      nonOwners.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors text-xs"
                        >
                          <div>
                            <p className="font-semibold text-white">{u.fullName}</p>
                            <p className="text-[10px] text-neutral-400 font-mono">{u.email}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssign(u.email || u.uid)}
                            disabled={assignLoading}
                            className="h-7 text-[10px] border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                          >
                            Make Owner
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create New Owner Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2 border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10 text-xs">
                <UserPlus className="h-4 w-4 text-emerald-400" /> Create Owner Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#181614] border-white/10 text-white sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-emerald-400" /> Create New Owner
                </DialogTitle>
                <DialogDescription className="text-neutral-400 text-xs">
                  Create a new account with full Owner credentials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
                <div className="space-y-1">
                  <label className="text-neutral-300">Full Name</label>
                  <Input
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Owner Full Name"
                    className="bg-white/5 border-white/10 text-white text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">Email Address</label>
                  <Input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="owner@gmail.com"
                    className="bg-white/5 border-white/10 text-white text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">Phone</label>
                  <Input
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+91 ..."
                    className="bg-white/5 border-white/10 text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">Password (Optional)</label>
                  <Input
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="bg-white/5 border-white/10 text-white text-xs"
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createLoading} className="bg-emerald-500 text-black font-semibold">
                    {createLoading && <Loader2 className="h-3 w-3 animate-spin mr-1" />} Create &amp; Assign
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search owners by name, email, phone or ID..."
          className="bg-[#151311] border-white/10 pl-10 text-xs text-white placeholder:text-neutral-500 rounded-xl h-11"
        />
      </div>

      {/* Current Owners Roster */}
      <div className="rounded-xl border border-white/10 bg-[#151311] overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Active Owners ({filteredOwners.length})</span>
          <span className="text-[10px] font-mono">Branch: Koregaon</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Loading owners...</div>
        ) : filteredOwners.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            {searchTerm ? "No owners matched your search." : "No designated owners currently assigned."}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredOwners.map((owner) => (
              <div
                key={owner.uid || owner.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-base font-bold">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white text-sm">{owner.fullName || "Owner"}</p>
                      <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
                        OWNER ROLE
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-1">
                      <span className="font-mono text-neutral-300">{owner.email}</span>
                      {owner.phone && <span>· {owner.phone}</span>}
                      <span>· User ID: {owner.userId || owner.id.slice(0, 8)}</span>
                      <span>· Branch: {owner.ownerBranch || "koregaon"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRemoveTarget(owner)}
                    className="gap-1.5 border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs rounded-lg"
                  >
                    <UserMinus className="h-3.5 w-3.5" /> Remove Owner
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      {removeTarget && (
        <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
          <DialogContent className="bg-[#181614] border-white/10 text-white sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="h-5 w-5" /> Confirm Owner Demotion
              </DialogTitle>
              <DialogDescription className="text-neutral-400 text-xs">
                Remove owner privileges from <strong className="text-white">{removeTarget.fullName || removeTarget.email}</strong>? They will be demoted back to customer role.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={removeLoading}
                onClick={handleRemove}
                className="bg-rose-600 hover:bg-rose-500 font-semibold"
              >
                {removeLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />} Confirm Removal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
