"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";

interface ChatUser {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  role: string;
  imageFile: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatSheetProps {
  open: boolean;
  onClose: () => void;
  /** The other participant's user id — used to find-or-create the conversation. */
  recipientId: string;
  currentUserId: string;
}

function displayName(u: ChatUser): string {
  if (u.companyName) return u.companyName;
  if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
  if (u.firstName) return u.firstName;
  return u.username;
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * Minimal chat UI — slides up from the bottom (mobile) / appears as a
 * centered panel (desktop), mirroring ShareSheet's responsive pattern.
 *
 * On open, calls POST /api/conversations/start to find-or-create the
 * conversation, then GET /api/conversations/[id]/messages to load the
 * thread. Sending a message POSTs to the same messages endpoint.
 */
export default function ChatSheet({ open, onClose, recipientId, currentUserId }: ChatSheetProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset + load on open
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setMessages([]);
    setOtherUser(null);
    setConversationId(null);

    async function load() {
      try {
        const startRes = await fetch("/api/conversations/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId }),
        });

        if (!startRes.ok) {
          const json = await startRes.json().catch(() => null);
          throw new Error(json?.error ?? "Failed to start conversation");
        }

        const { conversationId: cid } = await startRes.json();
        if (cancelled) return;
        setConversationId(cid);

        const msgRes = await fetch(`/api/conversations/${cid}/messages`);
        if (!msgRes.ok) throw new Error("Failed to load messages");

        const data = await msgRes.json();
        if (cancelled) return;
        setOtherUser(data.otherUser);
        setMessages(data.messages);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, recipientId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !conversationId || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Failed to send message");
      }

      const { message } = await res.json();
      setMessages((prev) => [...prev, message]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-[60] flex h-[80vh] flex-col rounded-t-2xl border-t border-white/10 bg-[#0d2818] sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-[70vh] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
          {otherUser && (
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-ecomate-500/30">
              {otherUser.imageFile ? (
                <Image src={otherUser.imageFile} alt={displayName(otherUser)} fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-[11px] font-semibold text-ecomate-500">
                  {displayName(otherUser).slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              {otherUser ? displayName(otherUser) : "Loading…"}
            </p>
            {otherUser && <p className="text-[11px] text-white/40">{otherUser.role}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-2/3 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-red-400">{error}</p>
          ) : messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/35">
              No messages yet. Say hello!
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((m) => {
                const isMine = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        isMine
                          ? "bg-ecomate-600 text-white"
                          : "bg-white/8 text-white/85"
                      }`}
                    >
                      <p className="leading-relaxed">{m.content}</p>
                      <p className={`mt-1 text-[10px] ${isMine ? "text-white/70" : "text-white/35"}`}>
                        {timeLabel(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/8 p-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            disabled={loading || !conversationId}
            className="flex-1 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white placeholder-white/35 outline-none transition focus:border-ecomate-500/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !text.trim() || !conversationId}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ecomate-600 text-white transition hover:bg-ecomate-700 disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </>
  );
}
