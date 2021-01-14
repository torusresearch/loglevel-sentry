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

export default function installSentry(logger: Logger, opts: BrowserOptions) {
  const sentry = new Hub(new BrowserClient(opts));

  let category = "sentry-loglevel";
  const trace = (...msgs: unknown[]) => {
    sentry.addBreadcrumb({
      ...translateMessage(msgs),
      category,
      level: Severity.Debug,
      timestamp: Date.now(),
    });
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
          if (defaultMethod) defaultMethod(err, ...msgs);
        };

      default:
        return (...msgs: unknown[]) => {
          trace(...msgs);
          if (defaultMethod) defaultMethod(...msgs);
        };
    }
  };

  logger.setLevel(logger.getLevel());

  return { trace, error };
}
