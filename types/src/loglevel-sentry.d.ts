import { Hub } from "@sentry/core";
import { Breadcrumb, Severity, CaptureContext } from "@sentry/types";
import { Logger } from "loglevel";
export interface Sentry {
    captureException(exception: any, captureContext?: CaptureContext): string;
    addBreadcrumb(breadcrumb: Breadcrumb): void;
    getCurrentHub(): Hub;
}
export default class LoglevelSentry {
    private sentry;
    private category;
    constructor(sentry: Sentry);
    install(logger: Logger): void;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    log(level: Severity, ...msgs: unknown[]): void;
    trace(...msgs: unknown[]): void;
    error(err: Error, ...msgs: unknown[]): void;
    private static translateError;
    private static translateMessage;
    private static translateLevel;
}
