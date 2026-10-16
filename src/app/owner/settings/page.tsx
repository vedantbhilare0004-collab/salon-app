"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Building2, Clock, LogOut, Moon, Sun, Pencil, Plus, Trash2 } from "lucide-react";
import { EditBranchDialog } from "./edit-branch-dialog";
import { EditWorkingHoursDialog } from "./edit-working-hours-dialog";
import { AddBranchDialog } from "./add-branch-dialog";
import { branchService } from "@/lib/services/branchService";
import { useData } from "@/lib/store";
import { useTheme } from "next-themes";
import { BRANCH_LABELS, type Branch } from "@/lib/types";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PasswordDialog } from "@/components/password-dialog";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { settingsService } from "@/lib/services/settingsService";

export default function OwnerSettings() {
  const { currentUser, logout, branches } = useData();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [pwOpen, setPwOpen] = useState(false);
  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [editingBranchInfo, setEditingBranchInfo] = useState<Branch | null>(null);
  const [editingWorkingHours, setEditingWorkingHours] = useState<Branch | null>(null);

  const validBranches = branches.filter(
    (b) => b.id === "koregaon" || (b.name && b.name.trim().length > 0 && b.id !== "lhasurane")
  );
  const [rules, setRules] = useState({
    autoConfirm: false,
    allowWalkIn: true,
    reminders: true,
    weekendOnlyOffer: false,
  });
  const [prefs, setPrefs] = useState({ booking: true, offers: true, announcements: true });
  if (!currentUser) return null;

  useEffect(() => {
    settingsService.get().then((s) => {
      setRules({
        autoConfirm: s.autoConfirm,
        allowWalkIn: s.allowWalkIn,
        reminders: s.reminders,
        weekendOnlyOffer: s.weekendOnlyOffer,
      });
      setPrefs({
        booking: s.notifyBooking,
        offers: s.notifyOffers,
        announcements: s.notifyAnnouncements,
      });
    });
  }, []);

  const updateRule = (key: keyof typeof rules, v: boolean) => {
    setRules((r) => ({ ...r, [key]: v }));
    settingsService.save({ [key]: v } as never);
  };
  const updatePref = (key: keyof typeof prefs, v: boolean) => {
    setPrefs((p) => ({ ...p, [key]: v }));
    const map = { booking: "notifyBooking", offers: "notifyOffers", announcements: "notifyAnnouncements" } as const;
    settingsService.save({ [map[key]]: v } as never);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader title="Studio Settings" subtitle="Manage salon information, branch locations, operating hours, and booking policies." />

      <Card className="space-y-4 p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F0EBE3] text-[#A27C48]">
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-semibold text-sm text-[#302A24]">Appearance Mode</p>
            <p className="text-xs text-[#74695E]">Select interface aesthetic preference</p>
          </div>
          <div className="ml-auto flex gap-1 rounded-md bg-[#F0EBE3] p-1">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                  theme === t ? "bg-[#FFFDFA] text-[#302A24] shadow-xs font-semibold" : "text-[#74695E] hover:text-[#302A24]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F0EBE3] text-[#A27C48]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#302A24]">Salon & Studio Information</p>
              <p className="text-xs text-[#74695E]">Manage your salon profile, contact details, and station capacity.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setAddBranchOpen(true)}
            className="gap-1.5 bg-[#A27C48] hover:bg-[#876438] text-white text-xs font-medium h-9 rounded-md shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Branch
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {validBranches.map((b) => (
            <div key={b.id} className="rounded-md border border-[#E9E1D6] bg-[#F6F3ED]/40 p-4 relative space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-[#302A24]">
                    {b.id === "koregaon" ? "Glow & Glamour Hair Studio" : b.name}
                  </p>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3] rounded-md" onClick={() => setEditingBranchInfo(b)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold", b.isOpen ? "bg-[#E0EBDD] text-[#355B3C] border border-[#E0EBDD]" : "bg-[#F7E7E3] text-[#8C3930] border border-[#F7E7E3]")}>
                    {b.isOpen ? "Open" : "Closed"}
                  </span>
                  {b.id !== "koregaon" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-[#8C3930] hover:bg-[#F7E7E3] rounded-md"
                      onClick={() => {
                        branchService.deleteBranch(b.id);
                      }}
                      title="Delete branch"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-[#74695E] leading-relaxed">{b.address}</p>
              <p className="text-xs text-[#74695E] font-mono">{b.phone}</p>
              <div className="pt-2 border-t border-[#E9E1D6] flex items-center justify-between text-xs font-medium text-[#302A24]">
                <span>{b.totalChairs} styling chairs</span>
                <span className="text-[#355B3C]">{b.availableChairs} available now</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F0EBE3] text-[#A27C48]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#302A24]">Salon Working Hours</p>
            <p className="text-xs text-[#74695E]">Operating roster and appointment availability hours.</p>
          </div>
        </div>
        {validBranches.map((b) => (
          <div key={b.id} className="rounded-md border border-[#E9E1D6] bg-[#F6F3ED]/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#302A24]">{b.id === "koregaon" ? "Glow & Glamour Salon" : b.name}</p>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3] rounded-md" onClick={() => setEditingWorkingHours(b)}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
              {b.workingHours.map((w) => (
                <div key={w.day} className="flex justify-between py-0.5">
                  <span className="text-[#74695E]">{w.day}</span>
                  <span className="text-[#302A24] font-medium">{w.closed ? "Closed" : `${formatTime(w.open)}–${formatTime(w.close)}`}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <Card className="space-y-4 p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F0EBE3] text-[#A27C48]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#302A24]">Booking Rules</p>
            <p className="text-xs text-[#74695E]">Set appointment confirmation and walk-in policies</p>
          </div>
        </div>
        {[
          { key: "autoConfirm", label: "Auto-confirm bookings", desc: "Skip manual confirmation" },
          { key: "allowWalkIn", label: "Allow walk-in queue", desc: "Customers can join without booking" },
          { key: "reminders", label: "Send appointment reminders", desc: "Notify before scheduled time" },
          { key: "weekendOnlyOffer", label: "Offers weekend-only", desc: "Restrict promotions to weekends" },
        ].map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 border-t border-[#E9E1D6] pt-3 first:border-0 first:pt-0">
            <div>
              <Label className="font-medium text-xs text-[#302A24]">{row.label}</Label>
              <p className="text-[11px] text-[#74695E]">{row.desc}</p>
            </div>
            <Switch
              checked={rules[row.key as keyof typeof rules]}
              onCheckedChange={(v) => updateRule(row.key as keyof typeof rules, v)}
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-4 p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F0EBE3] text-[#A27C48]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#302A24]">Notifications</p>
            <p className="text-xs text-[#74695E]">Alert preferences for salon activity</p>
          </div>
        </div>
        {[
          { key: "booking", label: "New booking alerts" },
          { key: "offers", label: "Offer publishing" },
          { key: "announcements", label: "Staff announcements" },
        ].map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 border-t border-[#E9E1D6] pt-3 first:border-0 first:pt-0">
            <Label className="font-medium text-xs text-[#302A24]">{row.label}</Label>
            <Switch
              checked={prefs[row.key as keyof typeof prefs]}
              onCheckedChange={(v) => updatePref(row.key as keyof typeof prefs, v)}
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-3 p-5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
        <p className="font-semibold text-sm text-[#302A24]">Account Management</p>
        <Button variant="outline" className="w-full justify-start rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] text-xs h-9" onClick={() => setPwOpen(true)}>
          Change Password
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-[#8C3930] border-[#F7E7E3] hover:bg-[#F7E7E3] rounded-md text-xs h-9"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut className="h-4 w-4 mr-1.5" /> Logout of Owner Session
        </Button>
      </Card>

      <PasswordDialog open={pwOpen} onOpenChange={setPwOpen} />

      <EditBranchDialog 
        branch={editingBranchInfo} 
        open={!!editingBranchInfo} 
        onOpenChange={(open) => !open && setEditingBranchInfo(null)} 
      />
      <EditWorkingHoursDialog 
        branch={editingWorkingHours} 
        open={!!editingWorkingHours} 
        onOpenChange={(open) => !open && setEditingWorkingHours(null)} 
      />
      <AddBranchDialog 
        open={addBranchOpen} 
        onOpenChange={setAddBranchOpen} 
      />
    </div>
  );
}
