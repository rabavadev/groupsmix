# YourRank Bug Sweep — Jul 7, 2026

Sweep method: curl, web_fetch, source code review. No browser automation (Playwright doesn't support Ubuntu 26.04). All findings verified against production and source.

---

## P0 — User-Facing Broken

### BUG-001: Forgot password leaks email existence
**Endpoint:** `POST /api/auth/forgot`
**Behavior:** Non-existent email → `{"ok":true}`. Existing email (when Resend fails) → `{"ok":false}`.
**Impact:** Attacker can enumerate valid email addresses.
**Fix:** Always return `{"ok":true,"message":"If that account exists..."}` regardless of send outcome. Catch Resend errors and return success anyway.

### BUG-002: Demo page API returns "not found"
**Endpoint:** `GET /api/public/demo/players` → `{"ok":false,"error":"not found"}`
**Behavior:** The demo page at `/demo` is SSR-hardcoded with fake player data. But leaderboard.js fetches `/api/public/demo/players` client-side, which returns 404. Players would disappear after the first JS poll.
**Impact:** Demo page shows players initially (SSR), then they vanish on first client-side refresh.
**Fix:** Either add a `/api/public/demo` handler that returns the hardcoded demo data, or make the demo page skip the API fetch (use a `data-demo` attribute to signal "don't poll").

### BUG-003: `/reset` shows form when no token is present
**URL:** `yourrank.site/reset` (no `?token=...`)
**Behavior:** Renders a password form. User fills it in, submits, server returns `"Missing reset token"`. Error is shown but UX is confusing.
**Fix:** Check for token on page load. If missing, show "This link is invalid or expired" with a link to `/forgot`, instead of the form.

---

## P1 — Functional / Security

### BUG-004: `/widget` route silently serves full page
**URL:** `yourrank.site/smoketest1/widget` → 200 (full leaderboard page)
**Behavior:** The slug handler extracts `smoketest1` and ignores `/widget`. Falls through to the normal leaderboard page.
**Impact:** User visiting `/widget` URL sees a full page instead of getting a 404 or a widget view. Confusing.
**Fix:** Either implement a widget endpoint or reject paths with extra segments after the slug (unless it's `/overlay`).

### BUG-005: `/admin` returns plain text 404 for non-admins
**URL:** `yourrank.site/admin` (not logged in or non-admin)
**Behavior:** Returns `text/plain: "Not found"` with 404 status. No HTML page, no redirect.
**Impact:** Looks broken/unprofessional. Security-by-obscurity is fine but should still return a proper 404 HTML page.
**Fix:** Return `notFoundPage("admin")` instead of `new Response('Not found', { status: 404 })`.

### BUG-006: `GET /api/auth/me` returns 200 for unauthenticated requests
**Behavior:** Returns `{"ok":false,"user":null}` with HTTP 200.
**Expected:** HTTP 401 with `{"ok":false,"error":"Not authenticated"}`.
**Impact:** Frontend code checks `d.ok` so it works, but inconsistent with other auth endpoints (e.g., `GET /api/site` returns 401).

---

## P2 — CSP / Inline Styles (future-proofing)

### BUG-007: Inline `<style>` blocks depend on `'unsafe-inline'` CSP
**Affected files:**
- `render.js:28` — Dynamic branding CSS variables (accent colors)
- `pages.js:602+` — OBS overlay page styles
- `index.js:366` — Overlay upsell page styles
- `headers.js:44,50,56` — Error pages (notFound, suspended, comingSoon)

**Current state:** HTML CSP has `'unsafe-inline'` so these work. But if removed (to match SECURE_HTML), all these pages would lose styling.
**Fix:** Nonces per request, or move error page styles to external CSS (headers.js pages are standalone HTML, so harder).

---

## P3 — Staging / Infra

### BUG-008: staging.yourrank.site has no DNS record
**Behavior:** Returns HTTP 000 (no connection). DNS doesn't resolve.
**Root cause:** CF API token only has Workers scope, no DNS edit.
**Fix:** S M needs to add a DNS record in Cloudflare dashboard: A record for `staging` → `192.0.2.1` (proxied, Workers route handles traffic).

### BUG-009: Staging worker has no secrets
**Behavior:** Staging worker was deployed without DATABASE_URL, NOWPAYMENTS_API_KEY, etc.
**Impact:** Staging will 500 on any DB or payment operation.
**Fix:** Set secrets via `wrangler secret put --env staging` or CF API.

---

## P4 — Cosmetic / Minor

### BUG-010: `GET /go/nonexistent-slug` returns plain text 404
**Behavior:** Returns `text/plain: "not found"` instead of HTML 404 page.
**Fix:** Return `notFoundPage(slug)` for consistency.

### BUG-011: Test accounts on production
**Accounts created during this sweep:**
- `test-bugcheck-998@example.com` / slug `bugtest998`
- `test-bugcheck-999@example.com` / slug `bugtest999`
**Fix:** Delete via admin panel or direct DB query.

---

## Not Bugs (verified working)

- ✅ All public pages return 200 (/, /terms, /privacy, /responsible, /demo, /<slug>)
- ✅ Auth pages render correctly (login, signup, forgot, reset)
- ✅ Dashboard redirects to /login when unauthenticated (302)
- ✅ All asset files load (CSS, JS)
- ✅ Security headers present on all pages (HSTS, CSP, X-Content-Type-Options, Referrer-Policy)
- ✅ Cookie security: HttpOnly, Secure, SameSite=Lax, Domain=.yourrank.site ✓
- ✅ Rate limiting works (kicks in at ~11th attempt)
- ✅ Signup creates account and sets session cookie
- ✅ HEAD /api/public/{slug} returns 200 (fixed this session)
- ✅ HEAD /<slug> returns 200 (fixed this session)
- ✅ No mixed content (http:// in HTTPS pages)
- ✅ No duplicate HTML IDs
- ✅ No hardcoded secrets in source
- ✅ No SQL injection patterns found
- ✅ XSS in slug path → 404 (safe)
- ✅ Path traversal → 404 (safe)
- ✅ Invalid JSON body → 400 "Invalid request" (safe)
- ✅ `/go/smoketest1` redirects to CTA URL correctly
- ✅ Overlay page shows Pro upsell for free users
- ✅ CSP blocks inline scripts (only 'self' and telegram.org allowed)
