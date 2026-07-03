"use client";

import { useEffect, useState } from "react";
import { X, Send, CheckCircle2, Image as ImageIcon } from "lucide-react";

interface ChallengeProofSheetProps {
  open:        boolean;
  onClose:     () => void;
  challengeId: string;
  challengeTitle: string;
}

type Stage = "form" | "submitting" | "success" | "error";

export default function ChallengeProofSheet({
  open,
  onClose,
  challengeId,
  challengeTitle,
}: ChallengeProofSheetProps) {
  const [description,   setDescription]   = useState("");
  const [notes,         setNotes]         = useState("");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [stage,         setStage]         = useState<Stage>("form");
  const [errorMsg,      setErrorMsg]      = useState("");

  // Reset on open
  useEffect(() => {
    if (open) {
      setDescription("");
      setNotes("");
      setProofImageUrl("");
      setStage("form");
      setErrorMsg("");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setStage("submitting");

    try {
      const res = await fetch(`/api/challenges/${challengeId}/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          description:   description.trim(),
          notes:         notes.trim() || undefined,
          proofImageUrl: proofImageUrl.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json?.error ?? "Submission failed. Please try again.");
        setStage("error");
        return;
      }

      setStage("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStage("error");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-white/10 bg-[#0d2818] px-4 pb-10 pt-4 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Submit Proof</h2>
            <p className="mt-0.5 text-xs text-white/40 line-clamp-1">{challengeTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>

        {/* Success state */}
        {stage === "success" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 size={40} className="text-ecomate-400" />
            <p className="font-semibold text-white">Proof submitted!</p>
            <p className="text-xs text-white/45">
              Your submission is under review. Keep up the great work 🌱
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-xl bg-ecomate-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-ecomate-700 active:scale-95"
            >
              Done
            </button>
          </div>
        )}

        {/* Error state */}
        {stage === "error" && (
          <div className="flex flex-col gap-3">
            <p className="rounded-xl bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={() => setStage("form")}
              className="rounded-xl border border-white/15 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/8"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Form */}
        {(stage === "form" || stage === "submitting") && (
          <div className="flex flex-col gap-4">
            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/60">
                What did you do? <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you accomplished for this challenge…"
                maxLength={1000}
                disabled={stage === "submitting"}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-ecomate-500/40 disabled:opacity-60"
              />
              <p className="mt-1 text-right text-[10px] text-white/25">
                {description.length}/1000
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/60">
                Additional notes <span className="text-white/30">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Location, conditions, observations…"
                maxLength={500}
                disabled={stage === "submitting"}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-ecomate-500/40 disabled:opacity-60"
              />
            </div>

            {/* Proof image URL */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/60">
                <ImageIcon size={11} />
                Proof image URL <span className="text-white/30">(optional)</span>
              </label>
              <input
                type="url"
                value={proofImageUrl}
                onChange={(e) => setProofImageUrl(e.target.value)}
                placeholder="https://… (paste a link to your photo)"
                disabled={stage === "submitting"}
                className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-ecomate-500/40 disabled:opacity-60"
              />
              <p className="mt-1 text-[10px] text-white/25">
                Direct image upload coming soon
              </p>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!description.trim() || stage === "submitting"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ecomate-600 py-3 text-sm font-semibold text-white transition hover:bg-ecomate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {stage === "submitting" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send size={14} />
                  Submit Proof
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}