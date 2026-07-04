# Branch Protection & Environment Setup

## Required GitHub Settings

### 1. Branch Protection Rules (Settings → Branches → main)

- ✅ Require pull request reviews before merging (1 approval)
- ✅ Require status checks to pass before merging
  - Required checks: `pr-check`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings (even for admins recommended)

### 2. Environment Protection (Settings → Environments)

#### `production` Environment

| Setting | Value |
|---------|-------|
| Deployment branches | `main` only |
| Required reviewers | Add at least 1 team member |
| Wait timer | 0 minutes (or 5 min for extra safety) |

Used by: `deploy.yml` — both `deploy-leaderboard` and `deploy-bot` jobs.

#### `staging` Environment

| Setting | Value |
|---------|-------|
| Deployment branches | All branches |
| Required reviewers | None (on-demand) |

Used by: `staging.yml` — both `deploy-leaderboard-staging` and `deploy-bot-staging` jobs.

### 3. Workflow Environment References

All deploy jobs have the `environment:` field set:

- **deploy.yml** `deploy-leaderboard` → `environment: production`
- **deploy.yml** `deploy-bot` → `environment: production`
- **staging.yml** `deploy-leaderboard-staging` → `environment: staging`
- **staging.yml** `deploy-bot-staging` → `environment: staging`

## How It Works

1. **Push to main** → `deploy.yml` runs. GitHub waits for production environment approval before deploying.
2. **Manual trigger** → `staging.yml` runs. Deploys immediately to staging environment (any branch).
3. **Rollback** → Use `rollback.yml` workflow_dispatch with a specific git ref.

## Secrets per Environment

Both environments need these secrets (can be scoped per environment for isolation):

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | CF API token |
| `CLOUDFLARE_ACCOUNT_ID` | CF account ID (48ae72b0370b5aa9feca1a45ea37f577) |
| `SUPABASE_ACCESS_TOKEN` | For DB migrations (production only) |
| `SUPABASE_DB_PASSWORD` | For DB migrations (production only) |
