import { describe, expect, it } from "bun:test";
import { renderLeaderboard } from "../render.js";
import { TEMPLATE_IDS, TEMPLATES, templateCatalog, validTemplate } from "../templates/index.js";

const DATA = {
  brand: {
    name: "Actual Streamer",
    casino: "Stake",
    code: "RANK",
    prizePool: "$5,000",
    period: "Monthly",
  },
  branding: {},
  players: [
    { name: "First Player", wagered: 50000, prize: 1000 },
    { name: "Second Player", wagered: 30000, prize: 500 },
  ],
  partner: {},
  whyStats: [],
  rules: [],
  socials: [],
};

describe("template catalog", () => {
  it("offers eight registry-driven templates with curated presets", () => {
    expect(TEMPLATE_IDS).toHaveLength(8);
    for (const id of TEMPLATE_IDS) {
      expect(TEMPLATES[id].presets.length).toBeGreaterThanOrEqual(3);
      expect(TEMPLATES[id].presets.every((preset) => /^#[0-9a-f]{6}$/i.test(preset.accentA) && /^#[0-9a-f]{6}$/i.test(preset.accentB))).toBe(true);
    }
  });

  it("exposes client metadata without sending template CSS", () => {
    const catalog = templateCatalog();
    expect(catalog).toHaveLength(8);
    expect(catalog.every((template) => !Object.hasOwn(template, "css"))).toBe(true);
    expect(catalog.map((template) => template.id)).toEqual(TEMPLATE_IDS);
  });

  it("falls back to classic for unknown template ids", () => {
    expect(validTemplate("unknown")).toBe("classic");
  });
});

describe("template previews", () => {
  it("renders real board data in preview mode", () => {
    const html = renderLeaderboard(
      { ...DATA, branding: { template: "neon", accentA: "#00ffd1", accentB: "#ff2cd0" } },
      { nonce: "preview123", preview: true }
    );
    expect(html).toContain('body data-template="neon" data-preview');
    expect(html).toContain("Actual Streamer");
    expect(html).toContain("First Player");
    expect(html).toContain("body[data-preview]");
  });

  it("renders every registered skin", () => {
    for (const template of TEMPLATE_IDS) {
      const html = renderLeaderboard({ ...DATA, branding: { template } }, { nonce: "test123" });
      expect(html).toContain(`body data-template="${template}"`);
    }
  });
});
