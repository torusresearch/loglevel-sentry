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

  install(logger: Logger): void {
    const defaultMethodFactory = logger.methodFactory;

    logger.methodFactory = (method, level, name) => {
      if (name) this.category = name.toString();

      const defaultMethod = defaultMethodFactory(method, level, name);

      switch (method) {
        case "error":
          return (...msgs: unknown[]) => {
            const [err, messages] = LoglevelSentry.translateError(msgs);

            this.error(err, ...messages);
            if (defaultMethod) defaultMethod(err, ...messages);
          };

        default:
          return (...msgs: unknown[]) => {
            this.log(LoglevelSentry.translateLevel(method), ...msgs);
            if (defaultMethod) defaultMethod(...msgs);
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

  log(level: Severity, ...msgs: unknown[]): void {
    this.sentry.addBreadcrumb({
      ...LoglevelSentry.translateMessage(msgs),
      category: this.category,
      level,
      timestamp: Date.now(),
    });
  }

  trace(...msgs: unknown[]): void {
    this.log(Severity.Debug, ...msgs);
  }

  error(err: Error, ...msgs: unknown[]): void {
    this.sentry.captureException(err, {
      tags: { logger: this.category },
      extra: { messages: msgs },
    });
  }

  private static translateError(messages: unknown[]): [Error, unknown[]] {
    // Find first Error or create an "unknown" Error to keep stack trace.
    const index = messages.findIndex((msg) => msg instanceof Error);
    const err = index !== -1 ? (messages.splice(index, 1)[0] as Error) : new Error("unknown");
    return [err, messages];
  }

  private static translateMessage(messages: unknown[]): Pick<Breadcrumb, "data" | "message"> {
    const [firstMsg, ...otherMsgs] = messages;
    return typeof firstMsg === "string"
      ? {
          message: firstMsg,
          data: { messages: otherMsgs },
        }
      : { data: { messages } };
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
}
