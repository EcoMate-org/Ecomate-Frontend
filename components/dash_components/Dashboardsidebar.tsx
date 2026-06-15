import QuickStatsCard from "./Quickstatscard";
import ImpactThisMonthCard from "./Impactthismonthcard";
import FeaturedPartnersCard from "./Featuredpartnerscard";
import type { DashboardStatsResponse } from "../../lib/useDashboardStats";

interface DashboardSidebarProps {
  data: DashboardStatsResponse | null;
  loading: boolean;
}

export default function DashboardSidebar({ data, loading }: DashboardSidebarProps) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 lg:flex">
      <QuickStatsCard
        totalItemsRecycled={data?.platform.totalItemsRecycled ?? 0}
        activeUsers={data?.platform.activeUsers ?? 0}
        partnerCompanies={data?.platform.partnerCompanies ?? 0}
        loading={loading}
      />
      <ImpactThisMonthCard
        impactThisMonth={data?.impactThisMonth ?? []}
        loading={loading}
      />
      <FeaturedPartnersCard
        partners={data?.featuredPartners ?? []}
        loading={loading}
      />
    </aside>
  );
}