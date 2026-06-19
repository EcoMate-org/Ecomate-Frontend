"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { MATERIAL_LABELS } from "../../lib/market/marketTypes";
import type { MarketFilters } from "../../lib/market/useMarketListings";

interface MarketFilterBarProps {
  filters: MarketFilters;
  onChange: (filters: MarketFilters) => void;
}

const MATERIAL_OPTIONS = [
  { value: "ALL", label: "All Materials" },
  { value: "PLASTIC", label: MATERIAL_LABELS.PLASTIC },
  { value: "GLASS", label: MATERIAL_LABELS.GLASS },
  { value: "METAL", label: MATERIAL_LABELS.METAL },
  { value: "E_WASTE", label: MATERIAL_LABELS.E_WASTE },
  { value: "RUBBER", label: MATERIAL_LABELS.RUBBER },
  { value: "ART", label: MATERIAL_LABELS.ART },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Pending" },
  { value: "SOLD", label: "Collected" },
];

export default function MarketFilterBar({ filters, onChange }: MarketFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/4 p-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
        <input
          type="text"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by material or title…"
          className="w-full rounded-xl border border-white/10 bg-white/6 py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-ecomate-500/40"
        />
      </div>

      {/* Material dropdown */}
      <div className="relative">
        <select
          value={filters.material ?? "ALL"}
          onChange={(e) => onChange({ ...filters, material: e.target.value })}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-medium text-white outline-none transition focus:border-ecomate-500/40 sm:w-44"
        >
          {MATERIAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0d2818] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status dropdown */}
      <div className="relative">
        <select
          value={filters.status ?? "ALL"}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-medium text-white outline-none transition focus:border-ecomate-500/40 sm:w-40"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0d2818] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* More filters (placeholder for future use) */}
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10"
      >
        <SlidersHorizontal size={14} />
        More Filters
      </button>
    </div>
  );
}
