-- DB-019-v8: postback_key_enc was added to the WRONG table (users).
-- scores.js queries sites.postback_key, so the encrypted column belongs on sites.
-- Move it: add to sites, drop from users.

ALTER TABLE sites ADD COLUMN IF NOT EXISTS postback_key_enc bytea;
COMMENT ON COLUMN sites.postback_key_enc IS 'AES-256-GCM encrypted postback_key (SEC-003). Lazily migrated from plaintext postback_key.';

-- Drop the misplaced column from users (safe: no code references it)
ALTER TABLE users DROP COLUMN IF EXISTS postback_key_enc;
