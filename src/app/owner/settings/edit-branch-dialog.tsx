import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Branch } from "@/lib/types";
import { branchService } from "@/lib/services/branchService";

interface EditBranchDialogProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBranchDialog({ branch, open, onOpenChange }: EditBranchDialogProps) {
  const [formData, setFormData] = useState<Partial<Branch>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (branch && open) {
      setFormData({
        name: branch.name,
        tagline: branch.tagline,
        address: branch.address,
        city: branch.city,
        phone: branch.phone,
        totalChairs: branch.totalChairs,
      });
    }
  }, [branch, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!branch) return;
    setLoading(true);
    try {
      await branchService.updateBranch(branch.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update branch", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#302A24]">Edit Branch Information</DialogTitle>
          <DialogDescription className="text-xs text-[#74695E]">
            Update the details for {branch?.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3.5 py-3">
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="name" className="text-right text-xs text-[#302A24]">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="col-span-3 h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="tagline" className="text-right text-xs text-[#302A24]">
              Tagline
            </Label>
            <Input
              id="tagline"
              name="tagline"
              value={formData.tagline || ""}
              onChange={handleChange}
              className="col-span-3 h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="address" className="text-right text-xs text-[#302A24]">
              Address
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="col-span-3 h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="city" className="text-right text-xs text-[#302A24]">
              City
            </Label>
            <Input
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              className="col-span-3 h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="phone" className="text-right text-xs text-[#302A24]">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="col-span-3 h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="totalChairs" className="text-right text-xs text-[#302A24]">
              Chairs
            </Label>
            <Input
              id="totalChairs"
              name="totalChairs"
              type="number"
              value={formData.totalChairs || ""}
              onChange={handleChange}
              className="col-span-3 h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>
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
