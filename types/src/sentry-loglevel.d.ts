import { BrowserOptions } from "@sentry/browser";
import { Logger } from "loglevel";
export default function installSentry(logger: Logger, opts: BrowserOptions): {
    trace: (...msgs: unknown[]) => void;
    error: (err: Error, ...msgs: unknown[]) => void;
};
