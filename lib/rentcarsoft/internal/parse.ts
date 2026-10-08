import { RentCarSoftError } from "./errors";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function expectRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new RentCarSoftError("malformed_response");
  }
  return value;
}

export function expectArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new RentCarSoftError("malformed_response");
  }
  return value;
}

export function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

export function asId(value: unknown): number | null {
  const parsed = asNumber(value);
  if (parsed === null || !Number.isInteger(parsed)) {
    return null;
  }
  return parsed;
}

export function requireId(value: unknown): number {
  const id = asId(value);
  if (id === null) {
    throw new RentCarSoftError("malformed_response");
  }
  return id;
}

export type FieldAttribute = {
  label: string;
  value: string;
  valueId: number | null;
};

export type KeyDefinition = {
  id: number;
  name: string;
  values: { id: number; name: string }[];
};

export function parseKeyDefinitions(value: unknown): KeyDefinition[] {
  return expectArray(value).map((item) => {
    const record = expectRecord(item);
    const values = Array.isArray(record.values)
      ? record.values.flatMap((entry) => {
          if (!isRecord(entry)) {
            return [];
          }
          const id = asId(entry.id);
          const name = asString(entry.name);
          if (id === null || name === null) {
            return [];
          }
          return [{ id, name }];
        })
      : [];

    return {
      id: requireId(record.id),
      name: asString(record.name) ?? "",
      values,
    };
  });
}

export function mapCustomFields(
  keys: unknown,
  labels: Record<number, string>,
  definitions?: KeyDefinition[],
): Record<string, FieldAttribute> {
  if (!Array.isArray(keys)) {
    return {};
  }

  const byId = new Map(definitions?.map((item) => [item.id, item]));
  const attributes: Record<string, FieldAttribute> = {};

  for (const item of keys) {
    if (!isRecord(item)) {
      continue;
    }
    const id = asId(item.id);
    if (id === null) {
      continue;
    }
    const label = labels[id];
    if (!label) {
      continue;
    }
    const raw = item.value;
    const rawText = raw === undefined || raw === null ? "" : String(raw);
    const valueId = asId(raw);
    const defined = byId.get(id)?.values.find((entry) => entry.id === valueId);

    attributes[label] = {
      label,
      value: defined?.name ?? rawText,
      valueId,
    };
  }

  return attributes;
}

export type PromoCodeCheck = {
  valid: boolean;
  /**
   * Raw `kod` object when the API returns one.
   * The fields of a successful code are UNVERIFIED.
   */
  code: Record<string, unknown> | null;
};

export function normalizePromoCode(value: unknown): PromoCodeCheck {
  const record = expectRecord(value);
  const success = record.success;
  let valid: boolean;
  if (success === true || success === "true") {
    valid = true;
  } else if (success === false || success === "false") {
    valid = false;
  } else {
    throw new RentCarSoftError("malformed_response");
  }

  if (record.kod === null || record.kod === undefined) {
    return { valid, code: null };
  }
  if (!isRecord(record.kod)) {
    throw new RentCarSoftError("malformed_response");
  }
  return { valid, code: record.kod };
}

export type ClientRecord = {
  id: number;
  company: boolean | null;
  lastLogin: string | null;
  keys: { id: number; value: string }[];
  attributes: Record<string, FieldAttribute>;
};

export function normalizeClient(
  value: unknown,
  labels: Record<number, string>,
  definitions?: KeyDefinition[],
): ClientRecord {
  const record = unwrapClientPayload(value);
  const keys = Array.isArray(record.keys)
    ? record.keys.flatMap((item) => {
        if (!isRecord(item)) {
          return [];
        }
        const id = asId(item.id);
        if (id === null || item.value === undefined || item.value === null) {
          return [];
        }
        return [{ id, value: String(item.value) }];
      })
    : [];

  return {
    id: requireId(record.id),
    company: asBoolean(record.isCompany),
    lastLogin: asString(record.lastLogin),
    keys,
    attributes: mapCustomFields(record.keys, labels, definitions),
  };
}

function unwrapClientPayload(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    if (value.length !== 1) {
      throw new RentCarSoftError("malformed_response");
    }
    return expectRecord(value[0]);
  }
  return expectRecord(value);
}
