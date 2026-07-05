-- DB-008-v8: Add composite index on players(site_id, wagered DESC) for getPlayers queries
-- getPlayers is called on every public view + dashboard load. Without this index,
-- Postgres does a sequential scan + sort on every request.
CREATE INDEX IF NOT EXISTS idx_players_site_wagered ON players (site_id, wagered DESC);
