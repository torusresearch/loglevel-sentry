const defaultPattern = /(private|key|secret|authorization|address|email)+/i;

function isHex(s: string) {
  return /^(-0x|0x)?[0-9a-f]*$/i.test(s);
}

export function redactEventData<T = unknown>(data: T, keyPattern = defaultPattern): T {
  if (typeof data !== "object" || data === null) return data;

  const keys = Object.keys(data) as (keyof T)[];

  for (const k of keys) {
    const v = data[k];
    if (typeof v === "string" && keyPattern.test(k as string)) data[k] = "***" as (T & object)[keyof T];
    else data[k] = redactEventData(v, keyPattern);
  }

  return data;
}

export function redactBreadcrumbData<T = unknown>(data: T): T {
  if (!data) return data;

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
        result[k] = redactBreadcrumbData(v);
      }
    }
  }
  return result;
}

/**
 * @deprecated Use `redactEventData` instead
 */
export function redactData<T = unknown>(data: T, keyPattern = defaultPattern): T {
  return redactEventData(data, keyPattern);
}
