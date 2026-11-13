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
import { cacheEnabled } from "../../cache";

export async function listServicePoints(input: {
  lang?: string;
  keyIds?: number[];
  departmentIds?: number[];
  includeInactive?: boolean;
} = {}): Promise<ServicePoint[]> {
  const query = buildServicePointQuery(input);
  const lang = input.lang ?? "pl";
  const points = await (cacheEnabled() ? loadCachedServicePoints(query, lang) : loadServicePoints(query, lang));
  if (input.includeInactive) {
    return points;
  }
  return points.filter(isActiveServicePoint);
}

export async function getServicePoint(
  id: number,
  input: { lang?: string; keyIds?: number[] } = {},
): Promise<ServicePoint> {
  const query = buildServicePointQuery(input);
  const lang = input.lang ?? "pl";
  return cacheEnabled() ? loadCachedServicePoint(id, query, lang) : loadServicePoint(id, query, lang);
}

export async function listDepartments(): Promise<Department[]> {
  return cacheEnabled() ? loadCachedDepartments() : loadDepartments();
}

export async function getDepartment(id: number): Promise<Department> {
  return cacheEnabled() ? loadCachedDepartment(id) : loadDepartment(id);
}

async function loadCachedServicePoints(
  query: QueryParams,
  lang: string,
): Promise<ServicePoint[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadServicePoints(query, lang);
}

async function loadServicePoints(query: QueryParams, lang: string): Promise<ServicePoint[]> {
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
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadServicePoint(id, query, lang);
}

async function loadServicePoint(id: number, query: QueryParams, lang: string): Promise<ServicePoint> {
  const [payload, definitions] = await Promise.all([
    rentCarSoftRequest({ path: `/service_point/${id}.json`, query }),
    listServicePointKeys(lang),
  ]);
  return parseServicePoint(payload, definitions);
}

async function loadCachedDepartments(): Promise<Department[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadDepartments();
}

async function loadCachedDepartment(id: number): Promise<Department> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.all, CACHE_TAGS.catalog);
  return loadDepartment(id);
}

async function loadDepartments(): Promise<Department[]> {
  return parseDepartments(
    await rentCarSoftRequest({ path: "/departments.json" }),
  );
}

async function loadDepartment(id: number): Promise<Department> {
  return parseDepartment(
    await rentCarSoftRequest({ path: `/department/${id}.json` }),
  );
}
