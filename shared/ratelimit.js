// ------------------------------------------------------------------
// Shared KV-backed fixed-window rate limiter.
//
// Used by both the leaderboard and bot Workers. Uses a KV namespace
// (typically SESSIONS) for storage. Keys are short-lived (expirationTtl
// = window), so the store self-cleans and there's nothing to sweep.
//
// Fixed-window is intentionally simple: it can allow up to ~2x the limit
// across a window boundary, which is fine for coarse abuse/brute-force
// protection. It is NOT a billing-accurate quota.
//
// KV reads are eventually consistent, so this is best-effort under heavy
// concurrent bursts — again, fine as a brute-force speed bump.
//
// IMPORTANT: Due to KV's eventual consistency and lack of atomic increment,
// this limiter can under-count under burst conditions. Concurrent requests
// may read stale values and all increment from the same baseline, allowing
// more requests than the configured limit during bursts.
//
// FAILS CLOSED: if KV is unavailable, the request is denied.
// ------------------------------------------------------------------

/**
 * Count one hit against `id` in a `windowSec` window allowing `limit` hits.
 * Returns whether this hit is allowed plus headroom info for headers.
 * Fails CLOSED (denies the request) if KV is unavailable.
 */
export async function rateLimit(kv, id, limit, windowSec) {
  if (!kv) return { ok: false, remaining: 0, limit, retryAfter: windowSec };

  const window = Math.floor(Date.now() / 1000 / windowSec);
  const key = `rl:${id}:${window}`;

  try {
    const current = Number((await kv.get(key)) ?? 0);
    const used = current + 1;
    const retryAfter = windowSec - (Math.floor(Date.now() / 1000) % windowSec);

    if (current >= limit) {
      return { ok: false, remaining: 0, limit, retryAfter };
    }

    // Refresh the TTL to the current window each hit; the key dies with the window.
    await kv.put(key, String(used), { expirationTtl: windowSec });
    return { ok: true, remaining: Math.max(0, limit - used), limit, retryAfter };
  } catch {
    // Fail closed: if KV is down, deny the request.
    return { ok: false, remaining: 0, limit, retryAfter: windowSec };
  }
}
