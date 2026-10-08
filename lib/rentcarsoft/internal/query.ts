export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | QueryValue[]
  | { [key: string]: QueryValue };

function primitive(value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

function append(
  params: URLSearchParams,
  key: string,
  value: QueryValue,
): void {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      if (item !== null && typeof item === "object") {
        append(params, `${key}[${index}]`, item);
      } else {
        append(params, `${key}[]`, item);
      }
    }
    return;
  }

  if (typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      append(params, `${key}[${childKey}]`, childValue);
    }
    return;
  }

  params.append(key, primitive(value));
}

export function serializeQuery(
  query: Record<string, QueryValue> | undefined,
): string {
  const params = new URLSearchParams();
  params.append("dataType", "json");

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (key === "dataType") {
        continue;
      }
      append(params, key, value);
    }
  }

  return params.toString();
}
