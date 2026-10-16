"use client";

import { useState } from "react";
import {
  Check,
  Phone,
  Plus,
  MonitorDot,
  UserCheck,
  X,
  LayoutGrid,
} from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BranchSwitcher } from "./branch-switcher";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceCatalog } from "./service-catalog";

export function ReceptionMode({ onExit }: { onExit: () => void }) {
  const {
    activeBranchId,
    getBranch,
    getShopStatus,
    liveQueue,
    appointments,
    getServicesFor,
    confirmAppointment,
    checkInAppointment,
    startService,
    completeAppointment,
    markNoShow,
    joinWalkIn,
  } = useData();
  const bid = activeBranchId;
  const branch = getBranch(bid);
  const status = getShopStatus(bid);
  const [walkOpen, setWalkOpen] = useState(false);
  const [walkName, setWalkName] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);

  const todays = appointments.filter((a) => a.branchId === bid && a.date === new Date().toISOString().slice(0, 10));
  const pending = todays.filter((a) => a.status === "pending");
  const confirmed = todays.filter((a) => a.status === "confirmed");

  const branchQueue = liveQueue.filter(q => q.branchId === bid);
  const waitingList = branchQueue.filter(q => q.status === "waiting");
  const inServiceList = branchQueue.filter(q => q.status === "in_service");

  function serviceNames(ids: string[]) {
    const svcs = getServicesFor(bid);
    return ids.map((id) => svcs.find((s) => s.id === id)?.name ?? "Service").join(", ");
  }

  async function addWalkIn() {
    if (!walkName.trim()) return;
    try {
      await joinWalkIn(bid, walkName.trim(), []);
      toast.success("Added to the queue");
    } catch {
      toast.error("Could not add walk-in");
    }
    setWalkName("");
    setWalkOpen(false);
  }

  const run = (fn: () => Promise<void>, msg: string) => () => {
    fn()
      .then(() => toast.success(msg))
      .catch(() => toast.error("Action failed. Please try again."));
  };

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#302A24] pb-12 animate-in fade-in duration-200">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-[#E9E1D6] bg-[#FFFDFA] px-3 py-3 shadow-2xs sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#A27C48] font-semibold text-sm text-white">
          G
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-sm text-[#302A24]">Reception Console · Glow & Glamour</p>
          <p className="text-[11px] text-[#74695E]">
            {status.isOpen ? "Open" : "Closed"} · {status.waitingCount} waiting · ~{status.estimatedWaitMin}m Wait
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] text-xs h-9" onClick={() => setCatalogOpen(true)}>
            <LayoutGrid className="h-3.5 w-3.5 text-[#A27C48]" /> Catalog
          </Button>
          <Button variant="default" size="sm" className="gap-2 rounded-md bg-[#A27C48] hover:bg-[#876438] text-white text-xs h-9 shadow-xs transition-colors" onClick={() => setWalkOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Check-In
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3]" onClick={onExit} aria-label="Exit reception">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 p-3 sm:p-6 lg:grid-cols-2">
        {/* Left Column: Live Queue */}
        <div className="space-y-4">
          <Card className="overflow-hidden p-5 shadow-xs border border-[#E9E1D6] bg-[#FFFDFA] rounded-md">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#355B3C]">
              In Service ({inServiceList.length} / {status.totalChairs})
            </h2>
            {inServiceList.length === 0 ? (
              <p className="rounded-md bg-[#F0EBE3]/50 px-4 py-8 text-center text-xs text-[#74695E]">
                No active services right now.
              </p>
            ) : (
              <ul className="space-y-2">
                {inServiceList.map((q) => (
                  <li key={q.id} className="flex items-center gap-3 rounded-md border border-[#E9E1D6] bg-[#F6F3ED]/30 p-3 shadow-2xs">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#E0EBDD] text-[#355B3C]">
                      <MonitorDot className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-sm text-[#302A24]">{q.customerName}</p>
                      <p className="text-xs text-[#74695E]">
                        Started at {new Date(q.serviceStartTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1 bg-[#355B3C] hover:bg-[#2c4c32] text-white rounded-md text-xs h-8"
                      onClick={run(() => completeAppointment(q.appointmentId!), `Completed ${q.customerName}`)}
                    >
                      <Check className="h-3.5 w-3.5" /> Complete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="overflow-hidden p-5 shadow-xs border border-[#E9E1D6] bg-[#FFFDFA] rounded-md">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#74695E]">Waiting Queue ({waitingList.length})</h3>
            {waitingList.length === 0 ? (
              <p className="rounded-md bg-[#F0EBE3]/50 px-4 py-8 text-center text-xs text-[#74695E]">
                Queue is empty.
              </p>
            ) : (
              <ul className="space-y-2">
                {waitingList.map((q, i) => {
                  const waitDurationMin = Math.round((Date.now() - new Date(q.arrivalTime).getTime()) / 60000);
                  return (
                    <li
                      key={q.id}
                      className="flex items-center gap-3 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] p-3 shadow-2xs"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#F0EBE3] text-sm font-bold text-[#A27C48]">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-sm text-[#302A24]">{q.customerName}</p>
                        <p className="text-xs text-[#74695E] flex items-center gap-1">
                          {q.isWalkIn ? "Walk-in" : "Booked"} · Waiting {waitDurationMin}m 
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1 bg-[#A27C48] hover:bg-[#876438] text-white rounded-md text-xs h-8 transition-colors"
                        onClick={run(() => startService(q.appointmentId!), `Serving ${q.customerName}`)}
                      >
                        <Check className="h-3.5 w-3.5" /> Start
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* Right Column: Bookings */}
        <div className="space-y-4">
          <QueueColumn
            title="Incoming Bookings (Pending)"
            count={pending.length}
            empty="No pending bookings."
          >
            {pending.map((a) => (
              <Row key={a.id} name={a.customerName} sub={`${a.time} · ${serviceNames(a.serviceIds)}`}>
                <Button size="sm" className="gap-1 bg-[#A27C48] hover:bg-[#876438] text-white rounded-md text-xs h-8" onClick={run(() => confirmAppointment(a.id), "Confirmed")}>
                  <Check className="h-3.5 w-3.5" /> Confirm
                </Button>
                <Button size="sm" variant="ghost" className="text-[#8C3930] hover:bg-[#F7E7E3] rounded-md text-xs h-8" onClick={run(() => markNoShow(a.id), "Rejected")}>
                  Reject
                </Button>
              </Row>
            ))}
          </QueueColumn>

          <QueueColumn title="Upcoming (Confirmed)" count={confirmed.length} empty="No confirmed bookings.">
            {confirmed.map((a) => (
              <Row key={a.id} name={a.customerName} sub={`${a.time} · ${serviceNames(a.serviceIds)}`}>
                <Button size="sm" className="gap-1 bg-[#F0EBE3] hover:bg-[#E9E1D6] text-[#302A24] border border-[#E9E1D6] rounded-md text-xs h-8" onClick={run(() => checkInAppointment(a.id), "Checked in to Live Queue")}>
                  <UserCheck className="h-3.5 w-3.5 text-[#A27C48]" /> Move to Live Queue
                </Button>
                <Button size="sm" variant="ghost" className="text-[#8C3930] hover:bg-[#F7E7E3] rounded-md text-xs h-8" onClick={run(() => markNoShow(a.id), "No Show")}>
                  No Show
                </Button>
              </Row>
            ))}
          </QueueColumn>
        </div>
      </div>

      <Dialog open={walkOpen} onOpenChange={setWalkOpen}>
        <DialogContent className="rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-semibold text-lg text-[#302A24]">Check-In Walk-in</DialogTitle>
            <DialogDescription className="text-xs text-[#74695E]">Customer immediately joins the live queue at {BRANCH_LABELS[bid]}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="walk-name" className="text-xs text-[#302A24]">Customer name</Label>
            <Input
              id="walk-name"
              value={walkName}
              onChange={(e) => setWalkName(e.target.value)}
              placeholder="e.g. Walk-in Guest"
              onKeyDown={(e) => e.key === "Enter" && addWalkIn()}
              className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              autoFocus
            />
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setWalkOpen(false)} className="rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={addWalkIn} disabled={!walkName.trim()} className="rounded-md bg-[#A27C48] hover:bg-[#876438] text-white font-medium text-xs transition-colors">
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-hidden p-0 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
          <DialogHeader className="px-6 pt-6 pb-2 border-b border-[#E9E1D6]">
            <DialogTitle className="text-xl font-semibold text-[#302A24]">Service Catalog</DialogTitle>
            <DialogDescription className="text-xs text-[#74695E]">
              Browse all our services. Click arrows or swipe to see more.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-4 pb-12">
            <ServiceCatalog services={getServicesFor(bid)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QueueColumn({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4 shadow-xs border border-[#E9E1D6] bg-[#FFFDFA] rounded-md">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#302A24]">{title}</h3>
        <span className="rounded-md bg-[#F0EBE3] px-2 py-0.5 text-xs font-semibold text-[#A27C48]">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="rounded-md bg-[#F0EBE3]/50 px-4 py-5 text-center text-xs text-[#74695E]">{empty}</p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </Card>
  );
}

function Row({
  name,
  sub,
  children,
}: {
  name: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-md border border-[#E9E1D6] bg-[#F6F3ED]/30 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-sm text-[#302A24]">{name}</p>
        <p className="truncate text-xs text-[#74695E]">{sub}</p>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
