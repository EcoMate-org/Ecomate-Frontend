"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
  Target,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Goal {
  id:           string;
  title:        string;
  type:         "PRESET" | "CUSTOM";
  targetValue:  number;
  currentValue: number;
  unit:         string | null;
  period:       "DAILY" | "WEEKLY" | "MONTHLY";
  completedAt:  string | null;
  createdAt:    string;
}

// ── Preset suggestions ────────────────────────────────────────────────────────

const PRESETS = [
  { title: "Recycle 5 plastic bottles",         targetValue: 5,  unit: "bottles" },
  { title: "Use reusable bags for 7 days",       targetValue: 7,  unit: "days"    },
  { title: "Collect 1 kg of recyclable waste",   targetValue: 1,  unit: "kg"      },
  { title: "Save electricity every day",         targetValue: 7,  unit: "days"    },
  { title: "No single-use plastic for a week",   targetValue: 7,  unit: "days"    },
  { title: "Sort household waste daily",         targetValue: 7,  unit: "days"    },
];

// ── Goal card ─────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  onIncrement,
  onDelete,
}: {
  goal:        Goal;
  onIncrement: (id: string) => void;
  onDelete:    (id: string) => void;
}) {
  const percent     = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
  const isComplete  = !!goal.completedAt || goal.currentValue >= goal.targetValue;

  const progressColor = isComplete
    ? "bg-ecomate-500"
    : percent >= 60
      ? "bg-ecomate-500"
      : percent >= 30
        ? "bg-yellow-400"
        : "bg-white/30";

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        isComplete
          ? "border-ecomate-500/30 bg-ecomate-500/8"
          : "border-white/8 bg-white/4"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => !isComplete && onIncrement(goal.id)}
          disabled={isComplete}
          className="mt-0.5 shrink-0 transition"
          aria-label={isComplete ? "Completed" : "Increment progress"}
        >
          {isComplete ? (
            <CheckCircle2 size={18} className="text-ecomate-400" />
          ) : (
            <Circle size={18} className="text-white/30 hover:text-ecomate-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold leading-snug ${
              isComplete ? "text-ecomate-300 line-through opacity-70" : "text-white"
            }`}
          >
            {goal.title}
          </p>
          <p className="mt-0.5 text-[11px] text-white/40">
            {goal.currentValue} / {goal.targetValue}
            {goal.unit ? ` ${goal.unit}` : ""} · {goal.period.toLowerCase()}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDelete(goal.id)}
          className="shrink-0 text-white/20 transition hover:text-red-400"
          aria-label="Delete goal"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Progress bar */}
      {!isComplete && (
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-white/10">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] text-white/30">{percent}% complete</span>
            <button
              type="button"
              onClick={() => onIncrement(goal.id)}
              className="rounded-full border border-ecomate-500/30 bg-ecomate-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-ecomate-400 transition hover:bg-ecomate-500/20 active:scale-95"
            >
              + 1 {goal.unit ?? ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add goal panel ────────────────────────────────────────────────────────────

function AddGoalPanel({
  onAdd,
  onClose,
}: {
  onAdd:   (data: { title: string; targetValue: number; unit?: string; type: "PRESET" | "CUSTOM" }) => void;
  onClose: () => void;
}) {
  const [mode, setMode]             = useState<"presets" | "custom">("presets");
  const [customTitle, setCustomTitle]   = useState("");
  const [customTarget, setCustomTarget] = useState("1");
  const [customUnit, setCustomUnit]     = useState("");

  const handleCustomSubmit = () => {
    const t = parseInt(customTarget, 10);
    if (!customTitle.trim() || isNaN(t) || t < 1) return;
    onAdd({
      title:       customTitle.trim(),
      targetValue: t,
      unit:        customUnit.trim() || undefined,
      type:        "CUSTOM",
    });
    onClose();
  };

  return (
    <div className="mt-4 rounded-2xl border border-ecomate-500/20 bg-ecomate-500/5 p-4">
      {/* Mode toggle */}
      <div className="mb-4 flex gap-2">
        {(["presets", "custom"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              mode === m
                ? "bg-ecomate-600 text-white"
                : "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {m === "presets" ? "Suggestions" : "Custom"}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-[11px] text-white/30 hover:text-white/60"
        >
          Cancel
        </button>
      </div>

      {/* Preset list */}
      {mode === "presets" && (
        <div className="flex flex-col gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => {
                onAdd({ ...p, type: "PRESET" });
                onClose();
              }}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-left text-xs text-white/75 transition hover:bg-white/8 hover:text-white active:scale-[0.99]"
            >
              <span>{p.title}</span>
              <ChevronRight size={12} className="shrink-0 text-white/30" />
            </button>
          ))}
        </div>
      )}

      {/* Custom form */}
      {mode === "custom" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-white/50">
              Goal title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Bring lunch in reusable container"
              maxLength={120}
              className="w-full rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-ecomate-500/40"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] text-white/50">Target</label>
              <input
                type="number"
                min={1}
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-sm text-white outline-none transition focus:border-ecomate-500/40"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[11px] text-white/50">Unit (optional)</label>
              <input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="bottles, days, km…"
                maxLength={30}
                className="w-full rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-ecomate-500/40"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCustomSubmit}
            disabled={!customTitle.trim()}
            className="w-full rounded-xl bg-ecomate-600 py-2.5 text-sm font-semibold text-white transition hover:bg-ecomate-700 active:scale-95 disabled:opacity-40"
          >
            Add Goal
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WeeklyGoals() {
  const [goals, setGoals]       = useState<Goal[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Load goals
  useEffect(() => {
    let cancelled = false;
    fetch("/api/goals")
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setGoals(json.goals ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Increment
  const handleIncrement = async (id: string) => {
    setSavingId(id);
    try {
      const res  = await fetch(`/api/goals/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ increment: true }),
      });
      const json = await res.json();
      if (res.ok) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === id
              ? { ...g, currentValue: json.goal.currentValue, completedAt: json.goal.completedAt }
              : g,
          ),
        );
      }
    } finally {
      setSavingId(null);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (res.ok) setGoals((prev) => prev.filter((g) => g.id !== id));
    } finally {
      setSavingId(null);
    }
  };

  // Create
  const handleAdd = async (data: {
    title: string;
    targetValue: number;
    unit?: string;
    type: "PRESET" | "CUSTOM";
  }) => {
    const res  = await fetch("/api/goals", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...data, period: "WEEKLY" }),
    });
    const json = await res.json();
    if (res.ok) setGoals((prev) => [json.goal, ...prev]);
  };

  const active    = goals.filter((g) => !g.completedAt && g.currentValue < g.targetValue);
  const completed = goals.filter((g) =>  g.completedAt || g.currentValue >= g.targetValue);

  return (
    <section>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-ecomate-400" />
          <h2 className="text-base font-semibold text-white">Weekly Goals</h2>
          {goals.length > 0 && (
            <span className="rounded-full bg-ecomate-500/15 px-2 py-0.5 text-[10px] font-semibold text-ecomate-400">
              {completed.length}/{goals.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((s) => !s)}
          className="flex items-center gap-1.5 rounded-full border border-ecomate-500/30 bg-ecomate-500/10 px-3 py-1 text-xs font-semibold text-ecomate-400 transition hover:bg-ecomate-500/20"
        >
          <Plus size={12} />
          Add goal
        </button>
      </div>

      {/* Add goal panel */}
      {showAdd && (
        <AddGoalPanel
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/4" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && goals.length === 0 && !showAdd && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/6 bg-white/3 py-10 text-center">
          <Target size={28} className="text-white/20" />
          <div>
            <p className="text-sm font-medium text-white/50">No goals yet</p>
            <p className="mt-0.5 text-xs text-white/30">
              Add personal habits to track this week
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-1 rounded-xl bg-ecomate-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-ecomate-700 active:scale-95"
          >
            Add your first goal
          </button>
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 && (
        <div className="flex flex-col gap-3">
          {active.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onIncrement={handleIncrement}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Completed goals */}
      {completed.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/30">
            Completed
          </p>
          <div className="flex flex-col gap-2">
            {completed.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onIncrement={handleIncrement}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}