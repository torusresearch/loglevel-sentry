import { Hub } from "@sentry/core";
import { Breadcrumb, CaptureContext, Severity } from "@sentry/types";
import { Logger } from "loglevel";

export interface Sentry {
  captureException(exception: any, captureContext?: CaptureContext): string;
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  getCurrentHub(): Hub;
}

export default class LoglevelSentry {
  private sentry: Sentry;

  private category: string;

  constructor(sentry: Sentry) {
    this.sentry = sentry;
    this.category = "loglevel-sentry";
  }

  private static translateError(args: unknown[]): [Error, unknown[]] {
    // Find first Error or create an "unknown" Error to keep stack trace.
    const index = args.findIndex((arg) => arg instanceof Error);
    const err = index !== -1 ? (args.splice(index, 1)[0] as Error) : new Error("unknown");
    return [err, args];
  }

  private static translateArgs(args: unknown[]): Pick<Breadcrumb, "data" | "message"> {
    const [firstArg, ...otherArgs] = args;
    return typeof firstArg === "string"
      ? {
          message: firstArg,
          data: { arguments: otherArgs },
        }
      : { data: { arguments: args } };
  }

  private static translateLevel(level: string): Severity {
    switch (level) {
      case "info":
        return Severity.Info;
      case "warn":
        return Severity.Warning;
      default:
        return Severity.Debug;
    }
  }

  install(logger: Logger): void {
    const defaultMethodFactory = logger.methodFactory;

    logger.methodFactory = (method, level, name) => {
      if (name) this.category = name.toString();

      const defaultMethod = defaultMethodFactory(method, level, name);

      switch (method) {
        case "error":
          return (...args: unknown[]) => {
            const [err, otherArgs] = LoglevelSentry.translateError(args);

            this.error(err, ...otherArgs);
            if (defaultMethod) defaultMethod(err, ...otherArgs);
          };

        default:
          return (...args: unknown[]) => {
            this.log(LoglevelSentry.translateLevel(method), ...args);
            if (defaultMethod) defaultMethod(...args);
          };
      }
    };

    logger.setLevel(logger.getLevel());
  }

  setEnabled(enabled: boolean): void {
    this.sentry.getCurrentHub().getClient().getOptions().enabled = enabled;
  }

  isEnabled(): boolean {
    return this.sentry.getCurrentHub().getClient().getOptions().enabled;
  }

  log(level: Severity, ...args: unknown[]): void {
    this.sentry.addBreadcrumb({
      ...LoglevelSentry.translateArgs(args),
      category: this.category,
      level,
      timestamp: Date.now(),
    });
  }

  trace(...args: unknown[]): void {
    this.log(Severity.Debug, ...args);
  }

  error(err: Error, ...args: unknown[]): void {
    this.sentry.captureException(err, {
      tags: { logger: "loglevel-sentry", "logger.name": this.category },
      extra: { arguments: args },
    });
  }
}
