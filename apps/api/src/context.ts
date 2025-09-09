import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  return {
    req,
    res,
    db: getPrisma(),
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
