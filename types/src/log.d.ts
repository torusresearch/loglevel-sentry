import { IData, ILogger, ITorusLogOptions } from "./interfaces";
export default class TorusLog implements ILogger {
    private name;
    private logger;
    private sentry?;
    private isActive;
    constructor({ name, loggerFactory, monitorOpts }: ITorusLogOptions);
    enable(): void;
    disable(): void;
    trace(msg: string, data?: IData): void;
    info(msg: string, data?: IData): void;
    error(err: Error, data?: IData): void;
}
