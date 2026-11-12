import { GraphQLClient } from "graphql-request";
import { getSdk, Sdk } from "./generated/graphql";
import { isProduction } from "../env";

export type StrapiClientOptions = {
  tags?: string[];
  revalidate?: number | false;
  preview?: boolean;
};

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_KEY = process.env.STRAPI_KEY;

/**
 * Creates fully typed GraphQL SDK with native Next.js Data Cache support.
 *
 * If domain is not production (mobicars.pl), cache is automatically bypassed (no-store).
 */
export const getStrapiClient = (options: StrapiClientOptions = {}): Sdk => {
  const prod = isProduction();
  const { tags = [], revalidate = 21600, preview = !prod } = options;

  const client = new GraphQLClient(`${STRAPI_URL}/graphql`, {
    headers: {
      ...(STRAPI_KEY ? { Authorization: `Bearer ${STRAPI_KEY}` } : {}),
    },
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      // Bypass cache outside production or in preview mode
      if (!prod || preview) {
        return fetch(input, {
          ...init,
          cache: "no-store",
        });
      }

      return fetch(input, {
        ...init,
        next: {
          tags: ["strapi", ...tags],
          revalidate,
        },
      });
    },
  });

  return getSdk(client);
};
