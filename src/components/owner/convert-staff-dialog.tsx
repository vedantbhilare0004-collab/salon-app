"use client";

import { useEffect, useState } from "react";
import { Search, UserCog } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ConvertStaffDialog({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const { users, services, convertToStaff, getServicesFor } = useData();
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<null | (typeof users)[number]>(null);
  const [error, setError] = useState("");
  const [branch, setBranch] = useState<BranchId>("koregaon");
  const [position, setPosition] = useState("Stylist");
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      setSearch(userId);
      runSearch(userId);
    } else {
      setSearch("");
      setFound(null);
    }
    setError("");
    setBranch("koregaon");
    setPosition("Stylist");
    setPicked([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function runSearch(q: string) {
    setError("");
    const u = users.find(
      (x) => x.id.toLowerCase() === q.trim().toLowerCase() && x.role === "customer"
    );
    if (!u) {
      setFound(null);
      setError("No customer found with that User ID.");
      return;
    }
    setFound(u);
    setBranch(u.preferredBranch);
  }

  function toggle(sid: string) {
    setPicked((p) => (p.includes(sid) ? p.filter((x) => x !== sid) : [...p, sid]));
  }

  async function activate() {
    if (!found) return;
    const res = await convertToStaff(found.id, { branch, position, services: picked });
    if (!res.ok) {
      setError(res.error ?? "Could not convert.");
      return;
    }
    toast.success(`${found.fullName} is now staff`);
    onClose();
  }

  const branchServices = getServicesFor(branch);

  return (
    <Dialog open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-semibold text-lg text-[#302A24]">
            <UserCog className="h-5 w-5 text-[#A27C48]" /> Convert Customer to Staff
          </DialogTitle>
          <DialogDescription className="text-xs text-[#74695E]">
            Enter the customer's User ID to look them up. No duplicate accounts are created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="uid" className="text-xs text-[#302A24]">User ID</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74695E]" />
              <Input
                id="uid"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. GG7K4M9P2Q"
                className="pl-9 font-mono text-xs h-9 rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => runSearch(search)} className="h-9 text-xs rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]">
              Search
            </Button>
          </div>
        </div>

        {error && <p className="text-xs text-[#8C3930]">{error}</p>}

        {found && (
          <div className="space-y-4 rounded-md border border-[#E9E1D6] bg-[#F0EBE3]/30 p-4">
            <div className="flex items-center gap-3">
              <UserAvatar name={found.fullName} color={found.avatarColor} className="rounded-full border border-[#E9E1D6]" />
              <div>
                <p className="font-semibold text-sm text-[#302A24]">{found.fullName}</p>
                <p className="text-xs text-[#74695E]">{found.email} · {found.phone}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pos" className="text-xs text-[#302A24]">Position</Label>
              <Input
                id="pos"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Senior Stylist"
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-[#302A24]">Services they can perform</Label>
              <div className="grid gap-2 sm:grid-cols-2 max-h-40 overflow-y-auto">
                {branchServices.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "flex items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors",
                      picked.includes(s.id)
                        ? "border-[#A27C48] bg-[#F0EBE3] text-[#302A24] font-medium"
                        : "border-[#E9E1D6] bg-[#FFFDFA] text-[#74695E] hover:bg-[#F0EBE3]/40"
                    )}
                  >
                    <span className="truncate">{s.name}</span>
                    {picked.includes(s.id) && <span className="text-[#A27C48] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!found}
            onClick={activate}
            className="rounded-md bg-[#A27C48] hover:bg-[#876438] text-white font-medium text-xs transition-colors"
          >
            Activate as Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
