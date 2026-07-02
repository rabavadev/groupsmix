# Staging Environment

The leaderboard Worker has a dedicated staging environment for testing changes
before they hit production.

## Quick Reference

| Item               | Value                                   |
|---------------------|-----------------------------------------|
| Subdomain           | `staging.yourrank.site`                 |
| Wrangler env name   | `staging`                               |
| Database            | Separate Supabase project (see below)   |
| KV (sessions)       | Separate staging namespace              |
| Hyperdrive          | Separate staging config                 |
| Deploy command      | `wrangler deploy --env staging`         |

## 1. Set Up the Staging Worker

### Prerequisites

1. **Separate Supabase project** — create a second Supabase project for staging
   data. Run the same migrations from `db/migrations/` against it. This ensures
   staging never touches production users, payments, or sites.

2. **Hyperdrive config for staging** — point a new Hyperdrive config at the
   staging Supabase direct host:
   ```bash
   npx wrangler hyperdrive create yourrank-staging-pg \
     --connection-string="postgresql://postgres.<ref>:<pw>@db.<staging-ref>.supabase.co:5432/postgres"
   ```
   Paste the generated ID into the `[env.staging]` section of `wrangler.toml`.

3. **KV namespace for staging** — create a separate KV namespace for session
   tokens. Sessions are **not** shared between staging and production (logging
   into staging does not log you into prod and vice versa):
   ```bash
   npx wrangler kv namespace create SESSIONS --env staging
   ```
   Paste the ID into `wrangler.toml` under `[env.staging]`.

4. **DNS** — add a `CNAME` record for `staging.yourrank.site` pointing at your
   Cloudflare zone (or use the Workers route pattern).

### Secrets

Set the same secrets as production (they may differ if the staging DB has
different credentials):

```bash
wrangler secret put DATABASE_URL --env staging
wrangler secret put NOWPAYMENTS_API_KEY --env staging
wrangler secret put NOWPAYMENTS_IPN_SECRET --env staging
wrangler secret put RESEND_API_KEY --env staging
wrangler secret put MAIL_FROM --env staging
wrangler secret put LEAD_WEBHOOK_URL --env staging
wrangler secret put DISCORD_MONITORING_WEBHOOK --env staging
```

### Deploy

```bash
# From apps/leaderboard/
node build.js
wrangler deploy --env staging
```

Or trigger the [staging workflow](../../.github/workflows/staging.yml) via
`workflow_dispatch` from the GitHub Actions tab.

## 2. Differences from Production

| Aspect              | Production                    | Staging                          |
|---------------------|-------------------------------|----------------------------------|
| Route               | `yourrank.site/*`             | `staging.yourrank.site/*`        |
| Database            | Main Supabase project         | Separate Supabase project        |
| KV sessions         | Main KV namespace             | Staging KV namespace             |
| Hyperdrive          | Main Hyperdrive config        | Staging Hyperdrive config        |
| APP_NAME env var    | `YourRank`                    | `YourRank (Staging)`             |
| Cron triggers       | Same as production            | **None** (staging has no crons)  |

## 3. Testing Checklist

- [ ] Sign up / log in on staging
- [ ] Create and publish a leaderboard
- [ ] Verify the public page loads at `staging.yourrank.site/<slug>`
- [ ] Test the overlay at `staging.yourrank.site/<slug>/overlay`
- [ ] Submit a test lead via the landing page
- [ ] Verify Discord monitoring webhook fires on errors (if configured)
- [ ] Confirm production data is unaffected

## 4. Staging Teardown

To remove the staging environment:

```bash
wrangler delete --env staging
# Then delete the Hyperdrive config and KV namespace from the Cloudflare dashboard.
```
