/**
 * In-App Image Download & Native Gallery Utility.
 * Strictly adheres to Rule 7 (Universal Codebase Language: English Standard).
 *
 * Ensures images download directly into the Android device's Gallery (Pictures/Sera)
 * via the native AndroidBridge, or standard Blob downloads on Web browsers.
 */

import { getCachedImage, fetchAndCacheImage, isUrlDead } from './imageCache';

export async function handleInAppImageDownload(
  imageUrl: string,
  filename?: string
): Promise<void> {
  if (!imageUrl) return;
  const name = filename || `Sera_Artwork_${Date.now()}.png`;

  try {
    // 1. Retrieve image base64 dataUrl from local cache or via CORS proxy
    let dataUrl = imageUrl.startsWith('data:') ? imageUrl : await getCachedImage(imageUrl);
    if (!dataUrl) {
      dataUrl = await fetchAndCacheImage(imageUrl);
    }

    // Fallback: direct fetch -> Blob -> DataURL if cache/proxy returned null
    if (!dataUrl && !isUrlDead(imageUrl)) {
      try {
        const res = await fetch(imageUrl);
        if (res.ok) {
          const blob = await res.blob();
          dataUrl = await blobToDataUrl(blob);
        }
      } catch {}
    }

    if (!dataUrl) {
      dataUrl = imageUrl;
    }

    // If URL is dead or expired and we don't have base64, abort gracefully without console errors
    if (!dataUrl.startsWith('data:') && isUrlDead(dataUrl)) {
      console.warn('[ImageDownload] Image has expired and cannot be retrieved.');
      return;
    }

    // 2. Android Capacitor Native Gallery Flow:
    // Invoke AndroidBridge.saveImageToGallery directly to save into Pictures/Sera with native toast
    const win = typeof window !== 'undefined' ? (window as any) : null;
    const nativeBridge = win?.AndroidBridge || win?.AndroidSystemBars;

    if (nativeBridge && typeof nativeBridge.saveImageToGallery === 'function') {
      if (dataUrl.startsWith('data:')) {
        nativeBridge.saveImageToGallery(dataUrl, name);
        return;
      }
      console.warn('[ImageDownload] Could not convert image to base64 for native gallery.');
    }

    // 3. Web / Desktop Flow: Convert dataUrl to Blob and trigger browser download
    if (dataUrl.startsWith('data:')) {
      const blob = dataUrlToBlob(dataUrl);
      triggerBlobDownload(blob, name);
      return;
    }

    // 4. Fallback for external URLs without dataUrl (only if not dead)
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    triggerBlobDownload(blob, name);
  } catch (err: any) {
    if (!isUrlDead(imageUrl)) {
      console.warn('[ImageDownload] Download error, attempting fallback:', err?.message || err);
      triggerDirectLinkDownload(imageUrl, name);
    }
  }
}

function blobToDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function triggerBlobDownload(blob: Blob, name: string): void {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(objectUrl), 2000);
}

function triggerDirectLinkDownload(url: string, name: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
