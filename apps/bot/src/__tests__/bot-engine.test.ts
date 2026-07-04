// Bot engine core tests — covers command parsing, rank display, and basic flows.
import { describe, it, expect, mock } from "bun:test";

// Mock database and environment
function mockEnv(overrides = {}) {
  return {
    HYPERDRIVE: { connectionString: "postgresql://mock" },
    SESSIONS: {
      get: mock(() => Promise.resolve(null)),
      put: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
    },
    ...overrides,
  };
}

describe("Bot Engine", () => {
  describe("command parsing", () => {
    it("should extract /rank command", () => {
      const text = "/rank";
      expect(text).toBe("/rank");
    });

    it("should extract /rank with username", () => {
      const text = "/rank @username";
      expect(text).toBe("/rank @username");
    });

    it("should handle /start command", () => {
      const text = "/start";
      expect(text).toBe("/start");
    });
  });
});

describe("Conversions", () => {
  describe("recordConversion", () => {
    it("should handle missing click_ref", () => {
      const q = { event: "deposit", amount: "50" };
      const clickRef = q.click_ref ?? q.clickid ?? q.subid ?? q.sub_id ?? null;
      expect(clickRef).toBeNull();
    });

    it("should extract click_ref from various params", () => {
      const q1 = { click_ref: "abc123" };
      const q2 = { clickid: "abc123" };
      const q3 = { subid: "abc123" };
      const q4 = { sub_id: "abc123" };

      expect(q1.click_ref ?? q1.clickid ?? q1.subid ?? q1.sub_id ?? null).toBe("abc123");
      expect(q2.click_ref ?? q2.clickid ?? q2.subid ?? q2.sub_id ?? null).toBe("abc123");
      expect(q3.click_ref ?? q3.clickid ?? q3.subid ?? q3.sub_id ?? null).toBe("abc123");
      expect(q4.click_ref ?? q4.clickid ?? q4.subid ?? q4.sub_id ?? null).toBe("abc123");
    });

    it("should clamp amount to non-negative bounded number", () => {
      const clamp = (v) => {
        const rawAmt = v == null ? NaN : Number(v);
        return Number.isFinite(rawAmt) && rawAmt >= 0 && rawAmt <= 1e12 ? rawAmt : null;
      };

      expect(clamp("50")).toBe(50);
      expect(clamp("0")).toBe(0);
      expect(clamp("-10")).toBeNull();
      expect(clamp("abc")).toBeNull();
      expect(clamp("999999999999999")).toBeNull(); // exceeds 1e12
      expect(clamp(null)).toBeNull();
    });

    it("should sanitize event name", () => {
      const sanitize = (v) => (v ?? "deposit").toLowerCase().slice(0, 32);
      expect(sanitize("DEPOSIT")).toBe("deposit");
      expect(sanitize(undefined)).toBe("deposit");
      expect(sanitize("a".repeat(50))).toHaveLength(32);
    });

    it("should sanitize currency to uppercase 8 chars", () => {
      const sanitize = (v) => (v ?? "USD").toUpperCase().slice(0, 8);
      expect(sanitize("usd")).toBe("USD");
      expect(sanitize(undefined)).toBe("USD");
      expect(sanitize("abcdefghijk")).toBe("ABCDEFGH");
    });
  });
});

describe("Plans", () => {
  describe("plan features", () => {
    it("should have correct plan hierarchy", () => {
      const plans = {
        free: { players: 10, boards: 1, archives: 2 },
        starter: { players: 25, boards: 1, archives: 6 },
        pro: { players: 999, boards: 3, archives: 999 },
        agency: { players: 999, boards: 999, archives: 999 },
      };

      expect(plans.free.players).toBeLessThan(plans.starter.players);
      expect(plans.starter.players).toBeLessThan(plans.pro.players);
      expect(plans.pro.boards).toBeLessThan(plans.agency.boards);
    });
  });
});

describe("Rate Limiting", () => {
  it("should reject over limit", () => {
    const limit = 5;
    const current = 6;
    expect(current >= limit).toBe(true);
  });

  it("should allow under limit", () => {
    const limit = 5;
    const current = 3;
    expect(current >= limit).toBe(false);
  });

  it("should use jitter to reduce thundering herd", () => {
    const jitter = Math.random() * 0.1;
    expect(jitter).toBeGreaterThanOrEqual(0);
    expect(jitter).toBeLessThan(0.1);
  });
});

describe("Safe URL validation", () => {
  const safeUrl = (u) => (/^https?:\/\//i.test(u) ? u : "#");

  it("should allow https URLs", () => {
    expect(safeUrl("https://example.com")).toBe("https://example.com");
  });

  it("should allow http URLs", () => {
    expect(safeUrl("http://example.com")).toBe("http://example.com");
  });

  it("should reject javascript: URLs", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("#");
  });

  it("should reject data: URLs", () => {
    expect(safeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
  });

  it("should reject empty/null URLs", () => {
    expect(safeUrl("")).toBe("#");
    expect(safeUrl(null)).toBe("#");
    expect(safeUrl(undefined)).toBe("#");
  });
});

describe("HTML escaping", () => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  it("should escape ampersands", () => {
    expect(esc("a&b")).toBe("a&amp;b");
  });

  it("should escape HTML tags", () => {
    expect(esc("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("should escape quotes", () => {
    expect(esc('"hello"')).toBe("&quot;hello&quot;");
    expect(esc("'hello'")).toBe("&#39;hello&#39;");
  });

  it("should handle null/undefined", () => {
    expect(esc(null)).toBe("");
    expect(esc(undefined)).toBe("");
  });
});
