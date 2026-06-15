import Image from "next/image";
import { Users, BadgeCheck } from "lucide-react";

interface FeaturedPartner {
  id: string;
  companyName: string | null;
  role: string;
  bio: string | null;
  companyAddress: string | null;
  imageFile: string | null;
}

interface FeaturedPartnersCardProps {
  partners: FeaturedPartner[];
  loading?: boolean;
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  NGO: "bg-blue-500/15 text-blue-400",
  COMPANY: "bg-purple-500/15 text-purple-400",
};

export default function FeaturedPartnersCard({
  partners,
  loading,
}: FeaturedPartnersCardProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Users size={16} className="text-ecomate-400" />
        <h3 className="text-sm font-semibold text-white">Featured Partners</h3>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <p className="text-xs text-white/40">No featured partners yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/6 bg-white/3 p-4 text-center"
            >
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
                {partner.imageFile ? (
                  <Image
                    src={partner.imageFile}
                    alt={partner.companyName ?? "Partner"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-sm font-semibold text-ecomate-500">
                    {(partner.companyName ?? "??").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white">
                  {partner.companyName}
                </span>
                <BadgeCheck size={14} className="text-blue-400" />
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE_STYLES[partner.role] ?? "bg-white/10 text-white/60"}`}
              >
                {partner.role}
              </span>

              {partner.bio && (
                <p className="text-[11px] leading-relaxed text-white/45">
                  {partner.bio}
                </p>
              )}

              {partner.companyAddress && (
                <p className="text-[11px] text-white/35">
                  📍 {partner.companyAddress}
                </p>
              )}

              <button
                type="button"
                className="mt-1 w-full rounded-lg border border-white/10 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/8"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}