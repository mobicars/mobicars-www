export const STRAPI_ERROR_CODES = [
  "unauthorized",
  "api",
  "graphql",
  "timeout",
  "network",
  "malformed_response",
] as const;

export type StrapiErrorCode = (typeof STRAPI_ERROR_CODES)[number];

const MESSAGES: Record<StrapiErrorCode, string> = {
  unauthorized: "Strapi rejected the API token.",
  api: "Strapi returned an error.",
  graphql: "Strapi rejected the GraphQL query.",
  timeout: "Strapi request timed out.",
  network: "Strapi request failed.",
  malformed_response: "Strapi returned an unreadable response.",
};

/** Messages are fixed strings: no token, no response body. */
export class StrapiError extends Error {
  readonly code: StrapiErrorCode;
  readonly status?: number;

  constructor(code: StrapiErrorCode, status?: number) {
    super(MESSAGES[code]);
    this.name = "StrapiError";
    this.code = code;
    if (status !== undefined) {
      this.status = status;
    }
  }
}
