-- ============================================================
--  Migration 003 — Enable Row Level Security on ALL tables
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
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'service_all' AND tablename = t
    ) THEN
      EXECUTE format(
        'CREATE POLICY service_all ON %I USING (true) WITH CHECK (true)', t
      );
    END IF;
  END LOOP;
END $$;
