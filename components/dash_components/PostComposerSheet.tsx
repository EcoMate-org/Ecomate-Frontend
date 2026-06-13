"use client";

import { useEffect } from "react";
import { X, TreePine, ScanLine, Palette } from "lucide-react";

interface PostComposerSheetProps {
  open: boolean;
  onClose: () => void;
}

const OPTIONS = [
  {
    icon: TreePine,
    title: "Share a moment",
    description: "Post a photo or update to the community — no price, no product",
    color: "text-ecomate-400",
    bg: "bg-ecomate-500/10",
  },
  {
    icon: ScanLine,
    title: "List an item",
    description: "AI scan or manual entry to sell recyclable materials",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Palette,
    title: "Share artwork",
    description: "List your recycled art in the gallery marketplace",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
] as const;

export default function PostComposerSheet({ open, onClose }: PostComposerSheetProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-white/10 bg-[#0d2818] px-4 pb-10 pt-4 animate-in slide-in-from-bottom duration-200">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">What would you like to share?</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.title}
                type="button"
                className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/4 px-4 py-3.5 text-left transition hover:bg-white/8 active:scale-[0.98]"
                onClick={onClose}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${opt.bg} ${opt.color}`}>
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{opt.title}</p>
                  <p className="text-xs text-white/45 mt-0.5">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}