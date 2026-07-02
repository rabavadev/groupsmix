// Shared Discord monitoring helper for unhandled errors.
// Both the leaderboard and bot Workers import this to post crash details
// to a monitoring webhook (env.DISCORD_MONITORING_WEBHOOK).
//
// The webhook is optional — if the env var is not set, this is a silent no-op.
// The caller's try/catch should still console.error regardless.

/**
 * Build a Discord error embed and POST it to the monitoring webhook.
 * @param {object} opts
 * @param {string} opts.webhookUrl — Discord webhook URL (from env)
 * @param {string} opts.title — embed title (e.g. "YourRank Error")
 * @param {string} opts.message — error message / stack
 * @param {string} [opts.path] — request path or cron trigger
 * @param {string} [opts.worker] — which worker ("leaderboard" | "bot")
 * @param {number} [opts.color] — embed color (default red 0xff4444)
 */
export async function sendErrorToDiscord({
  webhookUrl,
  title = "YourRank Error",
  message,
  path,
  worker,
  color = 0xff4444,
}) {
  if (!webhookUrl) return;
  const fields = [
    { name: "Error", value: `\`\`\`\n${String(message).slice(0, 900)}\n\`\`\``, inline: false },
  ];
  if (path) fields.push({ name: "Path", value: `\`${path}\``, inline: true });
  if (worker) fields.push({ name: "Worker", value: worker, inline: true });
  fields.push({ name: "Timestamp", value: new Date().toISOString(), inline: true });

  const embed = {
    title,
    color,
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "YourRank Monitoring" },
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({
        username: "YourRank Monitor",
        embeds: [embed],
      }),
    });
  } catch {
    // Swallow — never let a monitoring failure crash the handler
  }
}

/**
 * Build and send a cron summary embed (e.g. plan downgrade results).
 * @param {object} opts
 * @param {string} opts.webhookUrl
 * @param {string} opts.title
 * @param {Array<{name: string, value: string, inline?: boolean}>} opts.fields
 * @param {number} [opts.color] — default green
 */
export async function sendCronSummaryToDiscord({
  webhookUrl,
  title,
  fields,
  color = 0x57f287,
}) {
  if (!webhookUrl) return;
  const embed = {
    title,
    color,
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "YourRank Cron" },
  };
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({
        username: "YourRank Monitor",
        embeds: [embed],
      }),
    });
  } catch {
    // Swallow
  }
}
