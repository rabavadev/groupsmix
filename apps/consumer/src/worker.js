// Cloudflare Queue consumer for YourRank.
//
// Processes click, conversion, analytics (bump), and notification events durably
// off the request thread. Each event handler is idempotent so retries and
// reordered deliveries are safe.
import { one, query } from "../../../shared/db.js";
import { recordConversion } from "../../../shared/conversions.js";
import { logClick } from "../../../shared/clicks.js";
import { bumpStat } from "../../../shared/stats.js";
import { dispatchNotifyEvent } from "../../../shared/notifications.js";

const db = { one, query };

function setProcessEnv(env) {
  const dbUrl = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
  if (dbUrl) process.env.DATABASE_URL = dbUrl;
  if (env.IP_HASH_SALT) process.env.IP_HASH_SALT = env.IP_HASH_SALT;
  if (env.PUBLIC_BASE_URL) process.env.PUBLIC_BASE_URL = env.PUBLIC_BASE_URL;
}

async function handleEvent(body, tokenCache) {
  if (!body || typeof body !== "object") {
    console.warn("[consumer] ignoring non-object message body:", body);
    return;
  }

  switch (body.type) {
    case "click": {
      await logClick(
        body.shortLinkId,
        body.ip,
        body.userAgent ?? null,
        body.referer ?? null,
        body.country ?? null,
        body.tgUserId ?? null,
        body.clickRef ?? null
      );
      break;
    }
    case "conversion": {
      await recordConversion(body.ownerId, body.query);
      break;
    }
    case "bump": {
      await bumpStat(body.siteId, body.field, body.referer ?? null);
      break;
    }
    case "notify": {
      await dispatchNotifyEvent(db, {}, body, tokenCache);
      break;
    }
    default: {
      console.warn("[consumer] unknown event type:", body.type);
    }
  }
}

export default {
  async queue(batch, env, ctx) {
    setProcessEnv(env);
    const tokenCache = new Map();

    for (const msg of batch.messages) {
      try {
        await handleEvent(msg.body, tokenCache);
        msg.ack();
      } catch (err) {
        console.error("[consumer] failed to process message", msg.id, err);
        msg.retry();
      }
    }
  },

  async fetch(request, env, ctx) {
    setProcessEnv(env);
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    }
    return new Response("consumer ok", { status: 200 });
  },
};
