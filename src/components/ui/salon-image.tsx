"use client";

import React, { useState } from "react";
import { ImageOff } from "lucide-react";

interface SalonImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  aspectRatio?: string;
  sizes?: string;
  fallbackText?: string;
  style?: React.CSSProperties;
}

function getWebpSources(src: string): { webpSrc: string; srcset?: string } | null {
  if (!src) return null;

  if (src.includes("haircut-grooming")) {
    return { webpSrc: "/images/haircut-grooming.webp" };
  }
  if (src.includes("mens-grooming")) {
    return { webpSrc: "/images/mens-grooming.webp" };
  }
  if (src.includes("hair-spa") || src.includes("hair-ritual")) {
    return { webpSrc: "/images/hair-spa.webp" };
  }
  if (src.includes("facial-skincare") || src.includes("facial-ritual")) {
    return { webpSrc: "/images/facial-skincare.webp" };
  }
  if (src.includes("hair-colour") || src.includes("balayage-styling")) {
    return { webpSrc: "/images/hair-colour.webp" };
  }
  if (src.includes("manicure-nailcare")) {
    return { webpSrc: "/images/manicure-nailcare.webp" };
  }
  if (src.includes("About-Us") || src.includes("hero-salon")) {
    return { webpSrc: "/images/About-Us.png" };
  }

  return null;
}

export function SalonImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  priority = false,
  aspectRatio,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fallbackText,
  style,
}: SalonImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const webpInfo = getWebpSources(src);

  return (
    <div
      className={`relative overflow-hidden bg-[#F0EFEB] ${containerClassName}`}
      style={{
        aspectRatio: aspectRatio,
        ...style,
      }}
    >
      {/* Neutral placeholder shimmer while loading */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-[#ECEAE4] animate-pulse"
          aria-hidden="true"
        />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-[#F5EFEB] text-[#666660]">
          <ImageOff className="w-6 h-6 mb-1 text-[#A67C38] opacity-70" />
          <span className="text-xs font-medium">{fallbackText || alt || "Salon Photo"}</span>
        </div>
      ) : (
        <picture>
          {webpInfo && (
            <source
              type="image/webp"
              srcSet={webpInfo.srcset || webpInfo.webpSrc}
              sizes={sizes}
            />
          )}
          <img
            src={webpInfo ? webpInfo.webpSrc : src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding={priority ? "sync" : "async"}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
              isLoaded ? "opacity-100" : "opacity-0"
            } ${className}`}
          />
        </picture>
      )}
    </div>
  );
}
