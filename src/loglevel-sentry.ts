import {
  type addBreadcrumb,
  type Breadcrumb,
  type captureException,
  type getActiveSpan,
  type getClient,
  normalize,
  type SeverityLevel,
} from "@sentry/core";
import { type Logger } from "loglevel";

interface AxiosResponse {
  data: unknown;
  status: number;
  headers: Record<string, string>;
}

export interface Sentry {
  addBreadcrumb: typeof addBreadcrumb;
  captureException: typeof captureException;
  getActiveSpan: typeof getActiveSpan;
  getClient: typeof getClient;
}

export class LoglevelSentry {
  private sentry?: Sentry;

  private category: string;

  constructor(sentry?: Sentry) {
    this.sentry = sentry;
    this.category = "loglevel-sentry";
  }

  private static async translateError(args: unknown[]): Promise<[Error, unknown[]]> {
    const index = args.findIndex((arg) => arg instanceof Error);
    const msgIndex = args.findIndex((arg) => typeof arg === "string");
    const apiErrorIdx = args.findIndex((arg) => arg && typeof arg === "object" && "status" in arg && "type" in arg);
    const axiosErrorIdx = args.findIndex((arg) => arg && typeof arg === "object" && "isAxiosError" in arg && arg.isAxiosError === true);
    let err: Error;
    if (apiErrorIdx !== -1) {
      const apiError = args[apiErrorIdx] as Response;
      const contentType = apiError.headers?.get("content-type");
      if (contentType.includes("application/json")) {
        const errJson = await apiError.json();
        err = new Error(errJson?.error || errJson?.message || JSON.stringify(errJson));
      } else if (contentType.includes("text/plain")) {
        err = new Error(await apiError.text());
      } else {
        err = new Error(`${apiError.status} ${apiError.type.toString()} ${apiError.statusText}`);
      }
    } else if (axiosErrorIdx !== -1) {
      const axiosError = args[axiosErrorIdx] as { response: AxiosResponse };
      const errorResponse = axiosError.response;
      if (errorResponse) {
        const contentType = errorResponse.headers?.["content-type"];
        if (contentType.includes("application/json")) {
          const errJson = errorResponse.data as object;
          const errorMsg = "error" in errJson ? errJson.error : "message" in errJson ? errJson.message : JSON.stringify(errJson);
          err = new Error(errorMsg as string);
        } else if (contentType.includes("text/plain")) {
          err = new Error(errorResponse.data as string);
        } else {
          err = new Error(`${errorResponse.status} ${errorResponse.data.toString()}`);
        }
      } else {
        err = new Error("Network error");
      }
    } else if (index !== -1) {
      err = args.splice(index, 1)[0] as Error;
    } else if (msgIndex !== -1) {
      err = new Error(args.splice(msgIndex, 1)[0] as string);
    } else {
      err = new Error("Unknown error");
    }
    return [err, args];
  }

  private static translateArgs(args: unknown[]): Pick<Breadcrumb, "data" | "message"> {
    const msgIndex = args.findIndex((arg) => typeof arg === "string");
    const firstMsg = msgIndex !== -1 ? (args.splice(msgIndex, 1)[0] as string) : undefined;
    return firstMsg
      ? {
          message: firstMsg,
          // args is already spliced
          data: { arguments: args },
        }
      : { data: { arguments: args } };
  }

  private static translateLevel(level: string): SeverityLevel {
    switch (level) {
      case "info":
        return "info";
      case "warn":
        return "warning";
      default:
        return "debug";
    }
  }

  install(logger: Logger): void {
    const defaultMethodFactory = logger.methodFactory;

    logger.methodFactory = (method, level, name) => {
      if (name) this.category = name.toString();
      const defaultMethod = defaultMethodFactory(method, level, name);

      const isFrontend = typeof window !== "undefined";

      const overrideDefaultMethod = (...args: unknown[]) => {
        const currentSpan = this.sentry?.getActiveSpan();
        const { traceId, spanId } = currentSpan?.spanContext() || {};
        const isError = method === "error" && args.length >= 1 && args[0] instanceof Error;
        if (isFrontend) {
          if (isError) {
            const error = args[0] as Error;
            const errMsg = traceId || spanId ? `${error.message}: traceId: ${traceId} - spanId: ${spanId}` : error.message;
            const newError = new Error(errMsg, { cause: error });
            const newArgs = [newError, ...args.slice(1)];
            if (defaultMethod) defaultMethod(...newArgs);
            return;
          }
          if (defaultMethod) defaultMethod(...args);
        } else {
          let logData: Record<string, unknown> = { timestamp: new Date(), level: method.toUpperCase(), logger: name };
          if (traceId || spanId) logData = { ...logData, traceId, spanId };
          if (isError) {
            const error = args[0] as Error;
            logData = { ...logData, message: error.message ?? "", stack: error.stack, extra: args.length > 1 ? args.slice(1) : undefined };
          } else {
            logData = { ...logData, message: args[0] ?? "", extra: args.length > 1 ? args.slice(1) : undefined };
          }
          if (defaultMethod) defaultMethod(JSON.stringify(normalize(logData)));
        }
      };

      switch (method) {
        case "error":
          return async (...args: unknown[]) => {
            // stack trace is lost when using async/await
            const { stack } = new Error();
            const [err, otherArgs] = await LoglevelSentry.translateError(args);
            // set original stack trace
            err.stack = stack;

            this.error(err, ...otherArgs);
            overrideDefaultMethod(err, ...otherArgs);
          };

        default:
          return (...args: unknown[]) => {
            this.log(LoglevelSentry.translateLevel(method), ...args);
            // keep behavior consistent to console in browser
            overrideDefaultMethod(...args);
          };
      }
    };

    logger.setLevel(logger.getLevel());
  }

  setEnabled(enabled: boolean): void {
    if (this.sentry) {
      const options = this.sentry.getClient().getOptions();
      if (options) {
        options.enabled = enabled;
      }
    }
  }

  isEnabled(): boolean {
    if (this.sentry) {
      const options = this.sentry.getClient().getOptions();
      return options?.enabled ?? false;
    }
    return false;
  }

  log(level: SeverityLevel, ...args: unknown[]): void {
    if (this.sentry) {
      this.sentry.addBreadcrumb({
        ...LoglevelSentry.translateArgs(args),
        category: this.category,
        level,
        timestamp: Date.now(),
      });
    }
  }

  trace(...args: unknown[]): void {
    this.log("debug", ...args);
  }

  error(err: Error, ...args: unknown[]): void {
    const eventHint = {
      data: {
        logger: "loglevel-sentry",
        "logger.name": this.category,
        arguments: args,
      },
    };
    if (this.sentry) this.sentry.captureException(err, eventHint);
  }
}
