import { prisma } from "../prisma";

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);
  return slug || "ecomate";
}

/**
 * Generate a unique `username` from a seed (email local-part or company name).
 * The User model requires a unique username that we don't collect in the
 * signup forms, so we derive one and guarantee uniqueness with a random suffix.
 */
export async function generateUniqueUsername(seed: string): Promise<string> {
  const root = slugify(seed);

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 7);
    const candidate = `${root}_${suffix}`;
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }

  return `${root}_${Date.now().toString(36)}`;
}
