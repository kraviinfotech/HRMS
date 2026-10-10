import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const runIntegration = Boolean(process.env.TEST_MONGODB_URI);

describe.skipIf(!runIntegration)("API integration workflows", () => {
  it("exposes the health endpoint", async () => {
    const response = await request(createApp()).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
