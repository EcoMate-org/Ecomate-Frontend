interface DashboardStatsProps {
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
}