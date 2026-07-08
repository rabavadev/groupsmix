-- ============================================================
-- Migration: Link Telegram identity to user accounts (Phase 5.1)
--
-- Adds telegram_id and telegram_username columns to users table.
-- Allows unified auth: one account, linked Telegram identity.
-- ============================================================

-- Add Telegram identity columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_linked_at TIMESTAMPTZ;

-- Index for fast lookup by telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id) WHERE telegram_id IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN users.telegram_id IS 'Telegram user ID from Login widget. Unique — one Telegram account per user.';
COMMENT ON COLUMN users.telegram_username IS 'Telegram @username at time of linking (display only, may change).';
COMMENT ON COLUMN users.telegram_linked_at IS 'When the Telegram identity was linked to this account.';
