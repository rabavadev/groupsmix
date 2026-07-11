// Re-export the shared rate limiter so existing bot imports keep working.
// The shared implementation lives in ../../shared/ratelimit.ts and supports
// both KV and Durable Object backends via RL_BACKEND env var.
export { rateLimit } from "../../../shared/ratelimit.js";
export type { RateLimitKV, RateLimitEnv, RateLimitResult } from "../../../shared/ratelimit.js";
