-- ============================================================================
-- Replace Cloudflare KV session storage with Postgres-backed sessions.
-- Eliminates the 1,000 writes/day KV free-tier limit that causes 500s.
-- ============================================================================

-- Main sessions table (replaces KV key "sess:<token>")
CREATE TABLE IF NOT EXISTS sessions (
  token        TEXT PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days',
  twofa_verified BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Password reset tokens (replaces KV key "reset:<token>")
CREATE TABLE IF NOT EXISTS password_resets (
  token      TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '1 hour'
);

-- Cleanup: periodic DELETE FROM sessions WHERE expires_at < now()
-- can be run via pg_cron or the existing 03:00 UTC cron job.
