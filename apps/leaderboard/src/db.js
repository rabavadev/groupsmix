// Postgres data layer for the leaderboard Worker, on postgres.js.
//
// postgres.js (Cloudflare-listed Hyperdrive driver) gave the best reliability
// of the approaches tried: a single persistent connection per Worker isolate,
// kept warm, with Hyperdrive doing the global pooling to Supabase's DIRECT
// host (per Cloudflare's Supabase guide, use the direct connection, not the
// pooler). node-pg's per-request Client was worse (each request paid a full
// connect); node-pg's persistent Pool was middling.
//
// Exposes query()/one() for reads (safe to retry) and exec()/execOne() for
// mutations (no retry — callers must handle idempotency themselves). index.js
// populates process.env.DATABASE_URL from env.HYPERDRIVE.connectionString at
// the top of fetch, before any query runs.
import postgres from "postgres";

// Two strategies:
// - Simple queries (query/one/exec): fresh connection per call, closed after.
//   This eliminates stale-connection 500s on public page loads after idle.
// - Transactions (getSql().begin()): cached connection, kept warm.
//   These run from active dashboard sessions where the connection stays alive.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function createSql() {
  return postgres(process.env.DATABASE_URL, {
    max: 1,
    prepare: false,
    idle_timeout: 5,
    connect_timeout: 10,
    debug: false,
  });
}

// Cached instance for transactions (getSql().begin())
let txSql = null;
export function getSql() {
  if (!txSql) {
    txSql = createSql();
  }
  return txSql;
}

/** Run a query with up to 3 attempts, each on a fresh connection. */
async function withRetry(text, params) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    const sql = createSql();
    try {
      const rows = await sql.unsafe(text, params);
      return rows.map((r) => ({ ...r }));
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || e);
      if (/23505|23514|23503|23502|23506/.test(msg)) throw e;
      if (attempt < 2) await sleep(200 * (attempt + 1));
    } finally {
      try { await sql.end({ timeout: 1 }); } catch {}
    }
  }
  throw lastErr;
}

export async function query(text, params = []) {
  return withRetry(text, params);
}

export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0];
}

export async function exec(text, params = []) {
  return withRetry(text, params);
}

/** Like exec() but returns the first row (or undefined). */
export async function execOne(text, params = []) {
  const rows = await exec(text, params);
  return rows[0];
}
