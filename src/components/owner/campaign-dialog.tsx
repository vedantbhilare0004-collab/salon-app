"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useData } from "@/lib/store";
import { Campaign } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { addDaysISO } from "@/lib/format";
import { toast } from "sonner";
import { Sparkles, Image as ImageIcon } from "lucide-react";

const APPROVED_CAMPAIGN_IMAGES = [
  { label: "Salon Interior Hero", url: "/images/new_Hero.png" },
  { label: "Hair Spa Experience", url: "/images/hair-spa.webp" },
  { label: "Facial & Skin Care", url: "/images/facial-skincare.webp" },
  { label: "Hair Styling & Colour", url: "/images/hair-colour.webp" },
  { label: "Grooming & Studio", url: "/images/haircut-grooming.webp" },
  { label: "Salon Story Suite", url: "/images/About-Us.png" },
];

export function CampaignDialog({
  open,
  campaign,
  onClose,
}: {
  open: boolean;
  campaign: Campaign | null;
  onClose: () => void;
}) {
  const { addCampaign, updateCampaign } = useData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [theme, setTheme] = useState<Campaign["theme"]>("festive-gold");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [active, setActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featureOnHome, setFeatureOnHome] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setDescription(campaign.description || "");
      setBannerUrl(campaign.bannerUrl || "");
      setTheme(campaign.theme || "festive-gold");
      setStartsAt(campaign.startsAt || "");
      setEndsAt(campaign.endsAt || "");
      setActive(campaign.active !== false);
      setIsFeatured(!!campaign.isFeatured);
      setFeatureOnHome(!!campaign.featureOnHome);
    } else {
      setName("");
      setDescription("");
      setBannerUrl(APPROVED_CAMPAIGN_IMAGES[0].url);
      setTheme("festive-gold");
      setStartsAt(new Date().toISOString().slice(0, 10));
      setEndsAt(addDaysISO(45));
      setActive(true);
      setIsFeatured(false);
      setFeatureOnHome(false);
    }
    setError("");
  }, [campaign, open]);

  function save() {
    setError("");
    if (!name.trim()) {
      setError("Campaign name is required.");
      return;
    }

    const payload: Omit<Campaign, "id"> = {
      name: name.trim(),
      description: description.trim(),
      bannerUrl: bannerUrl.trim() || undefined,
      theme,
      startsAt: startsAt || new Date().toISOString().slice(0, 10),
      endsAt: endsAt || addDaysISO(45),
      active,
      isFeatured,
      featureOnHome,
      branchId: "koregaon",
    };

    if (campaign) {
      updateCampaign(campaign.id, payload);
      toast.success("Campaign updated successfully");
    } else {
      addCampaign(payload);
      toast.success("Campaign created successfully");
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-sm border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#8E6D38] text-xs uppercase font-bold tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Salon Campaign Suite</span>
          </div>
          <DialogTitle className="font-heading text-xl text-[#222220]">
            {campaign ? "Edit Campaign" : "New Campaign"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#74695E]">
            Organize seasonal salon events like Navratri, Diwali, Wedding Season, or Summer Care.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Campaign Name */}
          <div className="space-y-1.5">
            <Label htmlFor="c-name" className="text-xs font-semibold text-[#222220]">
              Campaign Name *
            </Label>
            <Input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diwali Beauty Collection, Navratri Glow"
              className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white text-[#222220] focus-visible:ring-[#8E6D38]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="c-desc" className="text-xs font-semibold text-[#222220]">
              Campaign Story &amp; Description
            </Label>
            <Textarea
              id="c-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share the seasonal theme and highlights for this salon collection"
              className="text-xs rounded-xs border-[#E8E2D8] bg-white text-[#222220] focus-visible:ring-[#8E6D38]"
            />
          </div>

          {/* Banner Artwork Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#222220] flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-[#8E6D38]" />
              <span>Approved Campaign Artwork</span>
            </Label>

            <div className="grid grid-cols-3 gap-2">
              {APPROVED_CAMPAIGN_IMAGES.map((img) => {
                const isSelected = bannerUrl === img.url;
                return (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setBannerUrl(img.url)}
                    className={`relative rounded-xs overflow-hidden border text-left p-1 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#8E6D38] ring-2 ring-[#8E6D38]/30 shadow-xs"
                        : "border-[#E8E2D8] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div className="relative h-16 w-full rounded-xs overflow-hidden bg-[#FAF8F5]">
                      <Image src={img.url} alt={img.label} fill className="object-cover" />
                    </div>
                    <div className="mt-1 text-[10px] text-[#222220] truncate font-medium">
                      {img.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <Input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="Or paste custom image URL"
                className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-starts" className="text-xs font-semibold text-[#222220]">
                Starts Date
              </Label>
              <Input
                id="c-starts"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-ends" className="text-xs font-semibold text-[#222220]">
                Ends Date
              </Label>
              <Input
                id="c-ends"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white"
              />
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
            <div className="flex items-center justify-between p-2.5 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8]">
              <div>
                <Label className="text-xs font-semibold text-[#222220] block">
                  Active Campaign Status
                </Label>
                <p className="text-[11px] text-[#74695E]">Visible to clients on website</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8]">
              <div>
                <Label className="text-xs font-semibold text-[#222220] block">
                  Featured on Offers Page
                </Label>
                <p className="text-[11px] text-[#74695E]">Shows prominent banner in Offers hero</p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8]">
              <div>
                <Label className="text-xs font-semibold text-[#222220] block">
                  Promote on Customer Home Page
                </Label>
                <p className="text-[11px] text-[#74695E]">Feature banner in Home promotional section</p>
              </div>
              <Switch checked={featureOnHome} onCheckedChange={setFeatureOnHome} />
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <DialogFooter className="pt-2 border-t border-[#E8E2D8]">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xs border-[#D8C7B0] text-[#222220] text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={save}
            className="rounded-xs bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold cursor-pointer"
          >
            {campaign ? "Update Campaign" : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
