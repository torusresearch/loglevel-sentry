import * as Sentry from "@sentry/browser";
import loglevel from "loglevel";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoglevelSentry } from "../src/loglevel-sentry";

// Track transport calls to verify actual sending behavior
let transportSendCalls: unknown[] = [];

describe("LoglevelSentry Browser Integration", () => {
  let logger: loglevel.Logger;
  let plugin: LoglevelSentry;

  beforeAll(() => {
    Sentry.init({
      dsn: "https://test@test.ingest.sentry.io/123",
      transport: () => ({
        send: (envelope) => {
          transportSendCalls.push(envelope);
          return Promise.resolve({});
        },
        flush: () => Promise.resolve(true),
      }),
    });

    logger = loglevel.getLogger("browser-test");
    logger.enableAll();
    plugin = new LoglevelSentry(Sentry);
    plugin.install(logger);
  });

  beforeEach(() => {
    // Ensure Sentry is enabled before each test
    plugin.setEnabled(true);
  });

  afterEach(() => {
    transportSendCalls = [];
    vi.clearAllMocks();
  });

  describe("Error handling", () => {
    it("should capture exception with Sentry in browser", async () => {
      logger.error(new Error("Browser error test"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(transportSendCalls.length).toBeGreaterThan(0);
    });

    it("should capture string error messages", async () => {
      logger.error("Browser string error");
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(transportSendCalls.length).toBeGreaterThan(0);
    });

    it("should handle API Response errors in browser", async () => {
      const mockResponse = new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
      Object.defineProperty(mockResponse, "type", { value: "error" });

      logger.error(mockResponse);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(transportSendCalls.length).toBeGreaterThan(0);
    });
  });

  describe("Sentry enable/disable", () => {
    it("should not send events when Sentry is disabled", async () => {
      plugin.setEnabled(false);
      expect(plugin.isEnabled()).toBe(false);

      logger.error(new Error("Error while disabled"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Transport should NOT be called when disabled
      expect(transportSendCalls.length).toBe(0);
    });

    it("should send events when Sentry is enabled", async () => {
      plugin.setEnabled(true);
      expect(plugin.isEnabled()).toBe(true);

      logger.error(new Error("Error while enabled"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Transport SHOULD be called when enabled
      expect(transportSendCalls.length).toBeGreaterThan(0);
    });

    it("should resume sending after re-enabling", async () => {
      // Disable
      plugin.setEnabled(false);
      logger.error(new Error("Error while disabled"));
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(transportSendCalls.length).toBe(0);

      // Re-enable
      plugin.setEnabled(true);
      logger.error(new Error("Error after re-enable"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should have sent the second error
      expect(transportSendCalls.length).toBeGreaterThan(0);
    });
  });

  describe("Without Sentry", () => {
    it("should work without Sentry instance in browser", () => {
      const pluginWithoutSentry = new LoglevelSentry();
      expect(pluginWithoutSentry.isEnabled()).toBe(false);

      // Should not throw
      pluginWithoutSentry.log("info", "Test message");
      pluginWithoutSentry.trace("Trace message");
      pluginWithoutSentry.error(new Error("Test error"));
    });
  });
});
