-- DB-009-v1: Extend players with extra per-player fields used by full-page leaderboard designs.
-- score/hands/net_profit/win_rate/change are optional; defaults keep existing rows valid.
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS score NUMERIC(15,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS hands INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS net_profit NUMERIC(15,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS win_rate NUMERIC(5,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS change INTEGER DEFAULT 0 NOT NULL;

-- Index to keep top rankings by score fast for designs that sort by score instead of wagered.
CREATE INDEX IF NOT EXISTS idx_players_site_score ON players (site_id, score DESC);
