// Per-site daily analytics. Cheap upsert counters in Postgres — no external service.
import { query } from "../../../shared/db.js";
import { bumpStat, todayUTC } from "../../../shared/stats.js";
export { bumpStat, todayUTC };

// Last 30 days of rows plus rolled-up totals for the dashboard.
export async function getStats(env, siteId) {
  const since = new Date(Date.now() - 29 * 86400e3).toISOString().slice(0, 10);
  // day comes back as a DATE — normalise to a 'YYYY-MM-DD' string so the
  // client-side comparisons/lookups below keep matching.
  const rows = (await query(
    "SELECT to_char(day, 'YYYY-MM-DD') AS day, views, copies, clicks FROM site_stats WHERE site_id=$1 AND day>=$2 ORDER BY day ASC",
    [siteId, since]
  )) || [];
  const today = todayUTC();
  const since7 = new Date(Date.now() - 6 * 86400e3).toISOString().slice(0, 10);
  const sum = (from, f) => rows.reduce((n, r) => (r.day >= from ? n + (Number(r[f]) || 0) : n), 0);
  // Dense last-14-days series for the bar chart (missing days = 0).
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400e3).toISOString().slice(0, 10);
    const row = rows.find((r) => r.day === d);
    days.push({ day: d, views: Number(row?.views) || 0, copies: Number(row?.copies) || 0, clicks: Number(row?.clicks) || 0 });
  }
  return {
    today: { views: sum(today, "views"), copies: sum(today, "copies"), clicks: sum(today, "clicks") },
    last7: { views: sum(since7, "views"), copies: sum(since7, "copies"), clicks: sum(since7, "clicks") },
    last30: { views: sum(since, "views"), copies: sum(since, "copies"), clicks: sum(since, "clicks") },
    days,
  };
}

// 7x24 heatmap grid of view counts for the last 30 days.
export async function getHeatmap(env, siteId) {
  try {
    const since = new Date(Date.now() - 29 * 86400e3).toISOString().slice(0, 10);
    const rows = await query(
      "SELECT day_of_week, hour, SUM(views)::int AS views FROM site_stats_hourly WHERE site_id=$1 AND day>=$2 GROUP BY day_of_week, hour",
      [siteId, since]
    );
    // Build 7x24 grid (all zeros).
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const r of (rows || [])) {
      const dow = Number(r.day_of_week);
      const hr = Number(r.hour);
      if (dow >= 0 && dow <= 6 && hr >= 0 && hr < 24) grid[dow][hr] = Number(r.views) || 0;
    }
    return grid;
  } catch (err) {
    console.error("[getHeatmap]: failed", err);
    return Array.from({ length: 7 }, () => Array(24).fill(0));
  }
}

// Top 5 referrer domains for the last 30 days.
export async function getTopReferrers(env, siteId) {
  try {
    const since = new Date(Date.now() - 29 * 86400e3).toISOString().slice(0, 10);
    const rows = await query(
      "SELECT domain, SUM(count)::int AS total FROM site_referrers WHERE site_id=$1 AND day>=$2 GROUP BY domain ORDER BY total DESC LIMIT 5",
      [siteId, since]
    );
    return (rows || []).map(r => ({ domain: r.domain, count: Number(r.total) || 0 }));
  } catch (err) {
    console.error("[getTopReferrers]: failed", err);
    return [];
  }
}
