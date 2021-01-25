import { Hub } from "@sentry/core";
import { Breadcrumb, Client, Severity } from "@sentry/types";
import { Logger } from "loglevel";

export default class LoglevelSentry {
  private sentry: Hub;

  private category: string;

  constructor(client: Client) {
    this.sentry = new Hub(client);
    this.category = "loglevel-sentry";
  }

  install(logger: Logger): void {
    const defaultMethodFactory = logger.methodFactory;

    logger.methodFactory = (method, level, name) => {
      this.category = name.toString();

      const defaultMethod = defaultMethodFactory(method, level, name);

      switch (method) {
        case "error":
          return (err: Error, ...msgs: unknown[]) => {
            this.error(err, ...msgs);
            if (defaultMethod) defaultMethod(err, ...msgs);
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
    this.sentry.getClient().getOptions().enabled = enabled;
  }

  isEnabled(): boolean {
    return this.sentry.getClient().getOptions().enabled;
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
    this.sentry.withScope((scope) => {
      scope.setTag("category", this.category);
      scope.setExtra("messages", msgs);
      this.sentry.captureException(err);
    });
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
