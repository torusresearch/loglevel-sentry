import * as Sentry from "@sentry/node";
import loglevel from "loglevel";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoglevelSentry } from "../src/loglevel-sentry";

// Track transport calls to verify actual sending behavior
let transportSendCalls: unknown[] = [];

describe("LoglevelSentry Node Integration", () => {
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

    logger = loglevel.getLogger("node-test");
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
    it("should capture exception with Sentry", async () => {
      logger.error(new Error("Node error test"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(transportSendCalls.length).toBeGreaterThan(0);
    });

    it("should capture string error messages", async () => {
      logger.error("String error message");
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(transportSendCalls.length).toBeGreaterThan(0);
    });

    it("should handle API Response errors", async () => {
      const mockResponse = {
        status: 404,
        type: "error",
        statusText: "Not Found",
        headers: {
          get: (name: string) => (name === "content-type" ? "application/json" : null),
        },
        json: () => Promise.resolve({ error: "Resource not found" }),
      };

      logger.error(mockResponse);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(transportSendCalls.length).toBeGreaterThan(0);
    });

    it("should handle Axios errors", async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          headers: { "content-type": "application/json" },
          data: { error: "Internal server error" },
        },
      };

      logger.error(axiosError);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(transportSendCalls.length).toBeGreaterThan(0);
    });

    it("should handle Axios errors without response (network error)", async () => {
      const axiosError = {
        isAxiosError: true,
        response: undefined,
      };

      logger.error(axiosError);
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
    it("should work without Sentry instance", () => {
      const pluginWithoutSentry = new LoglevelSentry();
      expect(pluginWithoutSentry.isEnabled()).toBe(false);

      // Should not throw
      pluginWithoutSentry.log("info", "Test message");
      pluginWithoutSentry.trace("Trace message");
      pluginWithoutSentry.error(new Error("Test error"));
    });
  });
});
