import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Branch, WorkingHour } from "@/lib/types";
import { branchService } from "@/lib/services/branchService";

interface EditWorkingHoursDialogProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkingHoursDialog({ branch, open, onOpenChange }: EditWorkingHoursDialogProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (branch && open) {
      // Deep copy to avoid mutating the original object directly
      setWorkingHours(JSON.parse(JSON.stringify(branch.workingHours || [])));
    }
  }, [branch, open]);

  const handleDayChange = (index: number, field: keyof WorkingHour, value: string | boolean) => {
    setWorkingHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!branch) return;
    setLoading(true);
    try {
      await branchService.updateBranch(branch.id, { workingHours });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update working hours", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#302A24]">Edit Working Hours</DialogTitle>
          <DialogDescription className="text-xs text-[#74695E]">
            Update the working schedule for {branch?.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3.5 py-3 max-h-[60vh] overflow-y-auto">
          {workingHours.map((wh, idx) => (
            <div key={wh.day} className="flex items-center gap-4 border-b border-[#E9E1D6] pb-3 last:border-0 last:pb-0">
              <div className="w-12 font-medium text-xs text-[#302A24]">{wh.day}</div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!wh.closed}
                  onCheckedChange={(checked) => handleDayChange(idx, "closed", !checked)}
                />
                <span className="text-xs w-12 text-[#74695E]">{wh.closed ? "Closed" : "Open"}</span>
              </div>
              {!wh.closed && (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={wh.open}
                    onChange={(e) => handleDayChange(idx, "open", e.target.value)}
                    className="w-full text-xs h-8 rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
                  />
                  <span className="text-xs text-[#74695E]">to</span>
                  <Input
                    type="time"
                    value={wh.close}
                    onChange={(e) => handleDayChange(idx, "close", e.target.value)}
                    className="w-full text-xs h-8 rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] text-xs">
            Cancel
          </Button>
          <Button type="submit" size="sm" onClick={handleSave} disabled={loading} className="rounded-md bg-[#A27C48] hover:bg-[#876438] text-white font-medium text-xs transition-colors">
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
