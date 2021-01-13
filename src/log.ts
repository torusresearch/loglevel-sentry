import { BrowserClient, Hub, Severity } from "@sentry/browser";

import defaultLoggerFactory from "./default-logger-factory";
import { IData, ILogger, ITorusLogOptions } from "./interfaces";

export default class TorusLog implements ILogger {
  private name: string;

  private logger: ILogger;

  private sentry?: Hub;

  private isActive: boolean;

  constructor({ name, loggerFactory, monitorOpts }: ITorusLogOptions) {
    this.name = name || "torus-log";

    this.isActive = false;

    this.logger = defaultLoggerFactory(this.name);
    if (loggerFactory) {
      this.logger = Object.assign(this.logger, loggerFactory(this.name));
    }

    if (monitorOpts) {
      this.sentry = new Hub(new BrowserClient(monitorOpts));
    }
  }

  enable(): void {
    this.isActive = true;
  }

  disable(): void {
    this.isActive = false;
  }

  trace(msg: string, data?: IData): void {
    if (!this.isActive) return;

    this.logger.trace(msg, data);
    this.sentry?.addBreadcrumb({
      message: msg,
      data,
      category: Severity.Debug,
      timestamp: Date.now(),
    });
  }

  info(msg: string, data?: IData): void {
    if (!this.isActive) return;
    this.logger.info(msg, data);
  }

  error(err: Error, data?: IData): void {
    if (!this.isActive) return;

    this.logger.error(err, data);
    this.sentry?.withScope((scope) => {
      scope.setExtras(data);
      this.sentry.captureException(err);
    });
  }
}
