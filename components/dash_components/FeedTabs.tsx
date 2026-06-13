"use client";

const TABS = ["Community", "Marketplace", "Challenges"] as const;
export type FeedTab = (typeof TABS)[number];

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <div className="flex border-b border-white/7 bg-black/10 px-4">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 ${
            active === tab
              ? "border-ecomate-500 text-ecomate-500"
              : "border-transparent text-white/40 hover:text-white/60"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}