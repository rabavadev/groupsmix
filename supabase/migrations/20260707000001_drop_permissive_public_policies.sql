-- ============================================================
--  Migration: Drop permissive public role RLS policies
--
--  All tables had `service_all` policies on the `public` role
--  with USING(true) WITH CHECK(true), which gives full access
--  to anon and authenticated roles. Since ALL Worker access
--  goes through service_role (bypasses RLS entirely via
--  Hyperdrive), these policies are dead code but a defense-in-
--  depth hole — if the Supabase anon key is ever exposed,
--  every table is wide open.
--
--  Fix: Drop all public role policies. Workers are unaffected
--  (service_role bypasses RLS). Supabase REST API with anon
--  key will be blocked by default (no matching policy).
-- ============================================================

-- Tables that have the permissive `service_all` public policy
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'archives', 'bot_commands', 'bot_subscribers', 'bots',
    'broadcasts', 'casinos', 'click_daily', 'clicks',
    'conversions', 'leads', 'offers', 'payments',
    'players', 'short_links', 'site_stats', 'sites',
    'stream_channels', 'subscriptions', 'users'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS service_all ON %I', t);
  END LOOP;
END $$;
