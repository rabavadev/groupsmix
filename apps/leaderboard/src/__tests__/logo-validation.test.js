// H-19 — logo uploads must be validated by decoded magic bytes.
import { describe, it, expect } from "bun:test";
import { validateLogoData, detectImageMime } from "../site.js";

function toDataUri(mime, bytes) {
  const b64 = btoa(String.fromCharCode(...bytes));
  return `data:${mime};base64,${b64}`;
}

// Minimal magic-byte headers; the validators only inspect the first 12 bytes.
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x00]);
const JPEG_BYTES = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
const WEBP_BYTES = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

describe("detectImageMime", () => {
  it("detects PNG", () => {
    expect(detectImageMime(PNG_BYTES)).toBe("image/png");
  });
  it("detects JPEG", () => {
    expect(detectImageMime(JPEG_BYTES)).toBe("image/jpeg");
  });
  it("detects WebP", () => {
    expect(detectImageMime(WEBP_BYTES)).toBe("image/webp");
  });
  it("returns null for arbitrary bytes", () => {
    expect(detectImageMime(new Uint8Array([0x00, 0x00, 0x00, 0x00]))).toBeNull();
  });
});

describe("validateLogoData", () => {
  it("accepts a valid PNG data URI", () => {
    const uri = toDataUri("image/png", PNG_BYTES);
    const result = validateLogoData(uri);
    expect(result.ok).toBe(true);
    expect(result.mime).toBe("image/png");
  });

  it("accepts a valid JPEG data URI", () => {
    const uri = toDataUri("image/jpeg", JPEG_BYTES);
    const result = validateLogoData(uri);
    expect(result.ok).toBe(true);
    expect(result.mime).toBe("image/jpeg");
  });

  it("accepts a valid WebP data URI", () => {
    const uri = toDataUri("image/webp", WEBP_BYTES);
    const result = validateLogoData(uri);
    expect(result.ok).toBe(true);
    expect(result.mime).toBe("image/webp");
  });

  it("rejects a mismatch between declared MIME and magic bytes", () => {
    const uri = toDataUri("image/png", JPEG_BYTES);
    const result = validateLogoData(uri);
    expect(result.ok).toBeUndefined();
    expect(result.error).toContain("content is jpeg");
  });

  it("rejects unknown magic bytes", () => {
    const bytes = new Uint8Array([0x47, 0x49, 0x46, 0x38]);
    const uri = toDataUri("image/png", bytes);
    const result = validateLogoData(uri);
    expect(result.ok).toBeUndefined();
    expect(result.error).toContain("file type could not be verified");
  });

  it("rejects non-data-URI input", () => {
    const result = validateLogoData("https://example.com/logo.png");
    expect(result.error).toContain("base64 data URI");
  });

  it("rejects a data URI with an unsupported MIME", () => {
    const uri = toDataUri("image/gif", [0x47, 0x49, 0x46, 0x38]);
    const result = validateLogoData(uri);
    expect(result.error).toContain("base64 data URI");
  });
});
