-- ============================================================
--  Migration 005 — CHECK constraints on money columns
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'positive_wagered') THEN
    ALTER TABLE players ADD CONSTRAINT positive_wagered CHECK (wagered >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'positive_prize') THEN
    ALTER TABLE players ADD CONSTRAINT positive_prize CHECK (prize >= 0);
  END IF;
END $$;
