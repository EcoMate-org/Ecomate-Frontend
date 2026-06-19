"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
}

function computeParts(endTimeIso: string): CountdownParts {
  const totalMs = new Date(endTimeIso).getTime() - Date.now();
  const ended = totalMs <= 0;
  const clamped = Math.max(totalMs, 0);

  const totalSeconds = Math.floor(clamped / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { totalMs: clamped, days, hours, minutes, seconds, ended };
}

/** Ticks every second toward `endTimeIso`. Returns ended=true once it passes. */
export function useCountdown(endTimeIso: string): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => computeParts(endTimeIso));

  useEffect(() => {
    setParts(computeParts(endTimeIso));
    const interval = setInterval(() => {
      setParts(computeParts(endTimeIso));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTimeIso]);

  return parts;
}

export function formatCountdown(parts: CountdownParts): string {
  if (parts.ended) return "Auction ended";
  if (parts.days > 0) return `${parts.days}d ${parts.hours}h ${parts.minutes}m`;
  if (parts.hours > 0) return `${parts.hours}h ${parts.minutes}m ${parts.seconds}s`;
  return `${parts.minutes}m ${parts.seconds}s`;
}
