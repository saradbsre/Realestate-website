import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined.");
  }
  
  // Use pg.Pool instead of Client to handle connection drops, idle timeouts, and retries automatically
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10, // maximum number of clients in the pool
    idleTimeoutMillis: 30000, // close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // return an error if a connection cannot be established within 5 seconds
  });
  
  // Handle pool errors gracefully to prevent Express from crashing
  pool.on("error", (err) => {
    console.error("PostgreSQL Pool encountered an unexpected error:", err);
  });
  
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
