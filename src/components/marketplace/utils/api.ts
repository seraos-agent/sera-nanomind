import { getApiBaseUrl } from "../../../config/marketplaceConfig";

/**
 * Returns full API URL for marketplace endpoints.
 * Automatically resolves to Cloud Run API in production or localhost in development.
 */
export function getMarketApiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
