-- QA-002: Per-account login lockout
-- Adds columns to track failed login attempts and lock accounts temporarily.
-- After 10 failed attempts, the account is locked for 30 minutes.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until timestamptz DEFAULT NULL;
