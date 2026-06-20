/*import type { FeedPost, RoleBadge } from "../components/dash_components/Appfeedcard";

/** Maps a user role string from the DB/session to the display badge label 
export function roleToBadge(role: string): RoleBadge {
  if (role === "NGO") return "NGO";
  if (role === "COMPANY") return "Company";
  return "Individual";
}

/** Returns "2h ago", "5 days ago" etc from a Date 
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

/** Builds initials from a user record 
export function getInitials(firstName?: string | null, lastName?: string | null, username?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  return (username ?? "??").slice(0, 2).toUpperCase();
}

/**
 * Static demo feed posts built from your seeded data.
 * Replace with a real API call to /api/feed once that route is built out.
 
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
];*/


import type { MaterialType, PostType, UserRole } from "../generated/prisma/client";

// ── Types matching /api/posts response shape ────────────────────────────────

export interface PostAuthor {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  role: UserRole;
  imageFile: string | null;
}

export interface PostItemRef {
  id: string;
  title: string;
  pricePerQuantity: string; // Decimal serialized as string over JSON
  quantity: number;
  status: string;
}

export interface PostChallengeRef {
  id: string;
  title: string;
  reward: string;
  deadline: string;
}

export interface PostArtworkRef {
  id: string;
  title: string;
  fixedPrice: string | null;
  estimatedPrice: string;
}

export interface ApiPost {
  id: string;
  type: PostType;
  text: string;
  imageUrl: string | null;
  location: string | null;
  createdAt: string;
  author: PostAuthor;
  item: PostItemRef | null;
  challenge: PostChallengeRef | null;
  artwork: PostArtworkRef | null;
  counts: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isOwnPost: boolean;
  hasLiked: boolean;
  hasBookmarked: boolean;
}

// ── Display helpers ───────────────────────────────────────────────────────

export type RoleBadge = "Individual" | "NGO" | "Company";

/** Maps a user role to the display badge label */
export function roleToBadge(role: UserRole | string): RoleBadge {
  if (role === "NGO") return "NGO";
  if (role === "COMPANY") return "Company";
  return "Individual";
}

/** Returns "2h ago", "5d ago" etc from an ISO date string or Date */
export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Display name for a post author (company name takes precedence for NGO/Company) */
export function authorDisplayName(author: PostAuthor): string {
  if (author.companyName) return author.companyName;
  if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
  if (author.firstName) return author.firstName;
  return author.username;
}

/** Initials for a post author's avatar fallback */
export function authorInitials(author: PostAuthor): string {
  if (author.companyName) return author.companyName.slice(0, 2).toUpperCase();
  if (author.firstName && author.lastName) {
    return `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();
  }
  if (author.firstName) return author.firstName.slice(0, 2).toUpperCase();
  return author.username.slice(0, 2).toUpperCase();
}

/** Maps a post (with item/challenge/artwork refs) to a listing banner, if applicable */
export function postListingBanner(post: ApiPost): {
  title: string;
  meta: string;
  actionLabel: string;
  actionVariant: "green" | "purple";
} | null {
  if (post.type === "LISTING" && post.item) {
    return {
      title: post.item.title,
      meta: `₦${Number(post.item.pricePerQuantity).toLocaleString()}/kg · ${post.item.quantity} kg available`,
      actionLabel: "View Listing",
      actionVariant: "purple",
    };
  }

  if (post.type === "CHALLENGE_ANNOUNCEMENT" && post.challenge) {
    const deadline = new Date(post.challenge.deadline);
    const daysLeft = Math.max(
      0,
      Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );
    return {
      title: post.challenge.title,
      meta: `Reward: ${post.challenge.reward} · ${daysLeft} days left`,
      actionLabel: "Join",
      actionVariant: "green",
    };
  }

  if (post.artwork) {
    const price = post.artwork.fixedPrice ?? post.artwork.estimatedPrice;
    return {
      title: post.artwork.title,
      meta: `₦${Number(price).toLocaleString()}`,
      actionLabel: "View Artwork",
      actionVariant: "purple",
    };
  }

  return null;
}

/** Material type display labels (also used by ImpactThisMonthCard) */
export const MATERIAL_LABELS: Record<MaterialType, string> = {
  PLASTIC: "Plastic",
  GLASS: "Glass",
  METAL: "Metal",
  E_WASTE: "E-Waste",
  RUBBER: "Rubber",
};