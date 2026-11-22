import { useState, useEffect, useCallback } from 'react';
import type { MarketplaceItem, MarketplaceStore } from '../types';
import { getMarketApiUrl } from '../utils/api';
import { formatStorePinLocation } from '../utils/formatters';
import { isStoreCurrentlyOpen, type MerchantStore } from '../../merchant/types';

/**
 * Reconciles store open status with local merchant state from localStorage.
 * Ensures instant synchronization between Merchant Store and Marketplace on the same device.
 */
function mergeLocalMerchantStore(storesList: MarketplaceStore[]): MarketplaceStore[] {
  // Strip known leaked test stores and evaluate live schedule for all remaining stores
  const evaluatedStores = storesList
    .filter(s => s && s.id !== 'katering-sedap' && s.id !== 'warung-dekat-batu')
    .map(s => {
      const liveStatus = isStoreCurrentlyOpen(s as any);
      return {
        ...s,
        isOpen: liveStatus.isOpen,
      };
    });

  if (typeof window === 'undefined') return evaluatedStores;

  try {
    const rawLocal = localStorage.getItem('sera_merchant_store');
    if (!rawLocal) return evaluatedStores;
    const localStore: Partial<MerchantStore> = JSON.parse(rawLocal);
    if (!localStore || !localStore.id) return evaluatedStores;

    const evaluated = isStoreCurrentlyOpen(localStore);
    const existingIndex = evaluatedStores.findIndex(s => s.id === localStore.id);

    const convertedLocal: MarketplaceStore = {
      id: localStore.id,
      name: localStore.name || 'SERA Partner Store',
      tagline: localStore.tagline || '',
      description: localStore.description || '',
      logoUrl: localStore.logoUrl || '',
      bannerUrl: localStore.bannerUrl || '',
      type:
        localStore.type === 'JASA' || (localStore.type as any) === 'SERVICE'
          ? 'SERVICE'
          : (localStore.type as any) === 'MAKANAN' || (localStore.type as any) === 'FOOD'
            ? 'FOOD'
            : 'GOODS',
      category: localStore.category || 'General',
      rating: localStore.rating || 4.9,
      totalProducts: localStore.totalProducts || 0,
      followers: (localStore as any).followers ?? 0,
      address: localStore.address || '',
      city: localStore.city || '',
      isOpen: evaluated.isOpen,
      isOpenManualOverride: localStore.isOpenManualOverride,
      operatingHours: localStore.operatingHours || '08:00 - 21:00',
      openDays: localStore.openDays,
      openTime: localStore.openTime,
      closeTime: localStore.closeTime,
      is24Hours: localStore.is24Hours,
      whatsapp: localStore.whatsapp || '',
      verified: localStore.verified ?? true,
      courierConfig: (localStore as any).courierConfig,
    };

    if (existingIndex >= 0) {
      const merged = [...evaluatedStores];
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...convertedLocal,
        isOpen: evaluated.isOpen,
        isOpenManualOverride: localStore.isOpenManualOverride,
      };
      return merged;
    } else {
      return [convertedLocal, ...evaluatedStores];
    }
  } catch {
    return evaluatedStores;
  }
}

/**
 * Reconciles items list with local merchant products from localStorage.
 */
function mergeLocalMerchantProducts(itemsList: MarketplaceItem[]): MarketplaceItem[] {
  if (typeof window === 'undefined') return itemsList;
  try {
    const rawProducts = localStorage.getItem('sera_merchant_products');
    if (!rawProducts) return itemsList;
    const localProducts: any[] = JSON.parse(rawProducts);
    if (!Array.isArray(localProducts) || localProducts.length === 0) return itemsList;

    const rawStore = localStorage.getItem('sera_merchant_store');
    const localStore = rawStore ? JSON.parse(rawStore) : null;
    const storeId = localStore?.id || 'toko-berkah-sembako';
    const storeName = localStore?.name || 'Berkah Pantry Store';

    const convertedItems: MarketplaceItem[] = localProducts
      .filter(p => p && p.isActive !== false && p.status !== 'DRAFT')
      .map(p => ({
        id: p.id,
        storeId: p.storeId || storeId,
        storeName: storeName,
        name: p.name,
        description: p.description || '',
        price: Number(p.price) || 0,
        currency: 'IDR',
        stock: p.stock !== undefined ? Number(p.stock) : undefined,
        weight: p.weight !== undefined && p.weight !== null ? Number(p.weight) : undefined,
        weightUnit: p.weightUnit === 'ml' ? 'ml' : 'g',
        location: formatStorePinLocation({
          city: localStore?.city,
          district: localStore?.district,
          village: localStore?.village,
          address: localStore?.address,
          fallback: p.location || 'Indonesia'
        }),
        tags: [p.category || 'Umum'],
        type: p.type === 'SERVICE' ? 'SERVICE' : 'GOODS',
        category: p.category || 'Umum',
        rating: 5.0,
        imageUrl: p.imageUrl || '',
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []),
        inStock: (p.stock ?? 1) > 0,
        soldCount: 0,
        reviewsCount: 0,
        variants: p.variants?.map((v: any) => ({ name: v.name, price: Number(v.price) || 0 })),
        duration: p.serviceDuration ? `${p.serviceDuration} menit` : undefined,
      }));

    if (convertedItems.length === 0) return itemsList;

    const withoutLocalStoreItems = itemsList.filter(item => item.storeId !== storeId);
    return [...convertedItems, ...withoutLocalStoreItems];
  } catch {
    return itemsList;
  }
}

const MARKET_ITEMS_CACHE_KEY = 'sera_market_items_cache';
const MARKET_STORES_CACHE_KEY = 'sera_market_stores_cache';
const MAX_CACHED_ITEMS = 50;
const MAX_CACHED_STORES = 40;
const PAGE_FETCH_SIZE = 48;

let memoryItemsCache: MarketplaceItem[] | null = null;
let memoryStoresCache: MarketplaceStore[] | null = null;
let memoryHasMore: boolean = false;
let inFlightFetch: Promise<{ items: MarketplaceItem[] | null; stores: MarketplaceStore[] | null; hasMore: boolean }> | null = null;

function mergeUniqueItems(base: MarketplaceItem[], incoming: MarketplaceItem[]): MarketplaceItem[] {
  const byId = new Map<string, MarketplaceItem>();
  for (const item of base) {
    if (item?.id) byId.set(item.id, item);
  }
  for (const item of incoming) {
    if (item?.id) byId.set(item.id, item);
  }
  return Array.from(byId.values());
}

function stripBase64FromUrl(val?: string): string {
  if (!val || val.startsWith('data:image/')) return '';
  return val;
}

function saveBoundedCache(itemsList: MarketplaceItem[] | null, storesList: MarketplaceStore[] | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (itemsList) {
      const compactItems = itemsList.slice(0, MAX_CACHED_ITEMS).map((item) => ({
        ...item,
        ...((item as any).imageUrl ? { imageUrl: stripBase64FromUrl((item as any).imageUrl) } : {}),
        images: Array.isArray(item.images) ? item.images.map(stripBase64FromUrl).filter(Boolean) : [],
      }));
      localStorage.setItem(MARKET_ITEMS_CACHE_KEY, JSON.stringify(compactItems));
    }
    if (storesList) {
      const compactStores = storesList.slice(0, MAX_CACHED_STORES).map((store) => ({
        ...store,
        logoUrl: stripBase64FromUrl(store.logoUrl),
        bannerUrl: stripBase64FromUrl(store.bannerUrl),
      }));
      localStorage.setItem(MARKET_STORES_CACHE_KEY, JSON.stringify(compactStores));
    }
  } catch {
    // Ignore QuotaExceededError on constrained mobile WebViews
  }
}

function loadInitialItems(): MarketplaceItem[] {
  if (memoryItemsCache) return mergeLocalMerchantProducts(memoryItemsCache);
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(MARKET_ITEMS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryItemsCache = parsed;
          return mergeLocalMerchantProducts(parsed);
        }
      }
    } catch {}
  }
  return mergeLocalMerchantProducts([]);
}

function loadInitialStores(): MarketplaceStore[] {
  if (memoryStoresCache) return mergeLocalMerchantStore(memoryStoresCache);
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(MARKET_STORES_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryStoresCache = parsed;
          return mergeLocalMerchantStore(parsed);
        }
      }
    } catch {}
  }
  return mergeLocalMerchantStore([]);
}

async function fetchMarketplaceFromNetwork(): Promise<{
  items: MarketplaceItem[] | null;
  stores: MarketplaceStore[] | null;
  hasMore: boolean;
}> {
  if (inFlightFetch) return inFlightFetch;

  inFlightFetch = (async () => {
    let fetchedItems: MarketplaceItem[] | null = null;
    let fetchedStores: MarketplaceStore[] | null = null;
    let hasMore = false;

    try {
      const [itemsRes, storesRes] = await Promise.all([
        fetch(getMarketApiUrl(`/api/market/products?limit=${PAGE_FETCH_SIZE}&offset=0`)),
        fetch(getMarketApiUrl('/api/market/stores')),
      ]);

      if (itemsRes.ok) {
        const itemsJson = await itemsRes.json();
        if (Array.isArray(itemsJson.data)) {
          fetchedItems = itemsJson.data;
          hasMore = Boolean(itemsJson.hasMore ?? (typeof itemsJson.total === 'number' && fetchedItems.length < itemsJson.total));
          memoryItemsCache = fetchedItems;
          memoryHasMore = hasMore;
        }
      }

      if (storesRes.ok) {
        const storesJson = await storesRes.json();
        if (Array.isArray(storesJson.data)) {
          fetchedStores = storesJson.data.map((s: MarketplaceStore) => ({
            ...s,
            followers: s.followers !== undefined ? s.followers : 0,
          }));
          memoryStoresCache = fetchedStores;
        }
      }

      if (fetchedItems || fetchedStores) {
        saveBoundedCache(fetchedItems, fetchedStores);
      }
    } catch {
      // Network failure handled gracefully by caller
    } finally {
      inFlightFetch = null;
    }

    return { items: fetchedItems, stores: fetchedStores, hasMore };
  })();

  return inFlightFetch;
}

/**
 * Silently pre-warms marketplace data in memory and bounded localStorage cache
 * while the user is idle on the main chat screen.
 */
export async function prewarmMarketplaceData(): Promise<void> {
  await fetchMarketplaceFromNetwork();
}

export function useMarketplaceData() {
  const [items, setItems] = useState<MarketplaceItem[]>(loadInitialItems);
  const [stores, setStores] = useState<MarketplaceStore[]>(loadInitialStores);
  const [isLoading, setIsLoading] = useState<boolean>(
    () => memoryItemsCache === null && memoryStoresCache === null
  );
  const [hasMore, setHasMore] = useState<boolean>(() => memoryHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [remoteOffset, setRemoteOffset] = useState<number>(() => memoryItemsCache?.length || 0);

  const fetchData = useCallback(async () => {
    try {
      const { items: remoteItems, stores: remoteStores, hasMore: nextHasMore } = await fetchMarketplaceFromNetwork();

      if (remoteItems) {
        setRemoteOffset(remoteItems.length);
        setHasMore(nextHasMore);
        setItems(prev => {
          const mergedRemote = mergeUniqueItems(remoteItems, prev.filter(p => remoteItems.some(r => r.id === p.id) || prev.length > PAGE_FETCH_SIZE));
          return mergeLocalMerchantProducts(mergedRemote.length > 0 ? mergedRemote : remoteItems);
        });
      } else {
        setItems(prev => mergeLocalMerchantProducts(prev));
      }

      if (remoteStores) {
        setStores(mergeLocalMerchantStore(remoteStores));
      } else {
        setStores(prev => mergeLocalMerchantStore(prev));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(getMarketApiUrl(`/api/market/products?limit=${PAGE_FETCH_SIZE}&offset=${remoteOffset}`));
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.data)) {
        const batch: MarketplaceItem[] = json.data;
        const nextOffset = remoteOffset + batch.length;
        const nextHasMore = Boolean(json.hasMore ?? (typeof json.total === 'number' && nextOffset < json.total));
        setRemoteOffset(nextOffset);
        setHasMore(nextHasMore && batch.length > 0);
        if (batch.length > 0) {
          setItems(prev => mergeLocalMerchantProducts(mergeUniqueItems(prev, batch)));
        }
      }
    } catch {
      // Ignore transient pagination failure; sentinel can retry on next scroll
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, remoteOffset]);

  const fetchStoreProducts = useCallback(async (storeId: string) => {
    if (!storeId) return;
    try {
      const res = await fetch(getMarketApiUrl(`/api/market/products?storeId=${encodeURIComponent(storeId)}&limit=200`));
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        setItems(prev => mergeLocalMerchantProducts(mergeUniqueItems(prev, json.data)));
      }
    } catch {
      // Ignore transient network failure
    }
  }, []);

  const searchRemoteProducts = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    try {
      const res = await fetch(getMarketApiUrl(`/api/market/products?search=${encodeURIComponent(trimmed)}&limit=60`));
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        setItems(prev => mergeLocalMerchantProducts(mergeUniqueItems(prev, json.data)));
      }
    } catch {
      // Ignore transient network failure
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);

    const handleLocalUpdate = () => {
      fetchData();
    };

    window.addEventListener('focus', fetchData);
    window.addEventListener('storage', handleLocalUpdate);
    window.addEventListener('sera_merchant_store_updated', handleLocalUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchData);
      window.removeEventListener('storage', handleLocalUpdate);
      window.removeEventListener('sera_merchant_store_updated', handleLocalUpdate);
    };
  }, [fetchData]);

  return {
    items,
    setItems,
    stores,
    setStores,
    isLoading,
    hasMore,
    isLoadingMore,
    loadMoreProducts,
    fetchStoreProducts,
    searchRemoteProducts,
    refreshData: fetchData,
  };
}
