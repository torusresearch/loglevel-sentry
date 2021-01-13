import { Breadcrumb, BrowserClient, BrowserOptions, Hub, Severity } from "@sentry/browser";
import { Logger } from "loglevel";

function translateMessage(msgs: any[]): Pick<Breadcrumb, "data" | "message"> {
  const [firstMsg, ...otherMsgs] = msgs;
  return typeof firstMsg === "string"
    ? {
        message: firstMsg,
        data: { extra: otherMsgs },
      }
    : { data: { extra: msgs } };
}

export default function installSentry(logger: Logger, opts: BrowserOptions) {
  const sentry = new Hub(new BrowserClient(opts));

  const defaultMethodFactory = logger.methodFactory;

  logger.methodFactory = (method, level, name) => {
    const defaultMethod = defaultMethodFactory(method, level, name);

    switch (method) {
      case "trace":
      case "info":
        return (...msgs: unknown[]) => {
          sentry.addBreadcrumb({
            ...translateMessage(msgs),
            category: name.toString(),
            level: method === "info" ? Severity.Info : Severity.Debug,
            timestamp: Date.now(),
          });
          if (defaultMethod) defaultMethod(...msgs);
        };

      case "error":
        return (err: Error, ...msgs: unknown[]) => {
          sentry.withScope((scope) => {
            scope.setExtra("extra", msgs);
            sentry.captureException(err);
          });
          if (defaultMethod) defaultMethod(err, ...msgs);
        };

      default:
        return defaultMethod;
    }
  };

  logger.setLevel(logger.getLevel());
}
