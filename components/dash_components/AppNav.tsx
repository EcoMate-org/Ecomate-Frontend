"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Leaf, Search, Bell, MessageCircle } from "lucide-react";
import type { SafeUser } from "../../lib/auth/server";
import LogoutButton from "./LogoutButton";

interface AppNavProps {
  user: SafeUser;
}

export default function AppNav({ user }: AppNavProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user.username.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/8 bg-[#0a1f12] px-4">
      {/* Logo — matches existing brand exactly */}
      <Link href="/dashboard/user" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ecomate-600">
          <Leaf className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-white">
          EcoMate <span className="text-ecomate-500">AI</span>
        </span>
      </Link>

      {/* Right side icons */}
      <div className="flex items-center gap-1.5">
       
       {/* <NavIconBtn aria-label="Search">
          <Search size={14} />
        </NavIconBtn>*/}

        {/* Notifications */}
        <div className="relative">
          <NavIconBtn
            aria-label="Notifications"
            onClick={() => setNotifOpen((o) => !o)}
          >
            <Bell size={14} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-[#0a1f12] bg-ecomate-500" />
          </NavIconBtn>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-white/10 bg-[#0d2818] p-3 shadow-xl">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                  Notifications
                </p>
                <p className="py-4 text-center text-xs text-white/40">
                  No new notifications
                </p>
              </div>
            </>
          )}
        </div>

        <NavIconBtn aria-label="Messages">
          <MessageCircle size={14} />
        </NavIconBtn>

        {/* Avatar */}
        <div className="relative ml-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-ecomate-500">
          {user.imageFile ? (
            <Image src={user.imageFile} alt={user.username} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-[10px] font-semibold text-ecomate-500">
              {initials}
            </span>
          )}
        </div>

        <LogoutButton className="ml-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20" />
      </div>
    </header>
  );
}

function NavIconBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-white/70 transition hover:bg-white/12 ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}