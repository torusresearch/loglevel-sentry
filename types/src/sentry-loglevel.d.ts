import { BrowserOptions, Severity } from "@sentry/browser";
import { Logger } from "loglevel";
export default function installSentry(logger: Logger, opts: BrowserOptions): {
    log: (level: Severity, ...msgs: unknown[]) => void;
    trace: (...msgs: unknown[]) => void;
    error: (err: Error, ...msgs: unknown[]) => void;
};
