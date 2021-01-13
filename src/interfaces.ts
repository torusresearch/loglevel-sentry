export interface IData {
  [key: string]: unknown;
}

export interface ILogger {
  trace(msg: string, data?: IData): void;
  info(msg: string, data?: IData): void;
  error(err: Error, data?: IData): void;
}

export interface ILoggerFactory {
  (name: string): Partial<ILogger>;
}

export interface IMonitorOptions {
  dsn: string;
  environment?: string;
  release?: string;
  sampleRate?: number;
}

export type ITorusLogOptions = {
  name?: string;
  loggerFactory?: ILoggerFactory;
  monitorOpts?: IMonitorOptions;
};
