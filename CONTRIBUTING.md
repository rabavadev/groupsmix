# Contributing to YourRank

## Setup

```bash
bun install
cp apps/bot/.env.example apps/bot/.env
cp apps/leaderboard/.env.example apps/leaderboard/.env
```

## Development

```bash
# Bot
cd apps/bot && bun run dev

# Leaderboard
cd apps/leaderboard && bun run dev
```

## Code Style

- Bot: TypeScript (.ts), ESLint with @typescript-eslint
- Leaderboard: JavaScript (.js), ESLint with eslint:recommended
- Shared modules: TypeScript (.ts) with compiled .js output

## Testing

```bash
bun test                    # all tests
bun test apps/bot           # bot only
bun test apps/leaderboard   # leaderboard only
```

## Pull Requests

1. Create a feature branch
2. Make your changes
3. Run `bun test` and `bun run lint`
4. Open a PR against main

## Database Migrations

Migrations live in `supabase/migrations/`. Name format: `YYYYMMDDHHMMSS_description.sql`.
