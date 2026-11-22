import { DEMO_PRODUCTS } from '../../../../services/demoCommerceSeed';

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500';

const LEGACY_RICE_IMAGE_ID = 'photo-1586201375761';

function isUsableProductImage(url?: string): url is string {
  return Boolean(url && url.trim() && !url.includes(LEGACY_RICE_IMAGE_ID));
}

function readLocalMerchantProducts(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('sera_merchant_products');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Resolves the authoritative product thumbnail URL for Cart, Processing, and Completed order panes.
 */
export function resolveCartItemImage(input: {
  id?: string;
  itemId?: string;
  name?: string;
  selectedImage?: string;
  imageUrl?: string;
  images?: string[];
}): string {
  if (isUsableProductImage(input.selectedImage)) return input.selectedImage;
  if (isUsableProductImage(input.imageUrl)) return input.imageUrl;
  if (Array.isArray(input.images)) {
    const firstUsable = input.images.find((img) => isUsableProductImage(img));
    if (firstUsable) return firstUsable;
  }

  const targetId = String(input.itemId || input.id || '').trim();
  const targetName = String(input.name || '').trim().toLowerCase();
  const candidates = [...readLocalMerchantProducts(), ...DEMO_PRODUCTS];

  const matchedById = targetId
    ? candidates.find((p) => p && String(p.id || '').trim() === targetId)
    : undefined;
  const matched =
    matchedById ||
    (targetName
      ? candidates.find((p) => p && String(p.name || '').trim().toLowerCase() === targetName)
      : undefined);

  if (matched) {
    if (isUsableProductImage(matched.imageUrl)) return matched.imageUrl;
    if (Array.isArray(matched.images)) {
      const matchedImg = matched.images.find((img: any) => isUsableProductImage(img));
      if (matchedImg) return matchedImg;
    }
  }

  return DEFAULT_PRODUCT_IMAGE;
}
