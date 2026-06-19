"use client";

import { useEffect, useState } from "react";
import FeedCard from "../../components/FeedCard";
import FeedSkeleton from "../../components/FeedSkeleton";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTheme } from "../../lib/ThemeContext";

type FeedItem = {
  title: string;
  description: string;
  image?: string;
  url: string;
  source: string;
  publishedAt: string;
};

export default function FeedPage() {
  const [data, setData] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { theme } = useTheme();

  const fetchFeed = async (pageNum: number) => {
    setLoading(true);

    const res = await fetch(`/api/feed?page=${pageNum}`);
    const json = await res.json();

    if (pageNum === 1) {
      setData(json.data);
    } else {
      setData((prev) => [...prev, ...json.data]);
    }

    setHasMore(json.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-950" : "bg-white"
      }`}
    >
      <Navbar />

      <div className="section-padding pt-28 max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gradient-text">
            EcoMate Feed 🌱
          </h1>
          <p
            className={`transition-colors ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Latest environmental, recycling & sustainability news
          </p>
        </div>

        {data.length === 0 && loading && <FeedSkeleton />}

        <div className="space-y-6">
          {data.map((item, i) => (
            <FeedCard key={i} {...item} />
          ))}
        </div>

        {loading && <FeedSkeleton />}

        {hasMore && !loading && (
          <div className="text-center">
            <button
              onClick={loadMore}
              className="btn-primary"
            >
              Load More
            </button>
          </div>
        )}

        {!hasMore && (
          <p
            className={`text-center ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No more eco news 🌍
          </p>
        )}
      </div>

      <Footer />
    </main>
  );
}