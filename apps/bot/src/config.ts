// config values are read LIVE from process.env via getters (see below) because
// worker.ts populates process.env from the Hyperdrive binding at fetch time —
// after this module has already evaluated. Nothing throws at import time so the
// Worker can boot and serve /health before any DB call.

// databaseUrl is read LIVE (getter) rather than snapshotted at module load,
// because worker.ts sets process.env.DATABASE_URL from the HYPERDRIVE binding
// at fetch time — after this module has already evaluated.
export const config = {
  get databaseUrl() {
    return process.env.DATABASE_URL;
  },
  get publicBaseUrl() {
    return (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  },
  get tokenEncKey() {
    return Buffer.from(process.env.TOKEN_ENC_KEY || "", "hex");
  },
  get adminApiKey() {
    return process.env.ADMIN_API_KEY || "";
  },
  get ipHashSalt() {
    return process.env.IP_HASH_SALT || "";
  },
  port: Number(process.env.PORT ?? 3000),
};

// Validate lazily — only complain when a value is actually needed and missing.
// (Called by data-layer code on first use rather than at import time, so the
// Worker can boot and serve /health even before bindings are read.)
export function requireConfig(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
