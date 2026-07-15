-- C-10 — Mandatory admin MFA, timestamped step-up freshness, and recovery codes.
-- Adds the time-bound 2FA verification column and user enrollment/lockout state.

-- Step-up freshness: sessions now record when 2FA was last verified.
-- The existing boolean column is kept for backward compatibility during the
-- deploy window; the application reads from twofa_verified_at and writes both.
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS twofa_verified_at TIMESTAMPTZ;

-- Enrolled admins need a pending enrollment bucket so the secret is only promoted
-- after a successful verification (verified enrollment transaction).
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_pending_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_pending_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled_at TIMESTAMPTZ;

-- Failed-TOTP lockout counters and recovery-code state live in dedicated tables.
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_failed_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_locked_until TIMESTAMPTZ;

-- Single-use recovery codes for admin MFA lockout/recovery flow.
CREATE TABLE IF NOT EXISTS admin_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_recovery_codes_user_id ON admin_recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_recovery_codes_user_used ON admin_recovery_codes(user_id, used_at) WHERE used_at IS NULL;
