import { normalize } from "@sentry/utils";

const defaultPattern = /(private|key|secret|authorization|address|email|login_hint)+/i;

function isHex(s: string) {
  return /^(-0x|0x)?[0-9a-f]*$/i.test(s);
}

function redactInternalEventData<T = unknown>(data: T, keyPattern = defaultPattern): T {
  if (typeof data !== "object" || data === null) return data;

  const keys = Object.keys(data) as (keyof T)[];

  for (const k of keys) {
    const v = data[k];
    if (typeof v === "string" && keyPattern.test(k as string)) data[k] = "***" as (T & object)[keyof T];
    else data[k] = redactInternalEventData(v, keyPattern);
  }

  return data;
}

export function redactEventData<T = unknown>(data: T, keyPattern = defaultPattern, maxDepth = 8): T {
  const normalizedData = normalize(data, maxDepth);
  return redactInternalEventData(normalizedData, keyPattern);
}

function redactInternalBreadcrumbData<T = unknown>(data: T): T {
  let result = data;
  if (typeof data === "object") {
    result = { ...data };
  } else if (Array.isArray(data)) {
    // Workaround TypeScript limitation to map types between `data` and `result`
    result = [...data] as unknown as T;
  } else {
    return data;
  }

  for (const k in data) {
    if (Object.prototype.hasOwnProperty.call(data, k)) {
      const v = data[k];
      if (typeof v === "string" && isHex(v)) {
        // Workaround TypeScript limitation to map types between `data` and `result`
        result[k] = "***" as unknown as T[Extract<keyof T, string>];
      } else {
        try {
          result[k] = redactInternalBreadcrumbData(v);
        } catch (error) {
          // We are not able to redact the value
          result[k] = "***" as unknown as T[Extract<keyof T, string>];
        }
      }
    }
  }
  return result;
}

export function redactBreadcrumbData<T = unknown>(data: T, maxDepth = 8): T {
  if (!data) return data;
  const normalizedData = normalize(data, maxDepth);
  return redactInternalBreadcrumbData(normalizedData);
}
