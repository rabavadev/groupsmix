// YourRank Uptime Monitor — Cloudflare Worker
// Runs on a cron schedule, checks golden paths, alerts Discord on failure.

interface Env {
  MONITOR_TARGET: string;       // e.g. "https://yourrank.site"
  DISCORD_MONITORING_WEBHOOK: string;  // Discord webhook for alerts
  MONITOR_SLUG?: string;        // known board slug for /r/ check
  MONITOR_PB_KEY?: string;      // known postback key for /pb check
}

interface CheckResult {
  name: string;
  ok: boolean;
  status: number;
  latencyMs: number;
  error?: string;
}

async function checkEndpoint(
  url: string,
  options: RequestInit,
  name: string,
  timeoutMs = 10_000
): Promise<CheckResult> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(timeoutMs),
    });
    return {
      name,
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      ok: false,
      status: 0,
      latencyMs: Date.now() - start,
      error: String(err),
    };
  }
}

async function runChecks(env: Env): Promise<CheckResult[]> {
  const base = env.MONITOR_TARGET;
  const checks: Promise<CheckResult>[] = [
    // 1. GET /health
    checkEndpoint(`${base}/health`, { method: "GET" }, "GET /health"),
    // 2. GET / (landing page render)
    checkEndpoint(`${base}/`, { method: "GET" }, "GET / (landing)"),
  ];

  // 3. GET /r/<known-slug> — only if a slug is configured
  if (env.MONITOR_SLUG) {
    checks.push(
      checkEndpoint(
        `${base}/r/${env.MONITOR_SLUG}`,
        { method: "GET", redirect: "manual" },  // 302 is fine
        `GET /r/${env.MONITOR_SLUG}`
      )
    );
  }

  // 4. POST /pb — postback endpoint (canary, expect 400 for bad payload)
  if (env.MONITOR_PB_KEY) {
    checks.push(
      checkEndpoint(
        `${base}/pb`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key: env.MONITOR_PB_KEY, test: true }),
        },
        "POST /pb (canary)"
      )
    );
  }

  return Promise.all(checks);
}

async function alertDiscord(env: Env, failures: CheckResult[]): Promise<void> {
  if (!env.DISCORD_MONITORING_WEBHOOK) return;

  const fields = failures.map((f) => ({
    name: `❌ ${f.name}`,
    value: `Status: ${f.status} | Latency: ${f.latencyMs}ms${f.error ? `\nError: ${f.error.slice(0, 200)}` : ""}`,
    inline: false,
  }));

  const embed = {
    title: "🔴 YourRank Uptime Alert",
    color: 0xff4444,
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "YourRank Monitor" },
  };

  try {
    await fetch(env.DISCORD_MONITORING_WEBHOOK, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "YourRank Monitor",
        embeds: [embed],
      }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    // Swallow — never let alert failure crash the monitor
  }
}

export default {
  // Cron handler — runs every 5 minutes
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const results = await runChecks(env);
    const failures = results.filter((r) => !r.ok);

    if (failures.length > 0) {
      console.error(JSON.stringify({
        level: "error",
        msg: "uptime_check_failed",
        failures: failures.map((f) => f.name),
        ts: new Date().toISOString(),
      }));
      ctx.waitUntil(alertDiscord(env, failures));
    } else {
      console.log(JSON.stringify({
        level: "info",
        msg: "uptime_check_passed",
        checks: results.map((r) => ({ name: r.name, status: r.status, ms: r.latencyMs })),
        ts: new Date().toISOString(),
      }));
    }
  },

  // HTTP handler — returns monitor status
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, worker: "monitor" }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/check") {
      // Manual trigger for testing
      const results = await runChecks(env);
      return new Response(JSON.stringify(results, null, 2), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("YourRank Monitor", { status: 200 });
  },
};
