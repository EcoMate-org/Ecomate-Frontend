/*interface DashboardStatsProps {
  itemsRecycled: number;
  totalWeightKg: number;
  co2SavedKg: number;
}

export default function DashboardStats({
  itemsRecycled,
  totalWeightKg,
  co2SavedKg,
}: DashboardStatsProps) {
  const stats = [
    { label: "Items Recycled", value: itemsRecycled.toString() },
    { label: "Total Weight", value: `${totalWeightKg} kg` },
    { label: "CO₂ Saved", value: `${co2SavedKg} kg` },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 border-b border-white/6 bg-black/20 px-3 py-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center rounded-xl bg-white/5 px-2 py-2.5 text-center"
        >
          <span className="text-base font-semibold leading-none text-ecomate-500">
            {s.value}
          </span>
          <span className="mt-1 text-[10px] leading-tight text-white/40">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}*/

interface DashboardStatsProps {
  itemsRecycled: number;
  totalWeightKg: number;
  co2SavedKg: number;
  balance: number;
  communityRankPercent: number | null;
  loading?: boolean;
}

export default function DashboardStats({
  itemsRecycled,
  totalWeightKg,
  co2SavedKg,
  balance,
  communityRankPercent,
  loading,
}: DashboardStatsProps) {
  const stats = [
    { label: "Items Recycled", value: itemsRecycled.toLocaleString() },
    { label: "Total Weight", value: `${totalWeightKg.toLocaleString()} kg` },
    { label: "CO₂ Saved", value: `${co2SavedKg.toLocaleString()} kg` },
    {
      label: "Balance",
      value: `₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      label: "Community Rank",
      value: communityRankPercent !== null ? `Top ${communityRankPercent}%` : "Unranked",
    },
  ];

  return (
    <div className="border-b border-white/6 bg-black/20 px-4 py-6 sm:px-6 sm:py-8">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/40">
        Your Impact
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center rounded-2xl bg-white/5 px-4 py-6 text-center sm:px-6 sm:py-8"
          >
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-white/10" />
            ) : (
              <span className="text-2xl font-bold leading-none text-ecomate-500 sm:text-3xl">
                {s.value}
              </span>
            )}
            <span className="mt-2 text-xs leading-tight text-white/45 sm:text-sm">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}