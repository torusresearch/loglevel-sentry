import { Hub } from "@sentry/core";
import { Breadcrumb, CaptureContext, Severity } from "@sentry/types";
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
    log(level: Severity, ...args: unknown[]): void;
    trace(...args: unknown[]): void;
    error(err: Error, ...args: unknown[]): void;
    private static translateError;
    private static translateArgs;
    private static translateLevel;
}
