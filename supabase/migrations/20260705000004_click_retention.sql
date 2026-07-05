-- ============================================================
--  DB-101: Click data retention policy
--
--  click_daily grows unbounded because there is no database-level
--  cleanup.  The bot's nightly rollup already prunes 30-day-old
--  rows inline, but this SQL function provides a database-level
--  safety net and a single call-site for maintenance.
--
--  Retention: click_daily rows older than 90 days are deleted.
--  The bot calls this function from its nightly cron (0 3 * * *).
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_old_clicks()
RETURNS TABLE(deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count bigint;
BEGIN
  DELETE FROM click_daily WHERE day < current_date - 90;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  deleted_count := v_count;
  RETURN NEXT;

  -- Log to PostgreSQL server log for operational visibility
  RAISE NOTICE 'cleanup_old_clicks: deleted % click_daily rows older than 90 days', v_count;
END;
$$;

-- Restrict execution to service_role only (no anon/authenticated)
REVOKE EXECUTE ON FUNCTION cleanup_old_clicks() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION cleanup_old_clicks() FROM anon;
REVOKE EXECUTE ON FUNCTION cleanup_old_clicks() FROM authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_clicks() TO service_role;
