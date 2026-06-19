import "dotenv/config";
import {
  PrismaClient,
  MaterialType,
  ItemStatus,
  ArtworkSaleType,
  AuctionStatus,
  ChallengeStatus,
  NotificationType,
  UserRole,
  UserStatus,
} from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────

/** bcrypt hash with cost 10 (fast enough for seeding) */
async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

/** Returns a date N days ago from now (fractional days supported) */
function daysAgo(n: number) {
  return new Date(Date.now() - 1000 * 60 * 60 * 24 * n);
}

/** Returns a date N days in the future */
function daysFromNow(n: number) {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * n);
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Your real, existing user ID – never upserted, only referenced */
const REAL_USER_ID = "cmqijzipo0000p4tuj08bikwx";

const DEMO_PASSWORD = "Demo@1234"; // all seed users share this password

// Deterministic IDs so the seed is idempotent
const IDS = {
  // Users
  uAmaka:   "seed_user_amaka_001",
  uChidi:   "seed_user_chidi_002",
  uGreenEarth: "seed_ngo_greenearth_003",
  uEcoRecycle: "seed_company_ecorecycle_004",
  uAdmin:   "seed_admin_root_005",

  // Items
  item1: "seed_item_plastic_001",
  item2: "seed_item_metal_002",
  item3: "seed_item_glass_003",
  item4: "seed_item_ewaste_004",
  item5: "seed_item_rubber_005",
  item6: "seed_item_plastic_006",

  // Artworks
  art1: "seed_art_bottle_001",
  art2: "seed_art_tyre_002",
  art3: "seed_art_cans_003",

  // Auction
  auction1: "seed_auction_001",
  auction2: "seed_auction_002",

  // Orders
  order1: "seed_order_001",
  order2: "seed_order_002",

  // Challenges
  challenge1: "seed_challenge_plastic_001",
  challenge2: "seed_challenge_clean_002",

  // Conversations
  convo1: "seed_convo_001",
  convo2: "seed_convo_002",

  // Notifications
  notif1: "seed_notif_001",
  notif2: "seed_notif_002",
  notif3: "seed_notif_003",

  // ── Phase D: Posts ───────────────────────────────────────────────────────
  post1: "seed_post_amaka_trees_001",
  post2: "seed_post_greenearth_challenge_002",
  post3: "seed_post_ecorecycle_glass_003",
  post4: "seed_post_chidi_ewaste_004",

  // ── Phase D: Likes ───────────────────────────────────────────────────────
  like_post1_chidi: "seed_like_post1_chidi",
  like_post1_greenearth: "seed_like_post1_greenearth",
  like_post1_real: "seed_like_post1_real",
  like_post2_amaka: "seed_like_post2_amaka",
  like_post2_real: "seed_like_post2_real",
  like_post2_ecorecycle: "seed_like_post2_ecorecycle",
  like_post3_amaka: "seed_like_post3_amaka",
  like_post3_chidi: "seed_like_post3_chidi",
  like_post4_amaka: "seed_like_post4_amaka",
  like_post4_real: "seed_like_post4_real",

  // ── Phase D: Bookmarks ───────────────────────────────────────────────────
  bm_post1_real: "seed_bm_post1_real",
  bm_post2_real: "seed_bm_post2_real",
  bm_post2_chidi: "seed_bm_post2_chidi",
  bm_post4_amaka: "seed_bm_post4_amaka",

  // ── Phase D: Comments ────────────────────────────────────────────────────
  comment_post1_real: "seed_comment_post1_real",
  comment_post1_chidi: "seed_comment_post1_chidi",
  comment_post2_real: "seed_comment_post2_real",
  comment_post4_amaka: "seed_comment_post4_amaka",
};

// ─── Seed Functions ──────────────────────────────────────────────────────────

async function seedUsers() {
  console.log("  → Seeding users...");
  const pw = await hash(DEMO_PASSWORD);

  await prisma.user.upsert({
    where: { id: IDS.uAmaka },
    update: {},
    create: {
      id: IDS.uAmaka,
      username: "amaka_eco",
      email: "amaka.obi@demo.ecomate.ng",
      passwordHash: pw,
      firstName: "Amaka",
      lastName: "Obi",
      bio: "Passionate about sustainable living and reducing waste in Lagos.",
      imageFile: "https://i.pinimg.com/736x/06/88/7c/06887c5974f2842d15d440160398cbfa.jpg",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { id: IDS.uChidi },
    update: {},
    create: {
      id: IDS.uChidi,
      username: "chidi_recycles",
      email: "chidi.nweze@demo.ecomate.ng",
      passwordHash: pw,
      firstName: "Chidi",
      lastName: "Nweze",
      bio: "E-waste collector from Enugu. Turning old gadgets into gold.",
      imageFile: "https://i.pinimg.com/736x/06/88/7c/06887c5974f2842d15d440160398cbfa.jpg",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      isVerified: false,
    },
  });

  await prisma.user.upsert({
    where: { id: IDS.uGreenEarth },
    update: {},
    create: {
      id: IDS.uGreenEarth,
      username: "greenearth_ng",
      email: "contact@greenearth.demo.ng",
      passwordHash: pw,
      companyName: "Green Earth Foundation",
      registrationNumber: "RC234567",
      companyAddress: "14 Eco Boulevard, Wuse 2, Abuja, Nigeria",
      bio: "NGO driving environmental awareness and recycling challenges across Nigeria.",
      imageFile: "https://tse3.mm.bing.net/th/id/OIP.lS-UeOlf_GcwNcPUTpBJogHaHb?rs=1&pid=ImgDetMain&o=7&rm=3",
      role: UserRole.NGO,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { id: IDS.uEcoRecycle },
    update: {},
    create: {
      id: IDS.uEcoRecycle,
      username: "ecorecycle_ltd",
      email: "procurement@ecorecycle.demo.ng",
      passwordHash: pw,
      companyName: "EcoRecycle Ltd",
      registrationNumber: "RC789012",
      companyAddress: "Plot 5 Industrial Layout, Trans Amadi, Port Harcourt, Rivers State",
      bio: "Nigeria's leading recyclable materials processor. We buy plastic, metal, glass and e-waste at competitive rates.",
      imageFile: "https://tse3.mm.bing.net/th/id/OIP.lS-UeOlf_GcwNcPUTpBJogHaHb?rs=1&pid=ImgDetMain&o=7&rm=3",
      role: UserRole.COMPANY,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { id: IDS.uAdmin },
    update: {},
    create: {
      id: IDS.uAdmin,
      username: "ecomate_admin",
      email: "admin@ecomate.ng",
      passwordHash: pw,
      firstName: "EcoMate",
      lastName: "Admin",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
  });

  console.log("  ✓ Users seeded (5 demo + your real user untouched)");
}

async function seedItems() {
  console.log("  → Seeding items...");

  const items = [
    {
      id: IDS.item1,
      userId: REAL_USER_ID,
      title: "Clear PET Plastic Bottles",
      description: "Washed and sorted clear PET bottles. Labels removed. Ready for processing.",
      materialType: MaterialType.PLASTIC,
      quantity: 50,
      pricePerQuantity: 1200,
      status: ItemStatus.AVAILABLE,
      location: "Lekki, Lagos",
      createdAt: daysAgo(3),
    },
    {
      id: IDS.item2,
      userId: IDS.uAmaka,
      title: "Aluminium Scrap Metal",
      description: "Mixed aluminium cans and sheet offcuts from a fabrication shop.",
      materialType: MaterialType.METAL,
      quantity: 30,
      pricePerQuantity: 2500,
      status: ItemStatus.AVAILABLE,
      location: "Surulere, Lagos",
      createdAt: daysAgo(5),
    },
    {
      id: IDS.item3,
      userId: IDS.uAmaka,
      title: "Mixed Glass Bottles",
      description: "Clear, green, and brown glass bottles. Washed, labels removed.",
      materialType: MaterialType.GLASS,
      quantity: 8,
      pricePerQuantity: 800,
      status: ItemStatus.AVAILABLE,
      location: "Yaba, Lagos",
      createdAt: daysAgo(7),
    },
    {
      id: IDS.item4,
      userId: IDS.uChidi,
      title: "Old Laptops & Monitors",
      description: "Non-functional laptops and CRT monitors for responsible e-waste recycling.",
      materialType: MaterialType.E_WASTE,
      quantity: 12,
      pricePerQuantity: 5000,
      status: ItemStatus.AVAILABLE,
      location: "Enugu",
      createdAt: daysAgo(2),
    },
    {
      id: IDS.item5,
      userId: IDS.uChidi,
      title: "Used Car Tyres",
      description: "Worn car tyres from a tyre shop, good for rubber recycling.",
      materialType: MaterialType.RUBBER,
      quantity: 20,
      pricePerQuantity: 600,
      status: ItemStatus.RESERVED,
      location: "Aba, Abia State",
      createdAt: daysAgo(10),
    },
    {
      id: IDS.item6,
      userId: REAL_USER_ID,
      title: "HDPE Plastic Drums",
      description: "Blue 200L HDPE chemical drums, triple-rinsed and safe for recycling.",
      materialType: MaterialType.PLASTIC,
      quantity: 15,
      pricePerQuantity: 3500,
      status: ItemStatus.SOLD,
      location: "Apapa, Lagos",
      createdAt: daysAgo(20),
    },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        pricePerQuantity: item.pricePerQuantity,
      },
    });

    await prisma.image.upsert({
      where: { id: `img_${item.id}` },
      update: {},
      create: {
        id: `img_${item.id}`,
        itemId: item.id,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      },
    });
  }

  console.log("  ✓ Items seeded (6 items with images)");
}

async function seedArtworks() {
  console.log("  → Seeding artworks...");

  await prisma.artwork.upsert({
    where: { id: IDS.art1 },
    update: {},
    create: {
      id: IDS.art1,
      userId: IDS.uAmaka,
      title: "Bottle Garden Sculpture",
      description: "A stunning garden sculpture made entirely from repurposed PET bottles collected from Lagos beaches.",
      estimatedPrice: 45000,
      fixedPrice: 45000,
      quantity: 1,
      isAvailable: true,
      saleType: ArtworkSaleType.FIXED_PRICE,
      location: "Anifowoshe St, Victoria Island, Lagos", 
    },
  });

  await prisma.image.upsert({
    where: { id: "img_art1" },
    update: {},
    create: {
      id: "img_art1",
      artworkId: IDS.art1,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
  });

  await prisma.artwork.upsert({
    where: { id: IDS.art2 },
    update: {},
    create: {
      id: IDS.art2,
      userId: IDS.uChidi,
      title: "Tyre Man – Urban Spirit",
      description: "Life-size human figure crafted from reclaimed rubber tyres. Statement piece on industrial waste.",
      estimatedPrice: 80000,
      quantity: 1,
      isAvailable: true,
      saleType: ArtworkSaleType.AUCTION,
      location: "Gwagwalada, Abuja"
    },
  });

  await prisma.image.upsert({
    where: { id: "img_art2" },
    update: {},
    create: {
      id: "img_art2",
      artworkId: IDS.art2,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
  });

  await prisma.artwork.upsert({
    where: { id: IDS.art3 },
    update: {},
    create: {
      id: IDS.art3,
      userId: REAL_USER_ID,
      title: "Crushed Cans Canvas",
      description: "Abstract wall art made from crushed aluminium cans, painted and mounted on recycled wood.",
      estimatedPrice: 22000,
      fixedPrice: 22000,
      quantity: 2,
      isAvailable: true,
      saleType: ArtworkSaleType.FIXED_PRICE,
      location: "Ajah, Lekki, Lagos",
    },
  });

  await prisma.image.upsert({
    where: { id: "img_art3" },
    update: {},
    create: {
      id: "img_art3",
      artworkId: IDS.art3,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
  });

  console.log("  ✓ Artworks seeded (3 artworks)");
}

async function seedAuctions() {
  console.log("  → Seeding auctions & bids...");

  await prisma.artworkAuction.upsert({
    where: { id: IDS.auction1 },
    update: {},
    create: {
      id: IDS.auction1,
      artworkId: IDS.art2,
      startingBid: 50000,
      currentHighestBid: 68000,
      minimumIncrement: 5000,
      startTime: daysAgo(3),
      endTime: daysFromNow(4),
      status: AuctionStatus.ACTIVE,
    },
  });

  const bids = [
    { id: "seed_bid_001", auctionId: IDS.auction1, bidderId: REAL_USER_ID, amount: 55000, createdAt: daysAgo(2) },
    { id: "seed_bid_002", auctionId: IDS.auction1, bidderId: IDS.uAmaka, amount: 62000, createdAt: daysAgo(1) },
    { id: "seed_bid_003", auctionId: IDS.auction1, bidderId: IDS.uEcoRecycle, amount: 68000, createdAt: daysAgo(0) },
  ];

  for (const bid of bids) {
    await prisma.artworkBid.upsert({
      where: { id: bid.id },
      update: {},
      create: bid,
    });
  }

  console.log("  ✓ Auctions & bids seeded");
}

async function seedOrders() {
  console.log("  → Seeding orders...");

  await prisma.order.upsert({
    where: { id: IDS.order1 },
    update: {},
    create: {
      id: IDS.order1,
      itemId: IDS.item6,
      buyerId: IDS.uEcoRecycle,
      sellerId: REAL_USER_ID,
      totalAmount: 52500,
      status: "COMPLETED",
      createdAt: daysAgo(18),
    },
  });

  await prisma.order.upsert({
    where: { id: IDS.order2 },
    update: {},
    create: {
      id: IDS.order2,
      itemId: IDS.item5,
      buyerId: IDS.uEcoRecycle,
      sellerId: IDS.uChidi,
      totalAmount: 12000,
      status: "PENDING",
      createdAt: daysAgo(9),
    },
  });

  console.log("  ✓ Orders seeded");
}

async function seedChallenges() {
  console.log("  → Seeding challenges...");

  await prisma.challenge.upsert({
    where: { id: IDS.challenge1 },
    update: {},
    create: {
      id: IDS.challenge1,
      creatorId: IDS.uGreenEarth,
      title: "Plastic-Free Lagos Week",
      description: "Collect at least 10 kg of plastic waste from your neighbourhood and bring it to any registered drop-off point. Upload proof to qualify.",
      reward: "500 EcoPoints + Green Earth Certificate",
      deadline: daysFromNow(7),
      status: ChallengeStatus.ACTIVE,
      createdAt: daysAgo(2),
    },
  });

  await prisma.challenge.upsert({
    where: { id: IDS.challenge2 },
    update: {},
    create: {
      id: IDS.challenge2,
      creatorId: IDS.uGreenEarth,
      title: "Community Clean-Up Drive",
      description: "Organise or join a community clean-up event. Document your efforts with photos and tag #EcoMateClean.",
      reward: "1000 EcoPoints + Feature on EcoMate homepage",
      deadline: daysFromNow(14),
      status: ChallengeStatus.ACTIVE,
      createdAt: daysAgo(5),
    },
  });

  const participants = [
    { id: "seed_cp_001", userId: REAL_USER_ID, challengeId: IDS.challenge1, progress: 70 },
    { id: "seed_cp_002", userId: IDS.uAmaka,   challengeId: IDS.challenge1, progress: 100 },
    { id: "seed_cp_003", userId: IDS.uChidi,   challengeId: IDS.challenge1, progress: 40 },
    { id: "seed_cp_004", userId: REAL_USER_ID, challengeId: IDS.challenge2, progress: 20 },
    { id: "seed_cp_005", userId: IDS.uAmaka,   challengeId: IDS.challenge2, progress: 55 },
  ];

  for (const p of participants) {
    await prisma.challengeParticipant.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  console.log("  ✓ Challenges seeded (2 active challenges, 5 participants)");
}

async function seedConversationsAndMessages() {
  console.log("  → Seeding conversations & messages...");

  await prisma.conversation.upsert({
    where: { id: IDS.convo1 },
    update: {},
    create: { id: IDS.convo1, createdAt: daysAgo(19) },
  });

  for (const [uid, cid] of [
    [REAL_USER_ID, IDS.convo1],
    [IDS.uEcoRecycle, IDS.convo1],
  ]) {
    const pid = `seed_cp_conv1_${uid}`;
    await prisma.conversationParticipant.upsert({
      where: { id: pid },
      update: {},
      create: { id: pid, conversationId: cid, userId: uid },
    });
  }

  const messages1 = [
    { id: "seed_msg_001", conversationId: IDS.convo1, senderId: IDS.uEcoRecycle, content: "Hello! We're interested in your HDPE drums. Are they still available?", createdAt: daysAgo(19), isRead: true },
    { id: "seed_msg_002", conversationId: IDS.convo1, senderId: REAL_USER_ID, content: "Yes, all 15 drums are available. They're triple-rinsed and ready for pickup.", createdAt: daysAgo(19), isRead: true },
    { id: "seed_msg_003", conversationId: IDS.convo1, senderId: IDS.uEcoRecycle, content: "Great! Can we arrange pickup from Apapa tomorrow? We can offer ₦3,500 per drum.", createdAt: daysAgo(18), isRead: true },
    { id: "seed_msg_004", conversationId: IDS.convo1, senderId: REAL_USER_ID, content: "That works for me. I'll have them ready by 9am.", createdAt: daysAgo(18), isRead: true },
  ];

  for (const msg of messages1) {
    await prisma.message.upsert({
      where: { id: msg.id },
      update: {},
      create: msg,
    });
  }

  await prisma.conversation.upsert({
    where: { id: IDS.convo2 },
    update: {},
    create: { id: IDS.convo2, createdAt: daysAgo(5) },
  });

  for (const [uid, cid] of [
    [REAL_USER_ID, IDS.convo2],
    [IDS.uAmaka, IDS.convo2],
  ]) {
    const pid = `seed_cp_conv2_${uid}`;
    await prisma.conversationParticipant.upsert({
      where: { id: pid },
      update: {},
      create: { id: pid, conversationId: cid, userId: uid },
    });
  }

  const messages2 = [
    { id: "seed_msg_005", conversationId: IDS.convo2, senderId: IDS.uAmaka, content: "Hey! Loved your post about the plastic bottles. How did you sort them so quickly?", createdAt: daysAgo(5), isRead: true },
    { id: "seed_msg_006", conversationId: IDS.convo2, senderId: REAL_USER_ID, content: "I use colour-coded bags! One for clear PET, one for coloured. Makes it so much faster.", createdAt: daysAgo(5), isRead: true },
    { id: "seed_msg_007", conversationId: IDS.convo2, senderId: IDS.uAmaka, content: "That's genius, I'll try that for the challenge 🌱", createdAt: daysAgo(4), isRead: false },
  ];

  for (const msg of messages2) {
    await prisma.message.upsert({
      where: { id: msg.id },
      update: {},
      create: msg,
    });
  }

  console.log("  ✓ Conversations & messages seeded");
}

async function seedNotifications() {
  console.log("  → Seeding notifications...");

  const notifications = [
    {
      id: IDS.notif1,
      userId: REAL_USER_ID,
      title: "New bid on your auction",
      message: "EcoRecycle Ltd placed a bid of ₦68,000 on Tyre Man – Urban Spirit.",
      type: NotificationType.BID_RECEIVED,
      isRead: false,
      createdAt: daysAgo(0),
    },
    {
      id: IDS.notif2,
      userId: REAL_USER_ID,
      title: "Order completed",
      message: "Your order for HDPE Plastic Drums has been marked as completed.",
      type: NotificationType.ORDER_COMPLETED,
      isRead: true,
      createdAt: daysAgo(17),
    },
    {
      id: IDS.notif3,
      userId: REAL_USER_ID,
      title: "New message from Amaka",
      message: "Amaka Obi sent you a message: \"That's genius, I'll try that for the challenge 🌱\"",
      type: NotificationType.MESSAGE_RECEIVED,
      isRead: false,
      createdAt: daysAgo(4),
    },
  ];

  for (const n of notifications) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: {},
      create: n,
    });
  }

  console.log("  ✓ Notifications seeded");
}

async function seedScanHistory() {
  console.log("  → Seeding scan history...");

  const scans = [
    {
      id: "seed_scan_001",
      userId: REAL_USER_ID,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      predictedMaterial: MaterialType.PLASTIC,
      confidenceScore: 0.94,
      createdAt: daysAgo(4),
    },
    {
      id: "seed_scan_002",
      userId: REAL_USER_ID,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      predictedMaterial: MaterialType.GLASS,
      confidenceScore: 0.87,
      createdAt: daysAgo(8),
    },
    {
      id: "seed_scan_003",
      userId: IDS.uAmaka,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      predictedMaterial: MaterialType.METAL,
      confidenceScore: 0.91,
      createdAt: daysAgo(6),
    },
    {
      id: "seed_scan_004",
      userId: IDS.uChidi,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      predictedMaterial: MaterialType.E_WASTE,
      confidenceScore: 0.78,
      createdAt: daysAgo(2),
    },
  ];

  for (const scan of scans) {
    await prisma.scanHistory.upsert({
      where: { id: scan.id },
      update: {},
      create: scan,
    });
  }

  console.log("  ✓ Scan history seeded");
}

// ─── Phase D: Posts, Likes, Bookmarks, Comments ──────────────────────────────

async function seedPosts() {
  console.log("  → Seeding posts...");

  await prisma.post.upsert({
    where: { id: IDS.post1 },
    update: {},
    create: {
      id: IDS.post1,
      authorId: IDS.uAmaka,
      type: "MOMENT",
      text: "Just finished planting 15 trees in my neighbourhood with the kids! 🌱 Small actions, big future. #PlantATree #CleanLagos",
      imageUrl: null,
      location: "Lagos, Nigeria",
      createdAt: daysAgo(0.08),
    },
  });

  await prisma.post.upsert({
    where: { id: IDS.post2 },
    update: {},
    create: {
      id: IDS.post2,
      authorId: IDS.uGreenEarth,
      type: "CHALLENGE_ANNOUNCEMENT",
      text: "New challenge launched! Collect 10kg of plastic waste this week and earn 500 EcoPoints. #PlasticFree #Challenge",
      imageUrl: null,
      location: "Abuja, Nigeria",
      challengeId: IDS.challenge1,
      createdAt: daysAgo(0.2),
    },
  });

  await prisma.post.upsert({
    where: { id: IDS.post3 },
    update: {},
    create: {
      id: IDS.post3,
      authorId: IDS.uEcoRecycle,
      type: "LISTING",
      text: "We're bidding on glass materials this week. Post yours and get competitive offers directly in your inbox.",
      imageUrl: null,
      location: "Port Harcourt",
      itemId: IDS.item3,
      createdAt: daysAgo(0.33),
    },
  });

  await prisma.post.upsert({
    where: { id: IDS.post4 },
    update: {},
    create: {
      id: IDS.post4,
      authorId: IDS.uChidi,
      type: "MOMENT",
      text: "Dropped off 12 old laptops and monitors at the e-waste centre today. Every gadget counts 💻♻️ #EWaste #TechForGood",
      imageUrl: null,
      location: "Enugu",
      createdAt: daysAgo(1),
    },
  });

  console.log("  ✓ Posts seeded (4 posts)");

  // ── Likes (never on own post) ────────────────────────────────────────────
  const likes = [
    { id: IDS.like_post1_chidi, userId: IDS.uChidi, targetId: IDS.post1 },
    { id: IDS.like_post1_greenearth, userId: IDS.uGreenEarth, targetId: IDS.post1 },
    { id: IDS.like_post1_real, userId: REAL_USER_ID, targetId: IDS.post1 },
    { id: IDS.like_post2_amaka, userId: IDS.uAmaka, targetId: IDS.post2 },
    { id: IDS.like_post2_real, userId: REAL_USER_ID, targetId: IDS.post2 },
    { id: IDS.like_post2_ecorecycle, userId: IDS.uEcoRecycle, targetId: IDS.post2 },
    { id: IDS.like_post3_amaka, userId: IDS.uAmaka, targetId: IDS.post3 },
    { id: IDS.like_post3_chidi, userId: IDS.uChidi, targetId: IDS.post3 },
    { id: IDS.like_post4_amaka, userId: IDS.uAmaka, targetId: IDS.post4 },
    { id: IDS.like_post4_real, userId: REAL_USER_ID, targetId: IDS.post4 },
  ];

  for (const like of likes) {
    await prisma.like.upsert({
      where: { id: like.id },
      update: {},
      create: {
        id: like.id,
        userId: like.userId,
        targetType: "POST",
        targetId: like.targetId,
      },
    });
  }

  console.log(`  ✓ Likes seeded (${likes.length} likes)`);

  // ── Bookmarks (never on own post) ────────────────────────────────────────
  const bookmarks = [
    { id: IDS.bm_post1_real, userId: REAL_USER_ID, postId: IDS.post1 },
    { id: IDS.bm_post2_real, userId: REAL_USER_ID, postId: IDS.post2 },
    { id: IDS.bm_post2_chidi, userId: IDS.uChidi, postId: IDS.post2 },
    { id: IDS.bm_post4_amaka, userId: IDS.uAmaka, postId: IDS.post4 },
  ];

  for (const bm of bookmarks) {
    await prisma.bookmark.upsert({
      where: { id: bm.id },
      update: {},
      create: bm,
    });
  }

  console.log(`  ✓ Bookmarks seeded (${bookmarks.length} bookmarks)`);

  // ── Comments ──────────────────────────────────────────────────────────────
  const comments = [
    {
      id: IDS.comment_post1_real,
      postId: IDS.post1,
      authorId: REAL_USER_ID,
      content: "This is amazing! Which species did you plant? Thinking of starting something similar in Apapa.",
      createdAt: daysAgo(0.05),
    },
    {
      id: IDS.comment_post1_chidi,
      postId: IDS.post1,
      authorId: IDS.uChidi,
      content: "Love this 🌱 Lagos needs more of this energy.",
      createdAt: daysAgo(0.03),
    },
    {
      id: IDS.comment_post2_real,
      postId: IDS.post2,
      authorId: REAL_USER_ID,
      content: "Just joined the challenge! Already have about 6kg sorted from this week.",
      createdAt: daysAgo(0.15),
    },
    {
      id: IDS.comment_post4_amaka,
      postId: IDS.post4,
      authorId: IDS.uAmaka,
      content: "12 laptops is huge! Did the centre give you a receipt for the challenge progress?",
      createdAt: daysAgo(0.9),
    },
  ];

  for (const c of comments) {
    await prisma.comment.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
  }

  console.log(`  ✓ Comments seeded (${comments.length} comments)`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 EcoMate seed starting...\n");

  await seedUsers();
  await seedItems();
  await seedArtworks();
  await seedAuctions();
  await seedOrders();
  await seedChallenges();
  await seedConversationsAndMessages();
  await seedNotifications();
  await seedScanHistory();
  await seedPosts();

  console.log("\n✅ Seed complete!\n");
  console.log("Demo credentials (all share the same password):");
  console.log("  Password:         Demo@1234");
  console.log("  Individual user:  amaka.obi@demo.ecomate.ng");
  console.log("  E-waste user:     chidi.nweze@demo.ecomate.ng");
  console.log("  NGO:              contact@greenearth.demo.ng");
  console.log("  Company:          procurement@ecorecycle.demo.ng");
  console.log("  Admin:            admin@ecomate.ng\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });