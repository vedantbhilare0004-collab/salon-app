"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useData } from "@/lib/store";
import {
  BranchId,
  Offer,
  OfferPreset,
  OfferCategory,
  Service,
} from "@/lib/types";
import { useRouter } from "next/navigation";
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
import { OfferCard } from "@/components/public/offers/offer-card";
import {
  Sparkles,
  Layout,
  Tag,
  DollarSign,
  Calendar,
  Layers,
  Check,
  Eye,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Plus,
  X,
  Maximize2,
} from "lucide-react";

const CATEGORIES: OfferCategory[] = [
  "Haircuts & Grooming",
  "Hair Spa & Treatments",
  "Facial & Skin Care",
  "Hair Colour",
  "Packages",
  "Festive & Seasonal",
];

const PRESETS: { id: OfferPreset; label: string; desc: string }[] = [
  { id: "editorial", label: "Editorial Offer", desc: "Refined typography, compact artwork, balanced" },
  { id: "festive", label: "Festive Feature", desc: "Celebratory motif, champagne accents, gold borders" },
  { id: "package", label: "Premium Package", desc: "Grouped service inclusions, prominent package header" },
  { id: "minimal", label: "Minimal Offer", desc: "Compact everyday layout with strong price focus" },
  { id: "seasonal", label: "Seasonal Collection", desc: "Consistent styling for campaign collections" },
];

const GALLERY_IMAGES = [
  { label: "Haircuts & Grooming", url: "/images/haircut-grooming.webp" },
  { label: "Hair Spa Experience", url: "/images/hair-spa.webp" },
  { label: "Facial & Skin Care", url: "/images/facial-skincare.webp" },
  { label: "Hair Styling & Colour", url: "/images/hair-colour.webp" },
  { label: "Manicure & Nail Care", url: "/images/manicure-nailcare.webp" },
  { label: "Men's Luxury Grooming", url: "/images/mens-grooming.webp" },
  { label: "Salon Interior Hero", url: "/images/new_Hero.png" },
];

export function OfferDialog({
  open,
  offer,
  onClose,
}: {
  open: boolean;
  offer: Offer | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { addOffer, updateOffer, services: catalogueServices, campaigns } = useData();

  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "design" | "placement">("general");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<OfferCategory>("Packages");
  const [campaignId, setCampaignId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [code, setCode] = useState("");

  const [price, setPrice] = useState<string>("");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [customInclusion, setCustomInclusion] = useState("");
  const [customInclusions, setCustomInclusions] = useState<string[]>([]);
  const [customGift, setCustomGift] = useState("");
  const [complimentaryServices, setComplimentaryServices] = useState<string[]>([]);

  const [preset, setPreset] = useState<OfferPreset>("editorial");
  const [imageUrl, setImageUrl] = useState("");

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [active, setActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [showOnHome, setShowOnHome] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  const [terms, setTerms] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [bookingRestrictions, setBookingRestrictions] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (offer) {
      setTitle(offer.title);
      setCategory(offer.category || "Packages");
      setCampaignId(offer.campaignId || "");
      setDescription(offer.description || "");
      setFullDescription(offer.fullDescription || "");
      setBadge(offer.badge || "");
      setCode(offer.code || "");

      setPrice(offer.price !== undefined ? String(offer.price) : "");
      setOriginalPrice(offer.originalPrice !== undefined ? String(offer.originalPrice) : "");
      setSelectedServiceIds(offer.serviceIds || []);
      setCustomInclusions(offer.includedServices || offer.features || []);
      setComplimentaryServices(offer.complimentaryServices || []);

      setPreset(offer.preset || "editorial");
      setImageUrl(offer.imageUrl || "");

      setStartsAt(offer.startsAt || "");
      setEndsAt(offer.endsAt || "");
      setActive(offer.active !== false);
      setIsFeatured(!!offer.isFeatured);
      setShowOnHome(!!offer.showOnHome);
      setDisplayOrder(offer.displayOrder || 1);

      setTerms(Array.isArray(offer.terms) ? offer.terms.join("\n") : (offer.terms || ""));
      setEligibility(offer.eligibility || "");
      setBookingRestrictions(offer.bookingRestrictions || "");
      setCancellationPolicy(offer.cancellationPolicy || "");
    } else {
      setTitle("");
      setCategory("Packages");
      setCampaignId("");
      setDescription("");
      setFullDescription("");
      setBadge("SPECIAL OFFER");
      setCode("");

      setPrice("");
      setOriginalPrice("");
      setSelectedServiceIds([]);
      setCustomInclusions([]);
      setComplimentaryServices([]);

      setPreset("editorial");
      setImageUrl(GALLERY_IMAGES[0].url);

      setStartsAt(new Date().toISOString().slice(0, 10));
      setEndsAt(addDaysISO(30));
      setActive(true);
      setIsFeatured(false);
      setShowOnHome(true);
      setDisplayOrder(1);

      setTerms("Advance appointment required. Cannot be combined with other discounts.");
      setEligibility("Open to all salon clients.");
      setBookingRestrictions("Subject to specialist availability at Koregaon branch.");
      setCancellationPolicy("Free rescheduling up to 4 hours in advance.");
    }
    setActiveTab("general");
    setError("");
  }, [offer, open]);

  // Handle adding custom inclusions
  const handleAddInclusion = () => {
    if (customInclusion.trim()) {
      setCustomInclusions((prev) => [...prev, customInclusion.trim()]);
      setCustomInclusion("");
    }
  };

  const handleRemoveInclusion = (idx: number) => {
    setCustomInclusions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle adding complimentary services
  const handleAddGift = () => {
    if (customGift.trim()) {
      setComplimentaryServices((prev) => [...prev, customGift.trim()]);
      setCustomGift("");
    }
  };

  const handleRemoveGift = (idx: number) => {
    setComplimentaryServices((prev) => prev.filter((_, i) => i !== idx));
  };

  // Live Offer Object for Designer Preview
  const previewOffer: Offer = useMemo(() => {
    const matchedCampaign = campaigns.find((c) => c.id === campaignId);
    const parsedPrice = price ? parseFloat(price) : undefined;
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : undefined;

    // Combine catalog services names + custom inclusions
    const resolvedInclusions = [
      ...selectedServiceIds
        .map((sId) => catalogueServices.find((s) => s.id === sId)?.name)
        .filter((n): n is string => !!n),
      ...customInclusions,
    ];

    return {
      id: offer?.id || "preview-id",
      branchId: "koregaon",
      title: title || "Exclusive Salon Offer Title",
      category,
      campaignId: campaignId || undefined,
      campaignName: matchedCampaign?.name,
      description: description || "Experience salon excellence at our special promotional package rate.",
      fullDescription,
      badge: badge || "SPECIAL OFFER",
      code: code || undefined,
      preset,
      imageUrl: imageUrl || undefined,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      serviceIds: selectedServiceIds,
      includedServices: resolvedInclusions.length > 0 ? resolvedInclusions : ["Hair Consultation & Styling"],
      complimentaryServices,
      startsAt,
      endsAt,
      active,
      isFeatured,
      showOnHome,
      displayOrder,
      terms,
      eligibility,
      bookingRestrictions,
      cancellationPolicy,
    };
  }, [
    offer,
    title,
    category,
    campaignId,
    campaigns,
    description,
    fullDescription,
    badge,
    code,
    preset,
    imageUrl,
    price,
    originalPrice,
    selectedServiceIds,
    catalogueServices,
    customInclusions,
    complimentaryServices,
    startsAt,
    endsAt,
    active,
    isFeatured,
    showOnHome,
    displayOrder,
    terms,
    eligibility,
    bookingRestrictions,
    cancellationPolicy,
  ]);

  function handleSave() {
    setError("");
    if (!title.trim()) {
      setError("Please provide an offer title.");
      setActiveTab("general");
      return;
    }

    const parsedPrice = price ? parseFloat(price) : undefined;
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : undefined;

    if (parsedPrice !== undefined && parsedPrice < 0) {
      setError("Price cannot be negative.");
      setActiveTab("pricing");
      return;
    }

    if (
      parsedPrice !== undefined &&
      parsedOriginalPrice !== undefined &&
      parsedOriginalPrice < parsedPrice
    ) {
      setError("Original price must be greater than or equal to the promotional price.");
      setActiveTab("pricing");
      return;
    }

    const matchedCampaign = campaigns.find((c) => c.id === campaignId);

    const payload: Omit<Offer, "id"> = {
      branchId: "koregaon",
      title: title.trim(),
      category,
      campaignId: campaignId || undefined,
      campaignName: matchedCampaign?.name,
      description: description.trim(),
      fullDescription: fullDescription.trim() || undefined,
      badge: badge.trim() || "SPECIAL OFFER",
      code: code.trim() || undefined,
      preset,
      imageUrl: imageUrl.trim() || undefined,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      serviceIds: selectedServiceIds,
      includedServices: [
        ...selectedServiceIds
          .map((sId) => catalogueServices.find((s) => s.id === sId)?.name)
          .filter((n): n is string => !!n),
        ...customInclusions,
      ],
      complimentaryServices: complimentaryServices.length > 0 ? complimentaryServices : undefined,
      startsAt: startsAt || new Date().toISOString().slice(0, 10),
      endsAt: endsAt || addDaysISO(30),
      active,
      isFeatured,
      showOnHome,
      displayOrder: Number(displayOrder) || 1,
      terms: terms.trim() || undefined,
      eligibility: eligibility.trim() || undefined,
      bookingRestrictions: bookingRestrictions.trim() || undefined,
      cancellationPolicy: cancellationPolicy.trim() || undefined,
    };

    if (offer) {
      updateOffer(offer.id, payload);
      toast.success("Offer updated successfully");
    } else {
      addOffer(payload);
      toast.success("Offer created successfully");
    }

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-sm border border-[#E9E1D6] bg-[#FAF8F5] text-[#222220] max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#E8E2D8] bg-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#8E6D38] text-[11px] uppercase font-bold tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Offer Designer &amp; Package Suite</span>
            </div>
            <DialogTitle className="font-heading text-xl sm:text-2xl text-[#222220] mt-0.5">
              {offer ? "Edit Salon Offer" : "Design New Offer"}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold border-[#8E6D38] text-[#8E6D38] hover:bg-[#FAF5EE] gap-1.5 cursor-pointer"
              onClick={() => {
                onClose();
                router.push(offer ? `/owner/offers/studio?id=${offer.id}` : "/owner/offers/studio?new=true");
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Full Screen Studio</span>
            </Button>

            <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xs border border-[#E8E2D8]">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                previewDevice === "desktop" ? "bg-white shadow-xs text-[#222220]" : "text-[#74695E]"
              }`}
              title="Desktop preview"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                previewDevice === "mobile" ? "bg-white shadow-xs text-[#222220]" : "text-[#74695E]"
              }`}
              title="Mobile preview"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8E2D8] bg-[#F5EFEB] px-6 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "general"
                ? "border-[#8E6D38] text-[#8E6D38] bg-white font-bold"
                : "border-transparent text-[#74695E] hover:text-[#222220]"
            }`}
          >
            1. Title &amp; Story
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "pricing"
                ? "border-[#8E6D38] text-[#8E6D38] bg-white font-bold"
                : "border-transparent text-[#74695E] hover:text-[#222220]"
            }`}
          >
            2. Inclusions &amp; Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("design")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "design"
                ? "border-[#8E6D38] text-[#8E6D38] bg-white font-bold"
                : "border-transparent text-[#74695E] hover:text-[#222220]"
            }`}
          >
            3. Card Preset &amp; Artwork
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("placement")}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "placement"
                ? "border-[#8E6D38] text-[#8E6D38] bg-white font-bold"
                : "border-transparent text-[#74695E] hover:text-[#222220]"
            }`}
          >
            4. Visibility &amp; Policies
          </button>
        </div>

        {/* Split Body: Form Left, Live Preview Right */}
        <div className="flex-1 overflow-y-auto grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E2D8]">
          {/* Form Side */}
          <div className="lg:col-span-7 p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
                {error}
              </div>
            )}

            {/* TAB 1: GENERAL */}
            {activeTab === "general" && (
              <div className="space-y-4 text-xs animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label htmlFor="o-title" className="text-xs font-semibold text-[#222220]">
                    Offer Title *
                  </Label>
                  <Input
                    id="o-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Navratri Glow Facial & Hair Spa Package"
                    className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#222220]">Category</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as OfferCategory)}
                      className="w-full h-9 text-xs rounded-xs border border-[#E8E2D8] bg-white px-3 text-[#222220]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#222220]">Associate Campaign</Label>
                    <select
                      value={campaignId}
                      onChange={(e) => setCampaignId(e.target.value)}
                      className="w-full h-9 text-xs rounded-xs border border-[#E8E2D8] bg-white px-3 text-[#222220]"
                    >
                      <option value="">No Campaign (Regular Offer)</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="o-badge" className="text-xs font-semibold text-[#222220]">
                      Badge (Label on card)
                    </Label>
                    <Input
                      id="o-badge"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. SPECIAL OFFER, 25% OFF"
                      className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="o-code" className="text-xs font-semibold text-[#222220]">
                      Offer Promo Code (Optional)
                    </Label>
                    <Input
                      id="o-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. GLOW25"
                      className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="o-desc" className="text-xs font-semibold text-[#222220]">
                    Short Card Summary
                  </Label>
                  <Textarea
                    id="o-desc"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary displayed on offer cards and list view"
                    className="text-xs rounded-xs border-[#E8E2D8] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="o-fulldesc" className="text-xs font-semibold text-[#222220]">
                    Full Description (Shown on Details Page)
                  </Label>
                  <Textarea
                    id="o-fulldesc"
                    rows={3}
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Detailed explanation of the treatment experience, benefits, and steps"
                    className="text-xs rounded-xs border-[#E8E2D8] bg-white"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: PRICING & INCLUSIONS */}
            {activeTab === "pricing" && (
              <div className="space-y-4 text-xs animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-white border border-[#E8E2D8] rounded-xs">
                  <div className="space-y-1.5">
                    <Label htmlFor="o-price" className="text-xs font-bold text-[#222220]">
                      Promotional Price (₹) *
                    </Label>
                    <Input
                      id="o-price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 1499"
                      className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-[#FAF8F5] font-semibold"
                    />
                    <span className="text-[10px] text-[#74695E]">Final rate payable at salon</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="o-origprice" className="text-xs font-bold text-[#222220]">
                      Original Reference Price (₹)
                    </Label>
                    <Input
                      id="o-origprice"
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="e.g. 2100"
                      className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-[#FAF8F5]"
                    />
                    <span className="text-[10px] text-[#74695E]">Displayed with strikethrough</span>
                  </div>
                </div>

                {/* Service Selection from Catalogue */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#222220] flex items-center justify-between">
                    <span>Select Included Services from Salon Catalogue</span>
                    <span className="text-[10px] text-[#74695E]">
                      {selectedServiceIds.length} selected
                    </span>
                  </Label>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2.5 bg-white border border-[#E8E2D8] rounded-xs">
                    {catalogueServices.map((svc) => {
                      const isChecked = selectedServiceIds.includes(svc.id);
                      return (
                        <label
                          key={svc.id}
                          className={`flex items-center justify-between p-2 rounded-xs border transition-colors cursor-pointer ${
                            isChecked
                              ? "bg-[#FAF5EE] border-[#D8C7B0]"
                              : "bg-[#FAF8F5] border-[#F2ECE4] hover:border-[#E8E2D8]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedServiceIds((prev) => [...prev, svc.id]);
                                } else {
                                  setSelectedServiceIds((prev) => prev.filter((id) => id !== svc.id));
                                }
                              }}
                              className="accent-[#8E6D38] h-3.5 w-3.5"
                            />
                            <span className="text-xs font-medium text-[#222220]">{svc.name}</span>
                          </div>
                          <span className="text-[11px] text-[#74695E]">
                            ₹{svc.price} · {svc.durationMin || 30}m
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Additional / Custom Inclusions */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#222220]">
                    Additional Package Inclusions
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={customInclusion}
                      onChange={(e) => setCustomInclusion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInclusion();
                        }
                      }}
                      placeholder="e.g. Deep Conditioning Steam, Head Massage"
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddInclusion}
                      className="h-8 text-xs bg-[#222220] text-white rounded-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>

                  {customInclusions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {customInclusions.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#FAF5EE] border border-[#E8DFC8] text-[#8E6D38] text-[11px] font-medium"
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInclusion(idx)}
                            className="text-[#8E6D38] hover:text-red-700 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Complimentary Services Gift */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
                  <Label className="text-xs font-semibold text-[#8E6D38] flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-[#A27C48]" />
                    <span>Complimentary Salon Add-ons (Free Gifts)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={customGift}
                      onChange={(e) => setCustomGift(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddGift();
                        }
                      }}
                      placeholder="e.g. Free Moroccan Argan Serum Application"
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddGift}
                      className="h-8 text-xs bg-[#8E6D38] hover:bg-[#785C2F] text-white rounded-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Gift
                    </Button>
                  </div>

                  {complimentaryServices.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {complimentaryServices.map((gift, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium"
                        >
                          <span>{gift}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveGift(idx)}
                            className="text-emerald-800 hover:text-red-700 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DESIGN PRESET & ARTWORK */}
            {activeTab === "design" && (
              <div className="space-y-4 text-xs animate-in fade-in duration-200">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#222220]">
                    Select Visual Card Preset
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESETS.map((p) => {
                      const isSelected = preset === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPreset(p.id)}
                          className={`p-3 rounded-xs border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "bg-white border-[#8E6D38] ring-2 ring-[#8E6D38]/20 shadow-xs"
                              : "bg-[#FAF8F5] border-[#E8E2D8] hover:bg-white"
                          }`}
                        >
                          <div className="font-semibold text-xs text-[#222220] flex items-center justify-between">
                            <span>{p.label}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-[#8E6D38]" />}
                          </div>
                          <p className="text-[11px] text-[#74695E] mt-0.5 leading-tight">{p.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Approved Artwork Gallery */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
                  <Label className="text-xs font-semibold text-[#222220] flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-[#8E6D38]" />
                    <span>Choose Promotional Artwork</span>
                  </Label>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {GALLERY_IMAGES.map((img) => {
                      const isSelected = imageUrl === img.url;
                      return (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => setImageUrl(img.url)}
                          className={`relative rounded-xs overflow-hidden border p-1 text-left cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#8E6D38] ring-2 ring-[#8E6D38]/30 shadow-xs"
                              : "border-[#E8E2D8] opacity-75 hover:opacity-100"
                          }`}
                        >
                          <div className="relative h-14 w-full rounded-xs overflow-hidden bg-[#FAF8F5]">
                            <Image src={img.url} alt={img.label} fill className="object-cover" />
                          </div>
                          <div className="mt-1 text-[10px] text-[#222220] truncate font-medium">
                            {img.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or enter custom artwork URL"
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white flex-1"
                    />
                    {imageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setImageUrl("")}
                        className="h-8 text-xs border-[#E8E2D8] text-[#74695E] rounded-xs"
                      >
                        Clear Image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VISIBILITY & POLICIES */}
            {activeTab === "placement" && (
              <div className="space-y-4 text-xs animate-in fade-in duration-200">
                {/* Switches */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xs bg-white border border-[#E8E2D8]">
                    <div>
                      <Label className="text-xs font-semibold text-[#222220] block">
                        Published &amp; Active
                      </Label>
                      <p className="text-[11px] text-[#74695E]">
                        Eligible for online customer viewing and booking
                      </p>
                    </div>
                    <Switch checked={active} onCheckedChange={setActive} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xs bg-white border border-[#E8E2D8]">
                    <div>
                      <Label className="text-xs font-semibold text-[#222220] block">
                        Featured on Offers Page
                      </Label>
                      <p className="text-[11px] text-[#74695E]">
                        Prominently positioned in the offers catalog
                      </p>
                    </div>
                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xs bg-white border border-[#E8E2D8]">
                    <div>
                      <Label className="text-xs font-semibold text-[#222220] block">
                        Show on Customer Home Page
                      </Label>
                      <p className="text-[11px] text-[#74695E]">
                        Showcase in Home special promotions section
                      </p>
                    </div>
                    <Switch checked={showOnHome} onCheckedChange={setShowOnHome} />
                  </div>
                </div>

                {/* Display Order & Dates */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="o-order" className="text-xs font-semibold text-[#222220]">
                      Display Priority (1 = first)
                    </Label>
                    <Input
                      id="o-order"
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                      className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="o-starts" className="text-xs font-semibold text-[#222220]">
                      Starts Date
                    </Label>
                    <Input
                      id="o-starts"
                      type="date"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="o-ends" className="text-xs font-semibold text-[#222220]">
                      Ends Date
                    </Label>
                    <Input
                      id="o-ends"
                      type="date"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>
                </div>

                {/* Policies */}
                <div className="space-y-3 pt-2 border-t border-[#E8E2D8]">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#222220]">
                      Eligibility &amp; Exclusions
                    </Label>
                    <Input
                      value={eligibility}
                      onChange={(e) => setEligibility(e.target.value)}
                      placeholder="e.g. Open to all clients. Cannot be stacked with salon vouchers."
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#222220]">
                      Booking Restrictions
                    </Label>
                    <Input
                      value={bookingRestrictions}
                      onChange={(e) => setBookingRestrictions(e.target.value)}
                      placeholder="e.g. Advance appointment required. Valid at Koregaon branch."
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#222220]">
                      Cancellation &amp; Rescheduling Policy
                    </Label>
                    <Input
                      value={cancellationPolicy}
                      onChange={(e) => setCancellationPolicy(e.target.value)}
                      placeholder="e.g. Free rescheduling up to 4 hours prior."
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#222220]">
                      Additional Terms &amp; Conditions
                    </Label>
                    <Textarea
                      rows={2}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      placeholder="Any additional fine print or notes"
                      className="text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Live Interactive Designer Preview */}
          <div className="lg:col-span-5 p-6 bg-[#F5EFEB]/50 flex flex-col items-center justify-start overflow-y-auto">
            <div className="w-full mb-3 flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#74695E] flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-[#8E6D38]" />
                <span>Live Card Preview ({preset})</span>
              </span>
              <span className="text-[10px] text-[#74695E]">
                {previewDevice === "desktop" ? "Desktop Grid" : "Mobile View"}
              </span>
            </div>

            <div
              className={`w-full transition-all duration-300 ${
                previewDevice === "mobile" ? "max-w-[320px]" : "max-w-md"
              }`}
            >
              <OfferCard offer={previewOffer} isOwnerPreview={true} />
            </div>

            <div className="mt-4 p-3 rounded-xs bg-white border border-[#E8E2D8] text-[11px] text-[#74695E] space-y-1 w-full max-w-md">
              <div className="font-semibold text-[#222220] flex items-center justify-between">
                <span>Placement Summary:</span>
                <span className={active ? "text-emerald-700" : "text-amber-700"}>
                  {active ? "Active & Bookable" : "Draft / Inactive"}
                </span>
              </div>
              <div>• Offers Page: {active ? "Visible" : "Hidden"}</div>
              <div>• Home Page: {showOnHome && active ? "Showcased" : "Not on Home"}</div>
              <div>• Preset Layout: {PRESETS.find((p) => p.id === preset)?.label}</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E8E2D8] bg-white flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xs border-[#D8C7B0] text-[#222220] text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="rounded-xs bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold cursor-pointer shadow-xs"
            >
              {offer ? "Save Offer Changes" : "Publish Offer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
