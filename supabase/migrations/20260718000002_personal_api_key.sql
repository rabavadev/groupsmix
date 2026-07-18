-- Personal API keys for bulk player updates
ALTER TABLE users ADD COLUMN api_key_hash TEXT;
ALTER TABLE users ADD COLUMN api_key_prefix TEXT;
CREATE INDEX idx_users_api_key_prefix ON users(api_key_prefix);
