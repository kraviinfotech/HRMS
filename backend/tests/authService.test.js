import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/services/authService.js";

describe("authService password hashing", () => {
  it("hashes with Argon2id and verifies only the correct password", async () => {
    const hash = await hashPassword("StrongPass123");
    expect(hash).toContain("argon2id");
    await expect(verifyPassword(hash, "StrongPass123")).resolves.toBe(true);
    await expect(verifyPassword(hash, "WrongPass123")).resolves.toBe(false);
  });
});
