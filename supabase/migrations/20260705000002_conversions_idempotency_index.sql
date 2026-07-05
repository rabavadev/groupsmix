-- DB-002: Authoritative idempotency guard for conversions.
-- Prevents duplicate rows from concurrent/retried postbacks.
-- The SELECT-then-INSERT in conversions.ts is a fast-path early return;
-- this unique index is the authoritative dedup layer.

-- Handle NULL amounts: two conversions with the same (owner, click_ref, event)
-- but both NULL amounts should be treated as duplicates. Standard unique
-- indexes treat NULLs as distinct, so we coalesce NULL to a sentinel.
CREATE UNIQUE INDEX IF NOT EXISTS conversions_idempotency_idx
  ON conversions (owner_id, click_ref, event, COALESCE(amount, -1));
