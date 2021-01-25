import { Client } from "@sentry/types";
import loglevel, { Logger } from "loglevel";

import SentryPlugin from "./loglevel-sentry";

export function createLogger(name: string, client: Client): Logger {
  const logger = loglevel.getLogger(name);
  logger.enableAll();

  const plugin = new SentryPlugin(client);
  plugin.install(logger);

  return logger;
}
