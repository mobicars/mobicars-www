export const RENTCARSOFT_ERROR_CODES = [
  "config",
  "unauthorized",
  "invalid_request",
  "not_found",
  "api",
  "timeout",
  "network",
  "malformed_response",
] as const;

export type RentCarSoftErrorCode = (typeof RENTCARSOFT_ERROR_CODES)[number];

const MESSAGES: Record<RentCarSoftErrorCode, string> = {
  config: "RentCarSoft is not configured.",
  unauthorized: "RentCarSoft rejected the API credentials.",
  invalid_request: "RentCarSoft rejected the request.",
  not_found: "RentCarSoft resource was not found.",
  api: "RentCarSoft returned an error.",
  timeout: "RentCarSoft request timed out.",
  network: "RentCarSoft request failed.",
  malformed_response: "RentCarSoft returned an unreadable response.",
};

export class RentCarSoftError extends Error {
  readonly code: RentCarSoftErrorCode;
  readonly status?: number;

  constructor(
    code: RentCarSoftErrorCode,
    status?: number,
    message: string = MESSAGES[code],
  ) {
    super(message);
    this.name = "RentCarSoftError";
    this.code = code;
    if (status !== undefined) {
      this.status = status;
    }
  }
}

export function rentCarSoftErrorMessage(code: RentCarSoftErrorCode): string {
  return MESSAGES[code];
}
