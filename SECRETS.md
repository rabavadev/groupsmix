# Secrets Inventory — GroupsMix

Every secret the platform needs, where it goes, and what it's for.
**Never paste these into chat or commit them.** Use `wrangler secret put`
(for Workers) or GitHub repo Settings → Secrets (for Actions).

Legend:
- 🔴 **required** for the app to run
- 🟡 **required for that feature** (app runs without it, feature is off)
- ⚪ **optional / dev convenience**

---

## 1. Cloudflare Worker secrets

Set with: `wrangler secret put <NAME>` (or the API), from inside each app dir.
These live in the encrypted vault attached to the Worker, not in the repo.

### Leaderboard Worker (`groupsmix-leaderboard`)

| Secret | Level | Purpose |
|---|---|---|
| `DATABASE_URL` | 🔴 | Supabase Postgres connection string. **Only if NOT using Hyperdrive.** With Hyperdrive bound, the Worker reads `env.HYPERDRIVE.connectionString` instead — so you can skip this. |
| `NOWPAYMENTS_API_KEY` | 🟡 | NOWPayments crypto billing. Without it, checkout is disabled (manual activation still works). |
| `NOWPAYMENTS_IPN_SECRET` | 🟡 | Verifies NOWPayments payment-webhook (IPN) callbacks. Without it, IPN verification fails and payments won't auto-activate. |
| `RESEND_API_KEY` | 🟡 | Password-reset emails via Resend. Without it, admin-generated reset links still work (they don't need email). |
| `PRO_PRICE_USD` | ⚪ | Pro plan price in USD. Defaults to 29 if unset. |
| `LEAD_WEBHOOK_URL` | ⚪ | Discord/Telegram webhook to ping on each new lead. |

### Bot Worker (`groupsmix-bot`)

| Secret | Level | Purpose |
|---|---|---|
| `DATABASE_URL` | 🔴 | Same as above — only if NOT using Hyperdrive. |
| `TOKEN_ENC_KEY` | 🔴 | 32-byte hex (64 hex chars). AES-256-GCM key that encrypts streamers' Telegram bot tokens at rest. Already set. |
| `ADMIN_API_KEY` | 🔴 | Protects the `/bot/api/*` admin endpoints. Already set. |
| `IP_HASH_SALT` | 🔴 | Salt for hashing visitor IPs (we never store raw IPs). Already set. |
| `LOGIN_BOT_TOKEN` | 🟡 | The Telegram bot token used for the Telegram Login Widget on the bot dashboard. Without it, the login button won't render. |
| `LOGIN_BOT_USERNAME` | 🟡 | That login bot's @username (used by the widget). Set alongside LOGIN_BOT_TOKEN. |
| `PLATFORM_BOT_TOKEN` | 🟡 | The "GroupsMix" platform bot that sends Telegram Stars invoices. Required for in-app plan upgrades. |
| `PLATFORM_WEBHOOK_SECRET` | 🟡 | Secret for the Telegram Stars pre-checkout / payment webhook. |
| `ALLOW_DEV_LOGIN` | ⚪ | Set to `1` to enable the dev-only numeric-ID login (for testing). Never on in production. |

### Both Workers — bindings (not secrets, set in wrangler.toml)

| Binding | Type | Value |
|---|---|---|
| `SESSIONS` | KV namespace | id `26e47bcce19941839a20bd2cd5879e42` (shared — both Workers bind the SAME one) |
| `HYPERDRIVE` | Hyperdrive config | id `f24c020e169848448e4ab9ca7d24ac23` (Supabase direct host) |
| `PUBLIC_BASE_URL` | plain-text var | bot Worker: `https://groupsmix-bot.rabava.workers.dev` (will become `https://groupsmix.com/bot` after the custom domain lands) |

---

## 2. GitHub Actions secrets

For CI to deploy the Workers automatically from `rabavadev/groupsmix` on push.
Set in: repo → Settings → Secrets and variables → Actions → New repository secret.

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | A Cloudflare API token with permission to deploy Workers scripts on the Groupsmix account (`Workers Scripts:Edit`, `Account:Read`, `Hyperdrive:Read`, `Workers KV Storage:Read`). This is what lets the GitHub Action run `wrangler deploy`. |
| `CLOUDFLARE_ACCOUNT_ID` | The account id `48ae72b0370b5aa9feca1a45ea37f577`. Wrangler needs this to know which account to deploy to. |

That's it for Actions. The Worker runtime secrets (`NOWPAYMENTS_*`, `TOKEN_ENC_KEY`, etc.) are **not** put in GitHub — they're set directly on the Workers via `wrangler secret put`, and CI just ships code (secrets persist across deploys).

> The GitHub deploy token itself (the PAT for `rabavadev`) is **not** a GitHub Actions secret — it's only needed if an Action pushes to other repos. For deploying your own Workers you only need the two Cloudflare secrets above.

---

## 3. What's already set (don't re-set these)

On the Workers right now:
- Bot: `TOKEN_ENC_KEY`, `ADMIN_API_KEY`, `IP_HASH_SALT` ✅
- Bot: `PUBLIC_BASE_URL` var ✅
- Hyperdrive + KV bindings on both ✅

## 4. What you still need to set, in priority order

1. 🟡 `NOWPAYMENTS_API_KEY` + `NOWPAYMENTS_IPN_SECRET` on the leaderboard — when you want crypto billing live.
2. 🟡 `LOGIN_BOT_TOKEN` + `LOGIN_BOT_USERNAME` on the bot — when you want the Bot tab's Telegram login to work (create a dedicated bot via @BotFather for the login widget).
3. 🟡 `PLATFORM_BOT_TOKEN` + `PLATFORM_WEBHOOK_SECRET` on the bot — when you want in-app Telegram Stars plan upgrades.
4. 🟡 `RESEND_API_KEY` on the leaderboard — only if you want emailed password resets.
5. For CI/CD: `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets.

## How to set a Worker secret (from your machine, in the app dir)

```bash
cd apps/leaderboard   # or apps/bot
npx wrangler secret put NOWPAYMENTS_API_KEY   # prompts, value never touches disk/git
```
