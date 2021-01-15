import { BrowserOptions, Severity } from "@sentry/browser";
import { Logger } from "loglevel";
export default class LoglevelSentry {
    private sentry;
    private category;
    constructor(opts: BrowserOptions);
    install(logger: Logger): void;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    log(level: Severity, ...msgs: unknown[]): void;
    trace(...msgs: unknown[]): void;
    error(err: Error, ...msgs: unknown[]): void;
    private static translateMessage;
    private static translateLevel;
}
