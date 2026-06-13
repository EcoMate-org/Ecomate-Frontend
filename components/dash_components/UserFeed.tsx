"use client";

import { useState } from "react";
import type { SafeUser } from "../../lib/auth/server";
import DashboardStats from "./DashboardStats";
import ComposeBar from "./ComposeBar";
import FeedTabs, { type FeedTab } from "./FeedTabs";
import AppFeedCard from "./AppFeedCard";
import AppBottomNav from "./AppBottomNav";
import PostComposerSheet from "./PostComposerSheet";
import { DEMO_FEED_POSTS } from "../../lib/feedHelpers";

interface UserFeedProps {
  user: SafeUser;
  stats: {
    itemsRecycled: number;
    totalWeightKg: number;
    co2SavedKg: number;
  };
}

export default function UserFeed({ user, stats }: UserFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>("Community");
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <>
      {/* Scrollable content area — padded at bottom for fixed nav */}
      <div className="pb-24">
        {/* Stats strip — always visible, primary motivation surface */}
        <DashboardStats
          itemsRecycled={stats.itemsRecycled}
          totalWeightKg={stats.totalWeightKg}
          co2SavedKg={stats.co2SavedKg}
        />

        {/* Compose bar */}
        <ComposeBar user={user} onCompose={() => setComposerOpen(true)} />

        {/* Feed type switcher */}
        <FeedTabs active={activeTab} onChange={setActiveTab} />

        {/* Feed posts */}
        <div className="flex flex-col gap-3 px-3 pt-3">
          {activeTab === "Community" &&
            DEMO_FEED_POSTS.map((post) => (
              <AppFeedCard key={post.id} post={post} />
            ))}

          {activeTab === "Marketplace" && (
            <div className="py-12 text-center text-sm text-white/30">
              Marketplace listings coming soon
            </div>
          )}

          {activeTab === "Challenges" && (
            <div className="py-12 text-center text-sm text-white/30">
              Active challenges coming soon
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom navigation */}
      <AppBottomNav onPostClick={() => setComposerOpen(true)} />

      {/* Post composer bottom sheet */}
      <PostComposerSheet
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </>
  );
}