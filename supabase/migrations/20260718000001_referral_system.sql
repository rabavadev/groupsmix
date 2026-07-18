-- Referral system v2: per-user referral codes, referred-by tracking, and rewards ledger.
-- Re-adds columns dropped by 20260703000000_drop_referral_schema.sql and adds a reward table.

-- Clean up a stale schema_migrations row from any previous failed push so that
-- supabase db push can re-apply this migration and re-record it cleanly.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations'
  ) THEN
    DELETE FROM supabase_migrations.schema_migrations WHERE version = '20260718000001';
  END IF;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  reward_days INT NOT NULL DEFAULT 31,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);

-- Backfill existing users with deterministic codes, ensuring no collisions.
DO $$
DECLARE
  user_rec RECORD;
  candidate TEXT;
  counter INT;
BEGIN
  FOR user_rec IN
    SELECT id, LOWER(SUBSTRING(id::text FROM 1 FOR 8)) AS base
    FROM users
    WHERE referral_code IS NULL
    ORDER BY id
  LOOP
    candidate := user_rec.base;
    counter := 1;
    WHILE EXISTS (SELECT 1 FROM users WHERE referral_code = candidate) LOOP
      counter := counter + 1;
      candidate := user_rec.base || counter::text;
    END LOOP;
    UPDATE users SET referral_code = candidate WHERE id = user_rec.id;
  END LOOP;
END $$;

-- Add the unique constraint only after backfilling unique values.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_referral_code_key'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);
  END IF;
END $$;
