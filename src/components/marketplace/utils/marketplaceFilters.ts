import type { MarketplaceItem, MarketplaceStore, MarketplaceFilterTab } from '../types';

/**
 * Determines whether a marketplace item belongs to the Food (Culinary) tab.
 * Respects explicit item/store type before falling back to category/tag keywords so
 * packaged coffee or snacks sold by GOODS/grocery stores remain visible in STORE.
 */
export function isFoodItem(i: MarketplaceItem, storeType?: string): boolean {
  if (!i) return false;
  if (i.type === 'FOOD') return true;
  if (i.type === 'SERVICE') return false;

  const normalizedStoreType = String(storeType || '').toUpperCase();
  if (normalizedStoreType === 'FOOD' || normalizedStoreType === 'MAKANAN') {
    return true;
  }
  if (
    normalizedStoreType === 'GOODS' ||
    normalizedStoreType === 'BARANG' ||
    normalizedStoreType === 'STORE'
  ) {
    return false;
  }

  const cat = (i.category || '').toLowerCase();
  const tags = (Array.isArray(i.tags) ? i.tags : [])
    .filter((t): t is string => typeof t === 'string')
    .map(t => t.toLowerCase());

  return (
    cat.includes('culinary') ||
    cat.includes('meals') ||
    cat.includes('drinks') ||
    cat.includes('beverages') ||
    cat.includes('food') ||
    cat.includes('coffee') ||
    cat.includes('kuliner') ||
    cat.includes('makanan') ||
    cat.includes('minuman') ||
    cat.includes('kopi') ||
    cat.includes('snack') ||
    cat.includes('sambal') ||
    cat.includes('bakery') ||
    cat.includes('cemilan') ||
    cat.includes('camilan') ||
    tags.includes('food') ||
    tags.includes('culinary') ||
    tags.includes('meals') ||
    tags.includes('drinks') ||
    tags.includes('coffee') ||
    tags.includes('kuliner') ||
    tags.includes('sambal') ||
    tags.includes('kopi') ||
    tags.includes('makanan') ||
    tags.includes('minuman') ||
    tags.includes('cemilan') ||
    tags.includes('bakery') ||
    tags.includes('snack')
  );
}

/**
 * Filter and sort marketplace items according to active tab, search query, category, and sort criteria.
 */
export function filterAndSortItems(
  items: MarketplaceItem[],
  type: MarketplaceFilterTab,
  searchQuery: string,
  activeCategory: string | null,
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'rating',
  stores?: MarketplaceStore[]
): MarketplaceItem[] {
  const storeMetaMap = new Map<string, { type?: string; category?: string }>();
  if (Array.isArray(stores)) {
    for (const s of stores) {
      if (s?.id) {
        storeMetaMap.set(s.id, { type: s.type, category: s.category });
      }
    }
  }

  let result = [...items];

  if (searchQuery.trim()) {
    // GLOBAL SEARCH: Search across all categories
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(i => {
      if (!i) return false;
      return Boolean(
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.storeName && i.storeName.toLowerCase().includes(q)) ||
        (i.category && i.category.toLowerCase().includes(q)) ||
        (Array.isArray(i.tags) && i.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q)))
      );
    });
  } else {
    // TAB-SCOPED FILTER: Applied when search is idle
    if (type === 'STORE') {
      result = result.filter(i => (i.type === 'GOODS' || (i.type as string) === 'STORE') && !isFoodItem(i, storeMetaMap.get(i.storeId)?.type));
    } else if (type === 'FOOD') {
      result = result.filter(i => isFoodItem(i, storeMetaMap.get(i.storeId)?.type));
    } else if (type === 'SERVICE') {
      result = result.filter(i => i.type === 'SERVICE');
    }

    if (activeCategory) {
      const catLower = activeCategory.toLowerCase();
      result = result.filter(i => {
        if (!i) return false;
        const itemCat = (i.category || '').toLowerCase();
        const itemName = (i.name || '').toLowerCase();
        const itemTags = (Array.isArray(i.tags) ? i.tags : [])
          .filter((t): t is string => typeof t === 'string')
          .map(t => t.toLowerCase());

        if (type === 'FOOD') {
          if (catLower === 'meals' || catLower === 'makanan') {
            return (
              itemCat.includes('meals') || itemCat.includes('culinary') || itemCat.includes('makanan') || itemCat.includes('kuliner') ||
              itemTags.some(t => ['meals', 'food', 'culinary', 'makanan', 'kuliner', 'lauk', 'resto', 'nasi', 'ayam', 'rice', 'chicken'].some(k => t.includes(k))) ||
              itemName.includes('nasi') || itemName.includes('ayam') || itemName.includes('rice') || itemName.includes('chicken')
            );
          }
          if (catLower === 'drinks' || catLower === 'minuman') {
            return (
              itemCat.includes('drinks') || itemCat.includes('beverages') || itemCat.includes('minuman') ||
              itemTags.some(t => ['drinks', 'beverages', 'minuman', 'es', 'iced', 'latte', 'jus', 'juice', 'teh', 'tea'].some(k => t.includes(k))) ||
              itemName.includes('es ') || itemName.includes('iced ') || itemName.includes('jus') || itemName.includes('latte')
            );
          }
          if (catLower === 'snacks' || catLower === 'cemilan') {
            return (
              itemCat.includes('snacks') || itemCat.includes('snack') || itemCat.includes('camilan') || itemCat.includes('cemilan') ||
              itemTags.some(t => ['snacks', 'snack', 'cemilan', 'camilan', 'sambal', 'keripik', 'chips'].some(k => t.includes(k)))
            );
          }
          if (catLower === 'bakery & coffee') {
            return (
              itemCat.includes('coffee') || itemCat.includes('kopi') || itemCat.includes('bakery') || itemCat.includes('roti') ||
              itemTags.some(t => ['kopi', 'coffee', 'bakery', 'roti', 'croissant', 'pastry', 'arabika', 'arabica'].some(k => t.includes(k)))
            );
          }
        }

        if (type === 'SERVICE') {
          if (catLower === 'cleaning') {
            return itemCat.includes('clean') || itemCat.includes('bersih') || itemName.includes('clean') || itemName.includes('bersih') || itemTags.some(t => t.includes('clean') || t.includes('bersih') || t.includes('sedot') || t.includes('vacuum'));
          }
          if (catLower === 'electronics' || catLower === 'elektronik') {
            return itemCat.includes('electron') || itemCat.includes('elektronik') || itemCat.includes('ac') || itemName.includes('electron') || itemName.includes('elektronik') || itemName.includes('ac') || itemTags.some(t => t.includes('electron') || t.includes('elektronik') || t.includes('ac') || t.includes('kulkas') || t.includes('repair') || t.includes('servis'));
          }
          if (catLower === 'handyman' || catLower === 'tukang') {
            return itemCat.includes('handyman') || itemCat.includes('renovat') || itemCat.includes('tukang') || itemCat.includes('renovasi') || itemName.includes('handyman') || itemName.includes('tukang') || itemTags.some(t => t.includes('handyman') || t.includes('plumb') || t.includes('renovat') || t.includes('tukang') || t.includes('renovasi') || t.includes('bangunan') || t.includes('ledeng') || t.includes('pipa'));
          }
          if (catLower === 'massage' || catLower === 'pijat') {
            return itemCat.includes('massage') || itemCat.includes('spa') || itemCat.includes('pijat') || itemCat.includes('refleksi') || itemName.includes('massage') || itemName.includes('pijat') || itemName.includes('refleksi') || itemTags.some(t => t.includes('pijat') || t.includes('refleksi') || t.includes('massage') || t.includes('spa') || t.includes('therap'));
          }
          if (catLower === 'travel') {
            return itemCat.includes('travel') || itemCat.includes('shuttle') || itemName.includes('travel') || itemName.includes('shuttle') || itemTags.some(t => t.includes('travel') || t.includes('shuttle') || t.includes('antar kota') || t.includes('intercity'));
          }
          if (catLower === 'lodging' || catLower === 'penginapan') {
            return itemCat.includes('lodging') || itemCat.includes('penginapan') || itemCat.includes('villa') || itemCat.includes('hotel') || itemName.includes('lodging') || itemName.includes('penginapan') || itemName.includes('villa') || itemName.includes('hotel') || itemTags.some(t => t.includes('lodging') || t.includes('penginapan') || t.includes('villa') || t.includes('hotel') || t.includes('homestay'));
          }
          if (catLower === 'laundry') {
            return itemCat.includes('laundry') || itemCat.includes('shoe') || itemCat.includes('sepatu') || itemName.includes('laundry') || itemName.includes('shoe') || itemName.includes('sepatu') || itemTags.some(t => t.includes('laundry') || t.includes('shoe') || t.includes('sepatu') || t.includes('cuci') || t.includes('wash'));
          }
          if (catLower === 'hampers') {
            return itemCat.includes('hampers') || itemCat.includes('parcel') || itemCat.includes('gift') || itemName.includes('hampers') || itemName.includes('parcel') || itemTags.some(t => t.includes('hampers') || t.includes('parcel') || t.includes('kado') || t.includes('gift'));
          }
          if (catLower === 'electrical' || catLower === 'listrik') {
            return itemCat.includes('electric') || itemCat.includes('listrik') || itemCat.includes('pln') || itemName.includes('electric') || itemName.includes('listrik') || itemTags.some(t => t.includes('electric') || t.includes('wiring') || t.includes('listrik') || t.includes('korslet') || t.includes('pln'));
          }
          if (catLower === 'laptop') {
            return itemCat.includes('laptop') || itemCat.includes('computer') || itemCat.includes('komputer') || itemName.includes('laptop') || itemTags.some(t => t.includes('laptop') || t.includes('pc') || t.includes('computer') || t.includes('komputer') || t.includes('it'));
          }
          if (catLower === 'barber') {
            return itemCat.includes('barber') || itemCat.includes('groom') || itemCat.includes('hair') || itemCat.includes('rambut') || itemName.includes('barber') || itemTags.includes('potong rambut') || itemTags.some(t => t.includes('barber') || t.includes('haircut') || t.includes('potong rambut') || t.includes('grooming'));
          }
          if (catLower === 'car wash' || catLower === 'cuci mobil') {
            return itemCat.includes('car wash') || itemCat.includes('automot') || itemCat.includes('cuci mobil') || itemCat.includes('otomotif') || itemName.includes('car wash') || itemName.includes('cuci mobil') || itemTags.some(t => t.includes('car wash') || t.includes('cuci mobil') || t.includes('mobil') || t.includes('detailing'));
          }
        }

        if (catLower === 'groceries' || catLower === 'sembako') {
          return itemCat.includes('grocer') || itemCat.includes('sembako') || itemName.includes('rice') || itemName.includes('beras') || itemTags.some(t => t.includes('grocer') || t.includes('sembako') || t.includes('staple'));
        }
        if (catLower === 'produce & fruit' || catLower === 'sayur & buah') {
          return itemCat.includes('produce') || itemCat.includes('fruit') || itemCat.includes('vegetable') || itemCat.includes('sayur') || itemCat.includes('buah') || itemName.includes('vegetable') || itemName.includes('sayur') || itemTags.some(t => t.includes('produce') || t.includes('vegetable') || t.includes('sayur') || t.includes('buah'));
        }
        if (catLower === 'home & living' || catLower === 'rumah tangga') {
          return itemCat.includes('home') || itemCat.includes('living') || itemCat.includes('furniture') || itemCat.includes('rumah') || itemCat.includes('perabot');
        }
        if (catLower === 'agriculture' || catLower === 'pertanian') {
          return itemCat.includes('agricult') || itemCat.includes('pertanian') || itemTags.some(t => t.includes('agricult') || t.includes('pertanian') || t.includes('farm'));
        }

        const storeCat = (storeMetaMap.get(i.storeId)?.category || '').toLowerCase();
        return (
          (Boolean(itemCat) && (itemCat.includes(catLower) || catLower.includes(itemCat))) ||
          (Boolean(storeCat) && (storeCat.includes(catLower) || catLower.includes(storeCat))) ||
          itemName.includes(catLower) ||
          itemTags.some(t => Boolean(t) && (t.includes(catLower) || catLower.includes(t)))
        );
      });
    }
  }

  // Sorting
  if (sortBy === 'price_asc') {
    result.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'price_desc') {
    result.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'rating') {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    // Default: Popularity score with newest-item tie-breaker
    result.sort((a, b) => (((b.soldCount || 0) * (b.rating || 0)) - ((a.soldCount || 0) * (a.rating || 0))) || ((b.createdAt || 0) - (a.createdAt || 0)));
  }

  return result;
}

/**
 * Filter and sort marketplace stores according to active tab, search query, and sort criteria.
 */
export function filterAndSortStores(
  stores: MarketplaceStore[],
  type: MarketplaceFilterTab,
  searchQuery: string,
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'rating',
  activeCategory?: string | null
): MarketplaceStore[] {
  let result = [...stores];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(s => {
      if (!s) return false;
      return Boolean(
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.tagline && s.tagline.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
      );
    });
  } else {
    if (type === 'FOOD') {
      result = result.filter(s => {
        if (!s) return false;
        const st = String(s.type || '').toUpperCase();
        const cat = (s.category || '').toLowerCase();
        return (
          st === 'FOOD' ||
          st === 'MAKANAN' ||
          cat.includes('culinary') ||
          cat.includes('food') ||
          cat.includes('drinks') ||
          cat.includes('beverages') ||
          cat.includes('kuliner') ||
          cat.includes('makanan') ||
          cat.includes('minuman') ||
          cat.includes('camilan') ||
          cat.includes('snack')
        );
      });
    } else if (type === 'SERVICE') {
      result = result.filter(s => {
        if (!s) return false;
        const st = String(s.type || '').toUpperCase();
        return st === 'SERVICE' || st === 'JASA';
      });
    } else if (type === 'STORE') {
      result = result.filter(s => {
        if (!s) return false;
        const st = String(s.type || '').toUpperCase();
        return st === 'GOODS' || st === 'HYBRID' || st === 'BARANG' || st === 'STORE' || !st;
      });
    }

    if (activeCategory) {
      const catLower = activeCategory.toLowerCase();
      result = result.filter(s => {
        if (!s) return false;
        const storeCat = (s.category || '').toLowerCase();
        const storeName = (s.name || '').toLowerCase();
        if (catLower === 'groceries' || catLower === 'sembako') {
          return storeCat.includes('grocer') || storeCat.includes('sembako') || storeName.includes('grocer') || storeName.includes('sembako');
        }
        return (
          (Boolean(storeCat) && (storeCat.includes(catLower) || catLower.includes(storeCat))) ||
          storeName.includes(catLower)
        );
      });
    }
  }

  // Sorting
  if (sortBy === 'rating') {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    result.sort((a, b) => (b.totalProducts || 0) - (a.totalProducts || 0));
  }

  return result;
}

