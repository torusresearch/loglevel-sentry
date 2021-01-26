import loglevel, { Logger } from "loglevel";

import SentryPlugin, { Sentry } from "./loglevel-sentry";

export function createLogger(name: string, sentry: Sentry): Logger {
  const logger = loglevel.getLogger(name);
  logger.enableAll();

  const plugin = new SentryPlugin(sentry);
  plugin.install(logger);

  return logger;
}
