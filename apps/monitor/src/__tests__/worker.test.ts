import { describe, it, expect, mock } from "bun:test";

// Basic unit tests for the uptime monitor Worker logic

describe("uptime monitor", () => {
  it("worker exports default with scheduled and fetch handlers", async () => {
    const worker = await import("../worker");
    expect(worker.default).toBeDefined();
    expect(typeof worker.default.scheduled).toBe("function");
    expect(typeof worker.default.fetch).toBe("function");
  });

  it("/health returns ok response", async () => {
    const worker = await import("../worker");
    const req = new Request("https://monitor.yourrank.site/health");
    const env = {
      MONITOR_TARGET: "https://yourrank.site",
      DISCORD_MONITORING_WEBHOOK: "",
    };
    const res = await worker.default.fetch(req, env as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.worker).toBe("monitor");
  });
});
