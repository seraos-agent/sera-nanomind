/**
 * Marketplace & API configuration helpers.
 * Adheres strictly to Rule 7 (Universal Codebase Language: English Standard).
 */

import { getApiBaseUrl as getPlatformApiBaseUrl } from '../utils/platform';

export function getApiBaseUrl(): string {
  return getPlatformApiBaseUrl();
}

export function getMarketplaceUrl(storeSlug?: string): string {
  if (import.meta.env.VITE_MARKETPLACE_URL) {
    const baseUrl = import.meta.env.VITE_MARKETPLACE_URL;
    return storeSlug ? `${baseUrl}?store=${encodeURIComponent(storeSlug)}` : baseUrl;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const devUrl = window.location.origin;
      return storeSlug ? `${devUrl}?store=${encodeURIComponent(storeSlug)}` : devUrl;
    }
  }
  const prodUrl = 'https://app.seraos.xyz';
  return storeSlug ? `${prodUrl}?store=${encodeURIComponent(storeSlug)}` : prodUrl;
}
