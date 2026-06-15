/*"use client";

import { useState } from "react";
import type { SafeUser } from "../../lib/auth/server";
import { useDashboardStats } from "../../lib/useDashboardStats";
import DashboardStats from "./DashboardStats";
import DashboardSidebar from "./Dashboardsidebar";
import ComposeBar from "./ComposeBar";
import FeedTabs, { type FeedTab } from "./FeedTabs";
import AppFeedCard from "./Appfeedcard";
import AppBottomNav from "./AppBottomNav";
import PostComposerSheet from "./PostComposerSheet";
import { DEMO_FEED_POSTS } from "../../lib/feedHelpers";

interface UserFeedProps {
  user: SafeUser;
}

export default function UserFeed({ user }: UserFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>("Community");
  const [composerOpen, setComposerOpen] = useState(false);

  const { data, loading } = useDashboardStats();

  return (
    <>
      {/* Stats hero — primary motivation surface, occupies most of initial viewport }
      <DashboardStats
        itemsRecycled={data?.user.itemsRecycled ?? 0}
        totalWeightKg={data?.user.totalWeightKg ?? 0}
        co2SavedKg={data?.user.co2SavedKg ?? 0}
        balance={data?.user.balance ?? 0}
        communityRankPercent={data?.user.communityRankPercent ?? null}
        loading={loading}
      />

      {/* Scroll target: sidebar + community feed }
      <div className="flex gap-4 px-3 pb-24 pt-4 sm:px-4 lg:gap-6 lg:px-6">
        <DashboardSidebar data={data} loading={loading} />

        <div className="flex-1 min-w-0">
          {/* Compose bar }
          <ComposeBar user={user} onCompose={() => setComposerOpen(true)} />

          {/* Feed type switcher }
          <FeedTabs active={activeTab} onChange={setActiveTab} />

          {/* Feed posts }
          <div className="flex flex-col gap-2.5 pt-3">
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
      </div>

      {/* Fixed bottom navigation }
      <AppBottomNav onPostClick={() => setComposerOpen(true)} />

      {/* Post composer bottom sheet }
      <PostComposerSheet
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </>
  );
}*/

"use client";

import { useState } from "react";
import type { SafeUser } from "../../lib/auth/server";
import { useDashboardStats } from "../../lib/useDashboardStats";
import { usePosts } from "../../lib/usePosts";
import DashboardStats from "./DashboardStats";
import DashboardSidebar from "./Dashboardsidebar";
import ComposeBar from "./ComposeBar";
import FeedTabs, { type FeedTab } from "./FeedTabs";
import AppFeedCard from "./Appfeedcard";
import AppBottomNav from "./AppBottomNav";
import PostComposerSheet from "./PostComposerSheet";

interface UserFeedProps {
  user: SafeUser;
}

/** Maps the feed tab to the Post.type filter sent to /api/posts */
const TAB_TO_POST_TYPE: Record<FeedTab, string | undefined> = {
  Community: "MOMENT",
  Marketplace: "LISTING",
  Challenges: "CHALLENGE_ANNOUNCEMENT",
};

export default function UserFeed({ user }: UserFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>("Community");
  const [composerOpen, setComposerOpen] = useState(false);

  const { data, loading: statsLoading } = useDashboardStats();
  const { posts, loading: postsLoading, error: postsError } = usePosts(
    TAB_TO_POST_TYPE[activeTab],
  );

  return (
    <>
      {/* Stats hero — primary motivation surface, occupies most of initial viewport */}
      <DashboardStats
        itemsRecycled={data?.user.itemsRecycled ?? 0}
        totalWeightKg={data?.user.totalWeightKg ?? 0}
        co2SavedKg={data?.user.co2SavedKg ?? 0}
        balance={data?.user.balance ?? 0}
        communityRankPercent={data?.user.communityRankPercent ?? null}
        loading={statsLoading}
      />

      {/* Scroll target: sidebar + community feed */}
      <div className="flex gap-4 px-3 pb-24 pt-4 sm:px-4 lg:gap-6 lg:px-6">
        <DashboardSidebar data={data} loading={statsLoading} />

        <div className="flex-1 min-w-0">
          {/* Compose bar */}
          <ComposeBar user={user} onCompose={() => setComposerOpen(true)} />

          {/* Feed type switcher */}
          <FeedTabs active={activeTab} onChange={setActiveTab} />

          {/* Feed posts */}
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
                {activeTab === "Community" && "No community moments yet. Be the first to share!"}
                {activeTab === "Marketplace" && "No marketplace listings yet."}
                {activeTab === "Challenges" && "No active challenge announcements yet."}
              </div>
            )}

            {!postsLoading &&
              !postsError &&
              posts.map((post) => <AppFeedCard key={post.id} post={post} />)}
          </div>
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