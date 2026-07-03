-- ============================================================
--  Migration 006 — Fix RLS anon access (DB-001)
--  Drops overly-permissive policies, recreates restricted to service_role
-- ============================================================

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'users','sites','players','leads','archives','site_stats',
    'bots','bot_subscribers','bot_commands','offers','casinos',
    'short_links','clicks','click_daily','conversions',
    'stream_channels','broadcasts','subscriptions','payments'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Drop old permissive policy
    EXECUTE format('DROP POLICY IF EXISTS service_all ON %I', t);
    -- Create new service_role-restricted policy (idempotent)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_' || t AND tablename = t
    ) THEN
      EXECUTE format(
        'CREATE POLICY service_role_all_%I ON %I TO service_role USING (true) WITH CHECK (true)',
        t, t
      );
    END IF;
  END LOOP;
END $$;
