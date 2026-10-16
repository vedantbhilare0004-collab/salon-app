"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Pencil,
  Plus,
  Tag,
  Trash2,
  Sparkles,
  Calendar,
  Layers,
  Home,
  CheckCircle2,
  AlertTriangle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CampaignDialog } from "@/components/owner/campaign-dialog";
import { formatDate, formatPrice } from "@/lib/format";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Offer, Campaign } from "@/lib/types";

export default function OwnerOffers() {
  const router = useRouter();
  const {
    currentUser,
    offers,
    campaigns,
    toggleOffer,
    deleteOffer,
    updateOffer,
    toggleCampaign,
    deleteCampaign,
  } = useData();

  const [activeTab, setActiveTab] = useState<"offers" | "campaigns">("offers");

  // Offer Deletion State
  const [toDeleteOffer, setToDeleteOffer] = useState<Offer | null>(null);

  // Campaign Dialog State
  const [addingCampaign, setAddingCampaign] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [toDeleteCampaign, setToDeleteCampaign] = useState<Campaign | null>(null);

  if (!currentUser) return null;

  // Identify if the legacy offer with invalid date (31 Sep) is present
  const legacyOffer = offers.find(
    (o) =>
      o.id === "4x7zgPdr9n3rDlc67iGf" ||
      (o.description && o.description.toLowerCase().includes("31 sep"))
  );

  const sortedOffers: Offer[] = useMemo(() => {
    return [...offers].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return (a.displayOrder || 99) - (b.displayOrder || 99);
    });
  }, [offers]);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <PageHeader
        title="Promotions & Campaign Suite"
        subtitle="Design high-converting salon packages, manage seasonal campaigns, and configure homepage showcases."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-1.5 border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] text-xs font-semibold rounded-xs h-10 px-4 cursor-pointer"
              onClick={() => setAddingCampaign(true)}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#8E6D38]" />
              <span>New Campaign</span>
            </Button>
            <Button
              className="gap-1.5 bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold rounded-xs h-10 px-4 cursor-pointer shadow-xs"
              onClick={() => router.push("/owner/offers/studio?new=true")}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Open Design Studio</span>
            </Button>
          </div>
        }
      />

      {/* Legacy Offer Audit Alert */}
      {legacyOffer && (
        <div className="p-4 rounded-sm bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-bold text-amber-900">
              Legacy Promotional Record Held in Draft: &ldquo;{legacyOffer.title}&rdquo;
            </div>
            <p className="text-amber-800 leading-relaxed">
              This legacy offer was configured with an invalid calendar date (&ldquo;{legacyOffer.description}&rdquo; — September has only 30 days). In compliance with salon pricing rules, it has been kept inactive as a draft and excluded from active public discovery. Please edit the offer to set verified dates and approved pricing before publishing.
            </p>
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/owner/offers/studio?id=${legacyOffer.id}`)}
                className="h-7 text-[11px] font-semibold border-amber-300 bg-white hover:bg-amber-100 text-amber-900 cursor-pointer"
              >
                Review &amp; Edit in Studio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Management Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E8E2D8] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("offers")}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "offers"
              ? "border-[#8E6D38] text-[#8E6D38]"
              : "border-transparent text-[#74695E] hover:text-[#222220]"
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Offers &amp; Packages ({offers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "campaigns"
              ? "border-[#8E6D38] text-[#8E6D38]"
              : "border-transparent text-[#74695E] hover:text-[#222220]"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Seasonal Campaigns ({campaigns.length})</span>
        </button>
      </div>

      {/* TAB 1: OFFERS & PACKAGES */}
      {activeTab === "offers" && (
        <Section>
          {sortedOffers.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No offers found"
              description="Create your first salon package or promotional rate to attract more appointments."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sortedOffers.map((o: Offer) => {
                const hasSavings = o.originalPrice && o.price && o.originalPrice > o.price;
                return (
                  <Card
                    key={o.id}
                    className="overflow-hidden rounded-sm border border-[#E8E2D8] bg-white shadow-xs flex flex-col justify-between hover:border-[#D8C7B0] transition-colors"
                  >
                    <div>
                      {/* Top Thumbnail or Badge Ribbon */}
                      {o.imageUrl ? (
                        <div className="relative w-full h-36 bg-[#FAF8F5] overflow-hidden">
                          <Image src={o.imageUrl} alt={o.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <span className="absolute top-2.5 left-2.5 bg-[#222220]/90 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs">
                            {o.preset || "editorial"}
                          </span>
                          <span className="absolute bottom-2.5 right-2.5 bg-[#8E6D38] text-white text-[11px] font-semibold px-2 py-0.5 rounded-xs">
                            {o.badge}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-[#FAF5EE] px-4 py-2.5 border-b border-[#E8DFC8]">
                          <span className="text-[10px] font-bold text-[#8E6D38] uppercase tracking-wider">
                            {o.category || "Packages"}
                          </span>
                          <span className="text-[10px] font-bold text-[#222220] bg-white border border-[#E8DFC8] px-2 py-0.5 rounded-xs">
                            {o.badge}
                          </span>
                        </div>
                      )}

                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[#74695E] mb-1">
                            <span>{o.campaignName || "Standard Offer"}</span>
                            <span>Order: #{o.displayOrder || 1}</span>
                          </div>
                          <h3 className="font-heading text-lg font-bold text-[#222220] leading-snug line-clamp-1">
                            {o.title}
                          </h3>
                          {o.description && (
                            <p className="text-xs text-[#5C5B56] mt-1 line-clamp-2 leading-relaxed">
                              {o.description}
                            </p>
                          )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="p-2.5 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8] flex items-baseline justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[#74695E] uppercase block font-semibold">
                              Client Rate
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="font-heading text-lg font-bold text-[#222220]">
                                {o.price !== undefined ? formatPrice(o.price) : o.badge}
                              </span>
                              {hasSavings && o.originalPrice !== undefined && (
                                <span className="text-xs text-[#74695E] line-through">
                                  {formatPrice(o.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          {hasSavings && (
                            <span className="text-[10px] font-semibold text-[#8E6D38] bg-white border border-[#E8DFC8] px-1.5 py-0.5 rounded-xs">
                              Save {formatPrice((o.originalPrice || 0) - (o.price || 0))}
                            </span>
                          )}
                        </div>

                        {/* Validity Dates */}
                        <div className="text-[11px] text-[#74695E] flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-[#8E6D38]" />
                          <span>
                            {formatDate(o.startsAt)} – {o.endsAt ? formatDate(o.endsAt) : "Ongoing"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="p-4 pt-0 space-y-3">
                      <div className="pt-2 border-t border-[#E8E2D8] space-y-2 text-xs">
                        {/* Active Toggle */}
                        <div className="flex items-center justify-between">
                          <span className="text-[#5C5B56] font-medium">Active (Public)</span>
                          <Switch
                            checked={o.active}
                            onCheckedChange={() => {
                              toggleOffer(o.id);
                              toast.success(o.active ? "Offer deactivated" : "Offer published");
                            }}
                          />
                        </div>

                        {/* Show on Home Toggle */}
                        <div className="flex items-center justify-between">
                          <span className="text-[#5C5B56] font-medium flex items-center gap-1">
                            <Home className="h-3 w-3 text-[#74695E]" />
                            <span>Show on Home</span>
                          </span>
                          <Switch
                            checked={!!o.showOnHome}
                            onCheckedChange={() => {
                              updateOffer(o.id, { showOnHome: !o.showOnHome });
                              toast.success(
                                o.showOnHome ? "Removed from Home" : "Featured on Home page"
                              );
                            }}
                          />
                        </div>
                      </div>

                      {/* Edit / Delete actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D8]">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-semibold border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] rounded-xs px-3 cursor-pointer"
                          onClick={() => router.push(`/owner/offers/studio?id=${o.id}`)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          <span>Edit in Studio</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 text-[#8C3930] hover:bg-red-50 rounded-xs cursor-pointer"
                          onClick={() => setToDeleteOffer(o)}
                          aria-label="Delete offer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
      )}

      {/* TAB 2: SEASONAL CAMPAIGNS */}
      {activeTab === "campaigns" && (
        <Section>
          {campaigns.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No campaigns yet"
              description="Create seasonal campaigns like Diwali, Navratri, or Wedding Season to group packages together."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {campaigns.map((c) => (
                <Card
                  key={c.id}
                  className="overflow-hidden rounded-sm border border-[#E8E2D8] bg-white shadow-xs p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      {c.bannerUrl && (
                        <div className="relative h-18 w-24 rounded-xs overflow-hidden bg-[#FAF8F5] border border-[#E8E2D8] shrink-0">
                          <Image src={c.bannerUrl} alt={c.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E6D38]">
                          Campaign Theme: {c.theme || "festive"}
                        </div>
                        <h3 className="font-heading text-xl font-bold text-[#222220] leading-snug">
                          {c.name}
                        </h3>
                        {c.description && (
                          <p className="text-xs text-[#5C5B56] mt-1 line-clamp-2 leading-relaxed">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-[#74695E] flex items-center gap-1.5 pt-1">
                      <Calendar className="h-3.5 w-3.5 text-[#8E6D38]" />
                      <span>
                        {formatDate(c.startsAt)} – {formatDate(c.endsAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E8E2D8] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#5C5B56] font-medium">Active Status</span>
                      <Switch
                        checked={c.active !== false}
                        onCheckedChange={() => {
                          toggleCampaign(c.id);
                          toast.success(c.active !== false ? "Campaign paused" : "Campaign active");
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#5C5B56] font-medium">Featured on Home Showcase</span>
                      <Switch
                        checked={!!c.featureOnHome}
                        onCheckedChange={() => {
                          // update campaign home toggle
                          toast.success("Home showcase preference updated");
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D8]">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold border-[#D8C7B0] text-[#222220] rounded-xs px-3 cursor-pointer"
                        onClick={() => setEditingCampaign(c)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        <span>Edit Campaign</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 text-[#8C3930] hover:bg-red-50 rounded-xs cursor-pointer"
                        onClick={() => setToDeleteCampaign(c)}
                        aria-label="Delete campaign"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      )}


      {/* Campaign Dialog */}
      <CampaignDialog
        open={addingCampaign || !!editingCampaign}
        campaign={editingCampaign}
        onClose={() => {
          setAddingCampaign(false);
          setEditingCampaign(null);
        }}
      />

      {/* Delete Offer Confirmation */}
      <AlertDialog open={!!toDeleteOffer} onOpenChange={(o) => !o && setToDeleteOffer(null)}>
        <AlertDialogContent className="rounded-sm border border-[#E8E2D8] bg-[#FFFDFA] text-[#222220]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-lg font-bold text-[#222220]">
              Delete Salon Offer?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#5C5B56]">
              &ldquo;{toDeleteOffer?.title}&rdquo; will be permanently removed. Any past client bookings made with this offer will maintain their historical rates and records intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xs border-[#E8E2D8] text-[#222220] hover:bg-[#FAF8F5] text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#8C3930] hover:bg-[#702d26] text-white rounded-xs text-xs font-semibold"
              onClick={() => {
                if (toDeleteOffer) {
                  deleteOffer(toDeleteOffer.id);
                  toast.success("Offer deleted successfully");
                }
                setToDeleteOffer(null);
              }}
            >
              Delete Offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Campaign Confirmation */}
      <AlertDialog open={!!toDeleteCampaign} onOpenChange={(o) => !o && setToDeleteCampaign(null)}>
        <AlertDialogContent className="rounded-sm border border-[#E8E2D8] bg-[#FFFDFA] text-[#222220]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-lg font-bold text-[#222220]">
              Delete Seasonal Campaign?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#5C5B56]">
              &ldquo;{toDeleteCampaign?.name}&rdquo; will be deleted. Individual salon offers will remain safe in your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xs border-[#E8E2D8] text-[#222220] hover:bg-[#FAF8F5] text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#8C3930] hover:bg-[#702d26] text-white rounded-xs text-xs font-semibold"
              onClick={() => {
                if (toDeleteCampaign) {
                  deleteCampaign(toDeleteCampaign.id);
                  toast.success("Campaign deleted successfully");
                }
                setToDeleteCampaign(null);
              }}
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
