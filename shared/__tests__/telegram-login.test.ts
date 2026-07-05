// Test for Telegram login widget verification
// This test validates that the check-string construction handles optional fields correctly

import { describe, test, expect } from "bun:test";

interface TgLogin {
  id: number; 
  first_name?: string; 
  last_name?: string; 
  username?: string;
  photo_url?: string; 
  auth_date: number; 
  hash: string;
}

// Simulate the check-string construction logic from verifyTelegramLogin
function buildCheckString(data: TgLogin): string {
  const { hash, ...fields } = data;
  return Object.keys(fields).sort()
    .filter((k) => (fields as any)[k] != null) // Check for null or undefined
    .map((k) => `${k}=${(fields as any)[k]}`).join("\n");
}

describe("Telegram login check-string construction", () => {
  test("All fields present → includes all 6 expected fields", () => {
    const data: TgLogin = {
      id: 123456789,
      first_name: "John",
      last_name: "Doe",
      username: "john_doe",
      photo_url: "https://example.com/photo.jpg",
      auth_date: 1234567890,
      hash: "ignored",
    };
    const checkString = buildCheckString(data);
    const includedFields = checkString.split("\n").map((line) => line.split("=")[0]);
    const expectedFields = ["auth_date", "first_name", "id", "last_name", "photo_url", "username"];
    expect(includedFields).toEqual(expectedFields);
  });

  test("Minimal fields (only required) → includes only id and auth_date", () => {
    const data: TgLogin = {
      id: 123456789,
      auth_date: 1234567890,
      hash: "ignored",
    };
    const checkString = buildCheckString(data);
    const includedFields = checkString.split("\n").map((line) => line.split("=")[0]);
    expect(includedFields).toEqual(["auth_date", "id"]);
  });

  test("Partial optional fields → includes id, first_name, username, auth_date", () => {
    const data: TgLogin = {
      id: 123456789,
      first_name: "John",
      username: "john_doe",
      auth_date: 1234567890,
      hash: "ignored",
    };
    const checkString = buildCheckString(data);
    const includedFields = checkString.split("\n").map((line) => line.split("=")[0]);
    expect(includedFields).toEqual(["auth_date", "first_name", "id", "username"]);
  });

  test("Optional fields are null → null fields are excluded from check string", () => {
    const data = {
      id: 123456789,
      first_name: "John",
      last_name: null,
      username: null,
      photo_url: null,
      auth_date: 1234567890,
      hash: "ignored",
    } as unknown as TgLogin;
    const checkString = buildCheckString(data);
    const includedFields = checkString.split("\n").map((line) => line.split("=")[0]);
    expect(includedFields).toEqual(["auth_date", "first_name", "id"]);
  });

  test("hash field is never included in check string", () => {
    const data: TgLogin = {
      id: 123456789,
      first_name: "John",
      auth_date: 1234567890,
      hash: "secret-hash-value",
    };
    const checkString = buildCheckString(data);
    expect(checkString).not.toContain("hash=");
  });

  test("fields are sorted alphabetically", () => {
    const data: TgLogin = {
      id: 999,
      first_name: "Zoe",
      last_name: "Alpha",
      auth_date: 100,
      hash: "ignored",
    };
    const checkString = buildCheckString(data);
    const includedFields = checkString.split("\n").map((line) => line.split("=")[0]);
    const sorted = [...includedFields].sort();
    expect(includedFields).toEqual(sorted);
  });
});
