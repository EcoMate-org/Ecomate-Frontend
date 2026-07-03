"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ChallengeProofSheet from "./ChallengeProofSheet";
import {
  Trophy,
  Users,
  Clock,
  Target,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ChallengeType = "QUANTITY" | "ACTION" | "COMMUNITY";
type RewardType = "NONE" | "BADGE" | "CERTIFICATE" | "CASH" | "VOUCHER";

interface ChallengeCreator {
  id: string;
  username: string;
  companyName: string | null;
  role: string;
  imageFile: string | null;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  rewardType: RewardType;
  reward: string;
  targetValue: number | null;
  unit: string | null;
  imageUrl: string | null;
  deadline: string;
  status: string;
  createdAt: string;
  creator: ChallengeCreator;
  participantCount: number;
  isJoined: boolean;
  userProgress: number | null;
}

// ── Display maps ──────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ChallengeType, string> = {
  QUANTITY:  "Quantity",
  ACTION:    "Action",
  COMMUNITY: "Community",
};

const TYPE_STYLES: Record<ChallengeType, string> = {
  QUANTITY:  "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  ACTION:    "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  COMMUNITY: "bg-ecomate-500/15 text-ecomate-400 border border-ecomate-500/20",
};

const REWARD_LABELS: Record<RewardType, string> = {
  NONE:        "",
  BADGE:       "🏅 Badge",
  CERTIFICATE: "📜 Certificate",
  CASH:        "💵 Cash",
  VOUCHER:     "🎟 Voucher",
};

const REWARD_STYLES: Record<RewardType, string> = {
  NONE:        "",
  BADGE:       "bg-yellow-500/15 text-yellow-400",
  CERTIFICATE: "bg-blue-500/15 text-blue-400",
  CASH:        "bg-ecomate-500/15 text-ecomate-400",
  VOUCHER:     "bg-purple-500/15 text-purple-400",
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  NGO:     "bg-blue-500/15 text-blue-400",
  COMPANY: "bg-purple-500/15 text-purple-400",
};

// ── Filter tabs ───────────────────────────────────────────────────────────────

type FilterTab = "ALL" | ChallengeType;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "ALL",       label: "All"       },
  { value: "QUANTITY",  label: "Quantity"  },
  { value: "ACTION",    label: "Action"    },
  { value: "COMMUNITY", label: "Community" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function creatorDisplayName(c: ChallengeCreator): string {
  return c.companyName ?? c.username;
}

function creatorInitials(c: ChallengeCreator): string {
  return creatorDisplayName(c).slice(0, 2).toUpperCase();
}

function daysLeft(deadline: string): string {
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs <= 0) return "Ended";
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days === 1 ? "1 day left" : `${days} days left`;
}

// ── Challenge card ────────────────────────────────────────────────────────────

function ChallengeCard({
  challenge,
  onJoin,
  joining,
  onSubmitProof,
}: {
  challenge:     Challenge;
  onJoin:        (id: string) => void;
  joining:       boolean;
  onSubmitProof: (id: string, title: string) => void;
}) {
  const timeLeft = daysLeft(challenge.deadline);
  const ended    = timeLeft === "Ended";

  return (
    <article className="flex flex-col rounded-2xl border border-white/8 bg-white/4 overflow-hidden transition duration-200 hover:border-ecomate-500/25 hover:bg-white/6">

      {/* Type + reward badges */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 pt-4 pb-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[challenge.type]}`}>
          {TYPE_LABELS[challenge.type]}
        </span>
        {challenge.rewardType !== "NONE" && (
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${REWARD_STYLES[challenge.rewardType]}`}>
            {REWARD_LABELS[challenge.rewardType]}
          </span>
        )}
        {ended && (
          <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/40">
            Ended
          </span>
        )}
      </div>

      {/* Title + description */}
      <div className="px-4 pb-3">
        <h3 className="text-sm font-bold leading-snug text-white">
          {challenge.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/55">
          {challenge.description}
        </p>
      </div>

      {/* Target — Quantity challenges only */}
      {challenge.type === "QUANTITY" && challenge.targetValue !== null && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2">
          <Target size={12} className="shrink-0 text-ecomate-400" />
          <span className="text-xs font-semibold text-white">
            Target: {challenge.targetValue.toLocaleString()}{" "}
            {challenge.unit ?? "units"}
          </span>
        </div>
      )}

      {/* Reward text */}
      {challenge.reward && (
        <p className="mx-4 mb-3 text-[11px] text-white/40">
          <span className="font-semibold text-white/60">Reward: </span>
          {challenge.reward}
        </p>
      )}

      {/* Creator */}
      <div className="mx-4 mb-3 flex items-center gap-2">
        <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/10">
          {challenge.creator.imageFile ? (
            <Image
              src={challenge.creator.imageFile}
              alt={creatorDisplayName(challenge.creator)}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-[8px] font-bold text-ecomate-500">
              {creatorInitials(challenge.creator)}
            </span>
          )}
        </div>
        <span className="truncate text-[11px] text-white/50">
          {creatorDisplayName(challenge.creator)}
        </span>
        <span
          className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
            ROLE_BADGE_STYLES[challenge.creator.role] ?? "bg-white/10 text-white/50"
          }`}
        >
          {challenge.creator.role}
        </span>
      </div>

      {/* Stats */}
      <div className="mx-4 mb-3 flex items-center gap-4 text-[11px] text-white/40">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {timeLeft}
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} />
          {challenge.participantCount.toLocaleString()} joined
        </span>
      </div>

      {/* Progress bar — visible once joined */}
      {challenge.isJoined && challenge.userProgress !== null && (
        <div className="mx-4 mb-3">
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="text-white/40">Your progress</span>
            <span className="font-semibold text-ecomate-400">
              {challenge.userProgress}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10">
            <div
              className="h-1.5 rounded-full bg-ecomate-500 transition-all duration-500"
              style={{ width: `${Math.min(challenge.userProgress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto px-4 pb-4 pt-1 flex flex-col gap-2">
        {challenge.isJoined ? (
          <>
            <div className="flex items-center justify-center gap-2 rounded-xl border border-ecomate-500/30 bg-ecomate-500/10 py-2 text-xs font-semibold text-ecomate-400">
              <CheckCircle2 size={13} />
              Joined
            </div>
            {!ended && (
              <button
                type="button"
                onClick={() => onSubmitProof(challenge.id, challenge.title)}
                className="w-full rounded-xl border border-white/15 py-2 text-xs font-medium text-white/60 transition hover:bg-white/8 active:scale-95"
              >
                Submit Proof
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => onJoin(challenge.id)}
            disabled={joining || ended}
            className="w-full rounded-xl bg-ecomate-600 py-2.5 text-xs font-semibold text-white transition hover:bg-ecomate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {joining ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={12} className="animate-spin" />
                Joining…
              </span>
            ) : ended ? (
              "Challenge Ended"
            ) : (
              "Join Challenge"
            )}
          </button>
        )}
      </div>

    </article>
  );
}  // ← ChallengeCard closes here

// ── Main view ─────────────────────────────────────────────────────────────────

export default function ChallengesView() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<FilterTab>("ALL");
  const [joiningId, setJoiningId]   = useState<string | null>(null);
  const [proofTarget, setProofTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const url =
      activeTab === "ALL"
        ? "/api/challenges"
        : `/api/challenges?type=${activeTab}`;

    fetch(url)
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Failed to load challenges")),
      )
      .then((json) => { if (!cancelled) setChallenges(json.challenges); })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [activeTab]);

  const handleJoin = async (challengeId: string) => {
    setJoiningId(challengeId);
    try {
      const res  = await fetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) return;

      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? {
                ...c,
                isJoined:         true,
                userProgress:     c.userProgress ?? 0,
                participantCount: json.alreadyJoined
                  ? c.participantCount
                  : c.participantCount + 1,
              }
            : c,
        ),
      );
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d2818] pb-28 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ecomate-600/20">
            <Trophy size={20} className="text-ecomate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Challenges</h1>
            <p className="mt-0.5 text-sm text-white/45">
              Join community initiatives and make a real impact
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.value
                  ? "bg-ecomate-600 text-white"
                  : "border border-white/10 bg-white/5 text-white/55 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-8 text-center text-sm text-red-400">{error}</p>
        )}

        {/* Skeleton */}
        {!error && loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/4" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!error && !loading && challenges.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <Trophy size={40} className="text-white/20" />
            <p className="text-sm text-white/35">
              No{" "}
              {activeTab !== "ALL"
                ? TYPE_LABELS[activeTab as ChallengeType].toLowerCase() + " "
                : ""}
              challenges right now. Check back soon!
            </p>
          </div>
        )}

        {/* Grid */}
        {!error && !loading && challenges.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={handleJoin}
                joining={joiningId === challenge.id}
                onSubmitProof={(id, title) => setProofTarget({ id, title })}
              />
            ))}
          </div>
        )}

      </div>

      {/* Proof submission sheet */}
      {proofTarget && (
        <ChallengeProofSheet
          open={!!proofTarget}
          onClose={() => setProofTarget(null)}
          challengeId={proofTarget.id}
          challengeTitle={proofTarget.title}
        />
      )}
    </div>
  );
}