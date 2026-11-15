import { cacheLife, cacheTag } from "next/cache";

import { listServicePointKeys } from "./catalog";
import {
  countLocations,
  localizeCities,
  isActiveServicePoint,
  parseDepartment,
  parseDepartments,
  parseServicePoint,
  parseServicePoints,
  type Department,
  type LocationStats,
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
  // Town names from the whole list, so a town's inactive points still count.
  const localized = localizeCities(points, lang);
  if (input.includeInactive) {
    return localized;
  }
  return localized.filter(isActiveServicePoint);
}

/**
 * How many fixed pickup points, towns and airports there are, from the active
 * service points (same cache as `listServicePoints`). For copy that names the
 * network; a page without RentCarSoft shows its text without numbers.
 */
export async function getLocationStats(input: { lang?: string } = {}): Promise<LocationStats> {
  return countLocations(await listServicePoints({ lang: input.lang }));
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
