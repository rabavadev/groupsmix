// Custom domain resolution with in-memory caching
// Maps custom domain hostnames to site slugs for serving leaderboards on custom domains
import { one } from "../../../../shared/db.js";

const CUSTOM_DOMAIN_CACHE = new Map();
const CUSTOM_DOMAIN_TTL = 60_000; // 60 seconds
const CUSTOM_DOMAIN_MAX = 1000;   // PERF-005: cap entries to prevent unbounded memory growth

export async function resolveCustomDomain(env, host) {
  const now = Date.now();
  const cached = CUSTOM_DOMAIN_CACHE.get(host);
  if (cached && cached.expires > now) return cached.slug;
  try {
    const row = await one("SELECT s.slug FROM sites s JOIN users u ON u.id = s.user_id WHERE s.custom_domain=$1 AND s.published=true AND u.status != 'suspended'", [host]);
    const slug = row?.slug || null;
    CUSTOM_DOMAIN_CACHE.set(host, { slug, expires: now + CUSTOM_DOMAIN_TTL });
    // PERF-005: FIFO eviction — delete oldest entries when cache exceeds max size
    while (CUSTOM_DOMAIN_CACHE.size > CUSTOM_DOMAIN_MAX) {
      const first = CUSTOM_DOMAIN_CACHE.keys().next().value;
      CUSTOM_DOMAIN_CACHE.delete(first);
    }
    return slug;
  } catch {
    return cached?.slug || null;
  }
}

export function isCustomHost(host) {
  return host !== "yourrank.site" && host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".yourrank.site");
}
