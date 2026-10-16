"use client";

import { useMemo, useState, useEffect } from "react";
import { serviceService } from "@/lib/services/serviceService";
import {
  Pencil,
  Plus,
  Scissors,
  Trash2,
  Search,
  Sparkles,
  Archive,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId, type Service } from "@/lib/types";
import { CATALOGUE_CATEGORIES } from "@/lib/catalogue-data";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ServiceDialog } from "@/components/owner/service-dialog";
import { formatPrice } from "@/lib/format";
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

export default function OwnerServices() {
  const { currentUser, activeBranchId, services, toggleService, deleteService } = useData();
  const [branch, setBranch] = useState<BranchId | "all">(activeBranchId);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<Service | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [genderFilterMap, setGenderFilterMap] = useState<Record<string, "all" | "male" | "female">>({});

  useEffect(() => {
    serviceService.cleanupDuplicates();
  }, []);

  if (!currentUser) return null;

  // Filter services by branch, archival status, and search query
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const branchMatch = branch === "all" ? true : s.branchId === branch;
      const archiveMatch = showArchived ? true : !s.archived;
      if (!branchMatch || !archiveMatch) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.variant && s.variant.toLowerCase().includes(q))
      );
    });
  }, [services, branch, showArchived, searchQuery]);

  // Order categories according to official CATALOGUE_CATEGORIES list
  const groupedCategories = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of filteredServices) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }

    const catIndex = (cat: string) => {
      const idx = (CATALOGUE_CATEGORIES as readonly string[]).indexOf(cat);
      return idx === -1 ? 999 : idx;
    };

    return Array.from(map.entries()).sort((a, b) => {
      const idxA = catIndex(a[0]);
      const idxB = catIndex(b[0]);
      if (idxA !== idxB) return idxA - idxB;
      return a[0].localeCompare(b[0]);
    });
  }, [filteredServices]);

  // Overall metrics
  const activeCount = useMemo(
    () => services.filter((s) => !s.archived && s.active).length,
    [services]
  );
  const totalCategoriesCount = useMemo(() => {
    const activeCats = new Set(services.filter((s) => !s.archived).map((s) => s.category));
    return activeCats.size;
  }, [services]);

  const setGenderFilter = (cat: string, gender: "all" | "male" | "female") => {
    setGenderFilterMap((prev) => ({ ...prev, [cat]: gender }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="Services & Pricing Catalogue"
        subtitle="Manage the complete 13-category salon menu, male/female price variants, and active bookings availability."
        action={
          <div className="flex items-center gap-2">
            <Button
              className="gap-1.5 bg-[#A27C48] hover:bg-[#876438] text-white font-medium rounded-md shadow-xs transition-colors"
              onClick={() => setAdding(true)}
            >
              <Plus className="h-4 w-4" /> Add Service
            </Button>
          </div>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#74695E]">
            Active Categories
          </p>
          <p className="text-xl font-bold text-[#302A24] mt-0.5">{totalCategoriesCount} of 13</p>
        </Card>
        <Card className="p-3.5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#74695E]">
            Active Services
          </p>
          <p className="text-xl font-bold text-[#355B3C] mt-0.5">{activeCount}</p>
        </Card>
        <Card className="p-3.5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#74695E]">
            Currency
          </p>
          <p className="text-xl font-bold text-[#A27C48] mt-0.5">INR (₹)</p>
        </Card>
        <Card className="p-3.5 rounded-md border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#74695E]">
            Primary Branch
          </p>
          <p className="text-xl font-bold text-[#302A24] mt-0.5">Koregaon</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className={`text-xs h-9 rounded-md border-[#E9E1D6] ${
              showArchived
                ? "bg-[#302A24] text-white hover:bg-black"
                : "bg-[#FFFDFA] text-[#74695E] hover:bg-[#F0EBE3]"
            }`}
          >
            <Archive className="h-3.5 w-3.5 mr-1.5" />
            {showArchived ? "Viewing Inactive & Archived" : "Show Archived History"}
          </Button>
        </div>

        <div className="relative w-full sm:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#74695E]" />
          <Input
            placeholder="Search treatments or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-[#FFFDFA] border-[#E9E1D6] text-[#302A24] placeholder:text-[#74695E] text-xs rounded-md focus-visible:ring-[#A27C48]"
          />
        </div>
      </div>

      {/* Grouped Service Catalogue */}
      {groupedCategories.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services match your criteria"
          description="Try adjusting your search terms or add a new service to the catalogue."
        />
      ) : (
        <Accordion
          type="multiple"
          defaultValue={groupedCategories.map((g) => g[0])}
          className="w-full space-y-4"
        >
          {groupedCategories.map(([categoryName, items]) => {
            // Check if this category has male / female variants
            const hasVariants = items.some((i) => i.variant || (i.gender && i.gender !== "unisex"));
            const currentGenderFilter = genderFilterMap[categoryName] || "all";

            const displayedItems = items.filter((item) => {
              if (currentGenderFilter === "all") return true;
              const g = item.gender || (item.variant ? item.variant.toLowerCase() : "unisex");
              return g === currentGenderFilter;
            });

            return (
              <AccordionItem
                key={categoryName}
                value={categoryName}
                className="rounded-md border border-[#E9E1D6] bg-[#FFFDFA] overflow-hidden shadow-xs"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-[#F0EBE3]/40 data-[state=open]:border-b border-[#E9E1D6] transition-colors">
                  <div className="flex items-center gap-3 text-left">
                    <span className="font-semibold text-base text-[#302A24]">
                      {categoryName}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#F0EBE3] text-[#74695E] border-none"
                    >
                      {items.length} {items.length === 1 ? "service" : "services"}
                    </Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-0">
                  {/* Category Variant Selector (for categories like Hair Spa, Treatment, Hair Colour, Hand & Feet) */}
                  {hasVariants && (
                    <div className="bg-[#FAF8F5] px-5 py-2.5 border-b border-[#E9E1D6] flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs text-[#74695E] font-medium">
                        Gender Variants:
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setGenderFilter(categoryName, "all")}
                          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                            currentGenderFilter === "all"
                              ? "bg-[#302A24] text-white shadow-2xs"
                              : "text-[#74695E] hover:bg-[#E9E1D6]"
                          }`}
                        >
                          All ({items.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setGenderFilter(categoryName, "male")}
                          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                            currentGenderFilter === "male"
                              ? "bg-[#2563EB] text-white shadow-2xs"
                              : "text-[#74695E] hover:bg-[#E9E1D6]"
                          }`}
                        >
                          Male (
                          {
                            items.filter(
                              (i) =>
                                i.gender === "male" ||
                                (i.variant && i.variant.toLowerCase() === "male")
                            ).length
                          }
                          )
                        </button>
                        <button
                          type="button"
                          onClick={() => setGenderFilter(categoryName, "female")}
                          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                            currentGenderFilter === "female"
                              ? "bg-[#DB2777] text-white shadow-2xs"
                              : "text-[#74695E] hover:bg-[#E9E1D6]"
                          }`}
                        >
                          Female (
                          {
                            items.filter(
                              (i) =>
                                i.gender === "female" ||
                                (i.variant && i.variant.toLowerCase() === "female")
                            ).length
                          }
                          )
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Services List in Category */}
                  <div className="flex flex-col divide-y divide-[#E9E1D6]">
                    {displayedItems.length === 0 ? (
                      <p className="p-4 text-xs text-[#74695E] italic text-center">
                        No services match the selected variant filter.
                      </p>
                    ) : (
                      displayedItems.map((s) => (
                        <div
                          key={s.id}
                          className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-3.5 px-5 hover:bg-[#F0EBE3]/25 transition-colors ${
                            s.archived ? "opacity-60 bg-[#FBF9F7]" : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm text-[#302A24] leading-tight">
                                {s.name}
                              </p>
                              {s.variant && (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    s.variant === "Male"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-pink-100 text-pink-700"
                                  }`}
                                >
                                  {s.variant}
                                </span>
                              )}
                              {s.archived && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-[#D1C7BA] text-[#74695E] bg-[#EFECE6]"
                                >
                                  Archived
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-[#74695E] mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
                              <span className="font-semibold text-sm text-[#302A24]">
                                {formatPrice(s.price)}
                              </span>
                              <span className="opacity-40">•</span>
                              <span>{s.durationMin || s.durationMinutes || 30} min</span>
                              {s.gender && s.gender !== "unisex" && !s.variant && (
                                <>
                                  <span className="opacity-40">•</span>
                                  <span className="capitalize">{s.gender}</span>
                                </>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5 mr-1">
                              <span className="text-[11px] text-[#74695E] hidden md:inline">
                                {s.active ? "Active" : "Disabled"}
                              </span>
                              <Switch
                                checked={s.active}
                                onCheckedChange={() => {
                                  toggleService(s.id);
                                  toast.success(
                                    s.active
                                      ? `"${s.name}" disabled from bookings`
                                      : `"${s.name}" activated for bookings`
                                  );
                                }}
                              />
                            </div>

                            <div className="h-5 w-px bg-[#E9E1D6] mx-0.5 hidden sm:block"></div>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3] rounded-md"
                              onClick={() => setEditing(s)}
                              aria-label="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-[#74695E] hover:text-[#8C3930] hover:bg-[#F7E7E3] rounded-md"
                              onClick={() => setToDelete(s)}
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Add / Edit Service Dialog */}
      <ServiceDialog
        open={adding || !!editing}
        service={editing}
        defaultBranch={branch === "all" ? activeBranchId : branch}
        onClose={() => {
          setAdding(false);
          setEditing(null);
        }}
      />

      {/* Confirmation Dialog before destructive delete */}
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent className="rounded-md border border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold text-[#302A24]">
              Delete service from catalogue?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#74695E]">
              &quot;{toDelete?.name}&quot; (
              {toDelete?.variant ? `${toDelete.variant} · ` : ""}
              {toDelete && formatPrice(toDelete.price)}) will be permanently
              removed from the active catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#8C3930] hover:bg-[#702d26] text-white rounded-md text-xs"
              onClick={() => {
                if (toDelete) {
                  deleteService(toDelete.id);
                  toast.success(`"${toDelete.name}" deleted from catalogue`);
                }
                setToDelete(null);
              }}
            >
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
