import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// In development, ensure new schema models are picked up if client was generated while dev server was running
if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma && !(globalForPrisma.prisma as any).newsletterSubscriber) {
  try {
    (globalForPrisma.prisma as any).$disconnect?.();
  } catch {}
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ['query'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

