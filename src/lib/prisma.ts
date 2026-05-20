import { PrismaClient } from "@/generated/prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
console.log("Initializing Prisma with database at:", dbPath);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;