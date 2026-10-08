import "server-only";

import { RentCarSoftError } from "./errors";

export type RentCarSoftConfig = {
  baseUrl: string;
  apiKey: string;
};

export function getRentCarSoftConfig(
  env: NodeJS.ProcessEnv = process.env,
): RentCarSoftConfig {
  const baseUrl = env.RCS_URL?.trim().replace(/\/+$/, "");
  const apiKey = env.RCS_KEY?.trim();

  if (!baseUrl || !apiKey) {
    throw new RentCarSoftError("config");
  }

  return { baseUrl, apiKey };
}
