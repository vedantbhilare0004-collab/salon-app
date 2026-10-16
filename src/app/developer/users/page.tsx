"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  User,
  Code,
  Calendar,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { relativeTime } from "@/lib/format";

export default function DeveloperUsersPage() {
  const { assignOwner, removeOwner } = useData();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/developer/metrics");
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.registeredUsers || []);
      }
    } catch (e) {
      console.error("Error loading users", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.userId || "").toLowerCase().includes(q) ||
      (u.uid || "").toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  async function handleToggleOwner(user: any) {
    const isOwner = user.role === "owner";
    setActionLoadingId(user.id);
    const res = isOwner
      ? await removeOwner(user.uid || user.email)
      : await assignOwner(user.uid || user.email);
    setActionLoadingId(null);

    if (!res.ok) {
      toast.error(res.error || "Failed to update role.");
      return;
    }
    toast.success(res.message || "Role updated successfully.");
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
            <Users className="h-7 w-7 text-emerald-400" /> Registered Users Directory
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Complete database of all {users.length} registered accounts across Glow &amp; Glamour.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="gap-2 border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Role Summary Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: "All Users", count: users.length },
          { key: "customer", label: "Customers", count: users.filter((u) => u.role === "customer").length },
          { key: "owner", label: "Owners", count: users.filter((u) => u.role === "owner").length },
          { key: "staff", label: "Staff", count: users.filter((u) => u.role === "staff").length },
          { key: "developer", label: "Developers", count: users.filter((u) => u.role === "developer").length },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setRoleFilter(item.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              roleFilter === item.key
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                : "bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>{item.label}</span>
            <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.2 rounded border border-white/10">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search registered users by name, email, phone or user ID..."
          className="bg-[#151311] border-white/10 pl-10 text-xs text-white placeholder:text-neutral-500 rounded-xl h-11"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-white/10 bg-[#151311] overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Showing {filteredUsers.length} of {users.length} registered accounts</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Loading directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No registered users match your search criteria.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredUsers.map((user) => {
              const isDev = user.role === "developer";
              const isOwner = user.role === "owner";
              const isCurrentAction = actionLoadingId === user.id;

              return (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold border ${
                      isDev
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : isOwner
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : user.role === "staff"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-white/5 text-neutral-300 border-white/10"
                    }`}>
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">{user.fullName || "User"}</p>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-semibold ${
                          isDev
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : isOwner
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : user.role === "staff"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            : "bg-white/5 text-neutral-400 border-white/10"
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-1">
                        <span className="font-mono text-neutral-300">{user.email || "No email"}</span>
                        {user.phone && <span>· {user.phone}</span>}
                        <span className="font-mono">· ID: {user.userId || user.id.slice(0, 8)}</span>
                        {user.createdAt && (
                          <span className="text-[10px] text-neutral-500">
                            · Joined: {relativeTime(user.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isDev && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isOwner ? "destructive" : "outline"}
                        disabled={isCurrentAction}
                        onClick={() => handleToggleOwner(user)}
                        className={`text-xs h-8 ${
                          isOwner
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                        }`}
                      >
                        {isCurrentAction ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : isOwner ? (
                          "Remove Owner"
                        ) : (
                          "Promote to Owner"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
