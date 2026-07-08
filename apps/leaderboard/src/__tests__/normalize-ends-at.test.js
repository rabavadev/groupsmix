// Regression tests for normalizeEndsAt (site.js).
//
// The dashboard always sends `endsAt`, using an empty string when no countdown
// date is set. Passing that "" straight into the ends_at timestamptz column made
// Postgres reject the whole save with 22007 ("invalid input syntax for type
// timestamp with time zone"), surfacing as a generic 500 on "Save changes".
//
// Run: bun test src/__tests__/normalize-ends-at.test.js

import { describe, it, expect } from "bun:test";
import { normalizeEndsAt } from "../site.js";

describe("normalizeEndsAt", () => {
  it("maps an empty string to null (blank countdown from the dashboard)", () => {
    expect(normalizeEndsAt("", "2026-01-01T00:00:00.000Z")).toBeNull();
  });

  it("maps a whitespace-only string to null", () => {
    expect(normalizeEndsAt("   ", null)).toBeNull();
  });

  it("maps explicit null to null", () => {
    expect(normalizeEndsAt(null, "2026-01-01T00:00:00.000Z")).toBeNull();
  });

  it("keeps a provided ISO timestamp", () => {
    const iso = "2026-08-01T12:30:00.000Z";
    expect(normalizeEndsAt(iso, null)).toBe(iso);
  });

  it("trims surrounding whitespace on a provided value", () => {
    const iso = "2026-08-01T12:30:00.000Z";
    expect(normalizeEndsAt(`  ${iso}  `, null)).toBe(iso);
  });

  it("keeps the existing value when the field is omitted (undefined)", () => {
    const existing = "2026-05-05T05:05:00.000Z";
    expect(normalizeEndsAt(undefined, existing)).toBe(existing);
  });

  it("returns null when omitted and there is no existing value", () => {
    expect(normalizeEndsAt(undefined, null)).toBeNull();
  });
});
