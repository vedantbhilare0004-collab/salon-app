"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { branchService } from "@/lib/services/branchService";
import { toast } from "sonner";
import { Plus, Building2 } from "lucide-react";

interface AddBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBranchDialog({ open, onOpenChange }: AddBranchDialogProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Koregaon");
  const [phone, setPhone] = useState("");
  const [totalChairs, setTotalChairs] = useState(4);
  const [openingTime, setOpeningTime] = useState("09:30");
  const [closingTime, setClosingTime] = useState("21:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Branch name is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await branchService.addBranch({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim(),
        totalChairs: Number(totalChairs) || 4,
        availableChairs: Number(totalChairs) || 4,
        openingTime,
        closingTime,
        isOpen: true,
      });
      toast.success("Branch created successfully");
      setName("");
      setAddress("");
      setPhone("");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to add branch", err);
      toast.error("Failed to create branch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#A27C48] font-semibold text-xs uppercase tracking-wider">
            <Building2 className="h-4 w-4 text-[#A27C48]" />
            <span>Salon Expansion</span>
          </div>
          <DialogTitle className="text-lg font-semibold text-[#302A24]">Add New Branch</DialogTitle>
          <DialogDescription className="text-xs text-[#74695E]">
            Register a new salon branch location for multi-location operations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-2">
          {error && (
            <p className="text-xs text-[#8C3930] bg-[#F7E7E3] border border-[#F7E7E3] p-2 rounded-md">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="branch-name" className="text-xs text-[#302A24]">
              Branch Name <span className="text-[#8C3930]">*</span>
            </Label>
            <Input
              id="branch-name"
              placeholder="e.g. Satara City Studio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch-addr" className="text-xs text-[#302A24]">
              Full Address
            </Label>
            <Input
              id="branch-addr"
              placeholder="e.g. Near Bus Stand, Satara Road..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="branch-city" className="text-xs text-[#302A24]">
                City / Town
              </Label>
              <Input
                id="branch-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="branch-phone" className="text-xs text-[#302A24]">
                Contact Phone
              </Label>
              <Input
                id="branch-phone"
                placeholder="+91 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="branch-chairs" className="text-xs text-[#302A24]">
                Total Chairs
              </Label>
              <Input
                id="branch-chairs"
                type="number"
                min={1}
                value={totalChairs}
                onChange={(e) => setTotalChairs(Number(e.target.value))}
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="branch-open" className="text-xs text-[#302A24]">
                Opens At
              </Label>
              <Input
                id="branch-open"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="branch-close" className="text-xs text-[#302A24]">
                Closes At
              </Label>
              <Input
                id="branch-close"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-xs h-9 rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="text-xs h-9 rounded-md bg-[#A27C48] hover:bg-[#876438] text-white font-medium gap-1.5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Creating..." : "Create Branch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
