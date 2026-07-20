# UX Audit Reconciliation — Leaderboard + Admin Builder

This document maps an external UX/UI audit (leaderboard view + admin builder)
against the **current state of `main`**, so effort goes to what is actually
open rather than re-implementing work that already shipped.

**TL;DR:** Most of the audit's recommendations are already implemented in the
current code. The audit appears to have been written against an older deploy or
screenshots that predate the current templates. Two items are genuinely open
(remaining native emoji in some variants; no designed empty/sparse state) plus
two marginal contrast nudges surfaced by a new automated auditor.

Legend: ✅ already implemented · ⚠️ partially done · ❌ genuinely open · 🔄 reframed

---

## How the leaderboard actually renders (context for the verdicts)

The screenshot in the audit is the **`fun`** variant of `casino-full.js`
(`composeFun`). Two facts change how the audit's claims should be read:

1. **Templates emit a shell; a per-variant client script hydrates it.**
   `compose*` functions output the header plus empty `data-top3` / `data-rows`
   containers. The podium and ranked rows are injected at runtime by
   `apps/leaderboard/src/assets/casino/<variant>.js` (`top3Fun`, `rowFun`, …).
   So "structure" claims must be checked against the hydration script, not the
   compose function.

2. **The podium + ranked list already exist.** `top3Fun` builds a full
   2·1·3 podium (rank 2 = `order-1`, rank 1 = `order-2`, lifted, rank 3 =
   `order-3`); `rowFun` builds the ranked list beneath it.

---

## 1. Leaderboard view

| # | Audit finding | Verdict | Evidence |
|---|---|---|---|
| 1 | "Only rank #1 visible; massive dead space; need 3-tier podium + ranked table" | 🔄 **Reframed** | The 2·1·3 podium and ranked table already exist (`top3Fun`/`rowFun` in `assets/casino/fun.js`). A single visible rank is a **sparse-data render state**, not missing structure. Real fix is a designed empty/sparse state — see §3. |
| 2 | "Contrast: yellow/white on striped purple fails WCAG" | 🔄 **Reframed** | Automated auditor (`scripts/contrast-audit.mjs`) shows header text **passes** against the solid `#3B1370` base. The striped overlay is low-opacity `#000` and text already carries `drop-shadow`. The genuine issue is **pattern interference**, not ratio — optional scrim fix noted in §4. |
| 3 | "'Skip to leaderboard' is practically invisible" | ✅ **By design** | It's an `sr-only` accessibility skip link that appears **on keyboard focus** (`focus:not-sr-only`). Being invisible until tabbed to is correct WCAG behaviour, not a bug. |
| 4 | "Native emoji render inconsistently across OS" | ⚠️ **Partially done** | Coin/trophy are already inline SVG in `fun.js` (comment: *"consistent cross-platform vs native 🪙"*). But native emoji **remain** in 5 hydration scripts. See §2 for the open list. |
| 5 | "Filter buttons need ≥44×44px tap targets + active state" | ✅ **Done** | `composeFun` filter buttons carry `min-h-[44px]`, `role="tab"`, and `aria-selected` with a distinct active style. |
| 6 | "Live status should have an animated pulse dot" | ✅ **Done** | `composeFun` renders an `animate-ping` green dot beside "Updated Live". Shared templates also use `.live-dot` with a `pulse` keyframe (`leaderboard.css`). |
| 7 | "Add player-movement badges / delta arrows (▲ +2, streaks)" | ⚠️ **Partially done** | A real **gap-to-next** indicator ("$X to climb" / "tied") exists in `rowFun` and several other variants (candy/space/vip/western). Rank-**delta** arrows and streaks are not implemented — optional enhancement, not a defect. |
| 8 | "Hover/animation states on podium" | ✅ **Done** | Ranks 2/3 use `transition-transform hover:scale-105`; rows use `hover:scale-[1.008]`; rank 1 has an animated glow. |
| 9 | "Custom SVG icons instead of native emoji for brand visuals" | ⚠️ **Partially done** | Same as #4 — trophy/coin are SVG; decorative theme emojis remain in some variants. |

---

## 2. Genuinely open — remaining native emoji ❌

Trophy and coin are already SVG, but decorative/theme emoji still ship as native
glyphs in these hydration scripts (cross-platform rendering risk stands):

| Script | Native emoji glyphs remaining |
|---|---|
| `assets/casino/candy.js` | 5 |
| `assets/casino/tropical.js` | 3 |
| `assets/casino/western.js` | 3 |
| `assets/casino/arcade.js` | 2 |
| `assets/casino/fun.js` | 1 |

**Recommendation:** add a small shared emoji→SVG helper and migrate the base
set; migrate remaining variants incrementally. Do **not** hand-edit all
variants in one pass.

---

## 3. Genuinely open — no designed empty/sparse state ❌

No hydration builder renders placeholder podium slots or a "be the first"
message. With 0–1 players the page looks empty — this is almost certainly the
condition behind the audit's "only rank #1 / dead space" screenshot.

**Recommendation:** render greyed placeholder slots for empty podium positions
plus a short "Be the first to climb" prompt. This is the single change that most
directly answers the complaint that triggered the audit.

---

## 4. Contrast — automated auditor + 2 marginal fixes

New: `scripts/contrast-audit.mjs` computes WCAG ratios across all 26 CSS-skin
templates and the 12 casino variants (Tailwind arbitrary-value classes, with
nearest-ancestor background inheritance). It emits file+line+ratio and a
compliant colour suggestion, and exits non-zero on failure — suitable as a CI
guard so contrast cannot silently regress.

Only **two genuinely-real, marginal** flags across the whole codebase:

| Location | Pair | Ratio | Floor | Fix |
|---|---|---|---|---|
| `casino-full.js` `composeCandy` | `#FFE500` on `#FF1493` | 2.85 | 3.0 (large) | lighten to ~`#FFF176` |
| `quest.js` | `--ink-mute #8a92a6` on `--bg #eef1f7` | 2.75 | 3.0 (large) | darken to ~`#818a9f` |

(Two other auditor lines are false positives: an `sr-only` skip link scored
before its `focus:` colours apply, and a gradient endpoint on a wrapper whose
text actually sits in child cards.)

**Optional, real perceptual fix (audit #2):** on striped-header variants, drop a
subtle dark scrim behind the header text block, or reduce stripe overlay
opacity, so legibility no longer depends on the drop-shadow alone.

---

## 5. Admin settings & builder

The audit's builder findings (endless vertical scroll, non-sticky preview, no
tabs, lime-green overuse) were **not re-verified line-by-line** in this pass — a
prior restructure (`UI_UX_OPTIMIZATION_PLAN.md`) already merged the two editor
pages, made the live-preview iframe **sticky**, and cut the sidebar from 9→6
items. Before acting on the builder audit, confirm which of these predate it:

- **Sticky preview** — per `UI_UX_OPTIMIZATION_PLAN.md`, the preview column is
  already `position: sticky`. Likely ✅ — verify against current deploy.
- **Tabs / accordions** — verify current builder markup before restructuring.
  This is the highest-risk change (builder JS selects into the DOM); preserve
  every `data-*`/selector hook and smoke-test fill→preview→save after.
- **Lime-green (#c5ff00) overuse** — reserve the high-visibility accent for the
  primary CTA; use neutral toggles for binary settings. Low-risk, real polish.

---

## Bottom line

- **Already done:** 3-tier podium, ranked table, 44px tap targets, live pulse,
  keyboard skip link, hover states, gap-to-next deltas, SVG trophy/coin.
- **Open & worth doing:** remaining native emoji cleanup (§2), designed
  empty/sparse state (§3), 2 contrast nudges + auditor-as-CI (§4), builder
  lime-green harmony (§5).
- **Verify before acting:** builder sticky-preview/tabs status (§5) — parts may
  already be shipped.
