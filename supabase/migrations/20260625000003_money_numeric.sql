-- ============================================================
--  Migration 004 — Fix money columns: DOUBLE PRECISION → NUMERIC
-- ============================================================

DO $$
BEGIN
  -- Only alter if column is still double precision
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'wagered' AND data_type = 'double precision'
  ) THEN
    ALTER TABLE players ALTER COLUMN wagered TYPE NUMERIC(15,2);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'prize' AND data_type = 'double precision'
  ) THEN
    ALTER TABLE players ALTER COLUMN prize TYPE NUMERIC(15,2);
  END IF;
END $$;
