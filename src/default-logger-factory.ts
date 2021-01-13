import loglevel from "loglevel";

import { IData, ILogger } from "./interfaces";

export default function defaultLoggerFactory(name: string): ILogger {
  const defaultLogger = loglevel.getLogger(name);
  defaultLogger.enableAll();

  return {
    trace(msg: string, data?: IData): void {
      defaultLogger.trace(msg, data);
    },
    info(msg: string, data?: IData): void {
      defaultLogger.info(msg, data);
    },
    error(err: Error, data?: IData): void {
      defaultLogger.error(err, data);
    },
  };
}
