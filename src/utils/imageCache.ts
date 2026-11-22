/**
 * Local Image Cache Utility (IndexedDB).
 * Strictly adheres to Rule 7 (Universal Codebase Language: English Standard).
 *
 * Persists AI-generated artwork locally on the device (indexedDB).
 * Ensures images remain visible indefinitely even after the remote CDN/OSS
 * signed URL expires (e.g., DashScope 24-hour purge).
 */

import { getApiBaseUrl } from './platform';

const DB_NAME = 'sera_media_cache';
const STORE_NAME = 'images';
const DB_VERSION = 1;

const memoryCache = new Map<string, string>();
const deadUrls = new Set<string>();

/**
 * Detects whether a signed storage/CDN URL has already expired based on
 * standard epoch expiration query parameters (e.g. Alibaba OSS 'Expires',
 * AWS S3 presigned 'Expires' or 'X-Amz-Expires', or standard 'exp').
 */
export function isUrlExpired(url: string): boolean {
  if (!url || typeof url !== 'string' || url.startsWith('data:')) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // Check epoch timestamp parameters (Alibaba OSS 'Expires', generic 'exp', AWS v2 'Expires')
    const expParam =
      params.get('Expires') ||
      params.get('expires') ||
      params.get('exp');

    if (expParam) {
      const expNum = parseInt(expParam, 10);
      if (!isNaN(expNum) && expNum > 1000000000) {
        const expMs = expNum > 1000000000000 ? expNum : expNum * 1000;
        return Date.now() > expMs;
      }
    }

    // Check AWS S3 / Google Cloud Storage V4 presigned signature dates & durations
    const amzDate = params.get('X-Amz-Date') || params.get('X-Goog-Date');
    const amzExpires = params.get('X-Amz-Expires') || params.get('X-Goog-Expires');
    if (amzDate && amzExpires) {
      // amzDate format: YYYYMMDDTHHmmssZ
      const year = parseInt(amzDate.substring(0, 4), 10);
      const month = parseInt(amzDate.substring(4, 6), 10) - 1;
      const day = parseInt(amzDate.substring(6, 8), 10);
      const hours = parseInt(amzDate.substring(9, 11), 10);
      const minutes = parseInt(amzDate.substring(11, 13), 10);
      const seconds = parseInt(amzDate.substring(13, 15), 10);
      const creationMs = Date.UTC(year, month, day, hours, minutes, seconds);
      const durationMs = parseInt(amzExpires, 10) * 1000;
      if (!isNaN(creationMs) && !isNaN(durationMs)) {
        return Date.now() > creationMs + durationMs;
      }
    }

    // Check Azure Storage SAS signed expiry ('se')
    const azureSe = params.get('se');
    if (azureSe) {
      const seMs = Date.parse(azureSe);
      if (!isNaN(seMs)) {
        return Date.now() > seMs;
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Marks a URL as known-dead so the client avoids any subsequent network requests.
 */
export function markUrlAsDead(url: string): void {
  if (!url) return;
  deadUrls.add(url);
}

/**
 * Checks whether a URL is either confirmed dead or mathematically expired.
 */
export function isUrlDead(url: string): boolean {
  if (!url) return false;
  if (deadUrls.has(url)) return true;
  return isUrlExpired(url);
}

function openMediaDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('[ImageCache] IndexedDB open error:', request.error);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Retrieve cached image dataUrl (base64) from IndexedDB.
 */
export async function getCachedImage(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  if (memoryCache.has(url)) {
    return memoryCache.get(url)!;
  }

  const db = await openMediaDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(url);
      req.onsuccess = () => {
        if (req.result?.dataUrl) {
          memoryCache.set(url, req.result.dataUrl);
          resolve(req.result.dataUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Persist an image dataUrl (base64) into IndexedDB.
 */
export async function cacheImage(url: string, dataUrl: string): Promise<void> {
  if (!url || !dataUrl) return;
  memoryCache.set(url, dataUrl);

  const db = await openMediaDatabase();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        url,
        dataUrl,
        cachedAt: Date.now()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Loads an image from direct URL or via the CORS proxy, then caches it locally.
 * Prevents redundant HTTP requests if the URL is mathematically expired or marked dead.
 */
export async function fetchAndCacheImage(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  // 1. Check existing cache in memory or IndexedDB
  const cached = await getCachedImage(url);
  if (cached) return cached;

  // 2. Pre-check: If URL is already known to be dead or expired, abort immediately
  if (isUrlDead(url)) {
    return null;
  }

  // 3. Try direct fetch first
  try {
    const directRes = await fetch(url);
    if (directRes.ok) {
      const blob = await directRes.blob();
      const dataUrl = await blobToDataUrl(blob);
      await cacheImage(url, dataUrl);
      return dataUrl;
    } else if (directRes.status === 403 || directRes.status === 404 || directRes.status === 410) {
      markUrlAsDead(url);
      return null;
    }
  } catch {
    // Continue to proxy fallback below if network was blocked by CORS
  }

  // 4. Fallback: fetch via backend media proxy to bypass CORS
  try {
    const proxyUrl = `${getApiBaseUrl()}/api/media/proxy?url=${encodeURIComponent(url)}`;
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) {
      const blob = await proxyRes.blob();
      const dataUrl = await blobToDataUrl(blob);
      await cacheImage(url, dataUrl);
      return dataUrl;
    } else if (proxyRes.status === 403 || proxyRes.status === 404 || proxyRes.status === 410) {
      markUrlAsDead(url);
      return null;
    }
  } catch {
    markUrlAsDead(url);
  }

  return null;
}

