// Postgres data layer for the leaderboard Worker.
// Mirrors casino-bot-platform/src/db.ts so both Workers share one API.
//
// The Pool is created lazily on first use so that index.js's fetch handler
// has a chance to populate process.env.DATABASE_URL (from the Hyperdrive
// binding) before the Pool reads the connection string.
import pg from "pg";
const { Pool } = pg;

let pool = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Hyperdrive pools server-side; a Worker isolate only needs 1-2 clients
      // at a time. Higher max spawns excess connections that race cold setup.
      max: 2,
      // Cold Hyperdrive connections can take >1s to establish; give them room.
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

/** Run a query and return the rows array.
 *  Hyperdrive's pooled connections occasionally throw on first use while the
 *  connection is still being established (manifests as an intermittent 1101).
 *  A single retry on the SAME pool lets a different, ready client handle it.
 *  (Tearing the pool down on each failure made it worse — it lost warm clients.)
 *  Tuned pool: max 2 clients per isolate, generous connect timeout. */
export async function query(text, params = []) {
  try {
    const res = await getPool().query(text, params);
    return res.rows;
  } catch (err) {
    // Same pool, second try — a different client is likely ready by now.
    const res = await getPool().query(text, params);
    return res.rows;
  }
}

/** Like query() but returns the first row (or undefined). */
export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0];
}
