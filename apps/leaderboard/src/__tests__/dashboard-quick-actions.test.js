import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.js";

const overviewJs = readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8");

describe("dashboard overview quick actions", () => {
  it("puts the main tasks one click from the Overview", () => {
    expect(PAGES.dashboard).toContain('class="lb-qa" aria-label="Quick actions"');
    expect(PAGES.dashboard).toContain('data-jump="board"><span class="lb-qa-t">Add players</span>');
    expect(PAGES.dashboard).toContain('<span class="lb-qa-t">Set the prize</span>');
    expect(PAGES.dashboard).toContain('data-jump="board"><span class="lb-qa-t">Pick a design</span>');
    expect(PAGES.dashboard).toContain('id="ov_copyLink"');
  });

  it("copies the live page URL from the Overview", () => {
    expect(overviewJs).toContain('navigator.clipboard.writeText(url)');
    expect(overviewJs).toContain('location.origin + "/" + state.SLUG');
  });

  it("promotes postbacks into a top-level Automate nav group", () => {
    // Attribution/postbacks is the core value prop and now lives in the primary nav.
    expect(PAGES.dashboard).toContain('<span class="lb-side-grp">Automate</span>');
    expect(PAGES.dashboard).toContain('href="/dashboard/attribution"');
    expect(PAGES.dashboard).toContain('>Postbacks</a>');
    // Integrations (overlay/domain/alerts) sits alongside it under Automate.
    expect(PAGES.dashboard).toContain('data-nav="integrations"');
    // The four-group IA: Board / Automate / Grow / Plan.
    expect(PAGES.dashboard).toContain('<span class="lb-side-grp">Board</span>');
    expect(PAGES.dashboard).toContain('<span class="lb-side-grp">Grow</span>');
    expect(PAGES.dashboard).toContain('<span class="lb-side-grp">Plan</span>');
    // Icons are real inline SVGs, not emoji.
    expect(PAGES.dashboard).not.toContain('aria-hidden="true">🔌</span>');
  });

  it("leads with a single Editor section and hides Boards for solo users", () => {
    // The daily job (prize + players + design) lives in one Editor section...
    expect(PAGES.dashboard).toContain('data-nav="board" aria-current="page"><span class="lb-nav-ic" aria-hidden="true">');
    expect(PAGES.dashboard).toContain('</svg></span>Editor');
    // ...which is the section shown on load.
    expect(PAGES.dashboard).toContain('<section class="lb-page is-on" data-page="board">');
    // Boards nav starts hidden; JS reveals it only when the user has 2+ boards.
    expect(PAGES.dashboard).toContain('class="lb-nav lb-nav--boards" type="button" data-nav="boards" hidden');
    // Prize/players and the live preview share one split-screen grid.
    expect(PAGES.dashboard).toContain('class="design-grid"');
    expect(PAGES.dashboard).toContain('id="designPreview"');
  });
});
