import { TrendingUp } from "lucide-react";
import type { MaterialType } from "../../../generated/prisma/client";

interface ImpactThisMonthCardProps {
  impactThisMonth: { material: MaterialType; weightKg: number }[];
  loading?: boolean;
}

/** Bar colors per material — matches the existing WasteStatsChart palette */
const MATERIAL_COLORS: Record<MaterialType, string> = {
  PLASTIC: "bg-blue-500",
  GLASS: "bg-ecomate-500",
  METAL: "bg-orange-500",
  E_WASTE: "bg-purple-500",
  RUBBER: "bg-yellow-500",
};

const MATERIAL_LABELS: Record<MaterialType, string> = {
  PLASTIC: "Plastic",
  GLASS: "Glass",
  METAL: "Metal",
  E_WASTE: "E-Waste",
  RUBBER: "Rubber",
};

export default function ImpactThisMonthCard({
  impactThisMonth,
  loading,
}: ImpactThisMonthCardProps) {
  const maxWeight = Math.max(...impactThisMonth.map((i) => i.weightKg), 1);

  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp size={16} className="text-ecomate-400" />
        <h3 className="text-sm font-semibold text-white">Impact This Month</h3>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
              <div className="h-2 w-full animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      ) : impactThisMonth.length === 0 ? (
        <p className="text-xs text-white/40">No recycling activity yet this month.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {impactThisMonth.map((item) => (
            <div key={item.material}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-white/55">
                  {MATERIAL_LABELS[item.material]}
                </span>
                <span className="text-xs font-semibold text-white">
                  {item.weightKg} kg
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/8">
                <div
                  className={`h-1.5 rounded-full ${MATERIAL_COLORS[item.material]}`}
                  style={{ width: `${(item.weightKg / maxWeight) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}