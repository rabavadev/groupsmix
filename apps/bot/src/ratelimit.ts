// Re-export the shared rate limiter so existing bot imports keep working.
// The shared implementation lives in ../../shared/ratelimit.ts and is
// imported by both the bot and leaderboard Workers.
export { rateLimit } from "../../../shared/ratelimit.js";
export type { RateLimitKV, RateLimitResult } from "../../../shared/ratelimit.js";
