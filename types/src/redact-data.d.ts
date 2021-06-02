export declare function redactEventData<T = unknown>(data: T, keyPattern?: RegExp): T;
export declare function redactBreadcrumbData<T = unknown>(data: T): T;
/**
 * @deprecated Use `redactEventData` instead
 */
export declare function redactData<T = unknown>(data: T, keyPattern?: RegExp): T;
