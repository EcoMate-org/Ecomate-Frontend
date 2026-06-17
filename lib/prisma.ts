import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

// Debug: Log available environment keys (excluding noisy system vars)
if (process.env.NODE_ENV !== "production") {
  console.log("Loaded Environment Keys:", Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('NODE_')));
}

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Please ensure your .env file is in the project root and the variable name is exactly 'DATABASE_URL'.");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
