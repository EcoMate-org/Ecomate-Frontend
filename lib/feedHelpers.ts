import type { FeedPost, RoleBadge } from "../components/dash_components/AppFeedCard";

/** Maps a user role string from the DB/session to the display badge label */
export function roleToBadge(role: string): RoleBadge {
  if (role === "NGO") return "NGO";
  if (role === "COMPANY") return "Company";
  return "Individual";
}

/** Returns "2h ago", "5 days ago" etc from a Date */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Builds initials from a user record */
export function getInitials(firstName?: string | null, lastName?: string | null, username?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  return (username ?? "??").slice(0, 2).toUpperCase();
}

/**
 * Static demo feed posts built from your seeded data.
 * Replace with a real API call to /api/feed once that route is built out.
 */
export const DEMO_FEED_POSTS: FeedPost[] = [
  {
    id: "demo-post-1",
    authorName: "Amaka Obi",
    authorInitials: "AO",
    authorImage: "https://i.pinimg.com/736x/06/88/7c/06887c5974f2842d15d440160398cbfa.jpg",
    role: "Individual",
    location: "Lagos, Nigeria",
    timeAgo: "2h ago",
    text: "Just finished planting 15 trees in my neighbourhood with the kids! 🌱 Small actions, big future. #PlantATree #CleanLagos",
    image: null,
    likes: 84,
    comments: 12,
  },
  {
    id: "demo-post-2",
    authorName: "Green Earth Foundation",
    authorInitials: "GE",
    authorImage: "https://tse3.mm.bing.net/th/id/OIP.lS-UeOlf_GcwNcPUTpBJogHaHb?rs=1&pid=ImgDetMain&o=7&rm=3",
    role: "NGO",
    location: "Abuja, Nigeria",
    timeAgo: "5h ago",
    text: "New challenge launched! Collect 10kg of plastic waste this week and earn 500 EcoPoints. #PlasticFree #Challenge",
    image: null,
    listing: {
      title: "Plastic-Free Lagos Week",
      meta: "Reward: 500 EcoPoints · 7 days left",
      actionLabel: "Join",
      actionVariant: "green",
    },
    likes: 41,
    comments: 7,
  },
  {
    id: "demo-post-3",
    authorName: "EcoRecycle Ltd",
    authorInitials: "ER",
    authorImage: "https://tse3.mm.bing.net/th/id/OIP.lS-UeOlf_GcwNcPUTpBJogHaHb?rs=1&pid=ImgDetMain&o=7&rm=3",
    role: "Company",
    location: "Port Harcourt",
    timeAgo: "8h ago",
    text: "We're bidding on glass materials this week. Post yours and get competitive offers directly in your inbox.",
    image: null,
    listing: {
      title: "Glass — Buying Now",
      meta: "₦18,000/kg · 3 bids active",
      actionLabel: "Sell",
      actionVariant: "purple",
    },
    likes: 19,
    comments: 4,
  },
  {
    id: "demo-post-4",
    authorName: "Chidi Nweze",
    authorInitials: "CN",
    authorImage: "https://i.pinimg.com/736x/06/88/7c/06887c5974f2842d15d440160398cbfa.jpg",
    role: "Individual",
    location: "Enugu",
    timeAgo: "1d ago",
    text: "Dropped off 12 old laptops and monitors at the e-waste centre today. Every gadget counts 💻♻️ #EWaste #TechForGood",
    image: null,
    likes: 55,
    comments: 9,
  },
];