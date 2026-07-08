// Attribution dashboard handler (Phase 7.1)
// Shows "you drove $X in deposits / N depositors" with per-offer breakdowns.

import { requireUser, json, bad, rateLimit } from "../auth.js";
import { query, one } from "../../../../shared/db.js";

/**
 * GET /api/attribution?days=30
 * Returns attribution metrics for the current user's boards.
 */
export async function handleAttribution(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 365);

  if (!(await rateLimit(env, `attribution:${user.id}`, 30, 60)).ok) {
    return bad("Rate limit exceeded. Try again shortly.", 429);
  }

  // Get all boards for this user
  const boards = await query(
    `SELECT id, slug, name FROM sites WHERE user_id = $1 AND status = 'active'`,
    [user.id]
  );

  if (boards.length === 0) {
    return json({
      ok: true,
      days,
      summary: { clicks: 0, conversions: 0, revenue: 0, depositors: 0 },
      boards: [],
    });
  }

  const boardIds = boards.map((b) => b.id);

  // Aggregate clicks per board
  const clickRows = await query(
    `SELECT sl.slug, COUNT(c.id) as clicks, COUNT(DISTINCT c.ip_hash) as unique_visitors
     FROM clicks c
     JOIN short_links sl ON sl.id = c.short_link_id
     WHERE sl.slug = ANY($1)
       AND c.created_at > now() - interval '${days} days'
     GROUP BY sl.slug`,
    [boards.map((b) => b.slug)]
  );

  // Aggregate conversions per board
  const conversionRows = await query(
    `SELECT sl.slug, COUNT(cv.id) as conversions, COALESCE(SUM(cv.amount), 0) as revenue, COUNT(DISTINCT cv.click_ref) as depositors
     FROM conversions cv
     JOIN short_links sl ON sl.id = cv.short_link_id
     WHERE sl.slug = ANY($1)
       AND cv.created_at > now() - interval '${days} days'
       AND cv.status IN ('confirmed', 'finished')
     GROUP BY sl.slug`,
    [boards.map((b) => b.slug)]
  );

  // Merge data
  const boardData = boards.map((board) => {
    const clicks = clickRows.find((c) => c.slug === board.slug);
    const conversions = conversionRows.find((cv) => cv.slug === board.slug);
    return {
      slug: board.slug,
      name: board.name,
      clicks: Number(clicks?.clicks) || 0,
      uniqueVisitors: Number(clicks?.unique_visitors) || 0,
      conversions: Number(conversions?.conversions) || 0,
      revenue: Number(conversions?.revenue) || 0,
      depositors: Number(conversions?.depositors) || 0,
    };
  });

  const summary = boardData.reduce(
    (acc, b) => ({
      clicks: acc.clicks + b.clicks,
      conversions: acc.conversions + b.conversions,
      revenue: acc.revenue + b.revenue,
      depositors: acc.depositors + b.depositors,
    }),
    { clicks: 0, conversions: 0, revenue: 0, depositors: 0 }
  );

  return json({ ok: true, days, summary, boards: boardData });
}

/**
 * GET /api/attribution/export?days=30
 * CSV export of attribution data.
 */
export async function handleAttributionExport(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 365);

  const boards = await query(
    `SELECT id, slug, name FROM sites WHERE user_id = $1 AND status = 'active'`,
    [user.id]
  );

  if (boards.length === 0) {
    return new Response("Board,Clicks,Unique Visitors,Conversions,Revenue,Depositors\n", {
      headers: { "content-type": "text/csv", "content-disposition": "attachment; filename=attribution.csv" },
    });
  }

  const clickRows = await query(
    `SELECT sl.slug, COUNT(c.id) as clicks, COUNT(DISTINCT c.ip_hash) as unique_visitors
     FROM clicks c JOIN short_links sl ON sl.id = c.short_link_id
     WHERE sl.slug = ANY($1) AND c.created_at > now() - interval '${days} days'
     GROUP BY sl.slug`,
    [boards.map((b) => b.slug)]
  );

  const conversionRows = await query(
    `SELECT sl.slug, COUNT(cv.id) as conversions, COALESCE(SUM(cv.amount), 0) as revenue, COUNT(DISTINCT cv.click_ref) as depositors
     FROM conversions cv JOIN short_links sl ON sl.id = cv.short_link_id
     WHERE sl.slug = ANY($1) AND cv.created_at > now() - interval '${days} days'
       AND cv.status IN ('confirmed', 'finished')
     GROUP BY sl.slug`,
    [boards.map((b) => b.slug)]
  );

  const rows = boards.map((board) => {
    const clicks = clickRows.find((c) => c.slug === board.slug);
    const conversions = conversionRows.find((cv) => cv.slug === board.slug);
    return [
      board.name || board.slug,
      Number(clicks?.clicks) || 0,
      Number(clicks?.unique_visitors) || 0,
      Number(conversions?.conversions) || 0,
      (Number(conversions?.revenue) || 0).toFixed(2),
      Number(conversions?.depositors) || 0,
    ].join(",");
  });

  const csv = "Board,Clicks,Unique Visitors,Conversions,Revenue,Depositors\n" + rows.join("\n") + "\n";
  return new Response(csv, {
    headers: { "content-type": "text/csv", "content-disposition": `attachment; filename=attribution-${days}d.csv` },
  });
}
