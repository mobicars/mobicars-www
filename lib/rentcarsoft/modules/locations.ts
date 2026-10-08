import { cacheLife, cacheTag } from "next/cache";

import { listServicePointKeys } from "./catalog";
import {
  isActiveServicePoint,
  parseDepartment,
  parseDepartments,
  parseServicePoint,
  parseServicePoints,
  type Department,
  type ServicePoint,
} from "../internal/entities";
import { rentCarSoftRequest } from "../internal/http";
import { CACHE_TAGS } from "../internal/labels";
import { buildServicePointQuery, type QueryParams } from "../internal/params";

export async function listServicePoints(input: {
  lang?: string;
  keyIds?: number[];
  departmentIds?: number[];
  includeInactive?: boolean;
} = {}): Promise<ServicePoint[]> {
  const points = await loadCachedServicePoints(
    buildServicePointQuery(input),
    input.lang ?? "pl",
  );
  if (input.includeInactive) {
    return points;
  }
  return points.filter(isActiveServicePoint);
}

export async function getServicePoint(
  id: number,
  input: { lang?: string; keyIds?: number[] } = {},
): Promise<ServicePoint> {
  return loadCachedServicePoint(
    id,
    buildServicePointQuery(input),
    input.lang ?? "pl",
  );
}

export async function listDepartments(): Promise<Department[]> {
  return loadDepartments();
}

export async function getDepartment(id: number): Promise<Department> {
  return loadDepartment(id);
}

async function loadCachedServicePoints(
  query: QueryParams,
  lang: string,
): Promise<ServicePoint[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  const [payload, definitions] = await Promise.all([
    rentCarSoftRequest({ path: "/service_points.json", query }),
    listServicePointKeys(lang),
  ]);
  return parseServicePoints(payload, definitions);
}

async function loadCachedServicePoint(
  id: number,
  query: QueryParams,
  lang: string,
): Promise<ServicePoint> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  const [payload, definitions] = await Promise.all([
    rentCarSoftRequest({ path: `/service_point/${id}.json`, query }),
    listServicePointKeys(lang),
  ]);
  return parseServicePoint(payload, definitions);
}

async function loadDepartments(): Promise<Department[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  return parseDepartments(
    await rentCarSoftRequest({ path: "/departments.json" }),
  );
}

async function loadDepartment(id: number): Promise<Department> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.catalog);
  return parseDepartment(
    await rentCarSoftRequest({ path: `/department/${id}.json` }),
  );
}
