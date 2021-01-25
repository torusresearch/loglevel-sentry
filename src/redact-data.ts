const defaultPattern = /(private|key|secret|authorization|address|email)+/i;

export function redactData<T = unknown>(data: T, keyPattern = defaultPattern): T {
  if (typeof data !== "object" || data === null) return data;

  const keys = Object.keys(data);

  for (const k of keys) {
    const v = data[k];
    if (typeof v === "string" && keyPattern.test(k)) data[k] = "***";
    else data[k] = redactData(v, keyPattern);
  }

  return data;
}
