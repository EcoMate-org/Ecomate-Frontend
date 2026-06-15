import { Sparkles } from "lucide-react";

interface QuickStatsCardProps {
  totalItemsRecycled: number;
  activeUsers: number;
  partnerCompanies: number;
  loading?: boolean;
}

export default function QuickStatsCard({
  totalItemsRecycled,
  activeUsers,
  partnerCompanies,
  loading,
}: QuickStatsCardProps) {
  const rows = [
    { label: "Total Items Recycled", value: totalItemsRecycled.toLocaleString() },
    { label: "Active Users", value: activeUsers.toLocaleString() },
    { label: "Partner Companies", value: partnerCompanies.toLocaleString() },
  ];

  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-ecomate-400" />
        <h3 className="text-sm font-semibold text-white">Quick Stats</h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-white/55">{row.label}</span>
            {loading ? (
              <div className="h-4 w-10 animate-pulse rounded bg-white/10" />
            ) : (
              <span className="text-sm font-semibold text-ecomate-400">
                {row.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}