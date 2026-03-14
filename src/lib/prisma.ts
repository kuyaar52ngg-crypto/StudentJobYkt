import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL?.replace('sslmode=require', '');

// Limit pool size to prevent exhausting Supabase Session Pooler
const pool = new Pool({
  connectionString,
  max: 3, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false, // For Supabase connections
  },
});

const adapter = new PrismaPg(pool);

declare global {
  var __prisma: PrismaClient | undefined;
}

// Bypass turbopack browser stub
const PrismaClientNode = typeof window === "undefined" 
  ? eval('require("@prisma/client").PrismaClient') 
  : PrismaClient;

const prisma = globalThis.__prisma ?? new PrismaClientNode({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export { prisma };
export default prisma;
