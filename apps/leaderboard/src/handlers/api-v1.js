// V1 API: personal API key for bulk player updates.
import { json, bad, rateLimit, rateLimitHeaders, verifyApiKey, currentUser, generateApiKey } from "../auth.js";
import { saveSite } from "../site.js";
import { effectivePlan, PLAN_LIMITS } from "../billing.js";
import { one } from "../../../../shared/db.js";
import { z } from "../../../../shared/validation.js";

const scoreNumber = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value))
  .pipe(z.number().finite().min(0).max(1e15));

const signedNumber = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value))
  .pipe(z.number().finite().min(-1e15).max(1e15));

const intNumber = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value))
  .pipe(z.number().int().finite().min(-2147483648).max(2147483647));

const playerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  wagered: scoreNumber.optional(),
  prize: scoreNumber.optional(),
  score: scoreNumber.optional(),
  hands: intNumber.optional(),
  netProfit: signedNumber.optional(),
  winRate: signedNumber.optional(),
  change: intNumber.optional(),
}).strict();

const bodySchema = z.union([
  playerSchema,
  z.object({ players: z.array(playerSchema).max(9999) }).strict(),
  z.array(playerSchema).max(9999),
]).superRefine((body, ctx) => {
  const players = Array.isArray(body) ? body : body.players;
  if (!Array.isArray(players) || players.length === 0) return;
  const seen = new Set();
  for (const [index, player] of players.entries()) {
    const normalized = String(player.name).toLowerCase().replace(/\s+/g, " ");
    if (seen.has(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate player name: ${player.name}`,
        path: [Array.isArray(body) ? index : "players", index, "name"],
      });
    }
    seen.add(normalized);
  }
});

export async function handleApiV1Players(request, env) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : request.headers.get("x-api-key");
    if (!token) return bad("Missing API key. Use Authorization: Bearer <key> or X-API-Key header.", 401);

    const user = await verifyApiKey(token);
    if (!user) return bad("Invalid API key.", 401);

    const rl = await rateLimit(env, `api_v1:${user.id}`, 60, 60);
    if (!rl.ok) return bad("Rate limit exceeded. Try again shortly.", 429, rateLimitHeaders(rl));

    const plan = effectivePlan(user);
    const limit = PLAN_LIMITS[plan] || 25;

    const url = new URL(request.url);
    const slug = url.pathname.split("/").filter(Boolean).pop();
    const site = await one(
      `SELECT s.id, s.slug, s.name, s.tagline, s.casino, s.code, s.cta_url, s.prize_pool, s.period, s.ends_at,
              s.reset_note, s.blurb, s.extra_json, s.published, s.theme_json, s.updated_at
         FROM sites s
        WHERE s.user_id=$1 AND s.slug=$2`,
      [user.id, slug]
    );
    if (!site) return bad("Board not found.", 404);

    let raw;
    try { raw = await request.json(); } catch { return bad("Invalid JSON body."); }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return bad(`${issue.path.join(".") || "request"}: ${issue.message}`);
    }
    const playersRaw = Array.isArray(parsed.data) ? parsed.data : parsed.data.players;
    if (!Array.isArray(playersRaw) || playersRaw.length === 0) return bad("Provide at least one player.");
    if (playersRaw.length > limit) return bad(`Your plan allows up to ${limit} players.`);

    const players = playersRaw.map((p) => ({
      name: String(p.name).slice(0, 80),
      wagered: Number(p.wagered) || 0,
      prize: Number(p.prize) || 0,
      score: p.score !== undefined ? Number(p.score) : undefined,
      hands: p.hands !== undefined ? Number(p.hands) : undefined,
      netProfit: p.netProfit !== undefined ? Number(p.netProfit) : undefined,
      winRate: p.winRate !== undefined ? Number(p.winRate) : undefined,
      change: p.change !== undefined ? Number(p.change) : undefined,
    }));

    const savePayload = {
      brand: {
        name: site.name,
        tagline: site.tagline,
        casino: site.casino,
        code: site.code,
        ctaUrl: site.cta_url,
        prizePool: site.prize_pool,
        period: site.period,
        resetNote: site.reset_note,
      },
      partner: { blurb: site.blurb },
      players,
    };

    const r = await saveSite(env, user, savePayload, site.id, request);
    if (r.error) return bad(r.error, 400);
    return json({ ok: true, players: players.length }, 200, rateLimitHeaders(rl));
  } catch (e) {
    console.error("api v1 players failed:", String(e?.message || e));
    return bad("Internal error.", 500);
  }
}

export async function handleApiKey(request, env) {
  try {
    const user = await currentUser(request, env);
    if (!user) return bad("Unauthorized.", 401);
    const method = request.method;
    if (method === "GET") {
      return json({ ok: true, prefix: user.api_key_prefix || null, hasKey: !!user.api_key_prefix });
    }
    if (method === "POST") {
      const { key, prefix } = await generateApiKey(user.id);
      return json({ ok: true, key, prefix });
    }
    return bad("Method not allowed.", 405);
  } catch (e) {
    console.error("api key handler failed:", String(e?.message || e));
    return bad("Internal error.", 500);
  }
}
