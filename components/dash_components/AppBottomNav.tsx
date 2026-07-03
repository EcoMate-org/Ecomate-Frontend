"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Plus, Trophy, Gavel, HeartHandshake } from "lucide-react";

const tabs = [
  { href: "/dashboard/user", icon: Home, label: "Home" },
  { href: "/market", icon: ShoppingBag, label: "Market" },
  { href: "#compose", icon: Plus, label: "Post", isFab: true },
  { href: "/challenges", icon: Trophy, label: "Challenges" },
  { href: "/bidding", icon: Gavel, label: "Bids" },
  { href: "/community", icon: HeartHandshake, label: "Community" },
];

interface AppBottomNavProps {
  onPostClick?: () => void;
}

export default function AppBottomNav({ onPostClick }: AppBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/8 bg-[#0a1f12] pb-safe px-2 pt-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
        const Icon = tab.icon;

        if (tab.isFab) {
          return (
            <button
              key={tab.label}
              type="button"
              onClick={onPostClick}
              className="flex flex-col items-center gap-1 rounded-2xl bg-ecomate-600 px-5 py-2 transition hover:bg-ecomate-700 active:scale-95"
            >
              <Icon size={20} className="text-white" />
              <span className="text-[10px] font-medium text-white/80">
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition hover:bg-white/5"
          >
            <Icon
              size={20}
              className={isActive ? "text-ecomate-500" : "text-white/35"}
            />
            <span
              className={`text-[10px] font-medium ${isActive ? "text-ecomate-500" : "text-white/35"}`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
