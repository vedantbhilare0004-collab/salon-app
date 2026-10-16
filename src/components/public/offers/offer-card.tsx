"use client";

import Link from "next/link";
import Image from "next/image";
import { Offer, OfferDesignSettings } from "@/lib/types";
import { formatPrice, formatDate } from "@/lib/format";
import {
  Sparkles,
  Scissors,
  Tag,
  Crown,
  Heart,
  Gift,
  Flame,
  Star,
  Sun,
  Gem,
  ShieldCheck,
  CalendarDays,
  ArrowRight,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Sparkles,
  Scissors,
  Tag,
  Crown,
  Heart,
  Gift,
  Flame,
  Star,
  Sun,
  Gem,
  ShieldCheck,
};

interface OfferCardProps {
  offer: Offer;
  className?: string;
  isOwnerPreview?: boolean;
}

export function OfferCard({ offer, className = "", isOwnerPreview = false }: OfferCardProps) {
  const preset = offer.preset || "editorial";
  const design = offer.design || {};

  const finalPrice = offer.price;
  const originalPrice = offer.originalPrice;
  const hasSavings = originalPrice && finalPrice && originalPrice > finalPrice;
  const savingsAmount = hasSavings ? originalPrice - finalPrice : 0;
  const savingsPercent = hasSavings ? Math.round((savingsAmount / originalPrice) * 100) : 0;

  const detailUrl = `/offers/${offer.id}`;
  const bookUrl = `/book?offerId=${offer.id}`;

  // Custom Icon Resolution
  const CustomIcon = design.iconName && ICON_MAP[design.iconName] ? ICON_MAP[design.iconName] : null;

  // Dynamic Style Mappings
  const headingFontFamily = design.headingFont ? { fontFamily: design.headingFont } : undefined;
  const bodyFontFamily = design.bodyFont ? { fontFamily: design.bodyFont } : undefined;

  const headingSizeClass =
    design.headingSize === "sm"
      ? "text-base sm:text-lg"
      : design.headingSize === "md"
      ? "text-lg sm:text-xl"
      : design.headingSize === "lg"
      ? "text-xl sm:text-2xl"
      : design.headingSize === "xl"
      ? "text-2xl sm:text-3xl"
      : design.headingSize === "2xl"
      ? "text-3xl sm:text-4xl"
      : "text-xl sm:text-2xl";

  const priceSizeClass =
    design.priceSize === "md"
      ? "text-xl"
      : design.priceSize === "lg"
      ? "text-2xl"
      : design.priceSize === "xl"
      ? "text-2xl sm:text-3xl"
      : design.priceSize === "2xl"
      ? "text-3xl sm:text-4xl"
      : "text-2xl sm:text-3xl";

  const borderRadiusClass =
    design.borderRadius === "none"
      ? "rounded-none"
      : design.borderRadius === "xs"
      ? "rounded-xs"
      : design.borderRadius === "md"
      ? "rounded-md"
      : design.borderRadius === "lg"
      ? "rounded-xl"
      : "rounded-sm";

  const borderWidthClass =
    design.borderWidth === "none"
      ? "border-0"
      : design.borderWidth === "2px"
      ? "border-2"
      : design.borderWidth === "3px"
      ? "border-4"
      : "border";

  const shadowClass =
    design.shadow === "none"
      ? "shadow-none"
      : design.shadow === "sm"
      ? "shadow-xs"
      : design.shadow === "md"
      ? "shadow-md"
      : design.shadow === "lg"
      ? "shadow-xl"
      : design.shadow === "gold"
      ? "shadow-[0_4px_20px_-2px_rgba(198,161,102,0.35)]"
      : "shadow-xs";

  const paddingClass =
    design.padding === "compact"
      ? "p-4 sm:p-5"
      : design.padding === "spacious"
      ? "p-7 sm:p-8"
      : "p-5 sm:p-6";

  const cardStyle: React.CSSProperties = {
    backgroundColor: design.cardBg || undefined,
    borderColor: design.borderColor || undefined,
  };

  const headingStyle: React.CSSProperties = {
    color: design.headingColor || undefined,
    ...headingFontFamily,
  };

  const bodyStyle: React.CSSProperties = {
    color: design.bodyColor || undefined,
    ...bodyFontFamily,
  };

  const priceStyle: React.CSSProperties = {
    color: design.priceColor || undefined,
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: design.badgeBg || undefined,
    color: design.badgeColor || undefined,
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: design.buttonBg || undefined,
    color: design.buttonColor || undefined,
  };

  // Image Aspect Ratio Height Class
  const imageAspectClass =
    design.aspectRatio === "16:9"
      ? "aspect-video"
      : design.aspectRatio === "1:1"
      ? "aspect-square"
      : design.aspectRatio === "3:4"
      ? "aspect-[3/4]"
      : "h-44 sm:h-48";

  // 1. EDITORIAL OFFER PRESET
  if (preset === "editorial") {
    return (
      <div
        style={cardStyle}
        className={`group bg-white border border-[#E8E2D8] hover:border-[#C6A166] transition-all duration-300 ${borderRadiusClass} ${borderWidthClass} ${shadowClass} flex flex-col justify-between overflow-hidden ${className}`}
      >
        <div>
          {/* Optional Compact Artwork */}
          {offer.imageUrl && (
            <div className={`relative w-full ${imageAspectClass} overflow-hidden bg-[#FAF8F5]`}>
              <Image
                src={offer.imageUrl}
                alt={offer.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              {offer.category && (
                <span
                  style={badgeStyle}
                  className="absolute top-3 left-3 bg-[#222220]/90 backdrop-blur-xs text-[#FAF8F5] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-xs"
                >
                  {offer.category}
                </span>
              )}
              {hasSavings && (
                <span className="absolute bottom-3 right-3 bg-[#8E6D38] text-white text-[11px] font-semibold px-2 py-0.5 rounded-xs tracking-wider">
                  Save {formatPrice(savingsAmount)}
                </span>
              )}
            </div>
          )}

          <div className={`${paddingClass} space-y-3.5`}>
            {!offer.imageUrl && offer.category && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#8E6D38] flex items-center gap-1.5">
                  {CustomIcon ? <CustomIcon className="h-3.5 w-3.5" /> : null}
                  <span>{offer.category}</span>
                </span>
                {offer.badge && (
                  <span
                    style={badgeStyle}
                    className="text-xs font-semibold px-2 py-0.5 bg-[#FAF5EE] text-[#8E6D38] border border-[#E8DFC8] rounded-xs"
                  >
                    {offer.badge}
                  </span>
                )}
              </div>
            )}

            <div>
              <h3
                style={headingStyle}
                className={`font-heading ${headingSizeClass} font-bold text-[#222220] leading-snug group-hover:text-[#8E6D38] transition-colors break-words`}
              >
                {offer.title}
              </h3>
              {offer.description && (
                <p
                  style={bodyStyle}
                  className="text-xs sm:text-sm text-[#5C5B56] mt-2 line-clamp-2 leading-relaxed"
                >
                  {offer.description}
                </p>
              )}
            </div>

            {/* Inclusions / Highlights */}
            {((offer.includedServices && offer.includedServices.length > 0) ||
              (offer.features && offer.features.length > 0)) && (
              <div className="pt-2 space-y-1.5 border-t border-[#F2ECE4]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#74695E]">
                  Included In Experience
                </div>
                <div className="space-y-1">
                  {(offer.includedServices || offer.features || []).slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#444440]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8E6D38] shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action Section */}
        <div className={`${paddingClass} pt-0 space-y-4`}>
          <div className="pt-3 border-t border-[#E8E2D8] flex items-baseline justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#74695E]">
                Special Rate
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  style={priceStyle}
                  className={`font-heading ${priceSizeClass} font-bold text-[#222220]`}
                >
                  {finalPrice !== undefined ? formatPrice(finalPrice) : (offer.badge || "Offer")}
                </span>
                {hasSavings && (
                  <span className="text-xs text-[#74695E] line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {offer.endsAt && (
              <div className="text-right text-[11px] text-[#74695E]">
                <span>Valid till</span>
                <div className="font-medium text-[#222220]">{formatDate(offer.endsAt)}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {isOwnerPreview ? (
              <>
                <Button variant="outline" size="sm" className="w-full text-xs border-[#D8C7B0] text-[#222220]">
                  View Details
                </Button>
                <Button
                  size="sm"
                  style={buttonStyle}
                  className="w-full bg-[#222220] text-white text-xs"
                >
                  Book Offer
                </Button>
              </>
            ) : (
              <>
                <Link href={detailUrl} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] rounded-xs h-9 cursor-pointer"
                  >
                    View Details
                  </Button>
                </Link>
                <Link href={bookUrl} className="w-full">
                  <Button
                    size="sm"
                    style={buttonStyle}
                    className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold rounded-xs h-9 cursor-pointer shadow-xs gap-1"
                  >
                    <span>Book Offer</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. FESTIVE FEATURE PRESET
  if (preset === "festive") {
    return (
      <div
        style={cardStyle}
        className={`group bg-[#FAF6F0] border-2 border-[#D8C7B0] hover:border-[#8E6D38] transition-all duration-300 ${borderRadiusClass} ${borderWidthClass} ${shadowClass} flex flex-col justify-between overflow-hidden ${className}`}
      >
        <div>
          {/* Festive Top Header with motif */}
          <div className="bg-[#222220] text-[#FAF8F5] px-5 py-2.5 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E8DFC8] flex items-center gap-1.5">
              {CustomIcon ? <CustomIcon className="h-3 w-3 text-[#C6A166]" /> : <Sparkles className="h-3 w-3 text-[#C6A166]" />}
              <span>{offer.campaignName || "FESTIVE EDITION"}</span>
            </span>
            {hasSavings && (
              <span style={badgeStyle} className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#8E6D38] text-white">
                {savingsPercent}% OFF
              </span>
            )}
          </div>

          {offer.imageUrl && (
            <div className={`relative w-full ${imageAspectClass} overflow-hidden bg-[#222220]`}>
              <Image
                src={offer.imageUrl}
                alt={offer.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {offer.category && (
                <span className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-xs text-[#222220] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs">
                  {offer.category}
                </span>
              )}
            </div>
          )}

          <div className={`${paddingClass} space-y-3`}>
            <h3
              style={headingStyle}
              className={`font-heading ${headingSizeClass} font-bold text-[#222220] leading-snug break-words`}
            >
              {offer.title}
            </h3>
            {offer.description && (
              <p
                style={bodyStyle}
                className="text-xs sm:text-sm text-[#5C5B56] leading-relaxed line-clamp-2"
              >
                {offer.description}
              </p>
            )}

            {/* Inclusions and Complimentary Gift */}
            <div className="space-y-1.5 pt-2">
              {offer.complimentaryServices && offer.complimentaryServices.length > 0 && (
                <div className="px-3 py-1.5 rounded-xs bg-[#FAF5EE] border border-[#E8DFC8] text-[11px] font-semibold text-[#8E6D38] flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#A27C48] shrink-0" />
                  <span className="truncate">Includes: {offer.complimentaryServices.join(", ")} (Gift)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${paddingClass} pt-0 space-y-4`}>
          <div className="pt-3 border-t border-[#E8DFC8] flex items-baseline justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#74695E]">
                Festive Package Price
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  style={priceStyle}
                  className={`font-heading ${priceSizeClass} font-bold text-[#8E6D38]`}
                >
                  {finalPrice !== undefined ? formatPrice(finalPrice) : (offer.badge || "Special")}
                </span>
                {hasSavings && (
                  <span className="text-xs text-[#74695E] line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {offer.endsAt && (
              <div className="text-right text-[11px] text-[#74695E]">
                <span>Limited period</span>
                <div className="font-semibold text-[#8E6D38]">{formatDate(offer.endsAt)}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {isOwnerPreview ? (
              <>
                <Button variant="outline" size="sm" className="w-full text-xs border-[#D8C7B0] text-[#222220]">
                  Details
                </Button>
                <Button
                  size="sm"
                  style={buttonStyle}
                  className="w-full bg-[#8E6D38] text-white text-xs"
                >
                  Book Festive
                </Button>
              </>
            ) : (
              <>
                <Link href={detailUrl} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold border-[#D8C7B0] text-[#222220] hover:bg-white rounded-xs h-9 cursor-pointer"
                  >
                    View Details
                  </Button>
                </Link>
                <Link href={bookUrl} className="w-full">
                  <Button
                    size="sm"
                    style={buttonStyle}
                    className="w-full bg-[#8E6D38] hover:bg-[#785C2F] text-[#FAF8F5] text-xs font-semibold rounded-xs h-9 cursor-pointer shadow-xs gap-1"
                  >
                    <span>Book Festive</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. PREMIUM PACKAGE PRESET
  if (preset === "package") {
    return (
      <div
        style={cardStyle}
        className={`group bg-white border border-[#E8E2D8] hover:border-[#8E6D38] transition-all duration-300 ${borderRadiusClass} ${borderWidthClass} ${shadowClass} flex flex-col justify-between overflow-hidden ${className}`}
      >
        <div>
          {offer.imageUrl && (
            <div className={`relative w-full ${imageAspectClass} overflow-hidden bg-[#FAF8F5]`}>
              <Image
                src={offer.imageUrl}
                alt={offer.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#222220]/80 via-[#222220]/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-[#E8DFC8] bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-xs mb-1">
                  Complete Salon Package
                </span>
                <h3
                  style={headingStyle}
                  className="font-heading text-lg sm:text-xl font-bold text-white leading-snug line-clamp-1 break-words"
                >
                  {offer.title}
                </h3>
              </div>
            </div>
          )}

          <div className={`${paddingClass} space-y-3.5`}>
            {!offer.imageUrl && (
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#8E6D38] block mb-1">
                  Complete Salon Package
                </span>
                <h3
                  style={headingStyle}
                  className={`font-heading ${headingSizeClass} font-bold text-[#222220] leading-snug break-words`}
                >
                  {offer.title}
                </h3>
              </div>
            )}

            {offer.description && (
              <p
                style={bodyStyle}
                className="text-xs sm:text-sm text-[#5C5B56] leading-relaxed line-clamp-2"
              >
                {offer.description}
              </p>
            )}

            {/* Inclusions List with checkmarks */}
            {((offer.includedServices && offer.includedServices.length > 0) ||
              (offer.features && offer.features.length > 0)) && (
              <div className="p-3 bg-[#FAF8F5] rounded-xs border border-[#E8E2D8] space-y-1.5">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#74695E]">
                  Included Treatments ({((offer.includedServices || offer.features || []).length)})
                </div>
                <div className="space-y-1">
                  {(offer.includedServices || offer.features || []).map((svc, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-[#222220]">
                      <Check className="h-3.5 w-3.5 text-[#8E6D38] shrink-0" />
                      <span className="truncate">{svc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`${paddingClass} pt-0 space-y-4`}>
          <div className="pt-3 border-t border-[#E8E2D8] flex items-baseline justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#74695E]">
                Package Rate
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  style={priceStyle}
                  className={`font-heading ${priceSizeClass} font-bold text-[#222220]`}
                >
                  {finalPrice !== undefined ? formatPrice(finalPrice) : (offer.badge || "Package")}
                </span>
                {hasSavings && (
                  <span className="text-xs text-[#74695E] line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {hasSavings && (
              <span
                style={badgeStyle}
                className="text-xs font-semibold px-2 py-0.5 rounded-xs bg-[#FAF5EE] text-[#8E6D38] border border-[#E8DFC8]"
              >
                Save {formatPrice(savingsAmount)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {isOwnerPreview ? (
              <>
                <Button variant="outline" size="sm" className="w-full text-xs border-[#D8C7B0] text-[#222220]">
                  View Details
                </Button>
                <Button
                  size="sm"
                  style={buttonStyle}
                  className="w-full bg-[#222220] text-white text-xs"
                >
                  Book Package
                </Button>
              </>
            ) : (
              <>
                <Link href={detailUrl} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] rounded-xs h-9 cursor-pointer"
                  >
                    View Details
                  </Button>
                </Link>
                <Link href={bookUrl} className="w-full">
                  <Button
                    size="sm"
                    style={buttonStyle}
                    className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold rounded-xs h-9 cursor-pointer shadow-xs gap-1"
                  >
                    <span>Book Package</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. MINIMAL OFFER PRESET
  if (preset === "minimal") {
    return (
      <div
        style={cardStyle}
        className={`group bg-white border border-[#E8E2D8] hover:border-[#222220] transition-all duration-300 ${borderRadiusClass} ${borderWidthClass} ${shadowClass} ${paddingClass} flex flex-col justify-between ${className}`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#74695E] flex items-center gap-1.5">
              {CustomIcon ? <CustomIcon className="h-3 w-3" /> : null}
              <span>{offer.category || "Special Offer"}</span>
            </span>
            {offer.code && (
              <span className="font-mono text-[11px] font-bold text-[#222220] bg-[#FAF8F5] border border-[#E8E2D8] px-2 py-0.5 rounded-xs">
                {offer.code}
              </span>
            )}
          </div>

          <div>
            <h3
              style={headingStyle}
              className={`font-heading ${headingSizeClass} font-bold text-[#222220] leading-snug break-words`}
            >
              {offer.title}
            </h3>
            {offer.description && (
              <p
                style={bodyStyle}
                className="text-xs sm:text-sm text-[#5C5B56] mt-1.5 line-clamp-2 leading-relaxed"
              >
                {offer.description}
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 mt-3 border-t border-[#F2ECE4] space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span
                style={priceStyle}
                className={`font-heading ${priceSizeClass} font-bold text-[#222220]`}
              >
                {finalPrice !== undefined ? formatPrice(finalPrice) : (offer.badge || "Special")}
              </span>
              {hasSavings && (
                <span className="text-xs text-[#74695E] line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            {hasSavings && (
              <span style={badgeStyle} className="text-[11px] font-semibold text-[#8E6D38]">
                Save {savingsPercent}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {isOwnerPreview ? (
              <>
                <Button variant="outline" size="sm" className="w-full text-xs border-[#D8C7B0] text-[#222220]">
                  Details
                </Button>
                <Button
                  size="sm"
                  style={buttonStyle}
                  className="w-full bg-[#222220] text-white text-xs"
                >
                  Book
                </Button>
              </>
            ) : (
              <>
                <Link href={detailUrl} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-medium border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] rounded-xs h-8 cursor-pointer"
                  >
                    Details
                  </Button>
                </Link>
                <Link href={bookUrl} className="w-full">
                  <Button
                    size="sm"
                    style={buttonStyle}
                    className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold rounded-xs h-8 cursor-pointer"
                  >
                    Book Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 5. SEASONAL COLLECTION PRESET (DEFAULT FALLBACK)
  return (
    <div
      style={cardStyle}
      className={`group bg-white border border-[#E8E2D8] hover:border-[#8E6D38] transition-all duration-300 ${borderRadiusClass} ${borderWidthClass} ${shadowClass} flex flex-col justify-between overflow-hidden ${className}`}
    >
      <div>
        {offer.imageUrl && (
          <div className={`relative w-full ${imageAspectClass} overflow-hidden bg-[#FAF8F5]`}>
            <Image
              src={offer.imageUrl}
              alt={offer.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span
              style={badgeStyle}
              className="absolute top-3 left-3 bg-[#8E6D38] text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-xs"
            >
              {offer.campaignName || "Seasonal Offer"}
            </span>
          </div>
        )}

        <div className={`${paddingClass} space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8E6D38] flex items-center gap-1.5">
              {CustomIcon ? <CustomIcon className="h-3.5 w-3.5" /> : null}
              <span>{offer.category || "Seasonal Promotion"}</span>
            </span>
            {hasSavings && (
              <span className="text-xs font-semibold text-[#8E6D38]">
                Save {formatPrice(savingsAmount)}
              </span>
            )}
          </div>

          <h3
            style={headingStyle}
            className={`font-heading ${headingSizeClass} font-bold text-[#222220] leading-snug break-words`}
          >
            {offer.title}
          </h3>

          {offer.description && (
            <p
              style={bodyStyle}
              className="text-xs sm:text-sm text-[#5C5B56] leading-relaxed line-clamp-2"
            >
              {offer.description}
            </p>
          )}

          {offer.includedServices && offer.includedServices.length > 0 && (
            <div className="pt-2 text-xs text-[#5C5B56] space-y-1">
              {offer.includedServices.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-[#8E6D38]" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`${paddingClass} pt-0 space-y-4`}>
        <div className="pt-3 border-t border-[#E8E2D8] flex items-baseline justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-[#74695E]">
              Offer Rate
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                style={priceStyle}
                className={`font-heading ${priceSizeClass} font-bold text-[#222220]`}
              >
                {finalPrice !== undefined ? formatPrice(finalPrice) : (offer.badge || "Special")}
              </span>
              {hasSavings && (
                <span className="text-xs text-[#74695E] line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {offer.endsAt && (
            <div className="text-right text-[11px] text-[#74695E]">
              <span>Valid till</span>
              <div className="font-medium text-[#222220]">{formatDate(offer.endsAt)}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {isOwnerPreview ? (
            <>
              <Button variant="outline" size="sm" className="w-full text-xs border-[#D8C7B0] text-[#222220]">
                Details
              </Button>
              <Button
                size="sm"
                style={buttonStyle}
                className="w-full bg-[#222220] text-white text-xs"
              >
                Book
              </Button>
            </>
          ) : (
            <>
              <Link href={detailUrl} className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold border-[#D8C7B0] text-[#222220] hover:bg-[#FAF8F5] rounded-xs h-9 cursor-pointer"
                >
                  View Details
                </Button>
              </Link>
              <Link href={bookUrl} className="w-full">
                <Button
                  size="sm"
                  style={buttonStyle}
                  className="w-full bg-[#222220] hover:bg-black text-[#FAF8F5] text-xs font-semibold rounded-xs h-9 cursor-pointer shadow-xs gap-1"
                >
                  <span>Book Now</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
