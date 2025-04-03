import loglevel, { Logger } from "loglevel";

import { LoglevelSentry as SentryPlugin, Sentry } from "./loglevel-sentry";

/**
 * TODO: remove in the next major version (v10)
 * @deprecated Use `loglevel.getLogger` instead
 * We should not use this function as it'll install the plugin to the logger which we already do it when setting up the Sentry
 * When we install multiple times, it'll format the error message in a nested way
 */
export function createLogger(name: string, sentry: Sentry): Logger {
  const logger = loglevel.getLogger(name);
  logger.enableAll();

  const plugin = new SentryPlugin(sentry);
  plugin.install(logger);

  return logger;
}
