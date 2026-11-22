import { getApiBaseUrl } from "../../../config/marketplaceConfig";

export const MERCHANT_DRAFT_KEY = "sera_merchant_store_draft";

export function loadStoreDraft(): Record<string, any> {
  try {
    const raw = localStorage.getItem(MERCHANT_DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {}
  return {};
}

/**
 * Upload an inline data-URL image to Cloudflare R2 media endpoint if needed.
 * Returns the uploaded remote URL, or the original string on non-data URLs / fallback.
 */
export async function uploadStoreDataUrlIfNeeded(url: string, prefix: string): Promise<string> {
  if (!url.startsWith("data:image/")) return url;
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/upload/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataUrl: url,
        filename: `${prefix}_${Date.now()}.jpg`,
        sessionId: "merchant"
      })
    });
    const data = await res.json();
    if (data?.url && !data.url.startsWith("blob:")) return data.url;
  } catch {}
  return url;
}
