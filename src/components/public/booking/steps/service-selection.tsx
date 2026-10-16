"use client";

import { useEffect, useState, useMemo } from "react";
import { BookingState } from "../booking-flow";
import { Service } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Search, Clock, Sparkles, ChevronRight } from "lucide-react";
import { serviceService, RAW_SERVICES } from "@/lib/services/serviceService";
import { formatPrice } from "@/lib/format";
import { CATALOGUE_CATEGORIES } from "@/lib/catalogue-data";

interface Props {
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  onNext: () => void;
}

export function ServiceSelection({ state, setState, onNext }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = serviceService.onServices((data) => {
        const filtered = data.filter((s) => (s.active || s.isActive) && !s.archived && s.branchId === state.branchId);
        if (filtered.length > 0) {
          setServices(filtered);
        } else {
          // If Firestore is empty or unseeded, use RAW_SERVICES
          const fallback: Service[] = RAW_SERVICES.map((s, i) => ({
            ...s,
            id: `service_${i}`,
            branchId: state.branchId,
            isActive: true,
          }));
          setServices(fallback);
        }
        setLoading(false);
      });
    } catch {
      const fallback: Service[] = RAW_SERVICES.map((s, i) => ({
        ...s,
        id: `service_${i}`,
        branchId: state.branchId,
        isActive: true,
      }));
      setServices(fallback);
      setLoading(false);
    }

    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          const fallback: Service[] = RAW_SERVICES.map((s, i) => ({
            ...s,
            id: `service_${i}`,
            branchId: state.branchId,
            isActive: true,
          }));
          setServices(fallback);
          return false;
        }
        return prev;
      });
    }, 2000);

    return () => {
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, [state.branchId]);

  // Support pre-selecting category and service from URL query params (e.g. from /treatments page)
  useEffect(() => {
    if (typeof window !== "undefined" && services.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const preCategory = params.get("category");
      const preService = params.get("service");

      if (preCategory) {
        setSelectedCategory(preCategory);
      }
      if (preService) {
        const found = services.find(
          (s) => s.name.toLowerCase().trim() === preService.toLowerCase().trim()
        );
        if (found) {
          setState((prev) => {
            if (prev.services.some((s) => s.id === found.id)) return prev;
            return { ...prev, services: [...prev.services, found] };
          });
        }
      }
    }
  }, [services]);

  const toggleService = (service: Service) => {
    setState((prev) => {
      const isSelected = prev.services.some((s) => s.id === service.id);
      if (isSelected) {
        return { ...prev, services: prev.services.filter((s) => s.id !== service.id) };
      } else {
        return { ...prev, services: [...prev.services, service] };
      }
    });
  };

  const categories = useMemo(() => {
    const presentCats = new Set(services.map((s) => s.category).filter(Boolean));
    const ordered = (CATALOGUE_CATEGORIES as readonly string[]).filter((c) => presentCats.has(c));
    const extras = Array.from(presentCats).filter((c) => !(CATALOGUE_CATEGORIES as readonly string[]).includes(c));
    const list = ["All", ...ordered, ...extras];
    if (selectedCategory && !list.includes(selectedCategory)) {
      return ["All", selectedCategory, ...ordered, ...extras];
    }
    return list;
  }, [services, selectedCategory]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      let matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
      if (!matchesCategory) {
        if (selectedCategory === "Haircuts & Grooming" || selectedCategory === "Haircuts and Grooming") {
          matchesCategory = s.category === "Female Haircut" || s.category === "Male Haircut & Grooming";
        } else if (selectedCategory === "Hair Spa & Treatments" || selectedCategory === "Hair Spa and Treatments") {
          matchesCategory = s.category === "Hair Spa" || s.category === "Treatment" || s.category === "Other Hair & Skin Treatments";
        } else if (selectedCategory === "Skin Care") {
          matchesCategory = s.category === "Facial" || s.category === "Clean Up" || s.category === "D-Tan" || s.category === "Machine Treatment";
        } else if (selectedCategory === "Waxing") {
          matchesCategory = s.category === "Wax";
        } else if (selectedCategory === "Hand and Feet" || selectedCategory === "Hand & Feet Care") {
          matchesCategory = s.category === "Hand & Feet";
        }
      }

      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const totalPrice = state.services.reduce((acc, s) => acc + (s.price || 0), 0);
  const totalMins = state.services.reduce((acc, s) => acc + (s.durationMin || s.durationMinutes || 30), 0);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#E8E2D8] pb-3">
        <div>
          <h2 className="font-heading text-lg sm:text-2xl font-bold text-[#222220]">
            Select Services
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5B56] mt-0.5">
            Choose one or more treatments for your salon visit.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E6D38]" />
          <Input
            placeholder="Search treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 sm:h-10 pl-8 text-xs sm:text-sm bg-white border-[#E8E2D8] text-[#222220] placeholder:text-[#8E8D88] rounded-sm focus-visible:ring-[#8E6D38]"
          />
        </div>
      </div>

      {/* Category Chips: Responsive Wrapping on Mobile & Desktop */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full sm:rounded-sm transition-all text-center cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#222220] text-white shadow-xs"
                : "bg-white text-[#5C5B56] hover:text-[#222220] hover:bg-[#FAF8F5] border border-[#E8E2D8]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scrollable Service List */}
      <div className="max-h-[440px] sm:max-h-[520px] overflow-y-auto pr-1 space-y-2 border border-[#E8E2D8] rounded-sm p-2 sm:p-2.5 bg-[#FAF8F5]">
        {filteredServices.length === 0 ? (
          <div className="py-12 text-center text-xs sm:text-sm text-[#5C5B56]">
            No treatments found matching your criteria.
          </div>
        ) : (
          filteredServices.map((service) => {
            const isSelected = state.services.some((s) => s.id === service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-sm border transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? "border-[#222220] bg-white shadow-xs ring-1 ring-[#222220]"
                    : "border-[#E8E2D8] bg-white hover:border-[#8E6D38]/60 hover:bg-white"
                }`}
              >
                {/* Selection Checkbox */}
                <div
                  className={`h-5 w-5 rounded-xs border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "bg-[#222220] border-[#222220] text-white"
                      : "border-[#C5BCB0] bg-white text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  {/* Category & Variant Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5EFEB] text-[#5C5B56] border border-[#E8E2D8]">
                      {service.category || "Treatment"}
                    </span>
                    {service.variant && (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          service.variant === "Male"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-pink-50 text-pink-700 border border-pink-200"
                        }`}
                      >
                        {service.variant}
                      </span>
                    )}
                  </div>

                  {/* Two-Column Responsive Name & Price */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-3">
                    <h3 className="font-heading text-base sm:text-lg font-semibold text-[#222220] leading-snug break-words">
                      {service.name}
                    </h3>
                    <div className="font-heading text-base sm:text-lg font-bold text-[#222220] shrink-0 text-left sm:text-right">
                      {formatPrice(service.price)}
                    </div>
                  </div>

                  {/* Secondary Metadata: Duration */}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#5C5B56] font-medium">
                    <Clock className="h-3.5 w-3.5 text-[#8E6D38] shrink-0" />
                    <span>{service.durationMin || service.durationMinutes || 30} mins</span>
                    {service.description && (
                      <>
                        <span className="text-[#C5BCB0]">•</span>
                        <span className="text-xs text-[#74695E] line-clamp-1 font-normal">
                          {service.description}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selected Items Bar & Step Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-[#E8E2D8]">
        <div className="text-xs sm:text-sm text-[#5C5B56]">
          {state.services.length > 0 ? (
            <span className="font-semibold text-[#222220]">
              {state.services.length} selected ({formatPrice(totalPrice)} · {totalMins} mins)
            </span>
          ) : (
            <span>Please select at least one treatment</span>
          )}
        </div>

        <Button
          onClick={onNext}
          disabled={state.services.length === 0}
          className="hidden lg:inline-flex bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs sm:text-sm font-semibold rounded-sm h-10 sm:h-11 px-5 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Continue to Stylist</span>
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
