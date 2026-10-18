/**
 * In-memory Login Rate Limiting for Netacuv
 * Protects against brute-force password guessing.
 * Max 5 attempts -> 5 minutes temporary lockout.
 */

interface RateLimitEntry {
  attempts: number;
  lockoutUntil: number;
  lastAttempt: number;
}

const attemptsMap = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function checkLoginRateLimit(key: string): {
  allowed: boolean;
  remainingSeconds?: number;
} {
  const normalizedKey = key.trim().toLowerCase();
  const entry = attemptsMap.get(normalizedKey);
  if (!entry) return { allowed: true };

  const now = Date.now();
  if (entry.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((entry.lockoutUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  // If lockout expired, reset
  if (entry.lockoutUntil > 0 && entry.lockoutUntil <= now) {
    attemptsMap.delete(normalizedKey);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(key: string): {
  locked: boolean;
  attempts: number;
  remainingAttempts: number;
  remainingSeconds?: number;
} {
  const normalizedKey = key.trim().toLowerCase();
  const now = Date.now();
  const entry = attemptsMap.get(normalizedKey) || {
    attempts: 0,
    lockoutUntil: 0,
    lastAttempt: now,
  };

  // If previous lockout expired, reset counter
  if (entry.lockoutUntil > 0 && entry.lockoutUntil <= now) {
    entry.attempts = 0;
    entry.lockoutUntil = 0;
  }

  entry.attempts += 1;
  entry.lastAttempt = now;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockoutUntil = now + LOCKOUT_DURATION_MS;
    attemptsMap.set(normalizedKey, entry);
    return {
      locked: true,
      attempts: entry.attempts,
      remainingAttempts: 0,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    };
  }

  attemptsMap.set(normalizedKey, entry);
  return {
    locked: false,
    attempts: entry.attempts,
    remainingAttempts: MAX_ATTEMPTS - entry.attempts,
  };
}

export function resetLoginRateLimit(key: string) {
  const normalizedKey = key.trim().toLowerCase();
  attemptsMap.delete(normalizedKey);
}
