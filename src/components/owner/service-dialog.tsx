"use client";

import { useEffect, useState } from "react";
import { useData } from "@/lib/store";
import { type BranchId, type Service } from "@/lib/types";
import { CATALOGUE_CATEGORIES } from "@/lib/catalogue-data";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function ServiceDialog({
  open,
  service,
  defaultBranch,
  onClose,
}: {
  open: boolean;
  service: Service | null;
  defaultBranch: BranchId;
  onClose: () => void;
}) {
  const { addService, updateService, services } = useData();
  const [branchId, setBranchId] = useState<BranchId>(defaultBranch);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [variant, setVariant] = useState<"" | "Male" | "Female">("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");

  const existingCategories = Array.from(
    new Set([...CATALOGUE_CATEGORIES, ...services.filter(s => !s.archived).map((s) => s.category)])
  );

  useEffect(() => {
    if (service) {
      setBranchId(service.branchId);
      setCategory(service.category);
      setName(service.name);
      setPrice(String(service.price));
      setDuration(String(service.durationMin || service.durationMinutes || 30));
      setVariant((service.variant as "" | "Male" | "Female") || (service.gender === "male" ? "Male" : service.gender === "female" ? "Female" : ""));
      setActive(service.active);
    } else {
      setBranchId(defaultBranch);
      setCategory(CATALOGUE_CATEGORIES[0]);
      setName("");
      setPrice("");
      setDuration("30");
      setVariant("");
      setActive(true);
    }
    setError("");
  }, [service, defaultBranch, open]);

  function save() {
    setError("");
    if (!name.trim() || !category.trim()) {
      setError("Name and category are required.");
      return;
    }
    const priceNum = Number(price);
    const durNum = Number(duration);
    if (!priceNum || priceNum <= 0) {
      setError("Enter a valid price in INR.");
      return;
    }
    if (!durNum || durNum <= 0) {
      setError("Enter a valid duration in minutes.");
      return;
    }

    const genderVal =
      variant === "Male" ? "male" : variant === "Female" ? "female" : "unisex";

    const payload: Partial<Service> = {
      branchId,
      category: category.trim(),
      name: name.trim(),
      price: priceNum,
      durationMin: durNum,
      durationMinutes: durNum,
      gender: genderVal,
      variant: variant || undefined,
      active,
      isActive: active,
      archived: false,
    };

    if (service) {
      updateService(service.id, payload);
      toast.success("Service updated");
    } else {
      addService(payload as Omit<Service, "id">);
      toast.success("Service added to catalogue");
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#302A24]">
            {service ? "Edit Service" : "Add Service"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#74695E]">
            Configure treatment details, category, pricing, and gender variants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="cat" className="text-xs font-medium text-[#302A24]">
              Category
            </Label>
            <Input
              id="cat"
              list="category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Female Haircut, Wax, Hair Spa..."
              className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
            <datalist id="category-list">
              {existingCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-[#302A24]">
              Service Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Loreal (Amp)"
              className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#302A24]">
              Variant / Gender
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={variant === "" ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs flex-1 rounded-md ${
                  variant === ""
                    ? "bg-[#302A24] text-white"
                    : "border-[#E9E1D6] text-[#74695E]"
                }`}
                onClick={() => setVariant("")}
              >
                Standard / Unisex
              </Button>
              <Button
                type="button"
                variant={variant === "Male" ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs flex-1 rounded-md ${
                  variant === "Male"
                    ? "bg-[#2563EB] text-white"
                    : "border-[#E9E1D6] text-[#74695E]"
                }`}
                onClick={() => setVariant("Male")}
              >
                Male
              </Button>
              <Button
                type="button"
                variant={variant === "Female" ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs flex-1 rounded-md ${
                  variant === "Female"
                    ? "bg-[#DB2777] text-white"
                    : "border-[#E9E1D6] text-[#74695E]"
                }`}
                onClick={() => setVariant("Female")}
              >
                Female
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-medium text-[#302A24]">
                Price (₹ INR)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="250"
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dur" className="text-xs font-medium text-[#302A24]">
                Duration (min)
              </Label>
              <Input
                id="dur"
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="h-9 text-xs rounded-md border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-[#E9E1D6] bg-[#F6F3ED]/40 p-3">
            <div>
              <Label className="font-medium text-xs text-[#302A24]">Active Catalogue Status</Label>
              <p className="text-[11px] text-[#74695E]">Visible for online bookings and live queue</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          {error && <p className="text-xs text-[#8C3930]">{error}</p>}
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={save}
            className="rounded-md bg-[#A27C48] hover:bg-[#876438] text-white font-medium text-xs transition-colors"
          >
            {service ? "Save Changes" : "Add Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
