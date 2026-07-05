-- SEC-003: Encrypt postback_key at rest
-- Add encrypted column; existing plaintext keys will be migrated lazily by the app.
-- The plaintext column remains temporarily for the migration period.

ALTER TABLE users ADD COLUMN IF NOT EXISTS postback_key_enc bytea;

COMMENT ON COLUMN users.postback_key_enc IS 'AES-256-GCM encrypted postback_key (SEC-003). Lazily migrated from plaintext postback_key.';
