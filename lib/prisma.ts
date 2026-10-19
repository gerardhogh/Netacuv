import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// In development, ensure new schema models are picked up if client was generated while dev server was running
if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma && !(globalForPrisma.prisma as any).newsletterSubscriber) {
  try {
    (globalForPrisma.prisma as any).$disconnect?.();
  } catch {}
  globalForPrisma.prisma = undefined;
}

/**
 * Optimise et sécurise l'URL de connexion PostgreSQL/Supabase.
 * - Sur Supabase Pooler, le port 5432 utilise le 'Session Mode', limité à pool_size: 15 max.
 *   Dans les architectures Next.js / Serverless (Vercel ou instances multiples), cela provoque immédiatement :
 *   "FATAL: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15"
 * - Le port 6543 bascule vers le 'Transaction Mode' (PgBouncer), gérant des milliers de requêtes concurrentes.
 */
function getOptimizedDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // Si l'URL utilise le pooler Supabase sur le port 5432, basculer automatiquement vers 6543
  if (url.includes('pooler.supabase.com:5432')) {
    url = url.replace('pooler.supabase.com:5432', 'pooler.supabase.com:6543');
  }

  // S'assurer que pgbouncer=true et connection_limit sont bien configurés
  if (url.includes('pooler.supabase.com') || url.includes(':6543')) {
    const hasParams = url.includes('?');
    if (!url.includes('pgbouncer=true')) {
      url += (hasParams ? '&' : '?') + 'pgbouncer=true';
    }
    if (!url.includes('connection_limit=')) {
      url += '&connection_limit=5';
    }
  }

  return url;
}

const dbUrl = getOptimizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ['error'] : ['error'],
  });

globalForPrisma.prisma = prisma;

