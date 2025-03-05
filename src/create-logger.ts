import type * as Sentry from "@sentry/core";
import loglevel, { Logger } from "loglevel";

import { LoglevelSentry as SentryPlugin } from "./loglevel-sentry";

export function createLogger(name: string, sentry: typeof Sentry): Logger {
  const logger = loglevel.getLogger(name);
  logger.enableAll();

  const plugin = new SentryPlugin(sentry);
  plugin.install(logger);

  return logger;
}
