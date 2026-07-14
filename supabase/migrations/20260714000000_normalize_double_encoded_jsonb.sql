-- Normalize double-encoded JSONB values written by the pre-fix code path.
-- Older code called JSON.stringify() before binding a value to a `::jsonb`
-- parameter, so postgres.js JSON-encoded it a SECOND time and the column ended
-- up holding a JSON *string* (e.g. '"{\"template\":\"neon\"}"') instead of the
-- intended object/array. Application reads now self-heal these rows, but this
-- migration permanently unwraps them so `jsonb_typeof(col)` reflects the real
-- shape (object/array) again.
--
-- A row is only rewritten when jsonb_typeof(col) = 'string' AND the wrapped
-- text is itself valid JSON, so genuine (non-double-encoded) string values are
-- left untouched.

CREATE OR REPLACE FUNCTION pg_temp.unwrap_jsonb(v jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF v IS NULL OR jsonb_typeof(v) <> 'string' THEN
    RETURN v;
  END IF;
  RETURN (v #>> '{}')::jsonb;
EXCEPTION WHEN others THEN
  RETURN v;
END;
$$;

UPDATE public.sites
SET theme_json = pg_temp.unwrap_jsonb(theme_json)
WHERE jsonb_typeof(theme_json) = 'string';

UPDATE public.sites
SET extra_json = pg_temp.unwrap_jsonb(extra_json)
WHERE jsonb_typeof(extra_json) = 'string';

UPDATE public.archives
SET snapshot_json = pg_temp.unwrap_jsonb(snapshot_json)
WHERE jsonb_typeof(snapshot_json) = 'string';

UPDATE public.payments
SET payload_json = pg_temp.unwrap_jsonb(payload_json)
WHERE jsonb_typeof(payload_json) = 'string';

UPDATE public.admin_audit
SET details = pg_temp.unwrap_jsonb(details)
WHERE details IS NOT NULL AND jsonb_typeof(details) = 'string';
