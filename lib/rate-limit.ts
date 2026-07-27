import "server-only";

/**
 * In-memory fixed-window rate limiter. Single-instance only - state resets on
 * redeploy/restart and isn't shared across horizontally-scaled instances.
 * Fine for the current deployment; revisit with a shared store (e.g. Upstash
 * Redis) if scaled horizontally.
 */
const globalForRateLimit = globalThis as unknown as {
  rateLimitWindows?: Map<string, { count: number; resetAt: number }>;
};

function getStore(): Map<string, { count: number; resetAt: number }> {
  if (!globalForRateLimit.rateLimitWindows) {
    globalForRateLimit.rateLimitWindows = new Map();
  }
  return globalForRateLimit.rateLimitWindows;
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

/** Allows up to `max` calls per `windowMs` for a given `key`. */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
