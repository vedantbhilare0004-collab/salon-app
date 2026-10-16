"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  RefreshCw,
  ArrowLeft,
  Users,
  Compass,
  Activity,
  Globe,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/format";

export default function DeveloperVisitorsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/developer/metrics");
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      }
    } catch (e) {
      console.error("Error loading visitors analytics", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visitors = metrics?.visitors || {};
  const recentVisitors = metrics?.recentVisitors || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/developer" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dev Console
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Eye className="h-7 w-7 text-purple-400" /> Website Visitor Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time tracking of all registered and unregistered visitors across the platform.
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

      {/* Traffic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-white/10 bg-[#151311] p-5 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-wider font-medium">Total Unique Visitors</span>
            <Globe className="h-4 w-4 text-purple-400" />
          </div>
          <p className="font-heading text-3xl font-bold text-white mt-3">
            {loading ? "..." : visitors.totalUniqueVisitors ?? 0}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">All-time unique browsers &amp; devices</p>
        </Card>

        <Card className="rounded-xl border border-white/10 bg-[#151311] p-5 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-wider font-medium">Registered Visitors</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="font-heading text-3xl font-bold text-emerald-300 mt-3">
            {loading ? "..." : visitors.registeredVisitors ?? 0}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Authenticated user sessions</p>
        </Card>

        <Card className="rounded-xl border border-white/10 bg-[#151311] p-5 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-wider font-medium">Unregistered Visitors</span>
            <Compass className="h-4 w-4 text-amber-400" />
          </div>
          <p className="font-heading text-3xl font-bold text-amber-300 mt-3">
            {loading ? "..." : visitors.unregisteredVisitors ?? 0}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Guest &amp; prospective clients</p>
        </Card>

        <Card className="rounded-xl border border-white/10 bg-[#151311] p-5 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-wider font-medium">Total Page Hits</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <p className="font-heading text-3xl font-bold text-white mt-3">
            {loading ? "..." : visitors.totalVisits ?? 0}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Aggregate route page impressions</p>
        </Card>
      </div>

      {/* Visitor Session Log */}
      <div className="rounded-xl border border-white/10 bg-[#151311] overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-semibold text-white">Recent Visitor Sessions ({recentVisitors.length})</span>
          <span className="text-[10px] font-mono">Real-time Beacon Stream</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Loading visitor logs...</div>
        ) : recentVisitors.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No visitor logs recorded yet. Navigate around pages to see live traffic!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentVisitors.map((v: any) => (
              <div
                key={v.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold border ${
                    v.isRegistered
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-white/5 text-neutral-400 border-white/10"
                  }`}>
                    {v.isRegistered ? "REG" : "GUEST"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-white">
                        {v.email || v.visitorId}
                      </span>
                      {v.isRegistered ? (
                        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[9px]">
                          REGISTERED ({v.role || "user"})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-white/5 text-neutral-400 border-white/10 text-[9px]">
                          UNREGISTERED GUEST
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Last Path: <code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded font-mono">{v.lastPath || "/"}</code> · Hits: {v.pageViews || 1}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right text-[11px] text-neutral-500">
                  <p>Last active: {v.lastSeenAt ? relativeTime(v.lastSeenAt) : "Just now"}</p>
                  {v.firstSeenAt && (
                    <p className="text-[10px] text-neutral-600">First seen: {new Date(v.firstSeenAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
