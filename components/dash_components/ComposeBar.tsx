"use client";

import Image from "next/image";
import type { SafeUser } from "../../lib/auth/server";

interface ComposeBarProps {
  user: SafeUser;
  onCompose?: () => void;
}

export default function ComposeBar({ user, onCompose }: ComposeBarProps) {
  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user.username.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 border-b border-white/5 bg-black/15 px-4 py-2.5">
      {/* Avatar */}
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-ecomate-500/30">
        {user.imageFile ? (
          <Image
            src={user.imageFile}
            alt={user.username}
            fill
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-[10px] font-semibold text-ecomate-500">
            {initials}
          </span>
        )}
      </div>

      {/* Input prompt */}
      <button
        type="button"
        onClick={onCompose}
        className="flex-1 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-left text-xs text-white/40 transition hover:bg-white/10"
      >
        Share something with the community…
      </button>

      {/* Camera */}
      <button
        type="button"
        aria-label="Add photo"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-ecomate-500/10 text-ecomate-400 transition hover:bg-ecomate-500/20"
      >
        <CameraIcon />
      </button>

      {/* Location */}
      <button
        type="button"
        aria-label="Add location"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-ecomate-500/10 text-ecomate-400 transition hover:bg-ecomate-500/20"
      >
        <PinIcon />
      </button>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 3.5l.8-1.5h2.4l.8 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5C4.791 1.5 3 3.291 3 5.5c0 3.5 4 7 4 7s4-3.5 4-7c0-2.209-1.791-4-4-4z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="7" cy="5.5" r="1.2" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}