-- Fix ends_at column type from TEXT to TIMESTAMPTZ
-- This migration converts existing text dates to proper timestamps.
-- Must drop default first (text default can't auto-cast to timestamptz).

-- Drop the existing text default
ALTER TABLE sites ALTER COLUMN ends_at DROP DEFAULT;

-- Convert column type
ALTER TABLE sites 
  ALTER COLUMN ends_at TYPE timestamptz 
  USING CASE 
    WHEN ends_at ~ '^\d{4}-\d{2}-\d{2}' THEN ends_at::timestamptz
    ELSE NULL
  END;

-- Re-add a sensible default (NULL is fine for optional expiry)
ALTER TABLE sites ALTER COLUMN ends_at SET DEFAULT NULL;
