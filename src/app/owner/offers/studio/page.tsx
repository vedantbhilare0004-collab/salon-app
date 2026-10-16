"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useData } from "@/lib/store";
import {
  Offer,
  OfferPreset,
  OfferCategory,
  OfferDesignSettings,
  Service,
} from "@/lib/types";
import { formatPrice, formatDate, addDaysISO } from "@/lib/format";
import { OfferCard } from "@/components/public/offers/offer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowLeft,
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
  Save,
  Check,
  Eye,
  SlidersHorizontal,
  Layers,
  Type,
  Palette,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Maximize2,
  Plus,
  X,
  Scissors,
  Crown,
  Heart,
  Gift,
  Flame,
  Star,
  Sun,
  Gem,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Upload,
  Calendar,
  FileText,
} from "lucide-react";

const CATEGORIES: OfferCategory[] = [
  "Packages",
  "Facial & Skin Care",
  "Hair Spa & Treatments",
  "Haircuts & Grooming",
  "Hair Colour",
  "Festive & Seasonal",
];

const PRESET_OPTIONS: { id: OfferPreset; label: string; desc: string }[] = [
  { id: "editorial", label: "Editorial", desc: "Typography-led, minimal decoration, elegant" },
  { id: "festive", label: "Festive Feature", desc: "Gold accents, celebratory badge, champagne border" },
  { id: "package", label: "Premium Package", desc: "Prominent header, multi-treatment inclusions" },
  { id: "minimal", label: "Minimal", desc: "Compact everyday discount, strong price focus" },
  { id: "seasonal", label: "Seasonal Collection", desc: "Shared collection visual identity" },
];

const BRAND_PALETTE = [
  { name: "Warm Ivory", hex: "#FAF8F5" },
  { name: "Soft Cream", hex: "#FFFDF9" },
  { name: "Festive Ivory", hex: "#FAF6F0" },
  { name: "Sand", hex: "#F5EFEB" },
  { name: "Charcoal Black", hex: "#222220" },
  { name: "Warm Bronze", hex: "#8E6D38" },
  { name: "Champagne Gold", hex: "#C6A166" },
  { name: "Muted Grey", hex: "#706B65" },
];

const APPROVED_GALLERY = [
  { label: "Hair Spa Experience", url: "/images/hair-spa.webp" },
  { label: "Facial & Skin Care", url: "/images/facial-skincare.webp" },
  { label: "Haircuts & Styling", url: "/images/haircut-grooming.webp" },
  { label: "Hair Colour & Balayage", url: "/images/hair-colour.webp" },
  { label: "Manicure & Nail Care", url: "/images/manicure-nailcare.webp" },
  { label: "Men's Luxury Grooming", url: "/images/mens-grooming.webp" },
  { label: "Salon Interior Hero", url: "/images/new_Hero.png" },
  { label: "Salon Heritage Suite", url: "/images/About-Us.png" },
];

const ICON_CHOICES = [
  { id: "Sparkles", label: "Sparkles", icon: Sparkles },
  { id: "Scissors", label: "Scissors", icon: Scissors },
  { id: "Tag", label: "Tag", icon: Tag },
  { id: "Crown", label: "Crown", icon: Crown },
  { id: "Heart", label: "Heart", icon: Heart },
  { id: "Gift", label: "Gift", icon: Gift },
  { id: "Flame", label: "Flame", icon: Flame },
  { id: "Star", label: "Star", icon: Star },
  { id: "Sun", label: "Sun", icon: Sun },
  { id: "Gem", label: "Gem", icon: Gem },
  { id: "ShieldCheck", label: "Verified", icon: ShieldCheck },
];

export default function OfferStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("id");
  const isNew = searchParams.get("new") === "true";

  const {
    currentUser,
    offers,
    campaigns,
    services: catalogueServices,
    addOffer,
    updateOffer,
  } = useData();

  // Active control section
  const [activeSection, setActiveSection] = useState<
    "content" | "layout" | "typography" | "colors" | "artwork" | "icons" | "pricing" | "spacing" | "visibility"
  >("content");

  // Studio Preview Settings
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewMode, setPreviewMode] = useState<"card" | "detail">("card");
  const [mobileTab, setMobileTab] = useState<"controls" | "preview">("controls");

  // History Stack for Undo/Redo
  const [history, setHistory] = useState<Offer[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isDirty, setIsDirty] = useState(false);
  const isInternalHistoryStep = useRef(false);

  // Offer State
  const [currentOffer, setCurrentOffer] = useState<Offer>({
    id: offerId || `draft-${Date.now()}`,
    branchId: "koregaon",
    title: "New Festive Salon Offer",
    category: "Packages",
    description: "Experience premium salon pampering at our exclusive promotional package rate.",
    fullDescription: "Enjoy our signature salon ritual prepared by expert stylists in Koregaon.",
    badge: "SPECIAL OFFER",
    code: "",
    preset: "editorial",
    price: 1499,
    originalPrice: 2200,
    includedServices: ["Hair Consultation & Style", "Nourishing Hair Spa Ritual"],
    complimentaryServices: ["Complimentary Head Massage Included"],
    serviceIds: [],
    imageUrl: "/images/hair-spa.webp",
    startsAt: new Date().toISOString().slice(0, 10),
    endsAt: addDaysISO(30),
    active: true,
    isFeatured: false,
    showOnHome: true,
    displayOrder: 1,
    terms: "Valid at Koregaon branch. Advance booking recommended.",
    eligibility: "Open to all clients.",
    bookingRestrictions: "Valid at Koregaon branch.",
    cancellationPolicy: "Free rescheduling up to 4 hours in advance.",
    design: {
      headingFont: "Cormorant Garamond",
      bodyFont: "Plus Jakarta Sans",
      headingSize: "lg",
      priceSize: "xl",
      textAlign: "left",
      cardBg: "#FAF8F5",
      headingColor: "#222220",
      bodyColor: "#5C5B56",
      priceColor: "#8E6D38",
      borderColor: "#E8DFC8",
      borderWidth: "1px",
      borderRadius: "sm",
      shadow: "sm",
    },
  });

  // Additional custom inputs
  const [customInclusion, setCustomInclusion] = useState("");
  const [customGift, setCustomGift] = useState("");

  // Load existing offer if editing
  useEffect(() => {
    if (offerId && offers.length > 0) {
      const existing = offers.find((o) => o.id === offerId);
      if (existing) {
        const loaded: Offer = {
          ...existing,
          design: existing.design || {
            headingFont: "Cormorant Garamond",
            cardBg: "#FAF8F5",
            headingColor: "#222220",
            priceColor: "#8E6D38",
            borderColor: "#E8DFC8",
            borderWidth: "1px",
            borderRadius: "sm",
            shadow: "sm",
          },
        };
        setCurrentOffer(loaded);
        setHistory([loaded]);
        setHistoryIdx(0);
        setIsDirty(false);
      }
    } else if (isNew) {
      setHistory([currentOffer]);
      setHistoryIdx(0);
      setIsDirty(false);
    }
  }, [offerId, isNew, offers.length]);

  // Update offer and push to history
  const updateOfferState = (updater: (prev: Offer) => Offer) => {
    setCurrentOffer((prev) => {
      const next = updater(prev);
      if (!isInternalHistoryStep.current) {
        setHistory((h) => [...h.slice(0, historyIdx + 1), next]);
        setHistoryIdx((i) => i + 1);
        setIsDirty(true);
      }
      return next;
    });
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIdx > 0) {
      isInternalHistoryStep.current = true;
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      setCurrentOffer(history[prevIdx]);
      setIsDirty(true);
      setTimeout(() => {
        isInternalHistoryStep.current = false;
      }, 50);
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      isInternalHistoryStep.current = true;
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setCurrentOffer(history[nextIdx]);
      setIsDirty(true);
      setTimeout(() => {
        isInternalHistoryStep.current = false;
      }, 50);
    }
  };

  // Helper for updating nested design properties
  const updateDesign = (key: keyof OfferDesignSettings, value: any) => {
    updateOfferState((prev) => ({
      ...prev,
      design: {
        ...(prev.design || {}),
        [key]: value,
      },
    }));
  };

  // Apply layout preset defaults
  const applyPresetDefaults = (preset: OfferPreset) => {
    const defaultsMap: Record<OfferPreset, Partial<OfferDesignSettings>> = {
      editorial: {
        headingFont: "Cormorant Garamond",
        cardBg: "#FFFFFF",
        headingColor: "#222220",
        priceColor: "#222220",
        borderColor: "#E8E2D8",
        borderWidth: "1px",
        borderRadius: "sm",
        shadow: "sm",
        padding: "normal",
      },
      festive: {
        headingFont: "Cormorant Garamond",
        cardBg: "#FAF6F0",
        headingColor: "#222220",
        priceColor: "#8E6D38",
        borderColor: "#D8C7B0",
        borderWidth: "2px",
        borderRadius: "sm",
        shadow: "gold",
        padding: "normal",
      },
      package: {
        headingFont: "Cormorant Garamond",
        cardBg: "#FAF8F5",
        headingColor: "#222220",
        priceColor: "#8E6D38",
        borderColor: "#E8DFC8",
        borderWidth: "1px",
        borderRadius: "sm",
        shadow: "sm",
        padding: "normal",
      },
      minimal: {
        headingFont: "Plus Jakarta Sans",
        cardBg: "#FFFFFF",
        headingColor: "#222220",
        priceColor: "#222220",
        borderColor: "#E8E2D8",
        borderWidth: "1px",
        borderRadius: "sm",
        shadow: "sm",
        padding: "compact",
      },
      seasonal: {
        headingFont: "Cormorant Garamond",
        cardBg: "#FFFFFF",
        headingColor: "#222220",
        priceColor: "#8E6D38",
        borderColor: "#E8E2D8",
        borderWidth: "1px",
        borderRadius: "sm",
        shadow: "sm",
        padding: "normal",
      },
    };

    updateOfferState((prev) => ({
      ...prev,
      preset,
      design: {
        ...(prev.design || {}),
        ...(defaultsMap[preset] || {}),
      },
    }));
    toast.success(`Applied ${preset.toUpperCase()} visual preset`);
  };

  // Inclusions handling
  const handleAddInclusion = () => {
    if (customInclusion.trim()) {
      updateOfferState((prev) => ({
        ...prev,
        includedServices: [...(prev.includedServices || []), customInclusion.trim()],
      }));
      setCustomInclusion("");
    }
  };

  const handleRemoveInclusion = (idx: number) => {
    updateOfferState((prev) => ({
      ...prev,
      includedServices: (prev.includedServices || []).filter((_, i) => i !== idx),
    }));
  };

  // Complimentary Gift handling
  const handleAddGift = () => {
    if (customGift.trim()) {
      updateOfferState((prev) => ({
        ...prev,
        complimentaryServices: [...(prev.complimentaryServices || []), customGift.trim()],
      }));
      setCustomGift("");
    }
  };

  const handleRemoveGift = (idx: number) => {
    updateOfferState((prev) => ({
      ...prev,
      complimentaryServices: (prev.complimentaryServices || []).filter((_, i) => i !== idx),
    }));
  };

  // Image Upload handler (Base64 file reader)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("Image file is too large (max 3MB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        updateOfferState((prev) => ({ ...prev, imageUrl: url }));
        toast.success("Artwork loaded into preview");
      };
      reader.readAsDataURL(file);
    }
  };

  // Save handler (Draft vs Publish)
  const handleSave = async (shouldPublish: boolean) => {
    if (!currentOffer.title.trim()) {
      toast.error("Offer title is required.");
      setActiveSection("content");
      return;
    }

    // Build payload without any `undefined` values — Firestore rejects them
    const payload: Record<string, unknown> = {
      branchId: "koregaon",
      title: currentOffer.title.trim(),
      category: currentOffer.category || "Packages",
      description: currentOffer.description.trim(),
      badge: currentOffer.badge?.trim() || "SPECIAL OFFER",
      preset: currentOffer.preset || "editorial",
      includedServices: currentOffer.includedServices || [],
      serviceIds: currentOffer.serviceIds || [],
      startsAt: currentOffer.startsAt || new Date().toISOString().slice(0, 10),
      endsAt: currentOffer.endsAt || addDaysISO(30),
      active: shouldPublish ? true : currentOffer.active,
      isFeatured: !!currentOffer.isFeatured,
      showOnHome: !!currentOffer.showOnHome,
      displayOrder: Number(currentOffer.displayOrder) || 1,
    };

    // Conditionally add optional fields only when they have real values
    if (currentOffer.campaignId) payload.campaignId = currentOffer.campaignId;
    const resolvedCampaignName =
      campaigns.find((c) => c.id === currentOffer.campaignId)?.name || currentOffer.campaignName;
    if (resolvedCampaignName) payload.campaignName = resolvedCampaignName;
    if (currentOffer.fullDescription?.trim()) payload.fullDescription = currentOffer.fullDescription.trim();
    if (currentOffer.code?.trim()) payload.code = currentOffer.code.trim();
    if (currentOffer.price != null) payload.price = currentOffer.price;
    if (currentOffer.originalPrice != null) payload.originalPrice = currentOffer.originalPrice;
    if (currentOffer.complimentaryServices && currentOffer.complimentaryServices.length > 0)
      payload.complimentaryServices = currentOffer.complimentaryServices;
    if (currentOffer.imageUrl) payload.imageUrl = currentOffer.imageUrl;
    if (currentOffer.terms) payload.terms = currentOffer.terms;
    if (currentOffer.eligibility) payload.eligibility = currentOffer.eligibility;
    if (currentOffer.bookingRestrictions) payload.bookingRestrictions = currentOffer.bookingRestrictions;
    if (currentOffer.cancellationPolicy) payload.cancellationPolicy = currentOffer.cancellationPolicy;
    if (currentOffer.design) payload.design = currentOffer.design;

    try {
      if (offerId && !isNew) {
        await updateOffer(offerId, payload as Partial<Offer>);
        toast.success(shouldPublish ? "Offer published successfully!" : "Draft changes saved.");
      } else {
        await addOffer(payload as Omit<Offer, "id">);
        toast.success(shouldPublish ? "New offer published!" : "Draft created.");
      }
      setIsDirty(false);
      router.push("/owner/offers");
    } catch (err: any) {
      toast.error(err.message || "Failed to save offer");
    }
  };

  const handleBack = () => {
    if (isDirty) {
      if (confirm("You have unsaved design changes. Leave without saving?")) {
        router.push("/owner/offers");
      }
    } else {
      router.push("/owner/offers");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] text-[#222220] flex flex-col font-sans antialiased overflow-hidden selection:bg-[#E8DFC8]">
      {/* =========================================================================
          REGION A: TOP STICKY STUDIO HEADER
      ========================================================================= */}
      <header className="h-14 sm:h-16 border-b border-[#E8E2D8] bg-white px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xs border border-[#E8E2D8] flex items-center justify-center text-[#5C5B56] hover:text-[#222220] hover:bg-[#FAF8F5] transition-colors cursor-pointer shrink-0"
            title="Exit Studio"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8E6D38] hidden sm:inline">
                Design Studio
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs ${
                  currentOffer.active
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {currentOffer.active ? "Published" : "Draft"}
              </span>
              {isDirty && (
                <span className="text-[11px] text-amber-700 font-medium hidden md:inline">
                  • Unsaved changes
                </span>
              )}
            </div>
            <h1 className="font-heading text-sm sm:text-base font-bold text-[#222220] truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {currentOffer.title || "Untitled Offer"}
            </h1>
          </div>
        </div>

        {/* Center: Undo/Redo & View Switchers */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Undo / Redo */}
          <div className="flex items-center rounded-xs border border-[#E8E2D8] bg-[#FAF8F5] p-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className="p-1.5 rounded-xs text-[#5C5B56] hover:text-[#222220] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Undo"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className="p-1.5 rounded-xs text-[#5C5B56] hover:text-[#222220] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Redo"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Desktop / Mobile Canvas Switcher */}
          <div className="flex items-center rounded-xs border border-[#E8E2D8] bg-[#FAF8F5] p-0.5">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                device === "desktop"
                  ? "bg-white text-[#222220] shadow-xs"
                  : "text-[#74695E] hover:text-[#222220]"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                device === "mobile"
                  ? "bg-white text-[#222220] shadow-xs"
                  : "text-[#74695E] hover:text-[#222220]"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {/* Card vs Detail View Toggle */}
          <div className="flex items-center rounded-xs border border-[#E8E2D8] bg-[#FAF8F5] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setPreviewMode("card")}
              className={`px-2.5 py-1 rounded-xs font-semibold cursor-pointer ${
                previewMode === "card"
                  ? "bg-white text-[#222220] shadow-xs"
                  : "text-[#74695E] hover:text-[#222220]"
              }`}
            >
              Catalog Card
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("detail")}
              className={`px-2.5 py-1 rounded-xs font-semibold cursor-pointer ${
                previewMode === "detail"
                  ? "bg-white text-[#222220] shadow-xs"
                  : "text-[#74695E] hover:text-[#222220]"
              }`}
            >
              Detail Page
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile view switch */}
          <div className="lg:hidden flex items-center rounded-xs border border-[#E8E2D8] bg-[#FAF8F5] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMobileTab("controls")}
              className={`px-2.5 py-1 rounded-xs font-semibold ${
                mobileTab === "controls" ? "bg-white text-[#222220]" : "text-[#74695E]"
              }`}
            >
              Controls
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`px-2.5 py-1 rounded-xs font-semibold ${
                mobileTab === "preview" ? "bg-white text-[#222220]" : "text-[#74695E]"
              }`}
            >
              Preview
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            className="hidden sm:inline-flex rounded-xs border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] text-xs font-semibold h-9 px-3.5 cursor-pointer"
          >
            Save Draft
          </Button>

          <Button
            size="sm"
            onClick={() => handleSave(true)}
            className="rounded-xs bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold h-9 px-4 cursor-pointer shadow-xs gap-1.5"
          >
            <Check className="h-3.5 w-3.5 text-[#C6A166]" />
            <span>Publish Offer</span>
          </Button>
        </div>
      </header>

      {/* =========================================================================
          STUDIO MAIN BODY: SPLIT LAYOUT (LEFT CONTROLS, RIGHT PREVIEW CANVAS)
      ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* -----------------------------------------------------------------------
            REGION B: LEFT DESIGN CONTROLS PANEL (380px–420px)
        ----------------------------------------------------------------------- */}
        <div
          className={`w-full lg:w-[410px] xl:w-[430px] border-r border-[#E8E2D8] bg-white flex flex-col shrink-0 overflow-hidden ${
            mobileTab === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Controls Sub-tabs Header */}
          <div className="flex border-b border-[#E8E2D8] bg-[#F8F5EF] text-[11px] font-bold overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => setActiveSection("content")}
              className={`py-2.5 px-3 whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                activeSection === "content"
                  ? "border-[#8E6D38] text-[#8E6D38] bg-white"
                  : "border-transparent text-[#74695E] hover:text-[#222220]"
              }`}
            >
              1. Content
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("layout")}
              className={`py-2.5 px-3 whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                activeSection === "layout"
                  ? "border-[#8E6D38] text-[#8E6D38] bg-white"
                  : "border-transparent text-[#74695E] hover:text-[#222220]"
              }`}
            >
              2. Layout
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("typography")}
              className={`py-2.5 px-3 whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                activeSection === "typography"
                  ? "border-[#8E6D38] text-[#8E6D38] bg-white"
                  : "border-transparent text-[#74695E] hover:text-[#222220]"
              }`}
            >
              3. Typography
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("colors")}
              className={`py-2.5 px-3 whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                activeSection === "colors"
                  ? "border-[#8E6D38] text-[#8E6D38] bg-white"
                  : "border-transparent text-[#74695E] hover:text-[#222220]"
              }`}
            >
              4. Colours
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("artwork")}
              className={`py-2.5 px-3 whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                activeSection === "artwork"
                  ? "border-[#8E6D38] text-[#8E6D38] bg-white"
                  : "border-transparent text-[#74695E] hover:text-[#222220]"
              }`}
            >
              5. Artwork
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("icons")}
              className={`py-2.5 px-3 whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                activeSection === "icons"
                  ? "border-[#8E6D38] text-[#8E6D38] bg-white"
                  : "border-transparent text-[#74695E] hover:text-[#222220]"
              }`}
            >
              6. Icons
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("pricing")}
              className={`py-2.5 px-3 whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                activeSection === "pricing"
                  ? "border-[#8E6D38] text-[#8E6D38] bg-white"
                  : "border-transparent text-[#74695E] hover:text-[#222220]"
              }`}
            >
              7. Pricing
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("spacing")}
              className={`py-2.5 px-3 whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                activeSection === "spacing"
                  ? "border-[#8E6D38] text-[#8E6D38] bg-white"
                  : "border-transparent text-[#74695E] hover:text-[#222220]"
              }`}
            >
              8. Styling
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("visibility")}
              className={`py-2.5 px-3 whitespace-nowrap border-b-2 cursor-pointer transition-colors ${
                activeSection === "visibility"
                  ? "border-[#8E6D38] text-[#8E6D38] bg-white"
                  : "border-transparent text-[#74695E] hover:text-[#222220]"
              }`}
            >
              9. Visibility
            </button>
          </div>

          {/* Controls Body - Independently Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* ---------------- 1. CONTENT & INCLUSIONS ---------------- */}
            {activeSection === "content" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#222220]">Offer Title *</Label>
                  <Input
                    value={currentOffer.title}
                    onChange={(e) =>
                      updateOfferState((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g. Festive Glow Full Body & Hair Spa Package"
                    className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white"
                  />
                  <p className="text-[10px] text-[#74695E]">
                    Clear, descriptive headline displayed prominently on the card.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Category</Label>
                    <select
                      value={currentOffer.category || "Packages"}
                      onChange={(e) =>
                        updateOfferState((prev) => ({
                          ...prev,
                          category: e.target.value as OfferCategory,
                        }))
                      }
                      className="w-full h-9 text-xs rounded-xs border border-[#E8E2D8] bg-white px-2.5 text-[#222220]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Campaign</Label>
                    <select
                      value={currentOffer.campaignId || ""}
                      onChange={(e) =>
                        updateOfferState((prev) => ({
                          ...prev,
                          campaignId: e.target.value,
                          campaignName: campaigns.find((c) => c.id === e.target.value)?.name,
                        }))
                      }
                      className="w-full h-9 text-xs rounded-xs border border-[#E8E2D8] bg-white px-2.5 text-[#222220]"
                    >
                      <option value="">No Campaign (Standard)</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#222220]">Short Card Description</Label>
                  <Textarea
                    rows={2}
                    value={currentOffer.description}
                    onChange={(e) =>
                      updateOfferState((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Short summary displayed on offer card"
                    className="text-xs rounded-xs border-[#E8E2D8] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#222220]">
                    Full Description (Detail Page)
                  </Label>
                  <Textarea
                    rows={3}
                    value={currentOffer.fullDescription || ""}
                    onChange={(e) =>
                      updateOfferState((prev) => ({ ...prev, fullDescription: e.target.value }))
                    }
                    placeholder="Comprehensive explanation of benefits, ritual steps, and results"
                    className="text-xs rounded-xs border-[#E8E2D8] bg-white"
                  />
                </div>

                {/* Package Inclusions */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
                  <Label className="text-xs font-bold text-[#222220] flex items-center justify-between">
                    <span>Package Inclusions</span>
                    <span className="text-[10px] text-[#74695E]">
                      {(currentOffer.includedServices || []).length} items
                    </span>
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
                      placeholder="Add treatment (e.g. Facial, Hair Spa)"
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddInclusion}
                      className="h-8 text-xs bg-[#222220] text-white rounded-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {(currentOffer.includedServices || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8] text-[11px]"
                      >
                        <span className="truncate text-[#222220] font-medium">{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInclusion(idx)}
                          className="text-[#74695E] hover:text-red-700 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Complimentary Services */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
                  <Label className="text-xs font-bold text-[#8E6D38] flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-[#A27C48]" />
                    <span>Complimentary Gifts (Free Add-ons)</span>
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
                      placeholder="e.g. Free Eyebrow Threading, Free Head Wash"
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddGift}
                      className="h-8 text-xs bg-[#8E6D38] hover:bg-[#785C2F] text-white rounded-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    {(currentOffer.complimentaryServices || []).map((gift, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xs bg-[#FAF5EE] border border-[#E8DFC8] text-[11px] text-[#8E6D38] font-semibold"
                      >
                        <span className="truncate">{gift}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGift(idx)}
                          className="text-[#8E6D38] hover:text-red-700 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 2. LAYOUT PRESETS ---------------- */}
            {activeSection === "layout" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <Label className="text-xs font-bold text-[#222220]">
                    Select Visual Card Preset
                  </Label>
                  <p className="text-[10px] text-[#74695E] mt-0.5">
                    Select a layout archetype tailored to the offer type.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {PRESET_OPTIONS.map((p) => {
                    const isSelected = (currentOffer.preset || "editorial") === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-xs border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white border-[#8E6D38] ring-2 ring-[#8E6D38]/20 shadow-xs"
                            : "bg-[#FAF8F5] border-[#E8E2D8] hover:bg-white"
                        }`}
                        onClick={() => applyPresetDefaults(p.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#222220]">{p.label}</span>
                          {isSelected && <Check className="h-4 w-4 text-[#8E6D38]" />}
                        </div>
                        <p className="text-[11px] text-[#74695E] mt-1 leading-relaxed">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyPresetDefaults(currentOffer.preset || "editorial")}
                    className="w-full text-xs border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] rounded-xs h-9 cursor-pointer gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset to Preset Defaults</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ---------------- 3. TYPOGRAPHY CONTROLS ---------------- */}
            {activeSection === "typography" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#222220]">Heading Font Family</Label>
                  <select
                    value={currentOffer.design?.headingFont || "Cormorant Garamond"}
                    onChange={(e) => updateDesign("headingFont", e.target.value)}
                    className="w-full h-9 text-xs rounded-xs border border-[#E8E2D8] bg-white px-2.5 text-[#222220]"
                  >
                    <option value="Cormorant Garamond">Cormorant Garamond (Editorial Luxury Serif)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean Sans)</option>
                    <option value="Playfair Display">Playfair Display (Refined Serif)</option>
                    <option value="Outfit">Outfit (Geometric Contemporary)</option>
                    <option value="Inter">Inter (Functional Neutral)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Heading Size</Label>
                    <select
                      value={currentOffer.design?.headingSize || "lg"}
                      onChange={(e) => updateDesign("headingSize", e.target.value)}
                      className="w-full h-8 text-xs rounded-xs border border-[#E8E2D8] bg-white px-2"
                    >
                      <option value="sm">Small (18px)</option>
                      <option value="md">Medium (20px)</option>
                      <option value="lg">Standard (24px)</option>
                      <option value="xl">Prominent (28px)</option>
                      <option value="2xl">Hero (32px)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Price Size</Label>
                    <select
                      value={currentOffer.design?.priceSize || "xl"}
                      onChange={(e) => updateDesign("priceSize", e.target.value)}
                      className="w-full h-8 text-xs rounded-xs border border-[#E8E2D8] bg-white px-2"
                    >
                      <option value="md">Medium (20px)</option>
                      <option value="lg">Large (24px)</option>
                      <option value="xl">Hero (28px)</option>
                      <option value="2xl">Statement (32px)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Heading Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentOffer.design?.headingColor || "#222220"}
                        onChange={(e) => updateDesign("headingColor", e.target.value)}
                        className="h-8 w-8 rounded-xs border border-[#E8E2D8] cursor-pointer p-0"
                      />
                      <Input
                        value={currentOffer.design?.headingColor || "#222220"}
                        onChange={(e) => updateDesign("headingColor", e.target.value)}
                        className="h-8 text-xs font-mono rounded-xs border-[#E8E2D8]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Body Text Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentOffer.design?.bodyColor || "#5C5B56"}
                        onChange={(e) => updateDesign("bodyColor", e.target.value)}
                        className="h-8 w-8 rounded-xs border border-[#E8E2D8] cursor-pointer p-0"
                      />
                      <Input
                        value={currentOffer.design?.bodyColor || "#5C5B56"}
                        onChange={(e) => updateDesign("bodyColor", e.target.value)}
                        className="h-8 text-xs font-mono rounded-xs border-[#E8E2D8]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateDesign("headingFont", "Cormorant Garamond");
                      updateDesign("headingSize", "lg");
                      updateDesign("priceSize", "xl");
                      updateDesign("headingColor", "#222220");
                      updateDesign("bodyColor", "#5C5B56");
                      toast.success("Reset typography to brand standards");
                    }}
                    className="w-full text-xs border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] rounded-xs h-8 cursor-pointer"
                  >
                    Reset Typography
                  </Button>
                </div>
              </div>
            )}

            {/* ---------------- 4. COLOUR CONTROLS ---------------- */}
            {activeSection === "colors" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Brand Palette Swatches */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#222220]">Quick Brand Palettes</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {BRAND_PALETTE.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => updateDesign("cardBg", c.hex)}
                        className="p-1.5 rounded-xs border border-[#E8E2D8] hover:border-[#8E6D38] text-center cursor-pointer transition-all"
                      >
                        <div
                          className="h-6 w-full rounded-xs border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[9px] text-[#5C5B56] truncate block mt-1">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Color Inputs */}
                <div className="space-y-3 pt-2 border-t border-[#E8E2D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#222220]">Card Background</span>
                      <p className="text-[10px] text-[#74695E]">Surface color of the card</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={currentOffer.design?.cardBg || "#FAF8F5"}
                        onChange={(e) => updateDesign("cardBg", e.target.value)}
                        className="h-7 w-7 rounded-xs border border-[#E8E2D8] cursor-pointer p-0"
                      />
                      <span className="font-mono text-[11px] text-[#222220]">
                        {currentOffer.design?.cardBg || "#FAF8F5"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#222220]">Price Accent Color</span>
                      <p className="text-[10px] text-[#74695E]">Promotional rate accent</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={currentOffer.design?.priceColor || "#8E6D38"}
                        onChange={(e) => updateDesign("priceColor", e.target.value)}
                        className="h-7 w-7 rounded-xs border border-[#E8E2D8] cursor-pointer p-0"
                      />
                      <span className="font-mono text-[11px] text-[#222220]">
                        {currentOffer.design?.priceColor || "#8E6D38"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#222220]">Card Border Color</span>
                      <p className="text-[10px] text-[#74695E]">Subtle container outline</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={currentOffer.design?.borderColor || "#E8DFC8"}
                        onChange={(e) => updateDesign("borderColor", e.target.value)}
                        className="h-7 w-7 rounded-xs border border-[#E8E2D8] cursor-pointer p-0"
                      />
                      <span className="font-mono text-[11px] text-[#222220]">
                        {currentOffer.design?.borderColor || "#E8DFC8"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#222220]">CTA Button Background</span>
                      <p className="text-[10px] text-[#74695E]">Primary action button</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={currentOffer.design?.buttonBg || "#222220"}
                        onChange={(e) => updateDesign("buttonBg", e.target.value)}
                        className="h-7 w-7 rounded-xs border border-[#E8E2D8] cursor-pointer p-0"
                      />
                      <span className="font-mono text-[11px] text-[#222220]">
                        {currentOffer.design?.buttonBg || "#222220"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateDesign("cardBg", "#FAF8F5");
                      updateDesign("priceColor", "#8E6D38");
                      updateDesign("borderColor", "#E8DFC8");
                      updateDesign("buttonBg", "#222220");
                      toast.success("Restored default brand palette");
                    }}
                    className="w-full text-xs border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] rounded-xs h-8 cursor-pointer"
                  >
                    Reset Colors
                  </Button>
                </div>
              </div>
            )}

            {/* ---------------- 5. ARTWORK & IMAGES ---------------- */}
            {activeSection === "artwork" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#222220]">Upload Custom Image</Label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xs border border-dashed border-[#D8C7B0] hover:border-[#8E6D38] bg-[#FAF8F5] hover:bg-white cursor-pointer transition-colors text-xs text-[#5C5B56]">
                    <Upload className="h-4 w-4 text-[#8E6D38]" />
                    <span>Upload artwork file (PNG, WEBP, JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Approved Gallery Grid */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
                  <Label className="text-xs font-bold text-[#222220]">
                    Select from Approved Salon Artwork
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {APPROVED_GALLERY.map((img) => {
                      const isSelected = currentOffer.imageUrl === img.url;
                      return (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() =>
                            updateOfferState((prev) => ({ ...prev, imageUrl: img.url }))
                          }
                          className={`relative rounded-xs overflow-hidden border p-1 text-left cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#8E6D38] ring-2 ring-[#8E6D38]/30 shadow-xs"
                              : "border-[#E8E2D8] opacity-80 hover:opacity-100"
                          }`}
                        >
                          <div className="relative h-16 w-full rounded-xs overflow-hidden bg-[#FAF8F5]">
                            <Image src={img.url} alt={img.label} fill className="object-cover" />
                          </div>
                          <span className="text-[10px] text-[#222220] font-medium truncate block mt-1">
                            {img.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio Options */}
                <div className="space-y-1.5 pt-2 border-t border-[#E8E2D8]">
                  <Label className="text-xs font-bold text-[#222220]">Image Aspect Ratio</Label>
                  <select
                    value={currentOffer.design?.aspectRatio || "auto"}
                    onChange={(e) => updateDesign("aspectRatio", e.target.value)}
                    className="w-full h-8 text-xs rounded-xs border border-[#E8E2D8] bg-white px-2"
                  >
                    <option value="auto">Default Standard (180px)</option>
                    <option value="16:9">Wide (16:9 Cinematic)</option>
                    <option value="4:3">Classic (4:3 Balanced)</option>
                    <option value="1:1">Square (1:1 Modern)</option>
                    <option value="3:4">Tall Portrait (3:4)</option>
                  </select>
                </div>

                {currentOffer.imageUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOfferState((prev) => ({ ...prev, imageUrl: undefined }))}
                    className="w-full text-xs border-red-200 text-red-700 hover:bg-red-50 rounded-xs h-8 cursor-pointer"
                  >
                    Remove Artwork (Use Typography Layout)
                  </Button>
                )}
              </div>
            )}

            {/* ---------------- 6. ICONS & DECORATIONS ---------------- */}
            {activeSection === "icons" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#222220]">Featured Icon</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => updateDesign("iconName", undefined)}
                      className={`p-2 rounded-xs border text-center cursor-pointer text-[10px] ${
                        !currentOffer.design?.iconName
                          ? "border-[#8E6D38] bg-[#FAF5EE] text-[#8E6D38] font-bold"
                          : "border-[#E8E2D8] text-[#74695E]"
                      }`}
                    >
                      None
                    </button>
                    {ICON_CHOICES.map((ic) => {
                      const IconCmp = ic.icon;
                      const isSelected = currentOffer.design?.iconName === ic.id;
                      return (
                        <button
                          key={ic.id}
                          type="button"
                          onClick={() => updateDesign("iconName", ic.id)}
                          className={`p-2 rounded-xs border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                            isSelected
                              ? "border-[#8E6D38] bg-[#FAF5EE] text-[#8E6D38] font-bold"
                              : "border-[#E8E2D8] text-[#74695E] hover:text-[#222220]"
                          }`}
                        >
                          <IconCmp className="h-4 w-4" />
                          <span className="text-[9px] truncate w-full">{ic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
                  <div className="flex items-center justify-between p-3 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8]">
                    <div>
                      <Label className="text-xs font-bold text-[#222220] block">
                        Festive Gold Glow
                      </Label>
                      <p className="text-[10px] text-[#74695E]">Add warm champagne shadow aura</p>
                    </div>
                    <Switch
                      checked={currentOffer.design?.shadow === "gold"}
                      onCheckedChange={(checked) =>
                        updateDesign("shadow", checked ? "gold" : "sm")
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 7. PRICING & BADGES ---------------- */}
            {activeSection === "pricing" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Client Price (₹) *</Label>
                    <Input
                      type="number"
                      value={currentOffer.price !== undefined ? currentOffer.price : ""}
                      onChange={(e) =>
                        updateOfferState((prev) => ({
                          ...prev,
                          price: e.target.value ? parseFloat(e.target.value) : undefined,
                        }))
                      }
                      placeholder="e.g. 1599"
                      className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white font-semibold"
                    />
                    <p className="text-[10px] text-[#74695E]">Final payable amount</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">
                      Original Reference (₹)
                    </Label>
                    <Input
                      type="number"
                      value={
                        currentOffer.originalPrice !== undefined ? currentOffer.originalPrice : ""
                      }
                      onChange={(e) =>
                        updateOfferState((prev) => ({
                          ...prev,
                          originalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        }))
                      }
                      placeholder="e.g. 2400"
                      className="h-9 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                    <p className="text-[10px] text-[#74695E]">Shown with strikethrough</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Badge Text</Label>
                    <Input
                      value={currentOffer.badge || ""}
                      onChange={(e) =>
                        updateOfferState((prev) => ({ ...prev, badge: e.target.value }))
                      }
                      placeholder="e.g. 25% OFF, ₹1599"
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Promo Code</Label>
                    <Input
                      value={currentOffer.code || ""}
                      onChange={(e) =>
                        updateOfferState((prev) => ({ ...prev, code: e.target.value }))
                      }
                      placeholder="e.g. FESTIVE1599"
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 8. SPACING & CARD STYLING ---------------- */}
            {activeSection === "spacing" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#222220]">Card Padding</Label>
                  <select
                    value={currentOffer.design?.padding || "normal"}
                    onChange={(e) => updateDesign("padding", e.target.value)}
                    className="w-full h-8 text-xs rounded-xs border border-[#E8E2D8] bg-white px-2"
                  >
                    <option value="compact">Compact (Saves vertical space)</option>
                    <option value="normal">Normal (Balanced breathing room)</option>
                    <option value="spacious">Spacious (Editorial luxury)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Corner Radius</Label>
                    <select
                      value={currentOffer.design?.borderRadius || "sm"}
                      onChange={(e) => updateDesign("borderRadius", e.target.value)}
                      className="w-full h-8 text-xs rounded-xs border border-[#E8E2D8] bg-white px-2"
                    >
                      <option value="none">Sharp Corners (0px)</option>
                      <option value="xs">Subtle (2px)</option>
                      <option value="sm">Soft (4px - Default)</option>
                      <option value="md">Rounded (8px)</option>
                      <option value="lg">Curved (12px)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Border Width</Label>
                    <select
                      value={currentOffer.design?.borderWidth || "1px"}
                      onChange={(e) => updateDesign("borderWidth", e.target.value)}
                      className="w-full h-8 text-xs rounded-xs border border-[#E8E2D8] bg-white px-2"
                    >
                      <option value="none">No Border</option>
                      <option value="1px">Thin (1px - Default)</option>
                      <option value="2px">Medium (2px Festive)</option>
                      <option value="3px">Bold (3px Statement)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 9. VISIBILITY & POLICIES ---------------- */}
            {activeSection === "visibility" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xs bg-white border border-[#E8E2D8]">
                    <div>
                      <Label className="text-xs font-bold text-[#222220] block">
                        Published (Active) Status
                      </Label>
                      <p className="text-[10px] text-[#74695E]">
                        Eligible for customer view and booking
                      </p>
                    </div>
                    <Switch
                      checked={currentOffer.active}
                      onCheckedChange={(checked) =>
                        updateOfferState((prev) => ({ ...prev, active: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xs bg-white border border-[#E8E2D8]">
                    <div>
                      <Label className="text-xs font-bold text-[#222220] block">
                        Show on Customer Home Page
                      </Label>
                      <p className="text-[10px] text-[#74695E]">
                        Feature in curated home showcase
                      </p>
                    </div>
                    <Switch
                      checked={!!currentOffer.showOnHome}
                      onCheckedChange={(checked) =>
                        updateOfferState((prev) => ({ ...prev, showOnHome: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xs bg-white border border-[#E8E2D8]">
                    <div>
                      <Label className="text-xs font-bold text-[#222220] block">
                        Featured on Offers Page
                      </Label>
                      <p className="text-[10px] text-[#74695E]">Top priority in offers catalog</p>
                    </div>
                    <Switch
                      checked={!!currentOffer.isFeatured}
                      onCheckedChange={(checked) =>
                        updateOfferState((prev) => ({ ...prev, isFeatured: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E8E2D8]">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Starts Date</Label>
                    <Input
                      type="date"
                      value={currentOffer.startsAt}
                      onChange={(e) =>
                        updateOfferState((prev) => ({ ...prev, startsAt: e.target.value }))
                      }
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#222220]">Ends Date</Label>
                    <Input
                      type="date"
                      value={currentOffer.endsAt}
                      onChange={(e) =>
                        updateOfferState((prev) => ({ ...prev, endsAt: e.target.value }))
                      }
                      className="h-8 text-xs rounded-xs border-[#E8E2D8] bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#222220]">Terms &amp; Policies</Label>
                  <Textarea
                    rows={2}
                    value={typeof currentOffer.terms === "string" ? currentOffer.terms : ""}
                    onChange={(e) =>
                      updateOfferState((prev) => ({ ...prev, terms: e.target.value }))
                    }
                    placeholder="Advance appointment required. Cannot be clubbed with other discounts."
                    className="text-xs rounded-xs border-[#E8E2D8] bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            REGION C: LARGE LIVE PREVIEW WORKSPACE (55–65% WIDTH)
        ----------------------------------------------------------------------- */}
        <div
          className={`flex-1 bg-[#ECE7DF] relative flex flex-col items-center justify-start overflow-y-auto p-4 sm:p-8 lg:p-12 ${
            mobileTab === "controls" ? "hidden lg:flex" : "flex"
          }`}
          style={{
            backgroundImage: "radial-gradient(#D8C7B0 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Canvas Floating Top Info */}
          <div className="w-full max-w-2xl mb-4 sm:mb-6 flex items-center justify-between text-xs text-[#74695E]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#222220]">
                {device === "desktop" ? "Desktop Grid Card View" : "Mobile Viewport"}
              </span>
              <span>·</span>
              <span className="capitalize">{currentOffer.preset || "editorial"} preset</span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Live Sync</span>
            </div>
          </div>

          {/* Realistic Card Container (Generous width to eliminate squishing!) */}
          <div
            className={`transition-all duration-300 w-full flex justify-center ${
              device === "mobile" ? "max-w-[340px]" : "max-w-[420px]"
            }`}
          >
            {device === "mobile" ? (
              /* Mobile Device Frame */
              <div className="w-full rounded-2xl border-4 border-[#222220] bg-white shadow-xl overflow-hidden">
                <div className="h-5 bg-[#222220] flex items-center justify-center">
                  <div className="h-1.5 w-12 rounded-full bg-white/30" />
                </div>
                <div className="p-3 bg-[#FAF8F5]">
                  <OfferCard offer={currentOffer} isOwnerPreview={true} />
                </div>
              </div>
            ) : (
              /* Desktop Card Container */
              <div className="w-full">
                <OfferCard offer={currentOffer} isOwnerPreview={true} />
              </div>
            )}
          </div>

          {/* Design Inspect Pill at Bottom */}
          <div className="mt-8 p-3 rounded-xs bg-white/90 backdrop-blur-xs border border-[#E8E2D8] text-[11px] text-[#74695E] flex flex-wrap items-center justify-center gap-4 max-w-lg shadow-2xs">
            <span>
              Font: <strong className="text-[#222220]">{currentOffer.design?.headingFont || "Cormorant"}</strong>
            </span>
            <span>•</span>
            <span>
              Card Bg: <strong className="text-[#222220]">{currentOffer.design?.cardBg || "#FAF8F5"}</strong>
            </span>
            <span>•</span>
            <span>
              Price: <strong className="text-[#222220]">₹{currentOffer.price || "N/A"}</strong>
            </span>
            <span>•</span>
            <span>
              Preset: <strong className="text-[#222220]">{currentOffer.preset}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
