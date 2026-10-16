import React from "react";

export default function OwnerLoading() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Luxury Banner Loader */}
      <div className="relative overflow-hidden rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] p-6 shadow-xs">
        {/* Shimmer line across top */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent animate-pulse" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Spinning Gold Monogram Emblem */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-[#A27C48] text-[#FFFDFA] font-bold shadow-xs shrink-0">
              <span className="text-sm font-semibold tracking-wider">G&amp;G</span>
              {/* Spinning outer gold ring */}
              <div className="absolute -inset-1 rounded-xl border-2 border-dashed border-[#A27C48]/40 animate-spin" style={{ animationDuration: "3s" }} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-[#302A24] tracking-tight">
                  Glow &amp; Glamour Operations
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0EBE3] text-[#A27C48] border border-[#E9E1D6]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A27C48] animate-ping" />
                  Synchronizing
                </span>
              </div>
              <p className="text-xs text-[#74695E]">
                Loading salon management workspace and live data records...
              </p>
            </div>
          </div>

          {/* Minimalist Progress Indicator */}
          <div className="w-full sm:w-48 space-y-1.5">
            <div className="h-1.5 w-full bg-[#F0EBE3] rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-[#A27C48] via-[#E2C392] to-[#A27C48] rounded-full animate-[shimmer_1.5s_infinite]" />
            </div>
            <p className="text-[10px] text-right font-medium text-[#74695E]">
              Rendering interface...
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] p-5 space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-[#F0EBE3] rounded-sm animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-[#F0EBE3] animate-pulse" />
            </div>
            <div className="h-7 w-20 bg-[#F0EBE3] rounded-sm animate-pulse" />
            <div className="h-2.5 w-32 bg-[#F0EBE3] rounded-sm animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Table / Workspace Area Skeleton */}
      <div className="rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E1D6]">
          <div className="h-5 w-40 bg-[#F0EBE3] rounded-sm animate-pulse" />
          <div className="h-8 w-28 bg-[#F0EBE3] rounded-md animate-pulse" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-[#FAF8F5] border border-[#F0EBE3] rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
