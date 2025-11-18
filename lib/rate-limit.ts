// Simple in-memory rate limiting (for production, use Redis or Vercel Edge Config)

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }
  
  // If limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get rate limit key from request (user ID or IP)
 */
export function getRateLimitKey(userId?: string, ip?: string): string {
  // Prefer userId for authenticated requests, fallback to IP
  return userId ? `user:${userId}` : `ip:${ip || 'unknown'}`;
}

// Rate limit configurations
export const RATE_LIMITS = {
  AUTHENTICATED: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 per minute
  SIGNUP: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  TASK_CREATE: { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
  INCOME_ENTRY: { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 per hour
} as const;

