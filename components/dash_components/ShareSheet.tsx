"use client";

import { useEffect, useState } from "react";
import { X, Link2, Check } from "lucide-react";
import { FaWhatsapp, FaXTwitter, FaFacebook } from "react-icons/fa6";

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  postText: string;
}

export default function ShareSheet({ open, onClose, postId, postText }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!open) return null;

  // Build an absolute URL client-side (window is available in "use client")
  const postUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${postId}`
      : `/posts/${postId}`;

  const shareText = postText.length > 100 ? `${postText.slice(0, 100)}…` : postText;

  const options = [
    {
      label: "WhatsApp",
      icon: FaWhatsapp,
      color: "text-green-400 bg-green-500/10",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl}`)}`,
    },
    {
      label: "X",
      icon: FaXTwitter,
      color: "text-white bg-white/10",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`,
    },
    {
      label: "Facebook",
      icon: FaFacebook,
      color: "text-blue-400 bg-blue-500/10",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-white/10 bg-[#0d2818] px-4 pb-10 pt-4 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Share post</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <a
                key={opt.label}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex flex-col items-center gap-2"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${opt.color}`}>
                  <Icon size={20} />
                </span>
                <span className="text-[11px] text-white/60">{opt.label}</span>
              </a>
            );
          })}

          <button type="button" onClick={handleCopy} className="flex flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60">
              {copied ? <Check size={20} className="text-ecomate-400" /> : <Link2 size={20} />}
            </span>
            <span className="text-[11px] text-white/60">
              {copied ? "Copied!" : "Copy link"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}