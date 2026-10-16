"use client";

import { useState } from "react";
import { useData } from "@/lib/store";
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
import { toast } from "sonner";

export function PasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { updatePassword } = useData();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (next.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    const res = await updatePassword(current, next);
    if (!res.ok) {
      setError(res.error ?? "Could not change password.");
      return;
    }
    toast.success("Password updated");
    setCurrent("");
    setNext("");
    setConfirm("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#302A24]">Change Password</DialogTitle>
          <DialogDescription className="text-sm text-[#74695E]">Enter your current password to set a new one.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="cur" className="text-xs uppercase tracking-wider font-semibold text-[#74695E]">Current Password</Label>
            <Input id="cur" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="bg-[#FFFDFA] border-[#E9E1D6] text-[#302A24] focus-visible:ring-[#A27C48] rounded-none" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nxt" className="text-xs uppercase tracking-wider font-semibold text-[#74695E]">New Password</Label>
            <Input id="nxt" type="password" value={next} onChange={(e) => setNext(e.target.value)} className="bg-[#FFFDFA] border-[#E9E1D6] text-[#302A24] focus-visible:ring-[#A27C48] rounded-none" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cfg" className="text-xs uppercase tracking-wider font-semibold text-[#74695E]">Confirm New Password</Label>
            <Input id="cfg" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-[#FFFDFA] border-[#E9E1D6] text-[#302A24] focus-visible:ring-[#A27C48] rounded-none" />
          </div>
          {error && <p className="text-xs font-medium text-[#8C3930] bg-[#F7E7E3] p-2 border border-[#E9E1D6]">{error}</p>}
        </div>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]">
            Cancel
          </Button>
          <Button onClick={submit} className="rounded-none bg-[#A27C48] hover:bg-[#876438] text-white">Update Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
