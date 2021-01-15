import { Breadcrumb, BrowserClient, BrowserOptions, Hub, Severity } from "@sentry/browser";
import { Logger } from "loglevel";

function translateMessage(messages: any[]): Pick<Breadcrumb, "data" | "message"> {
  const [firstMsg, ...otherMsgs] = messages;
  return typeof firstMsg === "string"
    ? {
        message: firstMsg,
        data: { messages: otherMsgs },
      }
    : { data: { messages } };
}

function translateLevel(level: string): Severity {
  switch (level) {
    case "info":
      return Severity.Info;
    case "warn":
      return Severity.Warning;
    default:
      return Severity.Debug;
  }
}

export default function installSentry(logger: Logger, opts: BrowserOptions) {
  const sentry = new Hub(new BrowserClient(opts));

  let category = "sentry-loglevel";
  const setEnabled = (enabled: boolean) => {
    sentry.getClient().getOptions().enabled = enabled;
  };
  const log = (level: Severity, ...msgs: unknown[]) => {
    sentry.addBreadcrumb({
      ...translateMessage(msgs),
      category,
      level,
      timestamp: Date.now(),
    });
  };
  const trace = (...msgs: unknown[]) => {
    log(Severity.Debug, ...msgs);
  };
  const error = (err: Error, ...msgs: unknown[]) => {
    sentry.withScope((scope) => {
      scope.setTag("category", category);
      scope.setExtra("extra", msgs);
      sentry.captureException(err);
    });
  };

  const defaultMethodFactory = logger.methodFactory;

  logger.methodFactory = (method, level, name) => {
    category = name.toString();

    const defaultMethod = defaultMethodFactory(method, level, name);

    switch (method) {
      case "error":
        return (err: Error, ...msgs: unknown[]) => {
          error(err, ...msgs);
        };

      default:
        return (...msgs: unknown[]) => {
          log(translateLevel(method), ...msgs);
          if (defaultMethod) defaultMethod(...msgs);
        };
    }
  };

  logger.setLevel(logger.getLevel());

  return { setEnabled, log, trace, error };
}
