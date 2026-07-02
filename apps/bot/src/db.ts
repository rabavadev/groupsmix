import { Pool, type QueryResultRow } from "pg";
import { config } from "./config.js";

// Lazy Pool: config.databaseUrl is populated from process.env at fetch time
// (worker.ts sets it from the HYPERDRIVE binding), so the Pool must NOT be
// constructed at module load. Built on first use instead.
let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: 2,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

/** Run a query and return the rows array.
 *  Hyperdrive's pooled connections occasionally throw on first use while the
 *  connection is still being established. A single retry on the SAME pool lets
 *  a different, ready client handle it. Tuned pool: max 2, generous timeout. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  try {
    const res = await getPool().query<T>(text, params as any[]);
    return res.rows;
  } catch {
    const res = await getPool().query<T>(text, params as any[]);
    return res.rows;
  }
}

/** Like query() but returns the first row (or undefined). */
export async function one<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}
