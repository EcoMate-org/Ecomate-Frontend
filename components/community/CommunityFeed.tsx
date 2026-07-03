"use client";

import { useState } from "react";
import type { SafeUser } from "../../lib/auth/server";
import { useDashboardStats } from "../../lib/useDashboardStats";
import { usePosts } from "../../lib/usePosts";
import DashboardSidebar from "../dash_components/Dashboardsidebar";
import ComposeBar from "../dash_components/ComposeBar";
import FeedTabs, { type FeedTab } from "../dash_components/FeedTabs";
import AppFeedCard from "../dash_components/Appfeedcard";
import AppBottomNav from "../dash_components/AppBottomNav";
import PostComposerSheet from "../dash_components/PostComposerSheet";

interface CommunityFeedProps {
  user: SafeUser;
}

const TAB_TO_POST_TYPE: Record<FeedTab, string | undefined> = {
  Community:  "MOMENT",
  Marketplace: "LISTING",
  Challenges:  "CHALLENGE_ANNOUNCEMENT",
};

export default function CommunityFeed({ user }: CommunityFeedProps) {
  const [activeTab, setActiveTab]     = useState<FeedTab>("Community");
  const [composerOpen, setComposerOpen] = useState(false);

  const { data, loading: statsLoading } = useDashboardStats();
  const { posts, loading: postsLoading, error: postsError } = usePosts(
    TAB_TO_POST_TYPE[activeTab],
  );

  return (
    <>
      <div className="flex gap-4 px-3 pb-24 pt-4 sm:px-4 lg:gap-6 lg:px-6">
        {/* Sidebar — platform stats, impact, featured partners */}
        <DashboardSidebar data={data} loading={statsLoading} />

        {/* Main feed */}
        <div className="flex-1 min-w-0">
          <ComposeBar user={user} onCompose={() => setComposerOpen(true)} />
          <FeedTabs active={activeTab} onChange={setActiveTab} />

          <div className="flex flex-col gap-2.5 pt-3">
            {postsLoading && (
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl bg-white/4" />
                ))}
              </div>
            )}

            {!postsLoading && postsError && (
              <div className="py-12 text-center text-sm text-red-400">
                Failed to load posts: {postsError}
              </div>
            )}

            {!postsLoading && !postsError && posts.length === 0 && (
              <div className="py-12 text-center text-sm text-white/30">
                {activeTab === "Community"   && "No community moments yet. Be the first to share!"}
                {activeTab === "Marketplace" && "No marketplace listings yet."}
                {activeTab === "Challenges"  && "No challenge announcements yet."}
              </div>
            )}

            {!postsLoading &&
              !postsError &&
              posts.map((post) => <AppFeedCard key={post.id} post={post} />)}
          </div>
        </div>
      </div>

      <AppBottomNav onPostClick={() => setComposerOpen(true)} />

      <PostComposerSheet
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </>
  );
}