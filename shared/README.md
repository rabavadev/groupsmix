# Shared Modules

This directory contains modules shared between the leaderboard (JS) and bot (TS) Workers.

Each module exists as both `.js` and `.ts`:
- `.ts` files are the source of truth (used by bot Worker)
- `.js` files are the compiled/maintained versions (used by leaderboard Worker)

When modifying shared code, update BOTH files to keep them in sync.

## Build Process

The shared TypeScript (.ts) files are compiled to JavaScript (.js) by `build-shared.js` at the repo root.

After editing any .ts file in this directory:
1. Run `node build-shared.js` from the repo root
2. Verify the .js output matches your changes
3. Commit BOTH the .ts source and .js output

The .js files are what the Workers actually import. The .ts files are the source of truth.
