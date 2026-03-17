import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Using globalThis to persist the client across re-evaluations in development and production
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Simplify connection string and ensure SSL is handled
const connectionString = process.env.DATABASE_URL?.replace('sslmode=require', '');

// Use a very small pool size for serverless functions (lambdas)
const pool = new Pool({
  connectionString,
  max: 2, // Reducing to 2 per lambda to avoid exhausting Supabase limits
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false, 
  },
});

const adapter = new PrismaPg(pool);

// Use existing client or create a new one
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // In production, we also want to try and persist the client within the same process
  globalForPrisma.prisma = prisma;
}

export default prisma;
