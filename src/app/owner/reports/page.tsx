"use client";

import { useMemo, useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Scissors,
  FileSpreadsheet,
  Sun,
  RefreshCw,
  Settings,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice, formatTime } from "@/lib/format";
import { GoogleSheetDialog } from "@/components/owner/google-sheet-dialog";
import { toast } from "sonner";
import type { Appointment, Service } from "@/lib/types";

export default function OwnerReportsPage() {
  const { appointments, services, users } = useData();

  // Google Sheets integration state
  const [sheetDialogOpen, setSheetDialogOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncScope, setSyncScope] = useState<"yesterday" | "today" | "all" | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  const DEFAULT_WEBHOOK =
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
    "https://script.google.com/macros/s/AKfycbxkzev3KbzN6xxVSl1DLORA4cGVXbO6IfgFCrv3jCf74RoCJg-vCfmSICDnpB-2NKh_/exec";

  useEffect(() => {
    const savedUrl = localStorage.getItem("gg_google_sheet_webhook") || DEFAULT_WEBHOOK;
    setWebhookUrl(savedUrl);
    if (!localStorage.getItem("gg_google_sheet_webhook")) {
      localStorage.setItem("gg_google_sheet_webhook", savedUrl);
    }
    const savedTime = localStorage.getItem("gg_google_sheet_last_sync") || "";
    setLastSyncTime(savedTime);
  }, []);

  // 1. Filter completed appointments within the rolling 30-day window
  const thirtyDayData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

    const completed = appointments.filter((a) => {
      const isComp = a.status === "completed" || a.status === "Completed";
      return isComp && a.date >= thirtyDaysAgoStr;
    });

    // Gross Revenue
    let totalGrossRevenue = 0;
    const dailyMap: Record<string, { date: string; count: number; totalRevenue: number }> = {};
    const staffMap: Record<string, { staffId: string; staffName: string; apptCount: number; totalRevenue: number }> = {};

    completed.forEach((a) => {
      const apptServices: Service[] = (a.serviceIds || [])
        .map((sId) => services.find((s) => s.id === sId))
        .filter(Boolean) as Service[];

      const price = a.priceAtBooking || apptServices.reduce((acc, s) => acc + (s.price || 0), 0) || 0;
      totalGrossRevenue += price;

      // Daily grouping
      if (!dailyMap[a.date]) {
        dailyMap[a.date] = { date: a.date, count: 0, totalRevenue: 0 };
      }
      dailyMap[a.date].count += 1;
      dailyMap[a.date].totalRevenue += price;

      // Staff grouping
      const sId = a.assignedStaffId || a.staffId || "unassigned";
      if (!staffMap[sId]) {
        const staffUser = users.find((u) => u.id === sId || u.uid === sId);
        staffMap[sId] = {
          staffId: sId,
          staffName: staffUser?.fullName || (sId === "unassigned" ? "General Team / Salon" : "Staff Member"),
          apptCount: 0,
          totalRevenue: 0,
        };
      }
      staffMap[sId].apptCount += 1;
      staffMap[sId].totalRevenue += price;
    });

    const dailyBreakdown = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));
    const staffBreakdown = Object.values(staffMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const avgTicket = completed.length > 0 ? Math.round(totalGrossRevenue / completed.length) : 0;

    return {
      completed,
      totalGrossRevenue,
      avgTicket,
      dailyBreakdown,
      staffBreakdown,
    };
  }, [appointments, services, users]);

  // Formatter for exporting full booking details
  const formatRecordForSheet = (a: Appointment) => {
    const apptServices: Service[] = (a.serviceIds || [])
      .map((sId) => services.find((s) => s.id === sId))
      .filter(Boolean) as Service[];

    const serviceNames =
      apptServices.map((s) => s.name).join(", ") ||
      (a.serviceId ? services.find((s) => s.id === a.serviceId)?.name : "") ||
      "Hair & Beauty Service";

    const sId = a.assignedStaffId || a.staffId || "unassigned";
    const staffUser = users.find((u) => u.id === sId || u.uid === sId);
    const stylistName = staffUser?.fullName || (sId === "unassigned" ? "General Team / Salon" : "Stylist");

    const customerUser = users.find((u) => u.uid === a.customerUid || u.id === a.customerId);
    const customerEmail = a.customerEmail || customerUser?.email || "-";

    const totalAmount =
      a.priceAtBooking ||
      apptServices.reduce((acc, s) => acc + (s.price || 0), 0) ||
      0;

    return {
      reference: a.reference || a.id,
      date: formatDate(a.date),
      time: formatTime(a.startTime || a.time),
      customerName: a.customerName || "Walk-in Guest",
      customerPhone: a.customerPhone || "-",
      customerEmail: customerEmail,
      services: serviceNames,
      stylistName: stylistName,
      totalAmount: totalAmount,
      status: "Completed",
      paymentMode: a.source ? a.source.toUpperCase() : "Counter / Direct",
    };
  };

  // Trigger Google Sheet sync with deduplication
  const handleSyncToGoogleSheets = async (scope: "yesterday" | "today" | "all") => {
    const currentWebhook = webhookUrl || localStorage.getItem("gg_google_sheet_webhook");
    if (!currentWebhook) {
      toast.info("Please connect your Google Sheet first (Free 60-second setup).");
      setSheetDialogOpen(true);
      return;
    }

    // Determine target appointments based on scope
    const now = new Date();
    let targetAppts: Appointment[] = [];
    let scopeLabel = "";

    const allCompleted = appointments.filter(
      (a) => a.status === "completed" || a.status === "Completed"
    );

    if (scope === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      targetAppts = allCompleted.filter((a) => a.date === yesterdayStr);
      scopeLabel = `yesterday (${formatDate(yesterdayStr)})`;
    } else if (scope === "today") {
      const todayStr = now.toISOString().split("T")[0];
      targetAppts = allCompleted.filter((a) => a.date === todayStr);
      scopeLabel = `today (${formatDate(todayStr)})`;
    } else {
      targetAppts = allCompleted;
      scopeLabel = "all completed records";
    }

    if (targetAppts.length === 0) {
      toast.info(`No completed appointments found for ${scopeLabel}.`);
      return;
    }

    setIsSyncing(true);
    setSyncScope(scope);

    try {
      const records = targetAppts.map(formatRecordForSheet);

      const res = await fetch("/api/owner/sync-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: currentWebhook,
          records,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const dateNow = new Date().toLocaleDateString([], { day: "numeric", month: "short" });
        const fullStamp = `${dateNow} at ${timeNow}`;
        setLastSyncTime(fullStamp);
        localStorage.setItem("gg_google_sheet_last_sync", fullStamp);

        if (data.added > 0) {
          toast.success(
            `Exported to Google Sheet! Added ${data.added} new booking(s). ${data.skipped || 0} duplicates skipped.`,
            { duration: 5000 }
          );
        } else {
          toast.info(
            `All ${data.skipped || data.total || targetAppts.length} records are already present in Google Sheet. Zero duplicates added!`,
            { duration: 5000 }
          );
        }
      } else {
        toast.error(data.error || "Could not sync to Google Sheet. Check webhook settings.");
      }
    } catch (e: any) {
      toast.error("Sync failed: " + (e.message || "Network error"));
    } finally {
      setIsSyncing(false);
      setSyncScope(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="30-Day Financial Analytics & Staff Reports"
        subtitle="Rolling 30-day salon gross revenue, daily trend, and stylist productivity contribution"
      />

      {/* Google Sheets One-Click Export & Sync Console */}
      <Card className="p-5 rounded-none border border-[#E9E1D6] bg-[#FFFDFA] shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E9E1D6] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-none bg-[#F0EBE3] flex items-center justify-center text-[#A27C48] shrink-0 border border-[#E9E1D6]">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[#302A24]">Google Sheets 1-Click Sync</h3>
                <span className="inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#E0EBDD] text-[#355B3C] border border-[#E0EBDD]">
                  <ShieldCheck className="h-3 w-3" /> Zero Duplicates
                </span>
              </div>
              <p className="text-xs text-[#74695E] mt-0.5">
                Export customer name, email, phone, services, stylist &amp; earnings directly to your Google Sheet anytime.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSheetDialogOpen(true)}
            className="rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3] text-xs h-8 gap-1.5 self-start sm:self-auto shrink-0"
          >
            <Settings className="h-3.5 w-3.5 text-[#74695E]" />
            {webhookUrl ? "Sheet Connected" : "Connect Google Sheet (Free)"}
          </Button>
        </div>

        {/* Sync Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Morning Routine: Yesterday's Completed */}
          <Button
            onClick={() => handleSyncToGoogleSheets("yesterday")}
            disabled={isSyncing}
            className="rounded-none bg-[#A27C48] hover:bg-[#876438] text-white text-xs h-10 px-3.5 flex items-center justify-center gap-2 shadow-none font-medium"
          >
            {isSyncing && syncScope === "yesterday" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sun className="h-4 w-4 shrink-0 text-amber-200" />
            )}
            <div className="text-left leading-tight truncate">
              <span className="font-semibold block">Start of Day: Sync Yesterday</span>
              <span className="text-[10px] text-amber-100/90 font-normal">Morning routine review</span>
            </div>
          </Button>

          {/* Sync Today's Completed */}
          <Button
            variant="outline"
            onClick={() => handleSyncToGoogleSheets("today")}
            disabled={isSyncing}
            className="rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3] text-xs h-10 px-3.5 flex items-center justify-center gap-2 font-medium"
          >
            {isSyncing && syncScope === "today" ? (
              <RefreshCw className="h-4 w-4 animate-spin text-[#A27C48]" />
            ) : (
              <Clock className="h-4 w-4 shrink-0 text-[#A27C48]" />
            )}
            <div className="text-left leading-tight truncate">
              <span className="font-semibold block">Sync Today&apos;s Completed</span>
              <span className="text-[10px] text-[#74695E] font-normal">Real-time daily progress</span>
            </div>
          </Button>

          {/* Sync All Completed (30-Day Window) */}
          <Button
            variant="outline"
            onClick={() => handleSyncToGoogleSheets("all")}
            disabled={isSyncing}
            className="rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3] text-xs h-10 px-3.5 flex items-center justify-center gap-2 font-medium"
          >
            {isSyncing && syncScope === "all" ? (
              <RefreshCw className="h-4 w-4 animate-spin text-[#A27C48]" />
            ) : (
              <RefreshCw className="h-4 w-4 shrink-0 text-[#74695E]" />
            )}
            <div className="text-left leading-tight truncate">
              <span className="font-semibold block">Sync All Completed Data</span>
              <span className="text-[10px] text-[#74695E] font-normal">All historical records</span>
            </div>
          </Button>
        </div>

        {/* Status Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#74695E] pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  webhookUrl ? "bg-[#355B3C]" : "bg-amber-500 animate-pulse"
                }`}
              />
              {webhookUrl ? (
                <span className="text-[#302A24] font-medium">Google Sheet Webhook Active</span>
              ) : (
                <span className="text-amber-700 font-medium">Not Connected — Click &quot;Connect Google Sheet&quot; to link for free</span>
              )}
            </span>
            <span className="hidden sm:inline text-[#E9E1D6]">|</span>
            <span className="hidden sm:inline">Deduplication: By Unique Booking Reference</span>
          </div>

          {lastSyncTime ? (
            <span className="text-[#302A24] font-medium">
              Last Synced: <span className="font-mono text-[#74695E]">{lastSyncTime}</span>
            </span>
          ) : (
            <span className="italic text-[#74695E]">No sync performed in this session</span>
          )}
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-none border border-[#E9E1D6] bg-[#FFFDFA] shadow-none space-y-2">
          <div className="flex items-center justify-between text-[#74695E]">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em]">30-Day Gross Revenue</span>
            <DollarSign className="h-4 w-4 text-[#355B3C]" />
          </div>
          <p className="text-3xl font-semibold text-[#302A24]">
            {formatPrice(thirtyDayData.totalGrossRevenue)}
          </p>
          <span className="text-[11px] text-[#74695E] block">From verified completed services</span>
        </Card>

        <Card className="p-5 rounded-none border border-[#E9E1D6] bg-[#FFFDFA] shadow-none space-y-2">
          <div className="flex items-center justify-between text-[#74695E]">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em]">Services Completed</span>
            <Calendar className="h-4 w-4 text-[#A27C48]" />
          </div>
          <p className="text-3xl font-semibold text-[#302A24]">
            {thirtyDayData.completed.length}
          </p>
          <span className="text-[11px] text-[#74695E] block">Over the rolling 30 days</span>
        </Card>

        <Card className="p-5 rounded-none border border-[#E9E1D6] bg-[#FFFDFA] shadow-none space-y-2">
          <div className="flex items-center justify-between text-[#74695E]">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em]">Average Ticket Size</span>
            <TrendingUp className="h-4 w-4 text-[#A27C48]" />
          </div>
          <p className="text-3xl font-semibold text-[#302A24]">
            {formatPrice(thirtyDayData.avgTicket)}
          </p>
          <span className="text-[11px] text-[#74695E] block">Average revenue per guest</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Revenue Contribution Breakdown */}
        <Section title="Stylist Revenue Contribution" description="Performance by stylist">
          {thirtyDayData.staffBreakdown.length === 0 ? (
            <EmptyState icon={Users} title="No staff data" description="Complete appointments to view stylist breakdown." />
          ) : (
            <div className="overflow-x-auto rounded-none border border-[#E9E1D6] bg-[#FFFDFA] shadow-none">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0EBE3] border-b border-[#E9E1D6] text-[#302A24] font-semibold text-xs">
                  <tr>
                    <th className="p-3">Stylist</th>
                    <th className="p-3 text-center">Services</th>
                    <th className="p-3 text-right">Revenue (₹)</th>
                    <th className="p-3 text-right">% Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E1D6]">
                  {thirtyDayData.staffBreakdown.map((s) => {
                    const share =
                      thirtyDayData.totalGrossRevenue > 0
                        ? Math.round((s.totalRevenue / thirtyDayData.totalGrossRevenue) * 100)
                        : 0;
                    return (
                      <tr key={s.staffId} className="hover:bg-[#F0EBE3]/50 transition-colors">
                        <td className="p-3 font-medium text-[#302A24] flex items-center gap-2">
                          <Scissors className="h-3.5 w-3.5 text-[#A27C48] shrink-0" />
                          <span className="truncate">{s.staffName}</span>
                        </td>
                        <td className="p-3 text-center font-medium text-[#74695E]">{s.apptCount}</td>
                        <td className="p-3 text-right font-semibold text-[#302A24]">
                          {formatPrice(s.totalRevenue)}
                        </td>
                        <td className="p-3 text-right font-medium text-[#355B3C]">{share}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Daily Revenue Trend Breakdown */}
        <Section title="Daily Revenue Breakdown" description="Historical daily earnings">
          {thirtyDayData.dailyBreakdown.length === 0 ? (
            <EmptyState icon={Calendar} title="No daily earnings" description="Daily revenue history will record here." />
          ) : (
            <div className="overflow-x-auto rounded-none border border-[#E9E1D6] bg-[#FFFDFA] shadow-none max-h-[360px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0EBE3] border-b border-[#E9E1D6] text-[#302A24] font-semibold text-xs sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-center">Appointments</th>
                    <th className="p-3 text-right">Daily Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E1D6]">
                  {thirtyDayData.dailyBreakdown.map((d) => (
                    <tr key={d.date} className="hover:bg-[#F0EBE3]/50 transition-colors">
                      <td className="p-3 font-medium text-[#302A24]">{formatDate(d.date)}</td>
                      <td className="p-3 text-center font-medium text-[#74695E]">{d.count}</td>
                      <td className="p-3 text-right font-semibold text-[#302A24]">{formatPrice(d.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* Google Sheet Connection Modal */}
      <GoogleSheetDialog
        open={sheetDialogOpen}
        onOpenChange={setSheetDialogOpen}
        onSaved={(url) => setWebhookUrl(url)}
      />
    </div>
  );
}
